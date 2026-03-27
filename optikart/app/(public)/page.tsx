"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Button from "@/app/components/Button";
import HorizontalScrollSection from "../components/HorizontalScrollSection";
import TeamSection from "../components/TeamSection";
import HeroInteractive from "../components/HeroInteractive";

// GSAP dynamic import – csak kliensen fut
let gsapLoaded = false;



const stats = [
  { number: "320+", label: "Lezárt projekt" },
  { number: "8 év", label: "Szakmai tapasztalat" },
  { number: "98%", label: "Elégedett ügyfél" },
  { number: "15+", label: "Szakmai díj" },
];

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: any;

    async function initGSAP() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText } = await import("gsap/SplitText");

      gsap.registerPlugin(ScrollTrigger, SplitText);

      ctx = gsap.context(() => {

        // ── HERO animációk ──────────────────────────────────────

        // ── STATS szekció ───────────────────────────────────────
        gsap.from(".stat-item", {
          opacity: 0,
          y: 40,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".stats-section",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });

        // Számláló animáció
        document.querySelectorAll(".stat-number").forEach((el) => {
          const target = el.textContent?.replace(/[^0-9]/g, "") || "0";
          const suffix = el.textContent?.replace(/[0-9]/g, "") || "";
          const num = parseInt(target);
          if (isNaN(num)) return;

          const obj = { val: 0 };
          gsap.to(obj, {
            val: num,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = Math.round(obj.val) + suffix;
            },
            scrollTrigger: {
              trigger: ".stats-section",
              start: "top 75%",
              once: true,
            },
          });
        });

        // ── ABOUT szekció ───────────────────────────────────────

        // Kép frame beúszik balról
        gsap.from(".about-visual", {
          opacity: 0,
          x: -60,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-section",
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        });

        // Szöveg jobbról
        gsap.from(".about-text-col", {
          opacity: 0,
          x: 60,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-section",
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        });

        // About cím – soronként görgetésre olvad be
        const aboutTitleEl = document.querySelector(".about-title");
        if (aboutTitleEl) {
          const splitAbout = new SplitText(".about-title", { type: "lines" });
          gsap.from(splitAbout.lines, {
            opacity: 0,
            y: 30,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".about-section",
              start: "top 65%",
              toggleActions: "play none none reverse",
            },
          });
        }

        // ── CONTACT szekció ─────────────────────────────────────
        gsap.from(".contact-info-col", {
          opacity: 0,
          y: 50,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".contact-section",
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        });

        gsap.from(".contact-form-col", {
          opacity: 0,
          y: 50,
          duration: 0.9,
          delay: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".contact-section",
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        });

        // Form mezők egyenként
        gsap.from(".cf-field-anim", {
          opacity: 0,
          y: 20,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".contact-form-col",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });

        // ── HORIZONTAL SCROLL a services szekcióban (opcionális) ─
        // Vízszintes vonalak parallax a háttérben
        gsap.to(".bg-line-1", {
          xPercent: -15,
          ease: "none",
          scrollTrigger: {
            trigger: ".services-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });

        gsap.to(".bg-line-2", {
          xPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: ".services-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });

      }, rootRef);
    }

    initGSAP();

    return () => ctx?.revert();
  }, []);

  return (
    <div ref={rootRef} className="bg-[#FAF8F4] overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <HeroInteractive />

      {/* ── SERVICES ──────────────────────────────────────────── */}
      <HorizontalScrollSection/>
       {/* ── US ──────────────────────────────────────────── */}
      <TeamSection />
      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="stats-section py-20 bg-[#F5EFE6] border-y border-[#EDE8E0]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#DDD5C8]">
            {stats.map((s, i) => (
              <div key={i} className="stat-item bg-[#F5EFE6] px-10 py-12 text-center">
                <div className="stat-number font-['Cormorant_Garamond'] text-[3.5rem] font-light text-[#C8A882] leading-none mb-2">
                  {s.number}
                </div>
                <div className="text-[10px] tracking-[0.18em] uppercase text-[#A08060]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────── */}
      <section className="about-section py-32 bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Kép oszlop */}
            <div className="about-visual relative">
              {/* Fő keret */}
              <div
                className="relative aspect-[3/4] bg-[#EDE8E0] border border-[#DDD5C8] overflow-hidden flex items-center justify-center"
              >
                {/* Sarokdíszek */}
                {["top-3 left-3 border-t border-l", "top-3 right-3 border-t border-r", "bottom-3 left-3 border-b border-l", "bottom-3 right-3 border-b border-r"].map((cls, i) => (
                  <div key={i} className={`absolute w-5 h-5 ${cls} border-[#C8A882]/50`} />
                ))}
                <span className="font-['Cormorant_Garamond'] italic text-[#C8A882]/40 text-base tracking-widest">
                  — fotó helye —
                </span>
              </div>

              {/* Lebegő badge */}
              <div className="absolute -bottom-5 -right-5 w-28 h-28 bg-[#C8A882] rounded-full flex flex-col items-center justify-center gap-0.5 shadow-xl">
                <span className="font-['Cormorant_Garamond'] text-[2rem] font-light text-white leading-none">8+</span>
                <span className="text-[8px] tracking-[0.1em] uppercase text-white/70 text-center leading-tight">év tapasz-<br />talat</span>
              </div>

              {/* Dekoratív hátterű keret */}
              <div className="absolute -top-4 -left-4 w-32 h-32 border border-[#C8A882]/15 -z-10" />
            </div>

            {/* Szöveg oszlop */}
            <div className="about-text-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Rólunk</span>
              </div>

              <h2 className="about-title font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3.2rem)] font-light leading-[1.12] text-[#1A1510] mb-6">
                Szenvedélyünk<br />
                a <em className="not-italic text-[#C8A882]">vizuális</em><br />
                történetmesélés
              </h2>

              <p className="text-[14px] font-light text-[#7A6A58] leading-[1.9] mb-4">
                Az OptikArt csapata több mint 8 éve alkot professzionális
                fotó- és videótartalmakat vállalkozásoknak, magánszemélyeknek
                és eseményeknek egyaránt.
              </p>
              <p className="text-[14px] font-light text-[#7A6A58] leading-[1.9] mb-10">
                Minden projekt egyedi — mi is úgy közelítünk hozzá. A részletekre
                való odafigyelés és a kreatív látásmód határozza meg munkánkat.
              </p>

              {/* Mini stat sor */}
              <div className="flex gap-8 py-6 border-t border-b border-[#EDE8E0] mb-10">
                {[
                  { num: "320+", lbl: "Projekt" },
                  { num: "120+", lbl: "Ügyfél" },
                  { num: "15+", lbl: "Díj" },
                ].map((s) => (
                  <div key={s.lbl}>
                    <div className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#C8A882] leading-none">{s.num}</div>
                    <div className="text-[10px] tracking-[0.12em] uppercase text-[#A08060] mt-1">{s.lbl}</div>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="lg">
                Bővebben rólunk
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────────── */}
      <section className="contact-section py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

            {/* Bal oldal – info */}
            <div className="contact-info-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Kapcsolat & Foglalás</span>
              </div>

              <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3.2rem)] font-light leading-[1.12] text-[#1A1510] mb-6">
                Kezdjük el<br />
                a közös <em className="not-italic text-[#C8A882]">munkát</em>
              </h2>

              <p className="text-[14px] font-light text-[#7A6A58] leading-[1.9] mb-10">
                Legyen szó egy nagy projektről vagy egy kis megbízásról —
                szívesen hallunk rólad. Írj nekünk és 24 órán belül visszajelzünk.
              </p>

              <div className="flex flex-col gap-4">
                {[
                  {
                    label: "Email",
                    value: "hello@optikart.hu",
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-4 h-4">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    ),
                  },
                  {
                    label: "Telefon",
                    value: "+36 30 123 4567",
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-4 h-4">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Helyszín",
                    value: "Budapest, Magyarország",
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-4 h-4">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    ),
                  },
                ].map((d) => (
                  <div key={d.label} className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-[#EDE8E0] rounded-full flex items-center justify-center text-[#C8A882] shrink-0">
                      {d.icon}
                    </div>
                    <div>
                      <div className="text-[9px] tracking-[0.15em] uppercase text-[#A08060] mb-0.5">{d.label}</div>
                      <div className="text-[13px] text-[#3A3530]">{d.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Jobb oldal – form */}
            <div className="contact-form-col">
              <form
                className="flex flex-col gap-6"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="cf-field-anim">
                    <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060] mb-2">Neve</label>
                    <input
                      type="text"
                      placeholder="Szabó Máté"
                      required
                      className="w-full bg-transparent border-0 border-b border-[#EDE8E0] py-2.5 text-[14px] font-light text-[#1A1510] placeholder:text-[#C8B8A0]/60 focus:outline-none focus:border-[#C8A882] transition-colors"
                    />
                  </div>
                  <div className="cf-field-anim">
                    <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060] mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="pelda@email.com"
                      required
                      className="w-full bg-transparent border-0 border-b border-[#EDE8E0] py-2.5 text-[14px] font-light text-[#1A1510] placeholder:text-[#C8B8A0]/60 focus:outline-none focus:border-[#C8A882] transition-colors"
                    />
                  </div>
                </div>

                <div className="cf-field-anim">
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060] mb-2">Telefonszám</label>
                  <input
                    type="tel"
                    placeholder="+36 30 123 4567"
                    className="w-full bg-transparent border-0 border-b border-[#EDE8E0] py-2.5 text-[14px] font-light text-[#1A1510] placeholder:text-[#C8B8A0]/60 focus:outline-none focus:border-[#C8A882] transition-colors"
                  />
                </div>

                <div className="cf-field-anim">
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060] mb-2">Projekt leírása</label>
                  <textarea
                    rows={4}
                    placeholder="Írja le röviden a projektjét..."
                    required
                    className="w-full bg-transparent border-0 border-b border-[#EDE8E0] py-2.5 text-[14px] font-light text-[#1A1510] placeholder:text-[#C8B8A0]/60 focus:outline-none focus:border-[#C8A882] transition-colors resize-none"
                  />
                </div>

                <div className="cf-field-anim pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    }
                    iconPosition="right"
                  >
                    Üzenet küldése
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="py-10 bg-[#F5EFE6] border-t border-[#EDE8E0]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-['Cormorant_Garamond'] text-xl font-light text-[#1A1510] tracking-wide">
            OptikArt
          </span>
          <span className="text-[11px] tracking-[0.08em] text-[#A08060]">
            © {new Date().getFullYear()} OptikArt · Minden jog fenntartva
          </span>
        </div>
      </footer>

    </div>
  );
}