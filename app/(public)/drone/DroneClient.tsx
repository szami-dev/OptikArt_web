"use client";

// app/(public)/drone/page.tsx
// FIX: scroll pattanás javítva
// – A scroll-animált elemek kezdetben opacity:0 CSS-sel (nem GSAP-pal)
// – GSAP csak animálja őket, nem rejti el először

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import Link from "next/link";
import Footer from "@/app/components/Footer";


const NAV_H = 68;

const DRONE_GALLERY = [
  {
    src: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80",
    alt: "Alföldi szántóföldek",
    location: "Kiskunság",
    year: "2024",
  },
  {
    src: "https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=600&q=80",
    alt: "Városi panoráma",
    location: "Kecskemét",
    year: "2024",
  },
  {
    src: "https://images.unsplash.com/photo-1508614999368-9260051292e5?w=600&q=80",
    alt: "Vízfelszín felülről",
    location: "Tisza",
    year: "2024",
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    alt: "Hegyvidéki tájak",
    location: "Mátra",
    year: "2023",
  },
  {
    src: "https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=800&q=80",
    alt: "Őszi erdő madártávlatból",
    location: "Bükk",
    year: "2024",
  },
  {
    src: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?w=600&q=80",
    alt: "Ipari komplexum",
    location: "Pest megye",
    year: "2023",
  },
];

const DRONE_VIDEOS = [
  {
    id: "dQw4w9WgXcQ",
    title: "Alföldi tájak showreel",
    location: "Kiskunság, 2024",
    thumb:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=75",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Esküvői légivideó",
    location: "Csongrád, 2025",
    thumb:
      "https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=600&q=75",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Rendezvény reel",
    location: "Kecskemét, 2024",
    thumb:
      "https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=600&q=75",
  },
];

const USE_CASES = [
  {
    title: "Esküvő",
    desc: "Légifotók és romantikus légivideók a nagy napról. A helyszín és a pár együtt, perspektívából.",
    thumb:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
  },
  {
    title: "Ingatlan",
    desc: "Eladó, kiadó vagy bemutatási célra. Telekfotózás, területbemutatás professzionálisan.",
    thumb:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  },
  {
    title: "Rendezvény",
    desc: "Fesztiválok, sportesemények, céges rendezvények madártávlatból.",
    thumb:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
  },
  {
    title: "Táj & Természet",
    desc: "Natúrfilm minőségű légifelvételek. Alföld, vizek, erdők, egyedi perspektívák.",
    thumb:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  },
];

const SPECS = [
  { label: "Drón", value: "DJI Mavic 3 Cine", icon: "▲" },
  { label: "Felbontás", value: "6K / 5.1K ProRes", icon: "◈" },
  { label: "Hatótáv", value: "~15 km", icon: "⊕" },
  { label: "Repülési idő", value: "~46 perc", icon: "◎" },
  { label: "Apertura", value: "f/2.8–f/11", icon: "⊙" },
  { label: "Éjszakai", value: "CMOS szenzor", icon: "◐" },
];

const FAQS = [
  {
    q: "Kell-e engedély?",
    a: "Igen. Rendelkezünk A1/A3 és A2 CofC tanúsítvánnyal, EU drón szabályozás szerint. Lakott területen külön eljárás szükséges — ezt mi intézzük.",
  },
  {
    q: "Milyen időjárásban?",
    a: "Max 10 m/s szélsebesség, eső és köd esetén nem repülünk. Ha az időjárás nem engedi, napolunk — extra díj nélkül.",
  },
  {
    q: "Mennyi az átadási idő?",
    a: "Nyers anyag: 48 óra. Szerkesztett videó/fotó: 1–2 hét.",
  },
  {
    q: "Éjszakai repülés?",
    a: "Korlátozott lehetőség van engedéllyel. A DJI Mavic 3 Cine sötétben is jó minőséget ad, de a biztonság az első.",
  },
];

// ── FAQ item (hooks nem lehetnek loopban) ─────────────────────
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="dr-anim border-b border-white/[0.07]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-[#C8A882]/35">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-['Cormorant_Garamond'] text-[1rem] font-light text-white/60 group-hover:text-white transition-colors">
            {q}
          </span>
        </div>
        <div
          className={`w-6 h-6 border border-white/[0.08] flex items-center justify-center shrink-0 ml-4 transition-all duration-300 ${open ? "rotate-45 border-[#C8A882]/35" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-3 h-3 text-[#C8A882]/45"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-400 ${open ? "max-h-48 pb-5" : "max-h-0"}`}
      >
        <p className="text-[13px] font-light text-white/32 leading-[1.9] pl-10 pr-8">
          {a}
        </p>
      </div>
    </div>
  );
}

export default function DroneClient() {
  
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [videoOpen, setVideoOpen] = useState<string | null>(null);
  const [altitude, setAltitude] = useState(0);
  // ── FIX: gsapReady flag – elemek rejtve amíg GSAP nem inicializált ──
  const [gsapReady, setGsapReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      let v = 0;
      const iv = setInterval(() => {
        v += 3;
        setAltitude(Math.min(v, 120));
        if (v >= 120) clearInterval(iv);
      }, 18);
      return () => clearInterval(iv);
    }, 1600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let ctx: any,
      mounted = true;

    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!mounted || !rootRef.current) return;

      // ── FIX: Először set-eljük az összes .dr-anim elemet autoAlpha:0-ra
      // GSAP-pal – így nincs villanás (nem CSS inline opacity)
      // Ezután a ScrollTrigger csak to()-t hív, nem fromTo()
      // A hero elemek külön kezelve (nincs .dr-anim osztályuk)
      gsap.set(".dr-anim", { autoAlpha: 0, y: 20 });

      // Most mutatjuk meg az oldalt (addig hidden volt a wrapper)
      setGsapReady(true);

      ctx = gsap.context(() => {
        // ── HERO animáció (külön – nincs dr-anim) ──────────────
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          delay: 0.1,
        });
        tl.fromTo(
          ".dr-bg-img",
          { scale: 1.08 },
          { scale: 1, duration: 2.5, ease: "power2.out" },
        )
          .fromTo(
            ".dr-crosshair",
            { autoAlpha: 0, scale: 1.3 },
            { autoAlpha: 1, scale: 1, duration: 1 },
            0.5,
          )
          .fromTo(
            ".dr-hud-item",
            { autoAlpha: 0, y: -8 },
            { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.6 },
            0.8,
          )
          .fromTo(
            ".dr-title-word",
            { yPercent: 110, autoAlpha: 0 },
            {
              yPercent: 0,
              autoAlpha: 1,
              stagger: 0.1,
              duration: 1,
              ease: "power4.out",
            },
            1.0,
          )
          .fromTo(
            ".dr-hero-desc",
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.7 },
            1.6,
          )
          .fromTo(
            ".dr-hero-cta",
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.5 },
            1.8,
          )
          .fromTo(
            ".dr-alt-display",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.5 },
            1.2,
          );

        // Hero parallax
        gsap.to(".dr-bg-img", {
          yPercent: 14,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });

        // Crosshair scan loop
        gsap.to(".dr-scan-line-h", {
          y: "200%",
          ease: "none",
          duration: 2,
          repeat: -1,
          repeatDelay: 1.5,
        });

        // ── SCROLL animációk: .dr-anim elemeket TO-val animáljuk ──
        // (nem fromTo – mert a kezdőállapotot már fent set-eltük)
        const scrollItems = rootRef.current?.querySelectorAll(".dr-anim");
        scrollItems?.forEach((el) => {
          gsap.to(el, {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              once: true,
            },
          });
        });

        // Stagger csoportok – gallery, videos, specs, usecases
        const staggerGroups = [
          { sel: ".dr-gallery-item", trigger: ".dr-gallery-grid" },
          { sel: ".dr-video-card", trigger: ".dr-videos-grid" },
          { sel: ".dr-spec-item", trigger: ".dr-specs-grid" },
          { sel: ".dr-usecase", trigger: ".dr-usecases-grid" },
        ];

        staggerGroups.forEach(({ sel, trigger }) => {
          const els = rootRef.current?.querySelectorAll(sel);
          if (!els?.length) return;
          // Ezeket is set-eljük
          gsap.set(els, { autoAlpha: 0, y: 20 });
          gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger, start: "top 90%", once: true },
          });
        });
      }, rootRef);
    }

    init();
    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  return (
    // ── FIX: visibility:hidden amíg GSAP nem set-elte az elemeket ──
    // Ez megakadályozza hogy a DOM-ban látható elemek "beleugorjanak" opacity:0-ba
    <div
      ref={rootRef}
      className="bg-[#0A0807] overflow-x-hidden font-light"
      style={{ visibility: gsapReady ? "visible" : "hidden" }}
    >
      {/* ══ HERO ══ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ height: "100svh", minHeight: "600px" }}
      >
        {/* Háttérkép */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="dr-bg-img absolute inset-[-8%] will-change-transform">
            <Image
              src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1920&q=90"
              alt="Drón légifotó"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
              quality={90}
            />
          </div>
        </div>

        {/* Overlay */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: `
            linear-gradient(to bottom, rgba(10,8,7,0.55) 0%, rgba(10,8,7,0.25) 40%, rgba(10,8,7,0.88) 100%),
            linear-gradient(to right, rgba(10,8,7,0.75) 0%, transparent 55%)
          `,
          }}
        />

        {/* Grain */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px",
          }}
        />

        {/* HUD overlay */}
        <div className="absolute inset-0 z-[3] pointer-events-none">
          {/* Crosshair */}
          <div className="dr-crosshair absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28">
            {[
              "top-0 left-0 border-t border-l",
              "top-0 right-0 border-t border-r",
              "bottom-0 left-0 border-b border-l",
              "bottom-0 right-0 border-b border-r",
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute w-6 h-6 ${cls} border-[#C8A882]/50`}
              />
            ))}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-[#C8A882]/15" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#C8A882]/15" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#C8A882]/70 rounded-full" />
            <div className="dr-scan-line-h absolute left-0 right-0 h-px bg-[#C8A882]/35 top-0" />
          </div>
          {/* Bal HUD */}
          <div className="absolute left-5 sm:left-8 top-1/2 -translate-y-1/2 flex flex-col gap-3">
            {[
              { l: "LAT", v: "46.7144°N" },
              { l: "LNG", v: "19.8633°E" },
              { l: "SPD", v: "0 km/h" },
            ].map((item) => (
              <div key={item.l} className="dr-hud-item">
                <div className="text-[7px] tracking-[0.25em] uppercase text-[#C8A882]/35">
                  {item.l}
                </div>
                <div className="font-mono text-[10px] text-[#C8A882]/60">
                  {item.v}
                </div>
              </div>
            ))}
          </div>
          {/* Jobb HUD */}
          <div className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 items-end">
            {[
              { l: "BATT", v: "98%" },
              { l: "GPS", v: "14 sat" },
              { l: "SIGNAL", v: "STRONG" },
            ].map((item) => (
              <div key={item.l} className="dr-hud-item text-right">
                <div className="text-[7px] tracking-[0.25em] uppercase text-[#C8A882]/35">
                  {item.l}
                </div>
                <div className="font-mono text-[10px] text-[#C8A882]/60">
                  {item.v}
                </div>
              </div>
            ))}
          </div>
          {/* Altitude */}
          <div className="dr-alt-display absolute right-5 sm:right-8 bottom-28">
            <div className="flex items-end gap-2">
              <div className="flex flex-col justify-end h-16 w-1.5 bg-white/5 relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-[#C8A882]/55 transition-all duration-100"
                  style={{ height: `${(altitude / 120) * 100}%` }}
                />
              </div>
              <div>
                <div className="font-mono text-[1.2rem] text-white/75 leading-none">
                  {altitude}
                </div>
                <div className="text-[7px] tracking-[0.2em] uppercase text-[#C8A882]/35">
                  m ALT
                </div>
              </div>
            </div>
          </div>
          {/* Felső sáv */}
          <div
            className="dr-hud-item absolute top-0 left-0 right-0 flex items-center justify-between px-5 sm:px-8 border-b border-white/[0.04]"
            style={{ paddingTop: `${NAV_H}px`, paddingBottom: "10px" }}
          >
            <span className="text-[7px] tracking-[0.25em] uppercase text-white/15 font-mono hidden sm:block">
              OPTIKART · DJI MAVIC 3 CINE · 6K PRORES
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
              <span className="text-[7px] tracking-[0.2em] uppercase text-[#4ADE80]/55 font-mono">
                LIVE
              </span>
            </div>
            <span className="text-[7px] tracking-[0.2em] text-white/12 font-mono hidden sm:block">
              A2 CofC · EU COMPLIANT
            </span>
          </div>
          {/* Alsó sáv */}
          <div className="dr-hud-item absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 sm:px-8 py-3 border-t border-white/[0.04]">
            <span className="text-[7px] tracking-[0.2em] uppercase text-white/12 font-mono">
              KISKUNFÉLEGYHÁZA · HUNGARY
            </span>
            <span className="text-[7px] tracking-[0.2em] text-white/12 font-mono hidden sm:block">
              {new Date().toLocaleDateString("hu-HU")}
            </span>
          </div>
        </div>

        {/* Tartalom */}
        <div className="relative z-[4] flex flex-col h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div
            className="flex items-center gap-3 flex-shrink-0"
            style={{ paddingTop: `${NAV_H + 12}px` }}
          >
            <div className="w-8 h-px bg-[#C8A882]/40" />
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#C8A882]/50">
              OptikArt · Drón osztály
            </span>
          </div>
          <div className="flex-1 flex items-center">
            <div>
              <h1
                className="font-['Cormorant_Garamond'] font-thin text-white leading-[0.85] tracking-[-0.03em] mb-7"
                style={{ fontSize: "clamp(4rem, 10vw, 12rem)" }}
              >
                <span className="block overflow-hidden">
                  <span className="dr-title-word block">Drón</span>
                </span>
                <span className="block overflow-hidden">
                  <em className="dr-title-word block not-italic text-[#C8A882]">
                    felvételek
                  </em>
                </span>
              </h1>
              <p className="dr-hero-desc text-[13px] sm:text-[14px] font-light text-white/40 leading-[2] max-w-sm mb-9">
                Légifotók és videók DJI Mavic 3 Cine-vel, 6K ProRes
                felbontásban. A világ felülnézetből egészen más.
              </p>
              <div className="flex flex-wrap items-center gap-5">
                <Link
                  href="/contact"
                  className="dr-hero-cta bg-white text-[#0A0807] text-[11px] tracking-[0.18em] uppercase px-8 py-4 hover:bg-[#C8A882] hover:text-white transition-all duration-300 whitespace-nowrap"
                >
                  Repülési ajánlat kérése
                </Link>
                <a
                  href="#galeria"
                  className="dr-hero-cta text-[11px] tracking-[0.14em] uppercase text-white/30 border-b border-white/12 pb-0.5 hover:text-white transition-all whitespace-nowrap"
                >
                  Galéria →
                </a>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-wrap gap-7 sm:gap-12 border-t border-white/[0.07] pt-5 pb-12 sm:pb-16">
            {[
              { l: "Felbontás", v: "6K ProRes" },
              { l: "Repülési idő", v: "~46 perc" },
              { l: "Hatótáv", v: "~15 km" },
              { l: "Engedély", v: "A2 CofC ✓" },
            ].map((s) => (
              <div key={s.l} className="dr-hero-cta">
                <div className="text-[7px] tracking-[0.2em] uppercase text-white/22 mb-0.5">
                  {s.l}
                </div>
                <div className="font-mono text-[11px] text-[#C8A882]/65">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GALÉRIA ══ */}
      <section id="galeria" className="bg-[#0A0807]">
        <div
          className="dr-gallery-grid grid grid-cols-2 lg:grid-cols-3"
          style={{ gridAutoRows: "clamp(160px, 22vw, 280px)" }}
        >
          {DRONE_GALLERY.map((img, i) => (
            <div
              key={i}
              className="dr-gallery-item relative overflow-hidden group cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.07]"
              />
              <div className="absolute inset-0 bg-[#0A0807]/20 group-hover:bg-[#0A0807]/0 transition-all duration-500" />
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="font-mono text-[8px] text-[#C8A882]/55 tracking-wider">
                  {img.location} · {img.year}
                </div>
              </div>
              <div className="absolute top-3 right-3 font-['Cormorant_Garamond'] text-[1.4rem] text-white/8 group-hover:text-white/15 transition-colors">
                {String(i + 1).padStart(2, "00")}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 sm:px-10 py-4 flex items-center justify-between border-y border-white/[0.04]">
          <span className="text-[7px] tracking-[0.25em] uppercase text-white/12 font-mono">
            DRONE GALLERY · OPTIKART · DJI MAVIC 3 CINE · 6K
          </span>
          <Link
            href="/references"
            className="text-[9px] tracking-[0.15em] uppercase text-[#C8A882]/35 hover:text-[#C8A882] transition-colors border-b border-[#C8A882]/15 pb-0.5"
          >
            Teljes portfólió →
          </Link>
        </div>
      </section>

      {/* ══ SPECS ══ */}
      <section className="py-24 sm:py-32 bg-[#0D0B08]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="dr-anim mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#C8A882]/40" />
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/50">
                Technikai adatok
              </span>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light text-white">
              Felszerelésünk
              <br />
              <em className="not-italic text-[#C8A882]">& specifikáció</em>
            </h2>
          </div>
          <div className="dr-specs-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-white/[0.04]">
            {SPECS.map((s, i) => (
              <div
                key={i}
                className="dr-spec-item bg-[#0D0B08] hover:bg-[#151210] transition-colors duration-300 p-6 sm:p-8 group"
              >
                <div className="text-[#C8A882]/25 group-hover:text-[#C8A882]/55 transition-colors text-[1.3rem] mb-4 font-mono">
                  {s.icon}
                </div>
                <div className="text-[9px] tracking-[0.2em] uppercase text-white/22 mb-1.5">
                  {s.label}
                </div>
                <div className="font-['Cormorant_Garamond'] text-[1rem] text-white/60">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              {
                title: "DJI Mavic 3 Cine",
                desc: "Hasselblad L-Format szenzor, 6K ProRes 422 HQ, 4/3 CMOS. A profi légifilm-gyártás referenciája.",
                tags: [
                  "6K ProRes",
                  "Hasselblad",
                  "4/3 CMOS",
                  "Gimbal",
                  "Akadályérzékelés",
                ],
              },
              {
                title: "EU Drón Szabályozás",
                desc: "A2 CofC tanúsítvány, EASA Open Category. Lakott területen és repülőtér közelében mi intézzük az engedélyezést.",
                tags: ["A2 CofC", "EASA", "Biztosítva", "Open Category"],
              },
            ].map((b, i) => (
              <div
                key={i}
                className="dr-anim border border-white/[0.07] p-7 sm:p-8"
              >
                <h3 className="font-['Cormorant_Garamond'] text-[1.5rem] font-light text-white mb-3">
                  {b.title}
                </h3>
                <p className="text-[13px] text-white/35 leading-relaxed mb-4">
                  {b.desc}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {b.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[8px] tracking-[0.1em] uppercase px-2.5 py-1 border border-white/[0.08] text-white/28 font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ VIDEÓK ══ */}
      <section className="py-24 sm:py-32 bg-[#0A0807]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="dr-anim mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#C8A882]/40" />
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/50">
                Videóink
              </span>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light text-white">
              Drón showreeljeink
            </h2>
          </div>
          <div className="dr-videos-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DRONE_VIDEOS.map((v, i) => (
              <div
                key={i}
                className="dr-video-card cursor-pointer group"
                onClick={() => setVideoOpen(v.id)}
              >
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "16/9" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.thumb}
                    alt={v.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#0A0807]/40 group-hover:bg-[#0A0807]/20 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-[#C8A882]/40 bg-[#C8A882]/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-[#C8A882] group-hover:bg-[#C8A882]/20">
                      <svg
                        viewBox="0 0 24 24"
                        fill="white"
                        className="w-5 h-5 ml-0.5"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                  {[
                    "top-2 left-2 border-t border-l",
                    "top-2 right-2 border-t border-r",
                    "bottom-2 left-2 border-b border-l",
                    "bottom-2 right-2 border-b border-r",
                  ].map((cls, j) => (
                    <div
                      key={j}
                      className={`absolute w-4 h-4 ${cls} border-[#C8A882]/20`}
                    />
                  ))}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-3"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                    }}
                  >
                    <div className="text-[8px] tracking-[0.15em] uppercase text-[#C8A882]/55 font-mono">
                      {v.location}
                    </div>
                  </div>
                </div>
                <div className="pt-3">
                  <h3 className="font-['Cormorant_Garamond'] text-[1.1rem] font-light text-white/75 group-hover:text-white transition-colors">
                    {v.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Videó modal */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[300] bg-black/97 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setVideoOpen(null)}
        >
          <div
            className="relative w-full max-w-5xl"
            style={{ aspectRatio: "16/9" }}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoOpen}?autoplay=1&rel=0&modestbranding=1`}
              title="Drón videó"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <button
            className="absolute top-5 right-5 text-white/50 hover:text-white p-2 transition-colors"
            onClick={() => setVideoOpen(null)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-8 h-8"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* ══ USE CASES ══ */}
      <section className="py-24 sm:py-32 bg-[#0D0B08]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="dr-anim mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#C8A882]/40" />
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/50">
                Alkalmazások
              </span>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light text-white">
              Mikor érdemes
              <br />
              <em className="not-italic text-[#C8A882]">
                drón felvételt rendelni?
              </em>
            </h2>
          </div>
          <div className="dr-usecases-grid grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.04]">
            {USE_CASES.map((uc, i) => (
              <div
                key={i}
                className="dr-usecase relative overflow-hidden group"
                style={{ minHeight: "260px" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uc.thumb}
                  alt={uc.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(13,11,8,0.92) 0%, rgba(13,11,8,0.4) 55%, transparent 100%)",
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-8">
                  <div className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/45 mb-2 font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-white mb-2">
                    {uc.title}
                  </h3>
                  <p className="text-[13px] text-white/45 leading-relaxed max-w-xs">
                    {uc.desc}
                  </p>
                </div>
                {[
                  "top-4 left-4 border-t border-l",
                  "top-4 right-4 border-t border-r",
                ].map((cls, j) => (
                  <div
                    key={j}
                    className={`absolute w-5 h-5 ${cls} border-white/[0.08] group-hover:border-[#C8A882]/25 transition-colors duration-300`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-24 sm:py-32 bg-[#0A0807]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
            <div className="lg:col-span-4 dr-anim">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C8A882]/40" />
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/50">
                  GYIK
                </span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3rem)] font-light text-white leading-[1.1] mb-6">
                Kérdések
                <br />
                <em className="not-italic text-[#C8A882]">drón repülésről</em>
              </h2>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-white/28 border-b border-white/10 pb-0.5 hover:text-white/55 transition-all"
              >
                Kérdezz tőlünk →
              </Link>
            </div>
            <div className="lg:col-span-8">
              {FAQS.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
