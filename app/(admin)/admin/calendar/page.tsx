"use client";

// app/(admin)/admin/calendar/page.tsx
// Teljesen önálló naptár – nem függ a WeekCalendar komponenstől
// Három nézet: Hónap / Hét / Nap
// Projekt típusonként különböző szín
// Oldalsáv: közelgő események + gyors létrehozás

import { useState, useEffect, useCallback, useRef } from "react";

// ── Típusok ───────────────────────────────────────────────────
type CalEvent = {
  id: number;
  title: string | null;
  startTime: string | null;
  endTime: string | null;
  wholeDay: boolean;
  project?: {
    id: number;
    name: string | null;
    type?: { id: number; name: string | null } | null;
  } | null;
};

type Project = { id: number; name: string | null; typeId?: number | null };
type View = "month" | "week" | "day";

// ── Típus → szín mapping ─────────────────────────────────────
const TYPE_COLORS: Record<
  number,
  { bg: string; border: string; text: string; dot: string }
> = {
  1: {
    bg: "rgba(200,168,130,0.15)",
    border: "#C8A882",
    text: "#C8A882",
    dot: "#C8A882",
  }, // Esküvő  – arany
  2: {
    bg: "rgba(96,165,250,0.12)",
    border: "#60A5FA",
    text: "#93C5FD",
    dot: "#60A5FA",
  }, // Portré  – kék
  3: {
    bg: "rgba(52,211,153,0.12)",
    border: "#34D399",
    text: "#6EE7B7",
    dot: "#34D399",
  }, // Rendez. – zöld
  4: {
    bg: "rgba(251,146,60,0.12)",
    border: "#FB923C",
    text: "#FCA467",
    dot: "#FB923C",
  }, // Market. – narancs
  5: {
    bg: "rgba(167,139,250,0.12)",
    border: "#A78BFA",
    text: "#C4B5FD",
    dot: "#A78BFA",
  }, // Drón    – lila
  6: {
    bg: "rgba(156,163,175,0.12)",
    border: "#6B7280",
    text: "#9CA3AF",
    dot: "#6B7280",
  }, // Egyéb   – szürke
  0: {
    bg: "rgba(200,168,130,0.08)",
    border: "#5A5248",
    text: "#7A6A58",
    dot: "#5A5248",
  }, // ismeretlen
};
function typeColor(typeId?: number | null) {
  return TYPE_COLORS[typeId ?? 0] ?? TYPE_COLORS[0];
}

function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const TYPE_NAMES: Record<number, string> = {
  1: "Esküvő",
  2: "Portré",
  3: "Rendezvény",
  4: "Marketing",
  5: "Drón",
  6: "Egyéb",
};

// ── Segédfüggvények ───────────────────────────────────────────
const HU_DAYS_SHORT = ["H", "K", "Sz", "Cs", "P", "Szo", "V"];
const HU_DAYS_LONG = [
  "Hétfő",
  "Kedd",
  "Szerda",
  "Csütörtök",
  "Péntek",
  "Szombat",
  "Vasárnap",
];
const HU_MONTHS = [
  "Január",
  "Február",
  "Március",
  "Április",
  "Május",
  "Június",
  "Július",
  "Augusztus",
  "Szeptember",
  "Október",
  "November",
  "December",
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Hétfőtől
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function formatTime(date: Date) {
  return date.toLocaleTimeString("hu-HU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function eventStartDate(ev: CalEvent) {
  return ev.startTime ? new Date(ev.startTime) : null;
}

// ── Toast ────────────────────────────────────────────────────
function Toast({
  msg,
  type,
  onClose,
}: {
  msg: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-5 right-5 z-[300] flex items-center gap-3 px-4 py-3 border text-[13px] animate-[fadeSlideUp_0.3s_ease] ${type === "success" ? "bg-[#0E0C0A] border-[#C8A882]/30 text-[#D4C4B0]" : "bg-[#0E0C0A] border-red-500/30 text-red-400"}`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${type === "success" ? "bg-[#C8A882]" : "bg-red-400"}`}
      />
      {msg}
      <button onClick={onClose} className="ml-1 opacity-40 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}

// ── Esemény badge ─────────────────────────────────────────────
function EventBadge({
  ev,
  onClick,
  compact = false,
}: {
  ev: CalEvent;
  onClick: () => void;
  compact?: boolean;
}) {
  const typeId = ev.project?.type?.id;
  const c = typeColor(typeId);
  const start = eventStartDate(ev);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="w-full text-left group transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
      style={{
        background: c.bg,
        borderLeft: `2px solid ${c.border}`,
        padding: compact ? "2px 5px" : "3px 6px",
        marginBottom: "2px",
      }}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {!compact && start && !ev.wholeDay && (
          <span
            className="text-[9px] shrink-0 font-mono"
            style={{ color: c.text }}
          >
            {formatTime(start)}
          </span>
        )}
        <span
          className={`truncate font-['Jost'] ${compact ? "text-[9px]" : "text-[10px]"}`}
          style={{ color: c.text }}
        >
          {ev.title ?? ev.project?.name ?? "Esemény"}
        </span>
      </div>
    </button>
  );
}

// ── Esemény részlet modal ─────────────────────────────────────
function EventDetailModal({
  ev,
  onClose,
  onDelete,
}: {
  ev: CalEvent;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  const [delConfirm, setDelConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const typeId = ev.project?.type?.id;
  const c = typeColor(typeId);
  const start = eventStartDate(ev);
  const end = ev.endTime ? new Date(ev.endTime) : null;

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/calendar/${ev.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDelete(ev.id);
      onClose();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm mx-4 bg-[#0E0C0A] border border-white/[0.08] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Felső akcentvonal */}
        <div
          className="h-0.5 w-full"
          style={{
            background: `linear-gradient(to right, ${c.border}, transparent)`,
          }}
        />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: c.dot }}
                />
                {ev.project?.type?.name && (
                  <span
                    className="text-[9px] tracking-[0.15em] uppercase"
                    style={{ color: c.text }}
                  >
                    {ev.project.type.name}
                  </span>
                )}
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-[1.3rem] font-light text-white leading-tight">
                {ev.title ?? "Névtelen esemény"}
              </h3>
              {ev.project?.name && (
                <p className="text-[11px] text-[#5A5248] mt-0.5">
                  {ev.project.name}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 border border-white/[0.08] flex items-center justify-center text-[#5A5248] hover:text-white transition-all shrink-0"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-3.5 h-3.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {ev.wholeDay ? (
              <div className="flex items-center gap-2.5 text-[12px] text-[#5A5248]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3.5 h-3.5 shrink-0"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {start
                  ? `${start.toLocaleDateString("hu-HU")} – Egész napos`
                  : "Egész napos"}
              </div>
            ) : start ? (
              <div className="flex items-center gap-2.5 text-[12px] text-[#5A5248]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3.5 h-3.5 shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {start.toLocaleDateString("hu-HU")} · {formatTime(start)}
                {end && ` – ${formatTime(end)}`}
              </div>
            ) : null}
          </div>

          <div className="flex gap-2 pt-3 border-t border-white/[0.05]">
            {!delConfirm ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 border border-white/[0.08] text-[11px] tracking-[0.08em] uppercase text-[#5A5248] hover:text-[#D4C4B0] transition-all"
                >
                  Bezárás
                </button>
                <button
                  onClick={() => setDelConfirm(true)}
                  className="px-4 py-2 border border-red-500/20 text-[11px] tracking-[0.08em] uppercase text-red-400/50 hover:text-red-400 hover:border-red-500/40 transition-all"
                >
                  Törlés
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setDelConfirm(false)}
                  className="flex-1 py-2 border border-white/[0.08] text-[11px] text-[#5A5248] hover:text-[#D4C4B0] transition-all"
                >
                  Mégsem
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2 bg-red-500/70 text-[11px] tracking-[0.08em] uppercase text-white hover:bg-red-500 transition-all disabled:opacity-50"
                >
                  {deleting ? "..." : "Törlés megerősítése"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Új esemény modal ─────────────────────────────────────────
function CreateEventModal({
  projects,
  defaultDate,
  onClose,
  onCreated,
}: {
  projects: Project[];
  defaultDate: Date | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(
    defaultDate ? toLocalDateString(defaultDate) : "",
  );
  const [startHour, setStartHour] = useState("10");
  const [endHour, setEndHour] = useState("12");
  const [projectId, setProjectId] = useState<number | null>(
    projects[0]?.id ?? null,
  );
  const [wholeDay, setWholeDay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!date) {
      setError("Dátum kötelező");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const startTime = wholeDay
        ? new Date(`${date}T00:00:00`).toISOString()
        : new Date(`${date}T${startHour.padStart(2, "0")}:00:00`).toISOString();
      const endTime = wholeDay
        ? new Date(`${date}T23:59:59`).toISOString()
        : new Date(`${date}T${endHour.padStart(2, "0")}:00:00`).toISOString();

      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Esemény",
          startTime,
          endTime,
          wholeDay,
          projectId,
        }),
      });
      if (!res.ok) throw new Error();
      onCreated();
    } catch {
      setError("Hiba az esemény létrehozásakor");
    } finally {
      setSaving(false);
    }
  }

  const hours = Array.from({ length: 15 }, (_, i) =>
    String(i + 7).padStart(2, "0"),
  );

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md mx-4 bg-[#0E0C0A] border border-white/[0.08] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-3 h-px bg-[#C8A882]/50" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/50">
                Naptár
              </span>
            </div>
            <h3 className="font-['Cormorant_Garamond'] text-[1.3rem] font-light text-white">
              Új esemény
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 border border-white/[0.08] flex items-center justify-center text-[#5A5248] hover:text-white transition-all"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-4 h-4"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          {/* Megnevezés */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-[0.14em] uppercase text-[#5A5248]">
              Megnevezés
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Fotózás, Egyeztetés..."
              className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

          {/* Projekt */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-[0.14em] uppercase text-[#5A5248]">
              Projekt
            </label>
            <select
              value={projectId ?? ""}
              onChange={(e) =>
                setProjectId(e.target.value ? parseInt(e.target.value) : null)
              }
              className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40"
            >
              <option value="" style={{ background: "#141210" }}>
                Nincs projekt
              </option>
              {projects.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  style={{ background: "#141210" }}
                >
                  {p.name ?? `#${p.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Dátum */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-[0.14em] uppercase text-[#5A5248]">
              Dátum
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 transition-colors"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Egész napos toggle */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setWholeDay((v) => !v)}
              className={`w-9 h-5 rounded-full transition-colors relative ${wholeDay ? "bg-[#C8A882]" : "bg-white/[0.08]"}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${wholeDay ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </button>
            <span className="text-[12px] text-[#5A5248]">Egész napos</span>
          </div>

          {/* Idő */}
          {!wholeDay && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.14em] uppercase text-[#5A5248]">
                  Kezdés
                </label>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40"
                >
                  {hours.map((h) => (
                    <option key={h} value={h} style={{ background: "#141210" }}>
                      {h}:00
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.14em] uppercase text-[#5A5248]">
                  Befejezés
                </label>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40"
                >
                  {hours.map((h) => (
                    <option key={h} value={h} style={{ background: "#141210" }}>
                      {h}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {error && <p className="text-[11px] text-red-400/70">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-white/[0.08] text-[11px] tracking-[0.1em] uppercase text-[#5A5248] hover:text-[#D4C4B0] transition-all"
            >
              Mégsem
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 py-2.5 bg-[#C8A882] text-[11px] tracking-[0.12em] uppercase text-[#0C0A08] font-medium hover:bg-[#D4B892] transition-all disabled:opacity-50"
            >
              {saving ? "Létrehozás..." : "Létrehozás"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// FŐ KOMPONENS
// ════════════════════════════════════════════════════════════════
export default function AdminCalendarPage() {
  const [view, setView] = useState<View>("month");
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [createDate, setCreateDate] = useState<Date | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [filterTypeId, setFilterTypeId] = useState<number | null>(null);

  const today = new Date();

  // ── API ────────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/calendar");
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects ?? []));
  }, [fetchEvents]);

  function handleDeleteEvent(id: number) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setToast({ msg: "Esemény törölve", type: "success" });
  }

  // ── Szűrt események ────────────────────────────────────────
  const filteredEvents = filterTypeId
    ? events.filter((e) => e.project?.type?.id === filterTypeId)
    : events;

  // ── Navigáció ──────────────────────────────────────────────
  function navigate(dir: -1 | 1) {
    setCurrent((prev) => {
      const d = new Date(prev);
      if (view === "month") {
        d.setDate(1);
        d.setMonth(d.getMonth() + dir);
      } else if (view === "week") {
        d.setDate(d.getDate() + dir * 7);
      } else {
        d.setDate(d.getDate() + dir);
      }
      return d;
    });
  }

  function goToday() {
    setCurrent(new Date());
  }

  // ── Hónap nézet adatok ─────────────────────────────────────
  function getMonthDays() {
    const year = current.getFullYear();
    const month = current.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startDow = (first.getDay() + 6) % 7; // H=0
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let i = 1; i <= last.getDate(); i++)
      days.push(new Date(year, month, i));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  // ── Hét nézet adatok ───────────────────────────────────────
  function getWeekDays() {
    const sw = startOfWeek(current);
    return Array.from({ length: 7 }, (_, i) => addDays(sw, i));
  }

  // ── Nap nézet órák ─────────────────────────────────────────
  const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7-21

  // ── Közelgő események (oldalsáv) ────────────────────────────
  const upcoming = [...filteredEvents]
    .filter((e) => {
      const d = eventStartDate(e);
      return d && d >= today;
    })
    .sort(
      (a, b) =>
        (eventStartDate(a)?.getTime() ?? 0) -
        (eventStartDate(b)?.getTime() ?? 0),
    )
    .slice(0, 8);

  // ── Fejléc szöveg ──────────────────────────────────────────
  function headerTitle() {
    if (view === "month")
      return `${HU_MONTHS[current.getMonth()]} ${current.getFullYear()}`;
    if (view === "week") {
      const sw = startOfWeek(current);
      const ew = addDays(sw, 6);
      if (sw.getMonth() === ew.getMonth())
        return `${sw.getDate()}–${ew.getDate()}. ${HU_MONTHS[sw.getMonth()]} ${sw.getFullYear()}`;
      return `${sw.getDate()}. ${HU_MONTHS[sw.getMonth()]} – ${ew.getDate()}. ${HU_MONTHS[ew.getMonth()]}`;
    }
    return `${current.toLocaleDateString("hu-HU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;
  }

  // ── Nap eseményei ──────────────────────────────────────────
  function eventsForDay(day: Date) {
    return filteredEvents.filter((e) => {
      const d = eventStartDate(e);
      return d && isSameDay(d, day);
    });
  }

  // ── Óra eseményei (nap/hét nézet) ─────────────────────────
  function eventsForHour(day: Date, hour: number) {
    return filteredEvents.filter((e) => {
      if (e.wholeDay) return false;
      const d = eventStartDate(e);
      return d && isSameDay(d, day) && d.getHours() === hour;
    });
  }

  const weekDays = getWeekDays();
  const monthDays = getMonthDays();

  return (
    <div className="min-h-screen bg-[#0C0A08] text-[#D4C4B0] flex flex-col">
      {/* ── FEJLÉC ── */}
      <div className="border-b border-white/[0.05] px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-4 h-px bg-[#C8A882]/50" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/50">
                Admin
              </span>
            </div>
            <h1 className="font-['Cormorant_Garamond'] text-[1.6rem] sm:text-[2rem] font-light text-white leading-none">
              Naptár
            </h1>
          </div>

          {/* Navigáció */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 border border-white/[0.08] flex items-center justify-center text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={goToday}
              className="px-3 h-8 border border-white/[0.08] text-[10px] tracking-[0.1em] uppercase text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all whitespace-nowrap"
            >
              Ma
            </button>
            <button
              onClick={() => navigate(1)}
              className="w-8 h-8 border border-white/[0.08] flex items-center justify-center text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Cím */}
          <span className="font-['Cormorant_Garamond'] text-[1.1rem] text-[#D4C4B0] hidden sm:block">
            {headerTitle()}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Típus szűrő */}
          <div className="hidden lg:flex items-center gap-1 border border-white/[0.06] px-1 py-1">
            <button
              onClick={() => setFilterTypeId(null)}
              className={`px-2.5 py-1 text-[9px] tracking-[0.1em] uppercase transition-all ${!filterTypeId ? "bg-white/[0.08] text-[#D4C4B0]" : "text-[#3A3530] hover:text-[#5A5248]"}`}
            >
              Mind
            </button>
            {Object.entries(TYPE_NAMES).map(([id, name]) => {
              const tid = parseInt(id);
              const c = TYPE_COLORS[tid];
              const active = filterTypeId === tid;
              return (
                <button
                  key={id}
                  onClick={() => setFilterTypeId(active ? null : tid)}
                  className="px-2.5 py-1 text-[9px] tracking-[0.1em] uppercase transition-all"
                  style={
                    active
                      ? { background: c.bg, color: c.text }
                      : { color: "#3A3530" }
                  }
                >
                  {name}
                </button>
              );
            })}
          </div>

          {/* Nézet váltó */}
          <div className="flex border border-white/[0.06]">
            {(["month", "week", "day"] as View[]).map((v) => {
              const labels: Record<View, string> = {
                month: "Hónap",
                week: "Hét",
                day: "Nap",
              };
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-2 text-[10px] tracking-[0.1em] uppercase transition-all border-r border-white/[0.04] last:border-r-0 ${view === v ? "bg-[#C8A882]/15 text-[#C8A882]" : "text-[#3A3530] hover:text-[#5A5248]"}`}
                >
                  {labels[v]}
                </button>
              );
            })}
          </div>

          {/* Új esemény */}
          <button
            onClick={() => {
              setCreateDate(null);
              setCreateModal(true);
            }}
            className="flex items-center gap-2 bg-[#C8A882] text-[#0C0A08] text-[11px] tracking-[0.12em] uppercase px-4 py-2 hover:bg-[#D4B892] transition-colors font-medium whitespace-nowrap"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Új esemény
          </button>
        </div>
      </div>

      {/* Mobil cím */}
      <div className="sm:hidden px-4 py-2 text-[13px] text-[#5A5248]">
        {headerTitle()}
      </div>

      {/* ── FŐ TARTALOM ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── NAPTÁR TERÜLET ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          {/* ── HÓNAP NÉZET ── */}
          {view === "month" && (
            <div className="flex-1 flex flex-col">
              {/* Napok fejléce */}
              <div className="grid grid-cols-7 border-b border-white/[0.04] shrink-0">
                {HU_DAYS_SHORT.map((d) => (
                  <div
                    key={d}
                    className="py-2.5 text-center text-[9px] tracking-[0.15em] uppercase text-[#3A3530] border-r border-white/[0.03] last:border-r-0"
                  >
                    {d}
                  </div>
                ))}
              </div>
              {/* Napok */}
              <div
                className="grid grid-cols-7 flex-1"
                style={{
                  gridTemplateRows: `repeat(${monthDays.length / 7},1fr)`,
                }}
              >
                {monthDays.map((day, i) => {
                  if (!day)
                    return (
                      <div
                        key={`e${i}`}
                        className="border-r border-b border-white/[0.03] last:border-r-0 bg-[#0A0807]"
                      />
                    );
                  const isToday = isSameDay(day, today);
                  const isCurrentMonth = day.getMonth() === current.getMonth();
                  const dayEvents = eventsForDay(day);
                  const hasMore = dayEvents.length > 3;
                  return (
                    <div
                      key={day.toISOString()}
                      className={`border-r border-b border-white/[0.03] last:border-r-0 p-1 sm:p-1.5 cursor-pointer group transition-colors hover:bg-white/[0.02] overflow-hidden min-h-[80px]`}
                      onClick={() => {
                        setCreateDate(day);
                        setCreateModal(true);
                      }}
                    >
                      {/* Dátum szám */}
                      <div
                        className={`w-6 h-6 flex items-center justify-center text-[11px] font-['Cormorant_Garamond'] text-[1rem] leading-none mb-1 transition-all ${
                          isToday
                            ? "bg-[#C8A882] text-[#0C0A08] font-medium"
                            : isCurrentMonth
                              ? "text-[#D4C4B0] group-hover:text-white"
                              : "text-[#2A2520]"
                        }`}
                      >
                        {day.getDate()}
                      </div>
                      {/* Egész napos */}
                      {dayEvents
                        .filter((e) => e.wholeDay)
                        .map((ev) => (
                          <EventBadge
                            key={ev.id}
                            ev={ev}
                            compact
                            onClick={() => {
                              setSelectedEvent(ev);
                            }}
                          />
                        ))}
                      {/* Időpontok */}
                      {dayEvents
                        .filter((e) => !e.wholeDay)
                        .slice(0, hasMore ? 2 : 3)
                        .map((ev) => (
                          <EventBadge
                            key={ev.id}
                            ev={ev}
                            compact
                            onClick={() => {
                              setSelectedEvent(ev);
                            }}
                          />
                        ))}
                      {hasMore && (
                        <div className="text-[8px] text-[#3A3530] px-1">
                          +{dayEvents.length - 2} több
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── HÉT NÉZET ── */}
          {view === "week" && (
            <div className="flex-1 flex flex-col overflow-auto">
              {/* Hét fejléce */}
              <div className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-white/[0.04] shrink-0">
                <div className="border-r border-white/[0.03]" />
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, today);
                  return (
                    <div
                      key={day.toISOString()}
                      className="py-2 px-1 text-center border-r border-white/[0.03] last:border-r-0"
                    >
                      <div className="text-[9px] tracking-[0.1em] uppercase text-[#3A3530] mb-0.5">
                        {HU_DAYS_SHORT[(day.getDay() + 6) % 7]}
                      </div>
                      <div
                        className={`w-7 h-7 mx-auto flex items-center justify-center font-['Cormorant_Garamond'] text-[1.1rem] leading-none transition-all ${isToday ? "bg-[#C8A882] text-[#0C0A08]" : "text-[#D4C4B0]"}`}
                      >
                        {day.getDate()}
                      </div>
                      {/* Egész napos */}
                      {eventsForDay(day)
                        .filter((e) => e.wholeDay)
                        .map((ev) => (
                          <EventBadge
                            key={ev.id}
                            ev={ev}
                            compact
                            onClick={() => setSelectedEvent(ev)}
                          />
                        ))}
                    </div>
                  );
                })}
              </div>
              {/* Órák */}
              <div className="flex-1 overflow-auto">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-white/[0.03]"
                    style={{ minHeight: "52px" }}
                  >
                    <div className="border-r border-white/[0.03] px-2 pt-1">
                      <span className="text-[9px] text-[#3A3530] font-mono">
                        {String(hour).padStart(2, "0")}:00
                      </span>
                    </div>
                    {weekDays.map((day) => {
                      const hourEvents = eventsForHour(day, hour);
                      return (
                        <div
                          key={day.toISOString()}
                          className="border-r border-white/[0.03] last:border-r-0 p-0.5 hover:bg-white/[0.01] cursor-pointer transition-colors"
                          onClick={() => {
                            const d = new Date(day);
                            d.setHours(hour);
                            setCreateDate(d);
                            setCreateModal(true);
                          }}
                        >
                          {hourEvents.map((ev) => (
                            <EventBadge
                              key={ev.id}
                              ev={ev}
                              onClick={() => setSelectedEvent(ev)}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── NAP NÉZET ── */}
          {view === "day" && (
            <div className="flex-1 flex flex-col overflow-auto">
              {/* Nap fejléce */}
              <div className="border-b border-white/[0.04] px-4 py-3 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 flex items-center justify-center font-['Cormorant_Garamond'] text-[1.8rem] font-light leading-none ${isSameDay(current, today) ? "bg-[#C8A882] text-[#0C0A08]" : "text-[#D4C4B0]"}`}
                  >
                    {current.getDate()}
                  </div>
                  <div>
                    <div className="text-[11px] text-[#5A5248]">
                      {HU_DAYS_LONG[(current.getDay() + 6) % 7]}
                    </div>
                    <div className="text-[10px] text-[#3A3530]">
                      {eventsForDay(current).length} esemény
                    </div>
                  </div>
                </div>
                {/* Egész napos */}
                <div className="flex flex-col gap-1">
                  {eventsForDay(current)
                    .filter((e) => e.wholeDay)
                    .map((ev) => (
                      <EventBadge
                        key={ev.id}
                        ev={ev}
                        onClick={() => setSelectedEvent(ev)}
                      />
                    ))}
                </div>
              </div>
              {/* Órák */}
              <div className="flex-1 overflow-auto">
                {HOURS.map((hour) => {
                  const hourEvents = eventsForHour(current, hour);
                  return (
                    <div
                      key={hour}
                      className="flex border-b border-white/[0.03]"
                      style={{ minHeight: "60px" }}
                    >
                      <div className="w-16 shrink-0 border-r border-white/[0.03] px-3 pt-2">
                        <span className="text-[10px] text-[#3A3530] font-mono">
                          {String(hour).padStart(2, "0")}:00
                        </span>
                      </div>
                      <div
                        className="flex-1 p-1 hover:bg-white/[0.01] cursor-pointer transition-colors"
                        onClick={() => {
                          const d = new Date(current);
                          d.setHours(hour);
                          setCreateDate(d);
                          setCreateModal(true);
                        }}
                      >
                        {hourEvents.map((ev) => (
                          <EventBadge
                            key={ev.id}
                            ev={ev}
                            onClick={() => setSelectedEvent(ev)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── OLDALSÁV ── */}
        <div className="hidden xl:flex flex-col w-64 border-l border-white/[0.05] overflow-y-auto shrink-0">
          {/* Mini hónap navigátor */}
          <div className="p-4 border-b border-white/[0.04]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-[#5A5248] font-['Cormorant_Garamond'] text-[1rem]">
                {HU_MONTHS[current.getMonth()].slice(0, 3)}{" "}
                {current.getFullYear()}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => navigate(-1)}
                  className="w-5 h-5 flex items-center justify-center text-[#3A3530] hover:text-[#C8A882] transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-3 h-3"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate(1)}
                  className="w-5 h-5 flex items-center justify-center text-[#3A3530] hover:text-[#C8A882] transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-3 h-3"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Mini naptár */}
            <div className="grid grid-cols-7 gap-0 mb-1">
              {HU_DAYS_SHORT.map((d) => (
                <div
                  key={d}
                  className="text-center text-[7px] text-[#2A2520] py-0.5"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0">
              {getMonthDays().map((day, i) => {
                if (!day) return <div key={`m${i}`} />;
                const isToday = isSameDay(day, today);
                const isCur = isSameDay(day, current);
                const hasEvs = eventsForDay(day).length > 0;
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => {
                      setCurrent(day);
                      if (view === "month") setView("day");
                    }}
                    className={`w-full aspect-square flex items-center justify-center text-[10px] relative transition-all ${
                      isToday
                        ? "bg-[#C8A882] text-[#0C0A08]"
                        : isCur
                          ? "bg-white/[0.08] text-[#C8A882]"
                          : "text-[#3A3530] hover:text-[#5A5248]"
                    }`}
                  >
                    {day.getDate()}
                    {hasEvs && !isToday && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C8A882]/40" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Típus jelmagyarázat */}
          <div className="p-4 border-b border-white/[0.04]">
            <div className="text-[8px] tracking-[0.18em] uppercase text-[#2A2520] mb-2">
              Projekt típusok
            </div>
            <div className="flex flex-col gap-1.5">
              {Object.entries(TYPE_NAMES).map(([id, name]) => {
                const tid = parseInt(id);
                const c = TYPE_COLORS[tid];
                const active = filterTypeId === tid;
                return (
                  <button
                    key={id}
                    onClick={() => setFilterTypeId(active ? null : tid)}
                    className={`flex items-center gap-2 px-2 py-1.5 text-left transition-all ${active ? "bg-white/[0.04]" : ""}`}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: c.dot }}
                    />
                    <span
                      className="text-[10px]"
                      style={{ color: active ? c.text : "#5A5248" }}
                    >
                      {name}
                    </span>
                    {active && (
                      <span className="ml-auto text-[8px] text-[#3A3530]">
                        ✕
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Közelgő események */}
          <div className="p-4 flex-1">
            <div className="text-[8px] tracking-[0.18em] uppercase text-[#2A2520] mb-3">
              Közelgő ({upcoming.length})
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-[11px] text-[#3A3530]">
                <div className="w-3 h-3 border border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
                Betöltés...
              </div>
            ) : upcoming.length === 0 ? (
              <p className="text-[11px] text-[#2A2520]">
                Nincs közelgő esemény
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {upcoming.map((ev) => {
                  const d = eventStartDate(ev);
                  const typeId = ev.project?.type?.id;
                  const c = typeColor(typeId);
                  const daysUntil = d
                    ? Math.ceil((d.getTime() - today.getTime()) / 86400000)
                    : null;
                  const isToday2 = daysUntil === 0;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="w-full text-left p-2.5 border border-white/[0.04] hover:border-white/[0.08] transition-all group"
                      style={{
                        borderLeftWidth: "2px",
                        borderLeftColor: c.border,
                      }}
                    >
                      <div className="text-[11px] text-[#D4C4B0] truncate mb-1 group-hover:text-white transition-colors">
                        {ev.title ?? ev.project?.name ?? "Esemény"}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-[#3A3530]">
                          {d?.toLocaleDateString("hu-HU", {
                            month: "short",
                            day: "numeric",
                          })}
                          {!ev.wholeDay && d && ` · ${formatTime(d)}`}
                        </span>
                        {daysUntil !== null && (
                          <span
                            className={`text-[9px] ${isToday2 ? "text-[#34D399]" : "text-[#3A3530]"}`}
                          >
                            {isToday2 ? "Ma" : `${daysUntil}n`}
                          </span>
                        )}
                      </div>
                      {ev.project?.name && (
                        <div
                          className="text-[9px] mt-0.5 truncate"
                          style={{ color: c.text }}
                        >
                          {ev.project.name}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODALOK ── */}
      {selectedEvent && (
        <EventDetailModal
          ev={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
        />
      )}
      {createModal && (
        <CreateEventModal
          projects={projects}
          defaultDate={createDate}
          onClose={() => setCreateModal(false)}
          onCreated={() => {
            setCreateModal(false);
            fetchEvents();
            setToast({ msg: "Esemény létrehozva", type: "success" });
          }}
        />
      )}
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
