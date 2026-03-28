"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

        // 1. A bal oldali panel bejövetele
        tl.fromTo(leftRef.current, 
          { x: -60, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.1 }
        )
        // 2. Feliratok staggelve
        .fromTo(".login-anim-item", 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08 },
          "-=0.6"
        )
        // 3. A jobb oldali form bejövetele
        .fromTo(formRef.current, 
          { x: 60, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.1 },
          0.2
        )
        // 4. Form mezők staggelve
        .fromTo(".form-anim-item", 
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06 },
          "-=0.5"
        );
      }, rootRef);
    }

    animate();

    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Hibás email vagy jelszó");
    } else {
      router.push("/");
    }
  }

  return (
    <div ref={rootRef} className="flex h-screen bg-[#FAF8F4] overflow-hidden">
      {/* ── BAL OLDAL ── */}
      <div
        ref={leftRef}
        className="hidden md:flex flex-col justify-between w-1/3 bg-[#1A1510] px-10 py-12 relative overflow-hidden opacity-0"
      >
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 60px,#C8A882 60px,#C8A882 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,#C8A882 60px,#C8A882 61px)`
            }}
          />
        </div>
        
        <div className="login-anim-item relative z-10 opacity-0">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/assets/10optik2 (1).png"
              alt="OptikArt"
              width={110}
              height={110}
              className="object-contain"
            />
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
          <div className="login-anim-item flex items-center gap-3 mb-8 opacity-0">
            <div className="w-8 h-px bg-[#C8A882]" />
            <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Üdvözlünk</span>
          </div>
          <h2 className="login-anim-item font-['Cormorant_Garamond'] text-[clamp(2rem,3vw,2.8rem)] font-light leading-[1.12] text-white mb-6 opacity-0">
            Lépj be és<br />folytasd a<br />
            <em className="not-italic text-[#C8A882]">munkát</em>
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
          <span className="text-[10px] tracking-[0.1em] text-[#3A3020]">
            © {new Date().getFullYear()} OptikArt
          </span>
        </div>
      </div>

      {/* ── JOBB OLDAL ── */}
      <div
        ref={formRef}
        className="flex flex-col justify-center w-full md:w-2/3 px-8 sm:px-16 lg:px-28 xl:px-40 py-12 relative opacity-0"
      >
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle, #C8A882 1px, transparent 1px)`,
            backgroundSize: "32px 32px"
          }}
        />

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
                name="email" type="email" placeholder="pelda@email.com" required
                className="w-full bg-transparent border-0 border-b border-[#EDE8E0] py-2.5 text-[14px] font-light text-[#1A1510] placeholder:text-[#C8B8A0]/60 focus:outline-none focus:border-[#C8A882] transition-colors"
              />
            </div>

            <div className="form-anim-item opacity-0">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060]">Jelszó</label>
                <a href="/auth/forgot" className="text-[10px] tracking-[0.08em] text-[#C8A882] hover:text-[#A08060] transition-colors">
                  Elfelejtett jelszó?
                </a>
              </div>
              <input
                name="password" type="password" placeholder="••••••••" required
                className="w-full bg-transparent border-0 border-b border-[#EDE8E0] py-2.5 text-[14px] font-light text-[#1A1510] placeholder:text-[#C8B8A0]/60 focus:outline-none focus:border-[#C8A882] transition-colors"
              />
            </div>

            {error && (
              <div className="form-anim-item flex items-center gap-2 text-[12px] text-red-400/80 opacity-0">
                {error}
              </div>
            )}

            <div className="form-anim-item pt-2 opacity-0">
              <button
                type="submit" disabled={loading}
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