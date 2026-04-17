"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/app/components/Button";
import HorizontalScrollSection from "../components/HorizontalScrollSection";
import TeamSection from "../components/TeamSection";
import HeroInteractive from "../components/HeroInteractive";
import JustifiedGallery, {
  GalleryImage,
} from "@/app/components/JustifiedGallery";
import Footer from "../components/Footer";
import { useAnalytics } from "@/lib/analytics";
import ContactSection from "../components/ContactSection";

// ── Adatok ────────────────────────────────────────────────────
const stats = [
  { number: "320+", label: "Lezárt projekt" },
  { number: "7 év", label: "Szakmai tapasztalat" },
  { number: "98%", label: "Elégedett ügyfél" },
  { number: "15 TB+", label: "Átadott tartalom" },
];

// ── CSERE: justified gallery képek ───────────────────────────
const galleryImages: GalleryImage[] = [
  {
    src: "/slides/kreativ-12.JPG",
    alt: "Esküvői fotó",
    category: "Esküvő",
    orientation: "portrait",
  },
  {
    src: "/slides/kreativ-52.JPG",
    alt: "Portré",
    category: "Portré",
    orientation: "landscape",
  },
  {
    src: "/slides/marcidorina-59.JPG",
    alt: "Esemény fotózás",
    category: "Rendezvény",
    orientation: "portrait",
  },
  {
    src: "/gallery/portrait/olivia-197.JPG",
    alt: "Portré",
    category: "Portré",
    orientation: "landscape",
  },
  {
    src: "/slides/muzeumokejszakaja-230.jpg",
    alt: "Drón felvétel",
    category: "Drón",
    orientation: "landscape",
  },
  {
    src: "/gallery/event/borfesztUTSO-158.JPG",
    alt: "Rendezvény",
    category: "Rendezvény",
    orientation: "landscape",
  },
  {
    src: "/slides/napraforgo-132.JPG",
    alt: "Portré",
    category: "Portré",
    orientation: "landscape",
  },
  {
    src: "/slides/reka&adam-75.JPG",
    alt: "Páros",
    category: "Páros",
    orientation: "landscape",
  },
  {
    src: "/gallery/event/szecsidavid-14.JPG",
    alt: "Rendezvény",
    category: "Rendezvény",
    orientation: "landscape",
  },
  {
    src: "/gallery/event/bjgszalagozo-259.JPG",
    alt: "Rendezvény",
    category: "Rendezvény",
    orientation: "landscape",
  },
  {
    src: "/gallery/event/gepesznap-116.JPG",
    alt: "Rendezvény",
    category: "Rendezvény",
    orientation: "landscape",
  },

  {
    src: "/gallery/marketing/pellikan_aprilis-54.JPG",
    alt: "Rendezvény",
    category: "Rendezvény",
    orientation: "landscape",
  },
  {
    src: "/gallery/wedding/sps-15.JPG",
    alt: "Esküvő",
    category: "Esküvő",
    orientation: "landscape",
  },
];

// YouTube
const SHOWREEL_ID = "LbDrYcfLCRE";
const categoryVideos = [
  {
    id: "w3wexK3AoSU",
    title: "Szalagavató keringő",
    label: "Szalagavató",
    year: "2025",
  },
  { id: "nBQuNA62Ack", title: "Esküvő", label: "Esküvő", year: "2024" },
  {
    id: "MrArCeHVL64",
    title: "Rendezvény",
    label: "Rendezvény",
    year: "2022",
  },
];

// ── YouTube komponensek ───────────────────────────────────────
function YoutubeThumbnail({
  videoId,
  title,
  label,
  year,
}: {
  videoId: string;
  title: string;
  label: string;
  year: string;
}) {
  const [playing, setPlaying] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  return (
    <div
      className="relative overflow-hidden group"
      style={{ aspectRatio: "16/9" }}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <>
          <img
            src={thumb}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1510]/70 via-[#1A1510]/20 to-transparent" />
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center group/play"
            aria-label={`${title} lejátszása`}
          >
            <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 group-hover/play:scale-110 group-hover/play:bg-[#C8A882]/60 group-hover/play:border-[#C8A882]">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <span className="text-[8px] tracking-[0.18em] uppercase text-[#C8A882] block mb-0.5">
              {label} · {year}
            </span>
            <span className="text-[12px] sm:text-[13px] font-light text-white">
              {title}
            </span>
          </div>
          <div className="absolute top-3 right-3 bg-red-600 px-2 py-0.5 flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
              <polygon
                fill="white"
                points="9.545 15.568 15.818 12 9.545 8.432 9.545 15.568"
              />
            </svg>
            <span className="text-[8px] text-white tracking-wider uppercase">
              YouTube
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function ShowreelModal({ videoId }: { videoId: string }) {
  const [open, setOpen] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  return (
    <>
      <div
        className="relative overflow-hidden cursor-pointer group"
        style={{ aspectRatio: "16/9" }}
        onClick={() => setOpen(true)}
      >
        <img
          src={thumb}
          alt="OptikArt Showreel"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1510]/80 via-[#1A1510]/30 to-transparent" />
        <div className="absolute inset-0 bg-[#1A1510]/20 group-hover:bg-[#1A1510]/10 transition-colors duration-300" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#C8A882]/60 bg-[#C8A882]/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-[#C8A882] group-hover:bg-[#C8A882]/20">
              <svg
                viewBox="0 0 24 24"
                fill="white"
                className="w-8 h-8 sm:w-10 sm:h-10 ml-1"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="text-[11px] tracking-[0.2em] uppercase text-white/70 group-hover:text-white transition-colors">
              Videó megtekintése
            </span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-5 h-px bg-[#C8A882]" />
            <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]">
              OptikArt · 2024
            </span>
          </div>
          <h3 className="font-['Cormorant_Garamond'] text-[1.4rem] sm:text-[1.8rem] font-light text-white">
            Főbb munkáink egy helyen
          </h3>
        </div>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            style={{ aspectRatio: "16/9" }}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title="OptikArt Showreel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/50 hover:text-white transition-colors p-2"
            onClick={() => setOpen(false)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-7 h-7"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}

// ── Fő oldal ──────────────────────────────────────────────────
export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { trackClick } = useAnalytics();

  useEffect(() => {
    let ctx: any;
    let mounted = true;
    async function initGSAP() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!mounted || !rootRef.current) return;
      function fadeUp(
        selector: string,
        trigger: string,
        stagger = 0,
        delay = 0,
      ) {
        const els = rootRef.current!.querySelectorAll(selector);
        if (!els.length) return;
        gsap.fromTo(
          els,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger,
            delay,
            immediateRender: false,
            scrollTrigger: { trigger, start: "top 92%", once: true },
          },
        );
      }
      ctx = gsap.context(() => {
        fadeUp(".stat-item", ".stats-section", 0.08);
        document.querySelectorAll(".stat-number").forEach((el) => {
          const raw = el.textContent ?? "";
          const num = parseInt(raw.replace(/[^0-9]/g, ""));
          const suffix = raw.replace(/[0-9]/g, "");
          if (isNaN(num)) return;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: num,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = Math.round(obj.val) + suffix;
            },
            immediateRender: false,
            scrollTrigger: {
              trigger: ".stats-section",
              start: "top 90%",
              once: true,
            },
          });
        });
        fadeUp(".gallery-header", ".gallery-section", 0, 0);
        fadeUp(".gallery-body", ".gallery-section", 0, 0.15);
        fadeUp(".video-header", ".video-section", 0, 0);
        fadeUp(".showreel-card", ".video-section", 0, 0.1);
        fadeUp(".video-card-item", ".video-section", 0.1, 0.2);
        fadeUp(".about-visual", ".about-section", 0, 0);
        fadeUp(".about-text-col", ".about-section", 0, 0.15);
        fadeUp(".contact-info-col", ".contact-section", 0, 0);
        fadeUp(".contact-form-col", ".contact-section", 0, 0.1);
        fadeUp(".cf-field-anim", ".contact-form-col", 0.06, 0.2);
      }, rootRef);
    }
    initGSAP();
    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="bg-[#FAF8F4] overflow-x-hidden">
      <HeroInteractive />
      <HorizontalScrollSection />
      <TeamSection />

      {/* STATS */}
      <section className="stats-section py-16 sm:py-20 bg-[#F5EFE6] border-y border-[#EDE8E0]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#DDD5C8]">
            {stats.map((s, i) => (
              <div
                key={i}
                className="stat-item bg-[#F5EFE6] px-6 sm:px-10 py-10 sm:py-12 text-center"
              >
                <div className="stat-number font-['Cormorant_Garamond'] text-[3rem] sm:text-[3.5rem] font-light text-[#C8A882] leading-none mb-2">
                  {s.number}
                </div>
                <div className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-[#A08060]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALÉRIA – JustifiedGallery */}
      <section className="gallery-section py-20 sm:py-24 bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
          {/* Fejléc */}
          <div className="gallery-header flex items-end justify-between mb-10 sm:mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                  Munkáink
                </span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[clamp(1.8rem,3.5vw,3.2rem)] font-light leading-[1.12] text-[#1A1510]">
                Válogatott
                <br />
                <em className="not-italic text-[#C8A882]">portfólió</em>
              </h2>
            </div>
            <Link
              href="/references"
              className="hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[#1A1510] border-b border-[#C8A882]/40 pb-0.5 hover:border-[#C8A882] transition-all"
            >
              Teljes galéria
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
            </Link>
          </div>

          {/* ── JustifiedGallery ── */}
          <div className="gallery-body">
            <JustifiedGallery
              images={galleryImages}
              rowHeight={320}
              gap={4}
              showCategories={false}
            />
          </div>

          <div className="mt-6 sm:hidden text-center">
            <Link
              href="/references"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[#1A1510] border-b border-[#C8A882]/40 pb-0.5"
            >
              Teljes galéria →
            </Link>
          </div>
        </div>
      </section>

      {/* VIDEÓ SZEKCIÓ */}
      <section className="video-section py-20 sm:py-28 bg-[#1A1510] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #C8A882 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
          <div className="video-header flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#C8A882]/60">
                  Videóink
                </span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[clamp(1.8rem,3.5vw,3.2rem)] font-light leading-[1.12] text-white">
                Mozgókép
                <br />
                <em className="not-italic text-[#C8A882]">& showreeljeink</em>
              </h2>
            </div>
            <a
              href="https://www.youtube.com/@OptikArt-gf3gq"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-[#C8A882]/60 hover:text-[#C8A882] border-b border-[#C8A882]/20 hover:border-[#C8A882]/60 pb-0.5 transition-all self-start sm:self-auto whitespace-nowrap"
            >
              YouTube csatornánk
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
          <div className="showreel-card mb-6 sm:mb-8">
            <ShowreelModal videoId={SHOWREEL_ID} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {categoryVideos.map((v, i) => (
              <div key={i} className="video-card-item">
                <YoutubeThumbnail
                  videoId={v.id}
                  title={v.title}
                  label={v.label}
                  year={v.year}
                />
              </div>
            ))}
          </div>
          <div className="mt-10 sm:mt-12 text-center">
            <a
              href="https://www.youtube.com/@OptikArt-gf3gq"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-3.5 border border-[#C8A882]/30 text-[11px] tracking-[0.16em] uppercase text-[#C8A882] hover:bg-[#C8A882] hover:text-[#1A1510] hover:border-[#C8A882] transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                <polygon
                  fill="#1A1510"
                  points="9.545 15.568 15.818 12 9.545 8.432 9.545 15.568"
                />
              </svg>
              Összes videó YouTube-on
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section py-24 sm:py-32 bg-[#F5EFE6]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
            <div className="about-visual relative">
              <div
                className="relative overflow-hidden border border-[#DDD5C8]"
                style={{ aspectRatio: "3/4" }}
              >
                <Image
                  src="/bts/bts-19.JPG"
                  alt="OptikArt stúdió"
                  fill
                  quality={85}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {[
                  "top-3 left-3 border-t border-l",
                  "top-3 right-3 border-t border-r",
                  "bottom-3 left-3 border-b border-l",
                  "bottom-3 right-3 border-b border-r",
                ].map((cls, i) => (
                  <div
                    key={i}
                    className={`absolute w-5 h-5 ${cls} border-[#C8A882]/60`}
                  />
                ))}
              </div>
              <div className="absolute -bottom-4 sm:-bottom-5 -right-4 sm:-right-5 w-24 sm:w-28 h-24 sm:h-28 bg-[#C8A882] rounded-full flex flex-col items-center justify-center gap-0.5 shadow-xl">
                <span className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2rem] font-light text-white leading-none">
                  8+
                </span>
                <span className="text-[7px] sm:text-[8px] tracking-[0.1em] uppercase text-white/70 text-center leading-tight">
                  év tapasz-
                  <br />
                  talat
                </span>
              </div>
            </div>
            <div className="about-text-col">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                  Rólunk
                </span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[clamp(1.8rem,3.5vw,3.2rem)] font-light leading-[1.12] text-[#1A1510] mb-5 sm:mb-6">
                Szenvedélyünk
                <br />a <em className="not-italic text-[#C8A882]">vizuális</em>
                <br />
                történetmesélés
              </h2>
              <p className="text-[13px] sm:text-[14px] font-light text-[#7A6A58] leading-[1.9] mb-4">
                Az OptikArt csapata több mint 8 éve alkot professzionális fotó-
                és videótartalmakat vállalkozásoknak, magánszemélyeknek és
                eseményeknek egyaránt.
              </p>
              <p className="text-[13px] sm:text-[14px] font-light text-[#7A6A58] leading-[1.9] mb-8 sm:mb-10">
                Minden projekt egyedi — mi is úgy közelítünk hozzá. A
                részletekre való odafigyelés és a kreatív látásmód határozza meg
                munkánkat.
              </p>
              <div className="flex gap-6 sm:gap-8 py-5 sm:py-6 border-t border-b border-[#EDE8E0] mb-8 sm:mb-10">
                {[
                  { num: "320+", lbl: "Projekt" },
                  { num: "120+", lbl: "Ügyfél" },
                ].map((s) => (
                  <div key={s.lbl}>
                    <div className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2rem] font-light text-[#C8A882] leading-none">
                      {s.num}
                    </div>
                    <div className="text-[9px] sm:text-[10px] tracking-[0.12em] uppercase text-[#A08060] mt-1">
                      {s.lbl}
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/about" onClick={() => trackClick("rolunk")}>
                <Button variant="outline" size="lg">
                  Bővebben rólunk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
    </div>
  );
}
