"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/app/components/Button";

function useParallaxRef(
  containerRef: React.RefObject<HTMLDivElement | null>,
  strength = 30
) {
  useEffect(() => {
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0, rafId: number;
    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * strength;
      targetY = (e.clientY / window.innerHeight - 0.5) * strength;
    };
    const update = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      if (containerRef.current)
        containerRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      rafId = requestAnimationFrame(update);
    };
    window.addEventListener("mousemove", onMove);
    update();
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafId); };
  }, [containerRef, strength]);
}

export default function HeroInteractive() {
  const sectionRef = useRef<HTMLElement>(null);
  const collageContainerRef = useRef<HTMLDivElement>(null);
  useParallaxRef(collageContainerRef, 12);

  useEffect(() => {
    let ctx: any;
    let mounted = true;

    async function init() {
      const { gsap } = await import("gsap");
      if (!mounted) return;

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl
          .fromTo(".hero-eyebrow-v2", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 })
          .fromTo(".hero-title-v2 > *", { opacity: 0, y: 60 }, { opacity: 1, y: 0, stagger: 0.15, duration: 1.2 }, "-=0.5")
          .fromTo(".hero-desc-v2", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.7")
          .fromTo(".hero-cta-v2", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.6")
          .fromTo(".hero-collage-img", { opacity: 0, scale: 0.88, y: 30 }, { opacity: 1, scale: 1, y: 0, stagger: 0.12, duration: 1, ease: "power3.out" }, "-=0.8")
          .fromTo(".hero-tag-strip > *", { opacity: 0, x: -10 }, { opacity: 1, x: 0, stagger: 0.06, duration: 0.5 }, "-=0.5");
      }, sectionRef);
    }

    init();
    return () => { mounted = false; ctx?.revert(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full flex items-center overflow-hidden bg-[#FFFFFF]"
      style={{ minHeight: "100svh" }}
    >

      {/* ── Finom háttér textúra ── */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        {/* Rácsvonalas minta */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(200,168,130,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(200,168,130,1) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
        {/* Radial fény a bal oldalon */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 70% at 15% 50%, rgba(255,250,240,0.7) 0%, transparent 65%)`
          }}
        />
      </div>

      {/* ── Tartalom ── */}
      <div className="relative w-full max-w-7xl mx-auto px-8 lg:px-16 py-24 lg:py-0" style={{ zIndex: 2 }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-center" style={{ minHeight: "100svh" }}>

          {/* ── BAL: szöveg ── */}
          <div className="lg:col-span-6 flex flex-col justify-center">

            <div className="hero-eyebrow-v2 opacity-0 flex items-center gap-3 mb-8">
              <div className="w-10 h-px bg-[#C8A882]" />
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#A08060] font-light">
                Fotó & Videó Stúdió · Budapest
              </span>
            </div>

            <h1
              className="hero-title-v2 font-['Cormorant_Garamond'] font-thin leading-[0.9] tracking-[-0.02em] text-[#1A1510] mb-8"
              style={{ fontSize: "clamp(3.2rem, 6.5vw, 7.5rem)" }}
            >
              <span className="block opacity-0">Képek,</span>
              <span className="block opacity-0">amik</span>
              <em className="block not-italic opacity-0 text-[#C8A882]">mesélnek</em>
            </h1>

            <p className="hero-desc-v2 opacity-0 max-w-xs text-[13px] font-light text-[#7A6A58] leading-[1.9] mb-10">
              Professzionális fotó és videó alkotások,<br />amelyek mesélnek a te történetedről.
            </p>

            {/* CTA */}
            <div className="hero-cta-v2 opacity-0 flex items-center gap-6 mb-12">
              <Button
                variant="primary"
                size="lg"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                }
                iconPosition="right"
              >
                Projekt indítása
              </Button>
              <Link
                href="/gallery"
                className="text-[11px] tracking-[0.14em] uppercase text-[#7A6A58] border-b border-[#C8A882]/40 pb-0.5 hover:text-[#1A1510] hover:border-[#C8A882] transition-all duration-200"
              >
                Galéria →
              </Link>
            </div>

            {/* Szolgáltatás tagek */}
            <div className="hero-tag-strip flex flex-wrap gap-2">
              {["Portréfotózás", "Esküvők", "Reklámfilm", "Drón", "Termékfotó", "Dokumentumfilm"].map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] tracking-[0.14em] uppercase px-3 py-1.5 border border-[#C8A882]/25 text-[#A08060]/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── JOBB: képkollázs ── */}
          <div className="lg:col-span-6 hidden lg:flex items-center justify-center">
            <div
              ref={collageContainerRef}
              className="relative will-change-transform"
              style={{ width: "480px", height: "560px" }}
            >

              {/* Kép 1 – bal felső, álló portré */}
              <div className="hero-collage-img absolute top-0 left-6 will-change-transform" style={{ zIndex: 3 }}>
                <div className="relative overflow-hidden shadow-xl -rotate-2 border border-[#DDD5C8]" style={{ width: "190px", height: "250px" }}>
                  <Image
                    src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80"
                    alt="Esküvői fotó"
                    fill className="object-cover"
                    sizes="190px" priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C8A882]/8 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[8px] tracking-[0.12em] uppercase text-white/70 bg-[#1A1510]/40 backdrop-blur-sm px-1.5 py-0.5">Portré</span>
                  </div>
                </div>
              </div>

              {/* Kép 2 – jobb felső, fekvő videós */}
              <div className="hero-collage-img absolute top-10 right-0 will-change-transform" style={{ zIndex: 2 }}>
                <div className="relative overflow-hidden shadow-lg rotate-1 border border-[#DDD5C8]" style={{ width: "220px", height: "150px" }}>
                  <Image
                    src="https://images.unsplash.com/photo-1601506521793-dc748fc80b67?w=600&q=80"
                    alt="Videó forgatás"
                    fill className="object-cover"
                    sizes="220px" priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C8A882]/8 to-transparent" />
                  {/* Play gomb */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5 ml-0.5 opacity-80">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-3">
                    <span className="text-[8px] tracking-[0.12em] uppercase text-white/70 bg-[#1A1510]/40 backdrop-blur-sm px-1.5 py-0.5">Videó</span>
                  </div>
                </div>
              </div>

              {/* Kép 3 – középső fő kép */}
              <div className="hero-collage-img absolute will-change-transform" style={{ top: "180px", left: "80px", zIndex: 4 }}>
                <div className="relative overflow-hidden shadow-2xl rotate-1 border border-[#DDD5C8]" style={{ width: "200px", height: "260px" }}>
                  <Image
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80"
                    alt="Esemény fotózás"
                    fill className="object-cover"
                    sizes="200px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1510]/30 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[8px] tracking-[0.12em] uppercase text-white/80 bg-[#1A1510]/40 backdrop-blur-sm px-1.5 py-0.5">Esemény</span>
                  </div>
                </div>
              </div>

              {/* Kép 4 – bal alsó, drón */}
              <div className="hero-collage-img absolute bottom-0 left-0 will-change-transform" style={{ zIndex: 2 }}>
                <div className="relative overflow-hidden shadow-lg -rotate-1 border border-[#DDD5C8]" style={{ width: "170px", height: "140px" }}>
                  <Image
                    src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80"
                    alt="Drón felvétel"
                    fill className="object-cover"
                    sizes="170px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C8A882]/10 to-transparent" />
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[8px] tracking-[0.12em] uppercase text-white/70 bg-[#1A1510]/40 backdrop-blur-sm px-1.5 py-0.5">Drón</span>
                  </div>
                </div>
              </div>

              {/* Kép 5 – jobb alsó */}
              <div className="hero-collage-img absolute bottom-10 right-2 will-change-transform" style={{ zIndex: 3 }}>
                <div className="relative overflow-hidden shadow-lg rotate-2 border border-[#DDD5C8]" style={{ width: "150px", height: "185px" }}>
                  <Image
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80"
                    alt="Portré"
                    fill className="object-cover"
                    sizes="150px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C8A882]/8 to-transparent" />
                </div>
              </div>

              {/* Stat badge 1 – arany */}
              <div
                className="hero-collage-img absolute bg-[#C8A882] px-4 py-3 shadow-lg"
                style={{ top: "155px", right: "8px", zIndex: 5 }}
              >
                <div className="font-['Cormorant_Garamond'] text-[1.8rem] font-light text-white leading-none">320+</div>
                <div className="text-[8px] tracking-[0.15em] uppercase text-white/70 mt-0.5">Projekt</div>
              </div>

              {/* Stat badge 2 – krém */}
              <div
                className="hero-collage-img absolute bg-[#FAF8F4] border border-[#EDE8E0] px-4 py-3 shadow-lg"
                style={{ top: "380px", left: "4px", zIndex: 5 }}
              >
                <div className="font-['Cormorant_Garamond'] text-[1.8rem] font-light text-[#C8A882] leading-none">8 év</div>
                <div className="text-[8px] tracking-[0.15em] uppercase text-[#A08060]/70 mt-0.5">Tapasztalat</div>
              </div>

              {/* Dekoratív sarokdíszek */}
              <div className="absolute -top-4 -right-4 w-16 h-16 border-t border-r border-[#C8A882]/25" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 border-b border-l border-[#C8A882]/25" />
            </div>
          </div>
        </div>
      </div>

      {/* Bal oldali vertikális felirat */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4" style={{ zIndex: 3 }}>
        <div className="w-px h-16 bg-gradient-to-b from-transparent to-[#C8A882]/30" />
        <span
          className="text-[8px] tracking-[0.3em] uppercase text-[#C8A882]/40 font-light"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          OptikArt Studio
        </span>
        <div className="w-px h-16 bg-gradient-to-b from-[#C8A882]/30 to-transparent" />
      </div>

      {/* Scroll indikátor */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ zIndex: 3 }}>
        <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]/50">Scroll</span>
        <div className="w-px h-14 bg-gradient-to-b from-[#C8A882]/50 to-transparent animate-scroll" />
      </div>

      <style jsx>{`
        .animate-scroll { animation: scrollPulse 2s ease-in-out infinite; transform-origin: top; }
        @keyframes scrollPulse {
          0% { transform: scaleY(0); opacity: 1; transform-origin: top; }
          50% { transform: scaleY(1); opacity: 1; transform-origin: top; }
          51% { transform-origin: bottom; }
          100% { transform: scaleY(0); opacity: 0; transform-origin: bottom; }
        }
      `}</style>
    </section>
  );
}