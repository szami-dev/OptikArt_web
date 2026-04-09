"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "REFUNDED";

type UserProject = {
  id: number; name: string | null; status: ProjectStatus | null;
  paymentStatus: PaymentStatus | null; totalPrice: number | null;
  createdAt: string;
  type: { name: string | null } | null;
  category: { name: string | null } | null;
  calendarEvents: { startTime: string | null; title: string | null; wholeDay: boolean }[];
  messages: { id: number; content: string | null; createdAt: string; sender: { name: string | null; role: string } }[];
  galleries: { id: number }[];
};

const STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string; border: string }> = {
  PLANNING:    { label: "Tervezés",      color: "#A08060", bg: "#FDF9F5", border: "#EDE8E0" },
  IN_PROGRESS: { label: "Folyamatban",   color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  COMPLETED:   { label: "Elkészült",     color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  ON_HOLD:     { label: "Felfüggesztve", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  CANCELLED:   { label: "Törölve",       color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
};

const PAYMENT_META: Record<PaymentStatus, { label: string; color: string; bg: string; border: string; desc: string }> = {
  PENDING:  { label: "Függőben",      color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", desc: "A fizetés még nem érkezett meg." },
  PAID:     { label: "Fizetve",       color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", desc: "Köszönjük a befizetést!" },
  OVERDUE:  { label: "Lejárt",        color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", desc: "Kérjük rendezd a fizetést." },
  REFUNDED: { label: "Visszatérítve", color: "#7C3AED", bg: "#EEF2FF", border: "#C7D2FE", desc: "Az összeg visszatérítésre került." },
};

const HU_MONTHS    = ["január","február","március","április","május","június","július","augusztus","szeptember","október","november","december"];
const HU_MONTHS_SH = ["jan","feb","már","ápr","máj","jún","júl","aug","szep","okt","nov","dec"];
const HU_DAYS      = ["vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Most";
  if (mins < 60) return `${mins} perce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} órája`;
  return `${Math.floor(hrs / 24)} napja`;
}

export default function UserDashboard() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading]   = useState(true);
  const [now]                   = useState(new Date());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/projects/my");
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Legsürgősebb közelgő esemény az összes projektből
  // calendarEvents lehet undefined ha a /api/projects/my route nem adja vissza
  const nextEvent = projects
    .flatMap(p => (p.calendarEvents ?? []).map(e => ({ p, e, date: new Date(e.startTime!) })))
    .filter(x => x.e.startTime && x.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  const daysUntilNext = nextEvent ? Math.ceil((nextEvent.date.getTime() - now.getTime()) / 86400000) : null;

  // Aktív és lezárt projektek
  const active = projects.filter(p => p.status !== "COMPLETED" && p.status !== "CANCELLED");
  const done   = projects.filter(p => p.status === "COMPLETED" || p.status === "CANCELLED");

  // Legutóbbi admin üzenetek
  const recentAdminMsgs = projects
    .flatMap(p => (p.messages ?? []).filter(m => m.sender.role === "ADMIN").map(m => ({ ...m, projectId: p.id, projectName: p.name })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Lejárt fizetések
  const overdueProjects = projects.filter(p => p.paymentStatus === "OVERDUE");
  const pendingProjects  = projects.filter(p => p.paymentStatus === "PENDING" && p.totalPrice);

  // Olvasatlan üzenetek száma
  const unreadCount = recentAdminMsgs.length;

  const userName = session?.user?.name?.split(" ")[1] ?? "Kedves Ügyfelünk";

  if (loading) return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center gap-3">
      <div className="w-4 h-4 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F4]">

      {/* ── Hero fejléc ── */}
      <div className="bg-[#1A1510] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(#C8A882 1px, transparent 1px), linear-gradient(90deg, #C8A882 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 100% at 100% 50%, rgba(200,168,130,0.08) 0%, transparent 70%)" }} />

        <div className="relative px-5 sm:px-8 lg:px-12 py-8 sm:py-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-5 h-px bg-[#C8A882]/40" />
                  <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Üdvözlünk</span>
                </div>
                <h1 className="font-['Cormorant_Garamond'] text-[2rem] sm:text-[2.8rem] font-light text-white leading-tight mb-2">
                  Szia, <em className="not-italic text-[#C8A882]">{userName}</em>
                </h1>
                <p className="text-[13px] text-white/40">
                  {now.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
                </p>
              </div>

              {/* Következő esemény a fejlécben */}
              {nextEvent && daysUntilNext !== null && (
                <div className="border border-[#C8A882]/20 bg-[#C8A882]/5 px-5 py-4 flex items-center gap-5">
                  <div className="text-center border-r border-[#C8A882]/20 pr-5">
                    <div className="text-[9px] tracking-[0.15em] uppercase text-[#C8A882]/50 mb-0.5">{HU_MONTHS_SH[nextEvent.date.getMonth()]}</div>
                    <div className="font-['Cormorant_Garamond'] text-[2.8rem] font-light text-[#C8A882] leading-none">{nextEvent.date.getDate()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.12em] uppercase text-[#C8A882]/50 mb-1">{HU_DAYS[nextEvent.date.getDay()]}</div>
                    <div className="text-[14px] text-white font-light">{nextEvent.p.name}</div>
                    <div className="text-[11px] text-white/40 mt-0.5">
                      {daysUntilNext === 0 ? "Ma!" : `${daysUntilNext} nap múlva`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mini stat sor */}
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/[0.06]">
              {[
                { n: projects.length,        l: "Projekt" },
                { n: active.length,          l: "Aktív" },
                { n: unreadCount,            l: "Üzenet" },
                { n: projects.reduce((s, p) => s + (p.galleries ?? []).length, 0), l: "Galéria" },
              ].map(s => (
                <div key={s.l}>
                  <div className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#C8A882] leading-none">{s.n}</div>
                  <div className="text-[9px] tracking-[0.12em] uppercase text-white/30 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-6 sm:py-8 flex flex-col gap-6">

        {/* ── Figyelmeztetések ── */}
        {overdueProjects.length > 0 && (
          <div className="border border-[#FECACA] bg-[#FEF2F2] p-4 flex items-start gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" className="w-4 h-4 shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div className="flex-1">
              <div className="text-[12px] font-medium text-[#DC2626] mb-1">Lejárt fizetés</div>
              <div className="text-[12px] text-[#7A6A58]">
                {overdueProjects.map(p => p.name).join(", ")} – kérjük vedd fel velünk a kapcsolatot.
              </div>
            </div>
            <Link href={`/user/projects/${overdueProjects[0].id}`} className="shrink-0 text-[11px] tracking-[0.08em] uppercase text-[#DC2626] border border-[#FECACA] px-3 py-1.5 hover:bg-[#DC2626] hover:text-white transition-all whitespace-nowrap">
              Megnyit →
            </Link>
          </div>
        )}

        {/* ── Közelgő esemény (ha van, részletesen) ── */}
        {nextEvent && daysUntilNext !== null && daysUntilNext <= 30 && (
          <div className="bg-white border border-[#EDE8E0] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#EDE8E0] flex items-center gap-2">
              <div className="w-4 h-px bg-[#C8A882]" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]">Hamarosan</span>
            </div>
            <div className="p-5 flex items-center gap-5">
              <div className="flex flex-col items-center border border-[#EDE8E0] px-4 py-3 shrink-0">
                <span className="text-[9px] tracking-[0.12em] uppercase text-[#A08060]">{HU_MONTHS[nextEvent.date.getMonth()]}</span>
                <span className="font-['Cormorant_Garamond'] text-[3rem] font-light text-[#1A1510] leading-none">{nextEvent.date.getDate()}</span>
                <span className="text-[9px] tracking-[0.1em] uppercase text-[#A08060]">{nextEvent.date.getFullYear()}</span>
              </div>
              <div className="flex-1">
                <div className="text-[10px] tracking-[0.14em] uppercase text-[#C8A882] mb-1">{HU_DAYS[nextEvent.date.getDay()]}</div>
                <div className="font-['Cormorant_Garamond'] text-[1.4rem] font-light text-[#1A1510]">{nextEvent.p.name}</div>
                <div className="text-[12px] text-[#A08060] mt-0.5">{nextEvent.e.title ?? "Fotózás"}</div>
              </div>
              <div className="text-right shrink-0">
                {daysUntilNext === 0 ? (
                  <div className="inline-flex items-center gap-2 border border-green-200 bg-green-50 px-3 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[11px] text-green-700 font-medium">Ma!</span>
                  </div>
                ) : (
                  <>
                    <div className="font-['Cormorant_Garamond'] text-[2.8rem] font-light text-[#C8A882] leading-none">{daysUntilNext}</div>
                    <div className="text-[10px] tracking-[0.1em] uppercase text-[#A08060]">nap múlva</div>
                  </>
                )}
              </div>
            </div>
            <div className="px-5 py-3 border-t border-[#EDE8E0] bg-[#FAF8F4]">
              <Link href={`/user/projects/${nextEvent.p.id}`} className="text-[11px] tracking-[0.08em] uppercase text-[#A08060] hover:text-[#C8A882] transition-colors">
                Projekt megtekintése →
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* ── Aktív projektek ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#A08060]">Aktív projektek</span>
              <div className="flex-1 h-px bg-[#EDE8E0]" />
              <Link href="/user/projects" className="text-[10px] text-[#A08060] hover:text-[#C8A882] transition-colors">Mind →</Link>
            </div>

            {active.length === 0 ? (
              <div className="bg-white border border-dashed border-[#EDE8E0] p-6 text-center">
                <p className="text-[13px] text-[#C8B8A0] mb-3">Nincs aktív projekted</p>
                <Link href="/contact" className="text-[11px] tracking-[0.1em] uppercase text-[#C8A882] border-b border-[#C8A882]/30 pb-0.5">
                  Új projekt igénylése →
                </Link>
              </div>
            ) : active.map(p => {
              const sm = p.status ? STATUS_META[p.status] : null;
              const pm = p.paymentStatus ? PAYMENT_META[p.paymentStatus] : null;
              const nextEv = (p.calendarEvents ?? []).find(e => e.startTime && new Date(e.startTime) >= now);
              const hasUnread = (p.messages ?? []).some(m => m.sender.role === "ADMIN");

              return (
                <Link key={p.id} href={`/user/projects/${p.id}`}
                  className="group bg-white border border-[#EDE8E0] p-4 hover:border-[#C8A882]/40 hover:shadow-sm transition-all block">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] text-[#1A1510] font-medium truncate">{p.name ?? "—"}</span>
                        {hasUnread && <span className="w-2 h-2 rounded-full bg-[#C8A882] shrink-0" />}
                      </div>
                      <div className="text-[11px] text-[#A08060] mt-0.5">{p.type?.name ?? "—"}</div>
                    </div>
                    {sm && (
                      <span className="text-[9px] tracking-[0.08em] px-2 py-1 border shrink-0 font-medium"
                        style={{ color: sm.color, background: sm.bg, borderColor: sm.border }}>{sm.label}</span>
                    )}
                  </div>

                  {nextEv && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#EDE8E0]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.5" className="w-3 h-3 shrink-0"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span className="text-[11px] text-[#A08060]">
                        {new Date(nextEv.startTime!).toLocaleDateString("hu-HU", { month: "long", day: "numeric" })}
                      </span>
                    </div>
                  )}

                  {pm && p.totalPrice != null && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EDE8E0]">
                      <span className="text-[11px]" style={{ color: pm.color }}>{pm.label}</span>
                      <span className="font-['Cormorant_Garamond'] text-[1.1rem] font-light text-[#1A1510]">
                        {p.totalPrice.toLocaleString("hu-HU")} Ft
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}

            {/* Új projekt gomb */}
            <Link href="/contact"
              className="group flex items-center justify-center gap-2 border border-dashed border-[#EDE8E0] py-4 text-[11px] tracking-[0.1em] uppercase text-[#C8B8A0] hover:border-[#C8A882]/40 hover:text-[#C8A882] transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Új projekt igénylése
            </Link>
          </div>

          {/* ── Jobb oldal ── */}
          <div className="flex flex-col gap-5">

            {/* Legutóbbi üzenetek */}
            <div className="bg-white border border-[#EDE8E0] overflow-hidden">
              <div className="px-5 py-3 border-b border-[#EDE8E0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-px bg-[#C8A882]" />
                  <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]">Üzenetek</span>
                  {unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-[#C8A882]" />}
                </div>
              </div>
              <div className="divide-y divide-[#EDE8E0]">
                {recentAdminMsgs.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <p className="text-[12px] text-[#C8B8A0]">Nincsenek üzenetek</p>
                  </div>
                ) : recentAdminMsgs.map(m => (
                  <Link key={m.id} href={`/user/projects/${m.projectId}?tab=messages`}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#FAF8F4] transition-colors">
                    <div className="w-7 h-7 bg-[#1A1510] flex items-center justify-center shrink-0 font-['Cormorant_Garamond'] text-[12px] text-[#C8A882] mt-0.5">
                      {m.sender.name?.charAt(0).toUpperCase() ?? "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[12px] text-[#1A1510] font-medium">{m.sender.name}</span>
                        <span className="text-[10px] text-[#C8B8A0] shrink-0">{timeAgo(m.createdAt)}</span>
                      </div>
                      <p className="text-[11px] text-[#7A6A58] truncate">{m.content ?? "—"}</p>
                      <p className="text-[10px] text-[#C8B8A0] mt-0.5 truncate">{(m as any).projectName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Fizetési összesítő */}
            {(pendingProjects.length > 0 || projects.some(p => p.paymentStatus === "PAID")) && (
              <div className="bg-white border border-[#EDE8E0] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-px bg-[#C8A882]" />
                  <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]">Fizetések</span>
                </div>
                <div className="flex flex-col gap-3">
                  {projects.filter(p => p.totalPrice != null && p.paymentStatus != null).map(p => {
                    const pm = PAYMENT_META[p.paymentStatus!];
                    return (
                      <Link key={p.id} href={`/user/projects/${p.id}`}
                        className="flex items-center justify-between gap-3 hover:opacity-80 transition-opacity">
                        <div className="min-w-0">
                          <div className="text-[12px] text-[#1A1510] truncate">{p.name}</div>
                          <span className="text-[10px] px-2 py-0.5 border"
                            style={{ color: pm.color, borderColor: pm.border, background: pm.bg }}>{pm.label}</span>
                        </div>
                        <div className="font-['Cormorant_Garamond'] text-[1.2rem] font-light text-[#1A1510] shrink-0">
                          {p.totalPrice!.toLocaleString("hu-HU")} Ft
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lezárt projektek */}
            {done.length > 0 && (
              <div className="bg-white border border-[#EDE8E0] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-px bg-[#C8A882]" />
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]">Korábbi projektek</span>
                  </div>
                  <span className="text-[10px] text-[#C8B8A0]">{done.length} db</span>
                </div>
                <div className="flex flex-col gap-2">
                  {done.slice(0, 3).map(p => (
                    <Link key={p.id} href={`/user/projects/${p.id}`}
                      className="flex items-center justify-between gap-2 hover:opacity-70 transition-opacity">
                      <div className="min-w-0">
                        <div className="text-[12px] text-[#7A6A58] truncate">{p.name}</div>
                        <div className="text-[10px] text-[#C8B8A0]">{new Date(p.createdAt).toLocaleDateString("hu-HU", { year: "numeric", month: "short" })}</div>
                      </div>
                      <span className="text-[9px] tracking-[0.08em] px-1.5 py-0.5 border border-green-200 bg-green-50 text-green-600 shrink-0">Kész</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Gyors navigáció ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: "/user/projects", label: "Projektjeim", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, count: projects.length },
            { href: "/contact",       label: "Új foglalás",  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
            { href: "/user/calendar", label: "Naptáram",     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
          ].map(nav => (
            <Link key={nav.href} href={nav.href}
              className="group bg-white border border-[#EDE8E0] p-4 flex flex-col items-center gap-2 text-center hover:border-[#C8A882]/40 hover:shadow-sm transition-all">
              <span className="text-[#C8A882]/50 group-hover:text-[#C8A882] transition-colors">{nav.icon}</span>
              <span className="text-[11px] tracking-[0.08em] uppercase text-[#A08060] group-hover:text-[#1A1510] transition-colors">{nav.label}</span>
              {nav.count !== undefined && (
                <span className="font-['Cormorant_Garamond'] text-[1.3rem] font-light text-[#C8A882] leading-none">{nav.count}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}