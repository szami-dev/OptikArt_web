"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type StatsData = {
  range: number;
  from: string;
  summary: {
    totalSessions: number; totalEvents: number;
    periodSessions: number; periodPageviews: number; periodEvents: number;
    uniqueUsers: number; returningUsers: number;
    avgDuration: number; avgPagesPerSession: number;
    projectCreated: number; wizardComplete: number;
  };
  topPages:     { page: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  dailyData:    { date: string; sessions: number; pageviews: number }[];
  deviceMap:    Record<string, number>;
  browserMap:   Record<string, number>;
  wizardSteps:  Record<number, number>;
  eventTypeMap: Record<string, number>;
  recentEvents: { id: number; createdAt: string; type: string; page: string | null; meta: any }[];
};

const RANGES = [
  { value: "7",  label: "7 nap"  },
  { value: "14", label: "14 nap" },
  { value: "30", label: "30 nap" },
  { value: "90", label: "90 nap" },
];

const EVENT_LABELS: Record<string, string> = {
  pageview:        "Oldallátogatás",
  click:           "Kattintás",
  wizard_step:     "Wizard lépés",
  wizard_exit:     "Wizard kilépés",
  wizard_complete: "Ajánlatkérés elküldve",
  project_created: "Projekt létrehozva",
  gallery_view:    "Galéria megnyitva",
  session_end:     "Session vége",
};

const DEVICE_ICONS: Record<string, string> = {
  desktop: "🖥", mobile: "📱", tablet: "📟",
};

function formatDuration(secs: number) {
  if (secs < 60) return `${secs}mp`;
  return `${Math.floor(secs / 60)}p ${secs % 60}mp`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("hu-HU", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function Sparkline({ data, color = "#C8A882" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const W = 120, H = 32, pad = 2;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - (v / max) * (H - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline points={`${pad},${H - pad} ${pts} ${W - pad},${H - pad}`}
        fill={color} fillOpacity="0.08" stroke="none" />
      <polyline points={pts} fill="none" stroke={color}
        strokeWidth="1.5" strokeOpacity="0.7" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function MiniBar({ value, max, color = "#C8A882" }: { value: number; max: number; color?: string }) {
  return (
    <div className="flex-1 h-px bg-white/[0.04]">
      <div className="h-full transition-all duration-500"
        style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color, opacity: 0.5 }} />
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [stats,       setStats]       = useState<StatsData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [range,       setRange]       = useState("30");
  const [eventFilter, setEventFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/analytics/stats?range=${range}`);
      const data = await res.json();
      setStats(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="min-h-screen bg-[#0C0A08] flex items-center justify-center gap-3">
      <div className="w-5 h-5 border border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
      <span className="text-[12px] text-[#3A3530] tracking-[0.1em]">Statisztikák betöltése...</span>
    </div>
  );

  if (!stats) return (
    <div className="min-h-screen bg-[#0C0A08] flex items-center justify-center">
      <p className="text-[13px] text-[#3A3530]">Nem sikerült betölteni az adatokat.</p>
    </div>
  );

  const { summary, dailyData } = stats;
  const filteredEvents = stats.recentEvents.filter(e =>
    eventFilter === "all" || e.type === eventFilter
  );
  const wizardConvRate = (stats.wizardSteps[1] ?? 0) > 0
    ? Math.round((summary.wizardComplete / stats.wizardSteps[1]) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0C0A08] text-[#D4C4B0]">

      {/* Fejléc */}
      <div className="border-b border-white/[0.04] px-4 sm:px-6 lg:px-10 py-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin" className="text-[#3A3530] hover:text-[#D4C4B0] transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              </Link>
              <div className="w-3 h-px bg-[#C8A882]/40" />
              <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/40">Admin panel</span>
            </div>
            <h1 className="font-['Cormorant_Garamond'] text-[2rem] sm:text-[2.4rem] font-light text-white leading-none">
              Analitika
            </h1>
            <p className="text-[12px] text-[#3A3530] mt-1">
              {new Date(stats.from).toLocaleDateString("hu-HU")} – {new Date().toLocaleDateString("hu-HU")}
            </p>
          </div>
          <div className="flex border border-white/[0.06]">
            {RANGES.map(r => (
              <button key={r.value} onClick={() => setRange(r.value)}
                className={`px-4 py-2 text-[11px] tracking-[0.1em] uppercase transition-all border-r border-white/[0.04] last:border-r-0 ${range === r.value ? "bg-[#C8A882]/15 text-[#C8A882]" : "text-[#3A3530] hover:text-[#5A5248]"}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-10 py-6 flex flex-col gap-5">

        {/* KPI kártyák */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Látogatások",      value: summary.periodSessions,                   color: "#C8A882", spark: dailyData.map(d => d.sessions)  },
            { label: "Oldalletöltések",  value: summary.periodPageviews,                  color: "#60A5FA", spark: dailyData.map(d => d.pageviews) },
            { label: "Egyedi userek",    value: summary.uniqueUsers,                      color: "#34D399", spark: null },
            { label: "Oldal / látogatás",value: summary.avgPagesPerSession,               color: "#A78BFA", spark: null },
            { label: "Ajánlatkérések",   value: summary.wizardComplete,                   color: "#FBBF24", spark: null },
            { label: "Átlag időtöltés",  value: formatDuration(summary.avgDuration), color: "#F87171", spark: null, isStr: true },
          ].map(k => (
            <div key={k.label} className="bg-[#0E0C0A] border border-white/[0.05] p-4 flex flex-col gap-2">
              <div className="text-[9px] tracking-[0.14em] uppercase text-[#3A3530]">{k.label}</div>
              <div className="font-['Cormorant_Garamond'] text-[1.8rem] font-light leading-none" style={{ color: k.color }}>
                {k.isStr ? k.value : typeof k.value === "number" ? k.value.toLocaleString("hu-HU") : k.value}
              </div>
              {k.spark && <Sparkline data={k.spark} color={k.color} />}
            </div>
          ))}
        </div>

        {/* Napi forgalom grafikon */}
        <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-4 h-px bg-[#C8A882]/40" />
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Napi forgalom</span>
            <div className="ml-auto flex items-center gap-4 text-[10px] text-[#3A3530]">
              <div className="flex items-center gap-1.5"><div className="w-3 h-px bg-[#C8A882]" />Látogatás</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-px bg-[#60A5FA]" />Oldalletöltés</div>
            </div>
          </div>
          {(() => {
            const n      = dailyData.length;
            const maxVal = Math.max(...dailyData.map(d => Math.max(d.sessions, d.pageviews)), 1);
            const W = 100, H = 60, pad = 2;
            const mkPts = (vals: number[]) => vals.map((v, i) => {
              const x = pad + (i / (n - 1 || 1)) * (W - pad * 2);
              const y = H - pad - (v / maxVal) * (H - pad * 2);
              return `${x},${y}`;
            }).join(" ");
            const sPts = mkPts(dailyData.map(d => d.sessions));
            const pPts = mkPts(dailyData.map(d => d.pageviews));
            return (
              <div>
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height: "100px" }}>
                  {[0.25, 0.5, 0.75].map(f => (
                    <line key={f} x1={pad} y1={H - pad - f * (H - pad * 2)} x2={W - pad} y2={H - pad - f * (H - pad * 2)}
                      stroke="white" strokeOpacity="0.03" strokeWidth="0.5" />
                  ))}
                  <polyline points={`${pad},${H - pad} ${pPts} ${W - pad},${H - pad}`} fill="#60A5FA" fillOpacity="0.05" stroke="none" />
                  <polyline points={pPts} fill="none" stroke="#60A5FA" strokeWidth="0.8" strokeOpacity="0.5" strokeLinejoin="round" />
                  <polyline points={`${pad},${H - pad} ${sPts} ${W - pad},${H - pad}`} fill="#C8A882" fillOpacity="0.07" stroke="none" />
                  <polyline points={sPts} fill="none" stroke="#C8A882" strokeWidth="1" strokeOpacity="0.8" strokeLinejoin="round" />
                </svg>
                <div className="flex justify-between mt-1 px-1">
                  {dailyData.filter((_, i) => i % Math.ceil(n / 7) === 0 || i === n - 1).map(d => (
                    <span key={d.date} className="text-[9px] text-[#3A3530]">{formatShortDate(d.date)}</span>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Oldalak / Referrerek / Device */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Top oldalak */}
          <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-px bg-[#C8A882]/40" />
              <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Legtöbbet látogatott</span>
            </div>
            {stats.topPages.length === 0
              ? <p className="text-[11px] text-[#3A3530]">Nincs adat</p>
              : stats.topPages.map(({ page, count }, i) => (
                <div key={page} className="flex items-center gap-3 mb-2.5">
                  <span className="text-[9px] text-[#3A3530] w-3 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#5A5248] truncate mb-1">{page || "/"}</div>
                    <MiniBar value={count} max={stats.topPages[0]?.count ?? 1} />
                  </div>
                  <span className="text-[11px] text-[#3A3530] shrink-0">{count}</span>
                </div>
              ))}
          </div>

          {/* Referrerek */}
          <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-px bg-[#C8A882]/40" />
              <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Forgalom forrása</span>
            </div>
            {stats.topReferrers.length === 0
              ? <p className="text-[11px] text-[#3A3530]">Nincs adat</p>
              : stats.topReferrers.map(({ referrer, count }) => (
                <div key={referrer} className="flex items-center gap-3 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#5A5248] truncate mb-1">{referrer}</div>
                    <MiniBar value={count} max={stats.topReferrers[0]?.count ?? 1} color="#60A5FA" />
                  </div>
                  <span className="text-[11px] text-[#3A3530] shrink-0">{count}</span>
                </div>
              ))}
          </div>

          {/* Device + Browser */}
          <div className="bg-[#0E0C0A] border border-white/[0.05] p-5 flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-px bg-[#C8A882]/40" />
                <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Eszközök</span>
              </div>
              {Object.entries(stats.deviceMap).sort((a, b) => b[1] - a[1]).map(([device, count]) => {
                const total = Object.values(stats.deviceMap).reduce((s, v) => s + v, 0);
                return (
                  <div key={device} className="flex items-center gap-2.5 mb-2">
                    <span>{DEVICE_ICONS[device] ?? "💻"}</span>
                    <span className="text-[11px] text-[#5A5248] capitalize flex-1">{device}</span>
                    <span className="text-[10px] text-[#3A3530]">{total > 0 ? Math.round((count / total) * 100) : 0}%</span>
                    <span className="text-[11px] text-[#3A3530] w-5 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-px bg-[#C8A882]/40" />
                <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Böngészők</span>
              </div>
              {Object.entries(stats.browserMap).sort((a, b) => b[1] - a[1]).map(([browser, count]) => {
                const max = Math.max(...Object.values(stats.browserMap));
                return (
                  <div key={browser} className="flex items-center gap-2.5 mb-2">
                    <span className="text-[11px] text-[#5A5248] capitalize flex-1">{browser}</span>
                    <MiniBar value={count} max={max} color="#A78BFA" />
                    <span className="text-[11px] text-[#3A3530] w-5 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Wizard funnel + Esemény bontás */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Wizard funnel */}
          <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-px bg-[#FBBF24]/60" />
              <span className="text-[9px] tracking-[0.22em] uppercase text-[#FBBF24]/50">Ajánlatkérő wizard</span>
            </div>
            {Object.keys(stats.wizardSteps).length === 0
              ? <p className="text-[11px] text-[#3A3530]">Még nincs wizard aktivitás.</p>
              : (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4].map(step => {
                    const count   = stats.wizardSteps[step] ?? 0;
                    const prev    = step === 1 ? count : (stats.wizardSteps[step - 1] ?? count);
                    const dropPct = prev > 0 && step > 1 ? Math.round(((prev - count) / prev) * 100) : 0;
                    const labels: Record<number, string> = { 1: "Típus", 2: "Csomag", 3: "Részletek", 4: "Összefoglaló" };
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div className="w-5 h-5 border border-[#FBBF24]/30 flex items-center justify-center text-[9px] text-[#FBBF24]/60 shrink-0">{step}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-[#5A5248]">{labels[step]}</span>
                            <div className="flex items-center gap-2">
                              {dropPct > 0 && <span className="text-[9px] text-[#F87171]">-{dropPct}%</span>}
                              <span className="text-[11px] text-[#3A3530]">{count}</span>
                            </div>
                          </div>
                          <MiniBar value={count} max={stats.wizardSteps[1] ?? 1} color="#FBBF24" />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-3 mt-1 border-t border-white/[0.04] flex items-center justify-between">
                    <span className="text-[11px] text-[#5A5248]">Elküldött ajánlatkérések</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#FBBF24]">{wizardConvRate}% konverzió</span>
                      <span className="text-[13px] text-[#D4C4B0] font-medium">{summary.wizardComplete}</span>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Esemény típusok */}
          <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-px bg-[#C8A882]/40" />
              <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Esemény típusok</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {Object.entries(stats.eventTypeMap).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                const max = Math.max(...Object.values(stats.eventTypeMap));
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-[#5A5248] truncate">{EVENT_LABELS[type] ?? type}</span>
                        <span className="text-[11px] text-[#3A3530] ml-2 shrink-0">{count}</span>
                      </div>
                      <MiniBar value={count} max={max} color="#34D399" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legutóbbi események */}
        <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-px bg-[#C8A882]/40" />
              <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">Legutóbbi események</span>
            </div>
            <select value={eventFilter} onChange={e => setEventFilter(e.target.value)}
              className="bg-[#141210] border border-white/[0.08] text-[11px] text-[#5A5248] px-3 py-1.5 focus:outline-none">
              <option value="all">Minden esemény</option>
              {Object.keys(stats.eventTypeMap).map(t => (
                <option key={t} value={t}>{EVENT_LABELS[t] ?? t}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Időpont", "Típus", "Oldal", "Meta"].map(h => (
                    <th key={h} className="pb-2 text-left text-[9px] tracking-[0.14em] uppercase text-[#3A3530] pr-4 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEvents.slice(0, 20).map(ev => (
                  <tr key={ev.id} className="border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors">
                    <td className="py-2 pr-4 text-[#3A3530] whitespace-nowrap">{formatDate(ev.createdAt)}</td>
                    <td className="py-2 pr-4">
                      <span className="inline-block px-2 py-0.5 border border-white/[0.06] text-[#5A5248] text-[10px]">
                        {EVENT_LABELS[ev.type] ?? ev.type}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-[#3A3530] truncate max-w-[160px]">{ev.page ?? "—"}</td>
                    <td className="py-2 text-[#3A3530] truncate max-w-[200px]">
                      {ev.meta ? JSON.stringify(ev.meta).slice(0, 60) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEvents.length === 0 && (
              <p className="text-[11px] text-[#3A3530] py-6 text-center">Nincs találat.</p>
            )}
          </div>
        </div>

        {/* Összesítők */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Összes session",     value: summary.totalSessions.toLocaleString("hu-HU"),  sub: "minden idők" },
            { label: "Összes esemény",     value: summary.totalEvents.toLocaleString("hu-HU"),    sub: "minden idők" },
            { label: "Visszatérő látogató",value: summary.returningUsers,                         sub: "ebben az időszakban" },
            { label: "Projekt létrehozva", value: summary.projectCreated,                         sub: "ebben az időszakban" },
          ].map(s => (
            <div key={s.label} className="bg-[#0E0C0A] border border-white/[0.05] px-4 py-3">
              <div className="text-[9px] tracking-[0.14em] uppercase text-[#3A3530] mb-1">{s.label}</div>
              <div className="font-['Cormorant_Garamond'] text-[1.8rem] font-light text-[#C8A882] leading-none">{s.value}</div>
              <div className="text-[10px] text-[#3A3530] mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}