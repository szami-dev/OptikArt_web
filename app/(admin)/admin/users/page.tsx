"use client";

import { useEffect, useState, useCallback } from "react";

type Role = "ADMIN" | "USER";
type Status = "active" | "pending";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  isVerified: boolean;
};

type SortField = "name" | "email" | "role" | "id";
type SortDir = "asc" | "desc";
type ModalMode = "edit" | "create" | "delete" | "more" | null;

const Icons = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  warning: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  phone: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2.64h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.71-.71a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  mail: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
};

// ── Státusz badge ─────────────────────────────────────────────
function StatusBadge({ verified }: { verified: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] tracking-[0.12em] uppercase px-2 py-1 border ${
      verified
        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
        : "bg-amber-500/10 border-amber-500/25 text-amber-400"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${verified ? "bg-emerald-400" : "bg-amber-400"}`} />
      {verified ? "Aktív" : "Függőben"}
    </span>
  );
}

// ── Role badge ────────────────────────────────────────────────
function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] tracking-[0.12em] uppercase px-2 py-1 border ${
      role === "ADMIN"
        ? "bg-[#C8A882]/10 border-[#C8A882]/25 text-[#C8A882]"
        : "bg-white/[0.03] border-white/[0.08] text-[#5A5248]"
    }`}>
      {role === "ADMIN" && <span>{Icons.shield}</span>}
      {role === "ADMIN" ? "Admin" : "User"}
    </span>
  );
}

// ── Input ─────────────────────────────────────────────────────
function DarkInput({ label, icon, error, ...props }: {
  label: string; icon?: React.ReactNode; error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] tracking-[0.16em] uppercase text-[#5A5248]">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3530]">{icon}</span>}
        <input {...props} className={`w-full bg-[#0F0D0B] border text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] focus:outline-none transition-colors py-2.5 ${icon ? "pl-9 pr-3" : "px-3"} ${error ? "border-red-500/40 focus:border-red-500/70" : "border-white/[0.08] focus:border-[#C8A882]/50"}`} />
      </div>
      {error && <p className="text-[11px] text-red-400/70">{error}</p>}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────
function Modal({ mode, user, onClose, onSave, onDelete }: {
  mode: ModalMode; user: User | null;
  onClose: () => void;
  onSave: (data: Partial<User> & { password?: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    role: user?.role ?? "USER" as Role,
    isVerified: user?.isVerified ?? false,
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Kötelező mező";
    if (!form.email.trim()) e.email = "Kötelező mező";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Érvénytelen email";
    if (mode === "create" && !form.password) e.password = "Kötelező mező";
    if (form.password && form.password.length < 6) e.password = "Min. 6 karakter";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    await onSave({ id: user?.id, name: form.name, email: form.email, phone: form.phone || null, role: form.role, isVerified: form.isVerified, ...(form.password ? { password: form.password } : {}) });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full sm:max-w-md mx-0 sm:mx-4 bg-[#0E0C0A] border border-white/[0.08] shadow-2xl sm:rounded-none rounded-t-xl" onClick={e => e.stopPropagation()}>

        {/* Handle mobil */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-4 h-px bg-[#C8A882]/50" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/60">
                {mode === "create" ? "Új felhasználó" : mode === "edit" ? "Szerkesztés" : "Törlés"}
              </span>
            </div>
            <h3 className="font-['Cormorant_Garamond'] text-[1.3rem] font-light text-white">
              {mode === "create" ? "Felhasználó létrehozása" : mode === "edit" ? user?.name : "Biztosan törlöd?"}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 border border-white/[0.08] flex items-center justify-center text-[#5A5248] hover:text-white transition-all">
            {Icons.close}
          </button>
        </div>

        {mode === "delete" && user && (
          <div className="px-5 py-5 flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 bg-red-500/[0.07] border border-red-500/20">
              <span className="text-red-400 shrink-0 mt-0.5">{Icons.warning}</span>
              <p className="text-[13px] text-[#D4C4B0] leading-relaxed">
                <span className="text-white font-medium">{user.name}</span> véglegesen törlésre kerül.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 border border-white/[0.08] text-[11px] tracking-[0.12em] uppercase text-[#5A5248] hover:text-[#D4C4B0] transition-all">Mégsem</button>
              <button onClick={async () => { setSaving(true); await onDelete(user.id); setSaving(false); }} disabled={saving} className="flex-1 py-2.5 bg-red-500/80 text-[11px] tracking-[0.12em] uppercase text-white hover:bg-red-500 transition-all disabled:opacity-50">
                {saving ? "Törlés..." : "Törlés megerősítése"}
              </button>
            </div>
          </div>
        )}
        {mode === "more" && user && !user.isVerified && (
            <div className="px-5 py-5 flex flex-col gap-4">
              <div className="flex items-start gap-3 p-3 bg-red-500/[0.07] border border-red-500/20">
                <span className="text-red-400 shrink-0 mt-0.5">{Icons.warning}</span>
                <p className="text-[13px] text-[#D4C4B0] leading-relaxed">
                  <span className="text-white font-medium">{user.name}</span> nincs megerítve. Nem fog tudni bejelentkezni, amíg ez meg nem történik.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 border border-white/[0.08] text-[11px] tracking-[0.12em] uppercase text-[#5A5248] hover:text-[#D4C4B0] transition-all">Mégsem</button>
                <button onClick={async () => { setSaving(true); await onSave({ id: user.id, isVerified: true }); setSaving(false); }} disabled={saving} className="flex-1 py-2.5 bg-emerald-500/80 text-[11px] tracking-[0.12em] uppercase text-white hover:bg-emerald-500 transition-all disabled:opacity-50">
                  {saving ? "Megerősítés..." : "Megerősítés"}
                </button>
              </div>
            </div>
        )}

        {(mode === "edit" || mode === "create") && (
          <div className="px-5 py-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            <DarkInput label="Teljes név" icon={Icons.user} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Pl. Kovács János" error={errors.name} />
            <DarkInput label="Email" icon={Icons.mail} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="pelda@email.com" error={errors.email} />
            <DarkInput label="Telefon" icon={Icons.phone} type="tel" value={form.phone ?? ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+36 30 123 4567" />
            <DarkInput label={mode === "create" ? "Jelszó" : "Új jelszó (üresen = nem változik)"} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" error={errors.password} />

            {/* Role + Státusz egy sorban */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.16em] uppercase text-[#5A5248]">Szerepkör</label>
                <div className="flex border border-white/[0.06]">
                  {(["USER", "ADMIN"] as Role[]).map(r => (
                    <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                      className={`flex-1 py-2 text-[10px] tracking-[0.1em] uppercase border-r border-white/[0.04] last:border-r-0 transition-all ${form.role === r ? (r === "ADMIN" ? "bg-[#C8A882]/15 text-[#C8A882]" : "bg-white/[0.06] text-white") : "text-[#3A3530] hover:text-[#5A5248]"}`}>
                      {r === "ADMIN" ? "Admin" : "User"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.16em] uppercase text-[#5A5248]">Státusz</label>
                <div className="flex border border-white/[0.06]">
                  {[{ v: true, l: "Aktív" }, { v: false, l: "Függő" }].map(({ v, l }) => (
                    <button key={String(v)} type="button" onClick={() => setForm(f => ({ ...f, isVerified: v }))}
                      className={`flex-1 py-2 text-[10px] tracking-[0.1em] uppercase border-r border-white/[0.04] last:border-r-0 transition-all ${form.isVerified === v ? (v ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/10 text-amber-400") : "text-[#3A3530] hover:text-[#5A5248]"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 border border-white/[0.08] text-[11px] tracking-[0.12em] uppercase text-[#5A5248] hover:text-[#D4C4B0] transition-all">Mégsem</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#C8A882] text-[11px] tracking-[0.12em] uppercase text-[#0E0C0A] hover:bg-[#D4B892] transition-all disabled:opacity-50 font-medium">
                {saving ? "Mentés..." : mode === "create" ? "Létrehozás" : "Mentés"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-4 right-4 z-[200] flex items-center gap-3 px-4 py-3 border text-[13px] shadow-2xl max-w-[calc(100vw-2rem)] ${type === "success" ? "bg-[#0E0C0A] border-[#C8A882]/30 text-[#D4C4B0]" : "bg-[#0E0C0A] border-red-500/30 text-red-400"}`}>
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${type === "success" ? "bg-[#C8A882]" : "bg-red-400"}`} />
      <span className="flex-1 min-w-0 truncate">{message}</span>
      <button onClick={onClose} className="text-[#5A5248] hover:text-white transition-colors shrink-0">{Icons.close}</button>
    </div>
  );
}

// ── Fő oldal ──────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "active" | "pending">("ALL");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<{ mode: ModalMode; user: User | null }>({ mode: null, user: null });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/getusers");
      const data = await res.json();
      setUsers(data.users);
    } catch { showToast("Nem sikerült betölteni", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function showToast(message: string, type: "success" | "error") { setToast({ message, type }); }

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone ?? "").includes(q);
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchStatus = statusFilter === "ALL" || (statusFilter === "active" ? u.isVerified : !u.isVerified);
      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      let av: any = a[sortField] ?? ""; let bv: any = b[sortField] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  const allSelected = filtered.length > 0 && filtered.every(u => selected.has(u.id));
  function toggleAll() { allSelected ? setSelected(new Set()) : setSelected(new Set(filtered.map(u => u.id))); }
  function toggleOne(id: number) { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  async function handleSave(data: Partial<User> & { password?: string }) {
    const isEdit = !!data.id;
    try {
      const res = await fetch(isEdit ? `/api/user/${data.id}/update` : "/api/user/create", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      await fetchUsers();
      setModal({ mode: null, user: null });
      showToast(isEdit ? "Felhasználó frissítve" : "Felhasználó létrehozva", "success");
    } catch (e: any) { showToast(e.message ?? "Hiba történt", "error"); }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/user/${id}/delete`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setUsers(prev => prev.filter(u => u.id !== id));
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      setModal({ mode: null, user: null });
      showToast("Felhasználó törölve", "success");
    } catch { showToast("Hiba a törlés során", "error"); }
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map(id => fetch(`/api/user/${id}/delete`, { method: "DELETE" })));
      setUsers(prev => prev.filter(u => !ids.includes(u.id)));
      setSelected(new Set());
      showToast(`${ids.length} felhasználó törölve`, "success");
    } catch { showToast("Hiba a tömeges törlés során", "error"); }
  }

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === "ADMIN").length;
  const activeCount = users.filter(u => u.isVerified).length;

  const SortBtn = ({ field, label }: { field: SortField; label: string }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 text-[9px] tracking-[0.16em] uppercase text-[#3A3530] hover:text-[#5A5248] transition-colors">
      {label}
      <span className={sortField === field ? "text-[#C8A882]" : ""}>
        {sortField === field
          ? sortDir === "asc"
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 inline"><polyline points="18 15 12 9 6 15"/></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 inline"><polyline points="6 9 12 15 18 9"/></svg>
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 inline opacity-40"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
        }
      </span>
    </button>
  );

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
            <h1 className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2rem] font-light text-white leading-tight">Felhasználókezelés</h1>
            <p className="text-[12px] text-[#3A3530] mt-0.5">{totalUsers} felhasználó az adatbázisban</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchUsers} className="w-9 h-9 border border-white/[0.08] flex items-center justify-center text-[#3A3530] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all" title="Frissítés">{Icons.refresh}</button>
            <button onClick={() => setModal({ mode: "create", user: null })} className="flex items-center gap-2 bg-[#C8A882] text-[#0C0A08] text-[11px] tracking-[0.14em] uppercase px-4 py-2.5 hover:bg-[#D4B892] transition-colors font-medium whitespace-nowrap">
              {Icons.plus}<span className="hidden sm:inline">Új felhasználó</span><span className="sm:hidden">Új</span>
            </button>

            <button onClick={() => setModal({ mode: "more", user: null })} className="flex items-center gap-2 bg-[#1A1A1A] text-[#C8A882] text-[11px] tracking-[0.14em] uppercase px-4 py-2.5 hover:bg-[#2E2E2E] transition-colors font-medium whitespace-nowrap">
              {Icons.plus}<span className="hidden sm:inline">Több felhasználó generálása</span><span className="sm:hidden">Új</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4">

        {/* Stat kártyák */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Összes", value: totalUsers, color: "#C8A882" },
            { label: "Admin", value: adminCount, color: "#C8A882" },
            { label: "Aktív", value: activeCount, color: "#34d399" },
          ].map(s => (
            <div key={s.label} className="bg-[#0E0C0A] border border-white/[0.05] px-3 sm:px-5 py-3 sm:py-4">
              <div className="text-[9px] tracking-[0.16em] uppercase text-[#3A3530] mb-1.5">{s.label}</div>
              <div className="font-['Cormorant_Garamond'] text-[1.6rem] sm:text-[2rem] font-light leading-none" style={{ color: s.color }}>
                {loading ? "—" : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Szűrő sáv */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Keresés */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3530]">{Icons.search}</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Keresés..." className="w-full bg-[#0E0C0A] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] focus:outline-none focus:border-[#C8A882]/40 pl-9 pr-8 py-2.5 transition-colors" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A3530] hover:text-[#D4C4B0] transition-colors">{Icons.close}</button>}
          </div>

          {/* Filterek */}
          <div className="flex gap-2 flex-wrap">
            {/* Role */}
            <div className="flex border border-white/[0.06]">
              {(["ALL", "ADMIN", "USER"] as const).map(r => (
                <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-2 text-[10px] tracking-[0.1em] uppercase transition-all border-r border-white/[0.04] last:border-r-0 ${roleFilter === r ? "bg-[#C8A882]/15 text-[#C8A882]" : "text-[#3A3530] hover:text-[#5A5248]"}`}>
                  {r === "ALL" ? "Mind" : r}
                </button>
              ))}
            </div>

            {/* Státusz */}
            <div className="flex border border-white/[0.06]">
              {(["ALL", "active", "pending"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 text-[10px] tracking-[0.1em] uppercase transition-all border-r border-white/[0.04] last:border-r-0 ${statusFilter === s ? (s === "active" ? "bg-emerald-500/15 text-emerald-400" : s === "pending" ? "bg-amber-500/10 text-amber-400" : "bg-[#C8A882]/15 text-[#C8A882]") : "text-[#3A3530] hover:text-[#5A5248]"}`}>
                  {s === "ALL" ? "Mind" : s === "active" ? "Aktív" : "Függő"}
                </button>
              ))}
            </div>

            {/* Bulk delete */}
            {selected.size > 0 && (
              <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] tracking-[0.1em] uppercase hover:bg-red-500/15 transition-all">
                {Icons.trash}<span>{selected.size} törlése</span>
              </button>
            )}
          </div>
        </div>

        {/* Találat szám */}
        <div className="text-[10px] text-[#3A3530]">{filtered.length} / {totalUsers} találat</div>

        {/* ── DESKTOP táblázat ── */}
        <div className="hidden lg:block bg-[#0E0C0A] border border-white/[0.05] overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_1.2fr_110px_120px_110px_88px] items-center border-b border-white/[0.05] px-4 gap-2">
            <div className="py-3 flex items-center justify-center">
              <button onClick={toggleAll} className={`w-4 h-4 border flex items-center justify-center transition-all ${allSelected ? "bg-[#C8A882] border-[#C8A882]" : "border-white/[0.15] hover:border-white/30"}`}>
                {allSelected && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
            </div>
            <SortBtn field="name" label="Név" />
            <SortBtn field="email" label="Email" />
            <div className="text-[9px] tracking-[0.16em] uppercase text-[#3A3530] py-3">Telefon</div>
            <SortBtn field="role" label="Szerepkör" />
            <div className="text-[9px] tracking-[0.16em] uppercase text-[#3A3530] py-3">Státusz</div>
            <div className="py-3 text-right text-[9px] tracking-[0.16em] uppercase text-[#3A3530]">Műveletek</div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-4 h-4 border border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
              <span className="text-[12px] text-[#3A3530]">Betöltés...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="w-8 h-px bg-[#C8A882]/20" />
              <span className="text-[12px] text-[#3A3530]">Nincs találat</span>
            </div>
          ) : (
            filtered.map(user => (
              <div key={user.id} className={`grid grid-cols-[40px_1fr_1.2fr_110px_120px_110px_88px] items-center px-4 gap-2 border-b border-white/[0.03] transition-colors ${selected.has(user.id) ? "bg-[#C8A882]/[0.04]" : "hover:bg-white/[0.02]"}`}>
                <div className="py-3.5 flex items-center justify-center">
                  <button onClick={() => toggleOne(user.id)} className={`w-4 h-4 border flex items-center justify-center transition-all ${selected.has(user.id) ? "bg-[#C8A882] border-[#C8A882]" : "border-white/[0.1] hover:border-white/25"}`}>
                    {selected.has(user.id) && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                </div>
                <div className="py-3.5 flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 border border-white/[0.08] flex items-center justify-center font-['Cormorant_Garamond'] text-[13px] text-[#C8A882] shrink-0">{user.name.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0">
                    <div className="text-[13px] text-[#D4C4B0] truncate">{user.name}</div>
                    <div className="text-[10px] text-[#3A3530]">#{user.id}</div>
                  </div>
                </div>
                <div className="py-3.5 text-[12px] text-[#5A5248] truncate pr-2">{user.email}</div>
                <div className="py-3.5 text-[12px] text-[#5A5248]">{user.phone ?? <span className="text-[#2A2520]">—</span>}</div>
                <div className="py-3.5"><RoleBadge role={user.role} /></div>
                <div className="py-3.5"><StatusBadge verified={user.isVerified} /></div>
                <div className="py-3.5 flex items-center justify-end gap-1.5">
                  <button onClick={() => setModal({ mode: "edit", user })} className="w-7 h-7 border border-white/[0.06] flex items-center justify-center text-[#3A3530] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all" title="Szerkesztés">{Icons.edit}</button>
                  <button onClick={() => setModal({ mode: "delete", user })} className="w-7 h-7 border border-white/[0.06] flex items-center justify-center text-[#3A3530] hover:text-red-400 hover:border-red-500/30 transition-all" title="Törlés">{Icons.trash}</button>
                </div>
              </div>
            ))
          )}

          {!loading && filtered.length > 0 && (
            <div className="px-4 py-2.5 flex items-center justify-between border-t border-white/[0.03]">
              <span className="text-[10px] text-[#2A2520]">{selected.size > 0 ? `${selected.size} kijelölve` : `${filtered.length} sor`}</span>
              <span className="text-[10px] text-[#2A2520]">Rendezve: {sortField} {sortDir === "asc" ? "↑" : "↓"}</span>
            </div>
          )}
        </div>

        {/* ── MOBIL kártyák ── */}
        <div className="lg:hidden flex flex-col gap-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <div className="w-4 h-4 border border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
              <span className="text-[12px] text-[#3A3530]">Betöltés...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <div className="w-8 h-px bg-[#C8A882]/20" />
              <span className="text-[12px] text-[#3A3530]">Nincs találat</span>
            </div>
          ) : (
            filtered.map(user => (
              <div key={user.id} className={`bg-[#0E0C0A] border transition-colors ${selected.has(user.id) ? "border-[#C8A882]/20 bg-[#C8A882]/[0.03]" : "border-white/[0.05]"}`}>
                <div className="flex items-start gap-3 p-4">
                  {/* Checkbox */}
                  <button onClick={() => toggleOne(user.id)} className={`w-4 h-4 border flex items-center justify-center transition-all shrink-0 mt-0.5 ${selected.has(user.id) ? "bg-[#C8A882] border-[#C8A882]" : "border-white/[0.1]"}`}>
                    {selected.has(user.id) && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>

                  {/* Avatar */}
                  <div className="w-9 h-9 border border-white/[0.08] flex items-center justify-center font-['Cormorant_Garamond'] text-[16px] text-[#C8A882] shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Infó */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="text-[14px] text-[#D4C4B0] font-medium truncate">{user.name}</div>
                        <div className="text-[11px] text-[#5A5248] truncate mt-0.5">{user.email}</div>
                      </div>
                      {/* Műveletek */}
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setModal({ mode: "edit", user })} className="w-8 h-8 border border-white/[0.06] flex items-center justify-center text-[#3A3530] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all">{Icons.edit}</button>
                        <button onClick={() => setModal({ mode: "delete", user })} className="w-8 h-8 border border-white/[0.06] flex items-center justify-center text-[#3A3530] hover:text-red-400 hover:border-red-500/30 transition-all">{Icons.trash}</button>
                      </div>
                    </div>

                    {/* Badges + telefon */}
                    <div className="flex flex-wrap items-center gap-2">
                      <RoleBadge role={user.role} />
                      <StatusBadge verified={user.isVerified} />
                      {user.phone && <span className="text-[10px] text-[#3A3530]">{user.phone}</span>}
                      <span className="text-[10px] text-[#2A2520]">#{user.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modal.mode && (
        <Modal mode={modal.mode} user={modal.user} onClose={() => setModal({ mode: null, user: null })} onSave={handleSave} onDelete={handleDelete} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}