"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";

type Project = {
  id: number;
  name: string | null;
  description: string | null;
  status: ProjectStatus | null;
  createdAt: string;
  users: { id: number; name: string | null; email: string }[];
  type: { id: number; name: string | null } | null;
  category: { id: number; name: string | null } | null;
  _count: { messages: number; galleries: number; calendarEvents: number };
};

const STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  PLANNING:    { label: "Tervezés",     color: "#C8A882", bg: "rgba(200,168,130,0.1)" },
  IN_PROGRESS: { label: "Folyamatban",  color: "#60A5FA", bg: "rgba(96,165,250,0.1)" },
  COMPLETED:   { label: "Kész",         color: "#34D399", bg: "rgba(52,211,153,0.1)" },
  ON_HOLD:     { label: "Felfüggesztve",color: "#FBBF24", bg: "rgba(251,191,36,0.1)" },
  CANCELLED:   { label: "Törölve",      color: "#F87171", bg: "rgba(248,113,113,0.1)" },
};

const STATUSES = Object.keys(STATUS_META) as ProjectStatus[];

function StatusBadge({ status }: { status: ProjectStatus | null }) {
  if (!status) return <span className="text-[#3A3530] text-[10px]">—</span>;
  const m = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.1em] uppercase px-2 py-1 border"
      style={{ color: m.color, background: m.bg, borderColor: `${m.color}30` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-4 right-4 z-[200] flex items-center gap-3 px-4 py-3 border text-[13px] ${type === "success" ? "bg-[#0E0C0A] border-[#C8A882]/30 text-[#D4C4B0]" : "bg-[#0E0C0A] border-red-500/30 text-red-400"}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${type === "success" ? "bg-[#C8A882]" : "bg-red-400"}`} />
      {msg}
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100">✕</button>
    </div>
  );
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">("ALL");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch { setToast({ msg: "Nem sikerült betölteni", type: "error" }); }
    finally { setLoading(false); }
  }, [statusFilter, search]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  async function quickStatusChange(id: number, status: ProjectStatus) {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      setToast({ msg: "Státusz frissítve", type: "success" });
    } catch { setToast({ msg: "Hiba a státuszváltásnál", type: "error" }); }
  }

  const stats = {
    total: projects.length,
    planning: projects.filter(p => p.status === "PLANNING").length,
    inProgress: projects.filter(p => p.status === "IN_PROGRESS").length,
    completed: projects.filter(p => p.status === "COMPLETED").length,
  };

  return (
    <div className="min-h-screen bg-[#0C0A08] text-[#D4C4B0]">

      {/* Fejléc */}
      <div className="border-b border-white/[0.05] px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-px bg-[#C8A882]/50" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/50">Admin panel</span>
            </div>
            <h1 className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2rem] font-light text-white leading-tight">Projektek</h1>
            <p className="text-[12px] text-[#3A3530] mt-0.5">{stats.total} projekt az adatbázisban</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4">

        {/* Stat kártyák */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Összes", value: stats.total, color: "#C8A882" },
            { label: "Tervezés", value: stats.planning, color: "#C8A882" },
            { label: "Folyamatban", value: stats.inProgress, color: "#60A5FA" },
            { label: "Kész", value: stats.completed, color: "#34D399" },
          ].map(s => (
            <div key={s.label} className="bg-[#0E0C0A] border border-white/[0.05] px-3 sm:px-5 py-3 sm:py-4">
              <div className="text-[9px] tracking-[0.14em] uppercase text-[#3A3530] mb-1">{s.label}</div>
              <div className="font-['Cormorant_Garamond'] text-[1.6rem] sm:text-[2rem] font-light leading-none" style={{ color: s.color }}>
                {loading ? "—" : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Szűrők */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3530]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Keresés projekt, ügyfél alapján..."
              className="w-full bg-[#0E0C0A] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] focus:outline-none focus:border-[#C8A882]/40 pl-9 pr-3 py-2.5 transition-colors" />
          </div>
          <div className="flex border border-white/[0.06] overflow-x-auto scrollbar-none">
            <button onClick={() => setStatusFilter("ALL")} className={`px-3 py-2 text-[10px] tracking-[0.1em] uppercase transition-all whitespace-nowrap border-r border-white/[0.04] ${statusFilter === "ALL" ? "bg-[#C8A882]/15 text-[#C8A882]" : "text-[#3A3530] hover:text-[#5A5248]"}`}>
              Mind
            </button>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-[10px] tracking-[0.1em] uppercase transition-all whitespace-nowrap border-r border-white/[0.04] last:border-r-0 ${statusFilter === s ? "text-white" : "text-[#3A3530] hover:text-[#5A5248]"}`}
                style={statusFilter === s ? { background: STATUS_META[s].bg, color: STATUS_META[s].color } : {}}>
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Táblázat desktop */}
        <div className="hidden lg:block bg-[#0E0C0A] border border-white/[0.05] overflow-hidden">
          <div className="grid grid-cols-[1fr_140px_160px_120px_100px_120px] items-center border-b border-white/[0.05] px-4 gap-3">
            {["Projekt", "Ügyfél", "Típus", "Státusz", "Tevékenység", "Műveletek"].map(h => (
              <div key={h} className="py-3 text-[9px] tracking-[0.14em] uppercase text-[#3A3530]">{h}</div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-4 h-4 border border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
              <span className="text-[12px] text-[#3A3530]">Betöltés...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-[12px] text-[#3A3530]">Nincs találat</span>
            </div>
          ) : (
            projects.map(p => (
              <div key={p.id} className="grid grid-cols-[1fr_140px_160px_120px_100px_120px] items-center px-4 gap-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <div className="py-3.5 min-w-0">
                  <div className="text-[13px] text-[#D4C4B0] truncate">{p.name ?? "—"}</div>
                  <div className="text-[10px] text-[#3A3530] mt-0.5">#{p.id} · {new Date(p.createdAt).toLocaleDateString("hu-HU")}</div>
                </div>
                <div className="py-3.5 min-w-0">
                  <div className="text-[12px] text-[#5A5248] truncate">{p.users[0]?.name ?? "—"}</div>
                  <div className="text-[10px] text-[#3A3530] truncate">{p.users[0]?.email ?? ""}</div>
                </div>
                <div className="py-3.5">
                  <span className="text-[11px] text-[#5A5248]">{p.type?.name ?? "—"}</span>
                </div>
                <div className="py-3.5">
                  <select
                    value={p.status ?? "PLANNING"}
                    onChange={e => quickStatusChange(p.id, e.target.value as ProjectStatus)}
                    className="bg-transparent text-[11px] focus:outline-none cursor-pointer w-full"
                    style={{ color: p.status ? STATUS_META[p.status].color : "#3A3530" }}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s} style={{ background: "#0E0C0A", color: STATUS_META[s].color }}>
                        {STATUS_META[s].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="py-3.5 flex flex-col gap-0.5">
                  <span className="text-[10px] text-[#3A3530]">{p._count.messages} üzenet</span>
                  <span className="text-[10px] text-[#3A3530]">{p._count.galleries} galéria</span>
                </div>
                <div className="py-3.5 flex items-center gap-1.5">
                  <Link href={`/admin/projects/${p.id}`}
                    className="flex-1 text-center py-1.5 border border-white/[0.08] text-[10px] tracking-[0.08em] uppercase text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all">
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
            <div className="flex items-center justify-center py-12 gap-3">
              <div className="w-4 h-4 border border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
            </div>
          ) : projects.map(p => (
            <div key={p.id} className="bg-[#0E0C0A] border border-white/[0.05] p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="text-[14px] text-[#D4C4B0] font-medium truncate">{p.name ?? "—"}</div>
                  <div className="text-[11px] text-[#3A3530] mt-0.5">#{p.id} · {p.users[0]?.name ?? "—"}</div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {p.type && <span className="text-[10px] text-[#5A5248] border border-white/[0.06] px-2 py-0.5">{p.type.name}</span>}
                <span className="text-[10px] text-[#3A3530]">{p._count.messages} üzenet · {p._count.galleries} galéria</span>
              </div>
              <div className="flex gap-2">
                <select value={p.status ?? "PLANNING"} onChange={e => quickStatusChange(p.id, e.target.value as ProjectStatus)}
                  className="flex-1 bg-[#141210] border border-white/[0.08] text-[11px] px-2 py-2 focus:outline-none"
                  style={{ color: p.status ? STATUS_META[p.status].color : "#3A3530" }}>
                  {STATUSES.map(s => (
                    <option key={s} value={s} style={{ background: "#141210", color: STATUS_META[s].color }}>{STATUS_META[s].label}</option>
                  ))}
                </select>
                <Link href={`/admin/projects/${p.id}`}
                  className="px-4 py-2 bg-[#C8A882]/10 border border-[#C8A882]/20 text-[11px] tracking-[0.08em] uppercase text-[#C8A882] hover:bg-[#C8A882]/15 transition-all whitespace-nowrap">
                  Megnyit →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}