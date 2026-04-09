"use client";

import { useEffect, useState, useCallback } from "react";

type BulletPoint = { id: number; title: string | null };
type Category    = { id: number; name: string | null };
type Package     = {
  id: number; name: string | null; description: string | null;
  price: number | null; categoryId: number | null; subtype: string | null;
  category: Category | null; bulletPoints: BulletPoint[];
  createdAt: string;
};

// ── Csak esküvő és portré kategória ──────────────────────────
const CATEGORY_NAMES: Record<number, string> = {
  1: "Esküvő",
  2: "Portré",
};

const ESKUVO_SUBTYPES = [
  { value: "foto",      label: "Fotózás" },
  { value: "video",     label: "Videózás" },
  { value: "kombinalt", label: "Kombinált (Fotó + Videó)" },
];

const PORTRE_SUBTYPES = [
  { value: "paros",   label: "Páros / Jegyesfotózás" },
  { value: "csaladi", label: "Családi fotózás" },
  { value: "egyeni",  label: "Egyéni portré" },
];

function getSubtypeLabel(catId: number | null, subtype: string | null): string {
  if (!subtype) return "—";
  const list = catId === 1 ? ESKUVO_SUBTYPES : catId === 2 ? PORTRE_SUBTYPES : [];
  return list.find(s => s.value === subtype)?.label ?? subtype;
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "success"|"error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-4 right-4 z-[200] flex items-center gap-3 px-4 py-3 border text-[13px] bg-[#0E0C0A] ${type === "success" ? "border-[#C8A882]/30 text-[#D4C4B0]" : "border-red-500/30 text-red-400"}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${type === "success" ? "bg-[#C8A882]" : "bg-red-400"}`} />
      {msg}
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100">✕</button>
    </div>
  );
}

function DarkField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] tracking-[0.14em] uppercase text-[#5A5248]">
        {label}{required && <span className="text-[#C8A882]/60 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 transition-colors";

// ── Csomag form modal ─────────────────────────────────────────
function PackageModal({ pkg, onClose, onSaved }: {
  pkg: Package | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !pkg;
  const [name, setName]       = useState(pkg?.name ?? "");
  const [desc, setDesc]       = useState(pkg?.description ?? "");
  const [price, setPrice]     = useState(pkg?.price?.toString() ?? "");
  const [catId, setCatId]     = useState<number>(pkg?.categoryId ?? 1);
  const [subtype, setSubtype] = useState<string>(pkg?.subtype ?? "");
  const [bullets, setBullets] = useState<string[]>(
    pkg?.bulletPoints.map(b => b.title ?? "") ?? [""]
  );
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  // Kategória váltásnál subtype reset
  useEffect(() => { setSubtype(""); }, [catId]);

  const subtypeOptions = catId === 1 ? ESKUVO_SUBTYPES : PORTRE_SUBTYPES;

  function updateBullet(i: number, val: string) {
    setBullets(prev => { const n = [...prev]; n[i] = val; return n; });
  }
  function addBullet() { setBullets(prev => [...prev, ""]); }
  function removeBullet(i: number) { setBullets(prev => prev.filter((_, j) => j !== i)); }

  async function handleSave() {
    if (!name.trim()) { setError("A csomag neve kötelező"); return; }
    if (!subtype)     { setError("A subtípus kötelező"); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        name: name.trim(),
        description: desc.trim() || null,
        price: price ? parseFloat(price.replace(/[^0-9.]/g, "")) : null,
        categoryId: catId,
        subtype,
        bulletPoints: bullets.filter(b => b.trim()),
      };
      const res = await fetch(
        isNew ? "/api/packages" : `/api/packages/${pkg.id}`,
        { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      if (!res.ok) throw new Error((await res.json()).error);
      onSaved();
    } catch (e: any) {
      setError(e.message ?? "Hiba a mentésnél");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-[#0E0C0A] border border-white/[0.08] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] sticky top-0 bg-[#0E0C0A]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-3 h-px bg-[#C8A882]/50" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/50">Csomag kezelő</span>
            </div>
            <h3 className="font-['Cormorant_Garamond'] text-[1.2rem] font-light text-white">
              {isNew ? "Új csomag" : "Csomag szerkesztése"}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 border border-white/[0.08] flex items-center justify-center text-[#5A5248] hover:text-white transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">

          <DarkField label="Csomag neve" required>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Pl. Prémium fotó" className={inputCls} />
          </DarkField>

          <div className="grid grid-cols-2 gap-3">
            {/* Kategória – csak Esküvő / Portré */}
            <DarkField label="Kategória" required>
              <select value={catId} onChange={e => setCatId(parseInt(e.target.value))} className={inputCls}>
                {Object.entries(CATEGORY_NAMES).map(([id, label]) => (
                  <option key={id} value={id} style={{ background: "#141210" }}>{label}</option>
                ))}
              </select>
            </DarkField>

            {/* Subtípus */}
            <DarkField label="Subtípus" required>
              <select value={subtype} onChange={e => setSubtype(e.target.value)} className={inputCls}>
                <option value="" style={{ background: "#141210" }}>Válassz...</option>
                {subtypeOptions.map(s => (
                  <option key={s.value} value={s.value} style={{ background: "#141210" }}>{s.label}</option>
                ))}
              </select>
            </DarkField>
          </div>

          <DarkField label="Alap ár (Ft)">
            <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Pl. 380000" className={inputCls} type="number" min="0" />
          </DarkField>

          <DarkField label="Leírás">
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              placeholder="Rövid leírás a csomagról..." className={`${inputCls} resize-none`} />
          </DarkField>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] tracking-[0.14em] uppercase text-[#5A5248]">Bullet pointok</label>
              <button onClick={addBullet} className="text-[10px] text-[#C8A882]/60 hover:text-[#C8A882] transition-colors">+ Hozzáad</button>
            </div>
            <div className="flex flex-col gap-2">
              {bullets.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={b} onChange={e => updateBullet(i, e.target.value)}
                    placeholder={`Pont ${i + 1}...`} className={`${inputCls} flex-1`} />
                  <button onClick={() => removeBullet(i)} className="w-8 h-8 border border-white/[0.06] flex items-center justify-center text-[#3A3530] hover:text-red-400 hover:border-red-500/20 transition-all shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-[11px] text-red-400/70">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 border border-white/[0.08] text-[11px] tracking-[0.1em] uppercase text-[#5A5248] hover:text-[#D4C4B0] transition-all">Mégsem</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#C8A882] text-[11px] tracking-[0.12em] uppercase text-[#0C0A08] font-medium hover:bg-[#D4B892] transition-all disabled:opacity-50">
              {saving ? "Mentés..." : isNew ? "Létrehozás" : "Mentés"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Fő oldal ──────────────────────────────────────────────────
export default function AdminPackagesPage() {
  const [packages, setPackages]           = useState<Package[]>([]);
  const [loading, setLoading]             = useState(true);
  const [modal, setModal]                 = useState<Package | null | "new">(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast]                 = useState<{ msg: string; type: "success"|"error" } | null>(null);
  const [filterCat, setFilterCat]         = useState<number | "all">("all");

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/packages");
      const data = await res.json();
      // Csak esküvő (1) és portré (2) csomagok
      setPackages((data.packages ?? []).filter((p: Package) => {
        const catId = p.categoryId ?? p.category?.id;
        return catId === 1 || catId === 2;
      }));
    } catch { setToast({ msg: "Nem sikerült betölteni", type: "error" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPackages(prev => prev.filter(p => p.id !== id));
      setToast({ msg: "Csomag törölve", type: "success" });
    } catch { setToast({ msg: "Hiba a törlésnél", type: "error" }); }
    finally { setDeleteConfirm(null); }
  }

  // Csoportosítás: kategória → subtípus → csomagok
  const grouped = Object.entries(CATEGORY_NAMES)
    .filter(([id]) => filterCat === "all" || parseInt(id) === filterCat)
    .map(([id, catName]) => {
      const catId = parseInt(id);
      const subtypes = catId === 1 ? ESKUVO_SUBTYPES : PORTRE_SUBTYPES;
      const catPkgs = packages.filter(p => (p.categoryId ?? p.category?.id) === catId);
      return {
        catId, catName,
        subtypes: subtypes.map(st => ({
          ...st,
          packages: catPkgs.filter(p => p.subtype === st.value),
        })),
        total: catPkgs.length,
      };
    });

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
            <h1 className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2rem] font-light text-white">Csomagok</h1>
            <p className="text-[12px] text-[#3A3530] mt-0.5">{packages.length} csomag az adatbázisban</p>
          </div>
          <button onClick={() => setModal("new")}
            className="flex items-center gap-2 bg-[#C8A882] text-[#0C0A08] text-[11px] tracking-[0.14em] uppercase px-4 py-2.5 hover:bg-[#D4B892] transition-colors font-medium whitespace-nowrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Új csomag
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">

        {/* Stat kártyák – csak Esküvő + Portré */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-sm">
          {Object.entries(CATEGORY_NAMES).map(([id, name]) => {
            const count = packages.filter(p => p.categoryId === parseInt(id)).length;
            const active = filterCat === parseInt(id);
            return (
              <button key={id} onClick={() => setFilterCat(active ? "all" : parseInt(id))}
                className={`bg-[#0E0C0A] border px-4 py-4 text-left transition-all ${active ? "border-[#C8A882]/40 bg-[#C8A882]/10" : "border-white/[0.05] hover:border-white/[0.1]"}`}>
                <div className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#C8A882] leading-none">{count}</div>
                <div className="text-[9px] tracking-[0.1em] uppercase text-[#3A3530] mt-1">{name}</div>
              </button>
            );
          })}
        </div>

        {/* Csomagok – kategória → subtípus csoportosítva */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-4 h-4 border border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
            <span className="text-[12px] text-[#3A3530]">Betöltés...</span>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.catId} className="flex flex-col gap-4">
              {/* Kategória fejléc */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] tracking-[0.18em] uppercase text-[#C8A882]/70 font-medium">{group.catName}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] text-[#3A3530]">{group.total} csomag</span>
              </div>

              {/* Subtípusonként */}
              {group.subtypes.map(st => (
                <div key={st.value} className="flex flex-col gap-2 pl-0 sm:pl-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C8A882]/40" />
                    <span className="text-[10px] tracking-[0.14em] uppercase text-[#5A5248]">{st.label}</span>
                    <div className="flex-1 h-px bg-white/[0.04]" />
                    <span className="text-[9px] text-[#3A3530]">{st.packages.length} csomag</span>
                  </div>

                  {st.packages.length === 0 ? (
                    <div className="bg-[#0E0C0A] border border-dashed border-white/[0.04] p-3 text-center">
                      <span className="text-[11px] text-[#3A3530]">Nincs csomag</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {st.packages.map(pkg => (
                        <div key={pkg.id} className="bg-[#0E0C0A] border border-white/[0.05] p-4 flex flex-col gap-3 hover:border-white/[0.1] transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-[13px] text-[#D4C4B0] font-medium truncate">{pkg.name ?? "—"}</div>
                              {pkg.description && (
                                <div className="text-[11px] text-[#3A3530] mt-0.5 line-clamp-2">{pkg.description}</div>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="font-['Cormorant_Garamond'] text-[1.3rem] font-light text-[#C8A882] leading-none">
                                {pkg.price ? `${pkg.price.toLocaleString("hu-HU")} Ft` : "—"}
                              </div>
                            </div>
                          </div>

                          {pkg.bulletPoints.length > 0 && (
                            <div className="flex flex-col gap-1">
                              {pkg.bulletPoints.map(bp => (
                                <div key={bp.id} className="flex items-center gap-1.5 text-[11px] text-[#5A5248]">
                                  <span className="w-1 h-1 rounded-full bg-[#C8A882]/40 shrink-0" />
                                  {bp.title}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2 mt-auto pt-2 border-t border-white/[0.04]">
                            <button onClick={() => setModal(pkg)}
                              className="flex-1 py-1.5 border border-white/[0.08] text-[10px] tracking-[0.08em] uppercase text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all">
                              Szerkesztés
                            </button>
                            <button onClick={() => setDeleteConfirm(pkg.id)}
                              className="py-1.5 px-3 border border-white/[0.06] text-[10px] text-red-400/50 hover:text-red-400 hover:border-red-500/30 transition-all">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Csomag modal */}
      {modal !== null && (
        <PackageModal
          pkg={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchPackages(); setToast({ msg: "Csomag mentve", type: "success" }); }}
        />
      )}

      {/* Törlés megerősítés */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-[#0E0C0A] border border-white/[0.08] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.5" className="w-5 h-5 shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div>
                <div className="text-[13px] text-[#D4C4B0] mb-1">Biztosan törlöd?</div>
                <div className="text-[11px] text-[#5A5248]">A csomaghoz tartozó bullet pointok is törlődnek.</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-white/[0.08] text-[11px] text-[#5A5248] hover:text-[#D4C4B0] transition-all">Mégsem</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500/80 text-[11px] tracking-[0.1em] uppercase text-white hover:bg-red-500 transition-all">Törlés</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}