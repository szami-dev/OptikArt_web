"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const eventTypes = [
  {
    title: "Céges rendezvény",
    subtitle: "Konferencia, csapatépítő, évzáró",
    desc: "Professzionális dokumentáció vállalati eseményekről — előadások, gálák, csapatépítők. Diszkrét, de mindig ott vagyunk ahol a legjobb pillanat keletkezik.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=75",
    accent: "#C8A882",
  },
  {
    title: "Koncert & Fesztivál",
    subtitle: "Zene, energia, pillanatok",
    desc: "A zenés rendezvények különleges hangulatát gyorsan változó fényviszonyok és mozgás jellemzik. Ebben otthon vagyunk.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=75",
    accent: "#A08060",
  },
  {
    title: "Magánrendezvény",
    subtitle: "Születésnap, évforduló, party",
    desc: "Legyen szó intim összejövetelről vagy nagyobb buliról — megörökítjük az örömöt, a nevetést és az összes emlékezetes pillanatot.",
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=75",
    accent: "#B89870",
  },
  {
    title: "Sport & Konferencia",
    subtitle: "Akció, tudás, élmény",
    desc: "Sporteseményektől szakmai konferenciákig — gyors reflexek és precíz kompozíció. Minden pillanatot megőrzünk.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=75",
    accent: "#C8A882",
  },
];

// Hero mozaik – 5 sötétebb, energikus kép
// Cseréld ki: src="/events/hero1.jpg" stb.
const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80",
    alt: "Céges rendezvény",
    // Nagy cella: 2 sor
    cls: "row-span-2",
    label: "Céges",
  },
  {
    src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=700&q=80",
    alt: "Koncert",
    cls: "",
    label: "Koncert",
  },
  {
    src: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=700&q=80",
    alt: "Party",
    cls: "",
    label: "Party",
  },
];

const refs = [
  { src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=75", alt: "Tech Summit 2024", type: "Konferencia", span: "col-span-2 row-span-2" },
  { src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=75", alt: "Spring Festival", type: "Fesztivál", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=75", alt: "Gála vacsora", type: "Magánrendezvény", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=75", alt: "Maraton 2024", type: "Sport", span: "col-span-1 row-span-2" },
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75", alt: "Csapatépítő", type: "Céges", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=75", alt: "Évzáró buli", type: "Party", span: "col-span-1 row-span-1" },
];

const faqs = [
  { q: "Milyen méretű rendezvényt vállaltok?", a: "Kis intim összejövetelektől a több ezres fesztiválokig mindent vállalunk. Az ár és a csapat mérete a rendezvény nagyságától függ." },
  { q: "Hány fotós szükséges az eseményemre?", a: "Kisebb rendezvényekre (50 fő alatt) általában 1 fotós elegendő. Nagyobb eseményekre 2-3 fotóst javaslunk a teljes lefedettséghez." },
  { q: "Mikor kapjuk meg a képeket?", a: "Céges rendezvényeknél 5-7 munkanapon belül, magánrendezvényeknél 1 héten belül. Sürgős igény esetén 48 órás gyorsított átadás is lehetséges (+díj)." },
  { q: "Videózást is vállaltok rendezvényre?", a: "Igen! Fotó mellé videócsomag is kérhető. Aftermovie, highlight reel vagy teljes dokumentáció — mindenre van megoldásunk." },
  { q: "Hogyan zajlik a foglalás?", a: "Küldj egy üzenetet a rendezvény dátumával és típusával. 24 órán belül visszajelzünk és ajánlatot küldünk. Foglalóval biztosítható a dátum." },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-[0.15em] text-[#C8A882]/60 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-[14px] font-light text-white/80 group-hover:text-white transition-colors duration-200">{q}</span>
        </div>
        <div className={`w-5 h-5 border border-white/15 flex items-center justify-center shrink-0 ml-4 transition-transform duration-300 ${open ? "rotate-45" : "rotate-0"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 text-[#C8A882]">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-400 ${open ? "max-h-48 pb-5" : "max-h-0"}`}>
        <p className="text-[13px] font-light text-white/40 leading-[1.9] pl-10 pr-8">{a}</p>
      </div>
    </div>
  );
}

export default function EventPage() {
  const rootRef = useRef<HTMLDivElement>(null);

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

        // Hero
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl
          .fromTo(".ev-mosaic-cell",
            { opacity: 0, scale: 1.06 },
            { opacity: 1, scale: 1, stagger: 0.07, duration: 1.2, ease: "power2.out" }
          )
          .fromTo(".ev-eyebrow",
            { opacity: 0, x: -16 },
            { opacity: 1, x: 0, duration: 0.6 },
            0.2
          )
          .fromTo(".ev-title-word",
            { opacity: 0, y: 50, skewY: 1 },
            { opacity: 1, y: 0, skewY: 0, stagger: 0.1, duration: 0.9 },
            0.4
          )
          .fromTo(".ev-hero-content > *",
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 0.7 },
            0.9
          );

        // Event types
        gsap.from(".ev-type-card", {
          opacity: 0, y: 40, stagger: 0.1, duration: 0.9, ease: "power3.out", immediateRender: false,
          scrollTrigger: { trigger: ".ev-types", start: "top 75%", toggleActions: "play none none reverse" },
        });

        // Refs
        gsap.from(".ev-ref-item", {
          opacity: 0, y: 30, stagger: 0.07, duration: 0.8, ease: "power3.out", immediateRender: false,
          scrollTrigger: { trigger: ".ev-refs", start: "top 75%", toggleActions: "play none none reverse" },
        });

        // FAQ
        gsap.from(".ev-faq-item", {
          opacity: 0, x: -20, stagger: 0.06, duration: 0.6, ease: "power2.out", immediateRender: false,
          scrollTrigger: { trigger: ".ev-faq", start: "top 78%", toggleActions: "play none none reverse" },
        });

        // Split titles
        document.querySelectorAll(".ev-split").forEach((el) => {
          const split = new SplitText(el, { type: "lines" });
          gsap.from(split.lines, {
            opacity: 0, y: 36, stagger: 0.1, duration: 0.9, ease: "power3.out", immediateRender: false,
            scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none reverse" },
          });
        });

      }, rootRef);
    }

    init();
    return () => { mounted = false; ctx?.revert(); };
  }, []);

  return (
    <div ref={rootRef} className="bg-[#0D0B08] overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO – Sötét mozaik, szöveg bal oldalt fehéren
          Más mint a portré: teljesen sötét bg, képek sötétebb tonusban
      ══════════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden bg-[#0D0B08]"
        style={{ height: "100svh", minHeight: "600px" }}
      >
        <div className="absolute inset-0 grid grid-cols-2 lg:grid-cols-[1fr_38%_24%] grid-rows-2 gap-1">

          {/* Bal: sötét szöveg oszlop */}
          <div className="row-span-2 bg-[#0D0B08] flex flex-col justify-between px-8 sm:px-10 lg:px-14 py-10 lg:py-14 relative z-10">

            {/* Fejléc */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-[#C8A882]/50" />
              <span className="ev-eyebrow opacity-0 text-[9px] tracking-[0.28em] uppercase text-[#C8A882]/60">
                OptikArt · Rendezvény
              </span>
            </div>

            {/* Cím */}
            <div className="flex flex-col gap-6">
              <div className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/50 ev-title-word opacity-0">
                Az esemény él
              </div>

              <div
                className="font-['Cormorant_Garamond'] font-thin text-white leading-[0.88] tracking-[-0.02em]"
                style={{ fontSize: "clamp(2.8rem, 5.5vw, 6.5rem)" }}
              >
                <div className="ev-title-word opacity-0 overflow-hidden"><span className="block">Minden</span></div>
                <div className="ev-title-word opacity-0 overflow-hidden"><span className="block">pillanat</span></div>
                <div className="ev-title-word opacity-0 overflow-hidden">
                  <em className="block not-italic text-[#C8A882]">számít.</em>
                </div>
              </div>

              <div className="ev-hero-content flex flex-col gap-5">
                <p className="opacity-0 text-[13px] font-light text-white/40 leading-[1.9] max-w-xs">
                  Céges rendezvény, fesztivál, party vagy konferencia — mi ott vagyunk és megörökítjük az energiát.
                </p>

                <div className="flex flex-wrap items-center gap-4 opacity-0">
                  <Link
                    href="/contact"
                    className="bg-[#C8A882] text-white text-[11px] tracking-[0.18em] uppercase px-7 py-3.5 hover:bg-white hover:text-[#1A1510] transition-all duration-300 whitespace-nowrap"
                  >
                    Ajánlatot kérek
                  </Link>
                  <a
                    href="#rendezvénytípusok"
                    className="text-[11px] tracking-[0.14em] uppercase text-white/40 border-b border-white/20 pb-0.5 hover:text-white hover:border-white/50 transition-all whitespace-nowrap"
                  >
                    Típusok →
                  </a>
                </div>
              </div>
            </div>

            {/* Stat sor */}
            <div className="ev-hero-content flex gap-6 pt-4 border-t border-white/10">
              {[{ n: "80+", l: "Rendezvény" }, { n: "5 év", l: "Tapasztalat" }, { n: "2K+", l: "Kép/nap" }].map((s) => (
                <div key={s.l} className="opacity-0">
                  <div className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#C8A882] leading-none">{s.n}</div>
                  <div className="text-[8px] tracking-[0.12em] uppercase text-white/30 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mozaik képek – sötétített */}
          {/* Nagy cella: 2 sor */}
          <div className="ev-mosaic-cell opacity-0 relative overflow-hidden row-span-2 hidden lg:block">
            <Image
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80"
              alt="Rendezvény"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700 brightness-75"
              sizes="38vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B08]/60 to-transparent" />
            <div className="absolute bottom-4 left-4 z-10">
              <span className="text-[8px] tracking-[0.15em] uppercase text-white/50 bg-black/40 backdrop-blur-sm px-2 py-1">Céges</span>
            </div>
          </div>

          {/* Kis cella 1 */}
          <div className="ev-mosaic-cell opacity-0 relative overflow-hidden hidden lg:block">
            <Image
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80"
              alt="Koncert"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700 brightness-75"
              sizes="24vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B08]/50 to-transparent" />
            <div className="absolute bottom-3 left-3 z-10">
              <span className="text-[8px] tracking-[0.15em] uppercase text-white/50 bg-black/40 backdrop-blur-sm px-2 py-1">Koncert</span>
            </div>
          </div>

          {/* Kis cella 2 */}
          <div className="ev-mosaic-cell opacity-0 relative overflow-hidden hidden lg:block">
            <Image
              src="https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80"
              alt="Party"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700 brightness-75"
              sizes="24vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B08]/50 to-transparent" />
            <div className="absolute bottom-3 left-3 z-10">
              <span className="text-[8px] tracking-[0.15em] uppercase text-white/50 bg-black/40 backdrop-blur-sm px-2 py-1">Party</span>
            </div>
          </div>

          {/* Mobil: egyetlen kép */}
          <div className="ev-mosaic-cell opacity-0 relative overflow-hidden row-span-2 lg:hidden">
            <Image
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"
              alt="Rendezvény"
              fill
              className="object-cover brightness-60"
              sizes="50vw"
              priority
            />
          </div>
        </div>

        {/* Scroll */}
        <div className="absolute bottom-6 left-[25%] lg:left-[13%] -translate-x-1/2 flex flex-col items-center gap-2 z-20">
          <span className="text-[8px] tracking-[0.22em] uppercase text-white/20">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-[#C8A882]/30 to-transparent animate-[scrollPulse_2s_ease-in-out_infinite]" />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          RENDEZVÉNY TÍPUSOK
      ══════════════════════════════════════════ */}
      <section id="rendezvénytípusok" className="ev-types py-28 bg-[#111009]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-[#C8A882]/50" />
            <span className="text-[10px] tracking-[0.22em] uppercase text-[#C8A882]/50">Mivel foglalkozunk</span>
          </div>
          <h2 className="ev-split font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] text-white mb-16">
            Minden típusú<br />
            <em className="not-italic text-[#C8A882]">rendezvényre készen</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {eventTypes.map((ev, i) => (
              <div
                key={i}
                className="ev-type-card group relative overflow-hidden cursor-pointer"
                style={{ height: "320px" }}
              >
                <Image
                  src={ev.image}
                  alt={ev.title}
                  fill
                  className="object-cover brightness-50 group-hover:brightness-40 group-hover:scale-105 transition-all duration-700"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B08]/80 via-transparent to-transparent" />

                {/* Tartalom */}
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-5 h-px" style={{ background: ev.accent }} />
                    <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: ev.accent }}>{ev.subtitle}</span>
                  </div>
                  <h3 className="font-['Cormorant_Garamond'] text-[1.8rem] font-light text-white leading-tight mb-3">{ev.title}</h3>
                  <p className="text-[12px] font-light text-white/50 leading-[1.8] max-w-sm opacity-0 group-hover:opacity-100 transition-opacity duration-400 translate-y-4 group-hover:translate-y-0">
                    {ev.desc}
                  </p>
                </div>

                {/* Sarokdísz */}
                <div className="absolute top-5 right-5 w-5 h-5 border-t border-r border-white/0 group-hover:border-white/30 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          REFERENCIÁK
      ══════════════════════════════════════════ */}
      <section className="ev-refs py-28 bg-[#0D0B08]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C8A882]/50" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#C8A882]/50">Referenciák</span>
              </div>
              <h2 className="ev-split font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] text-white">
                Ahol<br /><em className="not-italic text-[#C8A882]">már jártunk</em>
              </h2>
            </div>
            <Link href="/gallery" className="hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-white/40 border-b border-white/20 pb-0.5 hover:text-white hover:border-white/50 transition-all">
              Teljes galéria →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5" style={{ gridAutoRows: "200px" }}>
            {refs.map((ref, i) => (
              <div key={i} className={`ev-ref-item relative overflow-hidden group cursor-pointer ${ref.span}`}>
                <Image src={ref.src} alt={ref.alt} fill className="object-cover brightness-70 group-hover:brightness-50 group-hover:scale-105 transition-all duration-700" sizes="25vw" />
                <div className="absolute inset-0 bg-[#0D0B08]/0 group-hover:bg-[#0D0B08]/30 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                  <p className="text-white font-['Cormorant_Garamond'] text-[1rem] font-light">{ref.alt}</p>
                  <p className="text-white/50 text-[9px] tracking-[0.1em] uppercase">{ref.type}</p>
                </div>
                <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-white/0 group-hover:border-white/30 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ – sötét háttéren
      ══════════════════════════════════════════ */}
      <section className="ev-faq py-28 bg-[#111009]">
        <div className="max-w-5xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C8A882]/50" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#C8A882]/50">GYIK</span>
              </div>
              <h2 className="ev-split font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3rem)] font-light text-white leading-[1.1] mb-6">
                Gyakori<br /><em className="not-italic text-[#C8A882]">kérdések</em>
              </h2>
              <p className="text-[13px] text-white/30 leading-[1.9] mb-8">
                Nem találod a választ? Írj és hamarosan visszajelzünk.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[#C8A882]/70 border-b border-[#C8A882]/30 pb-0.5 hover:text-[#C8A882] hover:border-[#C8A882] transition-all">
                Kérdezz tőlünk →
              </Link>
            </div>
            <div className="lg:col-span-8">
              {faqs.map((faq, i) => (
                <div key={i} className="ev-faq-item">
                  <FaqItem q={faq.q} a={faq.a} index={i} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section className="py-28 bg-[#C8A882] relative overflow-hidden">
        {/* Finom textúra */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `linear-gradient(#1A1510 1px, transparent 1px), linear-gradient(90deg, #1A1510 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        <div className="relative z-10 max-w-3xl mx-auto px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#1A1510]/30" />
            <span className="text-[9px] tracking-[0.25em] uppercase text-[#1A1510]/50">Foglalj időpontot</span>
            <div className="w-8 h-px bg-[#1A1510]/30" />
          </div>
          <h2 className="font-['Cormorant_Garamond'] text-[clamp(2.5rem,5vw,4.5rem)] font-thin leading-[1] text-white mb-6">
            Legyen a te<br />
            <em className="not-italic text-[#1A1510]">rendezvényed is</em><br />
            megörökítve
          </h2>
          <p className="text-[14px] text-white/70 leading-[1.9] mb-10 max-w-md mx-auto">
            Küldj egy üzenetet a rendezvény dátumával — 24 órán belül személyre szabott ajánlattal jelentkezünk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="bg-[#1A1510] text-white text-[11px] tracking-[0.18em] uppercase px-10 py-4 hover:bg-white hover:text-[#1A1510] transition-colors duration-300 whitespace-nowrap">
              Ajánlatot kérek
            </Link>
            <a href="tel:+36301234567" className="border border-white/40 text-white text-[11px] tracking-[0.15em] uppercase px-8 py-4 hover:bg-white/10 transition-all duration-300 whitespace-nowrap">
              +36 30 123 4567
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes scrollPulse {
          0% { transform: scaleY(0); opacity: 1; transform-origin: top; }
          50% { transform: scaleY(1); opacity: 1; transform-origin: top; }
          51% { transform-origin: bottom; }
          100% { transform: scaleY(0); opacity: 0; transform-origin: bottom; }
        }
      `}</style>
    </div>
  );
}