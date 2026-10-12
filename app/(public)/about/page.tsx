"use client";

// app/(public)/about/page.tsx

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import ContactSection from "@/app/components/ContactSection";
import Footer from "@/app/components/Footer";

// ── Ikonok a felszereléshez ───────────────────────────────────
const IconCamera = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconVideo = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const IconLight = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

// ── Felszerelés ───────────────────────────────────────────────
const gear = [
  {
    title: "Fotó",
    Icon: IconCamera,
    items: [
      "2 x Sony A7 IV",
      "Sigma 50mm f/1.4 DG DN Art",
      "Sigma 14-24mm DG DN Art",
      "Tamron 35-150mm f/2-2.8",
    ],
  },
  {
    title: "Videó",
    Icon: IconVideo,
    items: [
      "Panasonic Lumix S5IIX",
      "Sigma 24-70mm f/2.8 DG DN Art II",
      "Lumix S 85mm f/1.8",
      "Lumix S 50mm f/1.8",
      "Helios 44-2 58mm f/2 vintage",
      "DJI Ronin RS4 Gimbal",
      "Rode Wireless Pro mikrofon",
      "Rode NTG5 Shotgun mikrofon",
    ],
  },
  {
    title: "Világítástechnika",
    Icon: IconLight,
    items: [
      "4x Godox TT600 vaku",
      "Godox X Pro kioldó",
      "Godox V1 vaku",
      "Godox DP800III stúdióvaku",
      "Godox SK400II  stúdióvaku",
      "Godox MS300 stúdióvaku",
      "Godox LE300Bi LED lámpa",
      "Godox Litemons LP600R RGB lámpa",
      "K&F Concept 12W RGB Led lámpa",
      "K&F 90cm parabolic softbox",
      "Godox 30x120cm Stripbox",
      "Neewer 130cm Reflex Umbrella",
    ],
  },
];

// ── Csapat ────────────────────────────────────────────────────
const team = [
  {
    name: "Szabó Máté",
    role: "Vezető fotós",
    bio: "4 éves tapasztalat esküvői és portréfotózásban. Természetes fény, valódi pillanatok.",
    img: "/assets/Gemini_Generated_Image_4c39tx4c39tx4c39.png",
    tags: ["Esküvő", "Portré", "Természetes fény"],
  },
  {
    name: "Monostori Márk",
    role: "Videós & Vágó",
    bio: "Cinéma vérité stílusú esküvői filmek, highlight reelok és márka tartalmak.",
    img: "/assets/bippu-10.JPG", // cseréld ki
    tags: ["Videó", "Vágás", "Brand film"],
  },
  {
    name: "Zugi Viktória",
    role: "Marketing",
    bio: "Csapatszervezés, ügyfélkapcsolat és marketing. A háttérben minden gördülékenyen.",
    img: "/assets/zugiviki-15.JPG", // cseréld ki
    tags: ["Marketing", "Ügyfélkapcsolat", "Szervezés"],
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
    year: "2023",
    event: "Az OptikArt megalapítása",
    desc: "Egy Sony A7 és egy álom. Az első esküvő Kiskunfélegyházán.",
  },
  {
    year: "2024",
    event: "Elindul az első weboldalunk",
    desc: "A mozgókép belépett a portfolióba. Az első highlight film.",
  },
  {
    year: "2025",
    event: "Az új CRM rendszerünk indulása",
    desc: "A perspektíva kitágult. Egyedi galériák, projektmenedzsment és ügyfélkapcsolat.",
  },
  {
    year: "2026",
    event: "100. esküvő",
    desc: "Száz pár, száz történet. Megünnepeltük és továbblépünk.",
  }
];

// ── BTS képek ─────────────────────────────────────────────────
const bts = [
  "/bts/bts-19.JPG",
  "/gallery/wedding/kreativ-97.JPG",
  "/gallery/marketing/siriusjanuar-28.JPG",
  "/gallery/drone/alfold-63 másolata.JPG",
  "/gallery/portrait/napraforgo-27.JPG",
  "/gallery/event/ballagaspg-192.JPG",
];

// ── Statisztikák ──────────────────────────────────────────────
const bigStats = [
  { val: "320", suf: "+", l: "Elkészült projekt", sub: "2023 óta" },
  { val: "15", suf: " TB+", l: "Átadott tartalom", sub: "archív anyag" },
  { val: "120", suf: "+", l: "Esküvő", sub: "Magyarország-szerte" },
  { val: "5", suf: " díj", l: "Szakmai elismerés", sub: "hazai versenyek" },
];

// ── Egér-követő fény (CSS változókat állít) ───────────────────
function spot(e: ReactMouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

const GEAR_INTERVAL = 7000;

export default function AboutPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Felszerelés állapot
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hover, setHover] = useState(false);

  // Értékek állapot
  const [av, setAv] = useState(0);

  // Timeline állapot
  const [yearIdx, setYearIdx] = useState(0);

  const isWide = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1280px)").matches;

  const select = (i: number, manual = false) => {
    setActive(i);
    if (manual) setAuto(false);
  };

  // Reduced motion → nincs automata váltás
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAuto(false);
    }
  }, []);

  // Automata léptetés (hoverre megáll)
  useEffect(() => {
    if (!auto || hover) return;
    const t = setTimeout(
      () => setActive((a) => (a + 1) % gear.length),
      GEAR_INTERVAL,
    );
    return () => clearTimeout(t);
  }, [active, auto, hover]);

  useEffect(() => {
    let ctx: any,
      mounted = true;
    const cleanups: Array<() => void> = [];
    const splits: Array<{ revert: () => void }> = [];

    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText } = await import("gsap/SplitText");
      gsap.registerPlugin(ScrollTrigger, SplitText);
      await document.fonts.ready;
      if (!mounted) return;

      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        // ── OLDAL OLVASÁSI HALADÁS ─────────────────────────────
        gsap.to(".ab-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
        });

        // ══ HERO: fókuszhúzás + keresőkeret ═══════════════════
        const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

        const h1Split = new SplitText(gsap.utils.toArray(".ab-h1-word"), {
          type: "chars",
        });
        splits.push(h1Split);

        heroTl
          .fromTo(
            ".ab-hero-photo",
            { filter: "blur(22px) brightness(0.55)", scale: 1.18 },
            {
              filter: "blur(0px) brightness(1)",
              scale: 1,
              duration: 2.4,
              ease: "power3.inOut",
            },
            0,
          )
          .fromTo(
            ".ab-hud-corner",
            { autoAlpha: 0, scale: 1.8 },
            { autoAlpha: 1, scale: 1, duration: 0.9, stagger: 0.08 },
            0.4,
          )
          .fromTo(
            ".ab-hero-line",
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.8,
              transformOrigin: "left center",
            },
            0.7,
          )
          .fromTo(
            ".ab-eyebrow",
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            0.9,
          )
          .fromTo(
            h1Split.chars,
            { yPercent: 115, rotate: 6, autoAlpha: 0 },
            {
              yPercent: 0,
              rotate: 0,
              autoAlpha: 1,
              stagger: 0.035,
              duration: 1.1,
              ease: "power4.out",
            },
            1.0,
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
          )
          // fókusz-keret „ráakad"
          .fromTo(
            ".ab-focus",
            { autoAlpha: 0, scale: 2.4 },
            { autoAlpha: 1, scale: 1, duration: 0.7 },
            1.6,
          )
          .to(".ab-focus", { borderColor: "#C8A882", duration: 0.2 }, 2.3)
          .to(
            ".ab-focus",
            { scale: 1.12, yoyo: true, repeat: 1, duration: 0.16 },
            2.3,
          );

        // Hero parallax görgetésre
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

        // Hero egér-parallax
        const heroEl = heroRef.current;
        const mouseEl = rootRef.current?.querySelector(".ab-hero-mouse");
        if (heroEl && mouseEl) {
          const mx = gsap.quickTo(mouseEl, "x", { duration: 1.2, ease: "power3" });
          const my = gsap.quickTo(mouseEl, "y", { duration: 1.2, ease: "power3" });
          const onMove = (e: PointerEvent) => {
            const r = heroEl.getBoundingClientRect();
            mx(((e.clientX - r.left) / r.width - 0.5) * -28);
            my(((e.clientY - r.top) / r.height - 0.5) * -18);
          };
          heroEl.addEventListener("pointermove", onMove);
          cleanups.push(() => heroEl.removeEventListener("pointermove", onMove));
        }

        // Mágneses gombok
        gsap.utils.toArray<HTMLElement>(".ab-hero-cta").forEach((el) => {
          const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
          const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
          };
          const leave = () => {
            xTo(0);
            yTo(0);
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          });
        });

        // ══ MANIFESTO: szavanként „előhívás" + forgó rekesz ═══
        const manifestoEl =
          rootRef.current?.querySelector(".ab-manifesto-text");
        if (manifestoEl) {
          const split = new SplitText(manifestoEl, { type: "words" });
          splits.push(split);
          gsap.fromTo(
            split.words,
            { opacity: 0.12 },
            {
              opacity: 1,
              stagger: 0.12,
              ease: "none",
              scrollTrigger: {
                trigger: manifestoEl,
                start: "top 80%",
                end: "bottom 50%",
                scrub: true,
              },
            },
          );
        }
        gsap.to(".ab-aperture", {
          rotate: 140,
          ease: "none",
          scrollTrigger: {
            trigger: ".ab-manifesto",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        // ══ ÉRTÉKEK sorok belépő ══════════════════════════════
        gsap.fromTo(
          ".ab-value-card",
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.12,
            duration: 0.9,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: ".ab-values-section",
              start: "top 78%",
              once: true,
            },
          },
        );

        // ══ BTS: pinelt vízszintes galéria (desktop) ═════════
        mm.add("(min-width: 1024px)", () => {
          const track = rootRef.current?.querySelector(
            ".ab-hs-track",
          ) as HTMLElement | null;
          if (!track) return;
          const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);

          const tween = gsap.to(track, {
            x: () => -dist(),
            ease: "none",
            scrollTrigger: {
              trigger: ".ab-hs",
              pin: true,
              scrub: 1,
              start: "top top",
              end: () => "+=" + dist(),
              invalidateOnRefresh: true,
            },
          });

          gsap.to(".ab-hs-bar", {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".ab-hs",
              start: "top top",
              end: () => "+=" + dist(),
              scrub: true,
              invalidateOnRefresh: true,
            },
          });

          gsap.utils.toArray<HTMLElement>(".ab-bts-img").forEach((item) => {
            const img = item.querySelector("img");
            if (!img) return;
            ScrollTrigger.create({
              trigger: item,
              containerAnimation: tween,
              start: "left 78%",
              end: "right 22%",
              onToggle: (self) =>
                gsap.to(img, {
                  filter: self.isActive ? "grayscale(0)" : "grayscale(1)",
                  scale: self.isActive ? 1.06 : 1,
                  duration: 0.7,
                  ease: "power2.out",
                }),
            });
          });
        });

        // ══ TIMELINE: sticky év + aktív esemény ═══════════════
        gsap.to(".ab-timeline-line", {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".ab-timeline-section",
            start: "top 60%",
            end: "bottom 70%",
            scrub: 1,
          },
        });

        gsap.utils.toArray<HTMLElement>(".ab-story-item").forEach((el, i) => {
          ScrollTrigger.create({
            trigger: el,
            start: "top 58%",
            end: "bottom 58%",
            onToggle: (self) => {
              if (self.isActive) setYearIdx(i);
            },
          });
        });

        // ══ CSAPAT: egymásra csúszó kártyák ═══════════════════
        gsap.utils.toArray<HTMLElement>(".ab-team-card").forEach((card) => {
          const wrap = card.querySelector(".ab-team-reveal");
          if (wrap) {
            gsap.fromTo(
              wrap,
              { clipPath: "inset(100% 0 0 0)" },
              {
                clipPath: "inset(0% 0 0 0)",
                duration: 1.3,
                ease: "power4.inOut",
                scrollTrigger: { trigger: card, start: "top 80%", once: true },
              },
            );
          }
        });

        gsap.utils.toArray<HTMLElement>(".ab-team-img").forEach((el) => {
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

        mm.add("(min-width: 1024px)", () => {
          const cards = gsap.utils.toArray<HTMLElement>(".ab-team-card");
          cards.forEach((card, i) => {
            const next = cards[i + 1];
            if (!next) return;
            const st = {
              trigger: next,
              start: "top 85%",
              end: "top 22%",
              scrub: true,
            };
            gsap.to(card.querySelector(".ab-team-inner"), {
              scale: 0.93,
              ease: "none",
              scrollTrigger: st,
            });
            gsap.to(card.querySelector(".ab-card-dim"), {
              opacity: 0.65,
              ease: "none",
              scrollTrigger: st,
            });
          });
        });

        // ══ STAT: vonalak + számlálók ═════════════════════════
        gsap.fromTo(
          ".ab-stat-line",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.2,
            stagger: 0.12,
            ease: "power3.out",
            transformOrigin: "left center",
            scrollTrigger: { trigger: ".ab-stats", start: "top 80%", once: true },
          },
        );

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

        // ══ ÁLTALÁNOS FADE-UP ═════════════════════════════════
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

        // ══ FELSZERELÉS belépő ════════════════════════════════
        gsap.fromTo(
          ".ab-gear-panel",
          { autoAlpha: 0, y: 50 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.14,
            duration: 1,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: ".ab-gear-wrap",
              start: "top 85%",
              once: true,
            },
          },
        );
      }, rootRef);
    }

    init();
    return () => {
      mounted = false;
      cleanups.forEach((fn) => fn());
      ctx?.revert();
      splits.forEach((s) => s.revert());
    };
  }, []);

  return (
    <div ref={rootRef} className="bg-[#FAF8F4] overflow-x-clip">
      <style>{`
        @keyframes ab-gear-progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes ab-year-in {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ab-gear-panel, .ab-gear-panel * { transition-duration: 0.01ms !important; transition-delay: 0ms !important; }
          .ab-year { animation: none !important; }
        }
      `}</style>

      {/* Olvasási haladás */}
      <div className="ab-progress fixed top-0 left-0 right-0 h-[2px] bg-[#C8A882] origin-left scale-x-0 z-[60] pointer-events-none" />

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative bg-[#0D0B08] overflow-hidden"
        style={{ minHeight: "100svh" }}
      >
        {/* Háttérkép (scroll-parallax > egér-parallax > fókuszhúzás) */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="ab-hero-bg absolute inset-[-10%] will-change-transform">
            <div className="ab-hero-mouse absolute inset-0 will-change-transform">
              <div className="ab-hero-photo absolute inset-0 will-change-[filter,transform]">
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

        {/* Keresőkeret HUD */}
        <div aria-hidden className="absolute inset-4 sm:inset-6 z-[2] pointer-events-none">
          <span className="ab-hud-corner absolute top-0 left-0 w-8 h-8 border-t border-l border-white/50" />
          <span className="ab-hud-corner absolute top-0 right-0 w-8 h-8 border-t border-r border-white/50" />
          <span className="ab-hud-corner absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/50" />
          <span className="ab-hud-corner absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/50" />
        </div>

        {/* Fókusz-keret */}
        <div
          aria-hidden
          className="ab-focus hidden lg:block absolute z-[2] right-[20%] top-[40%] w-24 h-24 border border-white/70 pointer-events-none"
        >
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#C8A882]" />
        </div>

        {/* Tartalom */}
        <div className="relative z-[3] flex flex-col min-h-screen max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Felső sor */}
          <div className="flex items-start gap-4 pt-12">
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
                <span className="block overflow-hidden pt-[0.14em] -mt-[0.14em] pb-[0.08em]">
                  <span className="ab-h1-word block">Rólunk</span>
                </span>
                <span className="block overflow-hidden pt-[0.14em] -mt-[0.14em] pb-[0.08em]">
                  
                </span>
              </h1>
              <p className="ab-hero-desc text-[14px] sm:text-[15px] font-light text-white/50 leading-[2] max-w-lg mb-10">
              2023 óta alkotunk professzionális fotó- és
                videótartalmakat. Szenvedélyünk az autentikus pillanatok
                megörökítése — esküvőktől rendezvényekig, portréktól
                reklámfilmekig.
              </p>
              <div className="flex flex-wrap items-center gap-5">
                <Link
                  href="/contact"
                  className="ab-hero-cta bg-white text-[#1A1510] text-[11px] tracking-[0.18em] uppercase px-8 py-4 hover:bg-[#C8A882] hover:text-white transition-colors duration-300"
                >
                  Dolgozzunk együtt
                </Link>
                <Link
                  href="/references"
                  className="ab-hero-cta text-[11px] tracking-[0.14em] uppercase text-white/40 border-b border-white/15 pb-0.5 hover:text-white hover:border-white/40 transition-colors"
                >
                  Referenciák →
                </Link>
              </div>
            </div>
          </div>

          {/* Stat sor */}
          <div className="flex flex-wrap gap-8 sm:gap-14 pb-12 sm:pb-14 border-t border-white/10 pt-6">
            {[
              { val: "320", suf: "+", l: "Projekt" },
              { val: "4", suf: " év", l: "Tapasztalat" },
              { val: "120", suf: "+", l: "Esküvő" },
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
        <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-3 z-[3]">
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
      <section className="ab-manifesto relative py-32 sm:py-44 bg-white overflow-hidden">
        {/* Forgó rekesz – görgetésre tekeredik */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          fill="none"
          stroke="#C8A882"
          strokeWidth="0.25"
          className="ab-aperture pointer-events-none absolute -right-[18vw] top-1/2 -translate-y-1/2 w-[70vw] max-w-[900px] opacity-40"
        >
          <circle cx="50" cy="50" r="46" />
          <circle cx="50" cy="50" r="20" strokeDasharray="0.8 1.2" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={i}
              x1="50"
              y1="4"
              x2="86"
              y2="70"
              transform={`rotate(${i * 60} 50 50)`}
            />
          ))}
        </svg>

        <div className="relative max-w-6xl mx-auto px-8 lg:px-16">
          <div className="flex items-center gap-3 mb-14 ab-fade">
            <div className="w-8 h-px bg-[#C8A882]" />
            <span className="text-[9px] tracking-[0.25em] uppercase text-[#A08060]">
              Megközelítésünk
            </span>
          </div>
          <p
            className="ab-manifesto-text font-['Cormorant_Garamond'] font-light text-[#1A1510] leading-[1.14] max-w-5xl"
            style={{ fontSize: "clamp(2rem, 4.6vw, 4.4rem)" }}
          >
            Nem a technika teszi különlegessé a képet. Hanem az a
            tizedmásodperc, amikor valaki elfelejti, hogy fényképezzük — és
            önmaga lesz. Mi ezt a pillanatot vadásszuk. Mindig.
          </p>
        </div>
      </section>

      {/* ══ ÉRTÉKEK ══════════════════════════════════════════ */}
      <section className="ab-values-section py-28 sm:py-36 bg-[#F5EFE6]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
          <div className="mb-16 ab-fade">
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

          <div>
            {values.map((v, i) => {
              const on = av === i;
              return (
                <div
                  key={i}
                  onMouseEnter={() => isWide() && setAv(i)}
                  onMouseMove={spot}
                  className={`ab-value-card group/v relative overflow-hidden border-t border-[#DDD5C8] ${
                    i === values.length - 1 ? "border-b" : ""
                  } transition-colors duration-700 ${on ? "bg-white" : "bg-transparent"}`}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover/v:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(200,168,130,0.16), transparent 70%)",
                    }}
                  />
                  <div
                    aria-hidden
                    className={`absolute top-[-1px] left-0 h-px w-full bg-[#C8A882] origin-left transition-transform duration-700 ${
                      on ? "scale-x-100" : "scale-x-0"
                    }`}
                  />

                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => setAv(i)}
                    onFocus={() => setAv(i)}
                    className="relative w-full flex items-center gap-5 sm:gap-10 text-left px-3 sm:px-8 py-7 sm:py-10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#C8A882]/60"
                  >
                    <span
                      className={`font-['Cormorant_Garamond'] text-[1rem] w-7 shrink-0 transition-colors duration-500 ${
                        on ? "text-[#C8A882]" : "text-[#C8A882]/40"
                      }`}
                    >
                      {v.n}
                    </span>
                    <h3
                      className={`font-['Cormorant_Garamond'] font-light leading-none transition-all duration-700 ${
                        on
                          ? "text-[#1A1510] translate-x-2"
                          : "text-[#1A1510]/30 group-hover/v:text-[#1A1510]/60"
                      }`}
                      style={{ fontSize: "clamp(2rem, 5.4vw, 4.8rem)" }}
                    >
                      {v.title}
                    </h3>
                    <span
                      className={`ml-auto shrink-0 transition-all duration-700 ${
                        on
                          ? "text-[#C8A882] scale-[1.6] rotate-0 mr-3"
                          : "text-[#C8A882]/40 scale-100 -rotate-45"
                      }`}
                    >
                      {v.icon}
                    </span>
                  </button>

                  <div
                    className={`relative grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] ${
                      on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p
                        className={`pl-[2.9rem] sm:pl-[5.75rem] pr-6 pb-10 max-w-2xl text-[14px] sm:text-[15px] font-light text-[#7A6A58] leading-[1.9] transition-all duration-700 ${
                          on
                            ? "opacity-100 translate-y-0 delay-200"
                            : "opacity-0 translate-y-3"
                        }`}
                      >
                        {v.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ BTS – vízszintes galéria (desktopon pinelt) ═══════ */}
      <section className="ab-hs relative bg-[#1A1510] overflow-hidden flex flex-col lg:h-screen">
        <div className="px-8 lg:px-16 pt-8 lg:pt-10 flex items-center gap-3">
          <div className="w-8 h-px bg-[#C8A882]/40" />
          <span className="text-[9px] tracking-[0.25em] uppercase text-white/25">
            Behind the scenes · OptikArt Studio
          </span>
        </div>

        <div className="flex-1 flex items-center py-10 lg:py-0 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="ab-hs-track flex items-center gap-4 sm:gap-6 lg:gap-8 px-8 lg:px-[8vw] w-max will-change-transform">
            {bts.map((src, i) => (
              <div
                key={i}
                className={`ab-bts-img relative shrink-0 snap-center overflow-hidden w-[72vw] sm:w-[48vw] lg:w-[30vw] lg:max-w-[560px] aspect-[4/5] ${
                  i % 2 ? "lg:mt-28" : "lg:-mt-28"
                }`}
              >
                <Image
                  src={src}
                  alt="Behind the scenes"
                  fill
                  className="object-cover lg:grayscale"
                  sizes="(max-width: 1024px) 72vw, 30vw"
                  quality={80}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1510]/50 via-transparent to-transparent pointer-events-none" />
                <span
                  aria-hidden
                  className="absolute top-3 left-3 w-3.5 h-3.5 border-t border-l border-white/60"
                />
                <span
                  aria-hidden
                  className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b border-r border-white/60"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 lg:px-16 pb-8 lg:pb-10 flex items-center gap-6">
          <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/50 shrink-0">
            2023–2026
          </span>
          <div className="relative flex-1 h-px bg-white/10 hidden lg:block">
            <div className="ab-hs-bar absolute inset-0 bg-[#C8A882]/70 origin-left scale-x-0" />
          </div>
        </div>
      </section>

      {/* ══ TÖRTÉNET – sticky év ═════════════════════════════ */}
      <section className="ab-timeline-section py-28 sm:py-36 bg-white">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Bal: sticky cím + nagy év */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 self-start">
            <div className="ab-fade mb-10 lg:mb-14">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                  Történetünk
                </span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light text-[#1A1510] leading-[1.1]">
                Az utunk eddig
              </h2>
            </div>

            <div className="hidden lg:block">
              <div
                className="relative overflow-hidden"
                style={{ height: "clamp(5rem, 11vw, 9.5rem)" }}
              >
                <div
                  key={yearIdx}
                  className="ab-year font-['Cormorant_Garamond'] font-thin leading-[0.95] text-[#C8A882] tracking-[-0.04em]"
                  style={{
                    fontSize: "clamp(5rem, 11vw, 9.5rem)",
                    animation: "ab-year-in 0.8s cubic-bezier(0.2,0.8,0.2,1) both",
                  }}
                >
                  {story[yearIdx].year}
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-2.5">
                {story.map((s, i) => (
                  <div key={s.year} className="flex items-center gap-4">
                    <div
                      className={`h-px transition-all duration-500 ${
                        i === yearIdx
                          ? "w-12 bg-[#C8A882]"
                          : i < yearIdx
                            ? "w-6 bg-[#C8A882]/50"
                            : "w-6 bg-[#EDE8E0]"
                      }`}
                    />
                    <span
                      className={`font-['Cormorant_Garamond'] text-[1rem] transition-colors duration-500 ${
                        i === yearIdx ? "text-[#1A1510]" : "text-[#A08060]/50"
                      }`}
                    >
                      {s.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Jobb: események */}
          <div className="lg:col-span-7 relative">
            <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-[#EDE8E0]">
              <div
                className="ab-timeline-line w-full bg-[#C8A882]/70 origin-top scale-y-0"
                style={{ height: "100%" }}
              />
            </div>

            {story.map((s, i) => {
              const on = i === yearIdx;
              const last = i === story.length - 1;
              return (
                <div
                  key={i}
                  className={`ab-story-item lg:pl-16 py-10 lg:py-0 lg:min-h-[48vh] flex flex-col justify-center border-t border-[#EDE8E0] lg:border-t-0 transition-opacity duration-700 ${
                    on ? "opacity-100" : "lg:opacity-30"
                  }`}
                >
                  <span className="lg:hidden font-['Cormorant_Garamond'] text-[1.1rem] text-[#A08060] mb-2">
                    {s.year}
                  </span>
                  <h3
                    className={`font-['Cormorant_Garamond'] font-light leading-[1.05] mb-4 transition-colors duration-500 ${
                      last ? "text-[#C8A882]" : "text-[#1A1510]"
                    }`}
                    style={{ fontSize: "clamp(1.9rem,3.6vw,3.2rem)" }}
                  >
                    {s.event}
                  </h3>
                  <p className="text-[14px] sm:text-[15px] font-light text-[#7A6A58] leading-[1.9] max-w-md">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CSAPAT – egymásra csúszó kártyák ═════════════════ */}
      <section className="ab-team-section py-28 sm:py-36 bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
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

          <div className="relative">
            {team.map((member, i) => (
              <div
                key={i}
                className={`ab-team-card lg:sticky ${
                  i < team.length - 1 ? "mb-8 lg:mb-[14vh]" : ""
                }`}
                style={{ top: `calc(6rem + ${i * 1.5}rem)` }}
              >
                <div
                  onMouseMove={spot}
                  className="ab-team-inner group relative overflow-hidden bg-[#1A1510] grid grid-cols-1 lg:grid-cols-2 lg:min-h-[68vh] origin-top will-change-transform"
                >
                  {/* Kép */}
                  <div
                    className={`ab-team-reveal relative overflow-hidden min-h-[24rem] lg:min-h-0 ${
                      i % 2 ? "lg:order-2" : ""
                    }`}
                  >
                    <div className="ab-team-img absolute inset-[-10%] will-change-transform">
                      <Image
                        src={member.img}
                        alt={member.name}
                        fill
                        className="object-cover object-top grayscale-[0.35] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        quality={85}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1510]/60 via-transparent to-transparent" />
                    <div className="absolute inset-4 border border-white/0 group-hover:border-white/25 group-hover:inset-6 transition-all duration-700 pointer-events-none" />
                    <div className="absolute top-5 left-6 font-['Cormorant_Garamond'] text-[3.5rem] font-thin leading-none text-white/25">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Infó */}
                  <div className="relative p-8 sm:p-12 lg:p-16 flex flex-col justify-end gap-8">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(200,168,130,0.12), transparent 70%)",
                      }}
                    />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-5 group-hover:w-12 h-px bg-[#C8A882] transition-all duration-500" />
                        <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]">
                          {member.role}
                        </span>
                      </div>
                      <h3
                        className="font-['Cormorant_Garamond'] font-light text-white leading-[1.02] mb-5"
                        style={{ fontSize: "clamp(2.4rem, 4.6vw, 4.4rem)" }}
                      >
                        {member.name}
                      </h3>
                      <p className="text-[14px] font-light text-white/55 leading-[1.9] max-w-sm">
                        {member.bio}
                      </p>
                    </div>
                    <div className="relative flex flex-wrap gap-2">
                      {member.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] tracking-[0.12em] uppercase px-3 py-1.5 border border-white/15 text-[#C8A882] hover:bg-[#C8A882] hover:text-[#1A1510] hover:border-[#C8A882] transition-all duration-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Elhalványító réteg, amikor a következő kártya ráfut */}
                  <div className="ab-card-dim absolute inset-0 bg-[#0D0B08] opacity-0 pointer-events-none z-10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EGYEDI STAT SÁV ══════════════════════════════════ */}
      <section className="ab-stats bg-[#0D0B08] py-20 sm:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {bigStats.map((s, i) => (
              <div
                key={i}
                onMouseMove={spot}
                className="group relative overflow-hidden px-2 sm:px-6 pt-8 pb-12"
              >
                <div className="ab-stat-line absolute top-0 left-0 w-full h-px bg-[#C8A882]/50 origin-left" />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(200,168,130,0.10), transparent 70%)",
                  }}
                />
                <div
                  className="relative font-['Cormorant_Garamond'] font-thin leading-none text-transparent group-hover:text-[#C8A882] transition-colors duration-700 mb-5 whitespace-nowrap"
                  style={{
                    fontSize: "clamp(2.8rem, 6.2vw, 6.2rem)",
                    WebkitTextStroke: "1px #C8A882",
                  }}
                >
                  <span
                    className="ab-counter"
                    data-val={s.val}
                    data-suf={s.suf}
                  >
                    0{s.suf}
                  </span>
                </div>
                <div className="relative text-[10px] tracking-[0.2em] uppercase text-white/50 mb-1">
                  {s.l}
                </div>
                <div className="relative text-[9px] text-white/25">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FELSZERELÉS / TECH ════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-white">
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

          {/* Interaktív panelek: xl-en vízszintesen nyílnak, kisebb kijelzőn harmonika */}
          <div
            className="ab-gear-wrap flex flex-col xl:flex-row gap-[3px] bg-[#C8A882]/20 p-[3px]"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            {gear.map((cat, i) => {
              const on = active === i;
              const twoCols = cat.items.length > 8;
              return (
                <div
                  key={cat.title}
                  onMouseEnter={() => isWide() && select(i, true)}
                  onMouseMove={spot}
                  className={`ab-gear-panel group/g relative overflow-hidden xl:h-[32rem] transition-[flex-grow,background-color] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] ${
                    on
                      ? "bg-[#0D0B08] xl:flex-[3.4_1_0%]"
                      : "bg-[#1A1510] hover:bg-[#211B14] xl:flex-[1_1_0%]"
                  }`}
                >
                  {/* Egér-követő fény */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover/g:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgba(200,168,130,0.13), transparent 65%)",
                    }}
                  />

                  {/* Vízjel ikon */}
                  <cat.Icon
                    className={`pointer-events-none absolute -right-10 -bottom-10 w-72 h-72 text-[#C8A882] transition-all duration-1000 ease-out ${
                      on
                        ? "opacity-[0.07] scale-100 rotate-0"
                        : "opacity-[0.02] scale-75 -rotate-12"
                    }`}
                  />

                  {/* Keresőkeret sarkok */}
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute top-4 left-4 w-3.5 h-3.5 border-t border-l border-[#C8A882] transition-all duration-700 ${
                      on ? "opacity-70 translate-0" : "opacity-0 translate-x-3 translate-y-3"
                    }`}
                  />
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute top-4 right-4 w-3.5 h-3.5 border-t border-r border-[#C8A882] transition-all duration-700 ${
                      on ? "opacity-70 translate-0" : "opacity-0 -translate-x-3 translate-y-3"
                    }`}
                  />
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute bottom-4 left-4 w-3.5 h-3.5 border-b border-l border-[#C8A882] transition-all duration-700 ${
                      on ? "opacity-70 translate-0" : "opacity-0 translate-x-3 -translate-y-3"
                    }`}
                  />
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute bottom-4 right-4 w-3.5 h-3.5 border-b border-r border-[#C8A882] transition-all duration-700 ${
                      on ? "opacity-70 translate-0" : "opacity-0 -translate-x-3 -translate-y-3"
                    }`}
                  />

                  {/* Függőleges cím (xl, zárt állapotban) */}
                  <div
                    aria-hidden
                    className={`hidden xl:flex absolute inset-0 items-center justify-center pointer-events-none transition-opacity duration-500 ${
                      on ? "opacity-0" : "opacity-100 delay-300"
                    }`}
                  >
                    <span
                      className="font-['Cormorant_Garamond'] font-light text-[2rem] text-white/45 group-hover/g:text-[#C8A882] transition-colors duration-500 whitespace-nowrap"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                      }}
                    >
                      {cat.title}
                    </span>
                  </div>

                  {/* Tartalom (fix szélesség, hogy ne törjön át animáció közben) */}
                  <div className="relative z-[2] px-6 sm:px-8 xl:px-12 xl:w-[40rem]">
                    <button
                      type="button"
                      aria-expanded={on}
                      onClick={() => select(i, true)}
                      onFocus={() => isWide() && select(i, true)}
                      className="w-full flex items-center gap-5 text-left py-6 xl:pt-12 xl:pb-8 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#C8A882]/60"
                    >
                      <span
                        className={`shrink-0 transition-colors duration-500 ${
                          on ? "text-[#C8A882]" : "text-[#C8A882]/50"
                        }`}
                      >
                        <cat.Icon className="w-7 h-7" />
                      </span>
                      <h3
                        className={`font-['Cormorant_Garamond'] text-[1.6rem] sm:text-[1.9rem] font-light text-white leading-none transition-all duration-500 ${
                          on
                            ? "xl:opacity-100 xl:translate-x-0 xl:delay-200"
                            : "xl:opacity-0 xl:-translate-x-3"
                        }`}
                      >
                        {cat.title}
                      </h3>
                      {/* Nyíl jelző kis kijelzőn */}
                      <span
                        aria-hidden
                        className={`ml-auto xl:hidden text-[#C8A882]/60 transition-transform duration-500 ${
                          on ? "rotate-45" : "rotate-0"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          className="w-5 h-5"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </span>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows] duration-500 ease-out xl:grid-rows-[1fr] ${
                        on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <ul
                        className={`min-h-0 overflow-hidden xl:overflow-visible pb-0 ${
                          on ? "pb-8 xl:pb-12" : ""
                        } ${twoCols ? "sm:grid sm:grid-cols-2 sm:gap-x-10" : ""}`}
                      >
                        {cat.items.map((item, idx) => (
                          <li
                            key={item}
                            className={`group/i list-none transition-all duration-700 ease-out ${
                              on
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-5 pointer-events-none"
                            }`}
                            style={{
                              transitionDelay: on ? `${320 + idx * 55}ms` : "0ms",
                            }}
                          >
                            <div className="relative flex items-center gap-4 py-2.5 text-[13px] font-light text-white/55 group-hover/i:text-white group-hover/i:pl-2.5 transition-[color,padding] duration-300">
                              <span className="w-1 h-1 rounded-full bg-[#C8A882]/50 shrink-0 group-hover/i:bg-[#C8A882] group-hover/i:scale-[2] transition-all duration-300" />
                              {item}
                              <span className="absolute left-0 bottom-0 h-px w-full bg-white/[0.07]" />
                              <span className="absolute left-0 bottom-0 h-px w-full bg-[#C8A882] origin-left scale-x-0 group-hover/i:scale-x-100 transition-transform duration-500 ease-out" />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Automata váltás időzítő */}
                  {on && auto && !hover && (
                    <div
                      key={`progress-${active}`}
                      aria-hidden
                      className="absolute left-0 bottom-0 h-[2px] w-full bg-[#C8A882]/70 origin-left z-[3]"
                      style={{
                        animation: `ab-gear-progress ${GEAR_INTERVAL}ms linear forwards`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      
    </div>
  );
}