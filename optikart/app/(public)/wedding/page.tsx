"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import WeddingTimeline from "@/app/components/WeddingTimeline";
import Footer from "@/app/components/Footer";
import WeddingHero from "@/app/components/WeddingHero";

const photoPackages = [
  {
    name: "Mini",
    price: "60 000",
    tag: "Alapcsomag",
    accent: "#C8A882",
    items: [
      "A nagy nap megörökítése a polgári/templomi szertartástól a csoportképekig",
      "Mini kreatív fotózás",
      "Minimum 150 szerkesztett kép",
      "10 db kidolgozott kép (kreatív)",
      "Digitális átadás 1 hónapon belül",
    ],
    gifts: [],
  },
  {
    name: "Alap",
    price: "200 000",
    tag: "Legnépszerűbb",
    accent: "#1A1510",
    featured: true,
    items: [
      "A nagy nap megörökítése a készülődéstől 1:00-ig (+10 000 Ft/megkezdett óra)",
      "Az napi kreatív fotózás",
      "Minimum 600 db szerkesztett kép",
      "20 db kidolgozott kép (kreatív)",
      "10 db kép átadása 48 órán belül",
      "Digitális átadás 1 hónapon belül",
    ],
    gifts: ["10 db 10×15-ös nyomtatott fotó"],
  },
  {
    name: "Extra",
    price: "250 000",
    tag: "Prémium",
    accent: "#C8A882",
    items: [
      "A nagy nap megörökítése a készülődéstől 3:00-ig",
      "Külön napi kreatív fotózás",
      "Minimum 900 db szerkesztett kép",
      "30 db kidolgozott kép (kreatív)",
      "20 db kép átadása 48 órán belül",
      "Digitális átadás 1 hónapon belül",
    ],
    gifts: ["20 db 10×15-ös nyomtatott fotó", "Egyedi díszdobozos pendrive"],
  },
];

const videoPackages = [
  {
    name: "Mini",
    price: "80 000",
    tag: "Alapcsomag",
    accent: "#C8A882",
    items: [
      "Szertartás(ok) megörökítése 2 kamerával",
      "Egy szerkesztett videó a szertartás(ok)ról",
      "Digitális átadás 1 hónapon belül",
    ],
    gifts: [],
  },
  {
    name: "Alap",
    price: "220 000",
    tag: "Legnépszerűbb",
    accent: "#1A1510",
    featured: true,
    items: [
      "Rendelkezésre állás: 01:00 (+10 000 Ft/megkezdett óra)",
      "A szertartás(ok) kulcs pillanatainak megörökítése",
      "A lakodalom hangulatának megörökítése",
      "Kreatív felvételek a fotózás alatt",
      "5–15 perces vágott hangulat videó",
      "Digitális átadás 1 hónapon belül",
    ],
    gifts: [],
  },
  {
    name: "Extra",
    price: "270 000",
    tag: "Prémium",
    accent: "#C8A882",
    items: [
      "Rendelkezésre állás: 03:00 (+10 000 Ft/megkezdett óra)",
      "A szertartás(ok) megörökítése 2 kamerával",
      "A lakodalom hangulatának megörökítése",
      "Kreatív felvételek a fotózás alatt",
      "Egy szerkesztett videó a szertartás(ok)ról",
      "5–15 perces vágott hangulat videó",
      "Digitális átadás 1,5 hónapon belül",
    ],
    gifts: ["Egyedi díszdobozos pendrive"],
  },
];

const references = [
  { src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=75", alt: "Réka & Péter", location: "Budapest", year: "2024", span: "col-span-2 row-span-2" },
  { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=75", alt: "Anna & Márk", location: "Visegrád", year: "2024", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=75", alt: "Virág & Bence", location: "Eger", year: "2023", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=75", alt: "Kata & Dávid", location: "Győr", year: "2024", span: "col-span-1 row-span-2" },
  { src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=75", alt: "Nóri & Ádám", location: "Pécs", year: "2023", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=75", alt: "Zsófi & Gábor", location: "Debrecen", year: "2023", span: "col-span-1 row-span-1" },
];

const faqs = [
  { q: "Mikor kapjuk meg a képeket/videót?", a: "Az Alap és Extra fotós csomagokban 10 db képet 48 órán belül átadunk. A teljes szerkesztett anyag 1 hónapon belül kerül átadásra. A videós Extra csomagnál ez 1,5 hónap." },
  { q: "Hogyan zajlik a digitális átadás?", a: "Egy privát online galérián keresztül, ahonnan korlátlan ideig letölthetők a képek. A pendrive-os csomagoknál egyedi díszdobozban postázzuk vagy személyesen adjuk át." },
  { q: "Mi az a kidolgozott kép?", a: "A szerkesztett képek alapszintű retusálást kapnak. A kidolgozott képek mélyebb retusálást, bőrretusálást és speciális utómunkát kapnak — ezek a legemlékezetesebb pillanatok." },
  { q: "Van-e lehetőség egyedi csomag összeállítására?", a: "Természetesen! Ha a meglévő csomagok egyike sem illik tökéletesen az elképzeléseitekhez, keressetek minket és személyre szabott ajánlatot készítünk." },
  { q: "Milyen messzire utaztok?", a: "Magyarország egész területén vállalunk munkát. Budapest környékén (50 km-es körzetben) kiszállási díj nincs." },
  { q: "Szükséges-e foglalót adni?", a: "Igen, a dátum lefoglalásához 30% foglaló szükséges. A maradék összeget az esemény napján vagy előtte kell kiegyenlíteni." },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#EDE8E0]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-[0.15em] text-[#C8A882] tabular-nums">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-[15px] font-light text-[#1A1510] group-hover:text-[#C8A882] transition-colors duration-200">{q}</span>
        </div>
        <div className={`w-5 h-5 border border-[#EDE8E0] flex items-center justify-center shrink-0 ml-4 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 text-[#C8A882]">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-400 ${open ? "max-h-48 pb-5" : "max-h-0"}`}>
        <p className="text-[14px] font-light text-[#7A6A58] leading-[1.9] pl-10 pr-8">{a}</p>
      </div>
    </div>
  );
}

function PackageCard({ pkg }: { pkg: typeof photoPackages[0] }) {
  return (
    <div className={`relative flex flex-col border transition-all duration-300 ${pkg.featured ? "bg-[#1A1510] border-[#1A1510] shadow-2xl scale-[1.02]" : "bg-white border-[#EDE8E0] hover:border-[#C8A882]/50 hover:shadow-lg"}`}>
      <div className={`absolute -top-3 left-6 px-3 py-1 text-[9px] tracking-[0.18em] uppercase ${pkg.featured ? "bg-[#C8A882] text-white" : "bg-white border border-[#EDE8E0] text-[#A08060]"}`}>
        {pkg.tag}
      </div>
      <div className="p-8 pt-10">
        <div className="mb-6">
          <h3 className={`font-['Cormorant_Garamond'] text-[2.2rem] font-light leading-none mb-1 ${pkg.featured ? "text-white" : "text-[#1A1510]"}`}>{pkg.name}</h3>
          <div className="flex items-end gap-1 mt-3">
            <span className={`font-['Cormorant_Garamond'] text-[2.8rem] font-light leading-none ${pkg.featured ? "text-[#C8A882]" : "text-[#1A1510]"}`}>{pkg.price}</span>
            <span className={`text-[11px] mb-1.5 ${pkg.featured ? "text-[#C8A882]/60" : "text-[#A08060]"}`}>Ft</span>
          </div>
        </div>
        <div className={`h-px mb-6 ${pkg.featured ? "bg-white/10" : "bg-[#EDE8E0]"}`} />
        <ul className="flex flex-col gap-3 mb-6">
          {pkg.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-1 h-1 rounded-full mt-2 shrink-0 bg-[#C8A882]" />
              <span className={`text-[13px] font-light leading-relaxed ${pkg.featured ? "text-white/70" : "text-[#7A6A58]"}`}>{item}</span>
            </li>
          ))}
        </ul>
        {pkg.gifts.length > 0 && (
          <div className={`rounded-sm p-4 mb-6 ${pkg.featured ? "bg-white/5 border border-white/10" : "bg-[#FAF8F4] border border-[#EDE8E0]"}`}>
            <div className="text-[9px] tracking-[0.18em] uppercase mb-3 text-[#C8A882]">Ajándék</div>
            {pkg.gifts.map((g, i) => (
              <div key={i} className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 text-[#C8A882] shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                <span className={`text-[12px] font-light ${pkg.featured ? "text-white/80" : "text-[#5A4A3A]"}`}>{g}</span>
              </div>
            ))}
          </div>
        )}
        <Link href="/contact" className={`block w-full text-center text-[11px] tracking-[0.18em] uppercase py-4 transition-all duration-300 ${pkg.featured ? "bg-[#C8A882] text-white hover:bg-[#B8987A]" : "border border-[#1A1510] text-[#1A1510] hover:bg-[#1A1510] hover:text-white"}`}>
          Lépjünk kapcsolatba
        </Link>
      </div>
    </div>
  );
}

export default function WeddingsPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"photo" | "video">("photo");

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
        // ── Scroll animációk – start: "top 95%", nincs toggleActions, kis y ──
        gsap.from(".w-step", {
          opacity: 0, y: 14, stagger: 0.1, duration: 0.7, ease: "power2.out", immediateRender: false,
          scrollTrigger: { trigger: ".w-timeline", start: "top 95%" },
        });

        gsap.from(".w-ref-item", {
          opacity: 0, y: 14, stagger: 0.06, duration: 0.7, ease: "power2.out", immediateRender: false,
          scrollTrigger: { trigger: ".w-references", start: "top 95%" },
        });

        gsap.from(".w-pkg-card", {
          opacity: 0, y: 16, stagger: 0.08, duration: 0.7, ease: "power2.out", immediateRender: false,
          scrollTrigger: { trigger: ".w-pricing", start: "top 95%" },
        });

        gsap.from(".w-faq-item", {
          opacity: 0, x: -8, stagger: 0.05, duration: 0.5, ease: "power2.out", immediateRender: false,
          scrollTrigger: { trigger: ".w-faq", start: "top 95%" },
        });

        document.querySelectorAll(".w-split-title").forEach((el) => {
          const split = new SplitText(el, { type: "lines" });
          gsap.from(split.lines, {
            opacity: 0, y: 12, stagger: 0.08, duration: 0.7, ease: "power2.out", immediateRender: false,
            scrollTrigger: { trigger: el, start: "top 95%" },
          });
        });
      }, rootRef);
    }

    init();
    return () => { mounted = false; ctx?.revert(); };
  }, []);

  return (
    <div ref={rootRef} className="bg-white overflow-x-hidden font-light">
      <WeddingHero />
      <WeddingTimeline />

      {/* REFERENCIÁK */}
      <section className="w-references py-28 bg-white">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Referenciák</span>
              </div>
              <h2 className="w-split-title font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] text-[#1A1510]">
                Párok,<br /><em className="not-italic text-[#C8A882]">akiknek dolgoztunk</em>
              </h2>
            </div>
            <Link href="/gallery" className="hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[#1A1510] border-b border-[#C8A882]/40 pb-0.5 hover:border-[#C8A882] transition-all">
              Teljes galéria →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ gridAutoRows: "200px" }}>
            {references.map((ref, i) => (
              <div key={i} className={`w-ref-item relative overflow-hidden group cursor-pointer ${ref.span}`}>
                <Image src={ref.src} alt={ref.alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-[#1A1510]/0 group-hover:bg-[#1A1510]/40 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                  <p className="text-white font-['Cormorant_Garamond'] text-[1.1rem] font-light">{ref.alt}</p>
                  <p className="text-white/60 text-[10px] tracking-[0.1em] uppercase">{ref.location} · {ref.year}</p>
                </div>
                <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-white/0 group-hover:border-white/50 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CSOMAGOK */}
      <section id="csomagok" className="w-pricing py-28 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#C8A882]" />
              <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Áraink</span>
              <div className="w-8 h-px bg-[#C8A882]" />
            </div>
            <h2 className="w-split-title font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light text-[#1A1510] mb-4">Válassz csomagot</h2>
            <p className="text-[13px] text-[#7A6A58] max-w-md mx-auto leading-relaxed">Mindkét területen három csomag közül választhatsz. Kombinálható fotós + videós csomag esetén kedvezményt adunk.</p>
          </div>
          <div className="flex justify-center mb-12">
            <div className="flex border border-[#EDE8E0] bg-white">
              {(["photo", "video"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 text-[11px] tracking-[0.15em] uppercase transition-all duration-200 ${activeTab === tab ? "bg-[#1A1510] text-white" : "text-[#7A6A58] hover:text-[#1A1510]"}`}>
                  {tab === "photo" ? "📷 Fotózás" : "🎬 Videózás"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {(activeTab === "photo" ? photoPackages : videoPackages).map((pkg, i) => (
              <div key={i} className="w-pkg-card"><PackageCard pkg={pkg} /></div>
            ))}
          </div>
          <div className="mt-12 border border-[#C8A882]/30 bg-white p-6 lg:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-px bg-[#C8A882]" />
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]">Különleges ajánlat</span>
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#1A1510]">Fotós + videós csomag kombinálva?</h3>
              <p className="text-[13px] text-[#7A6A58] mt-1">Egyedi kedvezményt adunk, ha mindkét szolgáltatást nálunk foglalod.</p>
            </div>
            <Link href="/contact" className="shrink-0 border border-[#C8A882] text-[#C8A882] text-[11px] tracking-[0.15em] uppercase px-8 py-3.5 hover:bg-[#C8A882] hover:text-white transition-all duration-300">
              Egyedi ajánlatot kérek
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-faq py-28 bg-white">
        <div className="max-w-5xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C8A882]" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">GYIK</span>
              </div>
              <h2 className="w-split-title font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3rem)] font-light text-[#1A1510] leading-[1.1] mb-6">
                Gyakori<br /><em className="not-italic text-[#C8A882]">kérdések</em>
              </h2>
              <p className="text-[13px] text-[#7A6A58] leading-[1.9] mb-8">Nem találod a választ? Írj nekünk és hamarosan visszajelzünk.</p>
              <Link href="/contact" className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[#1A1510] border-b border-[#C8A882]/40 pb-0.5 hover:border-[#C8A882] transition-all">
                Kérdezz tőlünk →
              </Link>
            </div>
            <div className="lg:col-span-8">
              {faqs.map((faq, i) => (
                <div key={i} className="w-faq-item"><FaqItem q={faq.q} a={faq.a} index={i} /></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-[#1A1510] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(#C8A882 1px, transparent 1px), linear-gradient(90deg, #C8A882 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(200,168,130,0.06) 0%, transparent 70%)" }} />
        <div className="relative max-w-3xl mx-auto px-8 text-center z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#C8A882]/50" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#C8A882]/60">Foglalj időpontot</span>
            <div className="w-8 h-px bg-[#C8A882]/50" />
          </div>
          <h2 className="font-['Cormorant_Garamond'] text-[clamp(2.5rem,5vw,4.5rem)] font-thin leading-[1] text-white mb-6">
            Tegyük<br /><em className="not-italic text-[#C8A882]">emlékezetessé</em><br />a nagy napotokat
          </h2>
          <p className="text-[14px] text-white/40 leading-[1.9] mb-10 max-w-md mx-auto">Korlátozott számú esküvőt vállalunk évente, hogy minden párnak maximális figyelmet szentelhessünk.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="bg-[#C8A882] text-white text-[11px] tracking-[0.18em] uppercase px-10 py-4 hover:bg-[#B8987A] transition-colors duration-300">Időpont egyeztetés</Link>
            <a href="tel:+36301234567" className="border border-white/20 text-white/60 text-[11px] tracking-[0.15em] uppercase px-8 py-4 hover:border-[#C8A882]/50 hover:text-white/80 transition-all duration-300">+36 30 123 4567</a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}