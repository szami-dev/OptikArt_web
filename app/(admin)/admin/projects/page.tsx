"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED";

type Project = {
  id: number;
  name: string | null;
  description: string | null;
  status: ProjectStatus | null;
  createdAt: string;
  eventDate: string | null;
  users: { id: number; name: string | null; email: string }[];
  type: { id: number; name: string | null } | null;
  category: { id: number; name: string | null } | null;
  _count: { messages: number; galleries: number; calendarEvents: number };
  calendarEvents: { id: number; startTime: string | null }[];
};

type Package = {
  id: number;
  name: string | null;
  price: number | null;
  categoryId: number | null;
};
type User = { id: number; name: string | null; email: string };

const STATUS_META: Record<
  ProjectStatus,
  { label: string; color: string; bg: string }
> = {
  PLANNING: {
    label: "Tervezés",
    color: "#C8A882",
    bg: "rgba(200,168,130,0.1)",
  },
  IN_PROGRESS: {
    label: "Folyamatban",
    color: "#60A5FA",
    bg: "rgba(96,165,250,0.1)",
  },
  COMPLETED: { label: "Kész", color: "#34D399", bg: "rgba(52,211,153,0.1)" },
  ON_HOLD: {
    label: "Felfüggesztve",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.1)",
  },
  CANCELLED: {
    label: "Törölve",
    color: "#F87171",
    bg: "rgba(248,113,113,0.1)",
  },
};
const PROJECT_TYPES = [
  { id: 1, name: "Esküvő" },
  { id: 2, name: "Portré" },
  { id: 3, name: "Rendezvény" },
  { id: 4, name: "Marketing" },
  { id: 5, name: "Drón" },
  { id: 6, name: "Egyéb" },
];
const TYPES_WITH_PACKAGES = [1, 2];
const STATUSES = Object.keys(STATUS_META) as ProjectStatus[];
const HU_MONTHS_SH = [
  "jan",
  "feb",
  "már",
  "ápr",
  "máj",
  "jún",
  "júl",
  "aug",
  "szep",
  "okt",
  "nov",
  "dec",
];

// ── Segédfüggvények ───────────────────────────────────────────
function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── StatusBadge ───────────────────────────────────────────────
function StatusBadge({ status }: { status: ProjectStatus | null }) {
  if (!status) return <span className="text-[#3A3530] text-[10px]">—</span>;
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.1em] uppercase px-2 py-1 border"
      style={{ color: m.color, background: m.bg, borderColor: `${m.color}30` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: m.color }}
      />
      {m.label}
    </span>
  );
}

// ── Toast ─────────────────────────────────────────────────────
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
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-4 right-4 z-[200] flex items-center gap-3 px-4 py-3 border text-[13px] ${type === "success" ? "bg-[#0E0C0A] border-[#C8A882]/30 text-[#D4C4B0]" : "bg-[#0E0C0A] border-red-500/30 text-red-400"}`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${type === "success" ? "bg-[#C8A882]" : "bg-red-400"}`}
      />
      {msg}
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}

const inputCls =
  "w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 transition-colors";

function DarkField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] tracking-[0.14em] uppercase text-[#5A5248]">
        {label}
        {required && <span className="text-[#C8A882]/60 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── AdminDateBadge ────────────────────────────────────────────
function AdminDateBadge({
  eventDate,
  events,
}: {
  eventDate: string | null;
  events: { startTime: string | null }[];
}) {
  const now = new Date();
  const primary = eventDate ? new Date(eventDate) : null;
  const fallback = !primary
    ? ((events ?? [])
        .filter((e) => e.startTime)
        .map((e) => new Date(e.startTime!))
        .filter((d) => d >= now)
        .sort((a, b) => a.getTime() - b.getTime())[0] ?? null)
    : null;
  const date = primary ?? fallback;
  if (!date) return null;
  const daysUntil = Math.ceil((date.getTime() - now.getTime()) / 86400000);
  const isUrgent = daysUntil >= 0 && daysUntil <= 14;
  const isToday = daysUntil === 0;
  const isPast = daysUntil < 0;
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1.5 border shrink-0 ${isUrgent ? "border-[#C8A882]/40 bg-[#C8A882]/5" : "border-white/[0.06] bg-transparent"}`}
    >
      <div className="text-center min-w-[1.8rem]">
        <div className="text-[7px] tracking-[0.1em] uppercase text-[#5A5248]">
          {HU_MONTHS_SH[date.getMonth()]}
        </div>
        <div
          className="font-['Cormorant_Garamond'] text-[1.3rem] font-light leading-none"
          style={{
            color: isPast ? "#3A3530" : isUrgent ? "#C8A882" : "#5A5248",
          }}
        >
          {date.getDate()}
        </div>
      </div>
      <div className="border-l border-white/[0.06] pl-2">
        {isToday ? (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            <span className="text-[9px] text-[#34D399]">Ma</span>
          </div>
        ) : isPast ? (
          <div className="text-[8px] tracking-[0.06em] uppercase text-[#3A3530]">
            Volt
          </div>
        ) : (
          <>
            <div
              className="font-['Cormorant_Garamond'] text-[1rem] font-light leading-none"
              style={{ color: isUrgent ? "#C8A882" : "#3A3530" }}
            >
              {daysUntil}
            </div>
            <div className="text-[7px] tracking-[0.08em] uppercase text-[#3A3530]">
              nap
            </div>
          </>
        )}
        {primary && (
          <div className="text-[6px] text-[#C8A882]/40 mt-0.5 tracking-widest">
            ✦
          </div>
        )}
      </div>
    </div>
  );
}

// ── AdminMiniCalendar ─────────────────────────────────────────
function AdminMiniCalendar({
  selectedDate,
  onSelect,
  busyDates,
  allowPast = false, // ← ÚJ: admin esetén true
}: {
  selectedDate: string;
  onSelect: (d: string) => void;
  busyDates: string[];
  allowPast?: boolean;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = useState(() => {
    // Ha van kiválasztott dátum, arra a hónapra nyíljon
    if (selectedDate) {
      const d = new Date(selectedDate + "T12:00:00");
      d.setDate(1);
      return d;
    }
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const y = viewMonth.getFullYear();
  const m = viewMonth.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  let off = first.getDay() - 1;
  if (off < 0) off = 6;

  const days: (Date | null)[] = [];
  for (let i = 0; i < off; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(y, m, d));

  function prevMonth() {
    setViewMonth((v) => {
      const n = new Date(v);
      n.setDate(1);
      n.setMonth(n.getMonth() - 1);
      return n;
    });
  }
  function nextMonth() {
    setViewMonth((v) => {
      const n = new Date(v);
      n.setDate(1);
      n.setMonth(n.getMonth() + 1);
      return n;
    });
  }

  return (
    <div className="bg-[#0E0C0A] border border-white/[0.08] p-4">
      {/* Fejléc */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center border border-white/[0.08] text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-3.5 h-3.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-[11px] text-[#D4C4B0] font-medium">
          {viewMonth.toLocaleDateString("hu-HU", {
            year: "numeric",
            month: "long",
          })}
        </span>
        <button
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center border border-white/[0.08] text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-3.5 h-3.5"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Napok fejléce */}
      <div className="grid grid-cols-7 mb-1">
        {["H", "K", "Sz", "Cs", "P", "Szo", "V"].map((d) => (
          <div
            key={d}
            className="text-center text-[9px] tracking-[0.08em] uppercase text-[#3A3530] py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Napok */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const ymd = toYMD(day);
          const isPast = day < today;
          const isBusy = busyDates.includes(ymd);
          const isSelected = selectedDate === ymd;
          const isToday = toYMD(day) === toYMD(today);
          // allowPast=true esetén múlt napok is kattinthatók
          const disabled = allowPast ? false : isPast;

          return (
            <button
              key={ymd}
              disabled={disabled}
              onClick={() => !disabled && onSelect(isSelected ? "" : ymd)}
              title={
                isBusy
                  ? "Foglalt nap"
                  : isPast && allowPast
                    ? "Múltbeli dátum"
                    : undefined
              }
              className={`relative h-8 w-full text-[11px] transition-all rounded-sm
                ${disabled ? "cursor-not-allowed opacity-25" : "cursor-pointer"}
                ${
                  isSelected
                    ? "bg-[#C8A882] text-[#0C0A08] font-medium"
                    : isBusy && !isPast
                      ? "bg-[#C8A882]/10 text-[#C8A882]/40"
                      : isToday
                        ? "border border-[#C8A882]/40 text-[#C8A882]"
                        : isPast && allowPast
                          ? "text-[#3A3530] hover:bg-white/[0.04] hover:text-[#5A5248]" // múlt: halványabb de kattintható
                          : !disabled
                            ? "text-[#5A5248] hover:bg-white/[0.06] hover:text-[#D4C4B0]"
                            : "text-[#2A2520]"
                }`}
            >
              <span
                className={
                  isBusy && !isPast && !isSelected ? "line-through" : ""
                }
              >
                {day.getDate()}
              </span>
              {/* Foglalt jelző pont */}
              {isBusy && !isPast && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C8A882]/50" />
              )}
              {/* Múltbeli dátum jelző – kis pont adminnak */}
              {isPast && allowPast && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#3A3530]/60" />
              )}
            </button>
          );
        })}
      </div>

      {/* Jelmagyarázat */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.05] flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#C8A882]/15 border border-[#C8A882]/20 rounded-sm" />
          <span className="text-[9px] text-[#3A3530]">Foglalt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#C8A882] rounded-sm" />
          <span className="text-[9px] text-[#3A3530]">Kiválasztva</span>
        </div>
        {allowPast && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#3A3530]/40 rounded-sm" />
            <span className="text-[9px] text-[#3A3530]">Múltbeli</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── NewProjectModal ───────────────────────────────────────────
function NewProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDesc] = useState("");
  const [typeId, setTypeId] = useState<number>(1);
  const [packageId, setPackageId] = useState<number | null>(null);
  const [status, setStatus] = useState<ProjectStatus>("PLANNING");
  const [userId, setUserId] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [packages, setPackages] = useState<Package[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [busyDates, setBusyDates] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetch("/api/packages")
      .then((r) => r.json())
      .then((d) => setPackages(d.packages ?? []));
    fetch("/api/user/getusers")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []));
    fetch("/api/calendar/busy?from=" + new Date().toISOString())
      .then((r) => r.json())
      .then((d) => setBusyDates(d.busyDates ?? []));
  }, []);

  useEffect(() => {
    setPackageId(null);
  }, [typeId]);

  const hasPackages = TYPES_WITH_PACKAGES.includes(typeId);
  const filteredPackages = packages.filter(
    (p) => p.categoryId === ({ 1: 1, 2: 2 } as Record<number, number>)[typeId],
  );

  async function handleCreate() {
    if (!name.trim()) {
      setError("A projekt neve kötelező");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/projects/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          typeId,
          packageId,
          status,
          userId: userId || null,
          totalPrice: totalPrice ? parseFloat(totalPrice) : null,
          eventDate: eventDate || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onCreated();
    } catch (e: any) {
      setError(e.message ?? "Hiba a létrehozásnál");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg mx-4 bg-[#0E0C0A] border border-white/[0.08] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fejléc */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] sticky top-0 bg-[#0E0C0A] z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-3 h-px bg-[#C8A882]/50" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/50">
                Admin
              </span>
            </div>
            <h3 className="font-['Cormorant_Garamond'] text-[1.3rem] font-light text-white">
              Új projekt létrehozása
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

        {/* Mezők */}
        <div className="px-5 py-5 flex flex-col gap-4">
          <DarkField label="Projekt neve" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pl. Kovács Esküvő 2025"
              className={inputCls}
            />
          </DarkField>

          <div className="grid grid-cols-2 gap-3">
            <DarkField label="Típus">
              <select
                value={typeId}
                onChange={(e) => setTypeId(parseInt(e.target.value))}
                className={inputCls}
              >
                {PROJECT_TYPES.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                    style={{ background: "#141210" }}
                  >
                    {t.name}
                  </option>
                ))}
              </select>
            </DarkField>
            <DarkField label="Státusz">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className={inputCls}
                style={{ color: STATUS_META[status].color }}
              >
                {STATUSES.map((s) => (
                  <option
                    key={s}
                    value={s}
                    style={{
                      background: "#141210",
                      color: STATUS_META[s].color,
                    }}
                  >
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </DarkField>
          </div>

          {/* ── Munka dátuma – kattintható gomb + MiniCalendar ── */}
          <DarkField label="Munka dátuma">
            <button
              type="button"
              onClick={() => setShowCalendar((v) => !v)}
              className={`w-full flex items-center justify-between px-3 py-2.5 border text-[13px] text-left transition-colors ${
                showCalendar
                  ? "border-[#C8A882]/40 bg-[#141210]"
                  : "border-white/[0.08] bg-[#141210] hover:border-white/[0.14]"
              }`}
            >
              <span className={eventDate ? "text-[#D4C4B0]" : "text-[#3A3530]"}>
                {eventDate
                  ? new Date(eventDate + "T12:00:00").toLocaleDateString(
                      "hu-HU",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                      },
                    )
                  : "Kattints a dátum kiválasztásához..."}
              </span>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {eventDate && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setEventDate("");
                    }}
                    className="text-[#5A5248] hover:text-red-400 transition-colors text-[11px] cursor-pointer"
                  >
                    ✕
                  </span>
                )}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className={`w-4 h-4 transition-colors ${showCalendar ? "text-[#C8A882]" : "text-[#5A5248]"}`}
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </button>

            {showCalendar && (
              <div className="mt-1">
                <AdminMiniCalendar
                  selectedDate={eventDate}
                  onSelect={(ymd) => {
                    setEventDate(ymd);
                    if (ymd) setShowCalendar(false);
                  }}
                  busyDates={busyDates}
                  allowPast={true}
                />
              </div>
            )}
          </DarkField>

          {hasPackages && (
            <DarkField label="Csomag">
              <select
                value={packageId ?? ""}
                onChange={(e) =>
                  setPackageId(e.target.value ? parseInt(e.target.value) : null)
                }
                className={inputCls}
              >
                <option value="" style={{ background: "#141210" }}>
                  Nincs csomag
                </option>
                {filteredPackages.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                    style={{ background: "#141210" }}
                  >
                    {p.name}
                    {p.price ? ` – ${p.price.toLocaleString("hu-HU")} Ft` : ""}
                  </option>
                ))}
              </select>
            </DarkField>
          )}

          <DarkField label="Ügyfél (opcionális)">
            <select
              value={userId ?? ""}
              onChange={(e) =>
                setUserId(e.target.value ? parseInt(e.target.value) : null)
              }
              className={inputCls}
            >
              <option value="" style={{ background: "#141210" }}>
                Nincs hozzárendelve
              </option>
              {users
                .filter((u) => (u as any).role !== "ADMIN")
                .map((u) => (
                  <option
                    key={u.id}
                    value={u.id}
                    style={{ background: "#141210" }}
                  >
                    {u.name ?? u.email}
                  </option>
                ))}
            </select>
          </DarkField>

          <DarkField label="Végösszeg (Ft, opcionális)">
            <input
              type="number"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              placeholder="Pl. 380000"
              className={inputCls}
              min="0"
            />
          </DarkField>

          <DarkField label="Megjegyzés">
            <textarea
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Belső megjegyzés..."
              className={`${inputCls} resize-none`}
            />
          </DarkField>

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
              {saving ? "Létrehozás..." : "Projekt létrehozása"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AdminProjectsPage ─────────────────────────────────────────
export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">(
    "ALL",
  );
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch {
      setToast({ msg: "Nem sikerült betölteni", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function quickStatusChange(id: number, status: ProjectStatus) {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      );
      setToast({ msg: "Státusz frissítve", type: "success" });
    } catch {
      setToast({ msg: "Hiba a státuszváltásnál", type: "error" });
    }
  }

  const stats = {
    total: projects.length,
    planning: projects.filter((p) => p.status === "PLANNING").length,
    inProgress: projects.filter((p) => p.status === "IN_PROGRESS").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
  };

  return (
    <div className="min-h-screen bg-[#0C0A08] text-[#D4C4B0]">
      <div className="border-b border-white/[0.05] px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-px bg-[#C8A882]/50" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/50">
                Admin panel
              </span>
            </div>
            <h1 className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2rem] font-light text-white leading-tight">
              Projektek
            </h1>
            <p className="text-[12px] text-[#3A3530] mt-0.5">
              {stats.total} projekt az adatbázisban
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-[#C8A882] text-[#0C0A08] text-[11px] tracking-[0.14em] uppercase px-4 py-2.5 hover:bg-[#D4B892] transition-colors font-medium whitespace-nowrap"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-4 h-4"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Új projekt
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4">
        {/* Statisztikák */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Összes", value: stats.total, color: "#C8A882" },
            { label: "Tervezés", value: stats.planning, color: "#C8A882" },
            { label: "Folyamatban", value: stats.inProgress, color: "#60A5FA" },
            { label: "Kész", value: stats.completed, color: "#34D399" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#0E0C0A] border border-white/[0.05] px-3 sm:px-5 py-3 sm:py-4"
            >
              <div className="text-[9px] tracking-[0.14em] uppercase text-[#3A3530] mb-1">
                {s.label}
              </div>
              <div
                className="font-['Cormorant_Garamond'] text-[1.6rem] sm:text-[2rem] font-light leading-none"
                style={{ color: s.color }}
              >
                {loading ? "—" : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Kereső + szűrő */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3530]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Keresés projekt, ügyfél alapján..."
              className="w-full bg-[#0E0C0A] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] focus:outline-none focus:border-[#C8A882]/40 pl-9 pr-3 py-2.5 transition-colors"
            />
          </div>
          <div className="flex border border-white/[0.06] overflow-x-auto scrollbar-none">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-2 text-[10px] tracking-[0.1em] uppercase transition-all whitespace-nowrap border-r border-white/[0.04] ${statusFilter === "ALL" ? "bg-[#C8A882]/15 text-[#C8A882]" : "text-[#3A3530] hover:text-[#5A5248]"}`}
            >
              Mind
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-[10px] tracking-[0.1em] uppercase transition-all whitespace-nowrap border-r border-white/[0.04] last:border-r-0 ${statusFilter === s ? "text-white" : "text-[#3A3530] hover:text-[#5A5248]"}`}
                style={
                  statusFilter === s
                    ? {
                        background: STATUS_META[s].bg,
                        color: STATUS_META[s].color,
                      }
                    : {}
                }
              >
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop tábla */}
        <div className="hidden lg:block bg-[#0E0C0A] border border-white/[0.05] overflow-hidden">
          <div className="grid grid-cols-[1fr_130px_130px_130px_90px_100px_100px] items-center border-b border-white/[0.05] px-4 gap-3">
            {[
              "Projekt",
              "Ügyfél",
              "Típus",
              "Munka dátuma",
              "Státusz",
              "Tevékenység",
              "Műveletek",
            ].map((h) => (
              <div
                key={h}
                className="py-3 text-[9px] tracking-[0.14em] uppercase text-[#3A3530]"
              >
                {h}
              </div>
            ))}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-4 h-4 border border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-[12px] text-[#3A3530]">Nincs találat</span>
            </div>
          ) : (
            projects.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[1fr_130px_130px_130px_90px_100px_100px] items-center px-4 gap-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
              >
                <div className="py-3.5 min-w-0">
                  <div className="text-[13px] text-[#D4C4B0] truncate">
                    {p.name ?? "—"}
                  </div>
                  <div className="text-[10px] text-[#3A3530] mt-0.5">
                    #{p.id} ·{" "}
                    {new Date(p.createdAt).toLocaleDateString("hu-HU")}
                  </div>
                </div>
                <div className="py-3.5 min-w-0">
                  <div className="text-[12px] text-[#5A5248] truncate">
                    {p.users[0]?.name ?? "—"}
                  </div>
                  <div className="text-[10px] text-[#3A3530] truncate">
                    {p.users[0]?.email ?? ""}
                  </div>
                </div>
                <div className="py-3.5">
                  <span className="text-[11px] text-[#5A5248]">
                    {p.type?.name ?? "—"}
                  </span>
                </div>
                <div className="py-3.5">
                  <AdminDateBadge
                    eventDate={p.eventDate}
                    events={p.calendarEvents ?? []}
                  />
                </div>
                <div className="py-3.5">
                  <select
                    value={p.status ?? "PLANNING"}
                    onChange={(e) =>
                      quickStatusChange(p.id, e.target.value as ProjectStatus)
                    }
                    className="bg-transparent text-[11px] focus:outline-none cursor-pointer w-full"
                    style={{
                      color: p.status ? STATUS_META[p.status].color : "#3A3530",
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option
                        key={s}
                        value={s}
                        style={{
                          background: "#0E0C0A",
                          color: STATUS_META[s].color,
                        }}
                      >
                        {STATUS_META[s].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="py-3.5 flex flex-col gap-0.5">
                  <span className="text-[10px] text-[#3A3530]">
                    {p._count.messages} üzenet
                  </span>
                  <span className="text-[10px] text-[#3A3530]">
                    {p._count.galleries} galéria
                  </span>
                </div>
                <div className="py-3.5">
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="block text-center py-1.5 border border-white/[0.08] text-[10px] tracking-[0.08em] uppercase text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all"
                  >
                    Megnyit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobil kártyák */}
        <div className="lg:hidden flex flex-col gap-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-4 h-4 border border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
            </div>
          ) : (
            projects.map((p) => (
              <div
                key={p.id}
                className="bg-[#0E0C0A] border border-white/[0.05] p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="text-[14px] text-[#D4C4B0] font-medium truncate">
                      {p.name ?? "—"}
                    </div>
                    <div className="text-[11px] text-[#3A3530] mt-0.5">
                      #{p.id} · {p.users[0]?.name ?? "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <AdminDateBadge
                      eventDate={p.eventDate}
                      events={p.calendarEvents ?? []}
                    />
                    <StatusBadge status={p.status} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {p.type && (
                    <span className="text-[10px] text-[#5A5248] border border-white/[0.06] px-2 py-0.5">
                      {p.type.name}
                    </span>
                  )}
                  <span className="text-[10px] text-[#3A3530]">
                    {p._count.messages} üzenet · {p._count.galleries} galéria
                  </span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={p.status ?? "PLANNING"}
                    onChange={(e) =>
                      quickStatusChange(p.id, e.target.value as ProjectStatus)
                    }
                    className="flex-1 bg-[#141210] border border-white/[0.08] text-[11px] px-2 py-2 focus:outline-none"
                    style={{
                      color: p.status ? STATUS_META[p.status].color : "#3A3530",
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option
                        key={s}
                        value={s}
                        style={{
                          background: "#141210",
                          color: STATUS_META[s].color,
                        }}
                      >
                        {STATUS_META[s].label}
                      </option>
                    ))}
                  </select>
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="px-4 py-2 bg-[#C8A882]/10 border border-[#C8A882]/20 text-[11px] tracking-[0.08em] uppercase text-[#C8A882] hover:bg-[#C8A882]/15 transition-all whitespace-nowrap"
                  >
                    Megnyit →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showNewModal && (
        <NewProjectModal
          onClose={() => setShowNewModal(false)}
          onCreated={() => {
            setShowNewModal(false);
            fetchProjects();
            setToast({ msg: "Projekt létrehozva", type: "success" });
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
    </div>
  );
}
