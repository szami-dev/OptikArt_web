"use client";

// app/components/ChatWidget.tsx

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

type GuestMessage = {
  id: number; body: string; createdAt: string;
  isAdminReply: boolean; isRead: boolean;
};

type UserChatMsg = {
  id: number; body: string; createdAt: string;
  isAdminReply: boolean; isRead: boolean;
  sender: { id: number; name: string | null; role: string };
  project: { id: number; name: string | null } | null;
  replies: { id: number; body: string; createdAt: string; sender: { name: string | null; role: string } }[];
  _count: { replies: number };
};

const GUEST_TOKEN_KEY = "optikart-guest-token";
const GUEST_NAME_KEY  = "optikart-guest-name";
const GUEST_EMAIL_KEY = "optikart-guest-email";
const CHAT_INTRO_KEY  = "optikart-chat-intro";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Most";
  if (m < 60) return `${m} perce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} órája`;
  return `${Math.floor(h / 24)} napja`;
}

// ── Kis segédkomponens: csak az URL param olvasásához ─────────
// Ez kerül Suspense-be, így a többi oldal buildje nem akad meg
function SearchParamsReader({ onParams }: { onParams: (chat: string | null, token: string | null) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onParams(searchParams?.get("chat") ?? null, searchParams?.get("token") ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

// ── Fő widget logika ──────────────────────────────────────────
function ChatWidgetInner() {
  const { data: authSession } = useSession();
  const isLoggedIn = !!authSession?.user?.id;

  const [open, setOpen]           = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [guestName, setGuestName]   = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestStep, setGuestStep]   = useState<"info" | "chat">("info");
  const [guestMsgs, setGuestMsgs]   = useState<GuestMessage[]>([]);
  const [guestUnread, setGuestUnread] = useState(0);

  const [userMsgs, setUserMsgs]       = useState<UserChatMsg[]>([]);
  const [userUnread, setUserUnread]   = useState(0);
  const [activeThread, setActiveThread] = useState<UserChatMsg | null>(null);

  const [body, setBody]       = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── URL param callback (Suspense-on belül hívódik) ────────
  const handleUrlParams = useCallback((chat: string | null, token: string | null) => {
    if (chat === "open") {
      const storedToken = localStorage.getItem(GUEST_TOKEN_KEY);
      if (token && token !== storedToken) {
        localStorage.setItem(GUEST_TOKEN_KEY, token);
        setGuestToken(token);
        setGuestStep("chat");
      }
      setOpen(true);
    }
  }, []);

  // ── Inicializálás ─────────────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(GUEST_TOKEN_KEY);
    const storedName  = localStorage.getItem(GUEST_NAME_KEY);
    const storedEmail = localStorage.getItem(GUEST_EMAIL_KEY);

    if (storedToken) {
      setGuestToken(storedToken);
      setGuestStep("chat");
      if (storedName)  setGuestName(storedName);
      if (storedEmail) setGuestEmail(storedEmail);
    }

    if (!localStorage.getItem(CHAT_INTRO_KEY)) {
      setTimeout(() => setShowBubble(true), 3000);
    }
  }, []);

  // ── Guest üzenetek ────────────────────────────────────────
  const loadGuestMsgs = useCallback(async (token: string) => {
    try {
      const res  = await fetch(`/api/chat/guest?token=${token}`);
      const data = await res.json();
      if (res.ok) {
        setGuestMsgs(data.messages ?? []);
        const unread = (data.messages ?? []).filter((m: GuestMessage) => m.isAdminReply && !m.isRead).length;
        setGuestUnread(unread);
        if (data.session?.name)  setGuestName(data.session.name);
        if (data.session?.email) setGuestEmail(data.session.email);
      }
    } catch {}
  }, []);

  // ── User üzenetek ─────────────────────────────────────────
  const loadUserMsgs = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/chat");
      const data = await res.json();
      setUserMsgs(data.messages ?? []);
      setUserUnread(data.unreadCount ?? 0);
    } catch {} finally { setLoading(false); }
  }, [isLoggedIn]);

  useEffect(() => {
    if (open) {
      if (isLoggedIn) loadUserMsgs();
      else if (guestToken) loadGuestMsgs(guestToken);
    }
  }, [open, isLoggedIn, guestToken, loadUserMsgs, loadGuestMsgs]);

  useEffect(() => {
    if (activeThread) {
      const updated = userMsgs.find(m => m.id === activeThread.id);
      if (updated) setActiveThread(updated);
    }
  }, [userMsgs]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [guestMsgs, activeThread]);

  function dismissBubble() { setShowBubble(false); localStorage.setItem(CHAT_INTRO_KEY, "1"); }
  function handleOpen() { dismissBubble(); setOpen(true); }

  function handleGuestInfoNext() {
    if (!guestName.trim() || !guestEmail.trim()) return;
    localStorage.setItem(GUEST_NAME_KEY, guestName);
    localStorage.setItem(GUEST_EMAIL_KEY, guestEmail);
    setGuestStep("chat");
  }

  async function handleGuestSend() {
    if (!body.trim()) return;
    setSending(true);
    try {
      const res  = await fetch("/api/chat/guest", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:guestName, email:guestEmail, body, token:guestToken??undefined }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.sessionId && !guestToken) { localStorage.setItem(GUEST_TOKEN_KEY, data.sessionId); setGuestToken(data.sessionId); }
      setBody("");
      if (data.sessionId || guestToken) await loadGuestMsgs(data.sessionId ?? guestToken!);
    } catch (e:any) { alert(e.message??"Hiba a küldéskor."); }
    finally { setSending(false); }
  }

  async function handleUserSend() {
    if (!body.trim()) return;
    setSending(true);
    try {
      const payload: any = { body };
      if (activeThread) payload.parentId = activeThread.id;
      const res = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      setBody(""); await loadUserMsgs();
    } catch {} finally { setSending(false); }
  }

  async function markUserRead(id: number) {
    await fetch(`/api/chat/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({isRead:true}) });
    setUserMsgs(prev => prev.map(m => m.id===id ? {...m,isRead:true} : m));
    setUserUnread(u => Math.max(0,u-1));
  }

  const totalUnread = isLoggedIn ? userUnread : guestUnread;

  return (
    <>
      {/* URL param olvasó – Suspense-be csomagolva */}
      <Suspense fallback={null}>
        <SearchParamsReader onParams={handleUrlParams} />
      </Suspense>

      {/* Bevezető buborék */}
      {showBubble && !open && (
        <div className="fixed bottom-20 right-5 z-[100] max-w-[280px] w-[calc(100%-2.5rem)]" style={{animation:"fadeInUp 0.4s ease"}}>
          <div className="bg-white border border-[#EDE8E0] shadow-xl p-4 relative">
            <div className="absolute -bottom-2 right-5 w-4 h-4 bg-white border-r border-b border-[#EDE8E0] rotate-45"/>
            <button onClick={dismissBubble} className="absolute top-2.5 right-2.5 text-[#C8B8A0] hover:text-[#A08060] transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-[#1A1510] flex items-center justify-center font-['Cormorant_Garamond'] text-[14px] text-[#C8A882]">O</div>
              <div>
                <div className="text-[12px] font-semibold text-[#1A1510]">OptikArt csapata</div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#34D399] rounded-full"/><span className="text-[10px] text-[#A08060]">1–2 órán belül válaszolunk</span></div>
              </div>
            </div>
            <p className="text-[12px] text-[#7A6A58] leading-relaxed mb-3">Kérdésed van? Írj nekünk! 👋</p>
            <button onClick={handleOpen} className="w-full py-2 bg-[#1A1510] text-[11px] tracking-[0.1em] uppercase text-white hover:bg-[#C8A882] transition-all">Üzenj nekünk →</button>
          </div>
        </div>
      )}

      {/* Chat ablak */}
      {open && (
        <div className="fixed bottom-20 right-5 z-[100] w-[340px] max-h-[520px] bg-white border border-[#EDE8E0] shadow-2xl flex flex-col overflow-hidden" style={{animation:"fadeInUp 0.3s ease"}}>
          {/* Fejléc */}
          <div className="bg-[#1A1510] px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#C8A882]/20 border border-[#C8A882]/30 flex items-center justify-center font-['Cormorant_Garamond'] text-[13px] text-[#C8A882]">O</div>
              <div>
                <div className="text-[12px] text-white font-medium">OptikArt</div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#34D399] rounded-full"/><span className="text-[9px] text-white/50">Online</span></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isLoggedIn && activeThread && <button onClick={()=>setActiveThread(null)} className="text-[10px] text-white/40 hover:text-white">← Vissza</button>}
              <button onClick={()=>setOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* GUEST flow */}
          {!isLoggedIn && (
            <>
              {guestStep==="info" && (
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
                  <p className="text-[12px] text-[#7A6A58] leading-relaxed">Kérdésed van? Add meg az adataid, és hamarosan visszajelzünk!</p>
                  <input value={guestName} onChange={e=>setGuestName(e.target.value)} placeholder="Neved *" type="text" className="w-full border border-[#EDE8E0] text-[12px] text-[#1A1510] placeholder:text-[#C8B8A0] px-3 py-2 focus:outline-none focus:border-[#C8A882]"/>
                  <input value={guestEmail} onChange={e=>setGuestEmail(e.target.value)} placeholder="Email *" type="email" onKeyDown={e=>e.key==="Enter"&&handleGuestInfoNext()} className="w-full border border-[#EDE8E0] text-[12px] text-[#1A1510] placeholder:text-[#C8B8A0] px-3 py-2 focus:outline-none focus:border-[#C8A882]"/>
                  <button onClick={handleGuestInfoNext} disabled={!guestName.trim()||!guestEmail.trim()} className="py-2 bg-[#1A1510] text-[11px] tracking-[0.1em] uppercase text-white hover:bg-[#C8A882] transition-all disabled:opacity-40">Tovább →</button>
                  <div className="text-center border-t border-[#F0EBE3] pt-3">
                    <a href="/login" className="text-[10px] text-[#A08060] hover:text-[#C8A882] transition-colors">Van fiókod? Jelentkezz be →</a>
                  </div>
                </div>
              )}
              {guestStep==="chat" && (
                <>
                  <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-[#FAF8F4] border border-[#EDE8E0] px-3 py-2 mb-1">
                      <div><div className="text-[11px] font-medium text-[#1A1510]">{guestName}</div><div className="text-[10px] text-[#A08060]">{guestEmail}</div></div>
                      <button onClick={()=>{ if(!guestToken) setGuestStep("info"); }} className={`text-[10px] text-[#C8B8A0] hover:text-[#A08060] transition-colors ${guestToken?"hidden":""}`}>Módosít</button>
                    </div>
                    {guestMsgs.length===0 && (
                      <div className="text-center py-4">
                        <p className="text-[12px] text-[#A08060]">Írd meg kérdésedet!</p>
                        <p className="text-[11px] text-[#C8B8A0] mt-1">Válaszodat emailen is értesítjük.</p>
                      </div>
                    )}
                    {guestMsgs.map(msg=>(
                      <div key={msg.id} className={`flex ${msg.isAdminReply?"justify-start":"justify-end"}`}>
                        <div className="max-w-[80%]">
                          <div className={`flex items-center gap-1.5 mb-1 ${msg.isAdminReply?"":"justify-end"}`}>
                            {msg.isAdminReply&&<div className="w-3.5 h-3.5 bg-[#C8A882]/20 flex items-center justify-center text-[7px] text-[#C8A882]">O</div>}
                            <span className="text-[9px] text-[#C8B8A0]">{msg.isAdminReply?"OptikArt":guestName} · {timeAgo(msg.createdAt)}</span>
                          </div>
                          <div className={`px-3 py-2 text-[12px] leading-relaxed border ${msg.isAdminReply?"bg-[#FAF8F4] border-[#EDE8E0] text-[#1A1510]":"bg-[#1A1510] border-transparent text-white"}`}>{msg.body}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef}/>
                  </div>
                  <div className="shrink-0 border-t border-[#EDE8E0] p-3 flex gap-2">
                    <textarea value={body} onChange={e=>setBody(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleGuestSend();}}} rows={2} placeholder="Írd meg kérdésedet... (Enter = küldés)" className="flex-1 border border-[#EDE8E0] text-[12px] text-[#1A1510] placeholder:text-[#C8B8A0] px-2.5 py-2 focus:outline-none focus:border-[#C8A882] resize-none"/>
                    <button onClick={handleGuestSend} disabled={!body.trim()||sending} className="w-9 bg-[#1A1510] flex items-center justify-center text-white hover:bg-[#C8A882] transition-all disabled:opacity-40 self-end shrink-0" style={{height:"58px"}}>
                      {sending?<div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"/>:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* BEJELENTKEZETT USER – lista */}
          {isLoggedIn && !activeThread && (
            <div className="flex-1 overflow-y-auto flex flex-col">
              {loading && <div className="flex items-center justify-center py-8"><div className="w-4 h-4 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin"/></div>}
              {!loading && userMsgs.length===0 && (
                <div className="px-5 py-8 text-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.2" className="w-8 h-8 mx-auto mb-3 opacity-30"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <p className="text-[12px] text-[#A08060]">Még nincs üzeneted</p>
                  <p className="text-[11px] text-[#C8B8A0] mt-1">Írj nekünk bátran!</p>
                </div>
              )}
              {!loading && userMsgs.map(msg=>{
                const hasAdminReply = msg.replies.some(r=>r.sender.role==="ADMIN");
                const isUnread      = !msg.isRead && hasAdminReply;
                return (
                  <div key={msg.id} onClick={()=>{ setActiveThread(msg); if(isUnread) markUserRead(msg.id); }} className="px-4 py-3 border-b border-[#F5F0EB] hover:bg-[#FAF8F4] cursor-pointer transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isUnread && <div className="w-1.5 h-1.5 rounded-full bg-[#C8A882] shrink-0"/>}
                        <span className="text-[12px] text-[#1A1510] font-medium truncate">{msg.project?.name??"Általános kérdés"}</span>
                      </div>
                      <span className="text-[10px] text-[#C8B8A0] shrink-0">{timeAgo(msg.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-[#7A6A58] mt-1 line-clamp-2">{msg.body}</p>
                    {hasAdminReply && <div className="text-[10px] text-[#C8A882] mt-1 flex items-center gap-1"><div className="w-3 h-3 bg-[#C8A882]/20 flex items-center justify-center text-[7px]">A</div>Admin válaszolt · {msg._count.replies}</div>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Thread nézet */}
          {isLoggedIn && activeThread && (
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
              {activeThread.project && <div className="text-[9px] tracking-[0.1em] uppercase text-[#C8A882]/50 pb-2 border-b border-[#F0EBE3]">📁 {activeThread.project.name}</div>}
              <div className="flex justify-end">
                <div className="max-w-[80%]">
                  <div className="text-[9px] text-[#C8B8A0] text-right mb-1">{timeAgo(activeThread.createdAt)}</div>
                  <div className="bg-[#1A1510] text-white px-3 py-2 text-[12px] leading-relaxed">{activeThread.body}</div>
                </div>
              </div>
              {activeThread.replies.map(r=>(
                <div key={r.id} className={`flex ${r.sender.role==="ADMIN"?"justify-start":"justify-end"}`}>
                  <div className="max-w-[80%]">
                    <div className={`flex items-center gap-1 mb-1 text-[9px] text-[#C8B8A0] ${r.sender.role==="ADMIN"?"":"justify-end"}`}>
                      {r.sender.role==="ADMIN"&&<div className="w-3 h-3 bg-[#C8A882]/20 flex items-center justify-center text-[6px] text-[#C8A882]">O</div>}
                      {r.sender.role==="ADMIN"?"OptikArt":"Te"} · {timeAgo(r.createdAt)}
                    </div>
                    <div className={`px-3 py-2 text-[12px] leading-relaxed border ${r.sender.role==="ADMIN"?"bg-[#FAF8F4] border-[#EDE8E0] text-[#1A1510]":"bg-[#1A1510] border-transparent text-white"}`}>{r.body}</div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef}/>
            </div>
          )}

          {/* Input (bejelentkezett) */}
          {isLoggedIn && (
            <div className="shrink-0 border-t border-[#EDE8E0] p-3 flex gap-2">
              <textarea value={body} onChange={e=>setBody(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleUserSend();}}} rows={2} placeholder={activeThread?"Válasz...":"Írd meg kérdésedet..."} className="flex-1 border border-[#EDE8E0] text-[12px] text-[#1A1510] placeholder:text-[#C8B8A0] px-2.5 py-2 focus:outline-none focus:border-[#C8A882] resize-none"/>
              <button onClick={handleUserSend} disabled={!body.trim()||sending} className="w-9 bg-[#1A1510] flex items-center justify-center text-white hover:bg-[#C8A882] transition-all disabled:opacity-40 self-end shrink-0" style={{height:"58px"}}>
                {sending?<div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"/>:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating gomb */}
      <button onClick={()=>open?setOpen(false):handleOpen()} className="fixed bottom-5 right-5 z-[100] w-12 h-12 bg-[#1A1510] border border-[#C8A882]/20 flex items-center justify-center shadow-lg hover:bg-[#C8A882] transition-all">
        {open
          ? <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
        {totalUnread>0&&!open&&(
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F87171] text-white text-[8px] flex items-center justify-center rounded-full font-bold">
            {totalUnread>9?"9+":totalUnread}
          </span>
        )}
      </button>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// ── Exportált komponens ───────────────────────────────────────
export default function ChatWidget() {
  return (
    <Suspense fallback={null}>
      <ChatWidgetInner />
    </Suspense>
  );
}