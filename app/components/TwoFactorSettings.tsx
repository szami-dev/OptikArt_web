"use client";

// app/components/TwoFactorSettings.tsx
// User dashboardon beágyazható 2FA beállítás panel

import { useState } from "react";
import { useSession } from "next-auth/react";

type Step = "idle" | "qr" | "verify-enable" | "verify-disable" | "done-enable" | "done-disable";

export default function TwoFactorSettings() {
  const { data: session, update } = useSession();
  const isEnabled = (session?.user as any)?.twoFactorEnabled ?? false;

  const [step, setStep]           = useState<Step>("idle");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret]       = useState<string | null>(null);
  const [code, setCode]           = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  async function startSetup() {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQrDataUrl(data.qrDataUrl);
      setSecret(data.secret);
      setStep("qr");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable() {
    if (code.length < 6) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Érvénytelen kód");
      await update({ twoFactorEnabled: true });
      setStep("done-enable");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    if (code.length < 6) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Érvénytelen kód");
      await update({ twoFactorEnabled: false });
      setStep("done-disable");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() { setStep("idle"); setCode(""); setError(""); setQrDataUrl(null); setSecret(null); setShowSecret(false); }

  return (
    <div className="bg-white border border-[#EDE8E0] p-6">
      {/* Fejléc */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-px bg-[#C8A882]"/>
            <span className="text-[9px] tracking-[0.18em] uppercase text-[#A08060]">Biztonság</span>
          </div>
          <h3 className="font-['Cormorant_Garamond'] text-[1.4rem] font-light text-[#1A1510]">Kétlépcsős azonosítás</h3>
          <p className="text-[12px] text-[#7A6A58] mt-0.5">Google Authenticator vagy Authy app szükséges</p>
        </div>
        {/* Státusz badge */}
        <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 border text-[10px] tracking-[0.1em] uppercase ${isEnabled ? "border-green-200 text-green-700 bg-green-50" : "border-[#EDE8E0] text-[#A08060]"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? "bg-green-500" : "bg-[#C8B8A0]"}`}/>
          {isEnabled ? "Aktív" : "Kikapcsolva"}
        </div>
      </div>

      {/* Tartalom */}
      {step === "idle" && (
        <>
          {isEnabled ? (
            <div>
              <p className="text-[13px] text-[#5A4A3A] mb-5 leading-relaxed">
                A kétlépcsős azonosítás aktív. A fiókod extra védelemmel rendelkezik.
              </p>
              <button onClick={() => setStep("verify-disable")}
                className="flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase border border-red-200 text-red-400 px-4 py-2.5 hover:border-red-400 hover:text-red-600 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                2FA kikapcsolása
              </button>
            </div>
          ) : (
            <div>
              <p className="text-[13px] text-[#5A4A3A] mb-5 leading-relaxed">
                Növeld a fiókod biztonságát kétlépcsős azonosítással. Belépéskor egy 6 jegyű kódot is meg kell adni.
              </p>
              <button onClick={startSetup} disabled={loading}
                className="flex items-center gap-2 bg-[#1A1510] text-white text-[11px] tracking-[0.1em] uppercase px-5 py-2.5 hover:bg-[#C8A882] transition-all disabled:opacity-50">
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                2FA bekapcsolása
              </button>
            </div>
          )}
          {error && <p className="mt-3 text-[11px] text-red-400">{error}</p>}
        </>
      )}

      {/* QR kód megjelenítés */}
      {step === "qr" && (
        <div>
          <p className="text-[13px] text-[#5A4A3A] mb-5">Olvasd be a QR kódot a Google Authenticator vagy Authy apppal:</p>
          {qrDataUrl && (
            <div className="flex justify-center mb-5">
              <div className="border border-[#EDE8E0] bg-white p-3 inline-block">
                <img src={qrDataUrl} alt="QR kód" className="w-40 h-40"/>
              </div>
            </div>
          )}
          <button onClick={() => setShowSecret(v => !v)}
            className="text-[11px] text-[#A08060] hover:text-[#C8A882] transition-colors underline underline-offset-2 mb-4 block">
            {showSecret ? "Elrejtés" : "Manuális kód"}
          </button>
          {showSecret && secret && (
            <div className="bg-[#F5EFE6] border border-[#EDE8E0] px-4 py-3 mb-5">
              <p className="text-[10px] uppercase tracking-widest text-[#A08060] mb-1">Secret</p>
              <code className="text-[12px] text-[#1A1510] tracking-wider font-mono break-all">{secret}</code>
            </div>
          )}
          <button onClick={() => { setStep("verify-enable"); setCode(""); setError(""); }}
            className="w-full bg-[#1A1510] text-white text-[11px] tracking-[0.14em] uppercase py-3 hover:bg-[#C8A882] transition-all">
            Beállítottam →
          </button>
        </div>
      )}

      {/* Kód ellenőrzés – bekapcsolás */}
      {step === "verify-enable" && (
        <div>
          <p className="text-[13px] text-[#5A4A3A] mb-5">Add meg a 6 jegyű kódot az appból a megerősítéshez:</p>
          <div className="mb-5">
            <input type="text" inputMode="numeric" maxLength={6}
              value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={e => e.key === "Enter" && handleEnable()}
              placeholder="123456"
              className="w-full border-b border-[#EDE8E0] focus:border-[#C8A882] py-2 text-[22px] font-light text-[#1A1510] tracking-[0.5em] focus:outline-none transition-colors text-center bg-transparent"
              autoFocus/>
            {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setStep("qr"); setError(""); setCode(""); }}
              className="flex-1 border border-[#EDE8E0] text-[11px] uppercase py-2.5 text-[#A08060] hover:border-[#C8A882] transition-all">
              ← Vissza
            </button>
            <button onClick={handleEnable} disabled={loading || code.length < 6}
              className="flex-1 bg-[#1A1510] text-white text-[11px] uppercase py-2.5 hover:bg-[#C8A882] transition-all disabled:opacity-50">
              {loading ? "..." : "Megerősítés"}
            </button>
          </div>
        </div>
      )}

      {/* Kód ellenőrzés – kikapcsolás */}
      {step === "verify-disable" && (
        <div>
          <p className="text-[13px] text-[#5A4A3A] mb-5">Add meg a jelenlegi kódot a kikapcsolás megerősítéséhez:</p>
          <div className="mb-5">
            <input type="text" inputMode="numeric" maxLength={6}
              value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={e => e.key === "Enter" && handleDisable()}
              placeholder="123456"
              className="w-full border-b border-[#EDE8E0] focus:border-[#C8A882] py-2 text-[22px] font-light text-[#1A1510] tracking-[0.5em] focus:outline-none transition-colors text-center bg-transparent"
              autoFocus/>
            {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={reset}
              className="flex-1 border border-[#EDE8E0] text-[11px] uppercase py-2.5 text-[#A08060] hover:border-[#C8A882] transition-all">
              Mégsem
            </button>
            <button onClick={handleDisable} disabled={loading || code.length < 6}
              className="flex-1 border border-red-200 text-red-400 text-[11px] uppercase py-2.5 hover:bg-red-50 transition-all disabled:opacity-50">
              {loading ? "..." : "Kikapcsolás"}
            </button>
          </div>
        </div>
      )}

      {/* Siker – bekapcsolva */}
      {step === "done-enable" && (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-[#C8A882]/40 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.5" className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <p className="text-[13px] text-[#1A1510] font-medium">Kétlépcsős azonosítás bekapcsolva!</p>
            <button onClick={reset} className="text-[11px] text-[#A08060] hover:text-[#C8A882] transition-colors mt-0.5">Bezárás</button>
          </div>
        </div>
      )}

      {/* Siker – kikapcsolva */}
      {step === "done-disable" && (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-[#EDE8E0] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="#A08060" strokeWidth="1.5" className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <p className="text-[13px] text-[#1A1510]">Kétlépcsős azonosítás kikapcsolva.</p>
            <button onClick={reset} className="text-[11px] text-[#A08060] hover:text-[#C8A882] transition-colors mt-0.5">Bezárás</button>
          </div>
        </div>
      )}
    </div>
  );
}
