// NextAuth konfiguráció (szerver oldali).
// Itt állítjuk be a Credentials provider-t, a JWT stratégiát, és azt,
// milyen mezők kerüljenek a session-be.

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // JWT session stratégia: a session adat a cookie + JWT token-ben él,
  // nem külön DB session táblában.
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Email + Jelszó",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Jelszó", type: "password" },
      },

      // Ez a függvény *szerveren* fut, amikor a user signIn-ol.
      // Itt ellenőrizzük az email/jelszó párost a DB-ben.
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        // Amit itt visszaadunk, az lesz elérhető a JWT callback-ekben.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        } as any;
      },
    }),
  ],

  callbacks: {
    // JWT callback: ide tudunk plusz mezőket tenni a token-be.
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },

    // Session callback: a kliens / szerver session objektumába tesszük át,
    // amit használni szeretnénk.
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

