import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Jelszó", type: "password" },
      },
      async authorize() {
        // Prisma nincs itt – az auth.ts-ben van
        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.phone = (user as any).phone;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).phone = token.phone;
      }
      return session;
    },

    // ── Middleware-ben ezt is használjuk a role olvasáshoz ────────
    // A `req.auth?.user?.role` csak akkor működik middleware-ben
    // ha a session callback beírja a user objektumba
    authorized({ auth }) {
      // Alapértelmezett: bejelentkezett = authorized
      // A részletes role-check a middleware-ben történik
      return !!auth;
    },
  },
};