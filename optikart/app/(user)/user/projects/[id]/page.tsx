"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "REFUNDED";
type Tab           = "overview" | "messages" | "gallery" | "calendar";

type Project = {
  id: number; name: string | null; description: string | null;
  status: ProjectStatus | null; paymentStatus: PaymentStatus | null;
  totalPrice: number | null; createdAt: string;
  type: { name: string | null } | null;
  category: { name: string | null; bulletPoints: { id: number; title: string | null }[] } | null;
  calendarEvents: { id: number; title: string | null; startTime: string | null; endTime: string | null; wholeDay: boolean }[];
  galleries: { id: number; title: string | null; shareableLink: string | null; expiresAt: string | null; images: { id: number; fileName: string | null; filePath: string | null }[] }[];
  messages: { id: number; content: string | null; createdAt: string; sender: { id: number; name: string | null; role: string }; receiver: { id: number; name: string | null; role: string } }[];
};

const STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string; border: string }> = {
  PLANNING:    { label: "Tervezés",      color: "#A08060", bg: "#FDF9F5", border: "#EDE8E0" },
  IN_PROGRESS: { label: "Folyamatban",   color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  COMPLETED:   { label: "Elkészült",     color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  ON_HOLD:     { label: "Felfüggesztve", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  CANCELLED:   { label: "Törölve",       color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
};
const PAYMENT_META: Record<PaymentStatus, { label: string; color: string; bg: string; border: string; desc: string }> = {
  PENDING:  { label: "Függőben",      color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", desc: "A fizetés még nem érkezett meg. Kérdés esetén írj nekünk üzenetet." },
  PAID:     { label: "Fizetve",       color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", desc: "A fizetés sikeresen megérkezett. Köszönjük!" },
  OVERDUE:  { label: "Lejárt",        color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", desc: "A fizetési határidő lejárt. Kérjük vedd fel velünk a kapcsolatot." },
  REFUNDED: { label: "Visszatérítve", color: "#7C3AED", bg: "#EEF2FF", border: "#C7D2FE", desc: "Az összeg visszatérítésre került." },
};
const STATUS_STEPS: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "COMPLETED"];
const HU_MONTHS = ["január","február","március","április","május","június","július","augusztus","szeptember","október","november","december"];
const HU_DAYS   = ["vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"];

function StatusProgress({ status }: { status: ProjectStatus | null }) {
  if (!status || status === "CANCELLED" || status === "ON_HOLD") return null;
  const idx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center">
      {STATUS_STEPS.map((s, i) => {
        const done = i <= idx; const m = STATUS_META[s];
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-6 h-6 flex items-center justify-center border text-[10px] transition-all"
                style={done ? { borderColor: m.color, background: m.bg, color: m.color } : { borderColor: "#EDE8E0", color: "#C8B8A0" }}>
                {done ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg> : i + 1}
              </div>
              <span className="text-[9px] tracking-[0.08em] whitespace-nowrap" style={done ? { color: m.color } : { color: "#C8B8A0" }}>{m.label}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && <div className="flex-1 h-px mx-2 mb-4" style={{ background: i < idx ? "rgba(200,168,130,0.3)" : "#EDE8E0" }} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Nagy esemény dátum hero (user – sötét háttér, világos oldal kontrasztja) ──
function EventDateHero({ event }: { event: Project["calendarEvents"][0] }) {
  if (!event.startTime) return null;
  const d         = new Date(event.startTime);
  const now       = new Date();
  const daysUntil = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  const isPast    = daysUntil < 0;
  const isToday   = daysUntil === 0;

  return (
    <div className="bg-[#1A1510] relative overflow-hidden">
      {/* grid háttér */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "linear-gradient(#C8A882 1px,transparent 1px),linear-gradient(90deg,#C8A882 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 100% at 0% 50%,rgba(200,168,130,0.07) 0%,transparent 70%)" }} />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 p-5 sm:p-7">
        {/* Bal: nap + cím */}
        <div className="flex items-center gap-5">
          {/* Nagy nap doboz */}
          <div className="flex flex-col items-center border border-[#C8A882]/25 bg-[#C8A882]/8 px-5 py-3 min-w-[76px] shrink-0">
            <span className="text-[9px] tracking-[0.18em] uppercase text-[#C8A882]/50">{d.getFullYear()}</span>
            <span className="font-['Cormorant_Garamond'] text-[4rem] font-light text-white leading-none">{d.getDate()}</span>
            <span className="text-[11px] tracking-[0.08em] uppercase text-[#C8A882]">{HU_MONTHS[d.getMonth()]}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/40">{HU_DAYS[d.getDay()]}</span>
            <span className="font-['Cormorant_Garamond'] text-[1.3rem] font-light text-white leading-tight">
              {event.title ?? "Fotózás napja"}
            </span>
            <span className="text-[11px] text-white/35">
              {event.wholeDay ? "Egész napos esemény" : d.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Jobb: visszaszámláló */}
        <div className="sm:ml-auto shrink-0 sm:text-right">
          {isToday ? (
            <div className="inline-flex items-center gap-2 border border-green-500/30 bg-green-500/10 px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[12px] tracking-[0.1em] uppercase text-green-400 font-medium">Ma van!</span>
            </div>
          ) : isPast ? (
            <div>
              <div className="text-[10px] tracking-[0.12em] uppercase text-white/25 mb-0.5">Lezajlott</div>
              <div className="font-['Cormorant_Garamond'] text-[1.8rem] font-light text-white/30 leading-none">{Math.abs(daysUntil)} napja</div>
            </div>
          ) : (
            <div>
              <div className="text-[9px] tracking-[0.15em] uppercase text-[#C8A882]/40 mb-0.5">Visszaszámláló</div>
              <div className="font-['Cormorant_Garamond'] text-[3.5rem] sm:text-[4rem] font-light text-[#C8A882] leading-none">{daysUntil}</div>
              <div className="text-[10px] tracking-[0.12em] uppercase text-[#C8A882]/50">nap múlva</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserProjectDetailPage() {
  const { id }          = useParams<{ id: string }>();
  const { data: session } = useSession();

  const [project, setProject]   = useState<Project | null>(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>("overview");
  const [notFound, setNotFound] = useState(false);
  const [msgContent, setMsgContent] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgError, setMsgError]     = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const myId = parseInt(session?.user?.id as string ?? "0");

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}/user`);
      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok) throw new Error();
      setProject((await res.json()).project);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);
  useEffect(() => {
    if (tab === "messages") setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [tab, project?.messages?.length]);

  async function sendMessage() {
    if (!msgContent.trim()) return;
    setMsgError(""); setSendingMsg(true);
    try {
      const adminRes  = await fetch("/api/user/getusers");
      const adminData = await adminRes.json();
      const admin     = adminData.users?.find((u: any) => u.role === "ADMIN" && u.id !== myId);
      if (!admin) throw new Error("Nem található adminisztrátor");
      const res = await fetch(`/api/projects/${id}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msgContent.trim(), receiverId: admin.id }),
      });
      if (!res.ok) throw new Error();
      setMsgContent(""); await fetchProject();
    } catch (e: any) { setMsgError(e.message ?? "Hiba az üzenet küldésekor"); }
    finally { setSendingMsg(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
    </div>
  );
  if (notFound || !project) return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6">
      <div className="text-center">
        <h2 className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#1A1510] mb-3">Projekt nem található</h2>
        <p className="text-[13px] text-[#A08060] mb-6">Lehet hogy töröltük, vagy nem rendelkezel hozzáféréssel.</p>
        <Link href="/user/projects" className="text-[11px] tracking-[0.12em] uppercase text-[#C8A882] border-b border-[#C8A882]/30 pb-0.5">← Vissza</Link>
      </div>
    </div>
  );

  const status      = project.status ?? "PLANNING";
  const sm          = STATUS_META[status];
  const ps          = project.paymentStatus;
  const pm          = ps ? PAYMENT_META[ps] : null;
  const unreadCount = project.messages.filter(m => m.sender.role === "ADMIN").length;
  const now         = new Date();

  // Elsődleges esemény: első jövőbeli, különben utolsó
  const primaryEvent = (project.calendarEvents ?? [])
    .filter(e => e.startTime)
    .sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime())
    .find(e => new Date(e.startTime!) >= now)
    ?? project.calendarEvents[project.calendarEvents.length - 1];

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview",  label: "Áttekintés" },
    { key: "messages",  label: "Üzenetek",  count: project.messages.length },
    { key: "gallery",   label: "Galéria",   count: project.galleries.length },
    { key: "calendar",  label: "Naptár",    count: project.calendarEvents.length },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F4]">

      {/* Top nav */}
      <div className="bg-white border-b border-[#EDE8E0] px-5 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="py-5 sm:py-6">
            <Link href="/user/projects" className="inline-flex items-center gap-2 text-[11px] tracking-[0.08em] text-[#A08060] hover:text-[#1A1510] transition-colors mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Projektek
            </Link>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <h1 className="font-['Cormorant_Garamond'] text-[1.6rem] sm:text-[2rem] font-light text-[#1A1510] leading-tight mb-1 truncate">
                  {project.name ?? "Névtelen projekt"}
                </h1>
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#A08060]">
                  <span>#{project.id}</span>
                  {project.type?.name && <><span>·</span><span>{project.type.name}</span></>}
                  <span>·</span>
                  <span>{new Date(project.createdAt).toLocaleDateString("hu-HU")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <span className="text-[10px] tracking-[0.08em] px-3 py-1.5 border font-medium"
                  style={{ color: sm.color, background: sm.bg, borderColor: sm.border }}>{sm.label}</span>
                {pm && <span className="text-[10px] tracking-[0.08em] px-3 py-1.5 border font-medium"
                  style={{ color: pm.color, background: pm.bg, borderColor: pm.border }}>{pm.label}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-0 overflow-x-auto scrollbar-none -mb-px">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-[11px] tracking-[0.08em] uppercase border-b-2 transition-all whitespace-nowrap ${tab === t.key ? "border-[#C8A882] text-[#1A1510]" : "border-transparent text-[#A08060] hover:text-[#1A1510]"}`}>
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-[#C8A882]/15 text-[#C8A882]" : "bg-[#EDE8E0] text-[#A08060]"}`}>{t.count}</span>
                )}
                {t.key === "messages" && unreadCount > 0 && tab !== "messages" && <span className="w-2 h-2 rounded-full bg-[#C8A882]" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-6 sm:py-8">

        {/* ═══ OVERVIEW ══════════════════════════════ */}
        {tab === "overview" && (
          <div className="flex flex-col gap-5">

            {/* ── ESEMÉNY DÁTUM HERO ── */}
            {primaryEvent && <EventDateHero event={primaryEvent} />}

            {/* Státusz progress */}
            {status !== "CANCELLED" && status !== "ON_HOLD" && (
              <div className="bg-white border border-[#EDE8E0] p-5 sm:p-6">
                <div className="text-[10px] tracking-[0.16em] uppercase text-[#A08060] mb-5">Projekt állapota</div>
                <StatusProgress status={project.status} />
              </div>
            )}

            {(status === "ON_HOLD" || status === "CANCELLED") && (
              <div className="bg-white border p-5 flex items-center gap-4" style={{ borderColor: sm.border }}>
                <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: sm.bg }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={sm.color} strokeWidth="1.5" className="w-5 h-5">
                    {status === "ON_HOLD" ? <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></> : <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>}
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-medium" style={{ color: sm.color }}>{sm.label}</div>
                  <div className="text-[12px] text-[#7A6A58] mt-0.5">{status === "ON_HOLD" ? "A projekt szünetel. Vedd fel velünk a kapcsolatot." : "Ez a projekt le lett zárva."}</div>
                </div>
              </div>
            )}

            {/* Fizetési kártya */}
            {(project.totalPrice != null || pm) && (
              <div className="bg-white border p-5 sm:p-6" style={{ borderColor: pm ? pm.border : "#EDE8E0" }}>
                <div className="text-[10px] tracking-[0.16em] uppercase text-[#A08060] mb-4">Fizetési információk</div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  {project.totalPrice != null && (
                    <div className="flex-1">
                      <div className="text-[9px] tracking-[0.14em] uppercase text-[#C8B8A0] mb-1.5">Fizetendő összeg</div>
                      <div className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#1A1510] leading-none">
                        {project.totalPrice.toLocaleString("hu-HU")} Ft
                      </div>
                    </div>
                  )}
                  {pm && (
                    <div className="flex-1">
                      <div className="text-[9px] tracking-[0.14em] uppercase text-[#C8B8A0] mb-2">Fizetési státusz</div>
                      <span className="inline-flex items-center gap-2 text-[11px] px-3 py-1.5 border font-medium mb-3"
                        style={{ color: pm.color, background: pm.bg, borderColor: pm.border }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: pm.color }} />{pm.label}
                      </span>
                      <p className="text-[12px] text-[#7A6A58] leading-relaxed">{pm.desc}</p>
                    </div>
                  )}
                </div>
                {(ps === "PENDING" || ps === "OVERDUE") && (
                  <div className="mt-4 pt-4 border-t border-[#EDE8E0]">
                    <button onClick={() => setTab("messages")}
                      className="inline-flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-[#1A1510] border border-[#EDE8E0] px-4 py-2 hover:border-[#C8A882]/50 hover:text-[#C8A882] transition-all">
                      Kérdésem van a fizetéssel kapcsolatban →
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-[#EDE8E0] p-5">
                <div className="text-[10px] tracking-[0.16em] uppercase text-[#A08060] mb-4">Projekt adatok</div>
                <div className="flex flex-col gap-4">
                  {[{ l: "Típus", v: project.type?.name ?? "—" }, { l: "Csomag", v: project.category?.name ?? "—" }, { l: "Létrehozva", v: new Date(project.createdAt).toLocaleDateString("hu-HU") }].map(row => (
                    <div key={row.l}>
                      <div className="text-[9px] tracking-[0.14em] uppercase text-[#C8B8A0] mb-0.5">{row.l}</div>
                      <div className="text-[13px] text-[#1A1510]">{row.v}</div>
                    </div>
                  ))}
                  {project.category?.bulletPoints && project.category.bulletPoints.length > 0 && (
                    <div>
                      <div className="text-[9px] tracking-[0.14em] uppercase text-[#C8B8A0] mb-2">Csomag tartalmaz</div>
                      {project.category.bulletPoints.map(bp => (
                        <div key={bp.id} className="flex items-center gap-2 mb-1">
                          <span className="w-1 h-1 rounded-full bg-[#C8A882]/60 shrink-0" />
                          <span className="text-[12px] text-[#7A6A58]">{bp.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white border border-[#EDE8E0] p-5">
                <div className="text-[10px] tracking-[0.16em] uppercase text-[#A08060] mb-4">Leírás</div>
                <p className="text-[13px] text-[#7A6A58] leading-relaxed whitespace-pre-wrap">{project.description ?? "Nincs leírás"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                { tab: "messages" as Tab, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label: "Üzenetek", count: project.messages.length, cta: "Üzenet írása" },
                { tab: "gallery" as Tab,  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, label: "Galéria", count: project.galleries.length, cta: "Képek megtekintése" },
                { tab: "calendar" as Tab, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: "Naptár", count: project.calendarEvents.length, cta: "Időpontok" },
              ] as const).map(item => (
                <button key={item.tab} onClick={() => setTab(item.tab)}
                  className="group bg-white border border-[#EDE8E0] p-4 text-left hover:border-[#C8A882]/40 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#C8A882]/60 group-hover:text-[#C8A882] transition-colors">{item.icon}</span>
                    <span className="font-['Cormorant_Garamond'] text-[1.4rem] font-light text-[#C8A882]">{item.count}</span>
                  </div>
                  <div className="text-[11px] text-[#1A1510] font-medium mb-0.5">{item.label}</div>
                  <div className="text-[10px] text-[#A08060] group-hover:text-[#C8A882] transition-colors">{item.cta} →</div>
                </button>
              ))}
            </div>

            <div className="bg-[#F5EFE6] border border-[#EDE8E0] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="text-[11px] font-medium text-[#1A1510] mb-1">Kérdésed van?</div>
                <p className="text-[12px] text-[#7A6A58]">Írj nekünk az üzenetek fülön, és 24 órán belül válaszolunk.</p>
              </div>
              <button onClick={() => setTab("messages")}
                className="shrink-0 flex items-center gap-2 bg-[#1A1510] text-white text-[11px] tracking-[0.12em] uppercase px-5 py-2.5 hover:bg-[#C8A882] transition-all whitespace-nowrap">
                Üzenet írása <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* ═══ MESSAGES ══════════════════════════════ */}
        {tab === "messages" && (
          <div className="flex flex-col gap-4" style={{ maxWidth: "640px" }}>
            <div className="bg-white border border-[#EDE8E0] flex flex-col overflow-hidden" style={{ minHeight: "360px", maxHeight: "520px" }}>
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                {project.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#EDE8E0" strokeWidth="1.2" className="w-8 h-8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span className="text-[12px] text-[#C8B8A0]">Még nincs üzenet</span>
                  </div>
                ) : project.messages.map(msg => {
                  const isMe = msg.sender.id === myId;
                  return (
                    <div key={msg.id} className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                      {!isMe && (
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div className="w-5 h-5 bg-[#1A1510] flex items-center justify-center">
                            <span className="text-[8px] text-white font-medium">{msg.sender.name?.charAt(0).toUpperCase() ?? "A"}</span>
                          </div>
                          <span className="text-[10px] text-[#A08060] font-medium">{msg.sender.name}</span>
                          <span className="text-[9px] text-[#C8B8A0]">· OptikArt csapat</span>
                        </div>
                      )}
                      <div className={`max-w-[85%] px-4 py-3 text-[13px] leading-relaxed ${isMe ? "bg-[#1A1510] text-white" : "bg-[#FAF8F4] border border-[#EDE8E0] text-[#1A1510]"}`}>
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-[#C8B8A0]">
                        {new Date(msg.createdAt).toLocaleString("hu-HU", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-[#EDE8E0] p-4 flex gap-3">
                <input value={msgContent} onChange={e => setMsgContent(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Írj üzenetet..."
                  className="flex-1 bg-[#FAF8F4] border border-[#EDE8E0] text-[13px] text-[#1A1510] placeholder:text-[#C8B8A0] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/50 transition-colors" />
                <button onClick={sendMessage} disabled={sendingMsg || !msgContent.trim()}
                  className="px-5 py-2.5 bg-[#1A1510] text-[11px] tracking-[0.1em] uppercase text-white hover:bg-[#C8A882] transition-all disabled:opacity-40">
                  {sendingMsg ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>}
                </button>
              </div>
            </div>
            {msgError && <p className="text-[11px] text-red-500">{msgError}</p>}
            <p className="text-[11px] text-[#C8B8A0]">Üzeneteidre 24 órán belül válaszolunk.</p>
          </div>
        )}

        {/* ═══ GALLERY ═══════════════════════════════ */}
        {tab === "gallery" && (
          <div className="flex flex-col gap-5">
            {project.galleries.length === 0 ? (
              <div className="bg-white border border-[#EDE8E0] p-12 text-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#EDE8E0" strokeWidth="1.2" className="w-10 h-10 mx-auto mb-4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <p className="text-[13px] text-[#A08060] mb-1">Még nincs galéria</p>
                <p className="text-[11px] text-[#C8B8A0]">A kész anyagokat ide töltjük majd fel.</p>
              </div>
            ) : project.galleries.map(gallery => (
              <div key={gallery.id} className="bg-white border border-[#EDE8E0] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#EDE8E0] flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-medium text-[#1A1510]">{gallery.title ?? "Galéria"}</div>
                    <div className="text-[11px] text-[#A08060] mt-0.5">{gallery.images.length} kép{gallery.expiresAt && ` · Elérhető: ${new Date(gallery.expiresAt).toLocaleDateString("hu-HU")}-ig`}</div>
                  </div>
                  {gallery.shareableLink && (
                    <a href={gallery.shareableLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-[#C8A882] border border-[#C8A882]/30 px-3 py-1.5 hover:bg-[#C8A882]/5 transition-all whitespace-nowrap">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Megnyitás
                    </a>
                  )}
                </div>
                {gallery.images.length > 0 ? (
                  <div className="p-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                      {gallery.images.slice(0, 12).map(img => (
                        <div key={img.id} className="relative bg-[#FAF8F4] overflow-hidden border border-[#EDE8E0]" style={{ aspectRatio: "1/1" }}>
                          {img.filePath ? <Image src={img.filePath} alt={img.fileName ?? ""} fill className="object-cover" sizes="120px" /> : <div className="w-full h-full flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="#EDE8E0" strokeWidth="1" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>}
                        </div>
                      ))}
                      {gallery.images.length > 12 && <div className="relative bg-[#F5EFE6] border border-[#EDE8E0] flex items-center justify-center" style={{ aspectRatio: "1/1" }}><span className="text-[11px] text-[#A08060]">+{gallery.images.length - 12}</span></div>}
                    </div>
                  </div>
                ) : <div className="px-5 py-8 text-center"><p className="text-[12px] text-[#C8B8A0]">Nincs feltöltött kép.</p></div>}
              </div>
            ))}
          </div>
        )}

        {/* ═══ CALENDAR ══════════════════════════════ */}
        {tab === "calendar" && (
          <div className="flex flex-col gap-3">
            {project.calendarEvents.length === 0 ? (
              <div className="bg-white border border-[#EDE8E0] p-12 text-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#EDE8E0" strokeWidth="1.2" className="w-10 h-10 mx-auto mb-4"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <p className="text-[13px] text-[#A08060]">Még nincs ütemezett esemény</p>
              </div>
            ) : project.calendarEvents.map(ev => {
              const start = ev.startTime ? new Date(ev.startTime) : null;
              return (
                <div key={ev.id} className="bg-white border border-[#EDE8E0] p-4 sm:p-5 flex items-start gap-4">
                  {start && (
                    <div className="shrink-0 w-12 text-center border border-[#EDE8E0] py-1.5">
                      <div className="text-[9px] tracking-[0.1em] uppercase text-[#A08060]">{start.toLocaleDateString("hu-HU", { month: "short" })}</div>
                      <div className="font-['Cormorant_Garamond'] text-[1.4rem] font-light text-[#1A1510] leading-none">{start.getDate()}</div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#1A1510] mb-0.5">{ev.title ?? "Névtelen esemény"}</div>
                    <div className="text-[11px] text-[#A08060]">
                      {ev.wholeDay ? "Egész napos esemény" : [start && start.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" }), ev.endTime && `– ${new Date(ev.endTime).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}`].filter(Boolean).join(" ")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}