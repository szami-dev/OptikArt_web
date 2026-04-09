"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type BulletPoint = { id: number; title: string | null };
type Package = {
  id: number; name: string | null; description: string | null;
  price: number | null; categoryId: number | null;
  category?: { id: number } | null;
  subtype: string | null;
  bulletPoints: BulletPoint[];
};

const photographers = [
  { name: "Szabó Máté", role: "Portré & Páros fotós", bio: "Máté hisz abban, hogy minden ember arcán ott van egy egyedi történet. 7 éve specializálódott portré és páros fotózásra — munkájában a természetes fény és az őszinte pillanatok a főszereplők.", specialties: ["Páros fotózás", "Jegyesfotózás", "Egyéni portré"], image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", youtubeId: "dQw4w9WgXcQ", accent: "#C8A882", stats: [{ n: "200+", l: "Portré" }, { n: "7 év", l: "Tapasztalat" }] },
  { name: "Zugi Viktória", role: "Családi & Gyermek fotós", bio: "Viki munkái arról szólnak, hogy a pillanat elmúlik, de az emlék megmarad. Specializációja a családi és gyermek fotózás — képein minden kacagás és ölelés örök.", specialties: ["Családi fotózás", "Gyermek portré", "Kismama fotózás"], image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80", youtubeId: "dQw4w9WgXcQ", accent: "#B89870", stats: [{ n: "150+", l: "Család" }, { n: "5 év", l: "Tapasztalat" }] },
];

const categories = [
  { id: "paros",   title: "Páros & Jegyesfotózás", subtitle: "Kettőtök világa",     desc: "Helyszíni vagy stúdió fotózás, amely megörökíti a köztetek lévő kémia minden apró jelét.", images: ["https://images.unsplash.com/photo-1519741497674-611481863552?w=700&q=75", "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=700&q=75", "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=700&q=75"] },
  { id: "csaladi", title: "Családi fotózás",        subtitle: "Együtt az egész csapat", desc: "Természetes, életteli képek a családról — gyerekekkel, nagyszülőkkel, akár háziállattal együtt.", images: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=700&q=75", "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=700&q=75", "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=700&q=75"] },
  { id: "egyeni",  title: "Egyéni portré",          subtitle: "A te pillanatod",      desc: "Önbizalom-erősítő portré fotózás, brand fotók, színész portfólió vagy egyszerűen csak egy jó kép magadról.", images: ["https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=700&q=75", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=700&q=75", "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=700&q=75"] },
];

function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-video bg-[#0F0D0B] overflow-hidden group cursor-pointer" onClick={() => setPlaying(true)}>
      {!playing ? (
        <>
          <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-[#1A1510]/40 group-hover:bg-[#1A1510]/20 transition-all duration-400" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#C8A882]/50">
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </div>
          </div>
        </>
      ) : (
        <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
      )}
    </div>
  );
}

function PackageCard({ pkg, featured }: { pkg: Package; featured?: boolean }) {
  return (
    <div className={`relative flex flex-col border transition-all duration-300 h-full ${featured ? "bg-[#1A1510] border-[#1A1510] shadow-2xl" : "bg-white border-[#EDE8E0] hover:border-[#C8A882]/50 hover:shadow-md"}`}>
      {featured && <div className="absolute -top-3 left-6 px-3 py-1 text-[9px] tracking-[0.18em] uppercase bg-[#C8A882] text-white">Legnépszerűbb</div>}
      <div className="p-6 pt-8 flex flex-col flex-1">
        <h3 className={`font-['Cormorant_Garamond'] text-[1.8rem] font-light leading-none mb-1 ${featured ? "text-white" : "text-[#1A1510]"}`}>{pkg.name}</h3>
        {pkg.description && <p className={`text-[12px] mt-1.5 mb-3 leading-relaxed ${featured ? "text-white/50" : "text-[#A08060]"}`}>{pkg.description}</p>}
        <div className="flex items-end gap-1 mb-5">
          <span className={`font-['Cormorant_Garamond'] text-[2.4rem] font-light leading-none ${featured ? "text-[#C8A882]" : "text-[#1A1510]"}`}>{pkg.price ? pkg.price.toLocaleString("hu-HU") : "—"}</span>
          {pkg.price && <span className={`text-[11px] mb-1 ${featured ? "text-[#C8A882]/60" : "text-[#A08060]"}`}>Ft</span>}
        </div>
        <div className={`h-px mb-5 ${featured ? "bg-white/10" : "bg-[#EDE8E0]"}`} />
        {pkg.bulletPoints.length > 0 && (
          <ul className="flex flex-col gap-2.5 mb-6 flex-1">
            {pkg.bulletPoints.map(bp => (
              <li key={bp.id} className="flex items-start gap-2.5">
                <div className="w-1 h-1 rounded-full mt-1.5 shrink-0 bg-[#C8A882]" />
                <span className={`text-[12px] font-light leading-relaxed ${featured ? "text-white/70" : "text-[#7A6A58]"}`}>{bp.title}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/contact" className={`mt-auto block w-full text-center text-[11px] tracking-[0.18em] uppercase py-3.5 transition-all duration-300 ${featured ? "bg-[#C8A882] text-white hover:bg-[#B8987A]" : "border border-[#1A1510] text-[#1A1510] hover:bg-[#1A1510] hover:text-white"}`}>
          Időpontot kérek
        </Link>
      </div>
    </div>
  );
}

function PackageSkeleton() {
  return (
    <div className="border border-[#EDE8E0] bg-white p-6 animate-pulse">
      <div className="h-8 bg-[#EDE8E0] rounded w-1/2 mb-3" /><div className="h-6 bg-[#EDE8E0] rounded w-1/3 mb-5" />
      <div className="h-px bg-[#EDE8E0] mb-5" />
      <div className="flex flex-col gap-2 mb-5">{[1,2,3].map(i => <div key={i} className="h-3.5 bg-[#EDE8E0] rounded" />)}</div>
      <div className="h-10 bg-[#EDE8E0] rounded" />
    </div>
  );
}

export default function PortrePage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [packages, setPackages] = useState<Package[]>([]);
  const [pkgLoading, setPkgLoading] = useState(true);

  useEffect(() => {
    fetch("/api/packages")
      .then(r => r.json())
      .then(d => setPackages((d.packages ?? []).filter((p: Package) => (p.categoryId ?? p.category?.id) === 2)))
      .finally(() => setPkgLoading(false));
  }, []);

  const activeCatId = categories[activeCategory].id;
  // Szűrés subtype alapján – pontos egyezés
  const filteredPackages = packages.filter(p => p.subtype === activeCatId);

  function isFeatured(i: number, total: number) { return total === 3 && i === 1; }

  useEffect(() => {
    let ctx: any; let mounted = true;
    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText } = await import("gsap/SplitText");
      gsap.registerPlugin(ScrollTrigger, SplitText);
      await document.fonts.ready;
      if (!mounted) return;
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(".ph-mosaic-cell", { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, stagger: 0.08, duration: 1.1, ease: "power2.out" })
          .fromTo(".ph-eyebrow", { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.6 }, 0.2)
          .fromTo(".ph-title-word", { opacity: 0, y: 44 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.9 }, 0.4)
          .fromTo(".ph-hero-desc", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 }, 0.8)
          .fromTo(".ph-hero-btn", { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.07, duration: 0.6 }, 1.0)
          .fromTo(".ph-hero-stat", { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.5 }, 1.1);
        gsap.from(".ph-cat-header > *", { opacity: 0, y: 10, stagger: 0.08, duration: 0.6, immediateRender: false, scrollTrigger: { trigger: ".ph-cat-section", start: "top 95%" } });
        gsap.from(".ph-pkg-card", { opacity: 0, y: 16, stagger: 0.1, duration: 0.7, ease: "power2.out", immediateRender: false, scrollTrigger: { trigger: ".ph-packages", start: "top 95%" } });
        gsap.from(".ph-photo-card", { opacity: 0, y: 16, stagger: 0.12, duration: 0.8, ease: "power2.out", immediateRender: false, scrollTrigger: { trigger: ".ph-photographers", start: "top 95%" } });
        document.querySelectorAll(".ph-split").forEach(el => {
          const split = new SplitText(el, { type: "lines" });
          gsap.from(split.lines, { opacity: 0, y: 12, stagger: 0.08, duration: 0.7, ease: "power2.out", immediateRender: false, scrollTrigger: { trigger: el, start: "top 95%" } });
        });
        gsap.to(".ph-cta-bg", { yPercent: 15, ease: "none", scrollTrigger: { trigger: ".ph-cta-section", start: "top bottom", end: "bottom top", scrub: 1 } });
      }, rootRef);
    }
    init();
    return () => { mounted = false; ctx?.revert(); };
  }, []);

  return (
    <div ref={rootRef} className="bg-white overflow-x-hidden">
      {/* HERO – változatlan */}
      <section className="relative w-full bg-white overflow-hidden" style={{ minHeight: "100svh" }}>
        <div className="lg:hidden absolute inset-0 z-0">
          <Image src="/gallery/portrait/liliMesiFranka-web -50.jpg" alt="Portré" fill className="object-cover object-top" sizes="100vw" priority />
          <div className="absolute inset-0 bg-white/85" />
        </div>
        <div className="hidden lg:grid absolute inset-0 grid-cols-[1fr_38%_24%] grid-rows-2 gap-1.5 p-1.5">
          <div className="row-span-2 bg-white" />
          <div className="ph-mosaic-cell opacity-0 relative overflow-hidden row-span-2"><Image src="/gallery/portrait/liliMesiFranka-web -50.jpg" alt="Egyéni portré" fill className="object-cover object-top hover:scale-105 transition-transform duration-700" sizes="38vw" priority /></div>
          <div className="ph-mosaic-cell opacity-0 relative overflow-hidden"><Image src="/gallery/portrait/marcidorina-76 (1).JPG" alt="Páros fotó" fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="24vw" priority /><div className="absolute bottom-3 left-3 z-10"><span className="text-[8px] tracking-[0.12em] uppercase text-white/70 bg-black/30 backdrop-blur-sm px-2 py-1">Páros</span></div></div>
          <div className="ph-mosaic-cell opacity-0 relative overflow-hidden"><Image src="/gallery/portrait/vanda-60.JPG" alt="Família" fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="24vw" /><div className="absolute bottom-3 left-3 z-10"><span className="text-[8px] tracking-[0.12em] uppercase text-white/70 bg-black/30 backdrop-blur-sm px-2 py-1">Família</span></div></div>
        </div>
        <div className="relative z-10 flex flex-col w-full lg:w-[38%] xl:w-[36%] px-6 sm:px-10 lg:px-14 py-10 lg:py-12" style={{ minHeight: "100svh" }}>
          <div className="flex items-center gap-3 shrink-0"><div className="w-8 h-px bg-[#C8A882]" /><span className="ph-eyebrow opacity-0 text-[9px] tracking-[0.28em] uppercase text-[#A08060]">OptikArt · Portré</span></div>
          <div className="flex-1 flex flex-col justify-center gap-5 py-8">
            <div className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882] ph-title-word opacity-0">Pillantások</div>
            <div className="font-['Cormorant_Garamond'] font-thin text-[#1A1510] leading-[0.88] tracking-[-0.02em]" style={{ fontSize: "clamp(2.6rem, 6vw, 6.5rem)" }}>
              <div className="ph-title-word opacity-0 overflow-hidden"><span className="block">Arcok,</span></div>
              <div className="ph-title-word opacity-0 overflow-hidden"><span className="block">pillanatok,</span></div>
              <div className="ph-title-word opacity-0 overflow-hidden"><em className="block not-italic text-[#C8A882]">emlékek.</em></div>
            </div>
            <p className="ph-hero-desc opacity-0 text-[13px] font-light text-[#7A6A58] leading-[1.9] max-w-xs">Páros, jegyes, családi és egyéni portré fotózás. Természetes fényben, valódi pillanatokból.</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/contact" className="ph-hero-btn opacity-0 bg-[#1A1510] text-white text-[11px] tracking-[0.18em] uppercase px-7 py-3.5 hover:bg-[#C8A882] transition-all duration-300 whitespace-nowrap">Időpontot kérek</Link>
              <a href="#kategoriák" className="ph-hero-btn opacity-0 text-[11px] tracking-[0.14em] uppercase text-[#7A6A58] border-b border-[#C8A882]/40 pb-0.5 hover:text-[#1A1510] transition-all whitespace-nowrap">Kategóriák →</a>
            </div>
          </div>
          <div className="shrink-0 flex gap-6 pt-4 border-t border-[#EDE8E0]">
            {[{ n: "350+", l: "Portré" }, { n: "5 év", l: "Tapasztalat" }, { n: "2", l: "Fotós" }].map(s => (
              <div key={s.l} className="ph-hero-stat opacity-0">
                <div className="font-['Cormorant_Garamond'] text-[1.5rem] font-light text-[#C8A882] leading-none">{s.n}</div>
                <div className="text-[8px] tracking-[0.12em] uppercase text-[#A08060] mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KATEGÓRIÁK + CSOMAGOK */}
      <section id="kategoriák" className="ph-cat-section py-20 sm:py-28 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
          <div className="ph-cat-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-14">
            <div>
              <div className="flex items-center gap-3 mb-5"><div className="w-8 h-px bg-[#C8A882]" /><span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Mit kínálunk</span></div>
              <h2 className="ph-split font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] text-[#1A1510]">Válaszd ki<br /><em className="not-italic text-[#C8A882]">a te stílusodat</em></h2>
            </div>
          </div>

          {/* Tab gombok */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat, i) => (
              <button key={i} onClick={() => setActiveCategory(i)}
                className={`text-[11px] tracking-[0.12em] uppercase px-4 sm:px-5 py-2.5 border transition-all duration-200 shrink-0 ${activeCategory === i ? "bg-[#1A1510] text-white border-[#1A1510]" : "text-[#7A6A58] border-[#EDE8E0] hover:border-[#C8A882]/50 hover:text-[#1A1510]"}`}>
                {cat.title}
              </button>
            ))}
          </div>

          {/* Képek + szöveg */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start lg:items-center mb-14">
            <div className="grid grid-cols-3 gap-2" style={{ height: "280px" }}>
              {categories[activeCategory].images.map((src, i) => (
                <div key={`${activeCategory}-${i}`} className={`relative overflow-hidden ${i === 1 ? "mt-6" : ""}`}>
                  <Image src={src} alt={categories[activeCategory].title} fill className="object-cover" sizes="(max-width: 768px) 33vw, 20vw" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <div className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882] mb-2">{categories[activeCategory].subtitle}</div>
                <h3 className="font-['Cormorant_Garamond'] text-[clamp(1.6rem,3vw,2.8rem)] font-light text-[#1A1510] leading-[1.1] mb-3">{categories[activeCategory].title}</h3>
                <p className="text-[14px] font-light text-[#7A6A58] leading-[1.9]">{categories[activeCategory].desc}</p>
              </div>
              <Link href="/contact" className="inline-flex items-center gap-3 bg-[#1A1510] text-white text-[11px] tracking-[0.18em] uppercase px-7 py-4 hover:bg-[#C8A882] transition-all duration-300 w-fit">
                Időpontot kérek
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
            </div>
          </div>

          {/* Csomagok – subtype alapján */}
          <div className="ph-packages">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-[#C8A882]" />
              <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">{categories[activeCategory].title} – csomagok</span>
            </div>

            {pkgLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">{[1,2,3].map(i => <PackageSkeleton key={i} />)}</div>
            ) : filteredPackages.length === 0 ? (
              <div className="bg-[#FAF8F4] border border-[#EDE8E0] p-8 text-center">
                <p className="text-[14px] text-[#A08060] mb-3">Ehhez a kategóriához nincs még csomag beállítva.</p>
                <Link href="/contact" className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[#C8A882] border-b border-[#C8A882]/40 pb-0.5">Kérj egyedi ajánlatot →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                {filteredPackages.map((pkg, i) => (
                  <div key={pkg.id} className="ph-pkg-card">
                    <PackageCard pkg={pkg} featured={isFeatured(i, filteredPackages.length)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOTÓSOK – változatlan */}
      <section className="ph-photographers py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
          <div className="flex items-center gap-3 mb-5"><div className="w-8 h-px bg-[#C8A882]" /><span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">A fotósaink</span></div>
          <h2 className="ph-split font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] text-[#1A1510] mb-12 sm:mb-16">Akik a kamera<br /><em className="not-italic text-[#C8A882]">mögött állnak</em></h2>
          <div className="flex flex-col gap-16 sm:gap-24">
            {photographers.map((p, i) => (
              <div key={i} className={`ph-photo-card grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start ${i % 2 !== 0 ? "lg:[direction:rtl]" : ""}`}>
                <div className={`lg:col-span-5 ${i % 2 !== 0 ? "lg:[direction:ltr]" : ""}`}>
                  <div className="relative overflow-hidden border border-[#EDE8E0] mb-4" style={{ aspectRatio: "3/4" }}>
                    <Image src={p.image} alt={p.name} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" sizes="(max-width: 1024px) 100vw, 40vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1510]/20 to-transparent" />
                  </div>
                  <div className="flex flex-wrap gap-2">{p.specialties.map(s => <span key={s} className="text-[9px] tracking-[0.1em] uppercase px-3 py-1.5 border border-[#EDE8E0] text-[#A08060]">{s}</span>)}</div>
                </div>
                <div className={`lg:col-span-7 flex flex-col gap-6 ${i % 2 !== 0 ? "lg:[direction:ltr]" : ""}`}>
                  <div>
                    <div className="flex items-center gap-3 mb-3"><div className="w-6 h-px" style={{ background: p.accent }} /><span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: p.accent }}>Fotós</span></div>
                    <h3 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3rem)] font-light text-[#1A1510] leading-none mb-1">{p.name}</h3>
                    <p className="text-[11px] tracking-[0.12em] uppercase text-[#A08060] mb-4">{p.role}</p>
                    <p className="text-[14px] font-light text-[#7A6A58] leading-[1.9] max-w-lg">{p.bio}</p>
                  </div>
                  <div className="flex gap-8 py-4 border-t border-b border-[#EDE8E0]">{p.stats.map(s => <div key={s.l}><div className="font-['Cormorant_Garamond'] text-[1.8rem] font-light leading-none mb-0.5" style={{ color: p.accent }}>{s.n}</div><div className="text-[9px] tracking-[0.12em] uppercase text-[#A08060]">{s.l}</div></div>)}</div>
                  <div>
                    <div className="flex items-center gap-3 mb-3"><div className="w-5 h-px bg-[#EDE8E0]" /><span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]">Így dolgozom</span></div>
                    <YouTubeEmbed videoId={p.youtubeId} title={`${p.name} – munkamódszer`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA – változatlan */}
      <section className="ph-cta-section relative py-24 sm:py-32 overflow-hidden bg-[#1A1510]">
        <div className="ph-cta-bg absolute overflow-hidden" style={{ inset: "-10% 0" }}>
          <Image src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1600&q=75" alt="Portré háttér" fill className="object-cover opacity-20" sizes="100vw" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6"><div className="w-8 h-px bg-[#C8A882]/50" /><span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/60">Foglalj időpontot</span><div className="w-8 h-px bg-[#C8A882]/50" /></div>
          <h2 className="font-['Cormorant_Garamond'] text-[clamp(2.2rem,5vw,4.5rem)] font-thin leading-[1] text-white mb-6">Örökítsük meg<br /><em className="not-italic text-[#C8A882]">a te pillanataidat</em></h2>
          <p className="text-[14px] text-white/40 leading-[1.9] mb-8 sm:mb-10 max-w-md mx-auto">Egyeztesd az időpontot most, és mi gondoskodunk a többiről.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/contact" className="w-full sm:w-auto bg-white text-[#1A1510] text-[11px] tracking-[0.18em] uppercase px-10 py-4 hover:bg-[#C8A882] hover:text-white transition-colors duration-300 text-center whitespace-nowrap">Időpontot kérek</Link>
            <a href="tel:+36301234567" className="w-full sm:w-auto border border-white/20 text-white/60 text-[11px] tracking-[0.15em] uppercase px-8 py-4 hover:border-[#C8A882]/50 hover:text-white/80 transition-all duration-300 text-center whitespace-nowrap">+36 30 123 4567</a>
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