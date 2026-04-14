"use client";

// app/(user)/user/messages/page.tsx

import { useEffect, useState, useCallback, useRef } from "react";

type Message = {
  id: number;
  body: string;
  createdAt: string;
  isRead: boolean;
  isAdminReply: boolean;
  project: { id: number; name: string | null } | null;
  replies: {
    id: number;
    body: string;
    createdAt: string;
    sender: { name: string | null; role: string };
  }[];
  _type?: "chat" | "project_message";
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Most";
  if (m < 60) return `${m} perce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} órája`;
  return `${Math.floor(h / 24)} napja`;
}

export default function UserMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<"all" | "standalone" | "project">("all");
  const [active,   setActive]   = useState<Message | null>(null);
  const [reply,    setReply]    = useState("");
  const [sending,  setSending]  = useState(false);

  // Stale closure fix
  const activeIdRef = useRef<number | null>(null);
  useEffect(() => { activeIdRef.current = active?.id ?? null; }, [active]);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (filter === "standalone") params.set("standalone", "true");
    const res  = await fetch(`/api/chat?${params}`);
    const data = await res.json();

    const msgs: Message[] = data.messages ?? [];

    const filtered = filter === "project"
      ? msgs.filter(m => m.project !== null)
      : msgs;

    setMessages(filtered);
    setLoading(false);

    // Aktív thread frissítése ref alapján
    if (activeIdRef.current !== null) {
      const updated = filtered.find(m => m.id === activeIdRef.current);
      if (updated) setActive(updated);
    }
  }, [filter]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  async function markRead(id: number) {
    await fetch(`/api/chat/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  }

  async function handleReply() {
    if (!reply.trim() || !active) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply, parentId: active.id, projectId: active.project?.id }),
      });
      if (!res.ok) throw new Error();
      setReply("");
      await load(); // load() frissíti az active-t a ref alapján
    } catch {}
    finally { setSending(false); }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">

      {/* Fejléc */}
      <div className="bg-white border-b border-[#EDE8E0] px-5 sm:px-8 lg:px-12 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-px bg-[#C8A882]" />
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">Üzenetek</span>
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-[2rem] sm:text-[2.4rem] font-light text-[#1A1510]">
            Üzeneteim
          </h1>
          <div className="flex gap-1 mt-4">
            {([
              { key: "all",        label: "Mind"       },
              { key: "standalone", label: "Általános"  },
              { key: "project",    label: "Projekthez" },
            ] as const).map(f => (
              <button key={f.key}
                onClick={() => { setFilter(f.key); setActive(null); }}
                className={`px-3 py-1.5 text-[10px] tracking-[0.08em] uppercase border transition-all ${filter === f.key ? "bg-[#1A1510] border-[#1A1510] text-white" : "border-[#EDE8E0] text-[#A08060] hover:border-[#C8A882]/40 hover:text-[#1A1510]"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white border border-[#EDE8E0] p-12 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.2" className="w-9 h-9 mx-auto mb-3 opacity-30">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p className="text-[13px] text-[#A08060]">Még nincs üzeneted</p>
            <p className="text-[11px] text-[#C8B8A0] mt-1">A chat ikonra kattintva tudsz nekünk írni.</p>
          </div>
        ) : (
          <div className={`flex gap-5 ${active ? "flex-row" : "flex-col"}`}>

            {/* Lista */}
            <div className={`flex flex-col gap-2 ${active ? "w-[280px] shrink-0 hidden lg:flex" : "flex-1"}`}>
              {messages.map(msg => {
                const hasAdminReply = msg.replies.some(r => r.sender.role === "ADMIN");
                const unreadReply   = hasAdminReply && !msg.isRead;
                const isProjMsg     = msg._type === "project_message";
                return (
                  <div key={msg.id}
                    onClick={() => { setActive(msg); if (unreadReply) markRead(msg.id); }}
                    className={`bg-white border p-4 cursor-pointer transition-all hover:border-[#C8A882]/30 hover:shadow-sm ${active?.id === msg.id ? "border-[#C8A882]/40" : "border-[#EDE8E0]"}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {unreadReply && <div className="w-2 h-2 bg-[#C8A882] rounded-full shrink-0" />}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] text-[#1A1510] font-medium truncate">
                              {msg.project?.name ?? "Általános kérdés"}
                            </span>
                            {isProjMsg && (
                              <span className="text-[8px] border border-[#60A5FA]/30 text-[#60A5FA]/60 px-1 shrink-0">projekt</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#C8B8A0] shrink-0">{timeAgo(msg.createdAt)}</span>
                    </div>
                    <p className="text-[12px] text-[#7A6A58] line-clamp-2">{msg.body}</p>
                    {hasAdminReply && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-4 h-4 bg-[#C8A882]/15 border border-[#C8A882]/30 flex items-center justify-center text-[8px] text-[#C8A882]">A</div>
                        <span className="text-[10px] text-[#C8A882]/70">Admin válaszolt</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Thread */}
            {active && (
              <div className="flex-1 bg-white border border-[#EDE8E0] flex flex-col overflow-hidden" style={{ maxHeight: "70vh" }}>
                <div className="px-5 py-3.5 border-b border-[#EDE8E0] flex items-center justify-between shrink-0">
                  <div>
                    <button onClick={() => setActive(null)}
                      className="text-[10px] text-[#A08060] hover:text-[#C8A882] flex items-center gap-1 mb-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><polyline points="15 18 9 12 15 6"/></svg>
                      Vissza
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="text-[14px] text-[#1A1510] font-medium">{active.project?.name ?? "Általános kérdés"}</div>
                      {active._type === "project_message" && (
                        <span className="text-[8px] border border-[#60A5FA]/30 text-[#60A5FA]/60 px-1.5 py-0.5">projekt üzenet</span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#A08060]">{timeAgo(active.createdAt)}</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                  {/* Saját üzenet */}
                  <div className="flex justify-end">
                    <div className="max-w-[75%]">
                      <div className="text-[9px] text-[#C8B8A0] text-right mb-1">{timeAgo(active.createdAt)}</div>
                      <div className="bg-[#1A1510] text-white px-4 py-2.5 text-[13px] leading-relaxed">{active.body}</div>
                    </div>
                  </div>

                  {/* Projekt üzenet esetén tájékoztató */}
                  {active._type === "project_message" && active.replies.length === 0 && (
                    <div className="text-center py-3">
                      <p className="text-[11px] text-[#A08060]">Projekt üzenetek kezelése a projekt részletei oldalon érhető el.</p>
                    </div>
                  )}

                  {/* Válaszok */}
                  {active.replies.map(r => (
                    <div key={r.id} className={`flex ${r.sender.role === "ADMIN" ? "justify-start" : "justify-end"}`}>
                      <div className="max-w-[75%]">
                        <div className={`flex items-center gap-1.5 mb-1 ${r.sender.role === "ADMIN" ? "" : "justify-end"}`}>
                          {r.sender.role === "ADMIN" && (
                            <div className="w-4 h-4 bg-[#C8A882]/20 flex items-center justify-center text-[8px] text-[#C8A882]">A</div>
                          )}
                          <span className="text-[9px] text-[#A08060]">
                            {r.sender.role === "ADMIN" ? "OptikArt" : "Te"} · {timeAgo(r.createdAt)}
                          </span>
                        </div>
                        <div className={`px-4 py-2.5 text-[13px] leading-relaxed border ${r.sender.role === "ADMIN" ? "bg-[#FAF8F4] border-[#EDE8E0] text-[#1A1510]" : "bg-[#1A1510] border-transparent text-white"}`}>
                          {r.body}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input – csak chat típusnál */}
                {active._type !== "project_message" && (
                  <div className="border-t border-[#EDE8E0] p-4 flex gap-2 shrink-0">
                    <textarea value={reply} onChange={e => setReply(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                      rows={2} placeholder="Válasz... (Enter = küldés)"
                      className="flex-1 bg-white border border-[#EDE8E0] text-[12px] text-[#1A1510] placeholder:text-[#C8B8A0] px-3 py-2 focus:outline-none focus:border-[#C8A882] resize-none" />
                    <button onClick={handleReply} disabled={!reply.trim() || sending}
                      className="px-4 py-2 bg-[#1A1510] text-[11px] uppercase text-white hover:bg-[#C8A882] transition-all disabled:opacity-40 self-end">
                      {sending ? "..." : "Küld"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}