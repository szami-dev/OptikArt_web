"use client";

// app/(public)/wedding/page.tsx

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import WeddingTimeline from "@/app/components/WeddingTimeline";
import Footer from "@/app/components/Footer";
import WeddingHero from "@/app/components/WeddingHero";
import ContactSection from "@/app/components/ContactSection";

type BulletPoint = { id: number; title: string | null };
type Package = {
  id: number;
  name: string | null;
  description: string | null;
  price: number | null;
  categoryId: number | null;
  category?: { id: number } | null;
  subtype: string | null;
  bulletPoints: BulletPoint[];
};

// ── Referenciák ───────────────────────────────────────────────
const references = [
  {
    src: "/slides/kreativ-52.JPG",
    alt: "Vivi & Bence",
    location: "Kecskemét",
    year: "2025",
    span: "col-span-2 row-span-2",
  },
  {
    src: "/gallery/wedding/arankatibor-15.JPG",
    alt: "Aranka & Tibor",
    location: "Csongrád",
    year: "2026",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/gallery/wedding/vanizoli-210.jpg",
    alt: "Vani & Zoli",
    location: "Csongrád",
    year: "2025",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/slides/kreativ-12.JPG",
    alt: "Vivi & Bence",
    location: "Győr",
    year: "2024",
    span: "col-span-1 row-span-2",
  },
  {
    src: "/gallery/wedding/keszulodes-90.JPG",
    alt: "Vivi & Bence",
    location: "Kecskemét",
    year: "2025",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/gallery/wedding/agigyula-230.JPG",
    alt: "Ági & Gyula",
    location: "Kiskunfélegyháza",
    year: "2026",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/gallery/wedding/sps-23.JPG",
    alt: "Vani & Zoli",
    location: "Győr",
    year: "2024",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/gallery/wedding/sps-15.JPG",
    alt: "Vani & Zoli",
    location: "Csongrád",
    year: "2025",
    span: "col-span-1 row-span-1",
  },
];

// ── Film-strip előnézet képek ─────────────────────────────────
const filmStrip = [
  "/gallery/wedding/arankatibor-15.JPG",
  "/gallery/wedding/keszulodes-90.JPG",
  "/slides/kreativ-12.JPG",
  "/gallery/wedding/vanizoli-210.jpg",
  "/gallery/wedding/sps-23.JPG",
  "/gallery/wedding/sps-15.JPG",
  "/gallery/wedding/agigyula-230.JPG",
  "/slides/kreativ-52.JPG",
];

const faqs = [
  {
    q: "Mikor kapjuk meg a képeket/videót?",
    a: "Az Alap és Extra fotós csomagokban 10 db képet 48 órán belül átadunk. A teljes szerkesztett anyag 1 hónapon belül kerül átadásra. A videós Extra csomagnál ez 1,5 hónap.",
  },
  {
    q: "Hogyan zajlik a digitális átadás?",
    a: "Egy privát online galérián keresztül, ahonnan 2 hónapig letölthetők a képek, ezt követően google driveon keresztül korlátlan ideig. A pendrive-os csomagoknál egyedi díszdobozban postázzuk vagy személyesen adjuk át.",
  },
  {
    q: "Mi az a kidolgozott kép?",
    a: "A szerkesztett képek alapszintű retusálást kapnak. A kidolgozott képek mélyebb retusálást, bőrretusálást és speciális utómunkát kapnak — ezek a legemlékezetesebb pillanatok.",
  },
  {
    q: "Van-e lehetőség egyedi csomag összeállítására?",
    a: "Természetesen! Ha a meglévő csomagok egyike sem illik tökéletesen, keressetek minket és személyre szabott ajánlatot készítünk.",
  },
  {
    q: "Milyen messzire utaztok?",
    a: "Magyarország egész területén vállalunk munkát. Kiskunfélegyháza 25 km-es körzetén belül kiszállási díj nincs.",
  },
  {
    q: "Szükséges-e foglalót adni?",
    a: "Igen, a dátum lefoglalásához 30% foglaló szükséges. A maradék összeget az esemény napján vagy előtte kell kiegyenlíteni.",
  },
];

// ── FAQ item ──────────────────────────────────────────────────
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#EDE8E0]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-[0.15em] text-[#C8A882] tabular-nums text-[1rem]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[14px] font-light text-[#1A1510] group-hover:text-[#C8A882] transition-colors duration-200 font-['Arial'] text-[1.05rem]">
            {q}
          </span>
        </div>
        <div
          className={`w-6 h-6 border border-[#EDE8E0] flex items-center justify-center shrink-0 ml-4 transition-all duration-300 ${open ? "rotate-45 border-[#C8A882]" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-3 h-3 text-[#C8A882]"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-400 ${open ? "max-h-48 pb-5" : "max-h-0"}`}
      >
        <p className="text-[13px] font-light text-[#7A6A58] leading-[1.9] pl-10 pr-8">
          {a}
        </p>
      </div>
    </div>
  );
}

// ── Package card ──────────────────────────────────────────────
function PackageCard({ pkg, featured }: { pkg: Package; featured?: boolean }) {
  return (
    <div
      className={`relative flex flex-col border transition-all duration-500 h-full group
      ${
        featured
          ? "bg-[#1A1510] border-[#1A1510] shadow-2xl"
          : "bg-white border-[#EDE8E0] hover:border-[#C8A882]/50 hover:shadow-xl"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-6 px-3 py-1 text-[9px] tracking-[0.18em] uppercase bg-[#C8A882] text-white">
          Legnépszerűbb
        </div>
      )}
      <div className="p-8 pt-10 flex flex-col flex-1">
        <div className="mb-6">
          <h3
            className={`font-['Cormorant_Garamond'] text-[2.4rem] font-light leading-none mb-1 ${featured ? "text-white" : "text-[#1A1510]"}`}
          >
            {pkg.name}
          </h3>
          {pkg.description && (
            <p
              className={`text-[12px] mt-2 leading-relaxed ${featured ? "text-white/50" : "text-[#A08060]"}`}
            >
              {pkg.description}
            </p>
          )}
          <div className="flex items-end gap-1 mt-4">
            <span
              className={`font-['Cormorant_Garamond'] text-[3rem] font-light leading-none ${featured ? "text-[#C8A882]" : "text-[#1A1510]"}`}
            >
              {pkg.price ? pkg.price.toLocaleString("hu-HU") : "—"}
            </span>
            {pkg.price && (
              <span
                className={`text-[11px] mb-2 ${featured ? "text-[#C8A882]/60" : "text-[#A08060]"}`}
              >
                Ft
              </span>
            )}
          </div>
        </div>
        <div
          className={`h-px mb-6 ${featured ? "bg-white/10" : "bg-[#EDE8E0]"}`}
        />
        {pkg.bulletPoints.length > 0 && (
          <ul className="flex flex-col gap-3 mb-6 flex-1">
            {pkg.bulletPoints.map((bp) => (
              <li key={bp.id} className="flex items-start gap-3">
                <div className="w-1 h-1 rounded-full mt-2 shrink-0 bg-[#C8A882]" />
                <span
                  className={`text-[13px] font-light leading-relaxed ${featured ? "text-white/70" : "text-[#7A6A58]"}`}
                >
                  {bp.title}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/contact"
          className={`mt-auto block w-full text-center text-[11px] tracking-[0.18em] uppercase py-4 transition-all duration-300
            ${
              featured
                ? "bg-[#C8A882] text-white hover:bg-[#B8987A]"
                : "border border-[#1A1510] text-[#1A1510] hover:bg-[#1A1510] hover:text-white"
            }`}
        >
          Lépjünk kapcsolatba
        </Link>
      </div>
    </div>
  );
}

function PackageSkeleton() {
  return (
    // Az aspect-video vagy aspect-square biztosítja a relatív fix magasságot
    <div className="border border-[#EDE8E0] bg-white p-8 animate-pulse aspect-[4/5] w-full">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-4 bg-[#EDE8E0] rounded mb-4" />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export default function WeddingsPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"foto" | "video">("foto");
  const [packages, setPackages] = useState<Package[]>([]);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [showreel, setShowreel] = useState(false);

  useEffect(() => {
    fetch("/api/packages")
      .then((r) => r.json())
      .then((d) =>
        setPackages(
          (d.packages ?? []).filter(
            (p: Package) => (p.categoryId ?? p.category?.id) === 1,
          ),
        ),
      )
      .finally(() => setPkgLoading(false));
  }, []);

  const tabPackages = packages.filter((p) => p.subtype === activeTab);
  const kombinaltPackages = packages.filter((p) => p.subtype === "kombinalt");
  const isFeatured = (i: number, total: number) => total === 3 && i === 1;

  // ── GSAP scroll animációk ─────────────────────────────────
  useEffect(() => {
    let ctx: any,
      mounted = true;
    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!mounted) return;

      ctx = gsap.context(() => {
        // Film strip folyamatos scroll
        const strip = stripRef.current;
        if (strip) {
          gsap.to(strip, {
            x: "-50%",
            ease: "none",
            scrollTrigger: {
              trigger: strip.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        }

        // Fade-up általános
        document.querySelectorAll(".w-fade").forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 94%", once: true },
            },
          );
        });

        // Stagger csoportok
        [".w-ref-item", ".w-pkg-card", ".w-faq-item", ".w-stat-item"].forEach(
          (sel) => {
            const els = rootRef.current?.querySelectorAll(sel);
            if (els?.length)
              gsap.fromTo(
                els,
                { autoAlpha: 0, y: 20 },
                {
                  autoAlpha: 1,
                  y: 0,
                  stagger: 0.07,
                  duration: 0.7,
                  ease: "power3.out",
                  immediateRender: false,
                  scrollTrigger: {
                    trigger: els[0].parentElement,
                    start: "top 94%",
                    once: true,
                  },
                },
              );
          },
        );

        // Split screen reveal
        gsap.fromTo(
          ".w-split-left",
          { x: -40, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: ".w-split-section",
              start: "top 90%",
              once: true,
            },
          },
        );
        gsap.fromTo(
          ".w-split-right",
          { x: 40, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "power3.out",
            delay: 0.15,
            immediateRender: false,
            scrollTrigger: {
              trigger: ".w-split-section",
              start: "top 90%",
              once: true,
            },
          },
        );

        // Szám counter
        document.querySelectorAll(".w-counter").forEach((el) => {
          const target = parseInt(el.getAttribute("data-target") ?? "0");
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent =
                Math.round(obj.val) + (el.getAttribute("data-suffix") ?? "");
            },
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        // Section title slide-in
        document.querySelectorAll(".w-title-reveal").forEach((el) => {
          gsap.fromTo(
            el,
            { y: 30, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.9,
              ease: "power3.out",
              immediateRender: false,
              scrollTrigger: { trigger: el, start: "top 94%", once: true },
            },
          );
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
    <div ref={rootRef} className="bg-[#FAF8F4] overflow-x-hidden">
      <WeddingHero />

      {/* ══ FILM STRIP SZEKCIÓ ══ */}
      <section
        className="relative overflow-hidden py-0 bg-[#1A1510]"
        style={{ height: "220px" }}
      >
        {/* Duplikált strip folyamatos scroll-hoz */}
        <div
          ref={stripRef}
          className="flex gap-2 absolute top-0 left-0 will-change-transform"
          style={{ width: "200%" }}
        >
          {[...filmStrip, ...filmStrip, ...filmStrip, ...filmStrip].map(
            (src, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 overflow-hidden"
                style={{ width: "180px", height: "220px" }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover object-top grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
                  sizes="180px"
                  quality={70}
                />
                {/* Film perforáció */}
                <div className="absolute top-0 left-0 right-0 flex justify-between px-1 pt-1 pointer-events-none">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="w-3 h-2 bg-[#1A1510] rounded-sm" />
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 pb-1 pointer-events-none">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="w-3 h-2 bg-[#1A1510] rounded-sm" />
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
        {/* Oldalsó fade */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#1A1510] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#1A1510] to-transparent z-10 pointer-events-none" />
        {/* Felirat */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-4">
            <div className="w-16 h-px bg-[#C8A882]/40" />
            <span className="text-[9px] tracking-[0.35em] uppercase text-[#C8A882]/60 font-light">
              OptikArt · Esküvői portfólió
            </span>
            <div className="w-16 h-px bg-[#C8A882]/40" />
          </div>
        </div>
      </section>

      {/* ══ SPLIT SCREEN: Fotó vs Videó ══ */}
      <section className="w-split-section bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Bal: Fotózás */}
          <div className="w-split-left relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0">
              <Image
                src="/gallery/wedding/keszulodes-90.JPG"
                alt="Esküvői fotózás"
                fill
                className="object-cover object-top transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                sizes="50vw"
                quality={85}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(26,21,16,0.1) 0%, rgba(26,21,16,0.7) 100%)",
                }}
              />
            </div>
            <div
              className="relative z-10 flex flex-col justify-end h-full p-10 lg:p-14"
              style={{ minHeight: "500px" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px bg-[#C8A882]" />
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]">
                  Fotózás
                </span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light text-white leading-[1] mb-4">
                Örök emlékek
                <br />
                <em className="not-italic text-[#C8A882]">képekben</em>
              </h2>
              <p className="text-[13px] text-white/60 leading-relaxed max-w-xs mb-6">
                Természetes fényben, valódi pillanatokat — minden kép egy érzés,
                amit évtizedek múlva is ugyanúgy fogsz érezni.
              </p>
              <Link
                href="#csomagok"
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-white/70 border-b border-white/20 pb-0.5 hover:text-white hover:border-white/50 transition-all w-fit"
              >
                Fotós csomagok{" "}
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

          {/* Jobb: Videózás */}
          <div
            className="w-split-right relative overflow-hidden group cursor-pointer"
            onClick={() => setShowreel(true)}
          >
            <div className="absolute inset-0">
              <Image
                src="/gallery/wedding/arankatibor-15.JPG"
                alt="Esküvői videózás"
                fill
                className="object-cover object-center transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                sizes="50vw"
                quality={85}
              />
              <div className="absolute inset-0 bg-[#0D0B08]/55 group-hover:bg-[#0D0B08]/40 transition-colors duration-500" />
            </div>
            <div
              className="relative z-10 flex flex-col items-center justify-center h-full p-10 text-center"
              style={{ minHeight: "500px" }}
            >
              {/* Play gomb */}
              <div className="w-20 h-20 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 transition-all duration-300 group-hover:scale-110 group-hover:border-[#C8A882] group-hover:bg-[#C8A882]/20">
                <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px bg-[#C8A882]" />
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]">
                  Videózás
                </span>
                <div className="w-6 h-px bg-[#C8A882]" />
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light text-white leading-[1] mb-4">
                Mozgókép
                <br />
                <em className="not-italic text-[#C8A882]">& highlight film</em>
              </h2>
              <p className="text-[13px] text-white/60 leading-relaxed max-w-xs">
                Kattints a showreel megtekintéséhez — hangulat, érzelem, mozgás.
                A ti napotok, filmen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Showreel modal */}
      {showreel && (
        <div
          className="fixed inset-0 z-[300] bg-black/96 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setShowreel(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            style={{ aspectRatio: "16/9" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cseréld le: src={`https://www.youtube.com/embed/YOUTUBE_ID?autoplay=1`} */}
            <iframe
              src="https://www.youtube.com/embed/nBQuNA62Ack?autoplay=1&rel=0"
              title="Esküvői showreel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <button
            className="absolute top-5 right-5 text-white/50 hover:text-white p-2 transition-colors"
            onClick={() => setShowreel(false)}
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

      {/* ══ STATS SÁV ══ */}
      <section className="bg-[#F5EFE6] border-y border-[#EDE8E0] py-12">
        <div className="max-w-5xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#DDD5C8]">
            {[
              { n: "20", suf: "+", l: "Esküvő" },
              { n: "4", suf: " év", l: "Tapasztalat" },
              { n: "20", suf: "%", l: "Elégedett pár" },
              { n: "35", suf: "+", l: "Átadott videó" },
         
              
            ].map((s, i) => (
              <div
                key={i}
                className="w-stat-item bg-[#F5EFE6] px-8 py-8 text-center"
              >
                <div className="font-['Cormorant_Garamond'] leading-none text-[3rem] text-[#C8A882]">
                  <span
                    className="w-counter"
                    data-target={s.n}
                    data-suffix={s.suf}
                  >
                    0{s.suf}
                  </span>
                </div>
                <div className="text-[9px] tracking-[0.2em] uppercase text-[#A08060] mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TIMELINE ══ */}
      <WeddingTimeline />

      {/* ══ REFERENCIÁK ══ */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex items-end justify-between mb-14">
            <div className="w-fade">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                  Referenciák
                </span>
              </div>
              <h2 className="w-title-reveal font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] text-[#1A1510]">
                Párok,
                <br />
                <em className="not-italic text-[#C8A882]">
                  akiknek dolgoztunk
                </em>
              </h2>
            </div>
            <Link
              href="/references"
              className="hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[#1A1510] border-b border-[#C8A882]/40 pb-0.5 hover:border-[#C8A882] transition-all w-fade"
            >
              Teljes galéria →
            </Link>
          </div>

          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            style={{ gridAutoRows: "clamp(120px,16vw,200px)" }}
          >
            {references.map((ref, i) => (
              <div
                key={i}
                className={`w-ref-item relative overflow-hidden group cursor-pointer ${ref.span}`}
              >
                <Image
                  src={ref.src}
                  alt={ref.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  quality={80}
                />
                <div className="absolute inset-0 bg-[#1A1510]/0 group-hover:bg-[#1A1510]/45 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                  <p className="text-white font-['Cormorant_Garamond'] text-[1.1rem] font-light">
                    {ref.alt}
                  </p>
                  <p className="text-white/60 text-[10px] tracking-[0.1em] uppercase">
                    {ref.location} · {ref.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CSOMAGOK ══ */}
      <section id="csomagok" className="py-28 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="text-center mb-16 w-fade">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#C8A882]" />
              <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                Áraink
              </span>
              <div className="w-8 h-px bg-[#C8A882]" />
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light text-[#1A1510] mb-4">
              Válassz csomagot
            </h2>
            <p className="text-[13px] text-[#7A6A58] max-w-md mx-auto leading-relaxed">
              Fotós és videós csomagok közül választhatsz. Ha mindkettőt
              szeretnéd, a kombinált csomag kedvezőbb.
            </p>
          </div>

          {/* Tab */}
          <div className="flex justify-center mb-12">
            <div className="flex border border-[#EDE8E0] bg-white">
              {(
                [
                  { id: "foto", label: "Fotózás" },
                  { id: "video", label: "Videózás" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-10 py-3.5 text-[11px] tracking-[0.15em] uppercase transition-all duration-200 ${activeTab === tab.id ? "bg-[#1A1510] text-white" : "text-[#7A6A58] hover:text-[#1A1510]"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {pkgLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
              {[1, 2, 3].map((i) => (
                <PackageSkeleton key={i} />
              ))}
            </div>
          ) : tabPackages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[14px] text-[#A08060]">
                Ehhez a kategóriához nincs még csomag.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-3 text-[11px] tracking-[0.15em] uppercase text-[#C8A882] border-b border-[#C8A882]/40 pb-0.5"
              >
                Kérj egyedi ajánlatot →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
              {tabPackages.map((pkg, i) => (
                <div key={pkg.id} className="w-pkg-card">
                  <PackageCard
                    pkg={pkg}
                    featured={isFeatured(i, tabPackages.length)}
                  />
                </div>
              ))}
            </div>
          )}

          {!pkgLoading && kombinaltPackages.length > 0 && (
            <div className="mt-20 pt-16 border-t border-[#EDE8E0]">
              <div className="text-center mb-12 w-fade">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-8 h-px bg-[#C8A882]" />
                  <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                    Különleges ajánlat
                  </span>
                  <div className="w-8 h-px bg-[#C8A882]" />
                </div>
                <h3 className="font-['Cormorant_Garamond'] text-[clamp(1.8rem,3vw,2.8rem)] font-light text-[#1A1510] mb-3">
                  Fotó + Videó kombinált csomagok
                </h3>
                <p className="text-[13px] text-[#7A6A58] max-w-sm mx-auto">
                  Ha mindkét szolgáltatást szeretnéd, a kombinált csomag
                  kedvezőbb.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
                {kombinaltPackages.map((pkg, i) => (
                  <div key={pkg.id} className="w-pkg-card">
                    <PackageCard
                      pkg={pkg}
                      featured={isFeatured(i, kombinaltPackages.length)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-28 bg-white">
        <div className="max-w-5xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4 w-fade">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                  GYIK
                </span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3rem)] font-light text-[#1A1510] leading-[1.1] mb-6">
                Gyakori
                <br />
                <em className="not-italic text-[#C8A882]">kérdések</em>
              </h2>
              <p className="text-[13px] text-[#7A6A58] leading-[1.9] mb-8">
                Nem találod a választ? Írj nekünk és hamarosan visszajelzünk.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[#1A1510] border-b border-[#C8A882]/40 pb-0.5 hover:border-[#C8A882] transition-all"
              >
                Kérdezz tőlünk →
              </Link>
            </div>
            <div className="lg:col-span-8">
              {faqs.map((faq, i) => (
                <div key={i} className="w-faq-item">
                  <FaqItem q={faq.q} a={faq.a} index={i} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
