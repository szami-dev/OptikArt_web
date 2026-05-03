"use client";

// app/(auth)/auth/2fa-setup/page.tsx

import { useState, useEffect } from "react";
import { useRouter }           from "next/navigation";
import { useSession }          from "next-auth/react";
import Image                   from "next/image";
import Link                    from "next/link";

export default function TwoFactorSetupPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [qrDataUrl, setQrDataUrl]   = useState<string | null>(null);
  const [secret, setSecret]         = useState<string | null>(null);
  const [code, setCode]             = useState("");
  const [step, setStep]             = useState<"loading"|"qr"|"verify"|"done">("loading");
  const [error, setError]           = useState("");
  const [verifying, setVerifying]   = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/login"); return; }
    if (status !== "authenticated") return;
    if (initialized) return;
    setInitialized(true);

    // DB-ből ellenőrizzük
    fetch("/api/auth/2fa/status")
      .then(r => r.json())
      .then(async d => {
        if (d.twoFactorEnabled) {
          // Már be van állítva → verify oldalra
          // Cookie beállítása hogy a middleware ne loopoljon
          document.cookie = "2fa_setup_done=1; path=/; max-age=60";
          await update({ twoFactorEnabled: true });
          router.replace("/auth/2fa-verify?redirect=/admin/dashboard");
          return;
        }
        // QR generálás
        const res  = await fetch("/api/auth/2fa/setup", { method: "POST" });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setQrDataUrl(data.qrDataUrl);
        setSecret(data.secret);
        setStep("qr");
      })
      .catch(e => {
        setError(e.message ?? "Hiba történt");
        setStep("qr");
      });
  }, [status, initialized]);

  async function handleVerify() {
    if (code.length < 6 || verifying) return;
    setVerifying(true);
    setError("");

    try {
      const res  = await fetch("/api/auth/2fa/enable", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCode("");
        throw new Error(data.error ?? "Érvénytelen kód");
      }

      // Session frissítés – a cookie már be van állítva a server válasznál
      await update({ twoFactorEnabled: true, twoFactorVerified: true });

      setStep("done");
      setTimeout(() => router.replace("/admin/dashboard"), 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex">
      {/* Bal sáv */}
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
            Kétlépcsős<br/><em className="not-italic text-[#C8A882]">azonosítás</em>
          </h2>
          <p className="text-[13px] text-[#5A4A3A] leading-relaxed">
            Az admin fiókod védelme érdekében a kétlépcsős azonosítás kötelező. Ez csak egyszer kell beállítani.
          </p>
        </div>
        <span className="relative z-10 text-[10px] tracking-[0.1em] text-[#3A3020]">© {new Date().getFullYear()} OptikArt</span>
      </div>

      {/* Jobb oldal */}
      <div className="flex flex-col justify-center w-full md:w-2/3 px-8 sm:px-16 lg:px-24 py-12">
        <div className="max-w-md w-full">

          {step === "loading" && (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin"/>
              <span className="text-[13px] text-[#A08060]">Előkészítés...</span>
            </div>
          )}

          {step === "qr" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-[#C8A882]"/>
                <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">1. lépés</span>
              </div>
              <h1 className="font-['Cormorant_Garamond'] text-[2.2rem] font-light text-[#1A1510] mb-2">QR kód beolvasása</h1>
              <p className="text-[13px] text-[#7A6A58] leading-relaxed mb-8">
                Nyisd meg a <strong>Google Authenticator</strong> vagy <strong>Authy</strong> appot, majd olvasd be a QR kódot.
              </p>

              {qrDataUrl ? (
                <div className="flex justify-center mb-6">
                  <div className="border border-[#EDE8E0] bg-white p-4 inline-block">
                    <img src={qrDataUrl} alt="2FA QR kód" className="w-48 h-48"/>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mb-6">
                  <div className="w-48 h-48 border border-[#EDE8E0] bg-[#FAF8F4] flex items-center justify-center">
                    {error
                      ? <span className="text-[11px] text-red-400 text-center px-4">{error}</span>
                      : <div className="w-6 h-6 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin"/>
                    }
                  </div>
                </div>
              )}

              <button onClick={() => setShowSecret(v => !v)}
                className="text-[11px] text-[#A08060] hover:text-[#C8A882] transition-colors underline underline-offset-2 mb-4 block">
                {showSecret ? "Elrejtés" : "Nem olvasható a QR? Manuális kód"}
              </button>
              {showSecret && secret && (
                <div className="mb-6 bg-[#F5EFE6] border border-[#EDE8E0] px-4 py-3">
                  <p className="text-[10px] tracking-[0.1em] uppercase text-[#A08060] mb-1">Manuális kód</p>
                  <code className="text-[13px] text-[#1A1510] tracking-widest font-mono break-all">{secret}</code>
                </div>
              )}

              <button
                onClick={() => { setStep("verify"); setError(""); setCode(""); }}
                disabled={!qrDataUrl}
                className="w-full bg-[#1A1510] text-white text-[11px] tracking-[0.18em] uppercase py-4 hover:bg-[#C8A882] transition-colors disabled:opacity-50">
                Beállítottam →
              </button>
            </>
          )}

          {step === "verify" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-[#C8A882]"/>
                <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">2. lépés</span>
              </div>
              <h1 className="font-['Cormorant_Garamond'] text-[2.2rem] font-light text-[#1A1510] mb-2">Kód megerősítése</h1>
              <p className="text-[13px] text-[#7A6A58] leading-relaxed mb-8">
                Add meg a 6 jegyű kódot az appból. Ha lejárt, várj az újra – 30 másodpercenként frissül.
              </p>

              <div className="mb-6">
                <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060] mb-2">Hitelesítő kód</label>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleVerify()}
                  placeholder="123456"
                  className="w-full bg-transparent border-b border-[#EDE8E0] focus:border-[#C8A882] py-2.5 text-[24px] font-light text-[#1A1510] tracking-[0.5em] focus:outline-none transition-colors text-center"
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-[11px] text-red-400/80 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-red-400/80 inline-block"/>
                    {error} – próbáld a legújabb kóddal.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setStep("qr"); setCode(""); setError(""); }}
                  className="flex-1 border border-[#EDE8E0] text-[11px] tracking-[0.1em] uppercase py-3 text-[#A08060] hover:border-[#C8A882] hover:text-[#1A1510] transition-all">
                  ← Vissza
                </button>
                <button onClick={handleVerify} disabled={verifying || code.length < 6}
                  className="flex-1 bg-[#1A1510] text-white text-[11px] tracking-[0.18em] uppercase py-3 hover:bg-[#C8A882] transition-colors disabled:opacity-50">
                  {verifying ? "Ellenőrzés..." : "Megerősítés"}
                </button>
              </div>
            </>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="w-16 h-16 border border-[#C8A882]/40 flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.5" className="w-8 h-8"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h1 className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#1A1510] mb-2">Beállítva!</h1>
              <p className="text-[13px] text-[#7A6A58]">Kétlépcsős azonosítás aktiválva. Átirányítás...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}