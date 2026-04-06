"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Button from "@/app/components/Button";
import HorizontalScrollSection from "../components/HorizontalScrollSection";
import TeamSection from "../components/TeamSection";
import HeroInteractive from "../components/HeroInteractive";
import Footer from "../components/Footer";

// --- Adatok ---
const stats = [
  { number: "100+", label: "Lezárt projekt" },
  { number: "6 év", label: "Szakmai tapasztalat" },
  { number: "98%", label: "Elégedett ügyfél" },
  { number: "15+", label: "Szakmai díj" },
];

const galleryItems = [
  { type: "image", src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=75", alt: "Esküvői fotó", category: "Fotózás", colSpan: "lg:col-span-2 lg:row-span-2" },
  { type: "video", src: "https://images.unsplash.com/photo-1601506521793-dc748fc80b67?w=700&q=75", alt: "Reklámfilm – Márkanév", category: "Videógyártás", duration: "2:34", colSpan: "lg:col-span-1 lg:row-span-1", videoSrc: "/videos/reel1.mp4" },
  { type: "image", src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=700&q=75", alt: "Esemény fotózás", category: "Esemény", colSpan: "lg:col-span-1 lg:row-span-1" },
  { type: "video", src: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=700&q=75", alt: "Drón showreel", category: "Drón", duration: "1:12", colSpan: "lg:col-span-1 lg:row-span-2", videoSrc: "/videos/drone.mp4" },
  { type: "image", src: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=700&q=75", alt: "Termékfotó", category: "Termék", colSpan: "lg:col-span-1 lg:row-span-1" },
  { type: "image", src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=700&q=75", alt: "Portré sorozat", category: "Portré", colSpan: "lg:col-span-1 lg:row-span-1" },
];

// --- Segédkomponens a Galériához ---
function GalleryCard({ item }: { item: (typeof galleryItems)[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div 
      className={`relative w-full h-full overflow-hidden group cursor-pointer`} 
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)}
    >
      <Image 
        src={item.src} 
        alt={item.alt} 
        fill 
        className={`object-cover transition-transform duration-700 ${hovered ? "scale-105" : "scale-100"}`} 
        sizes="(max-width: 768px) 100vw, 33vw" 
      />
      <div className={`absolute inset-0 transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-0"}`} style={{ background: "linear-gradient(to top, rgba(26,21,16,0.75) 0%, rgba(26,21,16,0.2) 50%, transparent 100%)" }} />
      {item.type === "video" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 ${hovered ? "scale-110 bg-[#C8A882]/60" : "scale-100"}`}>
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </div>
        </div>
      )}
      <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[9px] tracking-[0.18em] uppercase text-[#C8A882] block mb-1">{item.category}</span>
            <span className="text-[12px] font-light text-white">{item.alt}</span>
          </div>
          {"duration" in item && item.duration && <span className="text-[10px] text-white/60 tabular-nums">{item.duration}</span>}
        </div>
      </div>
    </div>
  );
}

// --- Főoldal ---
export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: any;
    let mounted = true;

    async function initGSAP() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText } = await import("gsap/SplitText");
      
      if (!mounted) return;
      gsap.registerPlugin(ScrollTrigger, SplitText);

      // Megvárjuk, amíg a böngésző "megnyugszik" és minden betöltődik
      await document.fonts.ready;

      ctx = gsap.context(() => {
        // 1. STATS ANIMÁCIÓ
        gsap.from(".stat-item", {
          opacity: 0,
          y: 20,
          stagger: 0.1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".stats-section",
            start: "top 90%",
            toggleActions: "play none none none"
          }
        });

        document.querySelectorAll(".stat-number").forEach((el) => {
          const target = el.textContent?.replace(/[^0-9]/g, "") || "0";
          const suffix = el.textContent?.replace(/[0-9]/g, "") || "";
          const num = parseInt(target);
          if (isNaN(num)) return;
          
          let obj = { val: 0 };
          gsap.to(obj, {
            val: num,
            duration: 2,
            ease: "power2.out",
            scrollTrigger: { trigger: ".stats-section", start: "top 90%", once: true },
            onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; }
          });
        });

        // 2. GALÉRIA ANIMÁCIÓ
        gsap.from(".gallery-header", {
          opacity: 0,
          y: 20,
          duration: 0.8,
          scrollTrigger: { trigger: ".gallery-section", start: "top 90%" }
        });

        gsap.from(".gallery-card-wrapper", {
          opacity: 0,
          y: 30,
          stagger: 0.08,
          duration: 0.7,
          scrollTrigger: { trigger: ".gallery-section", start: "top 85%" }
        });

        // 3. ABOUT ANIMÁCIÓ (SplitText-tel)
        const aboutTitleEl = document.querySelector(".about-title");
        if (aboutTitleEl) {
          const split = new SplitText(aboutTitleEl, { type: "lines" });
          gsap.from(split.lines, {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.8,
            scrollTrigger: { trigger: ".about-section", start: "top 85%" }
          });
        }

        gsap.from(".about-visual", {
          opacity: 0,
          x: -30,
          duration: 1,
          scrollTrigger: { trigger: ".about-section", start: "top 85%" }
        });

        // 4. CONTACT ANIMÁCIÓ
        gsap.from(".contact-info-col, .contact-form-col", {
          opacity: 0,
          y: 30,
          stagger: 0.2,
          duration: 0.8,
          scrollTrigger: { trigger: ".contact-section", start: "top 90%" }
        });

      }, rootRef);

      // KRITIKUS: Újraszámoljuk az összes pozíciót miután a GSAP szekciók felálltak
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    }

    initGSAP();

    return () => {
      mounted = false;
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="bg-[#FAF8F4] overflow-x-hidden">
      <HeroInteractive />
      
      {/* Ez a szekció "pin"-eli magát, ezért utána refresh() kell! */}
      <HorizontalScrollSection />
      
      <TeamSection />

      {/* STATS */}
      <section className="stats-section py-20 bg-[#F5EFE6] border-y border-[#EDE8E0]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#DDD5C8]">
            {stats.map((s, i) => (
              <div key={i} className="stat-item bg-[#F5EFE6] px-10 py-12 text-center">
                <div className="stat-number font-['Cormorant_Garamond'] text-[3.5rem] font-light text-[#C8A882] leading-none mb-2">{s.number}</div>
                <div className="text-[10px] tracking-[0.18em] uppercase text-[#A08060]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALÉRIA */}
      <section className="gallery-section py-24 bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="gallery-header flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Munkáink</span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3.2rem)] font-light leading-[1.12] text-[#1A1510]">
                Válogatott<br /><em className="not-italic text-[#C8A882]">portfólió</em>
              </h2>
            </div>
            <div className="hidden sm:block">
              <Button variant="outline" size="sm">Teljes galéria</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ gridAutoRows: "220px" }}>
            {galleryItems.map((item, i) => (
              <div key={i} className={`gallery-card-wrapper ${item.colSpan}`}>
                <GalleryCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section py-32 bg-[#F5EFE6]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="about-visual relative">
              <div className="relative aspect-[3/4] overflow-hidden border border-[#DDD5C8]">
                <Image src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80" alt="OptikArt stúdió" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-5 -right-5 w-28 h-28 bg-[#C8A882] rounded-full flex flex-col items-center justify-center text-white shadow-xl">
                <span className="font-['Cormorant_Garamond'] text-[2rem] leading-none">8+</span>
                <span className="text-[8px] uppercase tracking-tighter">év tapasztalat</span>
              </div>
            </div>
            
            <div className="about-text-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Rólunk</span>
              </div>
              <h2 className="about-title font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3.2rem)] font-light leading-[1.12] text-[#1A1510] mb-6">
                Szenvedélyünk<br />a <em className="not-italic text-[#C8A882]">vizuális</em><br />történetmesélés
              </h2>
              <p className="text-[14px] font-light text-[#7A6A58] leading-[1.9] mb-10">Az OptikArt csapata több mint 8 éve alkot professzionális fotó- és videótartalmakat.</p>
              <Button variant="outline">Bővebben rólunk</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-section py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="contact-info-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Kapcsolat</span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3.2rem)] font-light leading-[1.12] text-[#1A1510] mb-6">Kezdjük el a<br />közös munkát</h2>
            </div>
            
            <div className="contact-form-col">
              <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                <input type="text" placeholder="Neve" className="w-full bg-transparent border-b border-[#EDE8E0] py-3 focus:outline-none focus:border-[#C8A882]" />
                <input type="email" placeholder="Email" className="w-full bg-transparent border-b border-[#EDE8E0] py-3 focus:outline-none focus:border-[#C8A882]" />
                <textarea rows={4} placeholder="Üzenet" className="w-full bg-transparent border-b border-[#EDE8E0] py-3 focus:outline-none focus:border-[#C8A882] resize-none" />
                <Button variant="primary" fullWidth>Üzenet küldése</Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}