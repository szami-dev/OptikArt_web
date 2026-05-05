// auth.ts – teljes fájl, 2FA session flag-gel

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "@/auth.config";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";


export const { handlers, signIn, signOut, auth} = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email", type: "email" },
        password: { label: "Jelszó", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!passwordMatch) return null;

        return {
          id:               String(user.id),
          email:            user.email,
          name:             user.name,
          role:             user.role,
          // 2FA state-et a JWT-be tesszük – kezdetben false
          twoFactorEnabled: user.twoFactorEnabled,
          // twoFactorVerified a session-ben false lesz mindig login után
          // a /auth/2fa-verify page állítja true-ra
          twoFactorVerified: false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Első login
      if (user) {
        token.id               = user.id;
        token.role             = (user as any).role;
        token.twoFactorEnabled = (user as any).twoFactorEnabled;
        token.twoFactorVerified = false; // mindig false login után
      }

      // Session update-kor (update() hívásra)
      if (trigger === "update" && session) {
        if (session.twoFactorVerified !== undefined) {
          token.twoFactorVerified = session.twoFactorVerified;
        }
        if (session.twoFactorEnabled !== undefined) {
          token.twoFactorEnabled = session.twoFactorEnabled;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id               = token.id;
        (session.user as any).role             = token.role;
        (session.user as any).twoFactorEnabled  = token.twoFactorEnabled;
        (session.user as any).twoFactorVerified = token.twoFactorVerified;
      }
      return session;
    },
  },
});