"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Button from "@/app/components/Button";

// ── Particle Mesh (Változatlan) ──────────────────────
function useParticleMesh(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let mouse = { x: -1000, y: -1000 };
    let particles: any[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.vx = 0;
        this.vy = 0;
        this.size = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.4 + 0.1;
      }
      update(mouseX: number, mouseY: number) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const REPEL_RADIUS = 120;
        if (dist < REPEL_RADIUS) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          this.vx -= (dx / dist) * force * 3;
          this.vy -= (dy / dist) * force * 3;
        }
        this.vx += (this.baseX - this.x) * 0.04;
        this.vy += (this.baseY - this.y) * 0.04;
        this.vx *= 0.85;
        this.vy *= 0.85;
        this.x += this.vx;
        this.y += this.vy;
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 140, 100, ${this.opacity})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const COLS = Math.floor(canvas!.width / 55);
      const ROWS = Math.floor(canvas!.height / 55);
      for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
          particles.push(
            new Particle(
              (canvas!.width / COLS) * i +
                canvas!.width / COLS / 2 +
                (Math.random() - 0.5) * 12,
              (canvas!.height / ROWS) * j +
                canvas!.height / ROWS / 2 +
                (Math.random() - 0.5) * 12,
            ),
          );
        }
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach((p) => {
        p.update(mouse.x, mouse.y);
        p.draw(ctx!);
      });
      animId = requestAnimationFrame(animate);
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    resize();
    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [canvasRef]);
}

// ── FIXÁLT PARALLAX: Nincs State, nincs re-render! ──
function useParallaxRef(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 30;
      targetY = (e.clientY / window.innerHeight - 0.5) * 30;
    };

    const update = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener("mousemove", onMove);
    update();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, [containerRef]);
}

export default function HeroInteractive() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const parallaxBoxRef = useRef<HTMLDivElement>(null);

  useParticleMesh(canvasRef);
  useParallaxRef(parallaxBoxRef); // A stat kártyák dobozát mozgatja

  useEffect(() => {
    let ctx: any;
    async function init() {
      const { gsap } = await import("gsap");
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "power4.out", duration: 1.2 },
        });

        // Beállítjuk a kezdőpontot a GSAP-pel, és onnan indítjuk
        tl.fromTo(
          ".hero-eyebrow-v2",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
        )
          .fromTo(
            ".hero-title-v2 > *",
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, stagger: 0.15 },
            "-=0.5",
          )
          .fromTo(
            ".hero-desc-v2",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0 },
            "-=0.7",
          )
          .fromTo(
            ".hero-cta-v2",
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0 },
            "-=0.8",
          )
          .fromTo(
            ".stat-card-v2",
            { opacity: 0, x: 30 },
            { opacity: 1, x: 0, stagger: 0.1 },
            "-=0.8",
          );
      }, sectionRef);
    }
    init();
    return () => ctx?.revert();
  }, []);

  const stats = [
    { number: "320+", label: "Projekt" },
    { number: "8 év", label: "Tapasztalat" },
    { number: "98%", label: "Elégedett ügyfél" },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[680px] flex items-center overflow-hidden bg-[#F5EFE6]"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 30% 50%, rgba(245,239,230,0.85) 0%, rgba(245,239,230,0.4) 60%, transparent 100%)`,
          zIndex: 2,
        }}
      />

      <div
        className="relative w-full max-w-7xl mx-auto px-8 lg:px-16"
        style={{ zIndex: 3 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="hero-eyebrow-v2 opacity-0 flex items-center gap-3 mb-8">
              <div className="w-10 h-px bg-[#C8A882]" />
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#A08060] font-light">
                Fotó & Videó Stúdió
              </span>
            </div>

            <h1
              className="hero-title-v2 font-['Cormorant_Garamond'] font-thin leading-[0.92] tracking-[-0.02em] text-[#1A1510] mb-8"
              style={{ fontSize: "clamp(4rem, 9vw, 8.5rem)" }}
            >
              <span className="block opacity-0">Képek, amik</span>
              <em className="block not-italic text-[#C8A882] opacity-0">
                mesélnek
              </em>
            </h1>

            <p className="hero-desc-v2 opacity-0 max-w-sm text-[14px] font-light text-[#7A6A58] leading-[1.9] mb-10">
              Professzionális fotó és videó alkotások,
              <br />
              amelyek mesélnek a te történetedről.
            </p>

            <div className="hero-cta-v2 opacity-0 flex items-center gap-5">
              <Button
                variant="primary"
                size="lg"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-4 h-4"
                  >
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
                className="text-[11px] tracking-[0.14em] uppercase text-[#7A6A58] border-b border-[#C8A882]/40 pb-0.5 hover:text-[#1A1510] transition-all"
              >
                Galéria →
              </Link>
            </div>
          </div>

          {/* JOBB OLDAL: A ParallaxBoxRef mozgatja a konténert, a stat-card-v2 pedig animálódik benne */}
          <div className="lg:col-span-4 lg:col-start-9 hidden lg:block">
            <div
              ref={parallaxBoxRef}
              className="flex flex-col gap-3 will-change-transform"
            >
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="stat-card-v2 opacity-0 bg-white/60 backdrop-blur-md border border-[#C8A882]/20 px-6 py-4"
                >
                  <div className="font-['Cormorant_Garamond'] font-light text-[#C8A882] text-[2.2rem] leading-none mb-1">
                    {s.number}
                  </div>
                  <div className="text-[9px] tracking-[0.15em] uppercase text-[#A08060]/70">
                    {s.label}
                  </div>
                </div>
              ))}
              <div className="mt-2 flex items-center gap-3 pl-2 opacity-0 stat-card-v2">
                <div className="w-6 h-px bg-[#C8A882]/40" />
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]/40">
                  Budapest, HU
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 3 }}
      >
        <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]/50">
          Scroll
        </span>
        <div className="w-px h-14 bg-gradient-to-b from-[#C8A882]/60 to-transparent animate-scroll" />
      </div>

      <style jsx>{`
        .animate-scroll {
          animation: scrollPulse 2s ease-in-out infinite;
          transform-origin: top;
        }
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
    </section>
  );
}
