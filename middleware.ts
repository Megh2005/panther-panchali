import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/canvas",
    "/canvas/:path*",
    "/story",
    "/story/:path*",
    "/journeys",
    "/journeys/:path*",
    "/explore",
    "/explore/:path*",
    "/profile",
    "/profile/:path*",
    "/thread/:path*",
  ],
};
