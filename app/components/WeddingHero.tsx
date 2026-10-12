"use client";

// app/components/WeddingHero.tsx
// FIX: navbar magasság offset a tartalom elején

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_H = 68;

export default function WeddingHero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx: any;
    let mounted = true;
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
        const section = sectionRef.current;
        const lines = gsap.utils.toArray<HTMLElement>(".wh-title-line");
        const inners = gsap.utils.toArray<HTMLElement>(".wh-title-inner");
        gsap.set(lines, { opacity: 1 });

        const split = new SplitText(inners, { type: "chars" });
        splits.push(split);

        // Számlálók: nulláról indulnak az intro végén
        const counters = gsap.utils.toArray<HTMLElement>(".wh-count");
        counters.forEach((el) => {
          el.textContent = "0" + (el.getAttribute("data-suf") ?? "");
        });

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(
          ".wh-photo",
          { filter: "blur(22px) brightness(0.55)", scale: 1.16 },
          {
            filter: "blur(0px) brightness(1)",
            scale: 1,
            duration: 2.4,
            ease: "power3.inOut",
          },
          0,
        )
          .fromTo(
            ".wh-hud",
            { autoAlpha: 0, scale: 1.8 },
            { autoAlpha: 1, scale: 1, duration: 0.9, stagger: 0.08 },
            0.4,
          )
          .fromTo(
            ".wh-line-left",
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 1,
              ease: "power3.out",
              transformOrigin: "top center",
            },
            0.4,
          )
          .fromTo(
            ".wh-eyebrow",
            { opacity: 0, x: -16 },
            { opacity: 1, x: 0, duration: 0.7 },
            0.8,
          )
          .fromTo(
            split.chars,
            { yPercent: 115, rotate: 5, autoAlpha: 0 },
            {
              yPercent: 0,
              rotate: 0,
              autoAlpha: 1,
              stagger: 0.03,
              duration: 1.1,
              ease: "power4.out",
            },
            1.0,
          )
          .fromTo(
            ".wh-cta-item",
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 },
            1.6,
          )
          .fromTo(
            ".wh-side-panel",
            { opacity: 0, x: 24 },
            { opacity: 1, x: 0, duration: 0.9 },
            1.3,
          )
          .fromTo(
            ".wh-bottom-item",
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 0.5 },
            1.8,
          );

        counters.forEach((el) => {
          const target = parseInt(el.getAttribute("data-val") ?? "0");
          const suf = el.getAttribute("data-suf") ?? "";
          const obj = { v: 0 };
          tl.to(
            obj,
            {
              v: target,
              duration: 1.8,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = Math.round(obj.v) + suf;
              },
            },
            1.5,
          );
        });

        // Scroll-parallax
        gsap.to(".wh-bg-img", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });

        // Egér-parallax + követő arany fény
        const mouseEl = section?.querySelector(".wh-mouse");
        if (section && mouseEl) {
          const mx = gsap.quickTo(mouseEl, "x", { duration: 1.2, ease: "power3" });
          const my = gsap.quickTo(mouseEl, "y", { duration: 1.2, ease: "power3" });
          const glow = section.querySelector<HTMLElement>(".wh-glow");
          const onMove = (e: PointerEvent) => {
            const r = section.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            mx((px - 0.5) * -26);
            my((py - 0.5) * -16);
            if (glow) {
              glow.style.setProperty("--gx", `${e.clientX - r.left}px`);
              glow.style.setProperty("--gy", `${e.clientY - r.top}px`);
              glow.style.opacity = "1";
            }
          };
          const onLeave = () => {
            if (glow) glow.style.opacity = "0";
          };
          section.addEventListener("pointermove", onMove);
          section.addEventListener("pointerleave", onLeave);
          cleanups.push(() => {
            section.removeEventListener("pointermove", onMove);
            section.removeEventListener("pointerleave", onLeave);
          });
        }

        // Mágneses gombok
        gsap.utils.toArray<HTMLElement>(".wh-cta-item").forEach((el) => {
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
      }, sectionRef);
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
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#0D0B08]"
      style={{ height: "100svh", minHeight: "600px" }}
    >
      {/* Háttérkép: scroll-parallax > egér-parallax > fókuszhúzás */}
      <div
        className="absolute inset-x-0 overflow-hidden"
        style={{ top: "-5%", bottom: "-5%" }}
      >
        <div className="wh-bg-img absolute inset-0 will-change-transform">
          <div className="wh-mouse absolute inset-[-3%] will-change-transform">
            <div className="wh-photo absolute inset-0 will-change-[filter,transform]">
              <Image
                src="/gallery/wedding/bialaci-464.jpg"
                alt="Esküvői fotó"
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

      {/* Gradiens */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `
          linear-gradient(105deg, rgba(13,11,8,0.93) 0%, rgba(13,11,8,0.65) 42%, rgba(13,11,8,0.18) 75%, rgba(13,11,8,0.08) 100%),
          linear-gradient(to top, rgba(13,11,8,0.75) 0%, transparent 35%)
        `,
        }}
      />

      {/* Egeret követő meleg fény */}
      <div
        aria-hidden
        className="wh-glow pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-700 mix-blend-screen"
        style={{
          background:
            "radial-gradient(420px circle at var(--gx, 70%) var(--gy, 50%), rgba(200,168,130,0.20), transparent 65%)",
        }}
      />

      {/* Keresőkeret HUD */}
      <div
        aria-hidden
        className="absolute inset-4 sm:inset-6 z-[2] pointer-events-none"
      >
        <span className="wh-hud absolute top-0 left-0 w-8 h-8 border-t border-l border-white/45" />
        <span className="wh-hud absolute top-0 right-0 w-8 h-8 border-t border-r border-white/45" />
        <span className="wh-hud absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/45" />
        <span className="wh-hud absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/45" />
      </div>

      {/* Tartalom */}
      <div
        className="relative z-[2] flex flex-col w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16"
        style={{ height: "100%" }}
      >
        {/* Felső sor – navbar alól indul */}
        <div
          className="flex items-start gap-5"
          style={{ paddingTop: `${NAV_H + 12}px` }}
        >
          <div
            className="wh-line-left w-px bg-[#C8A882]/40 origin-top shrink-0"
            style={{ height: "72px" }}
          />
          <div className="wh-eyebrow opacity-0 flex flex-col gap-1 pt-1">
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#C8A882]/70">
              OptikArt Studio
            </span>
            <span className="text-[9px] tracking-[0.3em] uppercase text-white/30">
              Esküvői fotó & videó
            </span>
          </div>
        </div>

        {/* Középső */}
        <div className="flex-1 flex items-center py-8">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end">
            <div className="lg:col-span-8 xl:col-span-7">
              <div
                className="font-['Cormorant_Garamond'] font-thin text-white leading-[0.85] tracking-[-0.03em]"
                style={{ fontSize: "clamp(3.2rem, 7.5vw, 10.5rem)" }}
              >
                <div className="wh-title-line opacity-0 overflow-hidden pt-[0.16em] -mt-[0.16em] pb-[0.1em]">
                  <span className="wh-title-inner block">A ti</span>
                </div>
                <div className="wh-title-line opacity-0 overflow-hidden pt-[0.16em] -mt-[0.16em] pb-[0.1em]">
                  <span className="wh-title-inner block">történetetek</span>
                </div>
                <div className="wh-title-line opacity-0 overflow-hidden pt-[0.16em] -mt-[0.16em] pb-[0.1em]">
                  <em
                    className="wh-title-inner block not-italic"
                    style={{ color: "#C8A882" }}
                  >
                    örökre.
                  </em>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <Link
                  href="/contact"
                  className="wh-cta-item opacity-0 bg-white text-[#1A1510] text-[11px] tracking-[0.18em] uppercase px-7 py-3.5 hover:bg-[#C8A882] hover:text-white transition-colors duration-300 whitespace-nowrap"
                >
                  Időpont egyeztetés
                </Link>
                <a
                  href="#csomagok"
                  className="wh-cta-item opacity-0 text-[11px] tracking-[0.14em] uppercase text-white/50 border-b border-white/20 pb-0.5 hover:text-white hover:border-white/50 transition-colors duration-200 whitespace-nowrap"
                >
                  Csomagok →
                </a>
              </div>
            </div>

            <div className="wh-side-panel opacity-0 lg:col-span-4 xl:col-span-5 flex flex-col gap-5 lg:pb-1">
              <p className="text-[13px] font-light text-white/50 leading-[1.9] max-w-xs">
                Professzionális esküvői fotózás és videózás, amely megőrzi a
                nagy nap minden pillanatát — természetes, időtlen stílusban.
              </p>
              <div className="flex gap-6 py-4 border-t border-white/10">
                {[
                  { n: "20+", v: "20", suf: "+", l: "Esküvő" },
                  { n: "4 év", v: "4", suf: " év", l: "Tapasztalat" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-['Cormorant_Garamond'] text-[1.8rem] font-light text-[#C8A882] leading-none">
                      <span
                        className="wh-count"
                        data-val={s.v}
                        data-suf={s.suf}
                      >
                        {s.n}
                      </span>
                    </div>
                    <div className="text-[8px] tracking-[0.15em] uppercase text-white/30 mt-1">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alsó sor – mindig látszik */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-8 sm:pb-10 flex-shrink-0">
          <div className="flex items-end gap-6 sm:gap-8">
            <div className="wh-bottom-item opacity-0 hidden sm:flex items-center gap-3">
              <div className="w-px h-8 bg-white/15 shrink-0" />
              <div>
                <div className="text-[8px] tracking-[0.15em] uppercase text-white/25">
                  Referencia
                </div>
                <div className="text-[11px] text-white/40 font-['Cormorant_Garamond'] italic">
                  Vivi & Bence · Kecskemét, 2025
                </div>
              </div>
            </div>
            <div className="wh-bottom-item opacity-0 flex flex-col items-center gap-2">
              <span className="text-[8px] tracking-[0.22em] uppercase text-white/25">
                Scroll
              </span>
              <div className="w-px h-10 bg-gradient-to-b from-[#C8A882]/40 to-transparent animate-[scrollPulse_2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      </div>

      {/* Jobb dekor */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-3 z-[2]">
        <div className="w-px h-14 bg-gradient-to-b from-transparent to-[#C8A882]/20" />
        <div className="w-1 h-1 rounded-full bg-[#C8A882]/40" />
        <span
          className="text-[7px] tracking-[0.3em] uppercase text-white/20"
          style={{ writingMode: "vertical-rl" }}
        >
          Budapest · Hungary
        </span>
        <div className="w-1 h-1 rounded-full bg-[#C8A882]/40" />
        <div className="w-px h-14 bg-gradient-to-b from-[#C8A882]/20 to-transparent" />
      </div>

      <style jsx>{`
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