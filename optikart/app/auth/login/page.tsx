"use client";

import { signIn, getSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
// Hozzáadtuk a useSearchParams-t
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
type ErrorType = "wrong_email" | "wrong_password" | "unverified" | null;

function LoginForm() {
  const router = useRouter();
  // Query paraméterek elérése
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const emailRef = useRef<HTMLInputElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: any;
    let mounted = true;

    async function animate() {
      const { gsap } = await import("gsap");
      if (!mounted) return;

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.8 },
        });
        tl.fromTo(leftRef.current, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1 })
          .fromTo(".login-anim-item", { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08 }, "-=0.6")
          .fromTo(formRef.current, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1 }, 0.2)
          .fromTo(".form-anim-item", { y: 15, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06 }, "-=0.5");
      }, rootRef);
    }

    animate();
    return () => { mounted = false; ctx?.revert(); };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorType(null);
    setResendStatus("idle");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const userCheck = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const { exists, isVerified } = await userCheck.json();

    if (!exists) {
      setLoading(false);
      setErrorType("wrong_email");
      return;
    }

    if (!isVerified) {
      setLoading(false);
      setErrorType("unverified");
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setErrorType("wrong_password");
      return;
    }

    const session = await getSession();
    const role = (session?.user as any)?.role;

    // --- DINAMIKUS ÁTIRÁNYÍTÁS LOGIKA ---
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else {
      // Ha van callbackUrl (pl. /contact), oda dobja, ha nincs, akkor a user dashboardra
      const target = callbackUrl || "/user/dashboard";
      router.push(target);
    }
  }

  async function handleResend() {
    const email = emailRef.current?.value;
    if (!email) return;
    setResendStatus("sending");
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResendStatus(res.ok ? "sent" : "error");
  }

  // A return rész változatlan marad a design megőrzése érdekében...
  return (
    <div ref={rootRef} className="flex h-screen bg-[#FAF8F4] overflow-hidden">
      {/* ... (Ugyanaz a JSX, amit beküldtél) ... */}
      {/* BAL OLDAL */}
      <div
        ref={leftRef}
        className="hidden md:flex flex-col justify-between w-1/3 bg-[#1A1510] px-10 py-12 relative overflow-hidden opacity-0"
      >
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 60px,#C8A882 60px,#C8A882 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,#C8A882 60px,#C8A882 61px)`,
          }} />
        </div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-[#C8A882]/10" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full border border-[#C8A882]/10" />
        <div className="absolute top-20 -right-16 w-48 h-48 rounded-full border border-[#C8A882]/8" />

        <div className="login-anim-item relative z-10 opacity-0">
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/assets/10optik2 (1).png" alt="OptikArt" width={110} height={110} className="object-contain" />
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
          <div className="login-anim-item flex items-center gap-3 mb-8 opacity-0">
            <div className="w-8 h-px bg-[#C8A882]" />
            <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Üdvözlünk</span>
          </div>
          <h2 className="login-anim-item font-['Cormorant_Garamond'] text-[clamp(2rem,3vw,2.8rem)] font-light leading-[1.12] text-white mb-6 opacity-0">
            Lépj be és<br />folytasd a<br /><em className="not-italic text-[#C8A882]">munkát</em>
          </h2>
          <p className="login-anim-item text-[13px] font-light text-[#7A6A58] leading-[1.9] mb-12 opacity-0">
            Az OptikArt portfólió és<br />ügyfélkezelő platformja.
          </p>
          <div className="login-anim-item flex flex-col gap-3 opacity-0">
            {["Portfólió kezelés", "Ügyfél kommunikáció", "Projekt követés"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-[#C8A882]" />
                <span className="text-[11px] tracking-[0.08em] text-[#5A4A3A]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="login-anim-item relative z-10 opacity-0">
          <span className="text-[10px] tracking-[0.1em] text-[#3A3020]">© {new Date().getFullYear()} OptikArt</span>
        </div>
      </div>

      {/* JOBB OLDAL */}
      <div
        ref={formRef}
        className="flex flex-col justify-center w-full md:w-2/3 px-8 sm:px-16 lg:px-28 xl:px-40 py-12 relative opacity-0"
      >
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(circle, #C8A882 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }} />

        <div className="relative z-10 max-w-md w-full">
          <div className="form-anim-item flex items-center gap-3 mb-6 opacity-0">
            <div className="w-8 h-px bg-[#C8A882]" />
            <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Bejelentkezés</span>
          </div>
          <h1 className="form-anim-item font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3rem)] font-light leading-[1.1] text-[#1A1510] mb-3 opacity-0">
            Jó visszalátni
          </h1>
          <p className="form-anim-item text-[13px] font-light text-[#7A6A58] leading-relaxed mb-10 opacity-0">
            Add meg az adataidat a belépéshez.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="form-anim-item opacity-0">
              <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060] mb-2">Email cím</label>
              <input
                ref={emailRef}
                name="email"
                type="email"
                placeholder="pelda@email.com"
                required
                className={`w-full bg-transparent border-0 border-b py-2.5 text-[14px] font-light text-[#1A1510] placeholder:text-[#C8B8A0]/60 focus:outline-none transition-colors ${errorType === "wrong_email" ? "border-red-300" : "border-[#EDE8E0] focus:border-[#C8A882]"}`}
              />
              {errorType === "wrong_email" && (
                <p className="mt-2 text-[11px] text-red-400/80 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-400/80 shrink-0 inline-block" />
                  Nem találunk fiókot ezzel az email címmel.
                </p>
              )}
            </div>

            <div className="form-anim-item opacity-0">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060]">Jelszó</label>
                <a href="/auth/forgot" className="text-[10px] tracking-[0.08em] text-[#C8A882] hover:text-[#A08060] transition-colors">
                  Elfelejtett jelszó?
                </a>
              </div>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className={`w-full bg-transparent border-0 border-b py-2.5 text-[14px] font-light text-[#1A1510] placeholder:text-[#C8B8A0]/60 focus:outline-none transition-colors ${errorType === "wrong_password" ? "border-red-300" : "border-[#EDE8E0] focus:border-[#C8A882]"}`}
              />
              {errorType === "wrong_password" && (
                <p className="mt-2 text-[11px] text-red-400/80 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-400/80 shrink-0 inline-block" />
                  Helytelen jelszó.{" "}
                  <a href="/auth/forgot" className="underline underline-offset-2 hover:text-red-500 transition-colors">Elfelejtette?</a>
                </p>
              )}
            </div>

            {errorType === "unverified" && (
              <div className="border border-[#C8A882]/30 bg-[#C8A882]/5 px-4 py-4 flex flex-col gap-2.5">
                <p className="text-[12px] font-light text-[#7A6A58] leading-relaxed">
                  Az email címed még nincs megerősítve. Nézd meg a beérkező leveleid, vagy kérj új megerősítő emailt.
                </p>
                {resendStatus === "sent" ? (
                  <p className="text-[11px] text-[#C8A882] flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#C8A882] inline-block" />
                    Elküldtük! Ellenőrizd a postaládádat.
                  </p>
                ) : resendStatus === "error" ? (
                  <p className="text-[11px] text-red-400/80">Hiba történt, próbáld újra.</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendStatus === "sending"}
                    className="text-left text-[11px] tracking-[0.06em] text-[#C8A882] hover:text-[#1A1510] transition-colors underline underline-offset-2 w-fit disabled:opacity-50"
                  >
                    {resendStatus === "sending" ? "Küldés..." : "Megerősítő email újraküldése →"}
                  </button>
                )}
              </div>
            )}

            <div className="form-anim-item pt-2 opacity-0">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A1510] text-white text-[11px] tracking-[0.18em] uppercase py-4 px-8 hover:bg-[#C8A882] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Bejelentkezés..." : "Bejelentkezés"}
              </button>
            </div>
          </form>

          <div className="form-anim-item mt-10 pt-8 border-t border-[#EDE8E0] flex items-center gap-2 text-[12px] font-light text-[#7A6A58] opacity-0">
            Nincs még fiókod?
            <a href="/auth/register" className="text-[#C8A882] hover:text-[#1A1510] transition-colors tracking-[0.04em]">
              Regisztrálj itt
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#FAF8F4]" />}>
      <LoginForm />
    </Suspense>
  );
}