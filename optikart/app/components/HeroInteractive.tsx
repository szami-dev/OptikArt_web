"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/app/components/Button";


// ── Canvas particle mesh – egérre reagál ──────────────────────
function useParticleMesh(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let mouse = { x: -1000, y: -1000 };
    let particles: Particle[] = [];

    // Canvas méret beállítás
    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
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
        const REPEL_FORCE = 3;

        if (dist < REPEL_RADIUS) {
          // Taszítás az egértől
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          this.vx -= (dx / dist) * force * REPEL_FORCE;
          this.vy -= (dy / dist) * force * REPEL_FORCE;
        }

        // Visszahúzás az alaphelyzetbe (rugóerő)
        const SPRING = 0.04;
        const DAMPING = 0.85;
        this.vx += (this.baseX - this.x) * SPRING;
        this.vy += (this.baseY - this.y) * SPRING;
        this.vx *= DAMPING;
        this.vy *= DAMPING;

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
          // Kis véletlenszerű elcsúszás a rácshoz képest
          const jitter = 12;
          const x = (canvas!.width / COLS) * i + (canvas!.width / COLS) / 2 + (Math.random() - 0.5) * jitter;
          const y = (canvas!.height / ROWS) * j + (canvas!.height / ROWS) / 2 + (Math.random() - 0.5) * jitter;
          particles.push(new Particle(x, y));
        }
      }
    }

    function drawConnections() {
      const MAX_DIST = 90;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DIST) {
            const opacity = (1 - dist / MAX_DIST) * 0.12;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(180, 140, 100, ${opacity})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
    }

    // Egér mozgás – parallax ripple kör
    let ripples: { x: number; y: number; r: number; opacity: number }[] = [];

    function drawRipple() {
      ripples = ripples.filter((r) => r.opacity > 0.01);
      ripples.forEach((r) => {
        ctx!.beginPath();
        ctx!.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(200, 168, 130, ${r.opacity})`;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();
        r.r += 1.5;
        r.opacity *= 0.96;
      });
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      drawConnections();
      drawRipple();

      particles.forEach((p) => {
        p.update(mouse.x, mouse.y);
        p.draw(ctx!);
      });

      animId = requestAnimationFrame(animate);
    }

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Ripple hozzáadása ritkán
      if (Math.random() < 0.08) {
        ripples.push({ x: e.clientX, y: e.clientY, r: 5, opacity: 0.25 });
      }
    }

    function onMouseLeave() {
      mouse.x = -1000;
      mouse.y = -1000;
    }

    resize();
    animate();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [canvasRef]);
}

// ── Lebegő parallax elem – egérrel mozog ─────────────────────
function useMouseParallax() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      targetRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    }

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function tick() {
      currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.06);
      currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.06);
      setPos({ ...currentRef.current });
      rafRef.current = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return pos;
}

// ── Fő Hero komponens ─────────────────────────────────────────
export default function HeroInteractive() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useMouseParallax();

  useParticleMesh(canvasRef);

  useEffect(() => {
    let ctx: any;

    async function init() {
      const { gsap } = await import("gsap");

      ctx = gsap.context(() => {
        // Betöltési animációk
        const tl = gsap.timeline({ delay: 0.3 });

        tl.from(".hero-eyebrow-v2", { opacity: 0, y: 16, duration: 0.7, ease: "power3.out" })
          .from(".hero-title-v2 > *", { opacity: 0, y: 50, stagger: 0.12, duration: 0.9, ease: "power4.out" }, "-=0.3")
          .from(".hero-desc-v2", { opacity: 0, y: 20, duration: 0.7, ease: "power2.out" }, "-=0.4")
          .from(".hero-cta-v2", { opacity: 0, y: 16, duration: 0.6, ease: "power2.out" }, "-=0.3")
          .from(".hero-float-cards > *", {
            opacity: 0,
            x: 20,
            stagger: 0.1,
            duration: 0.6,
            ease: "power2.out",
          }, "-=0.4");
      });
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
    <section className="relative h-screen min-h-[680px] flex items-center overflow-hidden bg-[#F5EFE6]">

      {/* Canvas háttér – particle mesh */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 30% 50%, rgba(245,239,230,0.85) 0%, rgba(245,239,230,0.4) 60%, transparent 100%),
            radial-gradient(ellipse 50% 70% at 80% 30%, rgba(200,168,130,0.08) 0%, transparent 50%)
          `,
          zIndex: 2,
        }}
      />

      {/* Tartalom */}
      <div className="relative w-full max-w-7xl mx-auto px-8 lg:px-16" style={{ zIndex: 3 }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Bal: szöveg */}
          <div className="lg:col-span-7">

            {/* Eyebrow */}
            <div className="hero-eyebrow-v2 flex items-center gap-3 mb-8">
              <div className="w-10 h-px bg-[#C8A882]" />
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#A08060] font-light">
                Fotó & Videó Stúdió
              </span>
            </div>

            {/* Cím */}
            <h1
              className="hero-title-v2 font-['Cormorant_Garamond'] font-thin leading-[0.92] tracking-[-0.02em] text-[#1A1510] mb-8"
              style={{ fontSize: "clamp(4rem, 9vw, 8.5rem)" }}
            >
              <span className="block">Képek, amik</span>
              <em className="block not-italic text-[#C8A882]">mesélnek</em>
            </h1>

            {/* Leírás */}
            <p className="hero-desc-v2 max-w-sm text-[14px] font-light text-[#7A6A58] leading-[1.9] tracking-[0.03em] mb-10">
              Professzionális fotó és videó alkotások,<br />
              amelyek mesélnek a te történetedről.
            </p>

            {/* CTA */}
            <div className="hero-cta-v2 flex items-center gap-5">
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
          </div>

          {/* Jobb: lebegő stat kártyák – egérrel mozognak */}
          <div
            className="hero-float-cards lg:col-span-4 lg:col-start-9 hidden lg:flex flex-col gap-3"
            style={{
              transform: `translate(${mouse.x * 14}px, ${mouse.y * 10}px)`,
              transition: "transform 0.1s linear",
              willChange: "transform",
            }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                className="bg-white/60 backdrop-blur-md border border-[#C8A882]/20 px-6 py-4"
                style={{
                  transform: `translate(${mouse.x * (i + 1) * 3}px, ${mouse.y * (i + 1) * 2}px)`,
                  transition: "transform 0.15s linear",
                }}
              >
                <div
                  className="font-['Cormorant_Garamond'] font-light text-[#C8A882] leading-none mb-1"
                  style={{ fontSize: "2.2rem" }}
                >
                  {s.number}
                </div>
                <div className="text-[9px] tracking-[0.15em] uppercase text-[#A08060]/70">
                  {s.label}
                </div>
              </div>
            ))}

            {/* Extra lebegő dekoratív elem – más sebességgel mozog */}
            <div
              className="mt-2 flex items-center gap-3 pl-2"
              style={{
                transform: `translate(${mouse.x * -8}px, ${mouse.y * -5}px)`,
                transition: "transform 0.2s linear",
              }}
            >
              <div className="w-6 h-px bg-[#C8A882]/40" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]/40">
                Budapest, HU
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indikátor */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ zIndex: 3 }}>
        <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]/50">Scroll</span>
        <div
          className="w-px h-14 origin-top"
          style={{
            background: "linear-gradient(to bottom, rgba(200,168,130,0.6), transparent)",
            animation: "scrollPulse 2s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
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
