"use client";

import { useState } from "react";
import Image from "next/image";

interface BTSItem {
  id: string;
  type: "image" | "video";
  src: string;
  videoUrl?: string;
  alt: string;
  aspect: string;
}

const btsItems: BTSItem[] = [
  { id: "1", type: "image", src: "/gallery/marketing/bts-9.JPG", alt: "BTS 1", aspect: "3/2" },
  { id: "2", type: "video", src: "/gallery/marketing/bts-10.JPG", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", alt: "BTS Video 1", aspect: "16/9" },
  { id: "3", type: "image", src: "/gallery/marketing/bts-11.JPG", alt: "BTS 2", aspect: "2/3" },
  { id: "4", type: "image", src: "/gallery/drone/alfold-63 másolata.JPG", alt: "BTS 3", aspect: "3/2" },
  // PLACEHOLDEREK (Cseréld le őket valós képekre)
  { id: "5", type: "image", src: "/gallery/wedding/arankatibor-15.JPG", alt: "Placeholder 1", aspect: "2/3" },
  { id: "6", type: "video", src: "/gallery/event/borfesztUTSO-106.JPG", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", alt: "Placeholder Video", aspect: "3/2" },
  { id: "7", type: "image", src: "/gallery/portrait/napraforgo-27.JPG", alt: "Placeholder 2", aspect: "1/1" },
  { id: "8", type: "image", src: "/gallery/wedding/kreativ-97.JPG", alt: "Placeholder 3", aspect: "3/2" },
  { id: "9", type: "image", src: "/gallery/marketing/bts-9.JPG", alt: "Placeholder 4", aspect: "2/3" },
  { id: "10", type: "image", src: "/gallery/portrait/SzaboReka-1_pp_pp.jpg", alt: "Placeholder 5", aspect: "3/2" },
];

export default function BTSSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className="bts-section py-20 bg-[#0C0A09] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#C8A882]" />
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/70">Kulisszák mögött</span>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[clamp(1.8rem,3vw,2.8rem)] font-light leading-[1.1] text-white">
              Hogyan<br />
              <em className="not-italic text-[#C8A882] opacity-80 text-[0.9em]">dolgozunk?</em>
            </h2>
          </div>
          
          <div className="hidden md:block">
             <div className="text-[11px] tracking-widest text-white/30 uppercase border-b border-white/10 pb-1">
               Est. 2024 — Visual Content
             </div>
          </div>
        </div>

        {/* Justified Galéria - Jóval kisebb méretekkel */}
        <div className="flex flex-wrap gap-3 items-end">
          {btsItems.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-sm cursor-pointer bg-[#1A1614] h-[160px] md:h-[220px]"
              style={{ aspectRatio: item.aspect }}
              onClick={() => item.type === "video" && setActiveVideo(item.videoUrl || null)}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                sizes="400px"
              />

              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-sm group-hover:border-[#C8A882]/50 transition-all">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#C8A882] ml-0.5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Finom belső fény hovernél */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0C0A09]/95 backdrop-blur-md p-6"
          onClick={() => setActiveVideo(null)}
        >
          <div className="absolute top-8 right-8">
             <button className="text-white/40 hover:text-white text-[10px] tracking-widest uppercase transition-colors">Bezárás ×</button>
          </div>
          <div className="w-full max-w-4xl aspect-video shadow-2xl rounded-sm overflow-hidden border border-white/5">
            <iframe
              src={`${activeVideo}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}