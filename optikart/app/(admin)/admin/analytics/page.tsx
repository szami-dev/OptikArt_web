"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TowerControl as Tower, Users, Clock, Eye } from 'lucide-react';

export default function SovietAnalytics() {
  // Demo adatok a népgazdasági jelentéshez
  const data = [
    { name: 'Hétfő', látogató: 400 },
    { name: 'Kedd', látogató: 300 },
    { name: 'Szerda', látogató: 520 },
    { name: 'Csütörtök', látogató: 450 },
    { name: 'Péntek', látogató: 780 }, // Itt volt a mozgósítás
    { name: 'Szombat', látogató: 600 },
    { name: 'Vasárnap', látogató: 400 },
  ];

  return (
    <div className="min-h-screen bg-[#2b2b2b] p-8 font-mono text-[#d1d1d1]">
      {/* FEJLÉC */}
      <div className="border-4 border-[#cc0000] p-6 mb-8 bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-20">
            <Tower size={100} color="#cc0000" />
        </div>
        <h1 className="text-5xl font-black text-[#cc0000] uppercase tracking-tighter mb-2 italic">
          Központi Adat-Adatbázis
        </h1>
        <p className="text-xl text-[#A08060] font-bold">STATISZTIKAI JELENTÉS AZ ÖTÉVES TERV ÁLLÁSÁRÓL</p>
      </div>

      {/* GYORSSTATISZTIKA (KÁRTYÁK) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
        <div className="bg-[#333333] border-2 border-[#555555] p-6 shadow-[8px_8px_0px_0px_rgba(204,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          <Users className="mx-auto mb-2 text-[#cc0000]" size={40} />
          <h2 className="text-4xl font-black">1,240</h2>
          <p className="text-sm uppercase font-bold text-[#888888]">Munkásosztály látogatók</p>
        </div>
        <div className="bg-[#333333] border-2 border-[#555555] p-6 shadow-[8px_8px_0px_0px_rgba(204,0,0,1)]">
          <Clock className="mx-auto mb-2 text-[#cc0000]" size={40} />
          <h2 className="text-4xl font-black">4:20</h2>
          <p className="text-sm uppercase font-bold text-[#888888]">Munkaidő az oldalon (perc)</p>
        </div>
        <div className="bg-[#333333] border-2 border-[#555555] p-6 shadow-[8px_8px_0px_0px_rgba(204,0,0,1)]">
          <Eye className="mx-auto mb-2 text-[#cc0000]" size={40} />
          <h2 className="text-4xl font-black">112%</h2>
          <p className="text-sm uppercase font-bold text-[#888888]">Terv feletti megtekintés</p>
        </div>
      </div>

      {/* GRAFIKON SZEKCIÓ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1a1a1a] border-4 border-[#555555] p-6 relative">
            <h3 className="text-2xl font-bold mb-6 text-[#cc0000] uppercase border-b-2 border-[#cc0000] inline-block">
                Látogatottsági Ingadozás
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} />
                        <YAxis stroke="#888" fontSize={12} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '2px solid #cc0000', color: '#fff' }}
                            itemStyle={{ color: '#cc0000' }}
                        />
                        <Bar dataKey="látogató" fill="#cc0000" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* TOP OLDALAK LISTA */}
        <div className="bg-[#1a1a1a] border-4 border-[#555555] p-6">
            <h3 className="text-2xl font-bold mb-6 text-[#cc0000] uppercase border-b-2 border-[#cc0000] inline-block">
                Legnépszerűbb Egységek
            </h3>
            <div className="space-y-4">
                {[
                    { url: '/galeria/eskuvo', count: 450, color: 'bg-[#cc0000]' },
                    { url: '/galeria/portre', count: 320, color: 'bg-[#990000]' },
                    { url: '/dashboard', count: 180, color: 'bg-[#660000]' },
                    { url: '/kapcsolat', count: 90, color: 'bg-[#440000]' },
                ].map((page, i) => (
                    <div key={i} className="relative">
                        <div className="flex justify-between mb-1 text-sm font-bold uppercase tracking-widest">
                            <span>{page.url}</span>
                            <span>{page.count} Elvtárs</span>
                        </div>
                        <div className="w-full bg-[#333] h-4 border border-[#555]">
                            <div 
                                className={`${page.color} h-full transition-all duration-1000`} 
                                style={{ width: `${(page.count / 450) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* LÁBLÉC */}
      <div className="mt-12 text-center text-[#555555] text-xs uppercase tracking-[0.5em]">
        Propaganda helyett adatok · OptikArt Kulturális Főosztály · 1984-2026
      </div>
    </div>
  );
}