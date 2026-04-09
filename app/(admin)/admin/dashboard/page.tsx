"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

// ── Típusok ───────────────────────────────────────────────────
type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "REFUNDED";

type DashProject = {
  id: number; name: string | null; status: ProjectStatus | null;
  paymentStatus: PaymentStatus | null; totalPrice: number | null;
  createdAt: string;
  users: { id: number; name: string | null; email: string }[];
  type: { name: string | null } | null;
  category: { name: string | null } | null;
  calendarEvents: { startTime: string | null; title: string | null }[];
  _count: { messages: number; galleries: number };
};

type DashUser = {
  id: number; name: string | null; email: string; role: string;
  createdAt: string;
};

const STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  PLANNING:    { label: "Tervezés",      color: "#C8A882", bg: "rgba(200,168,130,0.12)" },
  IN_PROGRESS: { label: "Folyamatban",   color: "#60A5FA", bg: "rgba(96,165,250,0.12)"  },
  COMPLETED:   { label: "Kész",          color: "#34D399", bg: "rgba(52,211,153,0.12)"  },
  ON_HOLD:     { label: "Felfüggesztve", color: "#FBBF24", bg: "rgba(251,191,36,0.12)"  },
  CANCELLED:   { label: "Törölve",       color: "#F87171", bg: "rgba(248,113,113,0.12)" },
};

const PAYMENT_META: Record<PaymentStatus, { label: string; color: string }> = {
  PENDING:  { label: "Függőben",      color: "#FBBF24" },
  PAID:     { label: "Fizetve",       color: "#34D399" },
  OVERDUE:  { label: "Lejárt",        color: "#F87171" },
  REFUNDED: { label: "Visszatérítve", color: "#A78BFA" },
};

const HU_MONTHS    = ["január","február","március","április","május","június","július","augusztus","szeptember","október","november","december"];
const HU_MONTHS_SH = ["jan","feb","már","ápr","máj","jún","júl","aug","szep","okt","nov","dec"];
const HU_DAYS      = ["vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"];

function fmt(n: number) { return n.toLocaleString("hu-HU") + " Ft"; }
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Most";
  if (m < 60) return `${m}p`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}ó`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day}n`;
  return `${Math.floor(day / 30)}h`;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<DashProject[]>([]);
  const [users,    setUsers]    = useState<DashUser[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [now]                   = useState(new Date());

  const load = useCallback(async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        fetch("/api/projects?limit=200"),
        fetch("/api/user/getusers"),
      ]);
      const projData = await projRes.json();
      const userData = await userRes.json();
      setProjects(projData.projects ?? []);
      setUsers(userData.users ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Számítások ────────────────────────────────────────────
  const clients       = users.filter(u => u.role !== "ADMIN");
  const active        = projects.filter(p => p.status === "IN_PROGRESS" || p.status === "PLANNING");
  const completed     = projects.filter(p => p.status === "COMPLETED");
  const overdue       = projects.filter(p => p.paymentStatus === "OVERDUE");
  const withPrice     = projects.filter(p => p.totalPrice != null);
  const totalRevenue  = withPrice.reduce((s, p) => s + (p.totalPrice ?? 0), 0);
  const paidRevenue   = withPrice.filter(p => p.paymentStatus === "PAID").reduce((s, p) => s + (p.totalPrice ?? 0), 0);
  const pendingRev    = withPrice.filter(p => p.paymentStatus === "PENDING").reduce((s, p) => s + (p.totalPrice ?? 0), 0);
  const overdueRev    = withPrice.filter(p => p.paymentStatus === "OVERDUE").reduce((s, p) => s + (p.totalPrice ?? 0), 0);

  // Közelgő események (60 napon belül)
  const upcomingEvents = projects
    .flatMap(p => (p.calendarEvents ?? []).map(e => ({ p, e, date: new Date(e.startTime!) })))
    .filter(x => x.e.startTime && x.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 6);

  // Legutóbbi projektek
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  // Projektek típusonként
  const typeMap: Record<string, number> = {};
  projects.forEach(p => { const t = p.type?.name ?? "Egyéb"; typeMap[t] = (typeMap[t] ?? 0) + 1; });
  const byType = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);

  // Fizetési státusz bontás
  const paymentBreakdown = (["PAID","PENDING","OVERDUE","REFUNDED"] as PaymentStatus[]).map(s => ({
    s, count: projects.filter(p => p.paymentStatus === s).length,
    amount: projects.filter(p => p.paymentStatus === s && p.totalPrice).reduce((sum, p) => sum + (p.totalPrice ?? 0), 0),
  })).filter(x => x.count > 0);

  // Legutóbbi ügyfelek
  const recentClients = [...clients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const adminName = session?.user?.name?.split(" ")[1] ?? "Admin";

  if (loading) return (
    <div className="min-h-screen bg-[#0C0A08] flex items-center justify-center gap-3">
      <div className="w-5 h-5 border border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
      <span className="text-[12px] text-[#3A3530] tracking-[0.1em]">Betöltés...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0C0A08] text-[#D4C4B0]">

      {/* ── Hero fejléc ────────────────────────────────────── */}
      <div className="relative border-b border-white/[0.04] overflow-hidden">
        {/* Háttér textúra */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#C8A882 1px,transparent 1px),linear-gradient(90deg,#C8A882 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 100% at 100% 0%,rgba(200,168,130,0.06) 0%,transparent 60%)" }} />

        <div className="relative px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-6 h-px bg-[#C8A882]/40" />
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882]/40">Admin panel</span>
              </div>
              <h1 className="font-['Cormorant_Garamond'] text-[2.2rem] sm:text-[3rem] font-light text-white leading-none mb-2">
                Szia,<br />
                <em className="not-italic text-[#C8A882]">{adminName}</em>
              </h1>
              <p className="text-[12px] text-[#3A3530]">
                {now.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
              </p>
            </div>

            {/* Következő esemény a fejlécben */}
            {upcomingEvents[0] && (() => {
              const { p, date } = upcomingEvents[0];
              const days = Math.ceil((date.getTime() - now.getTime()) / 86400000);
              return (
                <Link href={`/admin/projects/${p.id}`}
                  className="border border-[#C8A882]/20 bg-[#C8A882]/5 px-5 py-4 flex items-center gap-5 hover:border-[#C8A882]/40 transition-all group">
                  <div className="text-center border-r border-[#C8A882]/20 pr-5">
                    <div className="text-[8px] tracking-[0.15em] uppercase text-[#C8A882]/40 mb-0.5">{HU_MONTHS_SH[date.getMonth()]}</div>
                    <div className="font-['Cormorant_Garamond'] text-[3rem] font-light text-[#C8A882] leading-none">{date.getDate()}</div>
                  </div>
                  <div>
                    <div className="text-[9px] tracking-[0.15em] uppercase text-[#3A3530] mb-1">{HU_DAYS[date.getDay()]}</div>
                    <div className="text-[13px] text-white group-hover:text-[#D4C4B0] transition-colors truncate max-w-[180px]">{p.name}</div>
                    <div className="text-[11px] text-[#C8A882]/60 mt-0.5">
                      {days === 0 ? "Ma van!" : `${days} nap múlva`}
                    </div>
                  </div>
                </Link>
              );
            })()}
          </div>

          {/* Gyors stat sor */}
          <div className="flex flex-wrap gap-8 mt-8 pt-6 border-t border-white/[0.04]">
            {[
              { n: projects.length,  l: "Projekt" },
              { n: active.length,    l: "Aktív" },
              { n: clients.length,   l: "Ügyfél" },
              { n: completed.length, l: "Elvégzett" },
              { n: overdue.length,   l: "Lejárt fiz.", warn: overdue.length > 0 },
            ].map(s => (
              <div key={s.l}>
                <div className="font-['Cormorant_Garamond'] text-[2rem] font-light leading-none" style={{ color: s.warn ? "#F87171" : "#C8A882" }}>{s.n}</div>
                <div className="text-[9px] tracking-[0.14em] uppercase mt-0.5" style={{ color: s.warn && s.n > 0 ? "#F87171" : "#3A3530" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-10 py-6 flex flex-col gap-5">

        {/* ── Bevétel összesítő ─────────────────────────────── */}
        {totalRevenue > 0 && (
          <div className="bg-[#0E0C0A] border border-white/[0.05] p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-4 h-px bg-[#C8A882]/40" />
              <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Bevétel áttekintés</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {[
                { label: "Összes kiszámlázott", value: totalRevenue, color: "#D4C4B0", sub: `${withPrice.length} projekt` },
                { label: "Fizetve",             value: paidRevenue,  color: "#34D399", sub: `${projects.filter(p=>p.paymentStatus==="PAID").length} projekt` },
                { label: "Függőben",            value: pendingRev,   color: "#FBBF24", sub: `${projects.filter(p=>p.paymentStatus==="PENDING").length} projekt` },
                { label: "Lejárt",              value: overdueRev,   color: "#F87171", sub: `${overdue.length} projekt` },
              ].map(r => (
                <div key={r.label} className="flex flex-col gap-2">
                  <div className="text-[9px] tracking-[0.14em] uppercase text-[#3A3530]">{r.label}</div>
                  <div>
                    <span className="font-['Cormorant_Garamond'] text-[1.6rem] sm:text-[1.8rem] font-light leading-none" style={{ color: r.color }}>
                      {r.value > 0 ? r.value.toLocaleString("hu-HU") : "—"}
                    </span>
                    {r.value > 0 && <span className="text-[11px] ml-1 opacity-50" style={{ color: r.color }}>Ft</span>}
                  </div>
                  <div className="text-[10px] text-[#3A3530]">{r.sub}</div>
                  {/* Arány sáv */}
                  <div className="h-0.5 bg-white/[0.04]">
                    <div className="h-full transition-all duration-700"
                      style={{ width: totalRevenue > 0 ? `${Math.round((r.value / totalRevenue) * 100)}%` : "0%", background: r.color, opacity: 0.5 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Fő tartalom rács ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Bal: közelgő + legutóbbi projektek */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Közelgő események */}
            {upcomingEvents.length > 0 && (
              <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-px bg-[#C8A882]/40" />
                    <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Közelgő események</span>
                  </div>
                  <Link href="/admin/calendar" className="text-[10px] text-[#3A3530] hover:text-[#C8A882] transition-colors">Naptár →</Link>
                </div>
                <div className="flex flex-col gap-1.5">
                  {upcomingEvents.map(({ p, e, date }, i) => {
                    const days     = Math.ceil((date.getTime() - now.getTime()) / 86400000);
                    const isUrgent = days <= 7;
                    const isToday  = days === 0;
                    return (
                      <Link key={`${p.id}-${i}`} href={`/admin/projects/${p.id}`}
                        className="flex items-center gap-3 p-3 border border-white/[0.03] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all group">
                        {/* Dátum doboz */}
                        <div className={`shrink-0 w-11 text-center border py-1.5 ${isUrgent ? "border-[#C8A882]/40 bg-[#C8A882]/8" : "border-white/[0.06]"}`}>
                          <div className="text-[7px] tracking-[0.1em] uppercase" style={{ color: isUrgent ? "#C8A882" : "#3A3530" }}>
                            {HU_MONTHS_SH[date.getMonth()]}
                          </div>
                          <div className="font-['Cormorant_Garamond'] text-[1.5rem] font-light leading-none" style={{ color: isUrgent ? "#C8A882" : "#5A5248" }}>
                            {date.getDate()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-[#D4C4B0] group-hover:text-white transition-colors truncate">{p.name}</div>
                          <div className="text-[10px] text-[#3A3530] mt-0.5 flex items-center gap-1.5">
                            <span>{p.type?.name ?? "—"}</span>
                            <span>·</span>
                            <span>{p.users[0]?.name ?? "—"}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          {isToday
                            ? <span className="inline-flex items-center gap-1 text-[10px] text-[#34D399]"><span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />Ma</span>
                            : <span className="text-[11px]" style={{ color: isUrgent ? "#F87171" : "#3A3530" }}>{days}n</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Legutóbbi projektek */}
            <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-px bg-[#C8A882]/40" />
                  <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Legutóbbi projektek</span>
                </div>
                <Link href="/admin/projects" className="text-[10px] text-[#3A3530] hover:text-[#C8A882] transition-colors">Mind →</Link>
              </div>
              <div className="flex flex-col">
                {recentProjects.length === 0
                  ? <p className="text-[12px] text-[#3A3530] py-3">Nincs projekt</p>
                  : recentProjects.map((p, i) => {
                    const sm = p.status ? STATUS_META[p.status] : null;
                    const pm = p.paymentStatus ? PAYMENT_META[p.paymentStatus] : null;
                    const nextEv = (p.calendarEvents ?? []).find(e => e.startTime && new Date(e.startTime) >= now);
                    return (
                      <Link key={p.id} href={`/admin/projects/${p.id}`}
                        className={`flex items-center gap-3 py-3 border-b border-white/[0.03] last:border-b-0 hover:bg-white/[0.015] -mx-2 px-2 transition-colors group ${i === 0 ? "pt-0" : ""}`}>
                        {/* Státusz csík */}
                        <div className="w-0.5 h-8 rounded-full shrink-0" style={{ background: sm?.color ?? "#3A3530", opacity: 0.6 }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-[#D4C4B0] group-hover:text-white transition-colors truncate">{p.name ?? "—"}</div>
                          <div className="text-[10px] text-[#3A3530] mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>{p.type?.name ?? "—"}</span>
                            <span>·</span>
                            <span>{p.users[0]?.name ?? "—"}</span>
                            {nextEv && (
                              <>
                                <span>·</span>
                                <span className="text-[#C8A882]/60">
                                  {new Date(nextEv.startTime!).toLocaleDateString("hu-HU", { month: "short", day: "numeric" })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {p.totalPrice && (
                            <span className="text-[11px] font-['Cormorant_Garamond'] font-light" style={{ color: pm?.color ?? "#5A5248" }}>
                              {p.totalPrice.toLocaleString("hu-HU")} Ft
                            </span>
                          )}
                          {sm && (
                            <span className="text-[9px] tracking-[0.08em] px-2 py-0.5 border hidden sm:inline"
                              style={{ color: sm.color, borderColor: `${sm.color}30`, background: sm.bg }}>
                              {sm.label}
                            </span>
                          )}
                          <span className="text-[10px] text-[#3A3530]">{timeAgo(p.createdAt)}</span>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Jobb oszlop */}
          <div className="flex flex-col gap-5">

            {/* Lejárt fizetések – ha van */}
            {overdue.length > 0 && (
              <div className="border border-[#F87171]/25 bg-[#F87171]/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.5" className="w-4 h-4 shrink-0">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span className="text-[9px] tracking-[0.2em] uppercase text-[#F87171]/70">{overdue.length} lejárt fizetés</span>
                </div>
                <div className="flex flex-col gap-2">
                  {overdue.slice(0, 4).map(p => (
                    <Link key={p.id} href={`/admin/projects/${p.id}`}
                      className="flex items-center justify-between gap-2 hover:opacity-80 transition-opacity">
                      <span className="text-[12px] text-[#D4C4B0] truncate">{p.name ?? "—"}</span>
                      {p.totalPrice && <span className="text-[11px] text-[#F87171] shrink-0 font-medium">{p.totalPrice.toLocaleString("hu-HU")} Ft</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Típus bontás */}
            {byType.length > 0 && (
              <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-px bg-[#C8A882]/40" />
                  <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Típusonként</span>
                </div>
                <div className="flex flex-col gap-3">
                  {byType.map(([name, count]) => (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-[#5A5248]">{name}</span>
                        <span className="text-[11px] text-[#3A3530]">{count}</span>
                      </div>
                      <div className="h-px bg-white/[0.04]">
                        <div className="h-full bg-[#C8A882]/35 transition-all duration-700"
                          style={{ width: `${Math.round((count / projects.length) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fizetési bontás */}
            {paymentBreakdown.length > 0 && (
              <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-px bg-[#C8A882]/40" />
                  <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Fizetési státuszok</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {paymentBreakdown.map(({ s, count, amount }) => {
                    const v = PAYMENT_META[s];
                    return (
                      <div key={s} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: v.color }} />
                          <span className="text-[11px] text-[#5A5248] truncate">{v.label}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {amount > 0 && <span className="text-[10px]" style={{ color: v.color }}>{amount.toLocaleString("hu-HU")} Ft</span>}
                          <span className="text-[11px] text-[#3A3530] w-4 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Státusz bontás */}
            <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-px bg-[#C8A882]/40" />
                <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Projekt státuszok</span>
              </div>
              <div className="flex flex-col gap-2">
                {(Object.keys(STATUS_META) as ProjectStatus[]).map(s => {
                  const count = projects.filter(p => p.status === s).length;
                  if (count === 0) return null;
                  const v = STATUS_META[s];
                  return (
                    <div key={s} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: v.color }} />
                        <span className="text-[11px] text-[#5A5248]">{v.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-px bg-white/[0.04]">
                          <div className="h-full" style={{ width: `${Math.round((count / projects.length) * 100)}%`, background: v.color, opacity: 0.45 }} />
                        </div>
                        <span className="text-[11px] text-[#3A3530] w-4 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legutóbbi ügyfelek */}
            {recentClients.length > 0 && (
              <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-px bg-[#C8A882]/40" />
                    <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Legutóbbi ügyfelek</span>
                  </div>
                  <Link href="/admin/users" className="text-[10px] text-[#3A3530] hover:text-[#C8A882] transition-colors">Mind →</Link>
                </div>
                <div className="flex flex-col gap-3">
                  {recentClients.map(u => {
                    const userProjects = projects.filter(p => p.users.some(pu => pu.id === u.id));
                    return (
                      <div key={u.id} className="flex items-center gap-3">
                        <div className="w-7 h-7 border border-[#C8A882]/20 flex items-center justify-center font-['Cormorant_Garamond'] text-[13px] text-[#C8A882] shrink-0">
                          {u.name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] text-[#D4C4B0] truncate">{u.name ?? "—"}</div>
                          <div className="text-[10px] text-[#3A3530] truncate">{u.email}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-[#3A3530]">{userProjects.length}p</div>
                          <div className="text-[9px] text-[#3A3530]">{timeAgo(u.createdAt)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Gyors navigáció ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              href: "/admin/projects",
              label: "Projektek",
              count: projects.length,
              sub: `${active.length} aktív`,
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
            },
            {
              href: "/admin/packages",
              label: "Csomagok",
              count: null,
              sub: "kezelés",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
            },
            {
              href: "/admin/calendar",
              label: "Naptár",
              count: upcomingEvents.length,
              sub: "közelgő",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
            },
            {
              href: "/admin/users",
              label: "Ügyfelek",
              count: clients.length,
              sub: "regisztrált",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
            },
          ].map(nav => (
            <Link key={nav.href} href={nav.href}
              className="group bg-[#0E0C0A] border border-white/[0.05] p-4 sm:p-5 flex items-center gap-3 hover:border-[#C8A882]/20 hover:bg-[#C8A882]/5 transition-all">
              <span className="text-[#C8A882]/30 group-hover:text-[#C8A882]/60 transition-colors shrink-0">{nav.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-[#5A5248] group-hover:text-[#D4C4B0] transition-colors">{nav.label}</div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  {nav.count !== null && (
                    <span className="font-['Cormorant_Garamond'] text-[1.4rem] font-light text-[#C8A882] leading-none">{nav.count}</span>
                  )}
                  <span className="text-[9px] text-[#3A3530] tracking-[0.08em]">{nav.sub}</span>
                </div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-[#3A3530] group-hover:text-[#C8A882] transition-colors shrink-0">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          ))}
        </div>

        {/* ── Új projekt gyors gomb ─────────────────────────── */}
        <Link href="/admin/projects"
          className="flex items-center justify-center gap-3 border border-[#C8A882]/20 py-4 text-[11px] tracking-[0.14em] uppercase text-[#C8A882]/50 hover:border-[#C8A882]/40 hover:text-[#C8A882] hover:bg-[#C8A882]/5 transition-all group">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Új projekt létrehozása
        </Link>
      </div>
    </div>
  );
}