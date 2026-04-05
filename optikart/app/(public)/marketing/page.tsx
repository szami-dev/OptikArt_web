"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ── Adatok ───────────────────────────────────────────────────

const services = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
    platform: "Instagram",
    title: "Feed & Reels",
    desc: "Vizuálisan koherens feed, profi Reels videók – minden poszt tudatos design döntés.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
    platform: "TikTok",
    title: "Short-form videók",
    desc: "Trend-alapú, natív TikTok tartalom – gyors vágás, jó zene, értéket adó szöveg.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    platform: "Facebook",
    title: "Kampány tartalom",
    desc: "Fizetett hirdetésekhez optimalizált fotó és videó anyagok, különböző formátumokban.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
      </svg>
    ),
    platform: "LinkedIn",
    title: "Brand storytelling",
    desc: "Professzionális, hiteles tartalom – a brand személyiségét megmutatja emberi oldalról.",
  },
];

const process = [
  { n: "01", title: "Brand audit", desc: "Megnézzük hol tartotok most, mi az amit kommunikálni kell, és mi hiányzik a jelenlétből." },
  { n: "02", title: "Tartalom stratégia", desc: "Témák, formátumok, hangnem, posztolási frekvencia — minden le van tervezve előre." },
  { n: "03", title: "Forgatási nap", desc: "Egy nap alatt hetek fotó és videó anyagát gyártjuk le. Hatékony, fókuszált, profi." },
  { n: "04", title: "Szerkesztés & szövegírás", desc: "Minden anyag utómunkával, caption-nel, hashtag stratégiával kerül átadásra." },
  { n: "05", title: "Ütemezés & riport", desc: "Feltöltjük helyetted, és havi riportban mutatjuk az eredményeket." },
];

// Phone mockup képek – cseréld ki a sajátjaidra
// Cseréld: src="/marketing/post1.jpg"
const phonePosts = [
  { src: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80", type: "photo", likes: "1.2K", label: "Termékfotó" },
  { src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80", type: "reel", likes: "4.8K", label: "Reel" },
  { src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80", type: "photo", likes: "2.1K", label: "Esemény" },
  { src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80", type: "reel", likes: "6.3K", label: "Portré reel" },
  { src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80", type: "photo", likes: "3.5K", label: "Esküvő" },
];

// Referencia munkák – Instagram grid stílus
// Cseréld: src="/marketing/ref1.jpg"
const refWorks = [
  { src: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=500&q=75", brand: "@luxebrand.hu", type: "Termék" },
  { src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=75", brand: "@techstartup.hu", type: "B2B" },
  { src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=75", brand: "@wellness.hu", type: "Brand" },
  { src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=75", brand: "@eventhouse.hu", type: "Esemény" },
  { src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=75", brand: "@retailchain.hu", type: "Kampány" },
  { src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&q=75", brand: "@agencyhu", type: "Social" },
  { src: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=500&q=75", brand: "@fashionbrand.hu", type: "Reel" },
  { src: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=75", brand: "@foodbrand.hu", type: "Story" },
  { src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&q=75", brand: "@consultinghu", type: "LinkedIn" },
];

// ── Phone mockup komponens ─────────────────────────────────
function PhoneMockup({ post, delay = 0, offset = 0 }: {
  post: typeof phonePosts[0];
  delay?: number;
  offset?: number;
}) {
  return (
    <div
      className="mk-phone shrink-0 relative"
      style={{ transform: `translateY(${offset}px)` }}
    >
      {/* Phone keret */}
      <div className="relative bg-[#1A1510] rounded-[2.8rem] p-[3px] shadow-2xl" style={{ width: "180px" }}>
        {/* Belső keret */}
        <div className="bg-[#0D0B08] rounded-[2.5rem] overflow-hidden" style={{ aspectRatio: "9/19.5" }}>

          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-1">
            <span className="text-white/40 text-[8px]">9:41</span>
            <div className="w-16 h-3.5 bg-[#1A1510] rounded-full" /> {/* dynamic island */}
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-1.5 rounded-sm bg-white/40" />
              <div className="w-2 h-1.5 rounded-sm bg-white/30" />
              <div className="w-1.5 h-1.5 rounded-sm bg-white/20" />
            </div>
          </div>

          {/* Instagram UI */}
          <div className="px-3 pb-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#C8A882] to-[#8B5E3C]" />
                <span className="text-white/70 text-[7px] font-medium">optikart.hu</span>
              </div>
              <span className="text-white/30 text-[8px]">···</span>
            </div>

            {/* Kép */}
            <div className="relative overflow-hidden rounded-sm" style={{ aspectRatio: "1/1" }}>
              <Image
                src={post.src}
                alt={post.label}
                fill
                className="object-cover"
                sizes="180px"
              />
              {/* Reel overlay */}
              {post.type === "reel" && (
                <div className="absolute inset-0 flex items-end justify-end p-2">
                  <div className="flex items-center gap-1 bg-black/40 rounded px-1.5 py-0.5">
                    <svg viewBox="0 0 24 24" fill="white" className="w-2.5 h-2.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span className="text-white text-[7px]">Reel</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-3 h-3 opacity-60">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-3 h-3 opacity-60">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-3 h-3 opacity-60">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-3 h-3 opacity-40">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>

            {/* Likes + caption */}
            <div className="mt-1">
              <span className="text-white/70 text-[7px] font-semibold">{post.likes} kedvelés</span>
              <div className="text-white/40 text-[6.5px] mt-0.5 leading-tight truncate">
                <span className="text-white/60 font-medium">optikart.hu </span>
                {post.label} ✨ #contentcreation
              </div>
            </div>
          </div>
        </div>

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#1A1510] rounded-b-2xl" />
      </div>
    </div>
  );
}

// ── Fő marketing oldal ───────────────────────────────────────
export default function MarketingPage() {
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

        // ── Hero animáció ──────────────────────────────────
        const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
        heroTl
          .fromTo(".mk-eyebrow", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 })
          .fromTo(".mk-title-word", { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.1, duration: 1 }, 0.3)
          .fromTo(".mk-hero-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, 0.7)
          .fromTo(".mk-hero-cta", { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.6 }, 0.9)
          .fromTo(".mk-phone", { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.9, ease: "back.out(1.2)" }, 0.5);

        // ── Ticker szalag folyamatos animáció ──────────────
        if (tickerRef.current) {
          const tickerWidth = tickerRef.current.scrollWidth / 2;
          gsap.to(tickerRef.current, {
            x: -tickerWidth,
            duration: 20,
            ease: "none",
            repeat: -1,
          });
        }

        // ── Szolgáltatás kártyák ───────────────────────────
        gsap.from(".mk-service-card", {
          opacity: 0, y: 16, stagger: 0.08, duration: 0.7, ease: "power2.out", immediateRender: false,
          scrollTrigger: { trigger: ".mk-services", start: "top 92%" },
        });

        // ── Folyamat lépések ───────────────────────────────
        gsap.from(".mk-step", {
          opacity: 0, x: -10, stagger: 0.1, duration: 0.6, ease: "power2.out", immediateRender: false,
          scrollTrigger: { trigger: ".mk-process", start: "top 92%" },
        });

        // ── Ref grid ───────────────────────────────────────
        gsap.from(".mk-ref-cell", {
          opacity: 0, y: 12, stagger: 0.03, duration: 0.5, ease: "power2.out", immediateRender: false,
          scrollTrigger: { trigger: ".mk-refs", start: "top 92%" },
        });

        // ── Split titles ───────────────────────────────────
        document.querySelectorAll(".mk-split").forEach((el) => {
          const split = new SplitText(el, { type: "lines" });
          gsap.from(split.lines, {
            opacity: 0, y: 14, stagger: 0.08, duration: 0.7, ease: "power2.out", immediateRender: false,
            scrollTrigger: { trigger: el, start: "top 94%" },
          });
        });

        // ── Stats számláló ─────────────────────────────────
        document.querySelectorAll(".mk-counter").forEach((el) => {
          const target = parseInt(el.getAttribute("data-target") || "0");
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target, duration: 2, ease: "power2.out",
            onUpdate: () => { el.textContent = Math.round(obj.val) + (el.getAttribute("data-suffix") || ""); },
            immediateRender: false,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });

      }, rootRef);
    }

    init();
    return () => { mounted = false; ctx?.revert(); };
  }, []);

  return (
    <div ref={rootRef} className="bg-white overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO
          Bal: szöveg + CTA
          Jobb: lebegő phone mockupok
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen bg-white overflow-hidden flex items-center">

        {/* Háttér – finom dot grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(#C8A882 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }} />

        {/* Gradient overlay – bal oldal fehér */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent pointer-events-none" style={{ zIndex: 1 }} />

        <div className="relative w-full max-w-7xl mx-auto px-8 lg:px-16 py-24" style={{ zIndex: 2 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Bal: szöveg */}
            <div className="flex flex-col gap-7">

              <div className="mk-eyebrow opacity-0 flex items-center gap-3">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[9px] tracking-[0.3em] uppercase text-[#A08060]">OptikArt · Social Media</span>
              </div>

              {/* Platform badge-ek */}
              <div className="mk-eyebrow opacity-0 flex flex-wrap gap-2">
                {["Instagram", "TikTok", "Facebook", "LinkedIn"].map((p) => (
                  <span key={p} className="text-[9px] tracking-[0.1em] uppercase px-3 py-1.5 bg-[#FAF8F4] border border-[#EDE8E0] text-[#A08060]">
                    {p}
                  </span>
                ))}
              </div>

              <div
                className="font-['Cormorant_Garamond'] font-thin text-[#1A1510] leading-[0.88] tracking-[-0.02em]"
                style={{ fontSize: "clamp(3rem, 6.5vw, 7rem)" }}
              >
                <div className="mk-title-word opacity-0 overflow-hidden"><span className="block">Content,</span></div>
                <div className="mk-title-word opacity-0 overflow-hidden"><span className="block">ami</span></div>
                <div className="mk-title-word opacity-0 overflow-hidden">
                  <em className="block not-italic text-[#C8A882]">megállít.</em>
                </div>
              </div>

              <p className="mk-hero-sub opacity-0 text-[14px] font-light text-[#7A6A58] leading-[1.9] max-w-sm">
                Professzionális fotó és short-form videó tartalom, amit az algoritmus szeret és az emberek megállnak megnézni.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/contact" className="mk-hero-cta opacity-0 bg-[#1A1510] text-white text-[11px] tracking-[0.18em] uppercase px-7 py-4 hover:bg-[#C8A882] transition-all duration-300 whitespace-nowrap">
                  Ajánlatot kérek
                </Link>
                <a href="#folyamat" className="mk-hero-cta opacity-0 text-[11px] tracking-[0.14em] uppercase text-[#7A6A58] border-b border-[#C8A882]/40 pb-0.5 hover:text-[#1A1510] transition-all whitespace-nowrap">
                  Hogyan dolgozunk →
                </a>
              </div>

              {/* Stats */}
              <div className="mk-hero-cta opacity-0 flex gap-8 pt-4 border-t border-[#EDE8E0]">
                {[
                  { target: 40, suffix: "+", label: "Ügyfél" },
                  { target: 500, suffix: "+", label: "Poszt/hó" },
                  { target: 2, suffix: "M+", label: "Elérés" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-['Cormorant_Garamond'] text-[1.8rem] font-light text-[#C8A882] leading-none">
                      <span className="mk-counter" data-target={s.target} data-suffix={s.suffix}>0{s.suffix}</span>
                    </div>
                    <div className="text-[8px] tracking-[0.15em] uppercase text-[#A08060] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Jobb: phone mockupok */}
            <div className="hidden lg:flex items-center justify-center gap-4 py-10">
              {phonePosts.slice(0, 3).map((post, i) => (
                <PhoneMockup
                  key={i}
                  post={post}
                  delay={i * 0.1}
                  offset={i === 1 ? -30 : i === 2 ? 20 : 0}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TICKER SZALAG
      ══════════════════════════════════════════ */}
      <div className="bg-[#1A1510] py-3 overflow-hidden border-y border-[#C8A882]/10">
        <div ref={tickerRef} className="flex items-center gap-0 whitespace-nowrap">
          {/* Duplikálva a végtelen scrollhoz */}
          {[...Array(2)].map((_, di) => (
            <div key={di} className="flex items-center gap-0">
              {["Content Creation", "Reels", "Short-form Video", "Brand Photography", "Social Strategy", "Post Scheduling", "Hashtag Research", "Analytics & Reports", "Story Content", "TikTok Videos"].map((item, i) => (
                <div key={i} className="flex items-center">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-[#C8A882]/50 px-8 py-0.5">{item}</span>
                  <span className="text-[#C8A882]/20 text-[8px]">◆</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SZOLGÁLTATÁSOK – platform kártyák
      ══════════════════════════════════════════ */}
      <section className="mk-services py-28 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">

          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-[#C8A882]" />
            <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Platformok</span>
          </div>
          <h2 className="mk-split font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] text-[#1A1510] mb-14">
            Ahol megtalálják<br />
            <em className="not-italic text-[#C8A882]">a te ügyfeleid</em>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((s, i) => (
              <div
                key={i}
                className="mk-service-card group bg-white border border-[#EDE8E0] p-7 hover:border-[#C8A882]/40 hover:shadow-lg transition-all duration-300 flex flex-col gap-5"
              >
                <div className="w-11 h-11 border border-[#EDE8E0] flex items-center justify-center text-[#C8A882] group-hover:bg-[#1A1510] group-hover:border-[#1A1510] group-hover:text-[#C8A882] transition-all duration-300">
                  {s.icon}
                </div>
                <div>
                  <div className="text-[9px] tracking-[0.18em] uppercase text-[#C8A882] mb-2">{s.platform}</div>
                  <h3 className="font-['Cormorant_Garamond'] text-[1.4rem] font-light text-[#1A1510] mb-2">{s.title}</h3>
                  <p className="text-[12px] font-light text-[#7A6A58] leading-[1.8]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CONTENT SHOWCASE
          Instagram grid imitáció – referencia munkák
      ══════════════════════════════════════════ */}
      <section className="mk-refs py-28 bg-white">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">

          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Portfólió</span>
              </div>
              <h2 className="mk-split font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] text-[#1A1510]">
                Brandek,<br />
                <em className="not-italic text-[#C8A882]">akiknek dolgoztunk</em>
              </h2>
            </div>

            {/* "Instagram profil" fejléc */}
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C8A882] to-[#8B5E3C] flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">O</span>
                </div>
                <span className="text-[12px] font-medium text-[#1A1510]">optikart.hu</span>
              </div>
              <div className="flex gap-4 text-center">
                <div><div className="font-semibold text-[#1A1510] text-[12px]">86</div><div className="text-[9px] text-[#A08060]">poszt</div></div>
                <div><div className="font-semibold text-[#1A1510] text-[12px]">4.2K</div><div className="text-[9px] text-[#A08060]">követő</div></div>
              </div>
            </div>
          </div>

          {/* 3×3 Instagram-szerű grid */}
          <div className="grid grid-cols-3 gap-1">
            {refWorks.map((work, i) => (
              <div
                key={i}
                className="mk-ref-cell relative overflow-hidden group cursor-pointer"
                style={{ aspectRatio: "1/1" }}
              >
                <Image
                  src={work.src}
                  alt={work.brand}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 33vw, 25vw"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#1A1510]/0 group-hover:bg-[#1A1510]/60 transition-all duration-400 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-3">
                    <div className="text-white font-['Cormorant_Garamond'] text-[1rem] font-light">{work.brand}</div>
                    <div className="text-[#C8A882]/80 text-[9px] tracking-[0.15em] uppercase mt-1">{work.type}</div>
                  </div>
                </div>

                {/* Reel ikon ha videó */}
                {i % 3 === 1 && (
                  <div className="absolute top-2 right-2 z-10">
                    <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 drop-shadow-md opacity-80">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOLYAMAT
      ══════════════════════════════════════════ */}
      <section id="folyamat" className="mk-process py-28 bg-[#1A1510] relative overflow-hidden">

        {/* Háttér pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(#C8A882 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }} />

        <div className="relative max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-[#C8A882]/50" />
            <span className="text-[10px] tracking-[0.22em] uppercase text-[#C8A882]/50">Hogyan dolgozunk</span>
          </div>
          <h2 className="mk-split font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] text-white mb-16">
            Egy forgatási nap,<br />
            <em className="not-italic text-[#C8A882]">hetek tartalma</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            {process.map((step, i) => (
              <div key={i} className="mk-step relative">
                {/* Összekötő vonal desktop */}
                {i < process.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-1/2 w-full h-px bg-[#C8A882]/15" style={{ zIndex: 0 }} />
                )}

                <div className="relative flex flex-col items-start md:items-center text-left md:text-center gap-4 px-0 md:px-4 pb-10 md:pb-0" style={{ zIndex: 1 }}>
                  {/* Számozott pont */}
                  <div className="w-10 h-10 border border-[#C8A882]/30 flex items-center justify-center bg-[#1A1510] shrink-0">
                    <span className="font-['Cormorant_Garamond'] text-[1rem] font-light text-[#C8A882]">{step.n}</span>
                  </div>

                  <div>
                    <h3 className="font-['Cormorant_Garamond'] text-[1.1rem] font-light text-white mb-2">{step.title}</h3>
                    <p className="text-[11px] font-light text-white/35 leading-[1.8]">{step.desc}</p>
                  </div>
                </div>

                {/* Függőleges vonal mobil */}
                {i < process.length - 1 && (
                  <div className="md:hidden ml-5 w-px h-8 bg-[#C8A882]/15 mb-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PHONE SHOWCASE – 2. sor, mozgó
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-[#FAF8F4] overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-[#C8A882]" />
            <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Content példák</span>
          </div>
        </div>

        {/* Görgetős phone sor */}
        <div className="flex gap-5 px-8 lg:px-16 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory">
          {phonePosts.map((post, i) => (
            <div key={i} className="snap-start shrink-0">
              <PhoneMockup post={post} offset={i % 2 === 0 ? 0 : -15} />
            </div>
          ))}
          {/* Extra üres space a végén */}
          <div className="w-8 shrink-0" />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section className="py-28 bg-white relative overflow-hidden">

        {/* Dekoratív háttér – nagy elmosott arany kör */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #C8A882 0%, transparent 70%)" }}
        />

        <div className="relative max-w-2xl mx-auto px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#C8A882]" />
            <span className="text-[9px] tracking-[0.25em] uppercase text-[#A08060]">Dolgozzunk együtt</span>
            <div className="w-8 h-px bg-[#C8A882]" />
          </div>

          <h2 className="font-['Cormorant_Garamond'] text-[clamp(2.5rem,5vw,4.5rem)] font-thin leading-[1] text-[#1A1510] mb-6">
            Tegyük a brandedből<br />
            <em className="not-italic text-[#C8A882]">követni való tartalmat</em>
          </h2>

          <p className="text-[14px] text-[#7A6A58] leading-[1.9] mb-10 max-w-md mx-auto">
            Írd le röviden mit csinál a céged és mik a céljaid — visszajelzünk 24 órán belül.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="bg-[#1A1510] text-white text-[11px] tracking-[0.18em] uppercase px-10 py-4 hover:bg-[#C8A882] transition-colors duration-300 whitespace-nowrap">
              Ajánlatot kérek
            </Link>
            <a href="tel:+36301234567" className="border border-[#EDE8E0] text-[#7A6A58] text-[11px] tracking-[0.15em] uppercase px-8 py-4 hover:border-[#C8A882]/50 hover:text-[#1A1510] transition-all duration-300 whitespace-nowrap">
              +36 30 123 4567
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}