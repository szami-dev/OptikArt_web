"use client";

// app/auth/reset-password/page.tsx

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

// ── Belső komponens (useSearchParams Suspense fix) ────────────
function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [showC, setShowC] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Nincs token → invalid link
  const noToken = !token;

  // Jelszó erősség
  const strength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ["", "Gyenge", "Közepes", "Erős", "Nagyon erős"][
    strength
  ];
  const strengthColor = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-green-400",
    "bg-green-500",
  ][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("A jelszónak legalább 8 karakter hosszúnak kell lennie.");
      return;
    }
    if (password !== confirm) {
      setError("A két jelszó nem egyezik.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Szerverhiba.");
      setDone(true);
      // 3 mp után átirányítás a login oldalra
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Érvénytelen token képernyő ────────────────────────────
  if (noToken)
    return (
      <div className="bg-white border border-[#EDE8E0] px-8 py-10 text-center">
        <div className="w-12 h-12 border border-red-200 bg-red-50 flex items-center justify-center mx-auto mb-5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-5 h-5 text-red-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#1A1510] mb-3">
          Érvénytelen link
        </h1>
        <p className="text-[13px] text-[#7A6A58] leading-[1.8] mb-7">
          Ez a jelszó-visszaállítási link érvénytelen vagy lejárt. Kérj új
          linket.
        </p>
        <Link
          href="/auth/forgot-password"
          className="block w-full py-3.5 bg-[#1A1510] text-[11px] tracking-[0.14em] uppercase text-white hover:bg-[#C8A882] transition-all text-center"
        >
          Új link kérése →
        </Link>
      </div>
    );

  // ── Sikeres képernyő ──────────────────────────────────────
  if (done)
    return (
      <div className="bg-white border border-[#EDE8E0] px-8 py-10 text-center">
        <div className="w-12 h-12 border border-[#C8A882]/40 flex items-center justify-center mx-auto mb-5 text-[#C8A882]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-5 h-5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-5 h-px bg-[#C8A882]/40" />
          <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]">
            Kész
          </span>
          <div className="w-5 h-px bg-[#C8A882]/40" />
        </div>
        <h1 className="font-['Cormorant_Garamond'] text-[1.7rem] font-light text-[#1A1510] mb-3">
          Jelszó megváltoztatva!
        </h1>
        <p className="text-[13px] text-[#7A6A58] leading-[1.8] mb-7">
          Az új jelszavad beállítva. Átirányítunk a bejelentkezési oldalra...
        </p>
        <div className="flex items-center justify-center gap-2 text-[11px] text-[#A08060]">
          <div className="w-3.5 h-3.5 border border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
          Átirányítás...
        </div>
      </div>
    );

  // ── Form ──────────────────────────────────────────────────
  return (
    <div className="bg-white border border-[#EDE8E0]">
      <div className="px-8 py-7 border-b border-[#EDE8E0]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-px bg-[#C8A882]" />
          <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]">
            Új jelszó
          </span>
        </div>
        <h1 className="font-['Cormorant_Garamond'] text-[1.7rem] font-light text-[#1A1510] leading-tight">
          Állítsd be az
          <br />
          új jelszavad
        </h1>
        <p className="text-[12px] text-[#7A6A58] mt-2">Minimum 8 karakter.</p>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-7 flex flex-col gap-5">
        {/* Jelszó */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] tracking-[0.14em] uppercase text-[#A08060]">
            Új jelszó
          </label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Legalább 8 karakter"
              required
              autoFocus
              className="w-full bg-white border border-[#EDE8E0] text-[13px] text-[#1A1510] placeholder:text-[#C8B8A0]/60 px-3 py-3 pr-10 focus:outline-none focus:border-[#C8A882] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C8B8A0] hover:text-[#A08060] transition-colors"
            >
              {show ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Erősség jelző */}
          {password.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-[#EDE8E0]"}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#A08060]">
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        {/* Jelszó megerősítés */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] tracking-[0.14em] uppercase text-[#A08060]">
            Jelszó megerősítése
          </label>
          <div className="relative">
            <input
              type={showC ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Írd be újra a jelszavad"
              required
              className={`w-full bg-white border text-[13px] text-[#1A1510] placeholder:text-[#C8B8A0]/60 px-3 py-3 pr-10 focus:outline-none transition-colors ${
                confirm && confirm !== password
                  ? "border-red-300 focus:border-red-400"
                  : confirm && confirm === password
                    ? "border-green-300 focus:border-green-400"
                    : "border-[#EDE8E0] focus:border-[#C8A882]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowC(!showC)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C8B8A0] hover:text-[#A08060] transition-colors"
            >
              {showC ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {confirm && confirm !== password && (
            <span className="text-[11px] text-red-500">
              A két jelszó nem egyezik.
            </span>
          )}
          {confirm && confirm === password && (
            <span className="text-[11px] text-green-500">✓ Egyezik</span>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 px-3 py-2.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-[12px] text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || password.length < 8 || password !== confirm}
          className="w-full py-3.5 bg-[#1A1510] text-[11px] tracking-[0.14em] uppercase text-white hover:bg-[#C8A882] transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
              Mentés...
            </>
          ) : (
            "Jelszó mentése →"
          )}
        </button>
      </form>
    </div>
  );
}

// ── Exportált page – Suspense a useSearchParams miatt ─────────
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-10">
        <span className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#1A1510]">
          OptikArt
        </span>
      </Link>
      <div className="w-full max-w-[400px]">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
            </div>
          }
        >
          <ResetPasswordInner />
        </Suspense>
      </div>
    </div>
  );
}
