"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
          defaults: { ease: "power3.out", duration: 0.8 } 
        });

        tl.fromTo(leftRef.current, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1 })
          .fromTo(".anim-item", { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06 }, "-=0.7")
          .fromTo(formRef.current, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1 }, 0.2)
          .fromTo(".form-anim", { y: 15, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05 }, "-=0.6");
      }, rootRef);
    }

    animate();
    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  function checkPasswordStrength(pw: string) {
    let strength = 0;
    if (pw.length >= 8) strength++;
    if (/[A-Z]/.test(pw)) strength++;
    if (/[0-9]/.test(pw)) strength++;
    if (/[^A-Za-z0-9]/.test(pw)) strength++;
    setPasswordStrength(strength);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const passwordConfirm = (form.elements.namedItem("passwordConfirm") as HTMLInputElement).value;

    if (password !== passwordConfirm) {
      setError("A két jelszó nem egyezik meg!");
      return;
    }

    if (passwordStrength < 3) {
      setError("A jelszó túl gyenge! Használj legalább 8 karaktert, nagybetűt és számot.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Hiba történt a regisztráció során");
        setLoading(false);
        return;
      }

      setShowSuccessModal(true);
    } catch (err) {
      setError("Hálózati hiba történt. Kérjük, próbáld újra később.");
      setLoading(false);
    }
  }

  const strengthLabels = ["Gyenge", "Közepes", "Erős", "Kiváló"];
  const strengthColors = ["bg-red-400", "bg-orange-300", "bg-yellow-600", "bg-[#C8A882]"];

  return (
    <div ref={rootRef} className="flex h-screen bg-[#FAF8F4] overflow-hidden relative">
      
      {/* ── SIKER MODAL ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1510]/60 backdrop-blur-sm">
          <div className="bg-white max-w-sm w-full p-8 shadow-2xl border border-[#EDE8E0] text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-[#FDFBF7] border border-[#C8A882] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#C8A882]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-['Cormorant_Garamond'] text-2xl text-[#1A1510] mb-3">Már majdnem kész!</h3>
            <p className="text-[13px] text-[#7A6A58] leading-relaxed mb-8">
              Küldtünk egy megerősítő e-mailt a címedre. Kérjük, aktiváld a fiókodat a benne lévő linkkel.
            </p>
            <button 
              onClick={() => router.push("/auth/login")}
              className="w-full bg-[#1A1510] text-white text-[10px] tracking-widest uppercase py-4 hover:bg-[#C8A882] transition-colors"
            >
              Értem, a bejelentkezéshez
            </button>
          </div>
        </div>
      )}

      {/* ── BAL OLDAL ── */}
      <div ref={leftRef} className="hidden md:flex flex-col justify-between w-1/3 bg-[#1A1510] px-10 py-12 relative overflow-hidden opacity-0">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 60px,#C8A882 60px,#C8A882 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,#C8A882 60px,#C8A882 61px)` }} />
        </div>
        <div className="anim-item relative z-10 opacity-0">
          <Link href="/"><Image src="/assets/10optik2 (1).png" alt="OptikArt" width={110} height={110} className="object-contain" /></Link>
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
          <div className="anim-item flex items-center gap-3 mb-8 opacity-0">
            <div className="w-8 h-px bg-[#C8A882]" /><span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Új fiók</span>
          </div>
          <h2 className="anim-item font-['Cormorant_Garamond'] text-[clamp(2rem,3vw,2.8rem)] font-light leading-[1.12] text-white mb-6 opacity-0">
            Csatlakozz az<br />OptikArt<br /><em className="not-italic text-[#C8A882]">közösséghez</em>
          </h2>
          <p className="anim-item text-[13px] font-light text-[#7A6A58] leading-[1.9] mb-12 opacity-0">Hozd létre saját portfóliódat és<br />kezeld ügyfeleidet egy helyen.</p>
        </div>
        <div className="anim-item relative z-10 opacity-0">
          <span className="text-[10px] tracking-[0.1em] text-[#3A3020]">© {new Date().getFullYear()} OptikArt</span>
        </div>
      </div>

      {/* ── JOBB OLDAL ── */}
      <div ref={formRef} className="flex flex-col justify-center w-full md:w-2/3 px-8 sm:px-16 lg:px-28 xl:px-40 py-12 relative opacity-0 overflow-y-auto">
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `radial-gradient(circle, #C8A882 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
        <div className="relative z-10 max-w-md w-full mx-auto">
          <div className="form-anim flex items-center gap-3 mb-6 opacity-0">
            <div className="w-8 h-px bg-[#C8A882]" /><span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Regisztráció</span>
          </div>
          <h1 className="form-anim font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,2.8rem)] font-light leading-[1.1] text-[#1A1510] mb-8 opacity-0">Kezdjük el a közös munkát</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="form-anim opacity-0">
              <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060] mb-1.5">Teljes név</label>
              <input name="name" type="text" placeholder="Példa János" required className="w-full bg-transparent border-0 border-b border-[#EDE8E0] py-2 text-[14px] font-light text-[#1A1510] focus:outline-none focus:border-[#C8A882] transition-colors" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="form-anim opacity-0">
                <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060] mb-1.5">Email cím</label>
                <input name="email" type="email" placeholder="pelda@email.com" required className="w-full bg-transparent border-0 border-b border-[#EDE8E0] py-2 text-[14px] font-light text-[#1A1510] focus:outline-none focus:border-[#C8A882] transition-colors" />
              </div>
              <div className="form-anim opacity-0">
                <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060] mb-1.5">Telefonszám</label>
                <input name="phone" type="tel" placeholder="+36 30 123 4567" className="w-full bg-transparent border-0 border-b border-[#EDE8E0] py-2 text-[14px] font-light text-[#1A1510] focus:outline-none focus:border-[#C8A882] transition-colors" />
              </div>
            </div>

            <div className="form-anim opacity-0">
              <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060] mb-1.5">Jelszó</label>
              <input name="password" type="password" placeholder="••••••••" required onChange={(e) => checkPasswordStrength(e.target.value)} className="w-full bg-transparent border-0 border-b border-[#EDE8E0] py-2 text-[14px] font-light text-[#1A1510] focus:outline-none focus:border-[#C8A882] transition-colors" />
              {passwordStrength > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`h-[2px] flex-1 transition-all duration-500 ${i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-[#EDE8E0]"}`} />
                    ))}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-[#A08060] min-w-[50px]">{strengthLabels[passwordStrength - 1]}</span>
                </div>
              )}
            </div>

            <div className="form-anim opacity-0">
              <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060] mb-1.5">Jelszó megerősítése</label>
              <input name="passwordConfirm" type="password" placeholder="••••••••" required className="w-full bg-transparent border-0 border-b border-[#EDE8E0] py-2 text-[14px] font-light text-[#1A1510] focus:outline-none focus:border-[#C8A882] transition-colors" />
            </div>

            {/* HIBAÜZENET - NINCS RAJTA form-anim ÉS opacity-0 */}
            {error && (
              <div className="flex items-start gap-2 text-[11px] text-red-600 bg-red-50 p-4 border-l-2 border-red-500 transition-all duration-300">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <div className="form-anim pt-4 opacity-0">
              <button type="submit" disabled={loading} className="w-full bg-[#1A1510] text-white text-[11px] tracking-[0.18em] uppercase py-4 hover:bg-[#C8A882] transition-colors duration-300 disabled:opacity-50">
                {loading ? "Folyamatban..." : "Regisztráció véglegesítése"}
              </button>
            </div>
          </form>

          <div className="form-anim mt-8 pt-6 border-t border-[#EDE8E0] flex items-center gap-2 text-[12px] font-light text-[#7A6A58] opacity-0">
            Van már fiókod? <Link href="/auth/login" className="text-[#C8A882] hover:text-[#1A1510] transition-colors tracking-[0.04em]">Lépj be itt</Link>
          </div>
        </div>
      </div>
    </div>
  );
}