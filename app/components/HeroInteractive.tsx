"use client";

// app/components/HeroInteractive.tsx
// FIX: navbar magasság kezelés + bg transparent (ne ütközzön a navbar bg-vel)

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/app/components/Button";
import { useAnalytics } from "@/lib/analytics";

const heroImages = [
  { src: "/slides/napraforgo-132.JPG", alt: "Portré", label: "Portré" },
  { src: "/slides/kreativ-12.JPG", alt: "Esküvő", label: "Esküvő" },
  { src: "/slides/reka&adam-75.JPG", alt: "Páros", label: "Páros" },
  { src: "/slides/marcidorina-59.JPG", alt: "Jegyes", label: "Jegyes" },
  {
    src: "/gallery/event/kurultaj-169.JPG",
    alt: "Rendezvény",
    label: "Rendezvény",
  },
];

// navbar magasság – szinkronban a layout.tsx NAV_H értékével
const NAV_H = 68;

export default function HeroInteractive() {
  const { trackClick } = useAnalytics();
  const sectionRef = useRef<HTMLElement>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [animReady, setAnimReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setActiveImg((i) => (i + 1) % heroImages.length);
        setTransitioning(false);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  function switchImage(idx: number) {
    if (idx === activeImg) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveImg(idx);
      setTransitioning(false);
    }, 300);
  }

  useEffect(() => {
    let ctx: any;
    let mounted = true;

    async function init() {
      const { gsap } = await import("gsap");
      if (!mounted || !sectionRef.current) return;

      gsap.set(
        [
          ".hi-eyebrow",
          ".hi-desc",
          ".hi-img-panel",
          ".hi-tag-btn",
          ".hi-cta-primary",
          ".hi-cta-secondary",
        ],
        { autoAlpha: 0 },
      );
      gsap.set(".hi-title-word", { yPercent: 110 });
      setAnimReady(true);

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.to(".hi-eyebrow", { autoAlpha: 1, duration: 0.6 }, 0.1)
          .to(
            ".hi-title-word",
            { yPercent: 0, stagger: 0.1, duration: 0.9, ease: "power4.out" },
            0.25,
          )
          .to(".hi-desc", { autoAlpha: 1, duration: 0.7 }, 0.7)
          .to(".hi-cta-primary", { autoAlpha: 1, duration: 0.5 }, 0.85)
          .to(".hi-cta-secondary", { autoAlpha: 1, duration: 0.5 }, 0.95)
          .to(
            ".hi-tag-btn",
            { autoAlpha: 1, stagger: 0.05, duration: 0.4 },
            1.0,
          )
          .to(
            ".hi-img-panel",
            { autoAlpha: 1, duration: 1, ease: "power2.out" },
            0.3,
          );
      }, sectionRef);
    }

    requestAnimationFrame(() => init());
    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      // ── FIX: nincs bg-white → nem ütközik a navbar átlátszóságával
      // A section a layout main-jától kezdődik (nincs paddingTop),
      // de a tartalom paddingTop-ot kap a navbar magasságának megfelelően
      className="relative w-full overflow-hidden bg-[#FAF8F4]"
      style={{
        // Teljes viewport magasság – a section a 0px-től kezdődik (main-ben nincs padding)
        height: "100svh",
        minHeight: "560px",
      }}
    >
      {/* Mobil háttérkép */}
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
              quality={85}
              className="object-cover object-top"
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-white/85" />
      </div>

      {/* Kétoszlopos layout */}
      <div
        className="relative z-10 h-full flex flex-col lg:grid lg:grid-cols-[52%_48%]"
        style={{ visibility: animReady ? "visible" : "hidden" }}
      >
        {/* BAL panel – paddingTop = navbar magasság */}
        <div
          className="h-full flex flex-col px-6 sm:px-10 lg:px-16 pb-8 lg:pb-12"
          style={{ paddingTop: `${NAV_H + 16}px` }}
        >
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="w-8 h-px bg-[#C8A882]" />
            <span className="hi-eyebrow text-[9px] tracking-[0.3em] uppercase text-[#A08060]">
              OptikArt · Fotó & Videó
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-5 py-4">
            <h1
              className="font-['Cormorant_Garamond'] font-thin text-[#1A1510] leading-[0.88] tracking-[-0.03em]"
              style={{ fontSize: "clamp(2.6rem, 7vw, 7rem)" }}
            >
              <span className="block overflow-hidden">
                <span className="hi-title-word block">Képek</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hi-title-word block">& pillanatok,</span>
              </span>
              <span className="block overflow-hidden">
                <em className="hi-title-word block not-italic text-[#C8A882]">
                  örökre.
                </em>
              </span>
            </h1>

            <p className="hi-desc text-[13px] sm:text-[14px] font-light text-[#7A6A58] leading-[1.9] max-w-sm">
              Professzionális fotó- és videóalkotások — esküvőtől rendezvényig,
              portréktól reklámfilmekig.
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <Link href="/contact">
                <Button
                  onClick={() => trackClick("hero_projekt_indítása")}
                  variant="primary"
                  size="lg"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-4 h-4"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  }
                  iconPosition="right"
                  className="hi-cta-primary"
                >
                  Projekt indítása
                </Button>
              </Link>
              <Link
                href="/references"
                className="hi-cta-secondary text-[11px] tracking-[0.14em] uppercase text-[#7A6A58] border-b border-[#C8A882]/40 pb-0.5 hover:text-[#1A1510] hover:border-[#C8A882] transition-all whitespace-nowrap"
              >
                Galéria →
              </Link>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col gap-3 pb-2">
            <div className="flex flex-wrap gap-2 lg:hidden">
              {heroImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => switchImage(i)}
                  className={`hi-tag-btn text-[9px] tracking-[0.1em] uppercase px-2.5 py-1 border transition-all ${i === activeImg ? "bg-[#C8A882] border-[#C8A882] text-white" : "border-[#EDE8E0] text-[#A08060]"}`}
                >
                  {img.label}
                </button>
              ))}
            </div>
            <div className="hidden lg:flex flex-col items-start gap-2">
              <span className="text-[8px] tracking-[0.22em] uppercase text-[#A08060]/40">
                Scroll
              </span>
              <div className="w-px h-8 bg-gradient-to-b from-[#C8A882]/40 to-transparent animate-[scrollPulse_2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>

        {/* JOBB képpanel */}
        <div
          className="hi-img-panel relative hidden lg:block h-full overflow-hidden"
          style={{ paddingTop: `${NAV_H}px` }}
        >
          <div className="relative h-full overflow-hidden">
            {heroImages.map((img, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-700"
                style={{
                  opacity:
                    i === activeImg && !transitioning
                      ? 1
                      : i === activeImg
                        ? 0.3
                        : 0,
                }}
              >
                <Image
                  src={img.src}
                  alt={img.label}
                  fill
                  quality={90}
                  className="object-cover object-top"
                  sizes="48vw"
                  priority={i === 0}
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F4]/20 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1510]/30 via-transparent to-transparent z-10 pointer-events-none" />

            {/* Dot nav */}
            <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => switchImage(i)}
                  className={`transition-all duration-300 ${i === activeImg ? "w-4 h-4 bg-[#C8A882]" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`}
                  style={{ borderRadius: "1px" }}
                />
              ))}
            </div>

            {/* Label */}
            <div className="absolute bottom-8 left-6 z-20 flex items-center gap-2">
              <div className="w-4 h-px bg-[#C8A882]" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-white/70">
                {heroImages[activeImg].label}
              </span>
            </div>

            {/* Számláló */}
            <div className="absolute top-6 right-6 z-20 font-['Cormorant_Garamond'] text-white/40 text-[0.9rem] font-light tabular-nums">
              {String(activeImg + 1).padStart(2, "0")} /{" "}
              {String(heroImages.length).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollPulse {
          0% {
            transform: scaleY(0);
            opacity: 1;
            transform-origin: top;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
            transform-origin: top;
          }
          51% {
            transform-origin: bottom;
          }
          100% {
            transform: scaleY(0);
            opacity: 0;
            transform-origin: bottom;
          }
        }
      `}</style>
    </section>
  );
}
