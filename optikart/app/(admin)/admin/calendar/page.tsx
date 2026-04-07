"use client";

import { useState, useEffect, useCallback } from "react";
import WeekCalendar from "@/app/components/WeekCalendar";

type Project = { id: number; name: string | null };

export default function AdminCalendarPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Projektek listája az esemény létrehozáshoz
  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(d => setProjects(d.projects ?? []));
  }, []);

  return (
    <div className="min-h-screen bg-[#0C0A08] text-[#D4C4B0]">
      <div className="border-b border-white/[0.05] px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-px bg-[#C8A882]/50" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/50">Admin panel</span>
            </div>
            <h1 className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2rem] font-light text-white leading-tight">Naptár</h1>
            <p className="text-[12px] text-[#3A3530] mt-0.5">Összes projekt eseménye</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#C8A882] text-[#0C0A08] text-[11px] tracking-[0.14em] uppercase px-4 py-2.5 hover:bg-[#D4B892] transition-colors font-medium whitespace-nowrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Új esemény
          </button>
        </div>
      </div>

      {/* Naptár – fehér témájú a WeekCalendar, wrappeljük */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* A WeekCalendar világos témájú – dark wrapperben fehér kártyaként jelenik meg */}
        <div className="bg-[#FAF8F4] p-4 sm:p-6 lg:p-8">
          <WeekCalendar
            key={refreshKey}
            mode="admin"
            onBookingSuccess={() => setRefreshKey(k => k + 1)}
          />
        </div>
      </div>

      {/* Új esemény modal */}
      {showCreateModal && (
        <AdminCreateEventModal
          projects={projects}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            setRefreshKey(k => k + 1);
          }}
        />
      )}
    </div>
  );
}

// ── Admin esemény létrehozás modal ────────────────────────────
function AdminCreateEventModal({
  projects,
  onClose,
  onCreated,
}: {
  projects: Project[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startHour, setStartHour] = useState("10");
  const [endHour, setEndHour] = useState("12");
  const [projectId, setProjectId] = useState<number | null>(projects[0]?.id ?? null);
  const [wholeDay, setWholeDay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!date) { setError("Dátum kötelező"); return; }
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
          startTime, endTime,
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

  const hours = Array.from({ length: 13 }, (_, i) => String(i + 8).padStart(2, "0"));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md mx-4 bg-[#0E0C0A] border border-white/[0.08] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-4 h-px bg-[#C8A882]/50" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/50">Adminisztrátor</span>
            </div>
            <h3 className="font-['Cormorant_Garamond'] text-[1.3rem] font-light text-white">Új esemény létrehozása</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 border border-white/[0.08] flex items-center justify-center text-[#5A5248] hover:text-white transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          <DarkField label="Megnevezés">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Fotózás, Egyeztetés..." className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 transition-colors" />
          </DarkField>

          <DarkField label="Projekt">
            <select value={projectId ?? ""} onChange={e => setProjectId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] px-3 py-2.5 focus:outline-none">
              <option value="">Projekt nélkül</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name ?? `Projekt #${p.id}`}</option>)}
            </select>
          </DarkField>

          <DarkField label="Dátum">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 transition-colors"
              style={{ colorScheme: "dark" }} />
          </DarkField>

          <div className="flex items-center gap-2">
            <button onClick={() => setWholeDay(v => !v)}
              className={`w-5 h-5 border flex items-center justify-center transition-all ${wholeDay ? "bg-[#C8A882] border-[#C8A882]" : "border-white/[0.15]"}`}>
              {wholeDay && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
            <span className="text-[12px] text-[#5A5248]">Egész napos esemény</span>
          </div>

          {!wholeDay && (
            <div className="grid grid-cols-2 gap-3">
              <DarkField label="Kezdés">
                <select value={startHour} onChange={e => setStartHour(e.target.value)}
                  className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] px-3 py-2.5 focus:outline-none">
                  {hours.map(h => <option key={h} value={h}>{h}:00</option>)}
                </select>
              </DarkField>
              <DarkField label="Befejezés">
                <select value={endHour} onChange={e => setEndHour(e.target.value)}
                  className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] px-3 py-2.5 focus:outline-none">
                  {hours.map(h => <option key={h} value={h}>{h}:00</option>)}
                </select>
              </DarkField>
            </div>
          )}

          {error && <p className="text-[11px] text-red-400/70">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 border border-white/[0.08] text-[11px] tracking-[0.1em] uppercase text-[#5A5248] hover:text-[#D4C4B0] transition-all">Mégsem</button>
            <button onClick={handleCreate} disabled={saving} className="flex-1 py-2.5 bg-[#C8A882] text-[11px] tracking-[0.12em] uppercase text-[#0C0A08] font-medium hover:bg-[#D4B892] transition-all disabled:opacity-50">
              {saving ? "Létrehozás..." : "Létrehozás"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DarkField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] tracking-[0.14em] uppercase text-[#5A5248]">{label}</label>
      {children}
    </div>
  );
}