"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AdminGalleryManager from "@/app/components/AdminGalleryManager";

type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "REFUNDED";
type Tab           = "overview" | "messages" | "gallery" | "calendar";

type Project = {
  id: number; name: string | null; description: string | null;
  status: ProjectStatus | null; paymentStatus: PaymentStatus | null;
  totalPrice: number | null; createdAt: string; updatedAt: string | null;
  eventDate: string | null;
  users: { id: number; name: string | null; email: string; phone: string | null }[];
  type: { id: number; name: string | null } | null;
  category: { id: number; name: string | null; bulletPoints: { id: number; title: string | null }[] } | null;
  calendarEvents: { id: number; title: string | null; startTime: string | null; endTime: string | null; wholeDay: boolean }[];
  galleries: {
    id: number; title: string | null; description: string | null; coverImageUrl: string | null;
    shareToken: string; isPublic: boolean; password: string | null; hasPassword: boolean;
    expiresAt: string | null; shareableLink: string | null; images: any[]; imagesFull: any[];
  }[];
  messages: any[];
};

const STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  PLANNING:    { label: "Tervezés",      color: "#C8A882", bg: "rgba(200,168,130,0.1)" },
  IN_PROGRESS: { label: "Folyamatban",   color: "#60A5FA", bg: "rgba(96,165,250,0.1)" },
  COMPLETED:   { label: "Kész",          color: "#34D399", bg: "rgba(52,211,153,0.1)" },
  ON_HOLD:     { label: "Felfüggesztve", color: "#FBBF24", bg: "rgba(251,191,36,0.1)" },
  CANCELLED:   { label: "Törölve",       color: "#F87171", bg: "rgba(248,113,113,0.1)" },
};
const PAYMENT_META: Record<PaymentStatus, { label: string; color: string; bg: string; desc: string }> = {
  PENDING:  { label: "Függőben",      color: "#FBBF24", bg: "rgba(251,191,36,0.1)",  desc: "A fizetés még nem érkezett meg." },
  PAID:     { label: "Fizetve",       color: "#34D399", bg: "rgba(52,211,153,0.1)",  desc: "A fizetés sikeresen megérkezett." },
  OVERDUE:  { label: "Lejárt",        color: "#F87171", bg: "rgba(248,113,113,0.1)", desc: "A fizetési határidő lejárt." },
  REFUNDED: { label: "Visszatérítve", color: "#A78BFA", bg: "rgba(167,139,250,0.1)", desc: "Az összeg visszatérítésre került." },
};
const STATUSES         = Object.keys(STATUS_META) as ProjectStatus[];
const PAYMENT_STATUSES = Object.keys(PAYMENT_META) as PaymentStatus[];
const HU_MONTHS    = ["január","február","március","április","május","június","július","augusztus","szeptember","október","november","december"];
const HU_MONTHS_SH = ["jan","feb","már","ápr","máj","jún","júl","aug","szep","okt","nov","dec"];
const HU_DAYS      = ["vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"];

function Toast({ msg, type, onClose }: { msg:string; type:"success"|"error"; onClose:()=>void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-4 right-4 z-[200] flex items-center gap-3 px-4 py-3 border text-[13px] max-w-sm ${type==="success"?"bg-[#0E0C0A] border-[#C8A882]/30 text-[#D4C4B0]":"bg-[#0E0C0A] border-red-500/30 text-red-400"}`}>
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${type==="success"?"bg-[#C8A882]":"bg-red-400"}`}/>
      <span className="flex-1 min-w-0 truncate">{msg}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 shrink-0">✕</button>
    </div>
  );
}

function EventDateCardDark({ eventDate, calendarEvents }: { eventDate: string | null; calendarEvents: Project["calendarEvents"] }) {
  const now = new Date();
  const primary = eventDate ? new Date(eventDate) : null;
  const daysUntilPrimary = primary ? Math.ceil((primary.getTime()-now.getTime())/86400000) : null;
  const isPrimaryPast  = daysUntilPrimary !== null && daysUntilPrimary < 0;
  const isPrimaryToday = daysUntilPrimary === 0;
  const extraEvents = (calendarEvents??[]).filter(e=>e.startTime).sort((a,b)=>new Date(a.startTime!).getTime()-new Date(b.startTime!).getTime());

  if (!primary && extraEvents.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {primary && (
        <div className="bg-[#0A0806] border border-[#C8A882]/20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.035]" style={{backgroundImage:"linear-gradient(#C8A882 1px,transparent 1px),linear-gradient(90deg,#C8A882 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
          <div className="absolute inset-0" style={{background:"radial-gradient(ellipse 60% 100% at 0% 50%,rgba(200,168,130,0.06) 0%,transparent 70%)"}}/>
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 p-5 sm:p-6">
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-center border border-[#C8A882]/25 bg-[#C8A882]/6 px-5 py-3 min-w-[76px] shrink-0">
                <span className="text-[8px] tracking-[0.2em] uppercase text-[#C8A882]/40">{primary.getFullYear()}</span>
                <span className="font-['Cormorant_Garamond'] text-[4rem] font-light text-[#C8A882] leading-none">{primary.getDate()}</span>
                <span className="text-[10px] tracking-[0.1em] uppercase text-[#C8A882]/70">{HU_MONTHS[primary.getMonth()]}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] tracking-[0.18em] uppercase text-[#C8A882]/30 border border-[#C8A882]/20 px-1.5 py-0.5 self-start">✦ Munka dátuma</span>
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#3A3530]">{HU_DAYS[primary.getDay()]}</span>
                <span className="text-[14px] text-[#D4C4B0] font-light">Fotózás napja</span>
              </div>
            </div>
            <div className="sm:ml-auto shrink-0 sm:text-right">
              {isPrimaryToday ? (
                <div className="inline-flex items-center gap-2 border border-[#34D399]/30 bg-[#34D399]/8 px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"/>
                  <span className="text-[11px] tracking-[0.1em] uppercase text-[#34D399] font-medium">Ma van!</span>
                </div>
              ) : isPrimaryPast ? (
                <div>
                  <div className="text-[10px] tracking-[0.12em] uppercase text-[#3A3530] mb-0.5">Lezajlott</div>
                  <div className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#3A3530] leading-none">{Math.abs(daysUntilPrimary!)} napja</div>
                </div>
              ) : (
                <div>
                  <div className="text-[9px] tracking-[0.15em] uppercase text-[#3A3530] mb-0.5">Visszaszámláló</div>
                  <div className="font-['Cormorant_Garamond'] text-[3.5rem] sm:text-[4rem] font-light text-[#C8A882] leading-none">{daysUntilPrimary}</div>
                  <div className="text-[10px] tracking-[0.12em] uppercase text-[#5A5248]">nap múlva</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {extraEvents.length > 0 && (
        <div className="bg-[#0E0C0A] border border-white/[0.05] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-px bg-[#C8A882]/30"/>
            <span className="text-[9px] tracking-[0.16em] uppercase text-[#3A3530]">Kapcsolódó naptári események</span>
          </div>
          <div className="flex flex-col gap-0">
            {extraEvents.map(ev => {
              const d    = new Date(ev.startTime!);
              const days = Math.ceil((d.getTime()-now.getTime())/86400000);
              const isToday = days === 0; const isPast = days < 0;
              return (
                <div key={ev.id} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-b-0">
                  <div className="w-8 h-8 border border-white/[0.06] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[7px] text-[#3A3530] uppercase">{HU_MONTHS_SH[d.getMonth()]}</span>
                    <span className="font-['Cormorant_Garamond'] text-[1rem] leading-none text-[#5A5248]">{d.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-[#5A5248] truncate">{ev.title??"Esemény"}</div>
                    <div className="text-[10px] text-[#3A3530]">{ev.wholeDay?"Egész napos":d.toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"})}</div>
                  </div>
                  <div className="text-right shrink-0">
                    {isToday ? <span className="text-[10px] text-[#34D399] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse"/>Ma</span>
                    : isPast  ? <span className="text-[10px] text-[#3A3530]">{Math.abs(days)}n</span>
                    :            <span className="text-[10px] text-[#5A5248]">{days}n</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProjectDetailPage() {
  const { id }            = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router            = useRouter();

  const [project, setProject]   = useState<Project | null>(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>("overview");
  const [toast, setToast]       = useState<{msg:string;type:"success"|"error"}|null>(null);
  const [saving, setSaving]     = useState(false);
  const [editing, setEditing]   = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus]     = useState<ProjectStatus>("PLANNING");
  const [editTotalPrice, setEditTotalPrice] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting]       = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const res  = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProject(data.project);
      setEditName(data.project.name??"");
      setEditDesc(data.project.description??"");
      setEditStatus(data.project.status??"PLANNING");
      setEditTotalPrice(data.project.totalPrice?.toString()??"");
    } catch { setToast({msg:"Nem sikerült betölteni",type:"error"}); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);
  useEffect(() => {
    if (tab==="messages") setTimeout(()=>messagesEndRef.current?.scrollIntoView({behavior:"smooth"}),100);
  }, [tab, project?.messages?.length]);

  async function saveEdit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:editName,description:editDesc,status:editStatus,totalPrice:editTotalPrice?parseFloat(editTotalPrice):null})});
      if (!res.ok) throw new Error();
      await fetchProject(); setEditing(false); setToast({msg:"Projekt mentve",type:"success"});
    } catch { setToast({msg:"Hiba a mentésnél",type:"error"}); }
    finally { setSaving(false); }
  }
  async function updatePaymentStatus(paymentStatus: PaymentStatus) {
    try {
      const res = await fetch(`/api/projects/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({paymentStatus})});
      if (!res.ok) throw new Error();
      setProject(p=>p?{...p,paymentStatus}:p);
      setToast({msg:`Fizetési státusz: ${PAYMENT_META[paymentStatus].label}`,type:"success"});
    } catch { setToast({msg:"Hiba a frissítésnél",type:"error"}); }
  }
  async function quickStatusUpdate(status: ProjectStatus) {
    try {
      const res = await fetch(`/api/projects/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});
      if (!res.ok) throw new Error();
      setProject(p=>p?{...p,status}:p); setToast({msg:"Státusz frissítve",type:"success"});
    } catch { setToast({msg:"Hiba a státuszváltásnál",type:"error"}); }
  }
  async function sendMessage() {
    if (!msgContent.trim()||!project?.users[0]) return;
    setSendingMsg(true);
    try {
      const res = await fetch(`/api/projects/${id}/messages`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:msgContent.trim(),receiverId:project.users[0].id})});
      if (!res.ok) throw new Error();
      setMsgContent(""); await fetchProject();
    } catch { setToast({msg:"Hiba az üzenet küldésnél",type:"error"}); }
    finally { setSendingMsg(false); }
  }
  async function deleteProject() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${id}`,{method:"DELETE"});
      if (!res.ok) throw new Error();
      router.push("/admin/projects");
    } catch { setToast({msg:"Hiba a törléskor",type:"error"}); setDeleting(false); }
  }

  if (loading) return <div className="min-h-screen bg-[#0C0A08] flex items-center justify-center gap-3"><div className="w-5 h-5 border border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin"/><span className="text-[12px] text-[#3A3530]">Betöltés...</span></div>;
  if (!project) return <div className="min-h-screen bg-[#0C0A08] flex items-center justify-center"><div className="text-center"><p className="text-[14px] text-[#5A5248] mb-4">Projekt nem található</p><Link href="/admin/projects" className="text-[11px] text-[#C8A882] border-b border-[#C8A882]/30 pb-0.5">← Vissza</Link></div></div>;

  const status = project.status??"PLANNING";
  const sm     = STATUS_META[status];
  const ps     = project.paymentStatus;
  const pm     = ps ? PAYMENT_META[ps] : null;
  const myId   = parseInt(session?.user?.id as string??"0");

  return (
    <div className="min-h-screen bg-[#0C0A08] text-[#D4C4B0]">
      <div className="border-b border-white/[0.05] px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin/projects" className="text-[#3A3530] hover:text-[#D4C4B0] transition-colors shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-['Cormorant_Garamond'] text-[1.4rem] sm:text-[1.6rem] font-light text-white leading-tight truncate">{project.name??"Névtelen projekt"}</h1>
                <span className="text-[9px] tracking-[0.1em] uppercase px-2 py-1 border shrink-0" style={{color:sm.color,background:sm.bg,borderColor:`${sm.color}30`}}>{sm.label}</span>
                {pm && <span className="text-[9px] tracking-[0.1em] uppercase px-2 py-1 border shrink-0" style={{color:pm.color,background:pm.bg,borderColor:`${pm.color}30`}}>{pm.label}</span>}
              </div>
              <div className="text-[11px] text-[#3A3530] mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>#{project.id}</span><span>·</span><span>{project.type?.name??"—"}</span><span>·</span>
                <span>{new Date(project.createdAt).toLocaleDateString("hu-HU")}</span>
                {project.totalPrice!=null && <><span>·</span><span className="text-[#C8A882]">{project.totalPrice.toLocaleString("hu-HU")} Ft</span></>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!editing ? (
              <>
                <button onClick={()=>setEditing(true)} className="flex items-center gap-2 px-3 py-2 border border-white/[0.08] text-[11px] tracking-[0.08em] uppercase text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Szerkesztés
                </button>
                <button onClick={()=>setDeleteModal(true)} className="flex items-center gap-2 px-3 py-2 border border-red-500/20 text-[11px] tracking-[0.08em] uppercase text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  Törlés
                </button>
              </>
            ) : (
              <>
                <button onClick={()=>setEditing(false)} className="px-3 py-2 border border-white/[0.08] text-[11px] text-[#5A5248] hover:text-[#D4C4B0] transition-all">Mégsem</button>
                <button onClick={saveEdit} disabled={saving} className="px-5 py-2 bg-[#C8A882] text-[11px] tracking-[0.1em] uppercase text-[#0C0A08] font-medium hover:bg-[#D4B892] transition-all disabled:opacity-50">{saving?"Mentés...":"Mentés"}</button>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-0 mt-5 border-b border-white/[0.04] -mb-4 overflow-x-auto scrollbar-none">
          {(["overview","messages","gallery","calendar"] as Tab[]).map(t => {
            const labels: Record<Tab,string> = {overview:"Áttekintés",messages:`Üzenetek (${project.messages.length})`,gallery:`Galéria (${project.galleries.length})`,calendar:`Naptár (${project.calendarEvents.length})`};
            return (
              <button key={t} onClick={()=>setTab(t)}
                className={`px-4 py-2.5 text-[11px] tracking-[0.08em] uppercase border-b-2 transition-all whitespace-nowrap ${tab===t?"border-[#C8A882] text-[#C8A882]":"border-transparent text-[#3A3530] hover:text-[#5A5248]"}`}>
                {labels[t]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {tab==="overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <EventDateCardDark eventDate={project.eventDate} calendarEvents={project.calendarEvents}/>

              <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
                <div className="text-[9px] tracking-[0.16em] uppercase text-[#3A3530] mb-4">Projekt adatok</div>
                {editing ? (
                  <div className="flex flex-col gap-4">
                    <div><label className="text-[10px] tracking-[0.12em] uppercase text-[#5A5248] block mb-1.5">Projekt neve</label><input value={editName} onChange={e=>setEditName(e.target.value)} className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 transition-colors"/></div>
                    <div><label className="text-[10px] tracking-[0.12em] uppercase text-[#5A5248] block mb-1.5">Leírás</label><textarea rows={5} value={editDesc} onChange={e=>setEditDesc(e.target.value)} className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 transition-colors resize-none"/></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label className="text-[10px] tracking-[0.12em] uppercase text-[#5A5248] block mb-1.5">Státusz</label><select value={editStatus} onChange={e=>setEditStatus(e.target.value as ProjectStatus)} className="bg-[#141210] border border-white/[0.08] text-[13px] px-3 py-2.5 focus:outline-none w-full" style={{color:STATUS_META[editStatus].color}}>{STATUSES.map(s=><option key={s} value={s} style={{background:"#141210",color:STATUS_META[s].color}}>{STATUS_META[s].label}</option>)}</select></div>
                      <div><label className="text-[10px] tracking-[0.12em] uppercase text-[#5A5248] block mb-1.5">Végösszeg (Ft)</label><input type="number" min="0" value={editTotalPrice} onChange={e=>setEditTotalPrice(e.target.value)} placeholder="Pl. 380000" className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 transition-colors"/></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div><div className="text-[10px] tracking-[0.12em] uppercase text-[#3A3530] mb-1">Név</div><div className="text-[14px] text-[#D4C4B0]">{project.name??"—"}</div></div>
                    <div><div className="text-[10px] tracking-[0.12em] uppercase text-[#3A3530] mb-1">Leírás</div><div className="text-[13px] text-[#5A5248] leading-relaxed whitespace-pre-wrap">{project.description??"—"}</div></div>
                    <div className="flex flex-wrap gap-6 pt-3 border-t border-white/[0.04]">
                      <div><div className="text-[9px] tracking-[0.12em] uppercase text-[#3A3530] mb-1">Típus</div><div className="text-[12px] text-[#D4C4B0]">{project.type?.name??"—"}</div></div>
                      <div><div className="text-[9px] tracking-[0.12em] uppercase text-[#3A3530] mb-1">Csomag</div><div className="text-[12px] text-[#D4C4B0]">{project.category?.name??"—"}</div></div>
                      <div><div className="text-[9px] tracking-[0.12em] uppercase text-[#3A3530] mb-1">Létrehozva</div><div className="text-[12px] text-[#D4C4B0]">{new Date(project.createdAt).toLocaleDateString("hu-HU")}</div></div>
                      {project.eventDate && <div><div className="text-[9px] tracking-[0.12em] uppercase text-[#C8A882]/50 mb-1">Munka dátuma</div><div className="text-[12px] text-[#C8A882]">{new Date(project.eventDate).toLocaleDateString("hu-HU")}</div></div>}
                    </div>
                  </div>
                )}
              </div>

              {project.galleries.length > 0 && (
                <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[9px] tracking-[0.16em] uppercase text-[#3A3530]">Galériák</div>
                    <button onClick={()=>setTab("gallery")} className="text-[10px] text-[#C8A882]/60 hover:text-[#C8A882] transition-colors">Mind →</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {project.galleries.slice(0,3).map(g=>(
                      <div key={g.id} className="bg-[#141210] border border-white/[0.04] p-3">
                        <div className="text-[12px] text-[#D4C4B0] truncate mb-1">{g.title??"Névtelen galéria"}</div>
                        <div className="text-[10px] text-[#3A3530]">{g.images.length+g.imagesFull.length} kép</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
                <div className="text-[9px] tracking-[0.16em] uppercase text-[#3A3530] mb-4">Ügyfél</div>
                {project.users.length===0 ? <p className="text-[12px] text-[#3A3530]">Nincs kapcsolt felhasználó</p> : project.users.map(u=>(
                  <div key={u.id} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 border border-[#C8A882]/20 flex items-center justify-center font-['Cormorant_Garamond'] text-[16px] text-[#C8A882]">{u.name?.charAt(0).toUpperCase()??"?"}</div>
                      <div><div className="text-[13px] text-[#D4C4B0]">{u.name??"—"}</div><div className="text-[10px] text-[#3A3530]">#{u.id}</div></div>
                    </div>
                    {[{l:"Email",v:u.email},{l:"Telefon",v:u.phone??"—"}].map(row=>(
                      <div key={row.l}><div className="text-[9px] tracking-[0.12em] uppercase text-[#3A3530] mb-0.5">{row.l}</div><div className="text-[12px] text-[#5A5248]">{row.v}</div></div>
                    ))}
                    <button onClick={()=>setTab("messages")} className="mt-1 py-2 border border-[#C8A882]/20 text-[11px] tracking-[0.1em] uppercase text-[#C8A882]/60 hover:text-[#C8A882] hover:border-[#C8A882]/40 transition-all text-center">Üzenet küldése →</button>
                  </div>
                ))}
              </div>

              <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
                <div className="text-[9px] tracking-[0.16em] uppercase text-[#3A3530] mb-3">Projekt státusz</div>
                <div className="flex flex-col gap-1.5">
                  {STATUSES.map(s => {
                    const v=STATUS_META[s]; const active=project.status===s;
                    return <button key={s} onClick={()=>!active&&quickStatusUpdate(s)} disabled={active} className={`py-2 px-3 text-left text-[11px] tracking-[0.08em] uppercase border transition-all ${active?"cursor-default":"border-white/[0.04] hover:border-current/30 cursor-pointer"}`} style={{color:v.color,background:active?v.bg:"transparent",borderColor:active?`${v.color}40`:undefined}}>{active&&"✓ "}{v.label}</button>;
                  })}
                </div>
              </div>

              <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
                <div className="text-[9px] tracking-[0.16em] uppercase text-[#3A3530] mb-4">Fizetési státusz</div>
                {project.totalPrice!=null ? (
                  <div className="mb-4 pb-4 border-b border-white/[0.05]">
                    <div className="text-[9px] tracking-[0.12em] uppercase text-[#3A3530] mb-1.5">Fizetendő összeg</div>
                    <div className="font-['Cormorant_Garamond'] text-[1.8rem] font-light text-[#C8A882] leading-none">{project.totalPrice.toLocaleString("hu-HU")} Ft</div>
                    <button onClick={()=>setEditing(true)} className="text-[10px] text-[#3A3530] hover:text-[#5A5248] mt-1 transition-colors">Szerkesztés →</button>
                  </div>
                ) : (
                  <div className="mb-4 pb-4 border-b border-white/[0.05]">
                    <div className="text-[9px] tracking-[0.12em] uppercase text-[#3A3530] mb-1">Fizetendő összeg</div>
                    <div className="text-[12px] text-[#3A3530]">Nincs megadva</div>
                    <button onClick={()=>setEditing(true)} className="text-[10px] text-[#C8A882]/50 hover:text-[#C8A882] mt-1 transition-colors">+ Összeg megadása</button>
                  </div>
                )}
                {pm && <div className="mb-3 px-3 py-2.5 border text-[11px] leading-relaxed" style={{borderColor:`${pm.color}30`,background:pm.bg,color:pm.color}}>{pm.desc}</div>}
                <div className="flex flex-col gap-1.5">
                  {PAYMENT_STATUSES.map(s => {
                    const v=PAYMENT_META[s]; const active=project.paymentStatus===s;
                    return <button key={s} onClick={()=>!active&&updatePaymentStatus(s)} disabled={active} className={`py-2 px-3 text-left text-[11px] tracking-[0.08em] uppercase border transition-all ${active?"cursor-default":"border-white/[0.04] hover:border-current/30 cursor-pointer"}`} style={{color:v.color,background:active?v.bg:"transparent",borderColor:active?`${v.color}40`:undefined}}>{active&&"✓ "}{v.label}</button>;
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="messages" && (
          <div className="max-w-2xl flex flex-col gap-4">
            <div className="bg-[#0E0C0A] border border-white/[0.05] flex flex-col" style={{minHeight:"400px",maxHeight:"600px"}}>
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
                {project.messages.length===0 ? <div className="flex items-center justify-center h-32"><span className="text-[12px] text-[#3A3530]">Még nincs üzenet</span></div>
                : project.messages.map(msg => {
                  const isMe=msg.sender.id===myId;
                  return (
                    <div key={msg.id} className={`flex flex-col gap-1 ${isMe?"items-end":"items-start"}`}>
                      <div className={`max-w-[80%] px-4 py-2.5 text-[13px] leading-relaxed ${isMe?"bg-[#C8A882]/15 border border-[#C8A882]/20 text-[#D4C4B0]":"bg-white/[0.04] border border-white/[0.06] text-[#D4C4B0]"}`}>{msg.content}</div>
                      <div className="flex items-center gap-2 text-[9px] text-[#3A3530]"><span>{isMe?"Te":msg.sender.name}</span><span>·</span><span>{new Date(msg.createdAt).toLocaleString("hu-HU",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</span></div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef}/>
              </div>
              <div className="border-t border-white/[0.05] p-4 flex gap-3">
                <input value={msgContent} onChange={e=>setMsgContent(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder="Írj üzenetet az ügyfélnek..."
                  className="flex-1 bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 transition-colors"/>
                <button onClick={sendMessage} disabled={sendingMsg||!msgContent.trim()||!project.users[0]} className="px-5 py-2.5 bg-[#C8A882] text-[11px] tracking-[0.1em] uppercase text-[#0C0A08] font-medium hover:bg-[#D4B892] transition-all disabled:opacity-40">{sendingMsg?"...":"Küldés"}</button>
              </div>
            </div>
          </div>
        )}

        {tab==="gallery" && (
          <div className="flex flex-col gap-5">
            {project.galleries?.[0] ? (
              <AdminGalleryManager projectId={project.id} initialGallery={{...project.galleries[0],hasPassword:!!project.galleries[0].password,shareableLink:project.galleries[0].shareToken?`/gallery/${project.galleries[0].shareToken}`:null} as any}/>
            ) : (
              <AdminGalleryManager projectId={project.id} initialGallery={null}/>
            )}
          </div>
        )}

        {tab==="calendar" && (
          <div className="flex flex-col gap-4">
            {project.calendarEvents.length===0 ? <div className="bg-[#0E0C0A] border border-white/[0.05] p-10 text-center"><p className="text-[12px] text-[#3A3530]">Nincs naptári esemény</p></div>
            : project.calendarEvents.map(ev=>{
              const start=ev.startTime?new Date(ev.startTime):null;
              return (
                <div key={ev.id} className="bg-[#0E0C0A] border border-white/[0.05] p-4 flex items-start gap-4">
                  <div className="w-10 h-10 border border-[#C8A882]/20 flex items-center justify-center shrink-0"><svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.2" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                  <div><div className="text-[13px] text-[#D4C4B0]">{ev.title??"Névtelen esemény"}</div><div className="text-[11px] text-[#3A3530] mt-0.5">{ev.wholeDay?"Egész napos":[start&&new Date(ev.startTime!).toLocaleString("hu-HU"),ev.endTime&&`→ ${new Date(ev.endTime).toLocaleString("hu-HU")}`].filter(Boolean).join(" ")}</div></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={()=>setDeleteModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
          <div className="relative z-10 w-full max-w-sm mx-4 bg-[#0E0C0A] border border-white/[0.08] p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.5" className="w-5 h-5 shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div><div className="text-[13px] text-[#D4C4B0] mb-1">Biztosan törlöd?</div><div className="text-[11px] text-[#5A5248]">Ez a művelet nem visszavonható.</div></div>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteModal(false)} className="flex-1 py-2.5 border border-white/[0.08] text-[11px] text-[#5A5248] hover:text-[#D4C4B0] transition-all">Mégsem</button>
              <button onClick={deleteProject} disabled={deleting} className="flex-1 py-2.5 bg-red-500/80 text-[11px] tracking-[0.1em] uppercase text-white hover:bg-red-500 transition-all disabled:opacity-50">{deleting?"Törlés...":"Törlés megerősítése"}</button>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
}