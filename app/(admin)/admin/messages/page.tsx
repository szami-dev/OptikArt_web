"use client";

// app/(admin)/admin/messages/page.tsx

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// ── Típusok ───────────────────────────────────────────────────
type UserMsg = {
  id: number;
  body: string;
  createdAt: string;
  isRead: boolean;
  isAdminReply: boolean;
  sender: { id: number; name: string | null; email: string; role: string };
  project: { id: number; name: string | null } | null;
  replies: {
    id: number;
    body: string;
    createdAt: string;
    sender: { name: string | null; role: string };
  }[];
  _count: { replies: number };
};

type GuestMsg = {
  id: number;
  body: string;
  createdAt: string;
  isAdminReply: boolean;
  isRead: boolean;
};

type GuestSession = {
  id: string;
  name: string;
  email: string;
  updatedAt: string;
  messages: GuestMsg[];
  _count: { messages: number };
};

// Unified lista item
type ListItem =
  | { kind: "user"; data: UserMsg }
  | { kind: "guest"; data: GuestSession };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Most";
  if (m < 60) return `${m}p`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}ó`;
  return `${Math.floor(h / 24)}n`;
}

export default function AdminMessagesPage() {
  const searchParams = useSearchParams();

  const [userMsgs, setUserMsgs] = useState<UserMsg[]>([]);
  const [guestSessions, setGuestSessions] = useState<GuestSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "user" | "guest" | "project" | "standalone" | "unread"
  >("all");

  // Aktív thread
  const [activeUser, setActiveUser] = useState<UserMsg | null>(null);
  const [activeGuest, setActiveGuest] = useState<GuestSession | null>(null);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [userUnread, setUserUnread] = useState(0);
  const [guestUnanswered, setGuestUnanswered] = useState(0);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (filter === "unread") params.set("unread", "true");
    if (filter === "project") params.set("standalone", "false");

    const [userRes, guestRes] = await Promise.all([
      fetch(`/api/chat?${params}`),
      fetch("/api/chat/guest?list=true"),
    ]);
    const userData = await userRes.json();
    const guestData = await guestRes.json();

    let umsgs: UserMsg[] = userData.messages ?? [];
    if (filter === "project") umsgs = umsgs.filter((m) => m.project !== null);
    if (filter === "standalone")
      umsgs = umsgs.filter((m) => m.project === null);

    setUserMsgs(umsgs);
    setGuestSessions(guestData.sessions ?? []);
    setUserUnread(userData.unreadCount ?? 0);
    setGuestUnanswered(guestData.unanswered ?? 0);
    setLoading(false);

    // Active frissítése
    if (activeUser) {
      const u = umsgs.find((m) => m.id === activeUser.id);
      if (u) setActiveUser(u);
    }
    if (activeGuest) {
      const g = (guestData.sessions ?? []).find(
        (s: GuestSession) => s.id === activeGuest.id,
      );
      if (g) setActiveGuest(g);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // URL param: ?guest=sessionId (email linkből jön)
  useEffect(() => {
    const guestId = searchParams?.get("guest");
    if (guestId && guestSessions.length > 0) {
      const found = guestSessions.find((s) => s.id === guestId);
      if (found) {
        setActiveGuest(found);
        setActiveUser(null);
      }
    }
  }, [searchParams, guestSessions]);

  // ── User: olvasottnak jelöl ───────────────────────────────
  async function markUserRead(id: number) {
    await fetch(`/api/chat/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    setUserMsgs((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
    );
    setUserUnread((u) => Math.max(0, u - 1));
  }

  // ── User: törlés ──────────────────────────────────────────
  async function handleUserDelete(id: number) {
    if (!confirm("Törlöd ezt az üzenetet?")) return;
    await fetch(`/api/chat/${id}`, { method: "DELETE" });
    setUserMsgs((prev) => prev.filter((m) => m.id !== id));
    if (activeUser?.id === id) setActiveUser(null);
  }

  // ── User: válasz ──────────────────────────────────────────
  async function handleUserReply() {
    if (!reply.trim() || !activeUser) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: reply,
          parentId: activeUser.id,
          recipientId: activeUser.sender.id,
          projectId: activeUser.project?.id,
        }),
      });
      if (!res.ok) throw new Error();
      setReply("");
      await markUserRead(activeUser.id);
      await load();
    } catch {
    } finally {
      setSending(false);
    }
  }

  // ── Guest: válasz ─────────────────────────────────────────
  async function handleGuestReply() {
    if (!reply.trim() || !activeGuest) return;
    setSending(true);
    try {
      const res = await fetch(`/api/chat/guest/${activeGuest.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply }),
      });
      if (!res.ok) throw new Error();
      setReply("");
      await load();
    } catch {
    } finally {
      setSending(false);
    }
  }

  // ── Unified lista építés ──────────────────────────────────
  const listItems: ListItem[] = [];
  if (filter !== "guest" && filter !== "project") {
    guestSessions.forEach((g) => listItems.push({ kind: "guest", data: g }));
  }
  if (filter !== "guest") {
    userMsgs.forEach((m) => listItems.push({ kind: "user", data: m }));
  }
  if (filter === "guest") {
    guestSessions.forEach((g) => listItems.push({ kind: "guest", data: g }));
  }
  // Időrendbe rendezés
  listItems.sort((a, b) => {
    const aTime = a.kind === "user" ? a.data.createdAt : a.data.updatedAt;
    const bTime = b.kind === "user" ? b.data.createdAt : b.data.updatedAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  const totalUnread = userUnread + guestUnanswered;
  const hasActive = activeUser || activeGuest;

  return (
    <div className="h-screen bg-[#0C0A08] text-[#D4C4B0] flex flex-col overflow-hidden">
      {/* Fejléc */}
      <div className="border-b border-white/[0.05] px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between gap-4 flex-wrap shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-[#3A3530] hover:text-[#D4C4B0] transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-4 h-4"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <div className="w-3 h-px bg-[#C8A882]/40" />
          <h1 className="font-['Cormorant_Garamond'] text-[1.8rem] font-light text-white leading-none">
            Üzenetek
          </h1>
          {totalUnread > 0 && (
            <span className="text-[9px] bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/20 px-2 py-0.5">
              {totalUnread} új
            </span>
          )}
        </div>
        <div className="flex border border-white/[0.06]">
          {(
            [
              { key: "all", label: "Mind" },
              { key: "standalone", label: "Általános" },
              { key: "user", label: "Tagok" },
              { key: "guest", label: "Vendégek" },
              { key: "project", label: "Projekthez" },
              { key: "unread", label: "Olvasatlan" },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setFilter(f.key);
                setActiveUser(null);
                setActiveGuest(null);
              }}
              className={`px-3 py-2 text-[10px] tracking-[0.06em] uppercase transition-all border-r border-white/[0.04] last:border-r-0 ${filter === f.key ? "bg-[#C8A882]/15 text-[#C8A882]" : "text-[#3A3530] hover:text-[#5A5248]"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tartalom */}
      <div className="flex flex-1 overflow-hidden">
        {/* Bal: lista */}
        <div
          className={`flex flex-col border-r border-white/[0.05] overflow-y-auto ${hasActive ? "hidden lg:flex lg:w-[320px] shrink-0" : "flex-1"}`}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-4 h-4 border border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
            </div>
          ) : listItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[12px] text-[#3A3530]">Nincs üzenet.</p>
            </div>
          ) : (
            listItems.map((item, i) => {
              if (item.kind === "guest") {
                const g = item.data;
                const lastMsg = g.messages[0];
                const needsReply = lastMsg && !lastMsg.isAdminReply;
                const isActive = activeGuest?.id === g.id;
                return (
                  <div
                    key={`guest-${g.id}`}
                    onClick={() => {
                      setActiveGuest(g);
                      setActiveUser(null);
                    }}
                    className={`px-4 py-4 border-b border-white/[0.03] cursor-pointer transition-colors ${isActive ? "bg-[#C8A882]/6 border-l-2 border-l-[#C8A882]" : "hover:bg-white/[0.02]"}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {needsReply && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] shrink-0" />
                        )}
                        <div className="w-7 h-7 border border-[#FBBF24]/20 bg-[#FBBF24]/5 flex items-center justify-center font-['Cormorant_Garamond'] text-[12px] text-[#FBBF24] shrink-0">
                          {g.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <div className="text-[12px] text-[#D4C4B0] font-medium truncate">
                              {g.name}
                            </div>
                            <span className="text-[8px] border border-[#FBBF24]/20 text-[#FBBF24]/60 px-1">
                              vendég
                            </span>
                          </div>
                          <div className="text-[10px] text-[#3A3530] truncate">
                            {g.email}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-[#3A3530]">
                          {timeAgo(g.updatedAt)}
                        </div>
                        <div className="text-[9px] text-[#3A3530] mt-0.5">
                          {g._count.messages} üzenet
                        </div>
                      </div>
                    </div>
                    {lastMsg && (
                      <p className="text-[11px] text-[#5A5248] line-clamp-1 ml-9">
                        {lastMsg.body}
                      </p>
                    )}
                    {needsReply && (
                      <div className="ml-9 mt-1 text-[9px] text-[#FBBF24]/60">
                        Válaszra vár
                      </div>
                    )}
                  </div>
                );
              }

              // User üzenet
              const msg = item.data;
              const isUnread = !msg.isRead && !msg.isAdminReply;
              const isActive = activeUser?.id === msg.id;
              return (
                <div
                  key={`user-${msg.id}`}
                  onClick={() => {
                    setActiveUser(msg);
                    setActiveGuest(null);
                    if (isUnread) markUserRead(msg.id);
                  }}
                  className={`px-4 py-4 border-b border-white/[0.03] cursor-pointer transition-colors ${isActive ? "bg-[#C8A882]/6 border-l-2 border-l-[#C8A882]" : "hover:bg-white/[0.02]"}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {isUnread && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C8A882] shrink-0" />
                      )}
                      <div className="w-7 h-7 border border-[#C8A882]/20 flex items-center justify-center font-['Cormorant_Garamond'] text-[12px] text-[#C8A882] shrink-0">
                        {msg.sender.name?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] text-[#D4C4B0] font-medium truncate">
                          {msg.sender.name ?? "—"}
                        </div>
                        <div className="text-[10px] text-[#3A3530] truncate">
                          {msg.sender.email}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-[#3A3530]">
                        {timeAgo(msg.createdAt)}
                      </div>
                      {msg._count.replies > 0 && (
                        <div className="text-[9px] text-[#C8A882]/40 mt-0.5">
                          {msg._count.replies} válasz
                        </div>
                      )}
                    </div>
                  </div>
                  {msg.project && (
                    <div className="text-[9px] tracking-[0.08em] uppercase text-[#C8A882]/40 mb-1 ml-9">
                      📁 {msg.project.name}
                    </div>
                  )}
                  <p className="text-[11px] text-[#5A5248] line-clamp-1 ml-9">
                    {msg.body}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Jobb: thread ── USER */}
        {activeUser && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-start justify-between gap-4 shrink-0">
              <div>
                <button
                  onClick={() => setActiveUser(null)}
                  className="lg:hidden text-[10px] text-[#3A3530] hover:text-[#C8A882] flex items-center gap-1 mb-1.5"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-3 h-3"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Vissza
                </button>
                <div className="text-[13px] text-[#D4C4B0] font-medium">
                  {activeUser.sender.name ?? activeUser.sender.email}
                </div>
                <div className="text-[10px] text-[#3A3530]">
                  {activeUser.sender.email}
                </div>
                {activeUser.project && (
                  <Link
                    href={`/admin/projects/${activeUser.project.id}`}
                    className="text-[10px] text-[#C8A882]/50 hover:text-[#C8A882] flex items-center gap-1 mt-0.5"
                  >
                    📁 {activeUser.project.name} →
                  </Link>
                )}
              </div>
              <button
                onClick={() => handleUserDelete(activeUser.id)}
                className="text-[10px] text-[#F87171]/40 hover:text-[#F87171] border border-[#F87171]/20 px-2 py-1 hover:border-[#F87171]/40 transition-colors shrink-0"
              >
                Törlés
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="w-7 h-7 border border-[#C8A882]/20 flex items-center justify-center font-['Cormorant_Garamond'] text-[11px] text-[#C8A882] shrink-0 mt-0.5">
                  {activeUser.sender.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-[#5A5248]">
                      {activeUser.sender.name}
                    </span>
                    <span className="text-[10px] text-[#3A3530]">
                      {new Date(activeUser.createdAt).toLocaleString("hu-HU", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="bg-[#141210] border border-white/[0.05] px-4 py-3 text-[13px] text-[#D4C4B0] leading-relaxed">
                    {activeUser.body}
                  </div>
                </div>
              </div>
              {activeUser.replies.map((r) => (
                <div
                  key={r.id}
                  className={`flex gap-3 ${r.sender.role === "ADMIN" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 border flex items-center justify-center font-['Cormorant_Garamond'] text-[11px] shrink-0 mt-0.5 ${r.sender.role === "ADMIN" ? "border-[#C8A882]/40 text-[#C8A882] bg-[#C8A882]/8" : "border-white/[0.1] text-[#5A5248]"}`}
                  >
                    {r.sender.role === "ADMIN"
                      ? "A"
                      : (r.sender.name?.charAt(0).toUpperCase() ?? "?")}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`flex items-center gap-2 mb-1 ${r.sender.role === "ADMIN" ? "justify-end" : ""}`}
                    >
                      <span className="text-[10px] text-[#3A3530]">
                        {timeAgo(r.createdAt)}
                      </span>
                      <span className="text-[11px] text-[#5A5248]">
                        {r.sender.role === "ADMIN" ? "Admin" : r.sender.name}
                      </span>
                    </div>
                    <div
                      className={`border px-4 py-3 text-[13px] leading-relaxed ${r.sender.role === "ADMIN" ? "bg-[#C8A882]/8 border-[#C8A882]/20 text-[#D4C4B0]" : "bg-[#141210] border-white/[0.05] text-[#D4C4B0]"}`}
                    >
                      {r.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="shrink-0 border-t border-white/[0.05] p-4 flex gap-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleUserReply();
                  }
                }}
                rows={3}
                placeholder="Válasz... (Enter = küldés)"
                className="flex-1 bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 resize-none"
              />
              <button
                onClick={handleUserReply}
                disabled={!reply.trim() || sending}
                className="px-4 bg-[#C8A882] text-[11px] tracking-[0.1em] uppercase text-[#0C0A08] font-medium hover:bg-[#D4B892] transition-all disabled:opacity-40 self-end py-3"
              >
                {sending ? "..." : "Küld →"}
              </button>
            </div>
          </div>
        )}

        {/* Jobb: thread ── GUEST */}
        {activeGuest && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-start justify-between gap-4 shrink-0">
              <div>
                <button
                  onClick={() => setActiveGuest(null)}
                  className="lg:hidden text-[10px] text-[#3A3530] hover:text-[#C8A882] flex items-center gap-1 mb-1.5"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-3 h-3"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Vissza
                </button>
                <div className="flex items-center gap-2">
                  <div className="text-[13px] text-[#D4C4B0] font-medium">
                    {activeGuest.name}
                  </div>
                  <span className="text-[8px] border border-[#FBBF24]/20 text-[#FBBF24]/60 px-1.5 py-0.5">
                    vendég
                  </span>
                </div>
                <a
                  href={`mailto:${activeGuest.email}`}
                  className="text-[10px] text-[#C8A882]/50 hover:text-[#C8A882] transition-colors"
                >
                  {activeGuest.email}
                </a>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {activeGuest.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isAdminReply ? "flex-row-reverse" : ""} gap-3`}
                >
                  <div
                    className={`w-7 h-7 border flex items-center justify-center font-['Cormorant_Garamond'] text-[11px] shrink-0 mt-0.5 ${msg.isAdminReply ? "border-[#C8A882]/40 text-[#C8A882] bg-[#C8A882]/8" : "border-[#FBBF24]/20 text-[#FBBF24] bg-[#FBBF24]/5"}`}
                  >
                    {msg.isAdminReply
                      ? "A"
                      : activeGuest.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`flex items-center gap-2 mb-1 ${msg.isAdminReply ? "justify-end" : ""}`}
                    >
                      <span className="text-[10px] text-[#3A3530]">
                        {timeAgo(msg.createdAt)}
                      </span>
                      <span className="text-[11px] text-[#5A5248]">
                        {msg.isAdminReply ? "Admin" : activeGuest.name}
                      </span>
                    </div>
                    <div
                      className={`border px-4 py-3 text-[13px] leading-relaxed ${msg.isAdminReply ? "bg-[#C8A882]/8 border-[#C8A882]/20 text-[#D4C4B0]" : "bg-[#141210] border-white/[0.05] text-[#D4C4B0]"}`}
                    >
                      {msg.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="shrink-0 border-t border-white/[0.05] p-4 flex gap-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGuestReply();
                  }
                }}
                rows={3}
                placeholder="Válasz a vendégnek... (emailen is értesítjük)"
                className="flex-1 bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 resize-none"
              />
              <button
                onClick={handleGuestReply}
                disabled={!reply.trim() || sending}
                className="px-4 bg-[#C8A882] text-[11px] tracking-[0.1em] uppercase text-[#0C0A08] font-medium hover:bg-[#D4B892] transition-all disabled:opacity-40 self-end py-3"
              >
                {sending ? "..." : "Küld →"}
              </button>
            </div>
          </div>
        )}

        {/* Üres jobb panel */}
        {!hasActive && (
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="text-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C8A882"
                strokeWidth="1"
                className="w-10 h-10 mx-auto mb-3 opacity-15"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-[12px] text-[#3A3530]">Válassz üzenetet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
