// Login page – Server Component wrapper.
// Itt (szerveren) biztonságosan megkapjuk a query paramétereket (searchParams),
// majd átadjuk egy kliens komponensnek. Így elkerüljük a `useSearchParams()` miatti
// build/prerender hibát.

import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Betöltés...</div>}>
      <LoginClient error={searchParams?.error} />
    </Suspense>
  );
}

