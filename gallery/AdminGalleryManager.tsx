"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";

// ── Típusok ───────────────────────────────────────────────────
type GalleryImage = {
  id: number;
  publicId: string;
  thumbnailUrl: string;
  previewUrl: string;
  fileName: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
};

type Gallery = {
  id: number;
  title: string | null;
  description: string | null;
  coverImageUrl: string | null;
  isPublic: boolean;
  hasPassword: boolean;
  expiresAt: string | null;
  shareToken: string;
  images: GalleryImage[];
  _count?: { images: number };
};

type UploadResult = {
  public_id:    string;
  secure_url:   string;
  original_filename: string;
  width:        number;
  height:       number;
  bytes:        number;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Cloudinary unsigned feltöltés ─────────────────────────────
async function uploadToCloudinary(file: File, onProgress: (pct: number) => void): Promise<UploadResult> {
  const cloudName   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "galleries");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
      else reject(new Error(`Upload failed: ${xhr.statusText}`));
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

// ── Upload sor kezelő hook ────────────────────────────────────
type UploadItem = {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  result?: UploadResult;
  error?: string;
};

// ── Kép lightbox ─────────────────────────────────────────────
function Lightbox({ images, index, onClose, onPrev, onNext }: {
  images: GalleryImage[]; index: number;
  onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  const img = images[index];
  if (!img) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
      onClick={onClose}>
      <button onClick={e => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-all z-10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button onClick={e => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-all z-10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <button onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div className="relative max-w-5xl max-h-[85vh] mx-4" onClick={e => e.stopPropagation()}>
        <img src={img.previewUrl} alt={img.fileName ?? ""} className="max-h-[85vh] max-w-full object-contain" />
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-2 flex items-center justify-between">
          <span className="text-[11px] text-white/60">{img.fileName ?? "kép"}</span>
          <span className="text-[11px] text-white/40">{index + 1} / {images.length}</span>
        </div>
      </div>
    </div>
  );
}

// ── Fő komponens ─────────────────────────────────────────────
export default function AdminGalleryManager({
  projectId,
  initialGallery,
  onGalleryCreated,
}: {
  projectId: number;
  initialGallery?: Gallery | null;
  onGalleryCreated?: (gallery: Gallery) => void;
}) {
  const [gallery, setGallery]     = useState<Gallery | null>(initialGallery ?? null);
  const [images, setImages]       = useState<GalleryImage[]>(initialGallery?.images ?? []);
  const [uploads, setUploads]     = useState<UploadItem[]>([]);
  const [lightbox, setLightbox]   = useState<number | null>(null);
  const [creating, setCreating]   = useState(false);
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<number | null>(null);
  const [toast, setToast]         = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle]         = useState(initialGallery?.title ?? "");
  const [desc, setDesc]           = useState(initialGallery?.description ?? "");
  const [isPublic, setIsPublic]   = useState(initialGallery?.isPublic ?? false);
  const [password, setPassword]   = useState("");
  const [removePass, setRemovePass] = useState(false);
  const [expiresAt, setExpiresAt] = useState(
    initialGallery?.expiresAt ? initialGallery.expiresAt.slice(0, 10) : ""
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Galéria létrehozása ────────────────────────────────────
  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/galleries", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ projectId, title, description: desc, isPublic, password: password || null, expiresAt: expiresAt || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGallery(data.gallery);
      setImages([]);
      onGalleryCreated?.(data.gallery);
      showToast("Galéria létrehozva!");
    } catch (e: any) { showToast(`Hiba: ${e.message}`); }
    finally { setCreating(false); }
  }

  // ── Galéria mentése ────────────────────────────────────────
  async function handleSave() {
    if (!gallery) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/galleries/${gallery.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, description: desc, isPublic, password: password || undefined, removePassword: removePass, expiresAt: expiresAt || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGallery(data.gallery);
      setEditing(false);
      setPassword("");
      showToast("Galéria mentve!");
    } catch (e: any) { showToast(`Hiba: ${e.message}`); }
    finally { setSaving(false); }
  }

  // ── Képek feltöltése Cloudinary-ra ────────────────────────
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (!gallery) return;
    const arr = Array.from(files);

    // Upload sor inicializálása
    const items: UploadItem[] = arr.map(f => ({
      id:       `${f.name}-${Date.now()}-${Math.random()}`,
      file:     f,
      status:   "pending" as const,
      progress: 0,
    }));
    setUploads(prev => [...prev, ...items]);

    const results: UploadResult[] = [];

    for (const item of items) {
      setUploads(prev => prev.map(u => u.id === item.id ? { ...u, status: "uploading" } : u));
      try {
        const result = await uploadToCloudinary(item.file, (pct) => {
          setUploads(prev => prev.map(u => u.id === item.id ? { ...u, progress: pct } : u));
        });
        results.push(result);
        setUploads(prev => prev.map(u => u.id === item.id ? { ...u, status: "done", progress: 100, result } : u));
      } catch (e: any) {
        setUploads(prev => prev.map(u => u.id === item.id ? { ...u, status: "error", error: e.message } : u));
      }
    }

    if (results.length === 0) return;

    // DB-be mentés
    try {
      const res = await fetch(`/api/galleries/${gallery.id}/images`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          images: results.map(r => ({
            publicId:    r.public_id,
            originalUrl: r.secure_url,
            fileName:    r.original_filename,
            width:       r.width,
            height:      r.height,
            bytes:       r.bytes,
          })),
        }),
      });
      if (!res.ok) throw new Error("DB mentés sikertelen");

      // Friss képek lekérése
      const gRes = await fetch(`/api/galleries/${gallery.id}`);
      const gData = await gRes.json();
      setImages(gData.gallery.images ?? []);
      // Upload sor törlése
      setTimeout(() => setUploads([]), 2000);
      showToast(`${results.length} kép feltöltve!`);
    } catch (e: any) {
      showToast(`DB hiba: ${e.message}`);
    }
  }, [gallery]);

  // ── Drag & drop ────────────────────────────────────────────
  const [dragOver, setDragOver] = useState(false);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // ── Kép törlése ────────────────────────────────────────────
  async function handleDeleteImage(imageId: number) {
    if (!gallery) return;
    setDeleting(imageId);
    try {
      const res = await fetch(`/api/galleries/${gallery.id}/images`, {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ imageId }),
      });
      if (!res.ok) throw new Error("Törlés sikertelen");
      setImages(prev => prev.filter(i => i.id !== imageId));
      showToast("Kép törölve");
    } catch (e: any) { showToast(`Hiba: ${e.message}`); }
    finally { setDeleting(null); }
  }

  // ── Letöltés ───────────────────────────────────────────────
  async function handleDownload(imageId?: number) {
    if (!gallery) return;
    try {
      const res = await fetch(`/api/galleries/${gallery.id}/download`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ imageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (imageId) {
        // Egy kép
        const a = document.createElement("a");
        a.href = data.url;
        a.download = data.fileName;
        a.click();
      } else {
        // Összes kép – minden URLt külön tab-ban nyitjuk
        // (zip generálás server-side Cloudinary-n is lehetséges,
        //  de az a free plan-en nem érhető el)
        for (const item of data.urls) {
          const a = document.createElement("a");
          a.href = item.url;
          a.download = item.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          await new Promise(r => setTimeout(r, 200)); // kis delay
        }
      }
    } catch (e: any) { showToast(`Letöltési hiba: ${e.message}`); }
  }

  // ── Megosztási link ────────────────────────────────────────
  function copyShareLink() {
    if (!gallery) return;
    const url = `${window.location.origin}/gallery/${gallery.shareToken}`;
    navigator.clipboard.writeText(url);
    showToast("Link vágólapra másolva!");
  }

  const shareUrl = gallery ? `${typeof window !== "undefined" ? window.location.origin : ""}/gallery/${gallery.shareToken}` : "";

  // ═══════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-4">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[200] bg-[#0E0C0A] border border-[#C8A882]/30 text-[#D4C4B0] px-4 py-3 text-[13px] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8A882]" />{toast}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox
          images={images} index={lightbox} onClose={() => setLightbox(null)}
          onPrev={() => setLightbox(i => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightbox(i => Math.min(images.length - 1, (i ?? 0) + 1))}
        />
      )}

      {/* ── Nincs galéria → létrehozás form ── */}
      {!gallery && (
        <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-px bg-[#C8A882]/40" />
            <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/50">Új galéria</span>
          </div>
          <div className="flex flex-col gap-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Galéria neve (opcionális)"
              className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40" />
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Leírás (opcionális)"
              className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Jelszó (opcionális)"
                className="bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40" />
              <input value={expiresAt} onChange={e => setExpiresAt(e.target.value)} type="date"
                className="bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => setIsPublic(v => !v)}
                className={`w-10 h-5 rounded-full transition-colors relative ${isPublic ? "bg-[#C8A882]" : "bg-white/[0.08]"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isPublic ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-[12px] text-[#5A5248]">Publikusan megosztható</span>
            </label>
            <button onClick={handleCreate} disabled={creating}
              className="py-2.5 bg-[#C8A882] text-[11px] tracking-[0.12em] uppercase text-[#0C0A08] font-medium hover:bg-[#D4B892] transition-all disabled:opacity-50">
              {creating ? "Létrehozás..." : "Galéria létrehozása"}
            </button>
          </div>
        </div>
      )}

      {/* ── Van galéria ── */}
      {gallery && (
        <>
          {/* Galéria fejléc */}
          <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-px bg-[#C8A882]/40" />
                  <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/50">Galéria</span>
                </div>
                <div className="text-[15px] text-[#D4C4B0]">{gallery.title ?? "Névtelen galéria"}</div>
                <div className="text-[11px] text-[#3A3530] mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{images.length} kép</span>
                  {gallery.hasPassword && <span className="text-[#FBBF24]">🔒 Jelszóvédett</span>}
                  {gallery.isPublic && <span className="text-[#34D399]">🌐 Publikus</span>}
                  {gallery.expiresAt && <span className="text-[#F87171]">⏰ Lejár: {new Date(gallery.expiresAt).toLocaleDateString("hu-HU")}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {gallery.isPublic && (
                  <button onClick={copyShareLink}
                    className="flex items-center gap-2 px-3 py-2 border border-[#34D399]/20 text-[11px] tracking-[0.08em] uppercase text-[#34D399]/70 hover:text-[#34D399] hover:border-[#34D399]/40 transition-all">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Megosztás
                  </button>
                )}
                <button onClick={() => handleDownload()}
                  className="flex items-center gap-2 px-3 py-2 border border-white/[0.08] text-[11px] tracking-[0.08em] uppercase text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Összes letöltés
                </button>
                <button onClick={() => setEditing(v => !v)}
                  className="flex items-center gap-2 px-3 py-2 border border-white/[0.08] text-[11px] tracking-[0.08em] uppercase text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Szerkesztés
                </button>
              </div>
            </div>

            {/* Share link megjelenítés */}
            {gallery.isPublic && (
              <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center gap-2">
                <code className="flex-1 text-[10px] text-[#3A3530] truncate">{shareUrl}</code>
                <button onClick={copyShareLink} className="text-[10px] text-[#C8A882]/60 hover:text-[#C8A882] transition-colors whitespace-nowrap">Másolás</button>
              </div>
            )}

            {/* Szerkesztés form */}
            {editing && (
              <div className="mt-4 pt-4 border-t border-white/[0.04] flex flex-col gap-3">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Galéria neve"
                  className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40" />
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Leírás"
                  className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={password} onChange={e => setPassword(e.target.value)} type="password"
                    placeholder={gallery.hasPassword ? "Új jelszó (hagyd üresen ha nem változtatsz)" : "Jelszó hozzáadása"}
                    className="bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40" />
                  <input value={expiresAt} onChange={e => setExpiresAt(e.target.value)} type="date"
                    className="bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40" />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setIsPublic(v => !v)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${isPublic ? "bg-[#C8A882]" : "bg-white/[0.08]"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isPublic ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-[12px] text-[#5A5248]">Publikusan megosztható</span>
                  </label>
                  {gallery.hasPassword && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={removePass} onChange={e => setRemovePass(e.target.checked)} className="accent-[#F87171]" />
                      <span className="text-[12px] text-[#F87171]">Jelszó eltávolítása</span>
                    </label>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="flex-1 py-2 border border-white/[0.08] text-[11px] text-[#5A5248] hover:text-[#D4C4B0] transition-all">Mégsem</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-[#C8A882] text-[11px] tracking-[0.1em] uppercase text-[#0C0A08] font-medium hover:bg-[#D4B892] transition-all disabled:opacity-50">
                    {saving ? "Mentés..." : "Mentés"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Feltöltési zóna ── */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all ${dragOver ? "border-[#C8A882]/60 bg-[#C8A882]/5" : "border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.02]"}`}
          >
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
              onChange={e => e.target.files && handleFiles(e.target.files)} />
            <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.2" className="w-10 h-10 mx-auto mb-3 opacity-50">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className="text-[13px] text-[#5A5248] mb-1">Húzd ide a képeket vagy kattints a feltöltéshez</p>
            <p className="text-[11px] text-[#3A3530]">JPG, PNG, WebP · Max 20 MB / kép · Direkt Cloudinary feltöltés</p>
          </div>

          {/* ── Upload progress ── */}
          {uploads.length > 0 && (
            <div className="bg-[#0E0C0A] border border-white/[0.05] p-4 flex flex-col gap-2">
              <div className="text-[9px] tracking-[0.16em] uppercase text-[#3A3530] mb-1">Feltöltés folyamatban</div>
              {uploads.map(u => (
                <div key={u.id} className="flex items-center gap-3">
                  <span className="text-[11px] text-[#5A5248] truncate flex-1">{u.file.name}</span>
                  <div className="w-24 h-1 bg-white/[0.06] shrink-0">
                    <div className="h-full bg-[#C8A882] transition-all"
                      style={{ width: `${u.progress}%`, background: u.status === "error" ? "#F87171" : u.status === "done" ? "#34D399" : "#C8A882" }} />
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: u.status === "error" ? "#F87171" : u.status === "done" ? "#34D399" : "#5A5248" }}>
                    {u.status === "error" ? "❌" : u.status === "done" ? "✓" : `${u.progress}%`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Képek grid ── */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
              {images.map((img, i) => (
                <div key={img.id} className="group relative bg-[#141210] overflow-hidden" style={{ aspectRatio: "1/1" }}>
                  <img src={img.thumbnailUrl} alt={img.fileName ?? ""} loading="lazy"
                    className="w-full h-full object-cover cursor-pointer transition-all group-hover:scale-105 group-hover:opacity-80"
                    onClick={() => setLightbox(i)} />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 bg-black/50">
                    <button onClick={() => setLightbox(i)}
                      className="w-7 h-7 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button onClick={() => handleDownload(img.id)}
                      className="w-7 h-7 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                    <button onClick={() => handleDeleteImage(img.id)} disabled={deleting === img.id}
                      className="w-7 h-7 bg-red-500/20 flex items-center justify-center hover:bg-red-500/40 transition-colors">
                      {deleting === img.id
                        ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        : <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>}
                    </button>
                  </div>

                  {/* Fájlméret */}
                  {img.bytes && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white/50 px-1.5 py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatBytes(img.bytes)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && uploads.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[12px] text-[#3A3530]">Még nincs kép ebben a galériában</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
