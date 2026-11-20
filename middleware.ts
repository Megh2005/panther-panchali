import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/canvas",
    "/canvas/:path*",
    "/explore",
    "/explore/:path*",
    "/journeys",
    "/journeys/:path*",
    "/profile",
    "/profile/:path*",
  ],
};
