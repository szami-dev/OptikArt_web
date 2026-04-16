// app/(user)/user/galleries/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Gallery = {
  id: number;
  title: string | null;
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

export default function UserGalleriesPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/galleries");
    const data = await res.json();
    setGalleries(data.galleries ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <div className="bg-white border-b border-[#EDE8E0] px-5 sm:px-8 lg:px-12 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-px bg-[#C8A882]" />
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">
              Galériáim
            </span>
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-[2rem] sm:text-[2.4rem] font-light text-[#1A1510]">
            Képeim
          </h1>
          {galleries.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#EDE8E0]">
              <div className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#C8A882] leading-none">
                {galleries.length}
              </div>
              <div className="text-[9px] tracking-[0.12em] uppercase text-[#A08060] mt-0.5">
                galéria
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-8">
        {galleries.length === 0 ? (
          <div className="bg-white border border-[#EDE8E0] p-12 text-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C8A882"
              strokeWidth="1.2"
              className="w-10 h-10 mx-auto mb-4 opacity-40"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <h3 className="font-['Cormorant_Garamond'] text-[1.4rem] font-light text-[#1A1510] mb-2">
              Még nincs galériád
            </h3>
            <p className="text-[13px] text-[#A08060]">
              Az elkészült fotóid itt lesznek elérhetők a projektjeidhez
              kapcsolva.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {galleries.map((g) => (
              // ── VÁLTOZÁS: /user/gallery/[shareToken] ──────────
              <Link
                key={g.id}
                href={`/user/gallery/${g.shareToken}`}
                className="group bg-white border border-[#EDE8E0] overflow-hidden hover:border-[#C8A882]/40 hover:shadow-sm transition-all"
              >
                {/* Cover – coverImageUrl elsőbbséget élvez, fallback az első thumbnail */}
                <div className="relative h-36 bg-[#F5EFE6] overflow-hidden">
                  {g.coverImageUrl ? (
                    <img
                      src={g.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : g.images[0] ? (
                    <img
                      src={g.images[0].thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#C8A882"
                        strokeWidth="1"
                        className="w-10 h-10"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}

                  {/* Cover badge ha be van állítva */}
                  {g.coverImageUrl && (
                    <div className="absolute top-2 left-2 bg-[#C8A882]/90 text-[#0C0A08] text-[8px] tracking-[0.1em] uppercase px-1.5 py-0.5">
                      ✦ Cover
                    </div>
                  )}

                  {/* Thumbnail strip – csak ha nincs cover */}
                  {!g.coverImageUrl && g.images.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 p-1.5">
                      {g.images.slice(0, 5).map((img) => (
                        <div
                          key={img.id}
                          className="w-9 h-9 bg-white overflow-hidden shrink-0 border border-white/40"
                        >
                          <img
                            src={img.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[14px] text-[#1A1510] font-medium truncate">
                        {g.title ?? "Galéria"}
                      </div>
                      <div className="text-[11px] text-[#A08060]">
                        {g.project.name}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-['Cormorant_Garamond'] text-[1.3rem] font-light text-[#C8A882] leading-none">
                        {g._count.images}
                      </div>
                      <div className="text-[9px] text-[#A08060]">kép</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EDE8E0]">
                    <div className="flex items-center gap-2">
                      {g.hasPassword && (
                        <span className="text-[10px] text-[#FBBF24] border border-[#FDE68A] px-1.5 py-0.5">
                          🔒 Jelszóvédett
                        </span>
                      )}
                      {g.expiresAt && new Date(g.expiresAt) > new Date() && (
                        <span className="text-[10px] text-[#A08060]">
                          ⏰ {new Date(g.expiresAt).toLocaleDateString("hu-HU")}
                          -ig
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#C8A882]/50 group-hover:text-[#C8A882] transition-colors">
                      Megnyit →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
