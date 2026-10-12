"use client";

// app/(public)/wedding/page.tsx

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import WeddingTimeline from "@/app/components/WeddingTimeline";
import Footer from "@/app/components/Footer";
import WeddingHero from "@/app/components/WeddingHero";
import ContactSection from "@/app/components/ContactSection";
import WeddingAvailabilityCalendar from "@/app/components/WeddingAvailabilityCalendar";

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
    src: "/gallery/wedding/bialaci-467.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/gallery/wedding/bialaci-476.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-2",
  },
  {
    src: "/gallery/wedding/bialaci-483.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/gallery/wedding/bialaci-524.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-2",
  },
  {
    src: "/gallery/wedding/bialaci-456.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/gallery/wedding/bialaci-258.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-2",
  },
  {
    src: "/gallery/wedding/bialaci-213.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-2",
  },
  {
    src: "/gallery/wedding/bialaci-197.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-2",
  },
  {
    src: "/gallery/wedding/bialaci-954.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-1",
  },

  {
    src: "/gallery/wedding/bialaci-833.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/gallery/wedding/bialaci-734.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/gallery/wedding/bialaci-573.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/gallery/wedding/bialaci-655.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/gallery/wedding/bialaci-550.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-2",
  },
  {
    src: "/gallery/wedding/bialaci-545.jpg",
    alt: "Bianka & Laci",
    location: "Szeged",
    year: "2026",
    span: "col-span-1 row-span-2",
  },
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

const stats = [
  { n: "20", suf: "+", l: "Esküvő" },
  { n: "4", suf: " év", l: "Tapasztalat" },
  { n: "20", suf: "db", l: "Elégedett pár" },
  { n: "35", suf: "+", l: "Átadott videó" },
];

// ── Egér-követő fény (CSS változókat állít) ───────────────────
function spot(e: ReactMouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

// ── Belépő animáció, ami a megjelenéskor játszik le ───────────
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-[900ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
        seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: seen ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

// ── Odométer számláló ─────────────────────────────────────────
function Odometer({ value, suffix }: { value: string; suffix: string }) {
  return (
    <span
      className="inline-flex items-end leading-none [font-variant-numeric:lining-nums]"
      aria-label={value + suffix}
    >
      {value.split("").map((d, i) => (
        <span
          key={i}
          aria-hidden
          className="relative inline-block overflow-hidden h-[1.1em] w-[0.58em] text-center"
        >
          <span className="w-odo-col block" data-d={d}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, k) => (
              <span key={k} className="block h-[1.1em] leading-[1.1em]">
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
      <span
        aria-hidden
        className="whitespace-pre text-[0.4em] ml-[0.2em] pb-[0.25em] tracking-wide"
      >
        {suffix.trim()}
      </span>
    </span>
  );
}

// ── FAQ item ──────────────────────────────────────────────────
function FaqItem({
  q,
  a,
  index,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onMouseMove={spot}
      className={`group relative overflow-hidden border-b border-[#EDE8E0] transition-colors duration-500 ${
        open ? "bg-[#FAF8F4]" : "bg-transparent"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(200,168,130,0.12), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className={`absolute bottom-[-1px] left-0 h-px w-full bg-[#C8A882] origin-left transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] ${
          open ? "scale-x-100" : "scale-x-0"
        }`}
      />
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="relative w-full flex items-center gap-5 sm:gap-7 py-6 px-2 sm:px-5 text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#C8A882]/60"
      >
        <span
          className={`font-['Cormorant_Garamond'] text-[1.15rem] tabular-nums shrink-0 transition-colors duration-500 ${
            open ? "text-[#C8A882]" : "text-[#C8A882]/50"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={`font-['Cormorant_Garamond'] font-light leading-[1.2] text-[1.25rem] sm:text-[1.55rem] transition-all duration-500 ${
            open
              ? "text-[#1A1510] translate-x-1"
              : "text-[#1A1510]/75 group-hover:text-[#C8A882]"
          }`}
        >
          {q}
        </span>
        <span
          className={`w-7 h-7 border flex items-center justify-center shrink-0 ml-auto transition-all duration-500 ${
            open
              ? "rotate-45 border-[#C8A882] bg-[#C8A882]/10"
              : "border-[#EDE8E0]"
          }`}
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
        </span>
      </button>
      <div
        className={`relative grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <p
            className={`text-[13px] sm:text-[14px] font-light text-[#7A6A58] leading-[1.9] pl-[3.4rem] sm:pl-[5.1rem] pr-8 pb-7 max-w-2xl transition-all duration-700 ${
              open ? "opacity-100 translate-y-0 delay-150" : "opacity-0 translate-y-3"
            }`}
          >
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Package card ──────────────────────────────────────────────
function PackageCard({ pkg, featured }: { pkg: Package; featured?: boolean }) {
  return (
    <div
      onMouseMove={spot}
      className={`relative overflow-hidden flex flex-col border transition-all duration-500 h-full group hover:-translate-y-1.5
      ${
        featured
          ? "bg-[#1A1510] border-[#1A1510] shadow-2xl"
          : "bg-white border-[#EDE8E0] hover:border-[#C8A882]/50 hover:shadow-xl"
      }`}
    >
      {/* Egér-követő fény */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: featured
            ? "radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), rgba(200,168,130,0.16), transparent 65%)"
            : "radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), rgba(200,168,130,0.14), transparent 65%)",
        }}
      />
      {/* Keresőkeret sarkok */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t border-l border-[#C8A882] opacity-0 -translate-x-1 -translate-y-1 group-hover:opacity-80 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#C8A882] opacity-0 translate-x-1 translate-y-1 group-hover:opacity-80 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500"
      />

      {featured && (
        <div className="absolute -top-0 left-6 px-3 py-1 text-[9px] tracking-[0.18em] uppercase bg-[#C8A882] text-white z-[2]">
          Legnépszerűbb
        </div>
      )}
      <div className="relative p-8 pt-10 flex flex-col flex-1">
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
          className={`relative overflow-hidden mt-auto block w-full text-center text-[11px] tracking-[0.18em] uppercase py-4 transition-colors duration-300
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
export default function WeddingClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"foto" | "video">("foto");
  const [packages, setPackages] = useState<Package[]>([]);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [showreel, setShowreel] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

  // ── Modal / lightbox: ESC, nyilak, görgetés zárolás ────────
  useEffect(() => {
    if (!showreel && lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowreel(false);
        setLightbox(null);
      }
      if (lightbox !== null) {
        if (e.key === "ArrowRight")
          setLightbox((i) => (i === null ? null : (i + 1) % references.length));
        if (e.key === "ArrowLeft")
          setLightbox((i) =>
            i === null ? null : (i - 1 + references.length) % references.length,
          );
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showreel, lightbox]);

  const stepLightbox = (d: number) =>
    setLightbox((i) =>
      i === null ? null : (i + d + references.length) % references.length,
    );

  // ── GSAP scroll animációk ─────────────────────────────────
  useEffect(() => {
    let ctx: any,
      mounted = true;
    const cleanups: Array<() => void> = [];

    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!mounted) return;

      ctx = gsap.context(() => {
        // Olvasási haladás
        gsap.to(".w-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
        });

        // Film strip: végtelen futás, görgetés sebessége gyorsítja
        const strip = stripRef.current;
        if (strip) {
          const loop = gsap.to(strip, {
            xPercent: -25,
            ease: "none",
            duration: 50,
            repeat: -1,
          });
          ScrollTrigger.create({
            onUpdate: (self) => {
              const v = Math.abs(self.getVelocity());
              if (v < 60) return;
              gsap.to(loop, {
                timeScale: 1 + Math.min(v / 450, 7),
                duration: 0.25,
                overwrite: true,
                onComplete: () => {
                  gsap.to(loop, {
                    timeScale: 1,
                    duration: 1.4,
                    ease: "power2.out",
                  });
                },
              });
            },
          });
          const wrap = strip.parentElement;
          if (wrap) {
            const enter = () =>
              gsap.to(loop, { timeScale: 0.15, duration: 0.6, overwrite: true });
            const leave = () =>
              gsap.to(loop, { timeScale: 1, duration: 0.8, overwrite: true });
            wrap.addEventListener("pointerenter", enter);
            wrap.addEventListener("pointerleave", leave);
            cleanups.push(() => {
              wrap.removeEventListener("pointerenter", enter);
              wrap.removeEventListener("pointerleave", leave);
            });
          }
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
        [".w-faq-item", ".w-stat-item"].forEach((sel) => {
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
        });

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

        // Mágneses lejátszó gomb
        const playWrap = rootRef.current?.querySelector<HTMLElement>(".w-split-right");
        const play = rootRef.current?.querySelector<HTMLElement>(".w-play");
        if (playWrap && play) {
          const xTo = gsap.quickTo(play, "x", { duration: 0.7, ease: "power3" });
          const yTo = gsap.quickTo(play, "y", { duration: 0.7, ease: "power3" });
          const move = (e: PointerEvent) => {
            const r = play.getBoundingClientRect();
            const cx = r.left + r.width / 2 - (gsap.getProperty(play, "x") as number);
            const cy = r.top + r.height / 2 - (gsap.getProperty(play, "y") as number);
            xTo((e.clientX - cx) * 0.18);
            yTo((e.clientY - cy) * 0.18);
          };
          const leave = () => {
            xTo(0);
            yTo(0);
          };
          playWrap.addEventListener("pointermove", move);
          playWrap.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            playWrap.removeEventListener("pointermove", move);
            playWrap.removeEventListener("pointerleave", leave);
          });
        }

        // Odométer: a számjegyek legördülnek
        gsap.utils.toArray<HTMLElement>(".w-odo-col").forEach((col, i) => {
          const d = parseInt(col.getAttribute("data-d") ?? "0");
          const target = d === 0 ? 10 : d;
          gsap.fromTo(
            col,
            { yPercent: 0 },
            {
              yPercent: -(target * 100) / 11,
              duration: 2.2,
              delay: i * 0.07,
              ease: "power4.out",
              scrollTrigger: {
                trigger: col.closest(".w-stat-item"),
                start: "top 90%",
                once: true,
              },
            },
          );
        });

        // Referenciák: kép felhúzódik, belül parallax
        const refItems = gsap.utils.toArray<HTMLElement>(".w-ref-item");
        if (refItems.length) {
          gsap.set(refItems, { clipPath: "inset(100% 0 0 0)" });
          ScrollTrigger.batch(refItems, {
            start: "top 94%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                clipPath: "inset(0% 0 0 0)",
                duration: 1.1,
                stagger: 0.08,
                ease: "power4.inOut",
              }),
          });
          gsap.utils.toArray<HTMLElement>(".w-ref-img").forEach((img) => {
            gsap.fromTo(
              img,
              { yPercent: -6 },
              {
                yPercent: 6,
                ease: "none",
                scrollTrigger: {
                  trigger: img.parentElement,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                },
              },
            );
          });
        }

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
      cleanups.forEach((fn) => fn());
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="bg-[#FAF8F4] overflow-x-clip">
      <style>{`
        @keyframes wp-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wp-zoom-in {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes wp-img-in {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .w-play-ring { animation: none !important; }
        }
      `}</style>

      {/* Olvasási haladás */}
      <div className="w-progress fixed top-0 left-0 right-0 h-[2px] bg-[#C8A882] origin-left scale-x-0 z-[60] pointer-events-none" />

      <WeddingHero />

      {/* ══ FILM STRIP SZEKCIÓ ══ */}
      <section
        className="relative overflow-hidden py-0 bg-[#1A1510]"
        style={{ height: "220px" }}
      >
        {/* Négyszeres strip, -25%-ig fut → zökkenőmentes loop */}
        <div
          ref={stripRef}
          className="flex gap-2 pr-2 absolute top-0 left-0 will-change-transform"
          style={{ width: "max-content" }}
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
          <div className="flex items-center gap-4 bg-[#1A1510]/70 backdrop-blur-sm px-6 py-3">
            <div className="w-16 h-px bg-[#C8A882]/40" />
            <span className="text-[9px] tracking-[0.35em] uppercase text-[#C8A882]/70 font-light">
              OptikArt · Esküvői portfólió
            </span>
            <div className="w-16 h-px bg-[#C8A882]/40" />
          </div>
        </div>
      </section>

      {/* ══ SPLIT SCREEN: Fotó vs Videó (xl-en hoverre kinyílik) ══ */}
      <section className="w-split-section bg-white overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:h-[640px]">
          {/* Bal: Fotózás */}
          <div
            onMouseMove={spot}
            className="w-split-left relative overflow-hidden group cursor-pointer min-h-[500px] xl:min-h-0 xl:flex-[1_1_0%] xl:hover:flex-[1.45_1_0%] transition-[flex-grow] duration-[900ms] ease-[cubic-bezier(0.7,0,0.2,1)]"
          >
            <div className="absolute inset-0">
              <Image
                src="/gallery/wedding/keszulodes-90.JPG"
                alt="Esküvői fotózás"
                fill
                className="object-cover object-top transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                sizes="(max-width: 1280px) 100vw, 60vw"
                quality={85}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(26,21,16,0.1) 0%, rgba(26,21,16,0.7) 100%)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(200,168,130,0.18), transparent 65%)",
                }}
              />
            </div>
            {/* Keresőkeret */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-6 opacity-0 group-hover:opacity-100 scale-[1.03] group-hover:scale-100 transition-all duration-700"
            >
              <span className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white/60" />
              <span className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/60" />
              <span className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white/60" />
              <span className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white/60" />
            </div>
            <div
              className="relative z-10 flex flex-col justify-end h-full p-10 lg:p-14"
              style={{ minHeight: "500px" }}
            >
              <div className="xl:w-[26rem]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 group-hover:w-14 h-px bg-[#C8A882] transition-all duration-700" />
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
                  Természetes fényben, valódi pillanatokat — minden kép egy
                  érzés, amit évtizedek múlva is ugyanúgy fogsz érezni.
                </p>
                <Link
                  href="#csomagok"
                  className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-white/70 border-b border-white/20 pb-0.5 hover:text-white hover:border-white/50 hover:gap-4 transition-all w-fit"
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
          </div>

          {/* Jobb: Videózás */}
          <div
            onMouseMove={spot}
            className="w-split-right relative overflow-hidden group cursor-pointer min-h-[500px] xl:min-h-0 xl:flex-[1_1_0%] xl:hover:flex-[1.45_1_0%] transition-[flex-grow] duration-[900ms] ease-[cubic-bezier(0.7,0,0.2,1)]"
            onClick={() => setShowreel(true)}
          >
            <div className="absolute inset-0">
              <Image
                src="/gallery/wedding/arankatibor-15.JPG"
                alt="Esküvői videózás"
                fill
                className="object-cover object-center transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                sizes="(max-width: 1280px) 100vw, 60vw"
                quality={85}
              />
              <div className="absolute inset-0 bg-[#0D0B08]/55 group-hover:bg-[#0D0B08]/35 transition-colors duration-500" />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(200,168,130,0.18), transparent 65%)",
                }}
              />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-6 opacity-0 group-hover:opacity-100 scale-[1.03] group-hover:scale-100 transition-all duration-700"
            >
              <span className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white/60" />
              <span className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/60" />
              <span className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white/60" />
              <span className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white/60" />
            </div>
            <div
              className="relative z-10 flex flex-col items-center justify-center h-full p-10 text-center"
              style={{ minHeight: "500px" }}
            >
              <div className="flex flex-col items-center xl:w-[26rem]">
                {/* Play gomb (az egeret követi) */}
                <div className="w-play relative w-20 h-20 mb-8">
                  <span className="w-play-ring absolute inset-0 rounded-full border border-[#C8A882]/50 animate-ping" />
                  <div className="relative w-full h-full rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-[#C8A882] group-hover:bg-[#C8A882]/20">
                    <svg
                      viewBox="0 0 24 24"
                      fill="white"
                      className="w-7 h-7 ml-1"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 group-hover:w-12 h-px bg-[#C8A882] transition-all duration-700" />
                  <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]">
                    Videózás
                  </span>
                  <div className="w-6 group-hover:w-12 h-px bg-[#C8A882] transition-all duration-700" />
                </div>
                <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light text-white leading-[1] mb-4">
                  Mozgókép
                  <br />
                  <em className="not-italic text-[#C8A882]">& highlight film</em>
                </h2>
                <p className="text-[13px] text-white/60 leading-relaxed max-w-xs">
                  Kattints a showreel megtekintéséhez — hangulat, érzelem,
                  mozgás. A ti napotok, filmen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showreel modal */}
      {showreel && (
        <div
          className="fixed inset-0 z-[300] bg-black/96 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          style={{ animation: "wp-fade-in 0.35s ease-out both" }}
          onClick={() => setShowreel(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            style={{
              aspectRatio: "16/9",
              animation: "wp-zoom-in 0.6s cubic-bezier(0.2,0.8,0.2,1) both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="absolute -top-3 -left-3 w-6 h-6 border-t border-l border-[#C8A882]/70 pointer-events-none" />
            <span className="absolute -top-3 -right-3 w-6 h-6 border-t border-r border-[#C8A882]/70 pointer-events-none" />
            <span className="absolute -bottom-3 -left-3 w-6 h-6 border-b border-l border-[#C8A882]/70 pointer-events-none" />
            <span className="absolute -bottom-3 -right-3 w-6 h-6 border-b border-r border-[#C8A882]/70 pointer-events-none" />
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
            aria-label="Bezárás"
            className="absolute top-5 right-5 text-white/50 hover:text-white hover:rotate-90 p-2 transition-all duration-300"
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

      {/* ══ STATS SÁV – legördülő számjegyek ══ */}
      <section className="bg-[#F5EFE6] border-y border-[#EDE8E0] py-16">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 sm:gap-y-0 sm:divide-x divide-[#DDD5C8]">
            {stats.map((s, i) => (
              <div
                key={i}
                onMouseMove={spot}
                className="w-stat-item group relative overflow-hidden px-6 py-6 text-center"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(200,168,130,0.20), transparent 70%)",
                  }}
                />
                <div
                  className="relative font-['Cormorant_Garamond'] font-light text-[#C8A882] flex justify-center"
                  style={{ fontSize: "clamp(3.4rem, 7vw, 6rem)" }}
                >
                  <Odometer value={s.n} suffix={s.suf} />
                </div>
                <div className="relative text-[9px] tracking-[0.2em] uppercase text-[#A08060] mt-3">
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
            className="group/grid grid grid-cols-2 lg:grid-cols-4 gap-3"
            style={{ gridAutoRows: "clamp(120px,16vw,200px)" }}
          >
            {references.map((ref, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(i)}
                aria-label={`${ref.alt} – ${ref.location}, ${ref.year}`}
                className={`w-ref-item relative overflow-hidden group cursor-zoom-in text-left transition-opacity duration-500 group-hover/grid:opacity-55 hover:!opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#C8A882] ${ref.span}`}
              >
                <div className="w-ref-img absolute inset-[-8%] will-change-transform">
                  <Image
                    src={ref.src}
                    alt={ref.alt}
                    fill
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    quality={80}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1510]/70 via-[#1A1510]/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Keresőkeret */}
                <span
                  aria-hidden
                  className="absolute top-3 left-3 w-3.5 h-3.5 border-t border-l border-white/80 opacity-0 -translate-x-1 -translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500"
                />
                <span
                  aria-hidden
                  className="absolute top-3 right-3 w-3.5 h-3.5 border-t border-r border-white/80 opacity-0 translate-x-1 -translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 [@media(hover:none)]:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
                  <p className="text-white font-['Cormorant_Garamond'] text-[1.1rem] font-light">
                    {ref.alt}
                  </p>
                  <p className="text-white/60 text-[10px] tracking-[0.1em] uppercase">
                    {ref.location} · {ref.year}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[300] bg-[#0D0B08]/96 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10"
          style={{ animation: "wp-fade-in 0.3s ease-out both" }}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            key={lightbox}
            className="relative w-full h-full max-w-6xl max-h-[84vh]"
            style={{ animation: "wp-img-in 0.6s cubic-bezier(0.2,0.8,0.2,1) both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={references[lightbox].src}
              alt={references[lightbox].alt}
              fill
              className="object-contain"
              sizes="100vw"
              quality={90}
              priority
            />
          </div>

          <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none px-6">
            <p className="font-['Cormorant_Garamond'] text-[1.4rem] font-light text-white">
              {references[lightbox].alt}
            </p>
            <p className="text-[10px] tracking-[0.18em] uppercase text-white/50 mt-1">
              {references[lightbox].location} · {references[lightbox].year}
              <span className="mx-3 text-[#C8A882]/60">|</span>
              {lightbox + 1} / {references.length}
            </p>
          </div>

          <button
            aria-label="Előző"
            onClick={(e) => {
              e.stopPropagation();
              stepLightbox(-1);
            }}
            className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/20 text-white/60 hover:text-white hover:border-[#C8A882] hover:-translate-x-1 flex items-center justify-center transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <button
            aria-label="Következő"
            onClick={(e) => {
              e.stopPropagation();
              stepLightbox(1);
            }}
            className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/20 text-white/60 hover:text-white hover:border-[#C8A882] hover:translate-x-1 flex items-center justify-center transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <button
            aria-label="Bezárás"
            className="absolute top-5 right-5 text-white/50 hover:text-white hover:rotate-90 p-2 transition-all duration-300"
            onClick={() => setLightbox(null)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

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

          {/* Tab – csúszó jelölővel */}
          <div className="flex justify-center mb-12">
            <div className="relative grid grid-cols-2 border border-[#EDE8E0] bg-white">
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-1/2 bg-[#1A1510] transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)]"
                style={{
                  transform:
                    activeTab === "video" ? "translateX(100%)" : "translateX(0)",
                }}
              />
              {(
                [
                  { id: "foto", label: "Fotózás" },
                  { id: "video", label: "Videózás" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 px-10 py-3.5 text-[11px] tracking-[0.15em] uppercase transition-colors duration-500 ${activeTab === tab.id ? "text-white" : "text-[#7A6A58] hover:text-[#1A1510]"}`}
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
            <div
              key={activeTab}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start"
            >
              {tabPackages.map((pkg, i) => (
                <Reveal key={pkg.id} delay={i * 110} className="w-pkg-card">
                  <PackageCard
                    pkg={pkg}
                    featured={isFeatured(i, tabPackages.length)}
                  />
                </Reveal>
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
                  <Reveal key={pkg.id} delay={i * 110} className="w-pkg-card">
                    <PackageCard
                      pkg={pkg}
                      featured={isFeatured(i, kombinaltPackages.length)}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <WeddingAvailabilityCalendar />

      {/* ══ FAQ ══ */}
      <section className="py-28 bg-white">
        <div className="max-w-5xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4 w-fade lg:sticky lg:top-28 self-start">
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
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[#1A1510] border-b border-[#C8A882]/40 pb-0.5 hover:border-[#C8A882] hover:gap-4 transition-all"
              >
                Kérdezz tőlünk →
              </Link>
            </div>
            <div className="lg:col-span-8 border-t border-[#EDE8E0]">
              {faqs.map((faq, i) => (
                <div key={i} className="w-faq-item">
                  <FaqItem
                    q={faq.q}
                    a={faq.a}
                    index={i}
                    open={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}