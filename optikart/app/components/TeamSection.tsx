"use client";

import { useEffect, useRef } from "react";

const team = [
  {
    name: "Szabó Máté",
    role: "Vezető fotós",
    focus: "Portré & Esemény",
    bio: "10 éve dolgozik a szakmában. Szenvedélye a természetes fény és az emberi pillanatok megörökítése. Több mint 200 esküvőn és vállalati eseményen volt jelen kamerával a kezében.",
    skills: ["Portréfotózás", "Esküvők", "Termékfotó", "Lightroom"],
    image: null,
    index: "01",
    accent: "#C8A882",
  },
  {
    name: "Monostori Márk",
    role: "Videós & Vágó",
    focus: "Film & Motion",
    bio: "Filmrendezői diplomával a zsebében érkezett a stúdióba. Reklámfilmektől dokumentumfilmekig mindent vállal — a történet az, ami hajtja. Color grading specialista.",
    skills: ["Premiere Pro", "DaVinci Resolve", "After Effects", "Drone"],
    image: null,
    index: "02",
    accent: "#A08060",
  },
  {
    name: "Zugi Viktória",
    role: "Kreatív direktor",
    focus: "Koncepció & Brand",
    bio: "A vizuális stratégia és a márkaidentitás szakértője. Ő az, aki a projekt elején meghatározza az irányt, és gondoskodik arról, hogy minden kép és videó egységes történetet meséljen.",
    skills: ["Brand strategy", "Art direction", "Photoshop", "Figma"],
    image: null,
    index: "03",
    accent: "#B89870",
  },
];

export default function TeamSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: any;
    let mounted = true;

    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText } = await import("gsap/SplitText");
      gsap.registerPlugin(ScrollTrigger, SplitText);

      // ── Fontok megvárása – SplitText csak ezután fut ──────────
      await document.fonts.ready;

      if (!mounted) return;

      ctx = gsap.context(() => {

        // ── Section header animáció ──────────────────────────────
        // SplitText: DOM elem referenciával, nem string selectorral
        const titleEl = sectionRef.current?.querySelector(".team-main-title");
        if (titleEl) {
          const split = new SplitText(titleEl, { type: "lines" });
          gsap.from(split.lines, {
            opacity: 0,
            y: 50,
            stagger: 0.1,
            duration: 0.9,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: ".team-header",
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          });
        }

        gsap.from(".team-header-sub", {
          opacity: 0,
          y: 20,
          duration: 0.7,
          delay: 0.3,
          ease: "power2.out",
          immediateRender: false,
            scrollTrigger: {
            trigger: ".team-header",
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        });

        gsap.from(".team-divider-line", {
          scaleX: 0,
          duration: 1.4,
          ease: "power3.inOut",
          transformOrigin: "left center",
          immediateRender: false,
            scrollTrigger: {
            trigger: ".team-header",
            start: "top 70%",
          },
        });

        // ── Kártyák animáció ─────────────────────────────────────
        team.forEach((_, i) => {
          // querySelector a sectionRef-en belül, nem globálisan
          const card = sectionRef.current?.querySelector(`.team-card-${i}`);
          if (!card) return;

          const imgWrap = card.querySelector(".team-img-wrap");
          if (imgWrap) {
            gsap.from(imgWrap, {
              opacity: 0,
              scale: 0.92,
              duration: 1,
              ease: "power3.out",
              immediateRender: false,
            scrollTrigger: {
                trigger: card,
                start: "top 75%",
                toggleActions: "play none none reverse",
              },
            });
          }

          const indexEl = card.querySelector(".team-index");
          if (indexEl) {
            gsap.from(indexEl, {
              opacity: 0,
              x: -20,
              duration: 0.6,
              ease: "power2.out",
              immediateRender: false,
            scrollTrigger: {
                trigger: card,
                start: "top 72%",
                toggleActions: "play none none reverse",
              },
            });
          }

          const nameEl = card.querySelector(".team-name");
          if (nameEl) {
            gsap.from(nameEl, {
              opacity: 0,
              y: 30,
              duration: 0.8,
              ease: "power3.out",
              immediateRender: false,
            scrollTrigger: {
                trigger: card,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            });
          }

          const bioAndSkills = card.querySelectorAll(".team-bio, .team-skill-tag");
          if (bioAndSkills.length > 0) {
            gsap.from(bioAndSkills, {
              opacity: 0,
              y: 20,
              stagger: 0.06,
              duration: 0.7,
              ease: "power2.out",
              immediateRender: false,
            scrollTrigger: {
                trigger: card,
                start: "top 65%",
                toggleActions: "play none none reverse",
              },
            });
          }

          const lineEl = card.querySelector(".team-card-line");
          if (lineEl) {
            gsap.from(lineEl, {
              scaleX: 0,
              duration: 1,
              ease: "power2.inOut",
              transformOrigin: "left center",
              immediateRender: false,
            scrollTrigger: {
                trigger: card,
                start: "top 68%",
                toggleActions: "play none none reverse",
              },
            });
          }
        });

      }, sectionRef);
    }

    init();
    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-[#FAF8F4] overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">

        {/* ── Header ── */}
        <div className="team-header mb-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#C8A882]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#A08060]">
              A csapat
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="team-main-title font-['Cormorant_Garamond'] text-[clamp(3rem,6vw,5.5rem)] font-light leading-[1] tracking-[-0.02em] text-[#1A1510]">
              Az emberek<br />
              <em className="not-italic text-[#C8A882]">mögötte</em>
            </h2>
            <p className="team-header-sub max-w-xs text-[13px] font-light text-[#9A8878] leading-[1.8]">
              Három szakember, egy közös szenvedély — a vizuális történetmesélés.
            </p>
          </div>

          <div className="team-divider-line mt-10 h-px bg-gradient-to-r from-[#C8A882]/40 via-[#C8A882]/10 to-transparent origin-left" />
        </div>

        {/* ── Csapattagok ── */}
        <div className="flex flex-col gap-0">
          {team.map((member, i) => (
            <div key={i} className={`team-card-${i} group relative`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 py-16 lg:py-20">

                {/* Bal: index + kép */}
                <div className={`lg:col-span-5 relative flex items-start gap-6 ${i % 2 !== 0 ? "lg:order-2" : ""}`}>
                  <div className="team-index relative shrink-0 w-16">
                    <span
                      className="font-['Cormorant_Garamond'] font-light leading-none select-none"
                      style={{ fontSize: "clamp(4rem, 8vw, 7rem)", color: "rgba(200,168,130,0.12)", lineHeight: 1 }}
                    >
                      {member.index}
                    </span>
                    <div className="absolute top-3 left-0 w-5 h-px" style={{ background: member.accent }} />
                  </div>

                  <div className="team-img-wrap flex-1 relative">
                    <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, rgba(200,168,130,0.12), rgba(200,168,130,0.06))` }}
                      >
                        <span
                          className="font-['Cormorant_Garamond'] font-light"
                          style={{ fontSize: "5rem", color: `${member.accent}40` }}
                        >
                          {member.name.charAt(0)}
                        </span>
                      </div>

                      {[
                        "top-2 left-2 border-t border-l",
                        "top-2 right-2 border-t border-r",
                        "bottom-2 left-2 border-b border-l",
                        "bottom-2 right-2 border-b border-r",
                      ].map((cls, j) => (
                        <div
                          key={j}
                          className={`absolute w-4 h-4 ${cls} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                          style={{ borderColor: `${member.accent}60` }}
                        />
                      ))}

                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: `linear-gradient(to top, ${member.accent}15, transparent)` }}
                      />
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-4 h-px" style={{ background: member.accent }} />
                      <span className="text-[9px] tracking-[0.2em] uppercase font-light" style={{ color: member.accent }}>
                        {member.focus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Jobb: tartalom */}
                <div className={`lg:col-span-6 lg:col-start-7 flex flex-col justify-center pt-8 lg:pt-0 ${i % 2 !== 0 ? "lg:order-1 lg:col-start-1" : ""}`}>
                  <div className="mb-6">
                    <h3
                      className="team-name font-['Cormorant_Garamond'] font-light text-[#1A1510] leading-none mb-2"
                      style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
                    >
                      {member.name}
                    </h3>
                    <span className="text-[11px] tracking-[0.18em] uppercase font-light" style={{ color: member.accent }}>
                      {member.role}
                    </span>
                  </div>

                  <p className="team-bio text-[14px] font-light text-[#7A6A58] leading-[1.9] mb-8 max-w-md">
                    {member.bio}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="team-skill-tag text-[9px] tracking-[0.1em] uppercase px-3 py-1.5 border transition-all duration-300"
                        style={{ color: member.accent, borderColor: `${member.accent}30` }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {i < team.length - 1 && (
                <div
                  className="team-card-line h-px origin-left"
                  style={{ background: `linear-gradient(to right, rgba(200,168,130,0.2), rgba(200,168,130,0.05), transparent)` }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Lábléc ── */}
        <div className="mt-20 pt-10 border-t border-[#EDE8E0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[12px] font-light text-[#9A8878] tracking-[0.04em]">
            Szeretnél velünk dolgozni?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-3 text-[11px] tracking-[0.15em] uppercase text-[#1A1510] border-b border-[#C8A882]/40 pb-0.5 hover:border-[#C8A882] transition-all duration-200"
          >
            Írj nekünk
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}