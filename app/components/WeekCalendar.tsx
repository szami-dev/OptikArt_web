"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// ── Típusok ───────────────────────────────────────────────────
export type CalEvent = {
  id: number;
  title: string | null;
  startTime: string | null;
  endTime: string | null;
  wholeDay: boolean;
  project: {
    id: number;
    name: string | null;
    users: { id: number; name: string | null }[];
  } | null;
};

type Props = {
  mode: "admin" | "user";
  // Ha user mode: saját projekt ID-k amihez foglalhat
  userProjectIds?: { id: number; name: string }[];
  onBookingSuccess?: () => void;
};

// ── Konstansok ────────────────────────────────────────────────
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 – 20:00
const DAYS_HU = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
const SLOT_DURATION = 60; // perc

// ── Segédfüggvények ───────────────────────────────────────────
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
}

function formatHour(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

// Esemény top % és height % a naptárban
function eventPosition(ev: CalEvent, dayStart: Date): { top: number; height: number } | null {
  if (!ev.startTime) return null;
  const start = new Date(ev.startTime);
  const end = ev.endTime ? new Date(ev.endTime) : new Date(start.getTime() + 60 * 60 * 1000);

  const gridStart = 8 * 60; // percben
  const gridEnd = 20 * 60;
  const gridTotal = gridEnd - gridStart;

  const evStart = start.getHours() * 60 + start.getMinutes();
  const evEnd = end.getHours() * 60 + end.getMinutes();

  if (evEnd <= gridStart || evStart >= gridEnd) return null;

  const clampedStart = Math.max(evStart, gridStart);
  const clampedEnd = Math.min(evEnd, gridEnd);

  return {
    top: ((clampedStart - gridStart) / gridTotal) * 100,
    height: ((clampedEnd - clampedStart) / gridTotal) * 100,
  };
}

// ── Foglalás Modal ────────────────────────────────────────────
function BookingModal({
  slot,
  projects,
  onConfirm,
  onClose,
}: {
  slot: { date: Date; hour: number };
  projects: { id: number; name: string }[];
  onConfirm: (data: { title: string; startTime: string; endTime: string; projectId: number | null }) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("Fotózás / Videózás");
  const [duration, setDuration] = useState(2);
  const [projectId, setProjectId] = useState<number | null>(projects[0]?.id ?? null);
  const [saving, setSaving] = useState(false);

  const startTime = new Date(slot.date);
  startTime.setHours(slot.hour, 0, 0, 0);
  const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

  async function handleConfirm() {
    setSaving(true);
    await onConfirm({
      title,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      projectId,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative z-10 w-full sm:max-w-md mx-0 sm:mx-4 bg-white border border-[#EDE8E0] shadow-2xl sm:rounded-none rounded-t-xl" onClick={e => e.stopPropagation()}>

        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#EDE8E0]" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE8E0]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-4 h-px bg-[#C8A882]" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]">Időpont foglalása</span>
            </div>
            <h3 className="font-['Cormorant_Garamond'] text-[1.3rem] font-light text-[#1A1510]">
              {startTime.toLocaleDateString("hu-HU", { month: "long", day: "numeric" })} · {formatHour(slot.hour)}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 border border-[#EDE8E0] flex items-center justify-center text-[#A08060] hover:text-[#1A1510] transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          {/* Projekt választás */}
          {projects.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.14em] uppercase text-[#A08060]">Projekt</label>
              <select
                value={projectId ?? ""}
                onChange={e => setProjectId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full bg-white border border-[#EDE8E0] text-[13px] text-[#1A1510] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/50 transition-colors"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Cím */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-[0.14em] uppercase text-[#A08060]">Megnevezés</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white border border-[#EDE8E0] text-[13px] text-[#1A1510] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/50 transition-colors"
            />
          </div>

          {/* Időtartam */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-[0.14em] uppercase text-[#A08060]">Időtartam</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 6, 8].map(h => (
                <button
                  key={h}
                  onClick={() => setDuration(h)}
                  className={`flex-1 py-2 text-[11px] border transition-all ${duration === h ? "bg-[#1A1510] border-[#1A1510] text-white" : "border-[#EDE8E0] text-[#7A6A58] hover:border-[#C8A882]/40"}`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Összefoglaló */}
          <div className="bg-[#FAF8F4] border border-[#EDE8E0] px-4 py-3 flex items-center justify-between">
            <span className="text-[11px] text-[#A08060]">Időpont</span>
            <span className="text-[13px] text-[#1A1510] font-medium">
              {formatHour(slot.hour)} – {formatHour(slot.hour + duration > 20 ? 20 : slot.hour + duration)}
            </span>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[#EDE8E0] text-[11px] tracking-[0.12em] uppercase text-[#A08060] hover:text-[#1A1510] hover:border-[#C8A882]/40 transition-all">
              Mégsem
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="flex-1 py-2.5 bg-[#1A1510] text-[11px] tracking-[0.12em] uppercase text-white hover:bg-[#C8A882] transition-all disabled:opacity-50"
            >
              {saving ? "Foglalás..." : "Foglalás megerősítése →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Event tooltip ─────────────────────────────────────────────
function EventTooltip({ ev, onClose, onDelete, isAdmin }: {
  ev: CalEvent;
  onClose: () => void;
  onDelete?: (id: number) => void;
  isAdmin: boolean;
}) {
  const start = ev.startTime ? new Date(ev.startTime) : null;
  const end = ev.endTime ? new Date(ev.endTime) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 bg-white border border-[#EDE8E0] shadow-xl p-5 w-72" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="text-[9px] tracking-[0.16em] uppercase text-[#C8A882] mb-1">
              {ev.project?.name ?? "Projekt nélkül"}
            </div>
            <div className="text-[14px] font-medium text-[#1A1510] truncate">{ev.title ?? "Esemény"}</div>
          </div>
          <button onClick={onClose} className="text-[#A08060] hover:text-[#1A1510] shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 text-[12px] text-[#7A6A58]">
          {start && (
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 shrink-0 text-[#C8A882]"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {start.toLocaleDateString("hu-HU", { month: "long", day: "numeric" })} · {
                start.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })
              }
              {end && ` – ${end.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}`}
            </div>
          )}
          {ev.project?.users[0] && (
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 shrink-0 text-[#C8A882]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {ev.project.users[0].name}
            </div>
          )}
        </div>

        {isAdmin && onDelete && (
          <button
            onClick={() => { onDelete(ev.id); onClose(); }}
            className="mt-4 w-full py-2 border border-red-200 text-[11px] tracking-[0.1em] uppercase text-red-400 hover:bg-red-50 transition-all"
          >
            Esemény törlése
          </button>
        )}
      </div>
    </div>
  );
}

// ── Fő naptár komponens ───────────────────────────────────────
export default function WeekCalendar({ mode, userProjectIds = [], onBookingSuccess }: Props) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"week" | "month">("week");
  const [bookingSlot, setBookingSlot] = useState<{ date: Date; hour: number } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Scroll 8:00-ra induláskor
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  // Nap eseményei
  function dayEvents(day: Date): CalEvent[] {
    return events.filter(ev => {
      if (!ev.startTime) return false;
      return isSameDay(new Date(ev.startTime), day);
    });
  }

  // Slot foglalt-e
  function isSlotBusy(day: Date, hour: number): boolean {
    return events.some(ev => {
      if (!ev.startTime) return false;
      const start = new Date(ev.startTime);
      const end = ev.endTime ? new Date(ev.endTime) : new Date(start.getTime() + 60 * 60 * 1000);
      const slotStart = new Date(day);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(day);
      slotEnd.setHours(hour + 1, 0, 0, 0);
      return isSameDay(start, day) && start < slotEnd && end > slotStart;
    });
  }

  // Foglalás küldése
  async function handleBook(data: {
    title: string; startTime: string; endTime: string; projectId: number | null;
  }) {
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setBookingSlot(null);
      setToast("Időpont sikeresen foglalva!");
      await fetchEvents();
      onBookingSuccess?.();
    } catch {
      setToast("Hiba a foglalás során");
    }
  }

  // Esemény törlése
  async function handleDelete(id: number) {
    try {
      await fetch(`/api/calendar/${id}`, { method: "DELETE" });
      setEvents(prev => prev.filter(e => e.id !== id));
      setToast("Esemény törölve");
    } catch {
      setToast("Hiba a törlés során");
    }
  }

  const isUser = mode === "user";
  const isAdmin = mode === "admin";

  // ── Naptár grid magassága: 12 óra × 64px ─────────────────
  const HOUR_HEIGHT = 64;
  const GRID_HEIGHT = HOURS.length * HOUR_HEIGHT;

  return (
    <div className={`flex flex-col gap-4 ${isUser ? "" : ""}`}>

      {/* ── Fejléc ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-px bg-[#C8A882]" />
            <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]">
              {isAdmin ? "Admin naptár" : "Naptár"}
            </span>
          </div>
          <h2 className="font-['Cormorant_Garamond'] text-[1.6rem] sm:text-[2rem] font-light text-[#1A1510] leading-tight">
            {weekStart.toLocaleDateString("hu-HU", { year: "numeric", month: "long" })}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Hét navigáció */}
          <button onClick={() => setWeekStart(d => addDays(d, -7))}
            className="w-9 h-9 border border-[#EDE8E0] flex items-center justify-center text-[#A08060] hover:text-[#1A1510] hover:border-[#C8A882]/40 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={() => setWeekStart(getWeekStart(new Date()))}
            className="px-3 h-9 border border-[#EDE8E0] text-[11px] tracking-[0.08em] uppercase text-[#A08060] hover:text-[#1A1510] hover:border-[#C8A882]/40 transition-all">
            Ma
          </button>
          <button onClick={() => setWeekStart(d => addDays(d, 7))}
            className="w-9 h-9 border border-[#EDE8E0] flex items-center justify-center text-[#A08060] hover:text-[#1A1510] hover:border-[#C8A882]/40 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      {/* ── Jelmagyarázat + hét szám ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#EDE8E0]" />
            <span className="text-[#A08060]">Szabad</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#C8A882]/30" />
            <span className="text-[#A08060]">Foglalt</span>
          </div>
          {isUser && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#1A1510]/10 border border-dashed border-[#C8A882]/50" />
              <span className="text-[#A08060]">Kattints a foglaláshoz</span>
            </div>
          )}
        </div>
        <span className="text-[11px] text-[#A08060]">
          {weekStart.toLocaleDateString("hu-HU", { month: "short", day: "numeric" })} – {addDays(weekStart, 6).toLocaleDateString("hu-HU", { month: "short", day: "numeric" })}
        </span>
      </div>

      {/* ── Naptár grid ── */}
      <div className="bg-white border border-[#EDE8E0] overflow-hidden">

        {/* Fejléc – napok */}
        <div className="grid border-b border-[#EDE8E0] bg-[#FAF8F4]" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
          <div className="border-r border-[#EDE8E0]" />
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today);
            return (
              <div key={i} className={`px-2 py-2.5 text-center border-r border-[#EDE8E0] last:border-r-0 ${isToday ? "bg-[#C8A882]/10" : ""}`}>
                <div className="text-[9px] tracking-[0.12em] uppercase text-[#A08060]">
                  {DAYS_HU[i].slice(0, 3)}
                </div>
                <div className={`font-['Cormorant_Garamond'] text-[1.1rem] font-light leading-tight ${isToday ? "text-[#C8A882]" : "text-[#1A1510]"}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollozható grid */}
        <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: "520px" }}>
          <div className="relative" style={{ height: `${GRID_HEIGHT}px` }}>

            {/* Óra vonalak + idő feliratok */}
            {HOURS.map((h, hi) => (
              <div key={h} className="absolute left-0 right-0 border-t border-[#EDE8E0]/60"
                style={{ top: `${hi * HOUR_HEIGHT}px` }}>
                <span className="absolute left-0 top-0 w-14 flex items-start justify-end pr-2 pt-0.5">
                  <span className="text-[9px] text-[#C8B8A0] tabular-nums">{formatHour(h)}</span>
                </span>
              </div>
            ))}
            {/* Záró vonal */}
            <div className="absolute left-0 right-0 border-t border-[#EDE8E0]/60" style={{ top: `${GRID_HEIGHT}px` }} />

            {/* Nap oszlopok */}
            <div className="absolute left-14 right-0 top-0 bottom-0 grid" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
              {weekDays.map((day, di) => {
                const isToday = isSameDay(day, today);
                const evs = dayEvents(day);

                return (
                  <div key={di} className={`relative border-r border-[#EDE8E0]/60 last:border-r-0 ${isToday ? "bg-[#C8A882]/[0.03]" : ""}`}>

                    {/* Szabad/foglalt slot cellák – kattinthatók usernek */}
                    {HOURS.map((h, hi) => {
                      const busy = isSlotBusy(day, h);
                      const isPast = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h + 1) < today;
                      const canBook = isUser && !busy && !isPast && userProjectIds.length > 0;

                      return (
                        <div
                          key={h}
                          onClick={() => canBook && setBookingSlot({ date: day, hour: h })}
                          className={`absolute left-0 right-0 transition-colors ${
                            canBook ? "cursor-pointer hover:bg-[#C8A882]/10" : ""
                          } ${isPast && !busy ? "bg-[#FAF8F4]/50" : ""}`}
                          style={{ top: `${hi * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                        />
                      );
                    })}

                    {/* Események */}
                    {evs.map(ev => {
                      const pos = eventPosition(ev, day);
                      if (!pos) return null;
                      return (
                        <div
                          key={ev.id}
                          onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }}
                          className="absolute left-0.5 right-0.5 cursor-pointer group overflow-hidden"
                          style={{
                            top: `${(pos.top / 100) * GRID_HEIGHT}px`,
                            height: `${Math.max((pos.height / 100) * GRID_HEIGHT - 2, 20)}px`,
                            zIndex: 10,
                          }}
                        >
                          <div className="w-full h-full bg-[#C8A882]/25 border-l-2 border-[#C8A882] px-1.5 py-1 group-hover:bg-[#C8A882]/35 transition-colors">
                            <div className="text-[9px] font-medium text-[#7A6A58] truncate leading-tight">
                              {ev.title ?? "Esemény"}
                            </div>
                            {ev.startTime && (
                              <div className="text-[8px] text-[#A08060] tabular-nums">
                                {new Date(ev.startTime).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}
                                {ev.endTime && ` – ${new Date(ev.endTime).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}`}
                              </div>
                            )}
                            {isAdmin && ev.project?.users[0]?.name && (
                              <div className="text-[8px] text-[#A08060] truncate">{ev.project.users[0].name}</div>
                            )}
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

      {/* ── Közelgő események lista (mobilon főleg) ── */}
      {events.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#A08060]">Ezen a héten</span>
            <div className="flex-1 h-px bg-[#EDE8E0]" />
          </div>
          <div className="flex flex-col gap-1.5">
            {events.slice(0, 5).map(ev => {
              const start = ev.startTime ? new Date(ev.startTime) : null;
              return (
                <div key={ev.id}
                  className="flex items-center gap-3 bg-white border border-[#EDE8E0] px-4 py-3 hover:border-[#C8A882]/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedEvent(ev)}>
                  <div className="w-1 self-stretch bg-[#C8A882] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[#1A1510] truncate">{ev.title ?? "Esemény"}</div>
                    <div className="text-[10px] text-[#A08060]">
                      {ev.project?.name ?? "Projekt nélkül"}
                      {isAdmin && ev.project?.users[0] && ` · ${ev.project.users[0].name}`}
                    </div>
                  </div>
                  {start && (
                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-[#1A1510]">{start.toLocaleDateString("hu-HU", { month: "short", day: "numeric" })}</div>
                      <div className="text-[10px] text-[#A08060] tabular-nums">
                        {start.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {events.length > 5 && (
              <div className="text-center text-[11px] text-[#A08060] py-2">+ {events.length - 5} további esemény</div>
            )}
          </div>
        </div>
      )}

      {/* ── Loading overlay ── */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center pointer-events-none">
          <div className="w-4 h-4 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
        </div>
      )}

      {/* ── Foglalás modal ── */}
      {bookingSlot && (
        <BookingModal
          slot={bookingSlot}
          projects={userProjectIds}
          onConfirm={handleBook}
          onClose={() => setBookingSlot(null)}
        />
      )}

      {/* ── Esemény részletek ── */}
      {selectedEvent && (
        <EventTooltip
          ev={selectedEvent}
          isAdmin={isAdmin}
          onDelete={isAdmin ? handleDelete : undefined}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-[200] flex items-center gap-3 px-4 py-3 border text-[13px] bg-white shadow-lg ${toast.includes("Hiba") ? "border-red-200 text-red-500" : "border-[#EDE8E0] text-[#1A1510]"}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${toast.includes("Hiba") ? "bg-red-400" : "bg-[#C8A882]"}`} />
          {toast}
        </div>
      )}
    </div>
  );
}
