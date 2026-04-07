"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type CalEvent = {
  id: number;
  title: string | null;
  startTime: string | null;
  endTime: string | null;
  wholeDay: boolean;
  project: { id: number; name: string | null } | null;
};

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function isSameDay(a: Date, b: Date): boolean { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const DAYS_HU = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
const HOUR_HEIGHT = 56;

export default function UserCalendarPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const from = weekStart.toISOString();
      const to = addDays(weekStart, 7).toISOString();
      const res = await fetch(`/api/calendar?from=${from}&to=${to}`);
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [weekStart]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  function dayEvents(day: Date) {
    return events.filter(ev => ev.startTime && isSameDay(new Date(ev.startTime), day));
  }

  function eventPosition(ev: CalEvent): { top: number; height: number } | null {
    if (!ev.startTime) return null;
    const start = new Date(ev.startTime);
    const end = ev.endTime ? new Date(ev.endTime) : new Date(start.getTime() + 3600000);
    const gridStart = 8 * 60, gridEnd = 20 * 60, total = gridEnd - gridStart;
    const evStart = start.getHours() * 60 + start.getMinutes();
    const evEnd = end.getHours() * 60 + end.getMinutes();
    if (evEnd <= gridStart || evStart >= gridEnd) return null;
    return {
      top: ((Math.max(evStart, gridStart) - gridStart) / total) * 100,
      height: ((Math.min(evEnd, gridEnd) - Math.max(evStart, gridStart)) / total) * 100,
    };
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">

      {/* Fejléc */}
      <div className="bg-white border-b border-[#EDE8E0] px-5 sm:px-8 lg:px-12 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-px bg-[#C8A882]" />
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">Naptár</span>
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="font-['Cormorant_Garamond'] text-[2rem] sm:text-[2.4rem] font-light text-[#1A1510] leading-tight">
              Szabad időpontok
            </h1>
            <Link href="/contact" className="flex items-center gap-2 bg-[#1A1510] text-white text-[11px] tracking-[0.14em] uppercase px-5 py-2.5 hover:bg-[#C8A882] transition-all whitespace-nowrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Projekt indítása
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-6 flex flex-col gap-5">

        {/* Info */}
        <div className="bg-[#F5EFE6] border border-[#EDE8E0] px-4 py-3 flex items-start gap-2.5 text-[12px] text-[#7A6A58]">
          <span className="shrink-0 mt-0.5">💡</span>
          <span>Az arany jelzéssel ellátott napok már le vannak foglalva. Projekt indításakor a szabad napok közül tudsz preferált időpontot megjelölni.</span>
        </div>

        {/* Naptár navigáció */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-['Cormorant_Garamond'] text-[1.4rem] font-light text-[#1A1510]">
            {weekStart.toLocaleDateString("hu-HU", { year: "numeric", month: "long" })}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekStart(d => addDays(d, -7))} className="w-9 h-9 border border-[#EDE8E0] flex items-center justify-center text-[#A08060] hover:border-[#C8A882]/40 transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={() => setWeekStart(getWeekStart(new Date()))} className="px-3 h-9 border border-[#EDE8E0] text-[11px] uppercase text-[#A08060] hover:border-[#C8A882]/40 transition-all">Ma</button>
            <button onClick={() => setWeekStart(d => addDays(d, 7))} className="w-9 h-9 border border-[#EDE8E0] flex items-center justify-center text-[#A08060] hover:border-[#C8A882]/40 transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        {/* Heti nézet */}
        <div className="bg-white border border-[#EDE8E0] overflow-hidden">
          {/* Fejléc */}
          <div className="grid border-b border-[#EDE8E0] bg-[#FAF8F4]" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
            <div className="border-r border-[#EDE8E0]" />
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, today);
              const dayEvs = dayEvents(day);
              return (
                <div key={i} className={`px-1 py-2.5 text-center border-r border-[#EDE8E0] last:border-r-0 ${isToday ? "bg-[#C8A882]/10" : ""}`}>
                  <div className="text-[9px] tracking-[0.1em] uppercase text-[#A08060]">{DAYS_HU[i].slice(0, 3)}</div>
                  <div className={`font-['Cormorant_Garamond'] text-[1.1rem] font-light leading-tight ${isToday ? "text-[#C8A882]" : "text-[#1A1510]"}`}>{day.getDate()}</div>
                  {dayEvs.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#C8A882] mx-auto mt-0.5" />}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="overflow-y-auto" style={{ maxHeight: "480px" }}>
            <div className="relative" style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}>
              {/* Óra vonalak */}
              {HOURS.map((h, hi) => (
                <div key={h} className="absolute left-0 right-0 border-t border-[#EDE8E0]/50" style={{ top: `${hi * HOUR_HEIGHT}px` }}>
                  <span className="absolute left-0 top-0 w-12 flex items-start justify-end pr-2 pt-0.5 text-[9px] text-[#C8B8A0] tabular-nums">
                    {String(h).padStart(2, "0")}:00
                  </span>
                </div>
              ))}
              <div className="absolute left-0 right-0 border-t border-[#EDE8E0]/50" style={{ top: `${HOURS.length * HOUR_HEIGHT}px` }} />

              {/* Oszlopok */}
              <div className="absolute left-12 right-0 top-0 bottom-0 grid" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                {weekDays.map((day, di) => {
                  const isToday = isSameDay(day, today);
                  const evs = dayEvents(day);
                  return (
                    <div key={di} className={`relative border-r border-[#EDE8E0]/50 last:border-r-0 ${isToday ? "bg-[#C8A882]/[0.025]" : ""}`}>
                      {evs.map(ev => {
                        const pos = eventPosition(ev);
                        if (!pos) return null;
                        return (
                          <div key={ev.id}
                            onClick={() => setSelectedEvent(ev)}
                            className="absolute left-0.5 right-0.5 cursor-pointer overflow-hidden hover:z-10"
                            style={{ top: `${(pos.top / 100) * (HOURS.length * HOUR_HEIGHT)}px`, height: `${Math.max((pos.height / 100) * (HOURS.length * HOUR_HEIGHT) - 2, 18)}px`, zIndex: 5 }}>
                            <div className="w-full h-full bg-[#C8A882]/25 border-l-2 border-[#C8A882] px-1 py-0.5">
                              <div className="text-[9px] font-medium text-[#7A6A58] truncate">{ev.title ?? "Foglalt"}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white border border-[#EDE8E0] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="text-[11px] font-medium text-[#1A1510] mb-1">Időpontot szeretnél?</div>
            <p className="text-[12px] text-[#7A6A58]">Projekt indításakor megjelölhetsz preferált napot — mi a szabad dátumok alapján visszaigazolunk.</p>
          </div>
          <Link href="/contact" className="shrink-0 flex items-center gap-2 bg-[#1A1510] text-white text-[11px] tracking-[0.12em] uppercase px-5 py-2.5 hover:bg-[#C8A882] transition-all whitespace-nowrap">
            Projekt indítása →
          </Link>
        </div>
      </div>

      {/* Esemény részlet modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSelectedEvent(null)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="relative z-10 bg-white border border-[#EDE8E0] shadow-xl p-5 w-72 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-[9px] tracking-[0.14em] uppercase text-[#C8A882] mb-1">Foglalt időpont</div>
                <div className="text-[14px] font-medium text-[#1A1510]">{selectedEvent.title ?? "Foglalt"}</div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-[#A08060] hover:text-[#1A1510]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {selectedEvent.startTime && (
              <div className="text-[12px] text-[#7A6A58] flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-[#C8A882]"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {new Date(selectedEvent.startTime).toLocaleString("hu-HU", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                {selectedEvent.endTime && ` – ${new Date(selectedEvent.endTime).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}