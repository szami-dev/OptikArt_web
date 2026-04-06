"use client";

import { useState, useEffect } from "react";
import WeekCalendar from "@/app/components/WeekCalendar";
import Link from "next/link";

type Project = { id: number; name: string | null };

export default function UserCalendarPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch("/api/projects/my")
      .then(r => r.json())
      .then(d => {
        setProjects(d.projects ?? []);
        setLoading(false);
      });
  }, []);

  const bookableProjects = projects
    .filter(p => p.name)
    .map(p => ({ id: p.id, name: p.name! }));

  return (
    <div className="min-h-screen bg-[#FAF8F4]">

      {/* Fejléc */}
      <div className="bg-white border-b border-[#EDE8E0] px-5 sm:px-8 lg:px-12 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-px bg-[#C8A882]" />
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">Naptár</span>
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="font-['Cormorant_Garamond'] text-[2rem] sm:text-[2.4rem] font-light text-[#1A1510] leading-tight">
              Időpontfoglalás
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-8 flex flex-col gap-6">

        {/* Tájékoztató kártya */}
        <div className="bg-[#F5EFE6] border border-[#EDE8E0] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="text-[11px] font-medium text-[#1A1510] mb-1">Hogyan foglalhatsz időpontot?</div>
            <p className="text-[12px] text-[#7A6A58] leading-relaxed">
              Kattints egy szabad időpontra a naptárban, válaszd ki a projektedet és add meg a részleteket.
              Az admin jóváhagyja és visszajelez.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-[11px] text-[#7A6A58] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#EDE8E0]" />
              <span>Szabad időpont</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#C8A882]/30 border-l-2 border-[#C8A882]" />
              <span>Foglalt időpont</span>
            </div>
          </div>
        </div>

        {/* Ha nincs projekt */}
        {!loading && bookableProjects.length === 0 && (
          <div className="bg-white border border-[#EDE8E0] p-8 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#EDE8E0" strokeWidth="1.2" className="w-10 h-10 mx-auto mb-4">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <p className="text-[13px] text-[#A08060] mb-1">Nincs aktív projekted</p>
            <p className="text-[11px] text-[#C8B8A0] mb-6">Időpont foglaláshoz először indíts egy projektet.</p>
            <Link href="/contact"
              className="inline-flex items-center gap-2 bg-[#1A1510] text-white text-[11px] tracking-[0.14em] uppercase px-7 py-3 hover:bg-[#C8A882] transition-all">
              Projekt indítása →
            </Link>
          </div>
        )}

        {/* Naptár */}
        {(loading || bookableProjects.length > 0) && (
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
              </div>
            )}
            <WeekCalendar
              key={refreshKey}
              mode="user"
              userProjectIds={bookableProjects}
              onBookingSuccess={() => setRefreshKey(k => k + 1)}
            />
          </div>
        )}

        {/* Foglalásaim összefoglaló */}
        {!loading && bookableProjects.length > 0 && (
          <div className="bg-white border border-[#EDE8E0] p-5">
            <div className="text-[10px] tracking-[0.16em] uppercase text-[#A08060] mb-3">Projektjeim</div>
            <div className="flex flex-col gap-2">
              {bookableProjects.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-[#EDE8E0] last:border-b-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#C8A882]/60" />
                    <span className="text-[13px] text-[#1A1510]">{p.name}</span>
                  </div>
                  <Link href={`/user/projects/${p.id}`}
                    className="text-[10px] tracking-[0.08em] uppercase text-[#C8A882]/60 hover:text-[#C8A882] transition-colors">
                    Megnyit →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}