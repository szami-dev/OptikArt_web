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
  type: { id: number; name: string | null } | null;
  category: { id: number; name: string | null } | null;
  _count: { messages: number; galleries: number; calendarEvents: number };
  messages: {
    id: number;
    sender: { id: number; name: string | null; role: string };
    createdAt: string;
  }[];
};

const STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string; border: string }> = {
  PLANNING:    { label: "Tervezés",      color: "#A08060", bg: "#FDF9F5", border: "#EDE8E0" },
  IN_PROGRESS: { label: "Folyamatban",   color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  COMPLETED:   { label: "Elkészült",     color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  ON_HOLD:     { label: "Felfüggesztve", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  CANCELLED:   { label: "Törölve",       color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
};

function StatusPill({ status }: { status: ProjectStatus | null }) {
  if (!status) return null;
  const m = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.08em] px-2.5 py-1 border font-medium"
      style={{ color: m.color, background: m.bg, borderColor: m.border }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

export default function UserProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects/my");
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const active = projects.filter(p => p.status !== "COMPLETED" && p.status !== "CANCELLED");
  const done   = projects.filter(p => p.status === "COMPLETED" || p.status === "CANCELLED");

  if (loading) return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center gap-3">
      <div className="w-4 h-4 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
      <span className="text-[13px] text-[#A08060]">Betöltés...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F4]">

      {/* Fejléc */}
      <div className="bg-white border-b border-[#EDE8E0] px-5 sm:px-8 lg:px-12 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-px bg-[#C8A882]" />
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">Projektek</span>
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="font-['Cormorant_Garamond'] text-[2rem] sm:text-[2.4rem] font-light text-[#1A1510] leading-tight">
              Saját projektjeim
            </h1>
            <Link href="/contact"
              className="flex items-center gap-2 bg-[#1A1510] text-white text-[11px] tracking-[0.14em] uppercase px-5 py-2.5 hover:bg-[#C8A882] transition-all duration-300 whitespace-nowrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Új projekt
            </Link>
          </div>

          {/* Stat sor */}
          {projects.length > 0 && (
            <div className="flex gap-6 mt-5 pt-5 border-t border-[#EDE8E0]">
              {[
                { n: projects.length, l: "Összes projekt" },
                { n: active.length,   l: "Aktív" },
                { n: done.length,     l: "Lezárt" },
              ].map(s => (
                <div key={s.l}>
                  <div className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#C8A882] leading-none">{s.n}</div>
                  <div className="text-[9px] tracking-[0.12em] uppercase text-[#A08060] mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-8 flex flex-col gap-8">

        {/* Üres állapot */}
        {projects.length === 0 && (
          <div className="bg-white border border-[#EDE8E0] p-12 sm:p-16 text-center">
            <div className="w-12 h-12 border border-[#EDE8E0] flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.2" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
            <h3 className="font-['Cormorant_Garamond'] text-[1.4rem] font-light text-[#1A1510] mb-2">Még nincs projekted</h3>
            <p className="text-[13px] text-[#A08060] mb-7">Indíts egy új projektet és mi gondoskodunk a többiről.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-[#1A1510] text-white text-[11px] tracking-[0.14em] uppercase px-8 py-3.5 hover:bg-[#C8A882] transition-all">
              Projekt indítása →
            </Link>
          </div>
        )}

        {/* Aktív projektek */}
        {active.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#A08060]">Aktív projektek</span>
              <div className="flex-1 h-px bg-[#EDE8E0]" />
            </div>
            <div className="flex flex-col gap-3">
              {active.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          </div>
        )}

        {/* Lezárt projektek */}
        {done.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#A08060]">Lezárt projektek</span>
              <div className="flex-1 h-px bg-[#EDE8E0]" />
            </div>
            <div className="flex flex-col gap-3">
              {done.map(p => <ProjectCard key={p.id} project={p} muted />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Projekt kártya ────────────────────────────────────────────
function ProjectCard({ project: p, muted = false }: { project: Project; muted?: boolean }) {
  const lastMsg = p.messages[0];
  const hasUnread = lastMsg && lastMsg.sender.role === "ADMIN";

  return (
    <Link href={`/user/projects/${p.id}`}
      className={`group bg-white border transition-all duration-200 hover:border-[#C8A882]/40 hover:shadow-sm block ${muted ? "border-[#EDE8E0] opacity-70 hover:opacity-100" : "border-[#EDE8E0]"}`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[14px] text-[#1A1510] font-medium truncate">{p.name ?? "Névtelen projekt"}</span>
              {hasUnread && (
                <span className="w-2 h-2 rounded-full bg-[#C8A882] shrink-0" title="Új üzenet" />
              )}
            </div>
            <div className="text-[11px] text-[#A08060]">
              {p.type?.name ?? "—"}
              {p.category && <> · {p.category.name}</>}
            </div>
          </div>
          <StatusPill status={p.status} />
        </div>

        {/* Meta sor */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, val: p._count.messages, label: "üzenet" },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, val: p._count.galleries, label: "galéria" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1 text-[#A08060]">
                {item.icon}
                <span className="text-[11px]">{item.val} {item.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[#C8A882]/50 group-hover:text-[#C8A882] transition-colors">
            <span className="text-[11px] tracking-[0.06em]">Megnyit</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </div>

        {/* Utolsó üzenet preview */}
        {lastMsg && (
          <div className={`mt-3 pt-3 border-t border-[#EDE8E0] flex items-center gap-2 ${hasUnread ? "opacity-100" : "opacity-50"}`}>
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${hasUnread ? "bg-[#C8A882]" : "bg-[#EDE8E0]"}`} />
            <span className="text-[11px] text-[#7A6A58] truncate">
              <span className="font-medium">{lastMsg.sender.name}</span>
              {" · "}
              {new Date(lastMsg.createdAt).toLocaleDateString("hu-HU")}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}