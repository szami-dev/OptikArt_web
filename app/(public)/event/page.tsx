"use client";

// app/(public)/event/page.tsx
// Design: Cinematic dark → fehér váltakozás
// GSAP: clip-path hero reveal, scrub parallax, pin + horizontal szekció,
//       SplitText, scroll counter, stagger cards
// FIX: pattanás ellen gsap.set() + visibility:hidden wrapper

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ContactSection from "@/app/components/ContactSection";
import Footer from "@/app/components/Footer";

const NAV_H = 68;

// ── Adatok ────────────────────────────────────────────────────
const eventTypes = [
  {
    title: "Céges rendezvény",
    sub: "Konferencia · Csapatépítő · Évzáró",
    desc: "Professzionális dokumentáció vállalati eseményekről. Diszkrét, de mindig ott vagyunk ahol a legjobb pillanat keletkezik.",
    img: "/gallery/event/borfesztUTSO-106.JPG",
    n: "01",
  },
  {
    title: "Koncert & Fesztivál",
    sub: "Zene · Energia · Pillanatok",
    desc: "Gyorsan változó fényviszonyok, tömeg, mozgás. Ebben otthon vagyunk — minden energiát megörökítünk.",
    img: "/gallery/event/borfesztUTSO-140.JPG",
    n: "02",
  },
  {
    title: "Magánrendezvény",
    sub: "Születésnap · Évforduló · Party",
    desc: "Intim összejövetelektől nagyobb bulikig — megörökítjük az örömöt, a nevetést és minden emlékezetes pillanatot.",
    img: "/gallery/event/borfesztUTSO-155.JPG",
    n: "03",
  },
  {
    title: "Sport & Konferencia",
    sub: "Akció · Tudás · Élmény",
    desc: "Sporteseményektől szakmai konferenciákig — gyors reflexek és precíz kompozíció. Minden pillanatot megőrzünk.",
    img: "/gallery/event/ballagaspg-192.JPG",
    n: "04",
  },
];

const gallery = [
  {
    src: "/gallery/event/borfesztUTSO-106.JPG",
    alt: "Tech Summit",
    tag: "Konferencia",
    w: "col-span-2 row-span-2",
  },
  {
    src: "/gallery/event/borfesztUTSO-140.JPG",
    alt: "Spring Festival",
    tag: "Fesztivál",
    w: "col-span-1 row-span-1",
  },
  {
    src: "/gallery/event/borfesztUTSO-155.JPG",
    alt: "Gála vacsora",
    tag: "Magán",
    w: "col-span-1 row-span-1",
  },
  {
    src: "/gallery/event/ballagaspg-192.JPG",
    alt: "Maraton 2024",
    tag: "Sport",
    w: "col-span-1 row-span-2",
  },
  {
    src: "/gallery/event/borfesztUTSO-190.JPG",
    alt: "Csapatépítő",
    tag: "Céges",
    w: "col-span-1 row-span-1",
  },
  {
    src: "/gallery/event/kurultaj-143.JPG",
    alt: "Évzáró buli",
    tag: "Party",
    w: "col-span-1 row-span-1",
  },
];

const stats = [
  { val: 80, suf: "+", label: "Rendezvény" },
  { val: 7, suf: " év", label: "Tapasztalat" },
  { val: 500, suf: "+", label: "Óra forgatás" },
  { val: 24, suf: "ó", label: "Átadás" },
];

const faqs = [
  {
    q: "Milyen méretű rendezvényt vállaltok?",
    a: "Kis intim összejövetelektől a több ezres fesztiválokig mindent vállalunk. Az ár és a csapat mérete a rendezvény nagyságától függ.",
  },
  {
    q: "Hány fotós szükséges?",
    a: "50 fő alatt általában 1 fotós elegendő. Nagyobb eseményekre 2-3 fotóst javaslunk a teljes lefedettséghez.",
  },
  {
    q: "Mikor kapjuk meg a képeket?",
    a: "Céges rendezvényeknél 5-7 munkanapon belül, magánrendezvényeknél 1 héten belül. Sürgős igény esetén 48 órás gyorsított átadás is lehetséges.",
  },
  {
    q: "Videózást is vállaltok?",
    a: "Igen! Fotó mellé videócsomag is kérhető. Aftermovie, highlight reel vagy teljes dokumentáció — mindenre van megoldásunk.",
  },
  {
    q: "Hogyan zajlik a foglalás?",
    a: "Küldj egy üzenetet a rendezvény dátumával és típusával. 24 órán belül visszajelzünk és ajánlatot küldünk.",
  },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.07]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between py-5 text-left group gap-4"
      >
        <div className="flex items-start gap-4">
          <span className="font-['Cormorant_Garamond'] text-[1rem] text-[#C8A882]/40 tabular-nums shrink-0 mt-0.5">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[14px] sm:text-[15px] font-light text-white/60 group-hover:text-white transition-colors duration-200 leading-snug">
            {q}
          </span>
        </div>
        <div
          className={`w-6 h-6 border border-white/[0.12] flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${open ? "rotate-45 border-[#C8A882]/40" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-3 h-3 text-[#C8A882]/50"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-400 ${open ? "max-h-48 pb-5" : "max-h-0"}`}
      >
        <p className="text-[13px] font-light text-white/35 leading-[1.9] pl-10 pr-6">
          {a}
        </p>
      </div>
    </div>
  );
}

export default function EventPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let ctx: any,
      mounted = true;

    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText } = await import("gsap/SplitText");
      gsap.registerPlugin(ScrollTrigger, SplitText);
      await document.fonts.ready;
      if (!mounted || !rootRef.current) return;

      // ── PATTANÁS FIX: set ELŐBB, aztán setReady(true) ──────
      gsap.set(".ev-anim", { autoAlpha: 0, y: 22 });
      gsap.set(".ev-card", { autoAlpha: 0, y: 30 });
      gsap.set(".ev-gallery-item", { autoAlpha: 0, scale: 0.97 });
      setReady(true);

      ctx = gsap.context(() => {
        // ══ HERO ANIMÁCIÓ ═══════════════════════════════════════

        // 1. Háttérkép clip-path reveal – balról jobbra
        gsap.fromTo(
          ".ev-hero-img",
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 1.6, ease: "power4.inOut" },
        );

        // 2. Overlay fade
        gsap.fromTo(
          ".ev-hero-overlay",
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.2,
            delay: 0.4, // "<0.4" helyett sima delay-t használunk, mert ez nem timeline
          },
        );

        const heroTl = gsap.timeline({
          defaults: { ease: "power3.out" },
          delay: 0.6,
        });
        heroTl
          .fromTo(
            ".ev-eyebrow",
            { autoAlpha: 0, x: -20 },
            { autoAlpha: 1, x: 0, duration: 0.7 },
          )
          .fromTo(
            ".ev-title-line",
            { yPercent: 115, autoAlpha: 0 },
            {
              yPercent: 0,
              autoAlpha: 1,
              stagger: 0.12,
              duration: 1,
              ease: "power4.out",
            },
            0.2,
          )
          .fromTo(
            ".ev-hero-desc",
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.7 },
            0.7,
          )
          .fromTo(
            ".ev-hero-btn",
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.55 },
            0.9,
          )
          .fromTo(
            ".ev-hero-stat",
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.5 },
            1.1,
          )
          .fromTo(
            ".ev-scroll-ind",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.5 },
            1.3,
          );

        // 3. Hero parallax
        gsap.to(".ev-hero-img", {
          yPercent: 14,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });

        // 4. Hero stat counter
        document.querySelectorAll(".ev-counter").forEach((el) => {
          const target = parseInt(el.getAttribute("data-val") ?? "0");
          const suf = el.getAttribute("data-suf") ?? "";
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = Math.round(obj.val) + suf;
            },
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        // ══ TÍPUSOK SZEKCIÓ ══════════════════════════════════════

        // Section title SplitText
        const typesTitleEl = rootRef.current?.querySelector(".ev-types-title");
        if (typesTitleEl) {
          const split = new SplitText(typesTitleEl, { type: "lines" });
          split.lines.forEach((line: Element) => {
            const w = document.createElement("div");
            w.style.overflow = "hidden";
            line.parentNode?.insertBefore(w, line);
            w.appendChild(line);
          });
          gsap.fromTo(
            split.lines,
            { yPercent: 110 },
            {
              yPercent: 0,
              stagger: 0.08,
              duration: 0.9,
              ease: "power3.out",
              immediateRender: false,
              scrollTrigger: {
                trigger: ".ev-types-section",
                start: "top 90%",
                once: true,
              },
            },
          );
        }

        // Kártyák – stagger animáció
        const cards = rootRef.current?.querySelectorAll(".ev-card");
        if (cards?.length) {
          gsap.to(cards, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.12,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".ev-cards-grid",
              start: "top 88%",
              once: true,
            },
          });
        }

        // ══ GALERIA ══════════════════════════════════════════════

        const galleryItems =
          rootRef.current?.querySelectorAll(".ev-gallery-item");
        if (galleryItems?.length) {
          gsap.to(galleryItems, {
            autoAlpha: 1,
            scale: 1,
            stagger: 0.07,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".ev-gallery-grid",
              start: "top 88%",
              once: true,
            },
          });
        }

        // ══ ÁLTALÁNOS SCROLL FADE ════════════════════════════════

        const animEls = rootRef.current?.querySelectorAll(".ev-anim");
        animEls?.forEach((el) => {
          gsap.to(el, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          });
        });

        // ══ CTA SZEKCIÓ PARALLAX ════════════════════════════════
        gsap.to(".ev-cta-bg", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: ".ev-cta-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
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
    <div
      ref={rootRef}
      className="bg-[#0F0D0A] overflow-x-hidden"
      style={{ visibility: ready ? "visible" : "hidden" }}
    >
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ height: "100svh", minHeight: "600px" }}
      >
        {/* Fullscreen háttérkép – clip-path animálódik */}
        <div className="ev-hero-img absolute inset-[-8%] will-change-transform">
          <Image
            src="/gallery/event/kurultaj-143.JPG"
            alt="Rendezvény fotózás"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            quality={88}
          />
        </div>

        {/* Overlay */}
        <div
          className="ev-hero-overlay absolute inset-0 z-[1]"
          style={{
            background: `
            linear-gradient(to right, rgba(15,13,10,0.97) 0%, rgba(15,13,10,0.75) 45%, rgba(15,13,10,0.25) 75%, transparent 100%),
            linear-gradient(to top, rgba(15,13,10,0.85) 0%, transparent 40%)
          `,
          }}
        />

        {/* Grain */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px",
          }}
        />

        {/* Tartalom */}
        <div className="relative z-[3] flex flex-col h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Eyebrow */}
          <div
            className="flex items-center gap-3 flex-shrink-0"
            style={{ paddingTop: `${NAV_H + 12}px` }}
          >
            <div className="w-8 h-px bg-[#C8A882]/40" />
            <span className="ev-eyebrow text-[9px] tracking-[0.3em] uppercase text-[#C8A882]/55">
              OptikArt · Rendezvény
            </span>
          </div>

          {/* Cím */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="max-w-xl">
              {/* Kis tag */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-1 rounded-full bg-[#C8A882]/60" />
                <span className="ev-eyebrow text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/50">
                  Az esemény él
                </span>
              </div>

              <h1
                className="font-['Cormorant_Garamond'] font-thin text-white leading-[0.87] tracking-[-0.03em] mb-8"
                style={{ fontSize: "clamp(3.5rem, 6vw, 8rem)" }}
              >
                <span className="block overflow-hidden">
                  <span className="ev-title-line block">Minden</span>
                </span>
                <span className="block overflow-hidden">
                  <span className="ev-title-line block">pillanat</span>
                </span>
                <span className="block overflow-hidden">
                  <em className="ev-title-line block not-italic text-[#C8A882]">
                    számít.
                  </em>
                </span>
              </h1>

              <p className="ev-hero-desc text-[13px] sm:text-[14px] font-light text-white/40 leading-[2] max-w-sm mb-8">
                Céges rendezvény, fesztivál, party vagy konferencia — mi ott
                vagyunk és megörökítjük az energiát. Gyors, precíz, profi.
              </p>

              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                <Link
                  href="/contact"
                  className="ev-hero-btn bg-white text-[#0F0D0A] text-[11px] tracking-[0.18em] uppercase px-8 py-4 hover:bg-[#C8A882] hover:text-white transition-all duration-300 whitespace-nowrap"
                >
                  Ajánlatot kérek
                </Link>
                <a
                  href="#tipusok"
                  className="ev-hero-btn text-[11px] tracking-[0.14em] uppercase text-white/35 border-b border-white/12 pb-0.5 hover:text-white hover:border-white/35 transition-all whitespace-nowrap"
                >
                  Típusok →
                </a>
              </div>
            </div>
          </div>

          {/* Stat sor alul */}
          <div className="flex-shrink-0 flex flex-wrap gap-6 sm:gap-10 lg:gap-14 pb-8 sm:pb-12 border-t border-white/[0.06] pt-5">
            {stats.map((s) => (
              <div key={s.label} className="ev-hero-stat">
                <div className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#C8A882] leading-none">
                  <span
                    className="ev-counter"
                    data-val={s.val}
                    data-suf={s.suf}
                  >
                    0{s.suf}
                  </span>
                </div>
                <div className="text-[8px] tracking-[0.18em] uppercase text-white/25 mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indikátor */}
        <div className="ev-scroll-ind absolute bottom-8 right-8 sm:right-12 flex flex-col items-center gap-2 z-[3]">
          <span
            className="text-[7px] tracking-[0.25em] uppercase text-white/20"
            style={{ writingMode: "vertical-rl" }}
          >
            Scroll
          </span>
          <div className="w-px h-10 bg-gradient-to-b from-[#C8A882]/35 to-transparent animate-[scrollPulse_2s_ease-in-out_infinite]" />
        </div>

        {/* Jobb oldali kép-szám dekor */}
        <div className="absolute bottom-8 left-6 sm:left-10 z-[3] hidden sm:block">
          <div className="font-['Cormorant_Garamond'] text-[6rem] sm:text-[8rem] font-thin text-white/[0.04] leading-none select-none">
            01
          </div>
        </div>
      </section>

      {/* ══ TÍPUSOK ═══════════════════════════════════════════ */}
      <section
        id="tipusok"
        className="ev-types-section bg-[#0F0D0A] py-24 sm:py-32"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Fejléc */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C8A882]/40" />
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/50">
                  Mivel foglalkozunk
                </span>
              </div>
              <h2 className="ev-types-title font-['Cormorant_Garamond'] text-[clamp(2.2rem,5vw,4.5rem)] font-light text-white leading-[0.95]">
                Minden típusú
                <br />
                <em className="not-italic text-[#C8A882]">
                  rendezvényre készen
                </em>
              </h2>
            </div>
            <Link
              href="/contact"
              className="ev-anim hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-white/30 border-b border-white/10 pb-0.5 hover:text-white/55 transition-all whitespace-nowrap self-end"
            >
              Ajánlatot kérek →
            </Link>
          </div>

          {/* Kártyák */}
          <div className="ev-cards-grid grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.04]">
            {eventTypes.map((ev, i) => (
              <div
                key={i}
                className="ev-card group relative overflow-hidden cursor-pointer"
                style={{ height: "clamp(260px, 35vw, 420px)" }}
              >
                <Image
                  src={ev.img}
                  alt={ev.title}
                  fill
                  className="object-cover brightness-50 group-hover:brightness-40 transition-all duration-[1.2s] group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  quality={80}
                />

                {/* Gradiens */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(15,13,10,0.95) 0%, rgba(15,13,10,0.35) 50%, transparent 100%)",
                  }}
                />

                {/* Tartalom */}
                <div className="absolute inset-0 flex flex-col justify-end p-7 sm:p-8 lg:p-10">
                  {/* Szám dekor */}
                  <div className="absolute top-5 right-6 font-['Cormorant_Garamond'] text-[3.5rem] font-thin text-white/[0.06] group-hover:text-white/[0.1] transition-colors duration-500 leading-none select-none">
                    {ev.n}
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-5 h-px bg-[#C8A882]/50 group-hover:w-8 transition-all duration-300" />
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/60">
                      {ev.sub}
                    </span>
                  </div>
                  <h3 className="font-['Cormorant_Garamond'] text-[clamp(1.5rem,3vw,2.2rem)] font-light text-white leading-tight mb-3">
                    {ev.title}
                  </h3>
                  <p className="text-[12px] sm:text-[13px] font-light text-white/0 group-hover:text-white/50 transition-all duration-500 leading-[1.8] max-w-sm translate-y-3 group-hover:translate-y-0">
                    {ev.desc}
                  </p>
                </div>

                {/* Sarok dekor */}
                {[
                  "top-4 right-4 border-t border-r",
                  "bottom-4 left-4 border-b border-l",
                ].map((cls, j) => (
                  <div
                    key={j}
                    className={`absolute w-5 h-5 ${cls} border-white/0 group-hover:border-white/20 transition-all duration-500`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS SÁV ═════════════════════════════════════════ */}
      <section className="bg-[#C8A882]/8 border-y border-[#C8A882]/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#C8A882]/8">
            {stats.map((s, i) => (
              <div
                key={i}
                className="ev-anim py-10 sm:py-12 px-6 sm:px-8 text-center bg-[#0F0D0A]/60"
              >
                <div className="font-['Cormorant_Garamond'] text-[2.8rem] sm:text-[3.2rem] font-light text-[#C8A882] leading-none mb-1">
                  <span
                    className="ev-counter"
                    data-val={s.val}
                    data-suf={s.suf}
                  >
                    0{s.suf}
                  </span>
                </div>
                <div className="text-[9px] tracking-[0.2em] uppercase text-white/30">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GALERIA ═══════════════════════════════════════════ */}
      <section className="bg-[#0F0D0A] pt-24 sm:pt-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 mb-12 sm:mb-16">
          <div className="ev-anim flex items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C8A882]/40" />
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/50">
                  Referenciák
                </span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light text-white leading-[1.1]">
                Ahol
                <br />
                <em className="not-italic text-[#C8A882]">már jártunk</em>
              </h2>
            </div>
            <Link
              href="/references"
              className="hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-white/30 border-b border-white/10 pb-0.5 hover:text-white/55 transition-all whitespace-nowrap self-end"
            >
              Teljes galéria →
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div
          className="ev-gallery-grid grid grid-cols-2 lg:grid-cols-4 gap-1"
          style={{ gridAutoRows: "clamp(130px, 18vw, 220px)" }}
        >
          {gallery.map((g, i) => (
            <div
              key={i}
              className={`ev-gallery-item relative overflow-hidden group cursor-pointer ${g.w}`}
            >
              <Image
                src={g.src}
                alt={g.alt}
                fill
                className="object-cover brightness-60 group-hover:brightness-45 transition-all duration-700 group-hover:scale-105"
                sizes="25vw"
                quality={78}
              />
              <div className="absolute inset-0 bg-[#0F0D0A]/0 group-hover:bg-[#0F0D0A]/35 transition-all duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                <p className="text-white font-['Cormorant_Garamond'] text-[1rem] font-light">
                  {g.alt}
                </p>
                <p className="text-white/45 text-[9px] tracking-[0.1em] uppercase">
                  {g.tag}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FOLYAMAT / HOW IT WORKS ════════════════════════════ */}
      <section className="bg-[#0F0D0A] py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="ev-anim mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#C8A882]/40" />
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/50">
                Hogyan dolgozunk
              </span>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light text-white leading-[1.1]">
              A rendezvény
              <br />
              <em className="not-italic text-[#C8A882]">
                dokumentálása lépésről lépésre
              </em>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04]">
            {[
              {
                n: "01",
                title: "Egyeztetés",
                desc: "Megismerjük a rendezvényt, a célokat és az elvárásokat. Személyre szabott ajánlat 24 órán belül.",
              },
              {
                n: "02",
                title: "Felkészülés",
                desc: "Helyszíni bejárás (opcionális), időbeosztás, csapat összeállítása. Mindenre felkészülünk.",
              },
              {
                n: "03",
                title: "Forgatás",
                desc: "Diszkrét, de mindenhol ott vagyunk ahol a legjobb pillanat keletkezik. Gyors és precíz.",
              },
              {
                n: "04",
                title: "Átadás",
                desc: "Szerkesztett anyag 5-7 munkanapon belül. Privát galéria, letölthető képek, videó.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="ev-anim bg-[#0F0D0A] hover:bg-[#171410] transition-colors duration-300 p-8 sm:p-10 group"
              >
                <div className="font-['Cormorant_Garamond'] text-[3.5rem] font-thin text-[#C8A882]/15 group-hover:text-[#C8A882]/30 transition-colors duration-300 leading-none mb-6">
                  {step.n}
                </div>
                <h3 className="font-['Cormorant_Garamond'] text-[1.4rem] font-light text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-[12px] text-white/35 leading-[1.8]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════════ */}
      <section className="bg-[#0F0D0A] py-24 sm:py-32 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20">
            <div className="lg:col-span-4 ev-anim">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C8A882]/40" />
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/50">
                  GYIK
                </span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3rem)] font-light text-white leading-[1.1] mb-6">
                Gyakori
                <br />
                <em className="not-italic text-[#C8A882]">kérdések</em>
              </h2>
              <p className="text-[13px] text-white/30 leading-[1.9] mb-8">
                Nem találod a választ? Írj és hamarosan visszajelzünk.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-white/28 border-b border-white/10 pb-0.5 hover:text-white/50 transition-all"
              >
                Kérdezz tőlünk →
              </Link>
            </div>
            <div className="lg:col-span-8">
              {faqs.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

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
    </div>
  );
}
