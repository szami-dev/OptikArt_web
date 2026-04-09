// ═══════════════════════════════════════════════════════════════
// ADMIN GALÉRIÁK OLDAL
// app/(admin)/admin/galleries/page.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Gallery = {
  id: number;
  title: string | null;
  description: string | null;
  coverImageUrl: string | null;
  isPublic: boolean;
  hasPassword: boolean;
  expiresAt: string | null;
  shareToken: string;
  createdAt: string;
  project: { id: number; name: string | null };
  _count: { images: number };
  images: { id: number; thumbnailUrl: string }[];
};

function GalleryCard({ gallery, onDelete }: { gallery: Gallery; onDelete: (id: number) => void }) {
  const [deleting, setDeleting] = useState(false);
  const shareUrl = `${window.location.origin}/gallery/${gallery.shareToken}`;

  async function handleDelete() {
    if (!confirm("Biztosan törlöd a galériát? A képek Cloudinary-ról is törlődnek.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/galleries/${gallery.id}`, { method: "DELETE" });
      onDelete(gallery.id);
    } catch { alert("Hiba a törléskor"); }
    finally { setDeleting(false); }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    alert("Link másolva!");
  }

  return (
    <div className="bg-[#0E0C0A] border border-white/[0.05] overflow-hidden">
      {/* Cover + thumbnail sor */}
      <div className="relative bg-[#141210] h-32 overflow-hidden">
        {gallery.coverImageUrl
          ? <img src={gallery.coverImageUrl} alt="" className="w-full h-full object-cover opacity-60" />
          : <div className="w-full h-full flex items-center justify-center opacity-20">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1" className="w-10 h-10"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>}

        {/* Thumbnail sor */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 p-1">
          {gallery.images.slice(0, 4).map(img => (
            <div key={img.id} className="w-10 h-10 bg-[#0C0A08] overflow-hidden shrink-0">
              <img src={img.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {gallery._count.images > 4 && (
            <div className="w-10 h-10 bg-black/60 flex items-center justify-center shrink-0">
              <span className="text-[9px] text-white/60">+{gallery._count.images - 4}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="text-[13px] text-[#D4C4B0] truncate">{gallery.title ?? "Névtelen galéria"}</div>
            <Link href={`/admin/projects/${gallery.project.id}`}
              className="text-[10px] text-[#3A3530] hover:text-[#C8A882] transition-colors">
              {gallery.project.name}
            </Link>
          </div>
          <div className="flex flex-col gap-0.5 shrink-0 text-right">
            <span className="text-[11px] text-[#3A3530]">{gallery._count.images} kép</span>
            {gallery.hasPassword && <span className="text-[9px] text-[#FBBF24]">🔒 Jelszó</span>}
            {gallery.isPublic && <span className="text-[9px] text-[#34D399]">🌐 Publikus</span>}
          </div>
        </div>

        {gallery.expiresAt && (
          <div className="text-[10px] text-[#F87171] mb-2">
            ⏰ Lejár: {new Date(gallery.expiresAt).toLocaleDateString("hu-HU")}
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <Link href={`/admin/projects/${gallery.project.id}?tab=gallery`}
            className="flex-1 text-center py-1.5 border border-white/[0.08] text-[10px] tracking-[0.08em] uppercase text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all">
            Kezelés
          </Link>
          {gallery.isPublic && (
            <button onClick={copyLink}
              className="py-1.5 px-3 border border-[#34D399]/20 text-[10px] text-[#34D399]/70 hover:text-[#34D399] hover:border-[#34D399]/40 transition-all">
              Link
            </button>
          )}
          <button onClick={handleDelete} disabled={deleting}
            className="py-1.5 px-3 border border-red-500/20 text-[10px] text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all disabled:opacity-50">
            {deleting ? "..." : "Töröl"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminGalleriesPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    const res  = await fetch("/api/galleries");
    const data = await res.json();
    setGalleries(data.galleries ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-[#0C0A08] text-[#D4C4B0]">
      <div className="border-b border-white/[0.05] px-4 sm:px-6 lg:px-10 py-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-px bg-[#C8A882]/50" />
          <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/50">Admin</span>
        </div>
        <h1 className="font-['Cormorant_Garamond'] text-[2rem] font-light text-white">Galériák</h1>
        <p className="text-[12px] text-[#3A3530] mt-0.5">{galleries.length} galéria az összes projektből</p>
      </div>

      <div className="px-4 sm:px-6 lg:px-10 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-4 h-4 border border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
          </div>
        ) : galleries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[13px] text-[#3A3530] mb-2">Még nincs galéria</p>
            <p className="text-[11px] text-[#3A3530]">Galériákat a projekt kezelő felületről hozhatsz létre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {galleries.map(g => (
              <GalleryCard key={g.id} gallery={g} onDelete={id => setGalleries(prev => prev.filter(x => x.id !== id))} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
