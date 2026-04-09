"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/app/components/Button";
import { useAnalytics } from "@/lib/analytics";

const heroImages = [
  { src: "/slides/kreativ-12.JPG", alt: "Esküvő", label: "Esküvő" },
  { src: "/slides/kreativ-52.JPG", alt: "Portré", label: "Portré" },
  { src: "/slides/marcidorina-59.JPG", alt: "Rendezvény", label: "Rendezvény" },
  { src: "/slides/muzeumokejszakaja-230.jpg", alt: "Drón", label: "Drón" },
];

  
export default function HeroInteractive() {
  const { trackClick } = useAnalytics();
  const sectionRef = useRef<HTMLElement>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setActiveImg(i => (i + 1) % heroImages.length);
        setTransitioning(false);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  function switchImage(idx: number) {
    if (idx === activeImg) return;
    setTransitioning(true);
    setTimeout(() => { setActiveImg(idx); setTransitioning(false); }, 300);
  }

  useEffect(() => {
    let ctx: any;
    let mounted = true;

    async function init() {
      const { gsap } = await import("gsap");
      if (!mounted) return;
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl
          .fromTo(".hi-eyebrow", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 })
          .fromTo(".hi-title > span", { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.12, duration: 1 }, 0.2)
          .fromTo(".hi-desc", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, 0.6)
          .fromTo(".hi-cta", { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.6 }, 0.8)
          .fromTo(".hi-stat", { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.5 }, 1.0)
          .fromTo(".hi-img-panel", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 1, ease: "power2.out" }, 0.3);
      }, sectionRef);
    }

    init();
    return () => { mounted = false; ctx?.revert(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-white overflow-hidden"
      // ── Fix: explicit min-height, nem 100svh amit a böngésző rosszul számol mobilon ──
      style={{ minHeight: "100svh" }}
    >
      {/* ── MOBIL háttérkép – teljes szekció mögött ── */}
      <div className="lg:hidden absolute inset-0 z-0">
        {heroImages.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === activeImg && !transitioning ? 1 : 0 }}
          >
            <Image
              src={img.src}
              alt={img.label}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))}
        {/* Erős fehér overlay mobilon hogy a szöveg olvasható legyen */}
        <div className="absolute inset-0 bg-white/88" />
      </div>

      {/* ── Desktop: kétoszlopos layout ── */}
      <div
        className="relative z-10 flex flex-col lg:grid lg:grid-cols-[52%_48%]"
        style={{ minHeight: "100svh" }}
      >
        {/* BAL / MOBIL: teljes szöveg panel */}
        <div className="flex flex-col justify-between px-6 sm:px-10 lg:px-16 pt-10 pb-8 lg:py-14 min-h-0">

          {/* Fejléc */}
          <div className="flex items-center gap-3 mb-0">
            <div className="w-8 h-px bg-[#C8A882]" />
            <span className="hi-eyebrow text-[9px] tracking-[0.3em] uppercase text-[#A08060]">
              OptikArt · Fotó & Videó 
            </span>
          </div>

          {/* Cím + leírás + CTA – vertikálisan középre */}
          <div className="flex flex-col gap-6 py-8 flex-1 justify-center">
            <h1
              className="hi-title font-['Cormorant_Garamond'] font-thin text-[#1A1510] leading-[0.88] tracking-[-0.03em]"
              style={{ fontSize: "clamp(2.8rem, 8vw, 7.5rem)" }}
            >
              <span className="block overflow-hidden"><span className="block">Képek</span></span>
              <span className="block overflow-hidden"><span className="block">& pillanatok,</span></span>
              <span className="block overflow-hidden">
                <em className="block not-italic text-[#C8A882]">örökre.</em>
              </span>
            </h1>

            <p className="hi-desc text-[14px] font-light text-[#7A6A58] leading-[1.9] max-w-sm">
              Professzionális fotó- és videóalkotások — esküvőtől rendezvényig, portréktól reklámfilmekig. Minden kép egy történet.
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <Link href="/contact">
                <Button onClick={() => trackClick("hero_projekt_indítása")}
                  variant="primary" 
                  size="lg"
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
                  iconPosition="right"
                >
                  <span className="hi-cta">Projekt indítása</span>
                </Button>
              </Link>
              <Link href="/references" className="hi-cta text-[11px] tracking-[0.14em] uppercase text-[#7A6A58] border-b border-[#C8A882]/40 pb-0.5 hover:text-[#1A1510] hover:border-[#C8A882] transition-all whitespace-nowrap">
                Galéria →
              </Link>
            </div>

            {/* Mobil: platform tagek */}
            <div className="flex flex-wrap gap-2 lg:hidden">
              {heroImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => switchImage(i)}
                  className={`text-[9px] tracking-[0.1em] uppercase px-2.5 py-1 border transition-all ${i === activeImg ? "bg-[#C8A882] border-[#C8A882] text-white" : "border-[#EDE8E0] text-[#A08060]"}`}
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stat sor 
          <div className="flex flex-wrap gap-6 sm:gap-8 pt-5 border-t border-[#EDE8E0]">
            {[
              { n: "320+", l: "Projekt" },
              { n: "8 év", l: "Tapasztalat" },
              { n: "98%", l: "Elégedett ügyfél" },
            ].map((s) => (
              <div key={s.l} className="hi-stat">
                <div className="font-['Cormorant_Garamond'] text-[1.6rem] sm:text-[1.8rem] font-light text-[#C8A882] leading-none">{s.n}</div>
                <div className="text-[8px] tracking-[0.15em] uppercase text-[#A08060] mt-1">{s.l}</div>
              </div>
            ))}
          </div>*/}
        </div>

        {/* JOBB: képváltós panel – csak desktop */}
        <div className="hi-img-panel relative hidden lg:block overflow-hidden">
          {heroImages.map((img, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === activeImg && !transitioning ? 1 : i === activeImg ? 0.3 : 0 }}
            >
              <Image src={img.src} alt={img.label} fill className="object-cover" sizes="48vw" priority={i === 0} />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1510]/30 via-transparent to-transparent z-10" />

          {/* Dot nav */}
          <div className="absolute bottom-6 right-10 z-20 flex flex-col gap-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => switchImage(i)}
                className={`transition-all duration-300 ${i === activeImg ? "w-4 h-4 bg-[#C8A882]" : "w-2 h-2 bg-white/30 hover:bg-white/50"}`}
                style={{ borderRadius: "1px" }}
              />
            ))}
          </div>

          {/* Label + számláló */}
          <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2">
            <div className="w-4 h-px bg-[#C8A882]" />
            <span className="text-[9px] tracking-[0.2em] uppercase text-white/60">{heroImages[activeImg].label}</span>
          </div>
          <div className="absolute top-8 right-16 z-20 font-['Cormorant_Garamond'] text-white/30 text-[1rem] font-light tabular-nums">
            {String(activeImg + 1).padStart(2, "0")} / {String(heroImages.length).padStart(2, "0")}
          </div>
        </div>
      </div>

      {/* Scroll indikátor – csak desktop */}
      <div className="absolute bottom-8 left-[26%] -translate-x-1/2 flex-col items-center gap-2 z-20 hidden lg:flex">
        <span className="text-[8px] tracking-[0.22em] uppercase text-[#A08060]/40">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-[#C8A882]/40 to-transparent animate-[scrollPulse_2s_ease-in-out_infinite]" />
      </div>

      <style jsx>{`
        @keyframes scrollPulse {
          0% { transform: scaleY(0); opacity: 1; transform-origin: top; }
          50% { transform: scaleY(1); opacity: 1; transform-origin: top; }
          51% { transform-origin: bottom; }
          100% { transform: scaleY(0); opacity: 0; transform-origin: bottom; }
        }
      `}</style>
    </section>
  );
}