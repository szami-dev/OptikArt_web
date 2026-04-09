"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const team = [
  {
    name: "Szabó Máté",
    role: "Vezető fotós, webfejlesztő",
    focus: "Portré & Esemény",
    bio: "Több éve foglalkozom professzionálisan fotózással, és munkámban a természetes fény, az őszinte pillanatok és az emberi kapcsolatok hiteles megörökítése áll a középpontban. Számomra a fotózás nem pusztán dokumentálás, hanem történetmesélés: minden kép egy érzést, hangulatot vagy egyszeri, megismételhetetlen pillanatot rögzít. Esküvőkön, családi eseményeken és vállalati rendezvényeken egyaránt dolgozom, ahol célom, hogy diszkréten, mégis tudatosan jelen legyek, és észrevétlenül kapjam el azokat a pillanatokat, amelyek később igazán értékké válnak. Hiszem, hogy a jó fotó nem beállított, hanem megélt — ezért a természetesség és az autentikusság minden munkámban alapelv. Munkáim során nagy hangsúlyt fektetek a letisztult, időtálló vizuális világra, amely évek múlva is ugyanúgy működik érzelmileg, mint elkészülésének pillanatában. Fontos számomra a bizalom és az együttműködés, hiszen minden történet akkor tud igazán jól megszületni, ha a fotóalanyok is komfortosan és önazonosan vannak jelen a kamera előtt. A célom, hogy minden elkészült kép egy olyan emlék legyen, ami nemcsak visszaidéz egy pillanatot, hanem újra is élteti azt.",
    skills: ["Portréfotózás", "Esküvők", "Rendezvények", "Lightroom", "Next.js", "React", "Tailwind"],
    image: "/assets/Gemini_Generated_Image_4c39tx4c39tx4c39.png",
    index: "01",
    accent: "#000000",
  },
  {
    name: "Monostori Márk",
    role: "Videós & Vágó",
    focus: "Film & Motion",
    bio: "Filmes szemlélettel dolgozó alkotó vagyok, akit a vizuális történetmesélés hajt. Reklámanyagoktól dokumentum jellegű videókig széles skálán mozgok, de számomra mindig a történet az első — ez ad irányt minden projektemnek. Munkáimban a filmes látásmódot ötvözöm egy letisztult, modern vizuális világgal, legyen szó márkákról, portrékról vagy hangulati anyagokról. Otthonosan mozgok a kamera mögött, és tudatosan építem fel a képi világot, hogy az ne csak esztétikus, hanem kifejező is legyen. Kiemelt területem a color grading, ahol visszafogott, mégis karakteres, filmes hangulatú képi világot hozok létre — a célom mindig az, hogy a végeredmény profi, egységes és időtálló legyen. A teljes kreatív folyamatot egy kézben tartom az ötlettől a végső exportig, így minden projektnél személyes figyelmet és következetes minőséget biztosítok.",
    skills: ["Premiere Pro", "DaVinci Resolve", "After Effects", "Drone"],
    image: "/assets/bippu-10.JPG",
    index: "02",
    accent: "#000000",
  },
  {
    name: "Zugi Viktória",
    role: "Kreatív direktor",
    focus: "Koncepció & Brand",
    bio: "A vizuális stratégia és a márkaidentitás szakértője. Ő az, aki a projekt elején meghatározza az irányt, és gondoskodik arról, hogy minden kép és videó egységes történetet meséljen.",
    skills: ["Brand strategy", "Art direction", "Photoshop", "Figma"],
    image: "/assets/zugiviki-15.JPG",
    index: "03",
    accent: "#8b1a20",
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
      await document.fonts.ready;
      if (!mounted) return;

      ctx = gsap.context(() => {
        // Header
        const titleEl = sectionRef.current?.querySelector(".team-main-title");
        if (titleEl) {
          const split = new SplitText(titleEl, { type: "lines" });
          gsap.from(split.lines, {
            opacity: 0, y: 14, stagger: 0.08, duration: 0.7, ease: "power2.out",
            scrollTrigger: { trigger: ".team-header", start: "top 95%" },
          });
        }

        gsap.from(".team-header-sub", {
          opacity: 0, y: 10, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: ".team-header", start: "top 95%" },
        });

        // Csapattagok animációi
        team.forEach((_, i) => {
          const card = sectionRef.current?.querySelector(`.team-card-${i}`);
          if (!card) return;

          gsap.from(card.querySelector(".team-img-wrap"), {
            opacity: 0, scale: 0.97, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 95%" },
          });

          gsap.from(card.querySelectorAll(".team-name, .team-bio, .team-skill-tag"), {
            opacity: 0, y: 12, stagger: 0.05, duration: 0.7, ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 93%" },
          });
        });
      }, sectionRef);
    }

    init();
    return () => { mounted = false; ctx?.revert(); };
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-[#FAF8F4] overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">

        {/* Header */}
        <div className="team-header mb-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#C8A882]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#A08060]">A csapat</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="team-main-title font-['Cormorant_Garamond'] text-[clamp(3rem,6vw,5.5rem)] font-light leading-[1] tracking-[-0.02em] text-[#1A1510]">
              Az emberek<br /><em className="not-italic text-[#C8A882]">mögötte</em>
            </h2>
            <p className="team-header-sub max-w-xs text-[13px] font-light text-[#9A8878] leading-[1.8]">
              Három szakember, egy közös szenvedély — a vizuális történetmesélés.
            </p>
          </div>
          <div className="team-divider-line mt-10 h-px bg-gradient-to-r from-[#C8A882]/40 via-[#C8A882]/10 to-transparent origin-left" />
        </div>

        {/* Csapattagok */}
        <div className="flex flex-col gap-0">
          {team.map((member, i) => (
            <div key={i} className={`team-card-${i} group relative border-b border-[#EDE8E0] last:border-0`}>
              {/* grid items-start: ez a lelke, hogy a teteje egy vonalban legyen */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 py-16 lg:py-24 items-start">

                {/* Bal/Jobb oszlop: Kép */}
                <div className={`lg:col-span-5 relative ${i % 2 !== 0 ? "lg:order-2" : ""}`}>
                  
                  {/* Szám az oldalán (01, 02) - absolute, nem zavarja a képet */}
                  <div className={`absolute -top-8 ${i % 2 !== 0 ? "-right-8" : "-left-8"} z-0`}>
                    <span
                      className="font-['Cormorant_Garamond'] font-light leading-none select-none"
                      style={{ fontSize: "clamp(4rem, 8vw, 7rem)", color: "rgba(200,168,130,0.15)" }}
                    >
                      {member.index}
                    </span>
                  </div>

                  <div className="team-img-wrap relative z-10">
                    <div className="relative overflow-hidden bg-[#EAE7E2]" style={{ aspectRatio: "3/4" }}>
                      <Image 
                        src={member.image} 
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {["top-2 left-2 border-t border-l", "top-2 right-2 border-t border-r", "bottom-2 left-2 border-b border-l", "bottom-2 right-2 border-b border-r"].map((cls, j) => (
                        <div key={j} className={`absolute w-4 h-4 ${cls} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} style={{ borderColor: `${member.accent}60` }} />
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-4 h-px" style={{ background: member.accent }} />
                      <span className="text-[9px] tracking-[0.2em] uppercase font-light text-[#1A1510]">{member.focus}</span>
                    </div>
                  </div>
                </div>

                {/* Bal/Jobb oszlop: Szöveg */}
                <div className={`lg:col-span-6 flex flex-col pt-4 lg:pt-0 ${i % 2 !== 0 ? "lg:order-1 lg:col-start-1" : "lg:col-start-7"}`}>
                  <div className="mb-6">
                    <h3 className="team-name font-['Cormorant_Garamond'] font-light text-[#1A1510] leading-none mb-3" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
                      {member.name}
                    </h3>
                    <span className="text-[11px] tracking-[0.18em] uppercase font-light" style={{ color: member.accent }}>{member.role}</span>
                  </div>
                  
                  <p className="team-bio text-[14px] font-light text-[#7A6A58] leading-[1.9] mb-8 max-w-md text-justify lg:text-left">
                    {member.bio}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <span key={skill} className="team-skill-tag text-[9px] tracking-[0.1em] uppercase px-3 py-1.5 border border-[#C8A882]/30 text-[#1A1510]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Lábléc */}
        <div className="mt-20 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[12px] font-light text-[#9A8878] tracking-[0.04em]">Szeretnél velünk dolgozni?</p>
          <a href="/contact" className="inline-flex items-center gap-3 text-[11px] tracking-[0.15em] uppercase text-[#1A1510] border-b border-[#C8A882]/40 pb-0.5 hover:border-[#C8A882] transition-all duration-200">
            Írj nekünk
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}