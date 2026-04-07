"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HUN_CITIES,
  HunCity,
  KISKUNFELEGYHAZA,
  KISZALLASI_DIF_FT_PER_KM,
  INGYENES_KORZET_KM,
  distanceKm,
} from "@/lib/hunCities";

// ── Ikonok (homogén, stroke stílusú SVG-ek) ───────────────────
const IC = {
  camera:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  video:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  sparkle:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  ring:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8l4 4-4 4"/></svg>,
  person:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  people:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  phone2:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  drone:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/><path d="M6 6L2 2m4 14L2 20m12-14l4-4m-4 14l4 4"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg>,
  dots:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  building: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><rect x="2" y="3" width="20" height="18" rx="1"/><path d="M8 21V9h8v12"/><line x1="12" y1="9" x2="12" y2="21"/></svg>,
  outdoor:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><path d="M3 17l4-8 4 5 3-3 4 6H3z"/><circle cx="17" cy="7" r="2"/></svg>,
};

// ── Adatok ────────────────────────────────────────────────────
const ESKUVO_AGAK = [
  { id: "foto",      label: "Csak fotózás",  icon: "camera" },
  { id: "video",     label: "Csak videó",    icon: "video" },
  { id: "kombinalt", label: "Fotó + Videó",  icon: "sparkle" },
];

const ESKUVO_CSOMAGOK: Record<string, Array<{
  id: number; name: string; price: string; duration: string; desc: string; bullets: string[];
}>> = {
  foto: [
    { id: 11, name: "Alap fotó",     price: "150 000 Ft", duration: "4 óra",     desc: "Ceremónia + kreatív fotók", bullets: ["400+ kép", "Online galéria 30 napig", "2 hét átfutás"] },
    { id: 12, name: "Standard fotó", price: "250 000 Ft", duration: "8 óra",     desc: "Teljes nap dokumentáció",   bullets: ["800+ kép", "Online galéria 60 napig", "1 hét átfutás"] },
    { id: 13, name: "Prémium fotó",  price: "380 000 Ft", duration: "Teljes nap",desc: "Előkészülettől búcsúig",    bullets: ["1200+ kép", "Nyomtatott album", "Online galéria 1 évig"] },
  ],
  video: [
    { id: 14, name: "Alap videó",     price: "180 000 Ft", duration: "4 óra",     desc: "Highlight + ceremónia",      bullets: ["3-5 perces highlight", "Full ceremónia", "2 hét átfutás"] },
    { id: 15, name: "Standard videó", price: "280 000 Ft", duration: "8 óra",     desc: "Teljes nap videó",           bullets: ["Cinematic highlight", "Full day", "Color grading"] },
    { id: 16, name: "Prémium videó",  price: "420 000 Ft", duration: "Teljes nap",desc: "Filmes minőségű esküvői film",bullets: ["Cinematic film", "Drón", "Second camera"] },
  ],
  kombinalt: [
    { id: 17, name: "Alap kombinált",     price: "280 000 Ft", duration: "6 óra",     desc: "Fotó + highlight videó",      bullets: ["500+ kép", "3-5 perces highlight", "Online galéria"] },
    { id: 18, name: "Standard kombinált", price: "450 000 Ft", duration: "Teljes nap",desc: "Teljes fotó + videó",          bullets: ["900+ kép", "Cinematic highlight", "Full day videó"] },
    { id: 19, name: "Prémium kombinált",  price: "680 000 Ft", duration: "Teljes nap+",desc: "A legteljesebb csomag",       bullets: ["1500+ kép", "Prémium film", "Drón", "Nyomtatott album"] },
  ],
};

const PORTRE_KATEGORIAK = [
  { id: "paros",   label: "Páros / Jegyesfotózás", icon: "people" },
  { id: "csaladi", label: "Családi fotózás",        icon: "people" },
  { id: "egyeni",  label: "Egyéni portré",          icon: "person" },
];

const PORTRE_CSOMAGOK: Record<string, Array<{
  id: number; name: string; basePrice: number; duration: string; desc: string; bullets: string[];
}>> = {
  paros: [
    { id: 21, name: "Mini páros",     basePrice: 25000, duration: "45 perc", desc: "Rövid, hangulatos fotózás", bullets: ["30+ kép", "Online galéria 30 napig", "1 hét átfutás"] },
    { id: 22, name: "Standard páros", basePrice: 45000, duration: "90 perc", desc: "Több helyszín, részletes",  bullets: ["80+ kép", "Retusálás", "5 nap átfutás"] },
    { id: 23, name: "Prémium páros",  basePrice: 75000, duration: "3 óra",   desc: "Teljes portré szett",      bullets: ["150+ kép", "Professzionális retusálás"] },
  ],
  csaladi: [
    { id: 24, name: "Mini família",     basePrice: 30000, duration: "45 perc", desc: "Gyors, vidám csoportkép",   bullets: ["40+ kép", "Online galéria 30 napig"] },
    { id: 25, name: "Standard família", basePrice: 50000, duration: "90 perc", desc: "Természetes, életteli képek",bullets: ["90+ kép", "Retusálás"] },
    { id: 26, name: "Prémium família",  basePrice: 85000, duration: "3 óra",   desc: "Részletes, több helyszín",  bullets: ["180+ kép", "Nyomtatott fotók"] },
  ],
  egyeni: [
    { id: 27, name: "Mini egyéni",     basePrice: 20000, duration: "30 perc", desc: "Gyors, profi portré",       bullets: ["20+ kép", "Online galéria 30 napig"] },
    { id: 28, name: "Standard egyéni", basePrice: 38000, duration: "60 perc", desc: "Önbizalom-erősítő szett",   bullets: ["60+ kép", "Retusálás"] },
    { id: 29, name: "Prémium egyéni",  basePrice: 65000, duration: "2 óra",   desc: "Teljes brand portfólió",    bullets: ["120+ kép", "Professzionális retusálás"] },
  ],
};

const SZABADTERI_FELAR = 10000;

const EGYEDI_AR_TIPUSOK: Record<string, { icon: string; label: string; ajanlat: string; megjegyzes: string }> = {
  rendezvenyek: { icon: "calendar", label: "Rendezvény",     ajanlat: "80 000 – 280 000 Ft",   megjegyzes: "Az ár a rendezvény hosszától és helyszínétől függ. Egyeztetés alapján küldünk ajánlatot." },
  marketing:    { icon: "phone2",   label: "Marketing",      ajanlat: "60 000 – 220 000 Ft/hó", megjegyzes: "A dátum a személyes egyeztetési alkalom időpontja. Ezt követően egyedi tartalomtervet készítünk." },
  dron:         { icon: "drone",    label: "Drón felvételek",ajanlat: "50 000 – 160 000 Ft",   megjegyzes: "A drón repülési engedélytől és időjárástól függ. Rossz idő esetén napolunk — erről előre értesítünk." },
  egyeb:        { icon: "dots",     label: "Egyedi projekt",  ajanlat: "Egyedi árajánlat",       megjegyzes: "Írd le részletesen az elképzeléseidet, 24 órán belül visszajelzünk személyre szabott ajánlattal." },
};

type ProjectTypeId = "eskuvo" | "portre" | "rendezvenyek" | "marketing" | "dron" | "egyeb";

function isTelHonap(date: string) { const m = new Date(date).getMonth(); return m === 11 || m === 0 || m === 1; }
function isOsziHonap(date: string) { const m = new Date(date).getMonth(); return m === 9 || m === 10; }
function formatPrice(n: number) { return n.toLocaleString("hu-HU") + " Ft"; }

// ── Kiszállási díj számítás ───────────────────────────────────
function calcTravel(city: HunCity) {
  const km = distanceKm(KISKUNFELEGYHAZA.lat, KISKUNFELEGYHAZA.lng, city.lat, city.lng);
  const isFree = km <= INGYENES_KORZET_KM;
  const fee = isFree ? 0 : Math.round((km - INGYENES_KORZET_KM) * KISZALLASI_DIF_FT_PER_KM);
  return { km, fee, isFree };
}

// ── LocationPicker ────────────────────────────────────────────
function LocationPicker({ value, onChangeName, onChangeFee }: {
  value: string;
  onChangeName: (name: string) => void;
  onChangeFee: (fee: number) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<HunCity | null>(
    HUN_CITIES.find(c => c.name === value) ?? null
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = query.length >= 1
    ? HUN_CITIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  function handleSelect(city: HunCity) {
    setSelected(city);
    setQuery(city.name);
    setOpen(false);
    const { fee } = calcTravel(city);
    onChangeName(city.name);
    onChangeFee(fee);
  }

  function handleClear() {
    setSelected(null);
    setQuery("");
    setOpen(false);
    onChangeName("");
    onChangeFee(0);
  }

  const travelInfo = selected ? calcTravel(selected) : null;

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A08060]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </span>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setSelected(null); onChangeName(""); onChangeFee(0); }}
          onFocus={() => { if (query.length >= 1) setOpen(true); }}
          placeholder="Helyszín keresése (város)..."
          className="w-full bg-white border border-[#EDE8E0] text-[13px] text-[#1A1510] placeholder:text-[#C8B8A0]/70 focus:outline-none focus:border-[#C8A882] pl-9 pr-9 py-2.5 transition-colors"
        />
        {query && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C8B8A0] hover:text-[#A08060] transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="bg-white border border-[#EDE8E0] shadow-lg overflow-hidden z-50 relative">
          {filtered.map(city => {
            const { km, fee, isFree } = calcTravel(city);
            return (
              <button key={city.name} onClick={() => handleSelect(city)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#FAF8F4] transition-colors border-b border-[#EDE8E0]/60 last:border-b-0">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.5" className="w-3.5 h-3.5 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span className="text-[13px] text-[#1A1510]">{city.name}</span>
                </div>
                <span className={`text-[10px] shrink-0 ml-4 ${isFree ? "text-[#16A34A]" : "text-[#A08060]"}`}>
                  {isFree ? "Ingyenes" : `+${formatPrice(fee)} (${Math.round(km)} km)`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Kiválasztott info */}
      {selected && travelInfo && (
        <div className={`border px-4 py-3 flex items-start gap-3 ${travelInfo.isFree ? "bg-green-50 border-green-200" : "bg-[#FDF9F5] border-[#EDE8E0]"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke={travelInfo.isFree ? "#16A34A" : "#C8A882"} strokeWidth="1.5" className="w-4 h-4 shrink-0 mt-0.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[13px] font-medium text-[#1A1510]">{selected.name}</span>
              {travelInfo.isFree
                ? <span className="text-[11px] font-medium text-[#16A34A]">Kiszállás ingyenes ✓</span>
                : <span className="text-[13px] font-medium text-[#C8A882]">+{formatPrice(travelInfo.fee)}</span>
              }
            </div>
            <div className="text-[11px] text-[#7A6A58] mt-0.5">
              {travelInfo.isFree
                ? `${Math.round(travelInfo.km)} km – 25 km-es körzetben vagyunk`
                : `${Math.round(travelInfo.km)} km × ${KISZALLASI_DIF_FT_PER_KM} Ft/km kiszállási díj`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MiniCalendar ──────────────────────────────────────────────
function MiniCalendar({ selectedDate, onSelect, busyDates }: {
  selectedDate: string; onSelect: (d: string) => void; busyDates: string[];
}) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const year = viewMonth.getFullYear(), month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0);
  let startOffset = firstDay.getDay() - 1; if (startOffset < 0) startOffset = 6;
  const days: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  function toYMD(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }

  return (
    <div className="bg-white border border-[#EDE8E0] p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewMonth(m => { const n = new Date(m); n.setMonth(n.getMonth()-1); return n; })} className="w-7 h-7 flex items-center justify-center border border-[#EDE8E0] text-[#A08060] hover:border-[#C8A882]/40 transition-all">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="text-[12px] font-medium text-[#1A1510]">{viewMonth.toLocaleDateString("hu-HU", { year: "numeric", month: "long" })}</span>
        <button onClick={() => setViewMonth(m => { const n = new Date(m); n.setMonth(n.getMonth()+1); return n; })} className="w-7 h-7 flex items-center justify-center border border-[#EDE8E0] text-[#A08060] hover:border-[#C8A882]/40 transition-all">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["H","K","Sz","Cs","P","Szo","V"].map(d => <div key={d} className="text-center text-[9px] tracking-[0.08em] uppercase text-[#C8B8A0] py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          if (!day) return <div key={i} />;
          const ymd = toYMD(day);
          const isPast = day < today;
          const isBusy = busyDates.includes(ymd);
          const isSelected = selectedDate === ymd;
          const disabled = isPast || isBusy;
          return (
            <button key={i} disabled={disabled} onClick={() => !disabled && onSelect(ymd)}
              title={isBusy ? "Foglalt nap" : undefined}
              className={`relative h-8 w-full text-[11px] transition-all
                ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                ${isSelected ? "bg-[#1A1510] text-white" : ""}
                ${!isSelected && isBusy ? "bg-[#C8A882]/15 text-[#C8A882]/50 line-through" : ""}
                ${!isSelected && isPast && !isBusy ? "text-[#C8B8A0]" : ""}
                ${!isSelected && !disabled ? "hover:bg-[#FAF8F4] text-[#1A1510]" : ""}
              `}>
              {day.getDate()}
              {isBusy && !isPast && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C8A882]" />}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#EDE8E0]">
        <div className="flex items-center gap-1.5 text-[10px] text-[#A08060]"><div className="w-3 h-3 bg-[#C8A882]/20 rounded-sm" />Foglalt</div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#A08060]"><div className="w-3 h-3 bg-[#FAF8F4] border border-[#EDE8E0] rounded-sm" />Szabad</div>
      </div>
    </div>
  );
}

// ── UI segéd komponensek ──────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map(n => (
        <div key={n} className={`transition-all duration-300 ${n === current ? "w-6 h-1.5 bg-[#C8A882]" : n < current ? "w-1.5 h-1.5 rounded-full bg-[#C8A882]/40" : "w-1.5 h-1.5 rounded-full bg-[#EDE8E0]"}`} />
      ))}
      <span className="text-[10px] tracking-[0.1em] text-[#A08060] ml-1">{current} / {total}</span>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] tracking-[0.15em] uppercase text-[#A08060]">{label}{required && <span className="text-[#C8A882] ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

function InfoBox({ children, type = "tip" }: { children: React.ReactNode; type?: "info"|"warning"|"tip" }) {
  const s = {
    info:    { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",  icon: "ℹ️" },
    warning: { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700", icon: "⚠️" },
    tip:     { bg: "bg-[#FAF8F4]", border: "border-[#EDE8E0]",  text: "text-[#7A6A58]", icon: "·" },
  }[type];
  return (
    <div className={`${s.bg} border ${s.border} px-4 py-3 flex items-start gap-2.5 text-[12px] ${s.text} leading-relaxed`}>
      <span className="shrink-0 mt-0.5">{s.icon}</span>
      <div>{children}</div>
    </div>
  );
}

const inputCls = "w-full bg-white border border-[#EDE8E0] text-[13px] text-[#1A1510] placeholder:text-[#C8B8A0]/60 focus:outline-none focus:border-[#C8A882] px-3 py-2.5 transition-colors";

// ── Főkomponens ───────────────────────────────────────────────
export default function ContactPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Wizard state
  const [typeId, setTypeId]         = useState<ProjectTypeId | null>(null);
  const [eskuvoAg, setEskuvoAg]     = useState<string | null>(null);
  const [portreKat, setPortreKat]   = useState<string | null>(null);
  const [szabadteri, setSzabadteri] = useState<boolean | null>(null);
  const [packageId, setPackageId]   = useState<number | null>(null);
  const [packageName, setPackageName] = useState("");
  const [packagePrice, setPackagePrice] = useState("");

  // Részletek
  const [projectName, setProjectName]   = useState("");
  const [description, setDescription]   = useState("");
  const [phone, setPhone]               = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [location, setLocation]         = useState("");
  const [travelFee, setTravelFee]       = useState(0);

  const [busyDates, setBusyDates] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/calendar/busy?from=" + new Date().toISOString())
      .then(r => r.json())
      .then(d => setBusyDates(d.busyDates ?? []))
      .catch(() => {});
  }, []);

  const hasPackages = typeId === "eskuvo" || typeId === "portre";
  const totalSteps = hasPackages ? 4 : 3;

  function portreAr(base: number) { return base + (szabadteri ? SZABADTERI_FELAR : 0); }

  function getDbTypeId(t: ProjectTypeId): number {
    return { eskuvo: 1, portre: 2, rendezvenyek: 3, marketing: 4, dron: 5, egyeb: 6 }[t];
  }

  function getSummaryPackage() {
    if (typeId === "eskuvo" && eskuvoAg) {
      return `${ESKUVO_AGAK.find(a => a.id === eskuvoAg)?.label} — ${packageName} (${packagePrice})`;
    }
    if (typeId === "portre" && portreKat) {
      return `${PORTRE_KATEGORIAK.find(k => k.id === portreKat)?.label} — ${szabadteri ? "Szabadtéri" : "Stúdió"} — ${packageName} (${packagePrice})`;
    }
    if (typeId && EGYEDI_AR_TIPUSOK[typeId]) return `${EGYEDI_AR_TIPUSOK[typeId].label} — Egyedi árajánlat`;
    return "—";
  }

  // Teljes fizetendő
  const basePackagePrice = packagePrice
    ? parseInt(packagePrice.replace(/[^\d]/g, ""))
    : 0;
  const totalPrice = basePackagePrice + travelFee;

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          description: [
            description,
            phone ? `Telefon: ${phone}` : null,
            location ? `Helyszín: ${location}` : null,
            travelFee > 0 ? `Kiszállási díj: ${formatPrice(travelFee)}` : null,
            typeId === "portre" && szabadteri !== null ? `Fotózás típusa: ${szabadteri ? "Szabadtéri" : "Stúdió"}` : null,
            eskuvoAg ? `Esküvő típusa: ${ESKUVO_AGAK.find(a => a.id === eskuvoAg)?.label}` : null,
          ].filter(Boolean).join("\n\n"),
          typeId: getDbTypeId(typeId!),
          packageId,
          date: preferredDate || null,
          phone: phone || null,
          location: location || null,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        if (res.status === 409) { setPreferredDate(""); setStep(hasPackages ? 3 : 2); }
        throw new Error(e.error);
      }
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message ?? "Szerverhiba");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success ───────────────────────────────────────────────
  if (submitted) return (
    <div className="fixed inset-0 bg-[#FAF8F4] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 border border-[#C8A882]/40 flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.5" className="w-6 h-6"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-5 h-px bg-[#C8A882]/40" /><span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">Köszönjük</span><div className="w-5 h-px bg-[#C8A882]/40" />
        </div>
        <h2 className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#1A1510] mb-3">Igénylés elküldve!</h2>
        <p className="text-[13px] text-[#7A6A58] leading-relaxed mb-8">Hamarosan felvesszük veled a kapcsolatot.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="px-7 py-3 border border-[#EDE8E0] text-[11px] tracking-[0.12em] uppercase text-[#7A6A58] hover:border-[#C8A882]/40 transition-all text-center">Főoldal</Link>
          <Link href="/user/projects" className="px-7 py-3 bg-[#1A1510] text-[11px] tracking-[0.12em] uppercase text-white hover:bg-[#C8A882] transition-all text-center">Projektem →</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#FAF8F4] flex flex-col overflow-hidden">
      {/* Fejléc */}
      <div className="shrink-0 flex items-center justify-between px-5 sm:px-8 lg:px-12 py-4 border-b border-[#EDE8E0] bg-white">
        <Link href="/" className="flex items-center gap-2 text-[#1A1510] hover:text-[#C8A882] transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span className="text-[11px] tracking-[0.1em] uppercase hidden sm:block">Vissza</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-5 h-px bg-[#C8A882]" />
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">Projekt igénylés</span>
        </div>
        <StepDots current={step} total={totalSteps} />
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Bal panel */}
        <div className="hidden lg:flex w-[320px] xl:w-[380px] shrink-0 flex-col justify-between bg-[#F5EFE6] border-r border-[#EDE8E0] px-10 py-10">
          <div>
            <h1 className="font-['Cormorant_Garamond'] text-[2.8rem] font-light text-[#1A1510] leading-[1] mb-6">
              Kezdjük el<br />a közös<br /><em className="not-italic text-[#C8A882]">munkát</em>
            </h1>
            <p className="text-[13px] font-light text-[#7A6A58] leading-[1.9] mb-8">{totalSteps} lépésben elindíthatod a projektedet.</p>
            <div className="flex flex-col gap-3">
              {Array.from({ length: totalSteps }, (_, i) => {
                const labels = hasPackages
                  ? ["Projekt típusa", "Csomag", "Részletek & Időpont", "Összefoglaló"]
                  : ["Projekt típusa", "Részletek & Időpont", "Összefoglaló"];
                return (
                  <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${step === i+1 ? "opacity-100" : step > i+1 ? "opacity-50" : "opacity-30"}`}>
                    <div className={`w-6 h-6 flex items-center justify-center border text-[10px] shrink-0 transition-all ${step > i+1 ? "bg-[#C8A882] border-[#C8A882] text-white" : step === i+1 ? "border-[#C8A882] text-[#C8A882]" : "border-[#DDD5C8] text-[#A08060]"}`}>
                      {step > i+1 ? <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg> : i + 1}
                    </div>
                    <span className={`text-[12px] ${step === i+1 ? "text-[#1A1510] font-medium" : "text-[#7A6A58]"}`}>{labels[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {session?.user && (
            <div className="flex items-center gap-3 pt-6 border-t border-[#EDE8E0]">
              <div className="w-8 h-8 bg-[#C8A882]/20 border border-[#C8A882]/30 flex items-center justify-center font-['Cormorant_Garamond'] text-[14px] text-[#C8A882]">
                {session.user.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <div>
                <div className="text-[12px] text-[#1A1510]">{session.user.name}</div>
                <div className="text-[10px] text-[#A08060]">{session.user.email}</div>
              </div>
            </div>
          )}
        </div>

        {/* Jobb: wizard */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-5 sm:px-8 py-6 sm:py-10">

              {/* ═══ STEP 1: Típus ═══ */}
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2.2rem] font-light text-[#1A1510] mb-1">Milyen projektre van szükséged?</h2>
                    <p className="text-[12px] text-[#A08060]">Válaszd ki a kategóriát</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: "eskuvo",       icon: "ring",     name: "Esküvő",     desc: "Fotó, videó vagy kombinált" },
                      { id: "portre",       icon: "person",   name: "Portré",     desc: "Páros, családi vagy egyéni" },
                      { id: "rendezvenyek", icon: "calendar", name: "Rendezvény", desc: "Céges vagy magán esemény" },
                      { id: "marketing",    icon: "phone2",   name: "Marketing",  desc: "Social media & brand tartalom" },
                      { id: "dron",         icon: "drone",    name: "Drón",       desc: "Légifotó és videó" },
                      { id: "egyeb",        icon: "dots",     name: "Egyéb",      desc: "Egyedi igény" },
                    ].map(t => (
                      <button key={t.id} onClick={() => {
                        setTypeId(t.id as ProjectTypeId);
                        setEskuvoAg(null); setPortreKat(null); setSzabadteri(null);
                        setPackageId(null); setPackageName(""); setPackagePrice("");
                        setStep(2);
                      }} className="group flex flex-col gap-3 p-4 sm:p-5 border border-[#EDE8E0] bg-white hover:border-[#C8A882]/50 hover:bg-[#FAF8F4] transition-all text-left">
                        <span className="text-[#C8A882]/70 group-hover:text-[#C8A882] transition-colors">{IC[t.icon as keyof typeof IC]}</span>
                        <div>
                          <div className="text-[13px] text-[#1A1510] font-medium mb-0.5">{t.name}</div>
                          <div className="text-[11px] text-[#A08060] leading-snug">{t.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ STEP 2: Csomag / Egyedi ═══ */}
              {step === 2 && typeId && (
                typeId === "eskuvo" ? (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2.2rem] font-light text-[#1A1510] mb-1">Esküvői csomag</h2>
                      <p className="text-[12px] text-[#A08060]">Először válaszd ki mit szeretnél, majd a csomagot</p>
                    </div>
                    <InfoBox type="tip">A kombinált csomag (fotó + videó) mindig kedvezőbb, mintha külön rendelnéd.</InfoBox>
                    <div className="grid grid-cols-3 gap-2">
                      {ESKUVO_AGAK.map(ag => (
                        <button key={ag.id} onClick={() => { setEskuvoAg(ag.id); setPackageId(null); setPackageName(""); setPackagePrice(""); }}
                          className={`flex flex-col items-center gap-2 p-4 border transition-all ${eskuvoAg === ag.id ? "bg-[#FAF8F4] border-[#C8A882]" : "border-[#EDE8E0] bg-white hover:border-[#C8A882]/40"}`}>
                          <span className={`transition-colors ${eskuvoAg === ag.id ? "text-[#C8A882]" : "text-[#A08060]"}`}>{IC[ag.icon as keyof typeof IC]}</span>
                          <span className="text-[11px] text-[#1A1510] font-medium text-center leading-tight">{ag.label}</span>
                        </button>
                      ))}
                    </div>
                    {eskuvoAg && (
                      <div className="flex flex-col gap-2">
                        {ESKUVO_CSOMAGOK[eskuvoAg].map(pkg => (
                          <button key={pkg.id} onClick={() => { setPackageId(pkg.id); setPackageName(pkg.name); setPackagePrice(pkg.price); }}
                            className={`flex items-start gap-4 p-4 sm:p-5 border transition-all text-left ${packageId === pkg.id ? "border-[#C8A882]/50 bg-[#FAF8F4]" : "border-[#EDE8E0] bg-white hover:border-[#C8A882]/30"}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-1.5">
                                <span className="text-[13px] text-[#1A1510] font-medium">{pkg.name}<span className="text-[11px] text-[#A08060] font-normal ml-2">{pkg.duration}</span></span>
                                <span className="font-['Cormorant_Garamond'] text-[1.1rem] font-light text-[#C8A882] shrink-0">{pkg.price}</span>
                              </div>
                              <p className="text-[11px] text-[#7A6A58] mb-2">{pkg.desc}</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-1">
                                {pkg.bullets.map((b, i) => <span key={i} className="flex items-center gap-1 text-[10px] text-[#A08060]"><span className="w-1 h-1 rounded-full bg-[#C8A882]/50" />{b}</span>)}
                              </div>
                            </div>
                            <div className={`shrink-0 w-5 h-5 border flex items-center justify-center mt-0.5 ${packageId === pkg.id ? "bg-[#1A1510] border-[#1A1510]" : "border-[#EDE8E0]"}`}>
                              {packageId === pkg.id && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="px-5 py-3 border border-[#EDE8E0] text-[11px] tracking-[0.1em] uppercase text-[#A08060] hover:text-[#1A1510] transition-all">← Vissza</button>
                      <button onClick={() => { if (eskuvoAg && packageId) setStep(3); }} disabled={!eskuvoAg || !packageId}
                        className="flex-1 py-3 bg-[#1A1510] text-[11px] tracking-[0.14em] uppercase text-white hover:bg-[#C8A882] transition-all disabled:opacity-40">Tovább →</button>
                    </div>
                  </div>
                ) : typeId === "portre" ? (
                  <div className="flex flex-col gap-6">
                    <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2.2rem] font-light text-[#1A1510]">Portré csomag</h2>
                    <div className="grid grid-cols-3 gap-2">
                      {PORTRE_KATEGORIAK.map(k => (
                        <button key={k.id} onClick={() => { setPortreKat(k.id); setPackageId(null); setPackageName(""); setPackagePrice(""); }}
                          className={`flex flex-col items-center gap-2 p-4 border transition-all ${portreKat === k.id ? "bg-[#FAF8F4] border-[#C8A882]" : "border-[#EDE8E0] bg-white hover:border-[#C8A882]/40"}`}>
                          <span className={`transition-colors ${portreKat === k.id ? "text-[#C8A882]" : "text-[#A08060]"}`}>{IC[k.icon as keyof typeof IC]}</span>
                          <span className="text-[11px] text-[#1A1510] font-medium text-center leading-tight">{k.label}</span>
                        </button>
                      ))}
                    </div>
                    {portreKat && (
                      <>
                        <div>
                          <div className="text-[10px] tracking-[0.14em] uppercase text-[#A08060] mb-2">Helyszín típusa</div>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { v: false, label: "Stúdió",     desc: "Kontrollált fény, bármilyen időben", icon: "building" },
                              { v: true,  label: "Szabadtéri", desc: `+${formatPrice(SZABADTERI_FELAR)} felár`, icon: "outdoor" },
                            ].map(opt => (
                              <button key={String(opt.v)} onClick={() => setSzabadteri(opt.v)}
                                className={`flex items-start gap-3 p-4 border transition-all text-left ${szabadteri === opt.v ? "bg-[#FAF8F4] border-[#C8A882]" : "border-[#EDE8E0] bg-white hover:border-[#C8A882]/40"}`}>
                                <span className={`shrink-0 mt-0.5 transition-colors ${szabadteri === opt.v ? "text-[#C8A882]" : "text-[#A08060]"}`}>{IC[opt.icon as keyof typeof IC]}</span>
                                <div>
                                  <div className="text-[12px] text-[#1A1510] font-medium">{opt.label}</div>
                                  <div className="text-[10px] text-[#A08060]">{opt.desc}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                          {szabadteri && <div className="mt-3"><InfoBox type="tip">Szabadtéri fotózásnál az időjárás meghatározó. Esős napon közösen egyeztetünk az átütemezésről.</InfoBox></div>}
                        </div>
                        {szabadteri !== null && (
                          <div className="flex flex-col gap-2">
                            {PORTRE_CSOMAGOK[portreKat].map(pkg => {
                              const fp = portreAr(pkg.basePrice);
                              const isSel = packageId === pkg.id;
                              return (
                                <button key={pkg.id} onClick={() => { setPackageId(pkg.id); setPackageName(pkg.name); setPackagePrice(formatPrice(fp)); }}
                                  className={`flex items-start gap-4 p-4 border transition-all text-left ${isSel ? "border-[#C8A882]/50 bg-[#FAF8F4]" : "border-[#EDE8E0] bg-white hover:border-[#C8A882]/30"}`}>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 mb-1.5">
                                      <span className="text-[13px] text-[#1A1510] font-medium">{pkg.name}<span className="text-[11px] text-[#A08060] font-normal ml-2">{pkg.duration}</span></span>
                                      <div className="text-right shrink-0">
                                        <div className="font-['Cormorant_Garamond'] text-[1.1rem] font-light text-[#C8A882]">{formatPrice(fp)}</div>
                                        {szabadteri && <div className="text-[9px] text-[#A08060]">+{formatPrice(SZABADTERI_FELAR)} beleszámítva</div>}
                                      </div>
                                    </div>
                                    <p className="text-[11px] text-[#7A6A58] mb-2">{pkg.desc}</p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                                      {pkg.bullets.map((b, i) => <span key={i} className="flex items-center gap-1 text-[10px] text-[#A08060]"><span className="w-1 h-1 rounded-full bg-[#C8A882]/50" />{b}</span>)}
                                    </div>
                                  </div>
                                  <div className={`shrink-0 w-5 h-5 border flex items-center justify-center mt-0.5 ${isSel ? "bg-[#1A1510] border-[#1A1510]" : "border-[#EDE8E0]"}`}>
                                    {isSel && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="px-5 py-3 border border-[#EDE8E0] text-[11px] tracking-[0.1em] uppercase text-[#A08060] hover:text-[#1A1510] transition-all">← Vissza</button>
                      <button onClick={() => { if (portreKat && szabadteri !== null && packageId) setStep(3); }}
                        disabled={!portreKat || szabadteri === null || !packageId}
                        className="flex-1 py-3 bg-[#1A1510] text-[11px] tracking-[0.14em] uppercase text-white hover:bg-[#C8A882] transition-all disabled:opacity-40">Tovább →</button>
                    </div>
                  </div>
                ) : (
                  // Egyedi ár típusok → rögtön részletek
                  <StepReszletek
                    typeId={typeId} projectName={projectName} setProjectName={setProjectName}
                    description={description} setDescription={setDescription}
                    phone={phone} setPhone={setPhone}
                    preferredDate={preferredDate} setPreferredDate={setPreferredDate}
                    location={location} setLocation={setLocation}
                    travelFee={travelFee} setTravelFee={setTravelFee}
                    busyDates={busyDates} error={error}
                    onBack={() => setStep(1)}
                    onNext={() => {
                      if (!projectName.trim() || !description.trim()) { setError("A projekt neve és leírása kötelező."); return; }
                      setError(""); setStep(3);
                    }}
                  />
                )
              )}

              {/* ═══ STEP 3: Részletek (ha csomagos) ═══ */}
              {step === 3 && hasPackages && (
                <StepReszletek
                  typeId={typeId!} projectName={projectName} setProjectName={setProjectName}
                  description={description} setDescription={setDescription}
                  phone={phone} setPhone={setPhone}
                  preferredDate={preferredDate} setPreferredDate={setPreferredDate}
                  location={location} setLocation={setLocation}
                  travelFee={travelFee} setTravelFee={setTravelFee}
                  busyDates={busyDates} error={error}
                  onBack={() => setStep(2)}
                  onNext={() => {
                    if (!projectName.trim() || !description.trim()) { setError("A projekt neve és leírása kötelező."); return; }
                    setError(""); setStep(4);
                  }}
                />
              )}

              {/* ═══ Összefoglaló ═══ */}
              {((step === 3 && !hasPackages) || (step === 4 && hasPackages)) && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2.2rem] font-light text-[#1A1510] mb-1">Összefoglaló</h2>
                    <p className="text-[12px] text-[#A08060]">Ellenőrizd az adatokat</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="bg-[#F5EFE6] border border-[#EDE8E0] p-4">
                      <div className="text-[9px] tracking-[0.14em] uppercase text-[#A08060] mb-1">Csomag</div>
                      <div className="text-[13px] text-[#1A1510] font-medium">{getSummaryPackage()}</div>
                    </div>
                    {[
                      { label: "Projekt neve",   value: projectName },
                      { label: "Helyszín",       value: location || "Nincs megadva" },
                      { label: "Kívánt időpont", value: preferredDate ? new Date(preferredDate).toLocaleDateString("hu-HU") : "Nincs megadva" },
                      { label: "Telefon",        value: phone || "Nincs megadva" },
                      { label: "Email",          value: session?.user?.email ?? "—" },
                    ].map(row => (
                      <div key={row.label} className="bg-white border border-[#EDE8E0] px-4 py-3 flex items-center justify-between gap-4">
                        <span className="text-[10px] tracking-[0.12em] uppercase text-[#A08060]">{row.label}</span>
                        <span className="text-[13px] text-[#1A1510] text-right truncate">{row.value}</span>
                      </div>
                    ))}
                    {/* Árösszesítő */}
                    {(basePackagePrice > 0 || travelFee > 0) && (
                      <div className="bg-white border border-[#EDE8E0] px-4 py-3 flex flex-col gap-1.5">
                        {basePackagePrice > 0 && (
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-[#A08060]">Csomag ára</span>
                            <span className="text-[#1A1510]">{formatPrice(basePackagePrice)}</span>
                          </div>
                        )}
                        {travelFee > 0 && (
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-[#A08060]">Kiszállási díj</span>
                            <span className="text-[#C8A882]">+{formatPrice(travelFee)}</span>
                          </div>
                        )}
                        {basePackagePrice > 0 && travelFee > 0 && (
                          <div className="flex items-center justify-between text-[13px] font-medium pt-1.5 border-t border-[#EDE8E0]">
                            <span className="text-[#1A1510]">Becsült összesen</span>
                            <span className="text-[#1A1510]">{formatPrice(totalPrice)}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="bg-white border border-[#EDE8E0] px-4 py-3">
                      <div className="text-[10px] tracking-[0.12em] uppercase text-[#A08060] mb-1.5">Leírás</div>
                      <div className="text-[12px] text-[#7A6A58] leading-relaxed line-clamp-3">{description}</div>
                    </div>
                  </div>
                  {error && <p className="text-[11px] text-red-500">{error}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => setStep(hasPackages ? 3 : 2)} className="px-5 py-3 border border-[#EDE8E0] text-[11px] tracking-[0.1em] uppercase text-[#A08060] hover:text-[#1A1510] transition-all">← Módosítás</button>
                    <button onClick={handleSubmit} disabled={submitting}
                      className="flex-1 py-3 bg-[#1A1510] text-[11px] tracking-[0.14em] uppercase text-white hover:bg-[#C8A882] transition-all disabled:opacity-50">
                      {submitting ? "Küldés..." : "Igénylés elküldése →"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Mobil progress */}
          <div className="lg:hidden shrink-0 border-t border-[#EDE8E0] bg-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map(n => (
                <div key={n} className={`transition-all duration-300 ${n === step ? "w-5 h-1.5 bg-[#C8A882]" : n < step ? "w-1.5 h-1.5 rounded-full bg-[#C8A882]/40" : "w-1.5 h-1.5 rounded-full bg-[#EDE8E0]"}`} />
              ))}
            </div>
            <span className="text-[10px] text-[#A08060]">{step}. lépés / {totalSteps}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Részletek step ────────────────────────────────────────────
function StepReszletek({
  typeId, projectName, setProjectName, description, setDescription,
  phone, setPhone, preferredDate, setPreferredDate,
  location, setLocation, travelFee, setTravelFee,
  busyDates, error, onBack, onNext,
}: {
  typeId: ProjectTypeId;
  projectName: string; setProjectName: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  preferredDate: string; setPreferredDate: (v: string) => void;
  location: string; setLocation: (v: string) => void;
  travelFee: number; setTravelFee: (v: number) => void;
  busyDates: string[]; error: string;
  onBack: () => void; onNext: () => void;
}) {
  const egyedi = EGYEDI_AR_TIPUSOK[typeId];
  const isMarketing = typeId === "marketing";
  const isDron = typeId === "dron";
  const isSzabadteriTipus = ["eskuvo", "portre", "dron"].includes(typeId);

  const showTelWarning = preferredDate && isTelHonap(preferredDate) && isSzabadteriTipus;
  const showOsziWarning = preferredDate && isOsziHonap(preferredDate) && isSzabadteriTipus && !showTelWarning;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2.2rem] font-light text-[#1A1510] mb-1">Projekt részletei</h2>
        {egyedi && <p className="text-[12px] text-[#A08060]">{egyedi.label} — {egyedi.ajanlat}</p>}
      </div>
      {egyedi && <InfoBox type="tip">{egyedi.megjegyzes}</InfoBox>}

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Projekt neve" required>
            <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
              placeholder={isMarketing ? "Pl. Kovács Kft. social media" : "Pl. Szabó Esküvő 2025"}
              className={inputCls} />
          </Field>
          <Field label="Telefonszám">
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+36 30 123 4567" className={inputCls} />
          </Field>
        </div>

        {/* Helyszín */}
        <Field label="Helyszín">
          <LocationPicker
            value={location}
            onChangeName={name => setLocation(name)}
            onChangeFee={fee => setTravelFee(fee)}
          />
        </Field>

        <Field label="Leírás, elképzelések" required>
          <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)}
            placeholder={
              isMarketing ? "Milyen platformokon vagy jelen? Mi a célközönséged?" :
              isDron ? "Helyszín, milyen célra kell a felvétel..." :
              "Mesélj a projektről — hangulat, különleges kérések..."
            }
            className={`${inputCls} resize-none`} />
        </Field>
      </div>

      {/* Naptár */}
      <div>
        <div className="text-[10px] tracking-[0.14em] uppercase text-[#A08060] mb-3">
          {isMarketing ? "Egyeztetési időpont (opcionális)" : "Kívánt időpont (opcionális)"}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <MiniCalendar selectedDate={preferredDate} onSelect={setPreferredDate} busyDates={busyDates} />
          <div className="flex flex-col gap-3">
            {preferredDate ? (
              <div className="bg-[#F5EFE6] border border-[#EDE8E0] p-4">
                <div className="text-[9px] tracking-[0.14em] uppercase text-[#A08060] mb-1">Kiválasztott nap</div>
                <div className="font-['Cormorant_Garamond'] text-[1.2rem] font-light text-[#1A1510]">
                  {new Date(preferredDate + "T12:00:00").toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
                </div>
                <button onClick={() => setPreferredDate("")} className="mt-2 text-[10px] text-[#A08060] hover:text-[#C8A882] transition-colors">Törlés ×</button>
              </div>
            ) : (
              <div className="bg-white border border-dashed border-[#EDE8E0] p-4 text-center">
                <div className="text-[12px] text-[#C8B8A0]">Válassz napot a naptárból</div>
                <div className="text-[10px] text-[#C8B8A0] mt-1">(nem kötelező)</div>
              </div>
            )}
            {showTelWarning && <InfoBox type="warning"><strong>Téli időpont!</strong> December–február között szabadtéri fotózás korlátozott. Hideg, havas időben átütemezünk — erről előre egyeztetünk.</InfoBox>}
            {showOsziWarning && <InfoBox type="warning">Őszi időpontban az időjárás változékony lehet. Esős nap esetén halasztási lehetőséget biztosítunk.</InfoBox>}
            <InfoBox type="tip">A foglalt napok (áthúzva) már le vannak kötve. Szabad napra érdemesebb időpontot kérni.</InfoBox>
          </div>
        </div>
      </div>

      {error && <p className="text-[11px] text-red-500">{error}</p>}
      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3 border border-[#EDE8E0] text-[11px] tracking-[0.1em] uppercase text-[#A08060] hover:text-[#1A1510] transition-all">← Vissza</button>
        <button onClick={onNext} className="flex-1 py-3 bg-[#1A1510] text-[11px] tracking-[0.14em] uppercase text-white hover:bg-[#C8A882] transition-all">Összefoglaló →</button>
      </div>
    </div>
  );
}