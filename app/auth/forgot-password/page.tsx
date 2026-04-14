"use client";

// app/auth/forgot-password/page.tsx

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Szerverhiba.");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10">
        <Image
          src="/assets/11optic3.png"
          alt="OptikArt"
          width={110}
          height={110}
          className="object-contain"
        />
      </Link>

      <div className="w-full max-w-[400px]">
        {submitted ? (
          /* ── Sikeres képernyő ── */
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
                Email elküldve
              </span>
              <div className="w-5 h-px bg-[#C8A882]/40" />
            </div>
            <h1 className="font-['Cormorant_Garamond'] text-[1.7rem] font-light text-[#1A1510] mb-3">
              Ellenőrizd a postaládád
            </h1>
            <p className="text-[13px] text-[#7A6A58] leading-[1.8] mb-7">
              Ha ez az email cím regisztrálva van nálunk, küldtünk egy linket a
              jelszó visszaállításához. A link <strong>1 óráig</strong>{" "}
              érvényes.
            </p>
            <p className="text-[11px] text-[#A08060] mb-6">
              Nem kaptál emailt? Ellenőrizd a spam mappát.
            </p>
            <Link
              href="/auth/login"
              className="block w-full py-3 text-center border border-[#EDE8E0] text-[11px] tracking-[0.12em] uppercase text-[#7A6A58] hover:text-[#1A1510] hover:border-[#C8A882]/40 transition-all"
            >
              Vissza a bejelentkezéshez
            </Link>
          </div>
        ) : (
          /* ── Form ── */
          <div className="bg-white border border-[#EDE8E0]">
            {/* Fejléc */}
            <div className="px-8 py-7 border-b border-[#EDE8E0]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-px bg-[#C8A882]" />
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]">
                  Jelszó visszaállítás
                </span>
              </div>
              <h1 className="font-['Cormorant_Garamond'] text-[1.7rem] font-light text-[#1A1510] leading-tight">
                Elfelejtetted
                <br />a jelszavad?
              </h1>
              <p className="text-[12px] text-[#7A6A58] mt-2 leading-relaxed">
                Add meg az email címed és küldünk egy visszaállító linket.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="px-8 py-7 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.14em] uppercase text-[#A08060]">
                  Email cím
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pelda@email.com"
                  required
                  autoFocus
                  className="w-full bg-white border border-[#EDE8E0] text-[13px] text-[#1A1510] placeholder:text-[#C8B8A0]/60 px-3 py-3 focus:outline-none focus:border-[#C8A882] transition-colors"
                />
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
                disabled={loading || !email.trim()}
                className="w-full py-3.5 bg-[#1A1510] text-[11px] tracking-[0.14em] uppercase text-white hover:bg-[#C8A882] transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                    Küldés...
                  </>
                ) : (
                  "Link küldése →"
                )}
              </button>

              <div className="text-center pt-1">
                <Link
                  href="/auth/login"
                  className="text-[11px] text-[#A08060] hover:text-[#C8A882] transition-colors"
                >
                  ← Vissza a bejelentkezéshez
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
