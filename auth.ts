import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import type { UserRecord } from "@/lib/models/user";
import { getDatabase } from "@/lib/mongodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        const db = await getDatabase();
        const users = db.collection<UserRecord>("users");
        const now = new Date();
        const email = user.email.trim().toLowerCase();
        const googleId = account?.providerAccountId || (profile as { sub?: string })?.sub || "";

        await users.updateOne(
          { email },
          {
            $set: {
              name: user.name || "Explorer",
              image: user.image || "",
              googleId,
              provider: "google",
              updatedAt: now,
              lastLoginAt: now,
            },
            $setOnInsert: {
              email,
              createdAt: now,
            },
          },
          { upsert: true }
        );

        return true;
      } catch (error) {
        console.error("User registration error in 'users':", error);
        return false;
      }
    },

    async jwt({ token }) {
      if (!token.email) return token;

      try {
        const db = await getDatabase();
        const dbUser = await db
          .collection<UserRecord>("users")
          .findOne({ email: token.email.trim().toLowerCase() });

        if (dbUser?._id) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      } catch (error) {
        console.error("JWT user fetch error:", error);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) || (token.sub as string) || "";
      }
      return session;
    },
  },
});
