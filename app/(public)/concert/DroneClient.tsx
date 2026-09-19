"use client";

// app/(public)/concert/ConcertClient.tsx
// Kliens komponens — animációk, interakció. A galéria KÉPEIT a szülő
// (szerver) komponens adja át `filenames` propként; itt csak összerakjuk
// a megjelenítendő elemeket és a <Image>-et kezeljük, nincs fs-hívás.
//
// Design: Koncertfotózás — önálló fotós landing oldal cégeknek küldve.
// Csak fotózás, nincs videó/livestream ajánlat.
// GSAP: spotlight-reveal hero, forgó fénynyaláb, végtelen tourszalag,
//       scroll-reveal grid, scroll counter.
//
// Betűtípus-függőség: "Bebas Neue" és "Space Grotesk" — lásd app/(public)/layout.tsx.

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_H = 68;
const GALLERY_BASE_PATH = "/gallery/concert";

// Sorváltozatok a rácshoz — indexre modulózva kapja meg minden kép,
// hogy ne legyen egyhangú a kirakás, de fix magasságú maradjon a grid.
const ROW_SPAN_PATTERN = [
  "col-span-1 row-span-2",
  "col-span-1 row-span-2",
  "col-span-1 row-span-3",
  "col-span-1 row-span-2",
];

// Ha nagyon sok fájl kerül a mappába, ennyit rakunk ki a galériába —
// a teljesítmény és az oldal olvashatósága miatt. Emeld fel nyugodtan.
const MAX_GALLERY_ITEMS = 32;

function filenameToAlt(filename: string): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, "");
  const cleaned = withoutExt.replace(/[-_]+/g, " ").replace(/\d+/g, "").trim();
  if (!cleaned) return "Koncertfotó";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

const tourStops = [
  "ARÉNA", "KLUB", "FESZTIVÁL", "SZABADTÉR", "STADION",
  "AMFITEÁTRUM", "SPORTCSARNOK", "FESZTIVÁL", "ARÉNA", "KLUB",
];

const capabilities = [
  {
    title: "Front-of-house fotózás",
    sub: "Fotóárok · első 3 szám",
    desc: "Jelenlét a fotóárokban, ahol a legtöbb helyszín ezt engedélyezi — éles, kontrasztos anyag a fényshow kellős közepén is.",
    n: "01",
  },
  {
    title: "Backstage & portré",
    sub: "Színfalak mögött",
    desc: "Csendes jelenlét a színpad mögött: felkészülés, próba, a fellépő pillanatai a show előtt és után.",
    n: "02",
  },
  {
    title: "Közönség és hangulat",
    sub: "Atmoszféra",
    desc: "A nézőtér, a tömeg, a fényhatások — a képek, amik visszaadják, milyen volt ott lenni, nem csak ki volt a színpadon.",
    n: "03",
  },
  {
    title: "Sajtóanyag",
    sub: "Gyors válogatás",
    desc: "Kész, felhasználásra válogatott anyag a promóter, a sajtó és a közösségi média számára, még aznap éjjel.",
    n: "04",
  },
];

const stats = [
  { val: 60, suf: "+", label: "Koncert & fesztivál" },
  { val: 5, suf: " év", label: "Tapasztalat" },
  { val: 340, suf: "+", label: "Óra színpad előtt" },
  { val: 6000, suf: "+", label: "Átadott fotó" },
];

const process = [
  { n: "01", title: "Kapcsolatfelvétel", desc: "Írj a dátummal és a helyszínnel — jellemzően 24 órán belül válaszolok egy konkrét ajánlattal." },
  { n: "02", title: "Egyeztetés", desc: "Akkreditáció, fotóárok vagy kijelölt pozíció, esetleges korlátozások (első 3 szám, villanás tilalma) tisztázása." },
  { n: "03", title: "Forgatás", desc: "Diszkrét jelenlét, fekete öltözet, néma géphang — a fókusz a produkción van, nem rajtam." },
  { n: "04", title: "Válogatás és átadás", desc: "Válogatott, szerkesztett anyag 5-7 munkanapon belül, sajtóanyag esetén ennél gyorsabban." },
];

const riderItems = [
  { label: "Akkreditáció", value: "Fotóárok vagy kijelölt pozíció, előre egyeztetve a promóterrel" },
  { label: "Jelenlét", value: "1 fő — nagyobb produkciónál igény esetén 2. fotós bevonható" },
  { label: "Felszerelés", value: "Saját teljes eszközpark, tartalék testtel és objektívekkel érkezem" },
  { label: "Biztosítás", value: "Felelősségbiztosítással rendelkezem, igény esetén igazolással" },
  { label: "Diszkréció", value: "Fekete öltözet, néma géphang, minimális jelenlét a nézőtéren" },
  { label: "Jogok", value: "Felhasználási jogok szerződésben rögzítve, igény esetén NDA aláírható" },
];

const faqs = [
  { q: "Csak fotózást vállalsz, videót nem?", a: "Igen, ez az oldal kifejezetten a koncertfotózásról szól — videó és élő közvetítés nem része a szolgáltatásnak." },
  { q: "Elég egy fotós egy nagyobb fellépésre?", a: "A legtöbb esetben igen. Több színpados fesztiválnál vagy egyszerre zajló programoknál javaslom egy második fotós bevonását." },
  { q: "Milyen formátumban és mennyi idő alatt kapjuk meg a képeket?", a: "Szerkesztett JPG anyagot adok át letölthető galérián keresztül, jellemzően 5-7 munkanapon belül." },
  { q: "Lehet titoktartási nyilatkozatot (NDA) kötni?", a: "Igen, bejelentetlen fellépő vagy meglepetésvendég esetén rutinszerűen aláírok NDA-t." },
  { q: "Mit tehetünk, ha a helyszín csak korlátozott fotós hozzáférést enged?", a: "Ehhez alkalmazkodom — küldd el előre a helyszín szabályait, és aszerint tervezem meg a pozíciókat." },
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
          <span className="font-['Space_Grotesk'] text-[0.85rem] text-[#E8362A]/50 tabular-nums shrink-0 mt-0.5">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[14px] sm:text-[15px] font-light text-white/60 group-hover:text-white transition-colors duration-200 leading-snug">
            {q}
          </span>
        </div>
        <div className={`w-6 h-6 border border-white/[0.12] flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${open ? "rotate-45 border-[#E8362A]/50" : ""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 text-[#E8362A]/60">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-400 ${open ? "max-h-48 pb-5" : "max-h-0"}`}>
        <p className="text-[13px] font-light text-white/35 leading-[1.9] pl-9 pr-6">{a}</p>
      </div>
    </div>
  );
}

export default function ConcertClient({ filenames }: { filenames: string[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  // A fájlnevekből építjük fel a galéria-elemeket — nincs kézzel írt lista,
  // csak a szerverről kapott filename-eket kötjük össze az /Image útvonallal.
  const concertGallery = useMemo(
    () =>
      filenames.slice(0, MAX_GALLERY_ITEMS).map((filename, i) => ({
        src: `${GALLERY_BASE_PATH}/${filename}`,
        alt: filenameToAlt(filename),
        w: ROW_SPAN_PATTERN[i % ROW_SPAN_PATTERN.length],
      })),
    [filenames],
  );

  const heroImageSrc =  `${GALLERY_BASE_PATH}/placeholder.jpg`;

  useEffect(() => {
    let ctx: any,
      mounted = true;

    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      await document.fonts.ready;
      if (!mounted || !rootRef.current) return;

      gsap.set(".cn-anim", { autoAlpha: 0, y: 18 });
      gsap.set(".cn-card", { autoAlpha: 0, y: 24 });
      gsap.set(".cn-gallery-item", { autoAlpha: 0, scale: 0.97 });
      setReady(true);

      ctx = gsap.context(() => {
        // ══ HERO: spotlight bekapcsolás ═════════════════════════

        gsap.fromTo(
          ".cn-hero-img",
          { clipPath: "circle(0% at 78% 32%)" },
          { clipPath: "circle(120% at 78% 32%)", duration: 1.7, ease: "power3.inOut" },
        );

        gsap.fromTo(
          ".cn-hero-overlay",
          { opacity: 0 },
          { opacity: 1, duration: 1, delay: 0.5 },
        );

        gsap.to(".cn-beam", {
          rotate: 360,
          duration: 40,
          ease: "none",
          repeat: -1,
          transformOrigin: "50% 50%",
        });

        const heroTl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.7 });
        heroTl
          .fromTo(".cn-eyebrow", { autoAlpha: 0, x: -18 }, { autoAlpha: 1, x: 0, duration: 0.6 })
          .fromTo(
            ".cn-title-line",
            { yPercent: 115, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, stagger: 0.1, duration: 0.9, ease: "power4.out" },
            0.15,
          )
          .fromTo(".cn-hero-desc", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.65)
          .fromTo(".cn-hero-btn", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.5 }, 0.85)
          .fromTo(".cn-hero-stat", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.45 }, 1.05);

        gsap.to(".cn-hero-img", {
          yPercent: 10,
          ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1 },
        });

        document.querySelectorAll(".cn-counter").forEach((el) => {
          const target = parseInt(el.getAttribute("data-val") ?? "0");
          const suf = el.getAttribute("data-suf") ?? "";
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => { el.textContent = Math.round(obj.val) + suf; },
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        const track = rootRef.current?.querySelector(".cn-marquee-track");
        if (track) {
          gsap.to(track, { xPercent: -50, duration: 22, ease: "none", repeat: -1 });
        }

        const cards = rootRef.current?.querySelectorAll(".cn-card");
        if (cards?.length) {
          gsap.to(cards, {
            autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.75, ease: "power3.out",
            scrollTrigger: { trigger: ".cn-cards-grid", start: "top 88%", once: true },
          });
        }

        const galleryItems = rootRef.current?.querySelectorAll(".cn-gallery-item");
        if (galleryItems?.length) {
          gsap.to(galleryItems, {
            autoAlpha: 1, scale: 1, stagger: 0.06, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: ".cn-gallery-grid", start: "top 88%", once: true },
          });
        }

        const animEls = rootRef.current?.querySelectorAll(".cn-anim");
        animEls?.forEach((el) => {
          gsap.to(el, {
            autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          });
        });
      }, rootRef);
    }

    init();
    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, [concertGallery]);

  return (
    <div ref={rootRef} className="bg-[#060505] overflow-x-hidden" style={{ visibility: ready ? "visible" : "hidden" }}>
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ height: "100svh", minHeight: "620px" }}>
        <div className="cn-hero-img absolute inset-[-8%] will-change-transform">
          <Image
            src={'/gallery/event/placeholder.jpg'}
            alt="Élő koncertfotózás"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            quality={88}
          />
        </div>

        <div
          className="cn-hero-overlay absolute inset-0 z-[1]"
          style={{
            background: `
              linear-gradient(to right, rgba(6,5,5,0.97) 0%, rgba(6,5,5,0.8) 42%, rgba(6,5,5,0.35) 72%, transparent 100%),
              linear-gradient(to top, rgba(6,5,5,0.9) 0%, transparent 45%)
            `,
          }}
        />

        <div className="cn-beam absolute -top-1/2 -right-1/4 w-[140%] h-[140%] z-[1] pointer-events-none opacity-[0.22]"
          style={{
            background: `conic-gradient(from 0deg,
              transparent 0deg, transparent 8deg,
              #E8362A 10deg, transparent 14deg,
              transparent 178deg,
              #35D0E0 180deg, transparent 184deg,
              transparent 360deg)`,
          }}
        />

        <div
          className="absolute inset-0 z-[2] pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px",
          }}
        />

        <div className="relative z-[3] flex flex-col h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-center gap-3 flex-shrink-0" style={{ paddingTop: `${NAV_H + 12}px` }}>
            <div className="w-8 h-px bg-[#E8362A]/50" />
            <span className="cn-eyebrow font-['Space_Grotesk'] text-[9px] tracking-[0.3em] uppercase text-[#E8362A]/70">
              OptikArt · Koncertfotózás
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-end pb-4">
            <div className="max-w-2xl">
              <h1
                className="font-['Bebas_Neue'] text-white leading-[0.85] tracking-[0.01em] mb-7"
                style={{ fontSize: "clamp(3.2rem, 9vw, 8.5rem)" }}
              >
                <span className="block overflow-hidden"><span className="cn-title-line block">Amit a színpadon</span></span>
                <span className="block overflow-hidden"><span className="cn-title-line block">egyszer látni lehet,</span></span>
                <span className="block overflow-hidden"><span className="cn-title-line block">azt egyszer kell jól</span></span>
                <span className="block overflow-hidden"><span className="cn-title-line block">megörökíteni.</span></span>
              </h1>

              <p className="cn-hero-desc font-['Space_Grotesk'] text-[13px] sm:text-[14px] font-light text-white/45 leading-[1.9] max-w-md mb-8">
                Élő koncertfotózás menedzsment cégeknek és helyszíneknek — a fotóárokból
                és a színfalak mögül is, a promóter riderjéhez igazodva.
              </p>

              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                <Link
                  href="/contact"
                  className="cn-hero-btn bg-[#E8362A] text-white font-['Space_Grotesk'] text-[11px] tracking-[0.16em] uppercase px-8 py-4 hover:bg-white hover:text-[#060505] transition-all duration-300 whitespace-nowrap"
                >
                  Ajánlatot kérek
                </Link>
                <a
                  href="#szolgaltatasok"
                  className="cn-hero-btn font-['Space_Grotesk'] text-[11px] tracking-[0.14em] uppercase text-white/40 border-b border-white/12 pb-0.5 hover:text-white hover:border-white/40 transition-all whitespace-nowrap"
                >
                  Mit vállalok →
                </a>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-wrap gap-6 sm:gap-10 lg:gap-14 pb-8 sm:pb-12 border-t border-white/[0.06] pt-5">
            {stats.map((s) => (
              <div key={s.label} className="cn-hero-stat">
                <div className="font-['Bebas_Neue'] text-[2.1rem] text-white leading-none">
                  <span className="cn-counter" data-val={s.val} data-suf={s.suf}>0{s.suf}</span>
                </div>
                <div className="font-['Space_Grotesk'] text-[8px] tracking-[0.18em] uppercase text-white/30 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TOURSZALAG ════════════════════════════════════════ */}
      <div className="bg-[#E8362A] py-3 overflow-hidden">
        <div className="cn-marquee-track flex whitespace-nowrap w-max">
          {[...tourStops, ...tourStops].map((t, i) => (
            <span key={i} className="font-['Bebas_Neue'] text-[#060505] text-[1.1rem] tracking-[0.08em] mx-6 flex items-center gap-6">
              {t}
              <span className="w-1.5 h-1.5 rounded-full bg-[#060505]/50" />
            </span>
          ))}
        </div>
      </div>

      {/* ══ RÓLAM ═════════════════════════════════════════════ */}
      <section className="bg-[#060505] py-20 sm:py-28 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-4 cn-anim">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#35D0E0]/50" />
                <span className="font-['Space_Grotesk'] text-[9px] tracking-[0.25em] uppercase text-[#35D0E0]/60">Rólam</span>
              </div>
              <h2 className="font-['Bebas_Neue'] text-[clamp(2rem,3.5vw,3rem)] text-white leading-[0.95]">
                Egy fotós,
                <br />
                nem egy stúdió
              </h2>
            </div>
            <div className="lg:col-span-8 cn-anim">
              <p className="font-['Space_Grotesk'] text-[14px] sm:text-[15px] font-light text-white/50 leading-[1.9] max-w-2xl">
                Önállóan dolgozom, közvetlenül a promóterrel vagy a helyszín technikai
                csapatával egyeztetve — nincs köztes réteg, nincs csapatkoordinációs
                időveszteség. Amit ígérek, azt magam viszem végig a helyszínen és a
                válogatásnál is.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SZOLGÁLTATÁSOK ════════════════════════════════════ */}
      <section id="szolgaltatasok" className="bg-[#060505] py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16">
            <div className="cn-anim">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#E8362A]/50" />
                <span className="font-['Space_Grotesk'] text-[9px] tracking-[0.25em] uppercase text-[#E8362A]/60">Mit viszek a helyszínre</span>
              </div>
              <h2 className="font-['Bebas_Neue'] text-[clamp(2.4rem,5.5vw,4.8rem)] text-white leading-[0.9]">
                Négy nézőpont,
                <br />
                egy fotós
              </h2>
            </div>
            <Link href="/contact" className="cn-anim hidden sm:inline-flex items-center gap-2 font-['Space_Grotesk'] text-[11px] tracking-[0.14em] uppercase text-white/35 border-b border-white/10 pb-0.5 hover:text-white/60 transition-all whitespace-nowrap self-end">
              Rider és ajánlat →
            </Link>
          </div>

          <div className="cn-cards-grid grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.05]">
            {capabilities.map((c, i) => (
              <div key={i} className="cn-card relative bg-[#0C0A0A] hover:bg-[#141010] transition-colors duration-300 p-8 sm:p-10 group" style={{ minHeight: "260px" }}>
                <div className="flex items-start justify-between mb-10">
                  <span className="font-['Space_Grotesk'] text-[9px] tracking-[0.2em] uppercase text-[#35D0E0]/60">{c.sub}</span>
                  <span className="font-['Bebas_Neue'] text-[2.4rem] text-white/[0.08] group-hover:text-[#E8362A]/25 transition-colors duration-300 leading-none">{c.n}</span>
                </div>
                <h3 className="font-['Bebas_Neue'] text-[1.7rem] text-white leading-tight mb-3">{c.title}</h3>
                <p className="font-['Space_Grotesk'] text-[12.5px] font-light text-white/40 leading-[1.8] max-w-sm">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GALÉRIA — dinamikusan a public/gallery/event mappából ═══ */}
      <section className="bg-[#060505] pt-24 sm:pt-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 mb-12 sm:mb-16">
          <div className="cn-anim flex items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#E8362A]/50" />
                <span className="font-['Space_Grotesk'] text-[9px] tracking-[0.25em] uppercase text-[#E8362A]/60">Színpad közelről</span>
              </div>
              <h2 className="font-['Bebas_Neue'] text-[clamp(2.2rem,4.5vw,4rem)] text-white leading-[0.95]">
                Amit korábbi
                <br />
                fellépéseken készítettem
              </h2>
            </div>
            <Link href="/references" className="hidden sm:inline-flex items-center gap-2 font-['Space_Grotesk'] text-[11px] tracking-[0.14em] uppercase text-white/35 border-b border-white/10 pb-0.5 hover:text-white/60 transition-all whitespace-nowrap self-end">
              Teljes galéria →
            </Link>
          </div>
        </div>

        {concertGallery.length > 0 ? (
          <div className="cn-gallery-grid grid grid-cols-2 lg:grid-cols-4 gap-1 auto-rows-[160px] sm:auto-rows-[200px] lg:auto-rows-[280px]">
            {concertGallery.map((g, i) => (
              <div key={g.src} className={`cn-gallery-item relative overflow-hidden group cursor-pointer ${g.w}`}>
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  className="object-cover brightness-55 group-hover:brightness-40 transition-all duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  quality={78}
                  priority={i < 4}
                />
                <div className="absolute inset-0 bg-[#060505]/0 group-hover:bg-[#060505]/40 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                  <p className="text-white font-['Bebas_Neue'] text-[1.1rem] tracking-wide">{g.alt}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-['Space_Grotesk'] text-white/30 text-[13px] text-center py-16">
            Nincs kép a public/gallery/event mappában.
          </p>
        )}
      </section>

      {/* ══ STATS SÁV ═════════════════════════════════════════ */}
      <section className="bg-[#0C0A0A] border-y border-[#E8362A]/10 mt-24 sm:mt-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.04]">
            {stats.map((s, i) => (
              <div key={i} className="cn-anim py-10 sm:py-12 px-6 sm:px-8 text-center bg-[#060505]/60">
                <div className="font-['Bebas_Neue'] text-[2.6rem] sm:text-[3rem] text-white leading-none mb-1">
                  <span className="cn-counter" data-val={s.val} data-suf={s.suf}>0{s.suf}</span>
                </div>
                <div className="font-['Space_Grotesk'] text-[9px] tracking-[0.2em] uppercase text-white/30">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOLYAMAT ══════════════════════════════════════════ */}
      <section className="bg-[#060505] py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="cn-anim mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#E8362A]/50" />
              <span className="font-['Space_Grotesk'] text-[9px] tracking-[0.25em] uppercase text-[#E8362A]/60">Hogyan dolgozom</span>
            </div>
            <h2 className="font-['Bebas_Neue'] text-[clamp(2.2rem,4.5vw,4rem)] text-white leading-[0.95]">
              A megkeresestől
              <br />
              az átadott galériáig
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05]">
            {process.map((step, i) => (
              <div key={i} className="cn-anim bg-[#060505] hover:bg-[#0F0C0C] transition-colors duration-300 p-8 sm:p-10 group">
                <div className="font-['Bebas_Neue'] text-[3.2rem] text-[#E8362A]/20 group-hover:text-[#E8362A]/40 transition-colors duration-300 leading-none mb-6">{step.n}</div>
                <h3 className="font-['Bebas_Neue'] text-[1.4rem] text-white mb-3 tracking-wide">{step.title}</h3>
                <p className="font-['Space_Grotesk'] text-[12px] text-white/40 leading-[1.8]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TECHNIKAI RIDER ═══════════════════════════════════ */}
      <section className="bg-[#0C0A0A] py-24 sm:py-32 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="cn-anim mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#35D0E0]/50" />
              <span className="font-['Space_Grotesk'] text-[9px] tracking-[0.25em] uppercase text-[#35D0E0]/60">A riderem</span>
            </div>
            <h2 className="font-['Bebas_Neue'] text-[clamp(2rem,4vw,3.4rem)] text-white leading-[0.95] mb-4">
              Amit a technikai csapatnak
              <br />
              érdemes tudnia rólam
            </h2>
            <p className="font-['Space_Grotesk'] text-[13px] text-white/35 leading-[1.9] max-w-lg">
              Ugyanúgy, ahogy az előadóknak van riderje, nekem is van — hogy a
              helyszíni csapat pontosan tudja, mire számítson.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
            {riderItems.map((r, i) => (
              <div key={i} className="cn-anim flex items-start gap-4 py-4 border-b border-white/[0.06]">
                <span className="font-['Space_Grotesk'] text-[9px] tracking-[0.15em] uppercase text-[#35D0E0]/60 shrink-0 pt-0.5 w-32">{r.label}</span>
                <span className="font-['Space_Grotesk'] text-[13px] font-light text-white/55 leading-[1.7]">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════════ */}
      <section className="bg-[#060505] py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20">
            <div className="lg:col-span-4 cn-anim">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#E8362A]/50" />
                <span className="font-['Space_Grotesk'] text-[9px] tracking-[0.25em] uppercase text-[#E8362A]/60">GYIK</span>
              </div>
              <h2 className="font-['Bebas_Neue'] text-[clamp(2rem,3.5vw,3rem)] text-white leading-[1] mb-6">
                Promótereknek
                <br />
                és helyszíneknek
              </h2>
              <p className="font-['Space_Grotesk'] text-[13px] text-white/30 leading-[1.9] mb-8">
                Egyedi igény esetén írj — a rendezvény előtt egyeztetjük.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 font-['Space_Grotesk'] text-[11px] tracking-[0.15em] uppercase text-white/30 border-b border-white/10 pb-0.5 hover:text-white/55 transition-all">
                Kérdezz tőlem →
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

    </div>
  );
}