"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    id: "eskuvo",
    number: "01",
    title: "Esküvő",
    subtitle: "A ti történetetek, örökre.",
    description: "Professzionális esküvői fotózás és videózás, amely megőrzi a nagy nap minden pillanatát — természetes, időtlen stílusban.",
    href: "/wedding",
    tags: ["Fotózás", "Videózás", "Highlight film"],
    theme: "light" as const,
    bg: "#FAF8F4",
    accent: "#C8A882",
    images: [
      { src: "/gallery/wedding/arankatibor-15.JPG", alt: "Esküvői pár", aspect: "3/2" },
      { src: "/gallery/wedding/keszulodes-90.JPG", alt: "Menyasszony", aspect: "3/2" },
      { src: "/gallery/wedding/kreativ-97.JPG", alt: "Virágok", aspect: "3/2" },
      { src: "/gallery/wedding/vanizoli-210.jpg", alt: "Gyűrűk", aspect: "3/2" },
    ],
    stat: { n: "120+", l: "Esküvő" },
  },
  {
    id: "portre",
    number: "02",
    title: "Portré",
    subtitle: "Pillantások — arcok, pillanatok, emlékek.",
    description: "Páros, jegyes, családi és egyéni portré fotózás. Természetes fényben, valódi pillanatokból — mert minden arc mesél valamit.",
    href: "/portrait",
    tags: ["Páros", "Családi", "Egyéni portré"],
    theme: "light" as const,
    bg: "#FFFFFF",
    accent: "#C8A882",
    images: [
      { src: "/gallery/portrait/napraforgo-27.JPG", alt: "Nő portré", aspect: "2/3" },
      { src: "/assets/zugiviki-15.JPG", alt: "Férfi portré", aspect: "2/3" },
      { src: "/gallery/portrait/SzaboReka-1_pp_pp.jpg", alt: "Páros", aspect: "2/3" },
      { src: "/gallery/portrait/marcidorina-76 (1).JPG", alt: "Család", aspect: "3/2" },
      { src: "/gallery/portrait/amiraek-91.jpg", alt: "Családi portré", aspect: "3/2" },
      { src: "/gallery/portrait/marcidorina-68.JPG", alt: "Egyéni portré", aspect: "3/2" },
    ],
    stat: { n: "350+", l: "Portré" },
  },
  {
    id: "rendezvenyek",
    number: "03",
    title: "Rendezvény",
    subtitle: "Minden pillanat számít.",
    description: "Céges rendezvény, fesztivál, party vagy konferencia — mi ott vagyunk és megörökítjük az energiát. Gyors, precíz, profi.",
    href: "/event",
    tags: ["Céges", "Fesztivál", "Magán"],
    theme: "dark" as const,
    bg: "#1A1410",
    accent: "#C8A882",
    images: [
      { src: "/gallery/event/ballagaspg-192.JPG", alt: "Ballagás", aspect: "3/2" },
      { src: "/gallery/event/borfesztUTSO-140.JPG", alt: "Borfesztivál", aspect: "3/2" },
      { src: "/gallery/event/borfesztUTSO-106.JPG", alt: "Tömegrendezvény", aspect: "3/2" },
      { src: "/gallery/event/borfesztUTSO-190.JPG", alt: "Kurultáj", aspect: "3/2" },
      { src: "/gallery/event/borfesztUTSO-164.JPG", alt: "Rendezvény", aspect: "3/2" },
    ],
    stat: { n: "80+", l: "Rendezvény" },
  },
  {
    id: "marketing",
    number: "04",
    title: "Marketing",
    subtitle: "Content, ami megállít.",
    description: "Professzionális fotó és short-form videó tartalom — Instagram, TikTok, Facebook. Amit az algoritmus szeret és az emberek megnéznek.",
    href: "/marketing",
    tags: ["Instagram", "TikTok", "Brand film"],
    theme: "light" as const,
    bg: "#FAF8F4",
    accent: "#1A1510",
    images: [
      { src: "/gallery/marketing/siriusjanuar-28.JPG", alt: "Termékfotó", aspect: "3/2" },
      { src: "/gallery/marketing/siriusMarcius-6.JPG", alt: "TikTok forgatás", aspect: "3/2" },
      { src: "/gallery/marketing/bippu-35.JPG", alt: "Brand videó", aspect: "3/2" },
      { src: "/gallery/marketing/pellikanmarcius-4.JPG", alt: "Influencer", aspect: "3/2" },
      { src: "/gallery/marketing/siriusjanuar-33.JPG", alt: "TikTok", aspect: "3/2" },
    ],
    stat: { n: "500+", l: "Poszt/hó" },
  },
  {
    id: "dron",
    number: "05",
    title: "Drón",
    subtitle: "A világ felülnézetből egészen más.",
    description: "Légifotók és videók, amelyek új perspektívát adnak — engedéllyel, profi felszereléssel, 6K felbontásban.",
    href: "/drone",
    tags: ["Légifotó", "6K videó", "Engedéllyel"],
    theme: "dark" as const,
    bg: "#0C0A08",
    accent: "#C8A882",
    images: [
      { src: "/gallery/drone/alfold-63 másolata.JPG", alt: "Táj légifotó", aspect: "3/2" },
      { src: "/gallery/drone/alfold-64 másolata.JPG", alt: "Város felülről", aspect: "3/2" },
      { src: "/gallery/drone/alfold-65 másolata.JPG", alt: "Absztrakt táj", aspect: "3/2" },
    ],
    stat: { n: "6K", l: "Felbontás" },
  },
];

function SlideImage({ img, accent, heightClass }: {
  img: { src: string; alt: string; aspect: string };
  accent: string;
  heightClass: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative overflow-hidden flex-shrink-0 cursor-pointer rounded-sm ${heightClass} transition-all duration-500`}
      style={{ aspectRatio: img.aspect }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image 
        src={img.src} 
        alt={img.alt} 
        fill 
        className={`object-cover transition-transform duration-1000 ease-out ${hovered ? "scale-110" : "scale-100"}`} 
        sizes="500px"
      />
      <div className={`absolute inset-0 transition-opacity duration-400 ${hovered ? "opacity-100" : "opacity-0"}`}
        style={{ background: `linear-gradient(to top, ${accent}60, transparent)` }} />
    </div>
  );
}

// ── Desktop horizontal scroll ─────────────────────────────────
function DesktopScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: any;
    let mounted = true;
    let refreshTimer: ReturnType<typeof setTimeout>;

    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!mounted) return;

      ScrollTrigger.getAll().forEach(t => t.kill());
      
      await new Promise(resolve => { refreshTimer = setTimeout(resolve, 60); });
      if (!mounted) return;

      ctx = gsap.context(() => {
        const track = trackRef.current;
        const section = sectionRef.current;
        if (!track || !section) return;

        const getTotal = () => track.scrollWidth - window.innerWidth;
        gsap.set(track, { x: 0 });

        gsap.to(track, {
          x: () => -getTotal(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getTotal()}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.to(".hs-progress-bar", {
          scaleX: 1, ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getTotal()}`,
            scrub: true,
          },
        });

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${getTotal()}`,
          onUpdate: (self) => {
            const current = Math.min(Math.ceil(self.progress * slides.length) || 1, slides.length);
            const el = document.querySelector(".hs-counter-current");
            if (el) el.textContent = String(current).padStart(2, "0");
          },
        });
      }, sectionRef);
    }

    init();
    return () => {
      mounted = false;
      clearTimeout(refreshTimer);
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden h-screen">
      <div className="absolute right-12 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 pointer-events-none mix-blend-difference">
        <span className="hs-counter-current font-['Cormorant_Garamond'] text-3xl font-light text-white">01</span>
        <div className="w-px h-12 bg-white/30" />
        <span className="font-['Cormorant_Garamond'] text-lg font-light text-white/40">{String(slides.length).padStart(2, "0")}</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-black/5 z-30">
        <div className="hs-progress-bar h-full bg-[#C8A882] origin-left scale-x-0" />
      </div>

      <div ref={trackRef} className="flex h-full will-change-transform">
        {slides.map((slide, i) => {
          const isDark = slide.theme === "dark";
          return (
            <div key={i} className="relative flex-shrink-0 w-screen h-full flex flex-col justify-center" style={{ backgroundColor: slide.bg }}>
              <div className="absolute pointer-events-none select-none font-['Cormorant_Garamond'] font-light leading-none z-0"
                style={{ fontSize: "28vw", color: isDark ? "rgba(200,168,130,0.03)" : "rgba(200,168,130,0.06)", bottom: "-2rem", right: "2rem" }}>
                {slide.number}
              </div>

              <div className="relative z-10 w-full px-16 lg:px-24">
                <div className="grid grid-cols-12 gap-12 mb-16">
                  <div className="col-span-6">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-px" style={{ background: slide.accent }} />
                      <span className="text-[11px] tracking-[0.3em] uppercase font-medium" style={{ color: slide.accent }}>
                        {slide.number} / {String(slides.length).padStart(2, "0")}
                      </span>
                    </div>
                    <h2 className={`font-['Cormorant_Garamond'] font-light leading-[0.9] tracking-tighter mb-6 ${isDark ? "text-white" : "text-[#1A1510]"}`}
                      style={{ fontSize: "clamp(4rem, 8vw, 7.5rem)" }}>
                      {slide.title}
                    </h2>
                    <p className={`font-['Cormorant_Garamond'] text-2xl font-light italic ${isDark ? "text-white/40" : "text-[#A08060]"}`}>
                      {slide.subtitle}
                    </p>
                  </div>

                  <div className="col-span-5 col-start-8 flex flex-col justify-end">
                    <p className={`text-[14px] font-light leading-relaxed mb-8 max-w-md ${isDark ? "text-white/60" : "text-[#7A6A58]"}`}>
                      {slide.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-10">
                      {slide.tags.map(tag => (
                        <span key={tag} className="text-[10px] tracking-widest uppercase px-4 py-2 border rounded-full"
                          style={{ color: slide.accent, borderColor: `${slide.accent}30` }}>{tag}</span>
                      ))}
                    </div>
                    <div className={`flex items-center justify-between pt-8 border-t ${isDark ? "border-white/10" : "border-black/5"}`}>
                      <div>
                        <div className="font-['Cormorant_Garamond'] text-4xl font-light" style={{ color: slide.accent }}>{slide.stat.n}</div>
                        <div className={`text-[10px] tracking-widest uppercase mt-1 opacity-50 ${isDark ? "text-white" : "text-black"}`}>{slide.stat.l}</div>
                      </div>
                      <Link href={slide.href} className={`group flex items-center gap-3 text-[12px] tracking-widest uppercase ${isDark ? "text-white" : "text-[#1A1510]"}`}>
                        <span>Részletek</span>
                        <div className="w-8 h-px bg-current transition-all group-hover:w-12" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 items-end">
                  {slide.images.map((img, j) => (
                    <SlideImage key={j} img={img} accent={slide.accent} heightClass="h-[300px] xl:h-[250px]" />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Mobil vertikális kártyák ──────────────────────────────────
function MobileSlides() {
  return (
    <div className="lg:hidden flex flex-col">
      {slides.map((slide, i) => {
        const isDark = slide.theme === "dark";
        return (
          <div key={i} className="relative overflow-hidden py-16 px-6" style={{ backgroundColor: slide.bg }}>
            <div className="absolute pointer-events-none select-none font-['Cormorant_Garamond'] font-light opacity-60"
              style={{ fontSize: "10rem", color: isDark ? "rgba(200,168,130,0.05)" : "rgba(200,168,130,0.08)", lineHeight: 0.9, bottom: "-1rem", right: "1rem" }}>
              {slide.number}
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px" style={{ background: slide.accent }} />
                <span className="text-[9px] tracking-[0.22em] uppercase font-light" style={{ color: slide.accent }}>
                  {slide.number} / {String(slides.length).padStart(2, "0")}
                </span>
              </div>

              <h2 className={`font-['Cormorant_Garamond'] font-light leading-[0.95] tracking-tighter mb-2 ${isDark ? "text-white" : "text-black"}`}
                style={{ fontSize: "clamp(2.4rem, 10vw, 4rem)" }}>
                {slide.title}
              </h2>
              <p className={`font-['Cormorant_Garamond'] text-[1rem] font-light italic mb-4 ${isDark ? "text-white/40" : "text-[#A08060]"}`}>{slide.subtitle}</p>
              <p className={`text-[13px] font-light leading-relaxed mb-6 ${isDark ? "text-white/60" : "text-[#7A6A58]"}`}>{slide.description}</p>

              <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-none snap-x snap-mandatory items-end">
                {slide.images.map((img, j) => (
                  <div key={j} className="relative overflow-hidden flex-shrink-0 rounded-sm snap-start h-[250px]" style={{ aspectRatio: img.aspect }}>
                    <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="300px" />
                  </div>
                ))}
              </div>

              <div className={`flex items-center justify-between pt-6 mt-6 border-t ${isDark ? "border-white/10" : "border-black/5"}`}>
                <div>
                  <div className="font-['Cormorant_Garamond'] text-3xl font-light" style={{ color: slide.accent }}>{slide.stat.n}</div>
                  <div className="text-[8px] tracking-widest uppercase opacity-50">{slide.stat.l}</div>
                </div>
                <Link href={slide.href} className="text-[11px] tracking-widest uppercase border-b pb-0.5">
                  Részletek →
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HorizontalScrollSection() {
  return (
    <main className="bg-white">
      <div className="hidden lg:block">
        <DesktopScroll />
      </div>
      <MobileSlides />
    </main>
  );
}