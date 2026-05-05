"use client";

// app/(auth)/auth/2fa-verify/page.tsx

import { useState, useEffect }        from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut }        from "next-auth/react";
import Image                          from "next/image";
import Link                           from "next/link";
import { Suspense }                   from "react";

function TwoFactorVerifyForm() {
  const { data: session, status, update } = useSession();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") || "/user/dashboard";

  const [code, setCode]           = useState("");
  const [error, setError]         = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/login"); return; }
    if (status !== "authenticated") return;
    if ((session.user as any)?.twoFactorVerified) {
      router.replace(redirect);
    }
  }, [status, session]);

  async function handleVerify() {
    if (code.length < 6 || verifying) return;
    setVerifying(true); setError("");
    try {
      const res  = await fetch("/api/auth/2fa/verify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCode("");
        throw new Error(data.error ?? "Érvénytelen kód");
      }

      // Session frissítés
      await update({ twoFactorVerified: true });

      // Cookie törlés – már nem kell
      document.cookie = "2fa_setup_done=; path=/; max-age=0";

      router.replace(redirect);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setVerifying(false);
    }
  }

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex">
      <div className="hidden md:flex flex-col justify-between w-1/3 bg-[#1A1510] px-10 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 60px,#C8A882 60px,#C8A882 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,#C8A882 60px,#C8A882 61px)` }}/>
        </div>
        <Link href="/" className="relative z-10">
          <Image src="/assets/10optik2 (1).png" alt="OptikArt" width={110} height={110} className="object-contain"/>
        </Link>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#C8A882]"/>
            <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Biztonság</span>
          </div>
          <h2 className="font-['Cormorant_Garamond'] text-[2.2rem] font-light text-white leading-tight mb-4">
            Szinte<br/><em className="not-italic text-[#C8A882]">bent vagy</em>
          </h2>
          <p className="text-[13px] text-[#5A4A3A] leading-relaxed">
            Csak egy extra lépés a biztonságos belépéshez.
          </p>
        </div>
        <span className="relative z-10 text-[10px] tracking-[0.1em] text-[#3A3020]">© {new Date().getFullYear()} OptikArt</span>
      </div>

      <div className="flex flex-col justify-center w-full md:w-2/3 px-8 sm:px-16 lg:px-24 py-12">
        <div className="max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#C8A882]"/>
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">Kétlépcsős azonosítás</span>
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-[2.5rem] font-light text-[#1A1510] mb-2">Azonosítás</h1>
          <p className="text-[13px] text-[#7A6A58] leading-relaxed mb-10">
            Add meg a 6 jegyű kódot a <span className="text-[#1A1510]">Google Authenticator</span> vagy <span className="text-[#1A1510]">Authy</span> appból.
          </p>

          <div className="mb-8">
            <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060] mb-3">Hitelesítő kód</label>
            <input
              type="text" inputMode="numeric" maxLength={6}
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleVerify()}
              placeholder="• • • • • •"
              className="w-full bg-transparent border-b border-[#EDE8E0] focus:border-[#C8A882] py-3 text-[32px] font-light text-[#1A1510] tracking-[0.8em] focus:outline-none transition-colors text-center"
              autoFocus
            />
            {error && (
              <p className="mt-3 text-[11px] text-red-400/80 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-400/80 inline-block"/>
                {error} – próbáld a legújabb kóddal.
              </p>
            )}
          </div>

          <button onClick={handleVerify} disabled={verifying || code.length < 6}
            className="w-full bg-[#1A1510] text-white text-[11px] tracking-[0.18em] uppercase py-4 hover:bg-[#C8A882] transition-colors disabled:opacity-50 mb-6">
            {verifying ? "Ellenőrzés..." : "Belépés →"}
          </button>

          <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="text-[11px] text-[#A08060] hover:text-[#1A1510] transition-colors tracking-[0.06em]">
            ← Vissza a bejelentkezéshez
          </button>

          {isAdmin && (
            <div className="mt-8 pt-6 border-t border-[#EDE8E0]">
              <p className="text-[11px] text-[#A08060]">
                Elveszítetted a hozzáférést?{" "}
                <a href="mailto:business@optikart.hu" className="text-[#C8A882] hover:underline">Kapcsolatfelvétel</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TwoFactorVerifyPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#FAF8F4]"/>}>
      <TwoFactorVerifyForm/>
    </Suspense>
  );
}