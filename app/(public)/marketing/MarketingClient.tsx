"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";



// ── Adatok ──────────────────────────────────────────────────

const reels = [
  {
    youtubeId: "IvfHIlNRmMg",
    thumb:
      "/gallery/marketing/siriusjanuar-33.JPG",
    brand: "@siriusclub",
    type: "Food Reel",
    views: "100K",
    duration: "0:28",
  },
  {
    youtubeId: "N2j5upS8ka0",
    thumb:
      "/gallery/marketing/werk-6.JPG",
    brand: "@akvariumauto",
    type: "Car Reel",
    views: "60K",
    duration: "0:15",
  },
  {
    youtubeId: "yg86CmSiWOY",
    thumb:
      "/gallery/marketing/siriusjanuar-28.JPG",
    brand: "@siriusclub",
    type: "Story",
    views: "50K",
    duration: "0:32",
  },
  {
    youtubeId: "gcYvTwkkdfA",
    thumb:
      "/gallery/marketing/siriusdec-64.JPG",
    brand: "@siriusclub",
    type: "Food Reel",
    views: "76K",
    duration: "0:20",
  },
  {
    youtubeId: "fkkjgAv3YRs",
    thumb:
      "/gallery/marketing/siriusaprilis-16.JPG",
    brand: "@siriusclub",
    type: "Event",
    views: "30K",
    duration: "0:45",
  },
  {
    youtubeId: "yH1-oXAMWUI",
    thumb:
      "/gallery/marketing/pellikan_aprilis-7.JPG",
    brand: "@pellikanbirtok",
    type: "TikTok Ad",
    views: "100K",
    duration: "0:18",
  },
];

const platforms = [
  {
    name: "TikTok",
    bg: "#111",
    accent: "#fff",
    stat: "15K",
    statLabel: "avg. elérés",
  },
  {
    name: "Instagram",
    bg: "#E1306C22",
    accent: "#E1306C",
    stat: "10K",
    statLabel: "avg. elérés",
  },
  {
    name: "YouTube",
    bg: "#FF000022",
    accent: "#FF0000",
    stat: "5K",
    statLabel: "avg. nézés",
  },
  {
    name: "Facebook",
    bg: "#1877F222",
    accent: "#1877F2",
    stat: "20K",
    statLabel: "avg. elérés",
  },
];

const process = [
  {
    n: "01",
    title: "Brief & Stratégia",
    desc: "Célközönség, hangnem, platformok, posztolási frekvencia — minden le van tervezve előre.",
  },
  {
    n: "02",
    title: "Forgatási nap",
    desc: "Egy nap alatt hetek tartalmát gyártjuk le. Hatékony, fókuszált, profi stábbal.",
  },
  {
    n: "03",
    title: "Edit & Color",
    desc: "Natív platform vágás, trending hangok, feliratok, color grading — minden benne van.",
  },
  {
    n: "04",
    title: "Ütemezés & Riport",
    desc: "Feltöltjük helyetted, mérjük az eredményeket, optimalizálunk a következő fordulóra.",
  },
];

// ── Reel kártya ───────────────────────────────────────────────
function ReelCard({
  reel,
  className = "",
}: {
  reel: (typeof reels)[0];
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={`relative overflow-hidden group cursor-pointer ${className}`}
      style={{ aspectRatio: "9/16" }}
      onClick={() => setPlaying(true)}
    >
      {!playing ? (
        <>
          <Image
            src={reel.thumb}
            alt={reel.brand}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="300px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          {/* Play */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 ml-0.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>

          {/* Reel badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1">
            <svg viewBox="0 0 24 24" fill="white" className="w-2 h-2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span className="text-[7px] tracking-[0.08em] text-white/70 uppercase">
              Reel
            </span>
          </div>

          {/* Meta alul */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[8px] tracking-[0.1em] uppercase text-[#C8A882]/70 mb-0.5">
                  {reel.type}
                </div>
                <div className="text-[11px] font-light text-white">
                  {reel.brand}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-white/35 tabular-nums">
                  {reel.duration}
                </div>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-2.5 h-2.5 text-white/35"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="text-[9px] text-white/40">{reel.views}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${reel.youtubeId}?autoplay=1&rel=0`}
          title={reel.brand}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  );
}

// ── Kiemelt videó ─────────────────────────────────────────────
function FeaturedVideo() {
  const [playing, setPlaying] = useState(false);
  return (
    <div
      className="relative overflow-hidden bg-[#141210]"
      style={{ aspectRatio: "16/9" }}
    >
      {!playing ? (
        <>
          <Image
            src="/gallery/marketing/pellikan_aprilis-9.JPG"
            alt="Forgatás"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-[#080808]/40" />
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className="w-20 h-20 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
              <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </button>
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              className="w-3 h-3 opacity-50"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[10px] text-white/50 tabular-nums">3:24</span>
          </div>
        </>
      ) : (
        <iframe
          src="https://www.youtube.com/embed/EnHDwBumuqY?autoplay=1&rel=0"
          title="Forgatás"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  );
}

// ── Fő oldal ──────────────────────────────────────────────────
export default function MarketingClient() {
  
  const rootRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: any;
    let mounted = true;

    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText } = await import("gsap/SplitText");
      gsap.registerPlugin(ScrollTrigger, SplitText);
      await document.fonts.ready;
      if (!mounted) return;

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(
          ".mk-eyebrow",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6 },
        )
          .fromTo(
            ".mk-title > span",
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 1.1 },
            0.2,
          )
          .fromTo(
            ".mk-sub",
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.7 },
            0.6,
          )
          .fromTo(
            ".mk-cta",
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, stagger: 0.07, duration: 0.6 },
            0.8,
          )
          .fromTo(
            ".mk-hero-reel",
            { opacity: 0, y: 30, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              stagger: 0.1,
              duration: 0.9,
              ease: "power2.out",
            },
            0.4,
          );

        if (tickerRef.current) {
          const w = tickerRef.current.scrollWidth / 2;
          gsap.to(tickerRef.current, {
            x: -w,
            duration: 18,
            ease: "none",
            repeat: -1,
          });
        }

        gsap.from(".mk-reel-card", {
          opacity: 0,
          y: 20,
          stagger: 0.07,
          duration: 0.7,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: { trigger: ".mk-reels-section", start: "top 92%" },
        });

        gsap.from(".mk-platform-card", {
          opacity: 0,
          y: 16,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: { trigger: ".mk-platforms", start: "top 92%" },
        });

        gsap.from(".mk-step", {
          opacity: 0,
          x: -12,
          stagger: 0.1,
          duration: 0.6,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: { trigger: ".mk-process", start: "top 92%" },
        });

        document.querySelectorAll(".mk-split").forEach((el) => {
          const split = new SplitText(el, { type: "lines" });
          gsap.from(split.lines, {
            opacity: 0,
            y: 14,
            stagger: 0.08,
            duration: 0.7,
            ease: "power2.out",
            immediateRender: false,
            scrollTrigger: { trigger: el, start: "top 94%" },
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
    <div ref={rootRef} className="bg-[#080808] overflow-x-hidden">
      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "100svh" }}
      >
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.08] rounded-full"
            style={{
              background:
                "radial-gradient(circle, #C8A882 0%, transparent 65%)",
              transform: "translate(-30%, -50%)",
            }}
          />
        </div>

        <div
          className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full"
          style={{
            minHeight: "100svh",
            display: "flex",
            alignItems: "center",
            paddingTop: "5rem",
            paddingBottom: "5rem",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
            {/* Bal: szöveg */}
            <div className="flex flex-col gap-6">
              <div className="mk-eyebrow opacity-0 flex items-center gap-3">
                <div className="w-6 h-px bg-[#C8A882]" />
                <span className="text-[9px] tracking-[0.3em] uppercase text-[#C8A882]/50">
                  OptikArt · Social Media
                </span>
              </div>

              <div className="mk-eyebrow opacity-0 flex flex-wrap gap-2">
                {[
                  { n: "TikTok", c: "#fff" },
                  { n: "Instagram", c: "#E1306C" },
                  { n: "YouTube", c: "#FF0000" },
                  { n: "Facebook", c: "#1877F2" },
                ].map((p) => (
                  <div
                    key={p.n}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 bg-white/[0.04]"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: p.c }}
                    />
                    <span className="text-[9px] tracking-[0.1em] uppercase text-white/40">
                      {p.n}
                    </span>
                  </div>
                ))}
              </div>

              <h1
                className="mk-title font-['Cormorant_Garamond'] font-thin text-white leading-[0.87] tracking-[-0.03em]"
                style={{ fontSize: "clamp(3rem, 7vw, 7.5rem)" }}
              >
                <span className="block opacity-0 overflow-hidden">
                  <span className="block">Content,</span>
                </span>
                <span className="block opacity-0 overflow-hidden">
                  <span className="block">ami</span>
                </span>
                <span className="block opacity-0 overflow-hidden">
                  <em className="block not-italic text-[#C8A882]">megállít.</em>
                </span>
              </h1>

              <p className="mk-sub opacity-0 text-[14px] font-light text-white/40 leading-[1.9] max-w-sm">
                Professzionális short-form videó és fotó tartalom — amit az
                algoritmus szeret és az emberek végignéznek.
              </p>

              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link
                  href="/contact"
                  className="mk-cta opacity-0 bg-white text-[#080808] text-[11px] tracking-[0.18em] uppercase px-7 py-3.5 hover:bg-[#C8A882] transition-all duration-300 whitespace-nowrap font-medium"
                >
                  Ajánlatot kérek
                </Link>
                <a
                  href="#reels"
                  className="mk-cta opacity-0 text-[11px] tracking-[0.14em] uppercase text-white/35 border-b border-white/12 pb-0.5 hover:text-white/60 transition-all whitespace-nowrap self-end"
                >
                  Munkáink →
                </a>
              </div>

              <div className="mk-cta opacity-0 flex gap-7 pt-5 border-t border-white/[0.06]">
                {[
                  { n: "40+", l: "Brand ügyfél" },
                  { n: "500+", l: "Poszt/hó" },
                  { n: "2M+", l: "Összesített elérés" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-['Cormorant_Garamond'] text-[1.6rem] sm:text-[1.8rem] font-light text-[#C8A882] leading-none">
                      {s.n}
                    </div>
                    <div className="text-[8px] tracking-[0.12em] uppercase text-white/25 mt-0.5">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Jobb: 2 reel mobil-szerűen */}
            <div className="flex gap-3 sm:gap-4 justify-center lg:justify-end items-end">
              <div
                className="mk-hero-reel opacity-0 flex-1 max-w-[180px] lg:max-w-[200px]"
                style={{ marginTop: "3rem" }}
              >
                <ReelCard reel={reels[0]} />
              </div>
              <div
                className="mk-hero-reel opacity-0 flex-1 max-w-[180px] lg:max-w-[200px]"
                style={{ marginBottom: "3rem" }}
              >
                <ReelCard reel={reels[3]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TICKER ══════════════════════════════════════════════ */}
      <div className="border-y border-white/[0.05] py-3 overflow-hidden bg-[#0C0A08]">
        <div ref={tickerRef} className="flex items-center whitespace-nowrap">
          {[...Array(2)].map((_, di) => (
            <div key={di} className="flex items-center">
              {[
                "Short-form Video",
                "Brand Reels",
                "TikTok Content",
                "Instagram Reels",
                "Content Strategy",
                "Color Grading",
                "Story Content",
                "Paid Ad Creatives",
                "Post Scheduling",
                "YouTube Shorts",
              ].map((item, i) => (
                <div key={i} className="flex items-center">
                  <span className="text-[10px] tracking-[0.22em] uppercase text-white/15 px-8">
                    {item}
                  </span>
                  <span className="text-[#C8A882]/15 text-[8px]">◆</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ REELS GRID ══════════════════════════════════════════ */}
      <section id="reels" className="mk-reels-section py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-14">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px bg-[#C8A882]" />
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/50">
                  Videó munkáink
                </span>
              </div>
              <h2 className="mk-split font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light leading-[1.05] text-white">
                Reels &<br />
                <em className="not-italic text-[#C8A882]">Short-form videók</em>
              </h2>
            </div>
            <div className="flex items-center gap-2 text-white/25 text-[11px]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span className="tracking-[0.06em]">Kattints a lejátszáshoz</span>
            </div>
          </div>

          {/* Desktop: 3 oszlopos masonry */}
          <div className="hidden sm:grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-3">
              <div className="mk-reel-card">
                <ReelCard reel={reels[0]} />
              </div>
              <div className="mk-reel-card">
                <ReelCard reel={reels[4]} />
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-8">
              <div className="mk-reel-card">
                <ReelCard reel={reels[1]} />
              </div>
              <div className="mk-reel-card">
                <ReelCard reel={reels[2]} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="mk-reel-card">
                <ReelCard reel={reels[5]} />
              </div>
              <div className="mk-reel-card">
                <ReelCard reel={reels[3]} />
              </div>
            </div>
          </div>

          {/* Mobil: vízszintes görgetős sor */}
          <div className="sm:hidden flex gap-3 overflow-x-auto pb-3 -mx-6 px-6 scrollbar-none snap-x snap-mandatory">
            {reels.map((reel, i) => (
              <div
                key={i}
                className="mk-reel-card snap-start shrink-0"
                style={{ width: "190px" }}
              >
                <ReelCard reel={reel} />
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 flex justify-center">
            <Link
              href="/references"
              className="inline-flex items-center gap-3 text-[11px] tracking-[0.14em] uppercase text-white/25 border-b border-white/[0.08] pb-0.5 hover:text-white/50 hover:border-white/20 transition-all"
            >
              Teljes portfólió
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-3 h-3"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ PLATFORMOK ════════════════════════════════════════ */}
      <section className="mk-platforms py-16 sm:py-20 bg-[#0C0A08]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-[#C8A882]" />
            <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/50">
              Ahol jelen vagyunk
            </span>
          </div>
          <h2 className="mk-split font-['Cormorant_Garamond'] text-[clamp(1.8rem,3.5vw,3rem)] font-light text-white leading-[1.05] mb-8 sm:mb-10">
            Minden platformra
            <br />
            <em className="not-italic text-[#C8A882]">natív tartalom</em>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {platforms.map((p, i) => (
              <div
                key={i}
                className="mk-platform-card relative overflow-hidden border border-white/[0.06] p-5 sm:p-6 hover:border-white/10 transition-all duration-300"
                style={{ background: p.bg }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background: p.accent }}
                />
                <div
                  className="text-[11px] tracking-[0.12em] uppercase mb-4"
                  style={{ color: p.accent }}
                >
                  {p.name}
                </div>
                <div>
                  <div className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2.2rem] font-light leading-none mb-1 text-white">
                    {p.stat}
                  </div>
                  <div className="text-[9px] tracking-[0.1em] uppercase text-white/25">
                    {p.statLabel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ KIEMELT VIDEÓ ════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-6 h-px bg-[#C8A882]" />
            <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/50">
              Kulisszák mögött
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12 items-start">
            <div className="flex flex-col gap-5">
              <h3 className="font-['Cormorant_Garamond'] text-[clamp(1.8rem,3.5vw,2.8rem)] font-light text-white leading-[1.05]">
                Hogyan néz ki
                <br />
                <em className="not-italic text-[#C8A882]">
                  egy forgatási nap?
                </em>
              </h3>
              <p className="text-[13px] font-light text-white/30 leading-[1.9]">
                Egy nap alatt gyártjuk le a havi tartalmakat. Így néz ki
                belülről.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "Brand brief & konzultáció",
                  "Helyszíni forgatás",
                  "Editing & color grading",
                  "Platform-optimalizált vágatok",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-px bg-[#C8A882]/30" />
                    <span className="text-[11px] text-white/30">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/contact"
                className="mt-2 inline-flex items-center gap-3 bg-white text-[#080808] text-[11px] tracking-[0.16em] uppercase px-6 py-3.5 hover:bg-[#C8A882] transition-all duration-300 w-fit font-medium whitespace-nowrap"
              >
                Érdekel
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3.5 h-3.5"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
            <FeaturedVideo />
          </div>
        </div>
      </section>

      {/* ══ FOLYAMAT ═════════════════════════════════════════ */}
      <section
        id="folyamat"
        className="mk-process py-20 sm:py-28 bg-[#0C0A08] relative overflow-hidden"
      >
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 font-['Cormorant_Garamond'] font-light select-none pointer-events-none text-white/[0.015]"
          style={{ fontSize: "clamp(10rem, 22vw, 22rem)", lineHeight: 1 }}
        >
          HOW
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-[#C8A882]" />
            <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/50">
              Hogyan dolgozunk
            </span>
          </div>
          <h2 className="mk-split font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.2rem)] font-light text-white leading-[1.05] mb-12 sm:mb-16">
            Egy forgatási nap,
            <br />
            <em className="not-italic text-[#C8A882]">hetek tartalma</em>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {process.map((step, i) => (
              <div key={i} className="mk-step relative">
                {i < process.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-5 left-10 h-px bg-white/[0.05]"
                    style={{ right: "-1.5rem" }}
                  />
                )}
                <div
                  className="relative flex flex-col gap-4"
                  style={{ zIndex: 1 }}
                >
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center bg-[#0C0A08] shrink-0">
                    <span className="font-['Cormorant_Garamond'] text-[0.9rem] font-light text-[#C8A882]">
                      {step.n}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[13px] font-light text-white mb-2 tracking-[0.02em]">
                      {step.title}
                    </h3>
                    <p className="text-[12px] font-light text-white/25 leading-[1.8]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-[#080808] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full opacity-[0.05]"
            style={{
              background:
                "radial-gradient(ellipse, #C8A882 0%, transparent 65%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 sm:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#C8A882]/25" />
            <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/35">
              Dolgozzunk együtt
            </span>
            <div className="w-8 h-px bg-[#C8A882]/25" />
          </div>

          <h2 className="font-['Cormorant_Garamond'] text-[clamp(2.5rem,6vw,5rem)] font-thin leading-[0.93] text-white mb-6">
            Tegyük a brandedből
            <br />
            <em className="not-italic text-[#C8A882]">
              követni való tartalmat
            </em>
          </h2>

          <p className="text-[14px] text-white/25 leading-[1.9] mb-10 max-w-md mx-auto">
            Írd le röviden mit csinál a céged — visszajelzünk 24 órán belül egy
            konkrét tervvel.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link
              href="/contact"
              className="bg-white text-[#080808] text-[11px] tracking-[0.18em] uppercase px-10 py-4 hover:bg-[#C8A882] transition-colors duration-300 text-center font-medium whitespace-nowrap"
            >
              Ajánlatot kérek
            </Link>
            <a
              href="tel:+36309221702"
              className="border border-white/[0.08] text-white/25 text-[11px] tracking-[0.15em] uppercase px-8 py-4 hover:border-white/15 hover:text-white/40 transition-all duration-300 text-center whitespace-nowrap"
            >
              +36 30 922 1702
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
