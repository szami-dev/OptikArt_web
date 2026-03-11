// NextAuth route handler (App Router).
// Ez a fájl *szerveren* fut, és az /api/auth/* endpointokat szolgálja ki.

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

