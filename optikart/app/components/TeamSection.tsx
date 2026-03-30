"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const team = [
  {
    name: "Szabó Máté",
    role: "Vezető fotós",
    focus: "Portré & Esemény",
    bio: "10 éve dolgozik a szakmában. Szenvedélye a természetes fény és az emberi pillanatok megörökítése.",
    skills: ["Portréfotózás", "Esküvők", "Termékfotó", "Lightroom"],
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    index: "01",
    accent: "#C8A882",
  },
  {
    name: "Monostori Márk",
    role: "Videós & Vágó",
    focus: "Film & Motion",
    bio: "Filmrendezői diplomával a zsebében érkezett a stúdióba. Color grading és motion graphics specialista.",
    skills: ["Premiere Pro", "DaVinci Resolve", "After Effects", "Drone"],
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
    index: "02",
    accent: "#A08060",
  },
  {
    name: "Zugi Viktória",
    role: "Kreatív direktor",
    focus: "Koncepció & Brand",
    bio: "A vizuális stratégia és a márkaidentitás szakértője. Ő határozza meg az irányt minden projektnél.",
    skills: ["Brand strategy", "Art direction", "Photoshop", "Figma"],
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
    index: "03",
    accent: "#B89870",
  },
];

// ── Behind the scenes anyagok ─────────────────────────────────
// Cseréld ki a src értékeket: /bts/1.jpg, /bts/werk.mp4 stb.
const btsMedia = [
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=75",
    alt: "Forgatás közben",
    wide: true,
  },
  {
    type: "video",
    src: "https://images.unsplash.com/photo-1601506521793-dc748fc80b67?w=800&q=75",
    alt: "Werk videó",
    wide: false,
    videoSrc: "/bts/werk.mp4",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=75",
    alt: "Eszközök",
    wide: false,
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=75",
    alt: "Stúdióban",
    wide: false,
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&q=75",
    alt: "Helyszíni munka",
    wide: true,
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=75",
    alt: "Werkfotó",
    wide: false,
  },
];

function BTSVideoCard({ item }: { item: (typeof btsMedia)[0] }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function togglePlay() {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  }

  return (
    <div
      className="relative overflow-hidden group cursor-pointer h-full"
      onClick={togglePlay}
    >
      {/* Thumbnail kép amíg nem játszik */}
      {!playing && (
        <Image
          src={item.src}
          alt={item.alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="400px"
        />
      )}

      {/* Videó – csak akkor mountolódik ha van videoSrc */}
      {item.videoSrc && (
        <video
          ref={videoRef}
          src={item.videoSrc}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`}
          playsInline
          onEnded={() => setPlaying(false)}
        />
      )}

      {/* Play/pause gomb */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
      >
        <div className="w-14 h-14 rounded-full bg-[#1A1510]/60 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          {playing ? (
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-1">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </div>
      </div>

      {/* Werk videó badge */}
      <div className="absolute top-3 left-3">
        <span className="text-[9px] tracking-[0.15em] uppercase bg-[#C8A882] text-white px-2 py-1">
          Werk videó
        </span>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-[#1A1510]/0 group-hover:bg-[#1A1510]/20 transition-all duration-500" />
    </div>
  );
}

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

      await document.fonts.ready;
      if (!mounted) return;

      ctx = gsap.context(() => {
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
          scrollTrigger: { trigger: ".team-header", start: "top 70%" },
        });

        team.forEach((_, i) => {
          const card = sectionRef.current?.querySelector(`.team-card-${i}`);
          if (!card) return;

          [".team-img-wrap", ".team-index", ".team-name"].forEach((sel, j) => {
            const el = card.querySelector(sel);
            if (el)
              gsap.from(el, {
                opacity: 0,
                y: j === 1 ? 0 : 30,
                x: j === 1 ? -20 : 0,
                scale: j === 0 ? 0.92 : 1,
                duration: j === 0 ? 1 : 0.7,
                ease: "power3.out",
                immediateRender: false,
                scrollTrigger: {
                  trigger: card,
                  start: "top 75%",
                  toggleActions: "play none none reverse",
                },
              });
          });

          const bioAndSkills = card.querySelectorAll(
            ".team-bio, .team-skill-tag",
          );
          if (bioAndSkills.length > 0)
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

          const lineEl = card.querySelector(".team-card-line");
          if (lineEl)
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
        });

        // BTS szekció animáció
        gsap.from(".bts-header", {
          opacity: 0,
          y: 30,
          duration: 0.9,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: ".bts-section",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });

        gsap.from(".bts-item", {
          opacity: 0,
          y: 40,
          stagger: 0.08,
          duration: 0.8,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: ".bts-section",
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
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
    <section ref={sectionRef} className="bg-[#FAF8F4] overflow-hidden">
      {/* ── CSAPAT KÁRTYÁK ── */}
      <div className="py-32">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          {/* Header */}
          <div className="team-header mb-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-[#C8A882]" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#A08060]">
                A csapat
              </span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <h2 className="team-main-title font-['Cormorant_Garamond'] text-[clamp(3rem,6vw,5.5rem)] font-light leading-[1] tracking-[-0.02em] text-[#1A1510]">
                Az emberek
                <br />
                <em className="not-italic text-[#C8A882]">mögötte</em>
              </h2>
              <p className="team-header-sub max-w-xs text-[13px] font-light text-[#9A8878] leading-[1.8]">
                Három szakember, egy közös szenvedély — a vizuális
                történetmesélés.
              </p>
            </div>
            <div className="team-divider-line mt-10 h-px bg-gradient-to-r from-[#C8A882]/40 via-[#C8A882]/10 to-transparent origin-left" />
          </div>

          {/* Csapattagok */}
          <div className="flex flex-col gap-0">
            {team.map((member, i) => (
              <div key={i} className={`team-card-${i} group relative`}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 py-16 lg:py-20">
                  <div
                    className={`lg:col-span-5 relative flex items-start gap-6 ${i % 2 !== 0 ? "lg:order-2" : ""}`}
                  >
                    <div className="team-index relative shrink-0 w-16">
                      <span
                        className="font-['Cormorant_Garamond'] font-light leading-none select-none"
                        style={{
                          fontSize: "clamp(4rem, 8vw, 7rem)",
                          color: "rgba(200,168,130,0.12)",
                          lineHeight: 1,
                        }}
                      >
                        {member.index}
                      </span>
                      <div
                        className="absolute top-3 left-0 w-5 h-px"
                        style={{ background: member.accent }}
                      />
                    </div>

                    <div className="team-img-wrap flex-1 relative">
                      <div
                        className="relative overflow-hidden"
                        style={{ aspectRatio: "3/4" }}
                      >
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: `linear-gradient(to top, ${member.accent}30, transparent 60%)`,
                          }}
                        />
                        {[
                          "top-2 left-2 border-t border-l",
                          "top-2 right-2 border-t border-r",
                          "bottom-2 left-2 border-b border-l",
                          "bottom-2 right-2 border-b border-r",
                        ].map((cls, j) => (
                          <div
                            key={j}
                            className={`absolute w-4 h-4 ${cls} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                            style={{ borderColor: `${member.accent}80` }}
                          />
                        ))}
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <div
                          className="w-4 h-px"
                          style={{ background: member.accent }}
                        />
                        <span
                          className="text-[9px] tracking-[0.2em] uppercase font-light"
                          style={{ color: member.accent }}
                        >
                          {member.focus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`lg:col-span-6 lg:col-start-7 flex flex-col justify-center pt-8 lg:pt-0 ${i % 2 !== 0 ? "lg:order-1 lg:col-start-1" : ""}`}
                  >
                    <div className="mb-6">
                      <h3
                        className="team-name font-['Cormorant_Garamond'] font-light text-[#1A1510] leading-none mb-2"
                        style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
                      >
                        {member.name}
                      </h3>
                      <span
                        className="text-[11px] tracking-[0.18em] uppercase font-light"
                        style={{ color: member.accent }}
                      >
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
                          style={{
                            color: member.accent,
                            borderColor: `${member.accent}30`,
                          }}
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
                    style={{
                      background: `linear-gradient(to right, rgba(200,168,130,0.2), rgba(200,168,130,0.05), transparent)`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BEHIND THE SCENES SZEKCIÓ ── */}
      <div className="bts-section bg-[#1A1510] py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          {/* BTS header */}
          <div className="bts-header flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                  A kulisszák mögött
                </span>
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light leading-[1.1] text-white">
                Így dolgozunk
                <br />
                <em className="not-italic text-[#C8A882]">valójában</em>
              </h3>
            </div>
            <p className="max-w-xs text-[13px] font-light text-[#7A6A58] leading-[1.8]">
              Werkfotók és videók — az alkotói folyamat nyersanyaga.
            </p>
          </div>

          {/* BTS masonry grid – 3 sor, vegyes méretű cellák */}
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            style={{ gridAutoRows: "200px" }}
          >
            {/* 1. Nagy featured kép – 2×2 */}
            <div className="bts-item relative overflow-hidden group col-span-2 row-span-2 cursor-pointer">
              <Image
                src={btsMedia[0].src}
                alt={btsMedia[0].alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-[#1A1510]/0 group-hover:bg-[#1A1510]/20 transition-all duration-500" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] tracking-[0.12em] uppercase text-white/80">
                  {btsMedia[0].alt}
                </span>
              </div>
              {/* Sarokdísz */}
              <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-white/0 group-hover:border-white/40 transition-all duration-500" />
            </div>

            {/* 2. Werk videó kártya */}
            <div className="bts-item col-span-1 row-span-2">
              <BTSVideoCard item={btsMedia[1]} />
            </div>

            {/* 3-4. Kis képek */}
            {btsMedia.slice(2, 4).map((item, i) => (
              <div
                key={i}
                className="bts-item relative overflow-hidden group cursor-pointer"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="300px"
                />
                <div className="absolute inset-0 bg-[#1A1510]/0 group-hover:bg-[#1A1510]/30 transition-all duration-500" />
              </div>
            ))}

            {/* 5. Széles kép – 2×1 */}
            <div className="bts-item relative overflow-hidden group cursor-pointer col-span-2">
              <Image
                src={btsMedia[4].src}
                alt={btsMedia[4].alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-[#1A1510]/0 group-hover:bg-[#1A1510]/20 transition-all duration-500" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] tracking-[0.12em] uppercase text-white/80">
                  {btsMedia[4].alt}
                </span>
              </div>
            </div>

            {/* 6. Kis kép */}
            <div className="bts-item relative overflow-hidden group cursor-pointer">
              <Image
                src={btsMedia[5].src}
                alt={btsMedia[5].alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="300px"
              />
              <div className="absolute inset-0 bg-[#1A1510]/0 group-hover:bg-[#1A1510]/30 transition-all duration-500" />
            </div>
          </div>

          {/* BTS footer sor */}
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[12px] font-light text-[#5A4A3A] tracking-[0.04em]">
              Szeretnél velünk dolgozni?
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-3 text-[11px] tracking-[0.15em] uppercase text-[#C8A882] border-b border-[#C8A882]/40 pb-0.5 hover:border-[#C8A882] transition-all duration-200"
            >
              Írj nekünk
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
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
