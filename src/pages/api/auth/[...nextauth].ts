import NextAuth, { NextAuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/server/db";
import { env } from "@/server/env.mjs";

declare module "next-auth" {
  interface Session {
    user: User & { id: string };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET
    })
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user?.id;
      return session;
    }
  }
};

export default NextAuth(authOptions);
