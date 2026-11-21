import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // Allow public access to shared landmark details (/journeys/[id])
      const isPublicSharedJourney = /^\/journeys\/[^/]+$/.test(nextUrl.pathname);
      if (isPublicSharedJourney) {
        return true;
      }

      const isProtected = [
        "/guide",
        "/canvas",
        "/journeys",
        "/profile",
      ].some((path) => nextUrl.pathname.startsWith(path));

      if (isProtected) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url === "/" || url === baseUrl || url.endsWith("/")) {
        return `${baseUrl}/`;
      }
      return `${baseUrl}/guide`;
    },
  },
  providers: [],
};
