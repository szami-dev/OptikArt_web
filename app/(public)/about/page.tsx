"use client";

// app/(public)/about/page.tsx

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ContactSection from "@/app/components/ContactSection";
import Footer from "@/app/components/Footer";

// ── Csapat ────────────────────────────────────────────────────
const team = [
  {
    name: "Kovács Péter",
    role: "Vezető fotós",
    bio: "8 éves tapasztalat esküvői és portréfotózásban. Természetes fény, valódi pillanatok.",
    img: "/assets/bippu-10.JPG", // cseréld ki
    tags: ["Esküvő", "Portré", "Természetes fény"],
  },
  {
    name: "Nagy Dóra",
    role: "Videós & Vágó",
    bio: "Cinéma vérité stílusú esküvői filmek, highlight reelok és márka tartalmak.",
    img: "/bts/bts-19.JPG", // cseréld ki
    tags: ["Videó", "Vágás", "Brand film"],
  },
  {
    name: "Szabó Márk",
    role: "Drón operátor",
    bio: "Engedéllyel rendelkező drón pilot, légifotók és 6K légivideók.",
    img: "/assets/zugiviki-15.JPG", // cseréld ki
    tags: ["Drón", "Légifotó", "6K"],
  },
];

// ── Értékek ───────────────────────────────────────────────────
const values = [
  {
    n: "01",
    title: "Autenticitás",
    desc: "Nem rendezünk, hanem megörökítünk. Az igazi pillanatokban van az igazi szépség.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="w-6 h-6"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Precizitás",
    desc: "Minden képkocka, minden vágás szándékos. A részletekben rejlik a különbség.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="w-6 h-6"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Kapcsolat",
    desc: "Az ügyfeleink nem megbízók — partnerek. Minden projektet személyesen kísérünk.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="w-6 h-6"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    n: "04",
    title: "Időtlenség",
    desc: "Olyan képeket és filmeket alkotunk, amelyek 30 év múlva is ugyanúgy megérintenek.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="w-6 h-6"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

// ── Timeline / Történet lépések ───────────────────────────────
const story = [
  {
    year: "2016",
    event: "Az OptikArt megalapítása",
    desc: "Egy Sony A7 és egy álom. Az első esküvő Kiskunfélegyházán.",
  },
  {
    year: "2018",
    event: "Videó divízió indítása",
    desc: "A mozgókép belépett a portfolióba. Az első highlight film.",
  },
  {
    year: "2020",
    event: "Drón engedély megszerzése",
    desc: "A perspektíva kitágult. Légifotók és légivideók.",
  },
  {
    year: "2022",
    event: "100. esküvő",
    desc: "Száz pár, száz történet. Megünnepeltük és továbblépünk.",
  },
  {
    year: "2024",
    event: "OptikArt Studio nyitás",
    desc: "Saját stúdió. Kontrollált fény, határtalan lehetőség.",
  },
  {
    year: "2025",
    event: "Ma",
    desc: "320+ projekt, 3 fős csapat, ugyanaz a szenvedély.",
  },
];

export default function AboutPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: any,
      mounted = true;

    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText } = await import("gsap/SplitText");
      gsap.registerPlugin(ScrollTrigger, SplitText);
      await document.fonts.ready;
      if (!mounted) return;

      ctx = gsap.context(() => {
        // ── HERO ANIMÁCIÓ ──────────────────────────────────────
        const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Kép reveal: clip-path bal→jobb
        heroTl
          .fromTo(
            ".ab-hero-img",
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              duration: 1.4,
              ease: "power4.inOut",
            },
          )
          .fromTo(
            ".ab-hero-line",
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.8,
              ease: "power3.out",
              transformOrigin: "left center",
            },
            0.6,
          )
          .fromTo(
            ".ab-eyebrow",
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            0.9,
          )
          .fromTo(
            ".ab-h1-word",
            { yPercent: 120, autoAlpha: 0 },
            {
              yPercent: 0,
              autoAlpha: 1,
              stagger: 0.08,
              duration: 1,
              ease: "power4.out",
            },
            1.1,
          )
          .fromTo(
            ".ab-hero-desc",
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.8 },
            1.5,
          )
          .fromTo(
            ".ab-hero-cta",
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.6 },
            1.7,
          )
          .fromTo(
            ".ab-hero-stats",
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.5 },
            1.9,
          );

        // ── HERO PARALLAX ──────────────────────────────────────
        gsap.to(".ab-hero-bg", {
          yPercent: 18,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });

        // ── MANIFESTO szöveg – soronként slide-in ─────────────
        const manifestoEl =
          rootRef.current?.querySelector(".ab-manifesto-text");
        if (manifestoEl) {
          const split = new SplitText(manifestoEl, { type: "lines" });
          split.lines.forEach((line: Element) => {
            const wrapper = document.createElement("div");
            wrapper.style.overflow = "hidden";
            line.parentNode?.insertBefore(wrapper, line);
            wrapper.appendChild(line);
          });
          gsap.fromTo(
            split.lines,
            { yPercent: 105, autoAlpha: 0 },
            {
              yPercent: 0,
              autoAlpha: 1,
              stagger: 0.06,
              duration: 0.9,
              ease: "power3.out",
              immediateRender: false,
              scrollTrigger: {
                trigger: ".ab-manifesto",
                start: "top 85%",
                once: true,
              },
            },
          );
        }

        // ── ÉRTÉKEK kártyák ────────────────────────────────────
        gsap.fromTo(
          ".ab-value-card",
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.12,
            duration: 0.8,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: ".ab-values-section",
              start: "top 88%",
              once: true,
            },
          },
        );

        // ── TÖRTÉNET timeline scrub ───────────────────────────
        // Progress vonal animálódik scroll közben
        gsap.to(".ab-timeline-line", {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".ab-timeline-section",
            start: "top 80%",
            end: "bottom 60%",
            scrub: 1,
          },
        });

        gsap.fromTo(
          ".ab-story-item",
          { autoAlpha: 0, x: -20 },
          {
            autoAlpha: 1,
            x: 0,
            stagger: 0.15,
            duration: 0.7,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: ".ab-timeline-section",
              start: "top 85%",
              once: true,
            },
          },
        );

        // ── CSAPAT kártyák ────────────────────────────────────
        gsap.fromTo(
          ".ab-team-card",
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.9,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: ".ab-team-section",
              start: "top 88%",
              once: true,
            },
          },
        );

        // ── CSAPAT képek parallax ─────────────────────────────
        document.querySelectorAll(".ab-team-img").forEach((el) => {
          gsap.to(el, {
            yPercent: -8,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest(".ab-team-card"),
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        });

        // ── SZÁM COUNTER ──────────────────────────────────────
        document.querySelectorAll(".ab-counter").forEach((el) => {
          const target = parseInt(el.getAttribute("data-val") ?? "0");
          const suffix = el.getAttribute("data-suf") ?? "";
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2.5,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = Math.round(obj.val) + suffix;
            },
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        // ── ÁLTALÁNOS FADE-UP ─────────────────────────────────
        document.querySelectorAll(".ab-fade").forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              immediateRender: false,
              scrollTrigger: { trigger: el, start: "top 93%", once: true },
            },
          );
        });

        // ── BTS KÉPEK grid animáció ───────────────────────────
        gsap.fromTo(
          ".ab-bts-img",
          { autoAlpha: 0, scale: 0.95 },
          {
            autoAlpha: 1,
            scale: 1,
            stagger: 0.08,
            duration: 0.9,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: ".ab-bts-grid",
              start: "top 90%",
              once: true,
            },
          },
        );
      }, rootRef);
    }

    init();
    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="bg-[#FAF8F4] overflow-x-hidden">
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative bg-[#0D0B08] overflow-hidden"
        style={{ minHeight: "100svh" }}
      >
        {/* Háttérkép */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="ab-hero-bg absolute inset-[-10%] will-change-transform">
            <Image
              src="/bts/bts-19.JPG"
              alt="OptikArt csapat"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
              quality={85}
            />
          </div>
        </div>

        {/* Gradiens overlay */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: `
            linear-gradient(110deg, rgba(13,11,8,0.97) 0%, rgba(13,11,8,0.7) 45%, rgba(13,11,8,0.2) 80%, transparent 100%),
            linear-gradient(to top, rgba(13,11,8,0.8) 0%, transparent 40%)
          `,
          }}
        />

        {/* Kép reveal overlay – clip-path animálódik */}
        <div className="ab-hero-img absolute inset-0 z-[2]">
          <Image
            src="/bts/bts-19.JPG"
            alt="OptikArt csapat"
            fill
            className="object-cover object-center"
            sizes="100vw"
            quality={85}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(110deg, transparent 45%, rgba(13,11,8,0.95) 100%)",
            }}
          />
        </div>

        {/* Tartalom */}
        <div className="relative z-[3] flex flex-col min-h-screen max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Felső sor */}
          <div className="flex items-start gap-4 pt-8">
            <div className="ab-hero-line w-12 h-px bg-[#C8A882]/50 mt-4 origin-left shrink-0" />
            <div className="ab-eyebrow">
              <div className="text-[9px] tracking-[0.3em] uppercase text-[#C8A882]/70">
                OptikArt
              </div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-white/25">
                Fotó & Videó Stúdió
              </div>
            </div>
          </div>

          {/* Közép */}
          <div className="flex-1 flex items-center py-12">
            <div className="max-w-3xl">
              <h1
                className="font-['Cormorant_Garamond'] font-thin text-white leading-[0.87] tracking-[-0.03em] mb-8"
                style={{ fontSize: "clamp(4rem, 9vw, 11rem)" }}
              >
                <span className="block overflow-hidden">
                  <span className="ab-h1-word block">Rólunk</span>
                </span>
                <span className="block overflow-hidden">
                  <em className="ab-h1-word block not-italic text-[#C8A882]">
                    & munkánkról
                  </em>
                </span>
              </h1>
              <p className="ab-hero-desc text-[14px] sm:text-[15px] font-light text-white/50 leading-[2] max-w-lg mb-10">
                Az OptikArt 2016 óta alkot professzionális fotó- és
                videótartalmakat. Szenvedélyünk az autentikus pillanatok
                megörökítése — esküvőktől rendezvényekig, portréktól
                reklámfilmekig.
              </p>
              <div className="flex flex-wrap items-center gap-5">
                <Link
                  href="/contact"
                  className="ab-hero-cta bg-white text-[#1A1510] text-[11px] tracking-[0.18em] uppercase px-8 py-4 hover:bg-[#C8A882] hover:text-white transition-all duration-300"
                >
                  Dolgozzunk együtt
                </Link>
                <Link
                  href="/references"
                  className="ab-hero-cta text-[11px] tracking-[0.14em] uppercase text-white/40 border-b border-white/15 pb-0.5 hover:text-white hover:border-white/40 transition-all"
                >
                  Referenciák →
                </Link>
              </div>
            </div>
          </div>

          {/* Stat sor */}
          <div className="flex flex-wrap gap-8 sm:gap-14 pb-8 sm:pb-12 border-t border-white/8 pt-6">
            {[
              { val: "320", suf: "+", l: "Projekt" },
              { val: "8", suf: " év", l: "Tapasztalat" },
              { val: "120", suf: "+", l: "Esküvő" },
              { val: "98", suf: "%", l: "Elégedett ügyfél" },
            ].map((s) => (
              <div key={s.l} className="ab-hero-stats">
                <div className="font-['Cormorant_Garamond'] text-[2.2rem] font-light text-[#C8A882] leading-none">
                  <span
                    className="ab-counter"
                    data-val={s.val}
                    data-suf={s.suf}
                  >
                    0{s.suf}
                  </span>
                </div>
                <div className="text-[8px] tracking-[0.2em] uppercase text-white/30 mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Oldal dekor */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-3 z-[3]">
          <div className="w-px h-16 bg-gradient-to-b from-transparent to-[#C8A882]/20" />
          <span
            className="text-[7px] tracking-[0.3em] uppercase text-white/20"
            style={{ writingMode: "vertical-rl" }}
          >
            Budapest · Hungary
          </span>
          <div className="w-px h-16 bg-gradient-to-b from-[#C8A882]/20 to-transparent" />
        </div>
      </section>

      {/* ══ MANIFESTO ════════════════════════════════════════ */}
      <section className="ab-manifesto py-32 sm:py-40 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 mb-4 ab-fade">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#A08060]">
                  Megközelítésünk
                </span>
              </div>
              {/* Vertikális dekor vonal */}
              <div className="hidden lg:block w-px h-48 bg-gradient-to-b from-[#C8A882]/40 to-transparent mt-6 ml-1" />
            </div>
            <div className="lg:col-span-9">
              <p
                className="ab-manifesto-text font-['Cormorant_Garamond'] font-light text-[#1A1510] leading-[1.25]"
                style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.8rem)" }}
              >
                Nem a technika teszi különlegessé a képet. Hanem az a
                tizedmásodperc, amikor valaki elfelejti, hogy fényképezzük — és
                önmaga lesz. Mi ezt a pillanatot vadásszuk. Mindig.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ ÉRTÉKEK ══════════════════════════════════════════ */}
      <section className="ab-values-section py-28 bg-[#F5EFE6]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex items-end justify-between mb-16 ab-fade">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                  Alapelveink
                </span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light text-[#1A1510] leading-[1.1]">
                Amiben hiszünk
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#DDD5C8]">
            {values.map((v, i) => (
              <div
                key={i}
                className="ab-value-card bg-[#F5EFE6] p-8 sm:p-10 group hover:bg-white transition-colors duration-300"
              >
                <div className="text-[#C8A882]/50 group-hover:text-[#C8A882] transition-colors duration-300 mb-6">
                  {v.icon}
                </div>
                <div className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/40 mb-3 font-['Cormorant_Garamond'] text-[0.85rem]">
                  {v.n}
                </div>
                <h3 className="font-['Cormorant_Garamond'] text-[1.5rem] font-light text-[#1A1510] mb-3">
                  {v.title}
                </h3>
                <p className="text-[12px] font-light text-[#7A6A58] leading-[1.8]">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BTS KÉPEK GRID ═══════════════════════════════════ */}
      <section className="ab-bts-grid py-0 bg-[#1A1510] overflow-hidden">
        <div
          className="grid grid-cols-3 lg:grid-cols-6"
          style={{ height: "clamp(200px,28vw,340px)" }}
        >
          {[
            "/bts/bts-19.JPG",
            "/gallery/wedding/kreativ-97.JPG",
            "/gallery/marketing/siriusjanuar-28.JPG",
            "/gallery/drone/alfold-63 másolata.JPG",
            "/gallery/portrait/napraforgo-27.JPG",
            "/gallery/event/ballagaspg-192.JPG",
          ].map((src, i) => (
            <div key={i} className="ab-bts-img relative overflow-hidden group">
              <Image
                src={src}
                alt="Behind the scenes"
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                sizes="20vw"
                quality={75}
              />
              <div className="absolute inset-0 bg-[#1A1510]/30 group-hover:bg-[#1A1510]/0 transition-all duration-500" />
            </div>
          ))}
        </div>
        <div className="px-8 lg:px-16 py-6 flex items-center justify-between border-t border-white/5">
          <span className="text-[9px] tracking-[0.25em] uppercase text-white/20">
            Behind the scenes · OptikArt Studio
          </span>
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-[#C8A882]/30" />
            <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/40">
              2016–2025
            </span>
          </div>
        </div>
      </section>

      {/* ══ TÖRTÉNET TIMELINE ════════════════════════════════ */}
      <section className="ab-timeline-section py-28 sm:py-36 bg-white">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="ab-fade mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#C8A882]" />
              <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                Történetünk
              </span>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light text-[#1A1510] leading-[1.1]">
              Az útunk eddig
            </h2>
          </div>

          <div className="relative">
            {/* Vertikális vonal */}
            <div className="absolute left-[3.5rem] sm:left-[4rem] top-0 bottom-0 w-px bg-[#EDE8E0]">
              <div
                className="ab-timeline-line w-full bg-[#C8A882]/60 origin-top scale-y-0"
                style={{ height: "100%" }}
              />
            </div>

            <div className="flex flex-col gap-0">
              {story.map((s, i) => (
                <div
                  key={i}
                  className="ab-story-item relative flex gap-8 sm:gap-12 pb-12 group"
                >
                  {/* Dot + év */}
                  <div className="flex flex-col items-center shrink-0 w-14 sm:w-16">
                    <div
                      className={`w-3 h-3 rounded-full border-2 mt-1 z-10 transition-colors duration-300
                      ${
                        i === story.length - 1
                          ? "bg-[#C8A882] border-[#C8A882]"
                          : "bg-white border-[#C8A882]/40 group-hover:border-[#C8A882]"
                      }`}
                    />
                    <span className="text-[10px] tracking-[0.08em] text-[#A08060] mt-2 font-['Cormorant_Garamond'] text-[0.9rem]">
                      {s.year}
                    </span>
                  </div>
                  {/* Tartalom */}
                  <div className="pt-0 pb-4 border-b border-[#EDE8E0] flex-1">
                    <h3
                      className={`font-['Cormorant_Garamond'] font-light mb-2 transition-colors duration-300
                      ${i === story.length - 1 ? "text-[#C8A882]" : "text-[#1A1510] group-hover:text-[#C8A882]"}
                    `}
                      style={{ fontSize: "clamp(1.1rem,2vw,1.4rem)" }}
                    >
                      {s.event}
                    </h3>
                    <p className="text-[13px] font-light text-[#7A6A58] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CSAPAT ═══════════════════════════════════════════ */}
      <section className="ab-team-section py-28 sm:py-36 bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="ab-fade mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#C8A882]" />
              <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                A csapat
              </span>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light text-[#1A1510] leading-[1.1]">
              Akik a kamera
              <br />
              <em className="not-italic text-[#C8A882]">mögött állnak</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {team.map((member, i) => (
              <div key={i} className="ab-team-card group">
                {/* Kép */}
                <div
                  className="relative overflow-hidden mb-6"
                  style={{ aspectRatio: "3/4" }}
                >
                  <div className="ab-team-img absolute inset-[-10%] will-change-transform">
                    <Image
                      src={member.img}
                      alt={member.name}
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      quality={85}
                    />
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-[#1A1510]/0 group-hover:bg-[#1A1510]/20 transition-all duration-500" />
                  {/* Sorszám dekor */}
                  <div className="absolute top-4 right-4 font-['Cormorant_Garamond'] text-[2.5rem] font-light text-white/10 group-hover:text-white/20 transition-colors duration-300">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                {/* Info */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-5 h-px bg-[#C8A882]" />
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]">
                      {member.role}
                    </span>
                  </div>
                  <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#1A1510] mb-2">
                    {member.name}
                  </h3>
                  <p className="text-[13px] font-light text-[#7A6A58] leading-relaxed mb-4">
                    {member.bio}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] tracking-[0.1em] uppercase px-2.5 py-1 border border-[#EDE8E0] text-[#A08060] hover:border-[#C8A882]/40 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EGYEDI STAT SÁV ══════════════════════════════════ */}
      <section className="bg-[#1A1510] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {[
              { val: "320", suf: "+", l: "Elkészült projekt", sub: "2016 óta" },
              {
                val: "15",
                suf: " TB+",
                l: "Átadott tartalom",
                sub: "archív anyag",
              },
              { val: "120", suf: "+", l: "Esküvő", sub: "Magyarország-szerte" },
              {
                val: "5",
                suf: " díj",
                l: "Szakmai elismerés",
                sub: "hazai versenyek",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-[#1A1510] px-8 py-10 text-center group hover:bg-[#0D0B08] transition-colors duration-300"
              >
                <div className="font-['Cormorant_Garamond'] text-[3rem] font-light text-[#C8A882] leading-none mb-1">
                  <span
                    className="ab-counter"
                    data-val={s.val}
                    data-suf={s.suf}
                  >
                    0{s.suf}
                  </span>
                </div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-0.5">
                  {s.l}
                </div>
                <div className="text-[9px] text-white/20">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FELSZERELÉS / TECH ════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="ab-fade mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#C8A882]" />
              <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                Felszerelésünk
              </span>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[clamp(1.8rem,3.5vw,3rem)] font-light text-[#1A1510]">
              Amivel dolgozunk
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                title: "Fotó",
                items: [
                  "Sony A7 IV",
                  "Sony A7 III",
                  "85mm f/1.4 GM",
                  "35mm f/1.8",
                  "70-200mm f/2.8",
                ],
              },
              {
                title: "Videó",
                items: [
                  "Sony FX3",
                  "DJI RS 3 Pro gimbal",
                  "Rode Wireless GO II",
                  "Aputure 300d",
                  "4K / Log-C felvétel",
                ],
              },
              {
                title: "Drón & Post",
                items: [
                  "DJI Mavic 3 Cine",
                  "DJI Air 2S",
                  "6K felvétel",
                  "Adobe Lightroom / Premiere",
                  "DaVinci Resolve",
                ],
              },
            ].map((cat, i) => (
              <div key={i} className="ab-fade border-t-2 border-[#C8A882] pt-6">
                <h3 className="font-['Cormorant_Garamond'] text-[1.4rem] font-light text-[#1A1510] mb-4">
                  {cat.title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-[13px] text-[#7A6A58] font-light"
                    >
                      <div className="w-1 h-1 rounded-full bg-[#C8A882]/60 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <ContactSection />
      <Footer />
    </div>
  );
}
