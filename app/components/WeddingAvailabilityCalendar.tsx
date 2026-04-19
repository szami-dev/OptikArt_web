"use client";

// app/components/WeddingAvailabilityCalendar.tsx
// Publikus naptár a wedding oldalra – mutatja a szabad/foglalt napokat

import { useEffect, useState } from "react";
import Link from "next/link";

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function WeddingAvailabilityCalendar() {
  const [busyDates, setBusyDates]   = useState<string[]>([]);
  const [loading, setLoading]       = useState(true);
  const [viewMonth, setViewMonth]   = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  useEffect(() => {
    fetch("/api/calendar/busy?from=" + new Date().toISOString())
      .then(r => r.json())
      .then(d => setBusyDates(d.busyDates ?? []))
      .finally(() => setLoading(false));
  }, []);

  const y = viewMonth.getFullYear();
  const m = viewMonth.getMonth();

  // Generáljuk a naptár cellákat
  const first = new Date(y, m, 1);
  const last  = new Date(y, m + 1, 0);
  let offset  = first.getDay() - 1;
  if (offset < 0) offset = 6;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(y, m, d));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Hány szabad hétvége van még a hónapban
  const freeWeekends = cells.filter(d => {
    if (!d) return false;
    const ymd = toYMD(d);
    const dow = d.getDay(); // 0=V, 6=Szo
    return (dow === 6 || dow === 0) && d >= today && !busyDates.includes(ymd);
  });

  const monthName = viewMonth.toLocaleDateString("hu-HU", { year: "numeric", month: "long" });

  return (
    <section className="py-28 bg-[#F5EFE6]">
      <div className="max-w-5xl mx-auto px-8 lg:px-16">
        {/* Fejléc */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#C8A882]" />
              <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                Szabad időpontok
              </span>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3rem)] font-light text-[#1A1510] leading-[1.1] mb-6">
              Mikor vagyunk
              <br />
              <em className="not-italic text-[#C8A882]">elérhetők?</em>
            </h2>
            <p className="text-[13px] text-[#7A6A58] leading-[1.9] mb-6">
              Naptárunkban láthatod a már lefoglalt dátumokat. A szabad napokra
              még lehet időpontot egyeztetni — minél hamarabb, annál biztosabb.
            </p>

            {/* Statisztika */}
            {!loading && (
              <div className="flex gap-6 mb-8">
                <div className="bg-white border border-[#EDE8E0] px-5 py-4 flex-1 text-center">
                  <div className="font-['Cormorant_Garamond'] text-[2.2rem] font-light text-[#C8A882] leading-none">
                    {freeWeekends.length}
                  </div>
                  <div className="text-[9px] tracking-[0.15em] uppercase text-[#A08060] mt-1">
                    Szabad hétvége
                  </div>
                  <div className="text-[10px] text-[#C8B8A0] mt-0.5">
                    {monthName}ban
                  </div>
                </div>
                <div className="bg-white border border-[#EDE8E0] px-5 py-4 flex-1 text-center">
                  <div className="font-['Cormorant_Garamond'] text-[2.2rem] font-light text-[#C8A882] leading-none">
                    {busyDates.length}
                  </div>
                  <div className="text-[9px] tracking-[0.15em] uppercase text-[#A08060] mt-1">
                    Foglalt nap
                  </div>
                  <div className="text-[10px] text-[#C8B8A0] mt-0.5">
                    Összesen
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* Jelmagyarázat */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[11px] text-[#7A6A58]">
                  <div className="w-4 h-4 bg-white border border-[#EDE8E0]" />
                  Szabad
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#7A6A58]">
                  <div className="w-4 h-4 bg-[#C8A882]/20 border border-[#C8A882]/30 relative">
                    <div className="absolute inset-0 flex items-end justify-center pb-0.5">
                      <div className="w-1 h-1 rounded-full bg-[#C8A882]" />
                    </div>
                  </div>
                  Foglalt
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#7A6A58]">
                  <div className="w-4 h-4 bg-[#1A1510]" />
                  Ma
                </div>
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-4 bg-[#1A1510] text-white text-[11px] tracking-[0.14em] uppercase px-7 py-3.5 hover:bg-[#C8A882] transition-all w-fit"
              >
                Időpont foglalás →
              </Link>
            </div>
          </div>

          {/* Naptár */}
          <div className="bg-white border border-[#EDE8E0] p-6">
            {/* Navigáció */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => setViewMonth(v => {
                  const n = new Date(v);
                  n.setMonth(n.getMonth() - 1);
                  return n;
                })}
                className="w-8 h-8 flex items-center justify-center border border-[#EDE8E0] text-[#A08060] hover:border-[#C8A882]/50 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div className="text-center">
                <div className="text-[13px] font-medium text-[#1A1510]">
                  {viewMonth.toLocaleDateString("hu-HU", { month: "long" })}
                </div>
                <div className="text-[10px] text-[#A08060]">{y}</div>
              </div>
              <button
                onClick={() => setViewMonth(v => {
                  const n = new Date(v);
                  n.setMonth(n.getMonth() + 1);
                  return n;
                })}
                className="w-8 h-8 flex items-center justify-center border border-[#EDE8E0] text-[#A08060] hover:border-[#C8A882]/50 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>

            {/* Napok fejléc */}
            <div className="grid grid-cols-7 mb-2">
              {["H", "K", "Sz", "Cs", "P", "Szo", "V"].map(d => (
                <div key={d} className="text-center text-[9px] tracking-[0.08em] uppercase text-[#C8B8A0] py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Naptár cellák */}
            {loading ? (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-9 bg-[#FAF8F4] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-0.5">
                {cells.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const ymd    = toYMD(day);
                  const isPast = day < today;
                  const isBusy = busyDates.includes(ymd);
                  const isToday = toYMD(day) === toYMD(today);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                  return (
                    <div
                      key={i}
                      title={isBusy ? "Foglalt nap" : isWeekend && !isPast ? "Szabad hétvége" : undefined}
                      className={`
                        relative h-9 flex items-center justify-center text-[11px] transition-all
                        ${isToday ? "bg-[#1A1510] text-white font-medium" : ""}
                        ${!isToday && isBusy ? "bg-[#C8A882]/15 text-[#C8A882]/60" : ""}
                        ${!isToday && !isBusy && isPast ? "text-[#D4C4B0]" : ""}
                        ${!isToday && !isBusy && !isPast && isWeekend ? "text-[#1A1510] font-medium bg-[#FAF8F4]" : ""}
                        ${!isToday && !isBusy && !isPast && !isWeekend ? "text-[#7A6A58]" : ""}
                      `}
                    >
                      {day.getDate()}
                      {/* Foglalt jelző pont */}
                      {isBusy && !isPast && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C8A882]" />
                      )}
                      {/* Szabad hétvége jelző */}
                      {!isBusy && !isPast && isWeekend && !isToday && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#16A34A]/40" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hónap összefoglaló */}
            {!loading && (
              <div className={`mt-5 pt-4 border-t border-[#EDE8E0] text-center`}>
                {freeWeekends.length === 0 ? (
                  <p className="text-[11px] text-[#C8A882]">
                    Ebben a hónapban már nincs szabad hétvége
                  </p>
                ) : (
                  <p className="text-[11px] text-[#7A6A58]">
                    Még <strong className="text-[#1A1510]">{freeWeekends.length}</strong> szabad hétvége van ebben a hónapban
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
