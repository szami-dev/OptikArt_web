"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { menuItems, bottomItems } from "./sidebarData";

export default function SidebarDark() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 flex flex-col bg-[#111009] border-r border-white/[0.06] z-50 overflow-hidden transition-[width] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* ── Header ── */}
      <div className={`flex items-center justify-between border-b border-white/[0.06] min-h-[68px] transition-[padding] duration-[350ms] ${collapsed ? "px-[18px] py-[22px]" : "px-5 py-[22px]"}`}>
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
          <div className={`transition-opacity duration-200 ${collapsed ? "opacity-0 w-0" : "opacity-100"}`}>
            {/* Sötét háttéren a világos logó verzió – cseréld ki ha van fehér logód */}
            <Image
              src="/assets/10optik2 (1).png"
              alt="OptikArt"
              width={110}
              height={40}
              className="object-contain brightness-0 invert opacity-90"
            />
          </div>
          {collapsed && (
            <div className="w-8 h-8 border border-[#C8A882]/30 flex items-center justify-center shrink-0">
              <span className="font-['Cormorant_Garamond'] text-[15px] font-light text-[#C8A882]">O</span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-md border border-white/[0.08] flex items-center justify-center text-[#5A5248] hover:bg-white/[0.04] hover:text-[#C8A882] hover:border-white/[0.14] transition-all duration-200 shrink-0"
        >
          <svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            className={`w-3.5 h-3.5 transition-transform duration-[350ms] ${collapsed ? "rotate-180" : "rotate-0"}`}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2.5 py-3 overflow-y-auto overflow-x-hidden scrollbar-none">

        <div className={`text-[9px] font-medium tracking-[0.18em] uppercase text-[#3A3530] transition-all duration-200 overflow-hidden whitespace-nowrap ${collapsed ? "opacity-0 h-0 py-0" : "opacity-100 px-3 pt-5 pb-2"}`}>
          Navigáció
        </div>

        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center gap-3 rounded-sm text-[13px] tracking-[0.03em] whitespace-nowrap transition-all duration-200 group ${
              collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
            } ${
              isActive(item.href)
                ? "bg-[#C8A882]/15 text-[#C8A882] border-l-2 border-[#C8A882]"
                : "text-[#5A5248] hover:bg-white/[0.04] hover:text-[#D4C4B0]"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>

            <span className={`flex-1 overflow-hidden transition-opacity duration-150 ${collapsed ? "opacity-0 w-0" : "opacity-100"}`}>
              {item.label}
            </span>

            {item.badge && (
              <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-medium transition-opacity duration-150 ${
                collapsed ? "opacity-0" : "opacity-100"
              } ${isActive(item.href) ? "bg-[#C8A882]/20 text-[#C8A882]" : "bg-[#C8A882]/10 text-[#C8A882]/70"}`}>
                {item.badge}
              </span>
            )}

            {/* Tooltip */}
            {collapsed && (
              <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1A1510] border border-white/10 text-[#D4C4B0] text-[12px] px-2.5 py-1.5 rounded-sm whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1.5 transition-all duration-200 z-[200]">
                {item.label}
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1A1510]" />
              </span>
            )}
          </Link>
        ))}

        {/* Divider */}
        <div className="h-px bg-white/[0.05] my-1 mx-2.5" />

        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center gap-3 rounded-sm text-[13px] tracking-[0.03em] whitespace-nowrap transition-all duration-200 group ${
              collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
            } ${
              isActive(item.href)
                ? "bg-[#C8A882]/15 text-[#C8A882] border-l-2 border-[#C8A882]"
                : "text-[#5A5248] hover:bg-white/[0.04] hover:text-[#D4C4B0]"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className={`flex-1 transition-opacity duration-150 ${collapsed ? "opacity-0 w-0" : "opacity-100"}`}>
              {item.label}
            </span>
            {collapsed && (
              <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1A1510] border border-white/10 text-[#D4C4B0] text-[12px] px-2.5 py-1.5 rounded-sm whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1.5 transition-all duration-200 z-[200]">
                {item.label}
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1A1510]" />
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* ── Bottom: user + logout ── */}
      <div className="px-2.5 pb-4 pt-2.5 border-t border-white/[0.05] flex flex-col gap-0.5">

        <Link
          href="/user/profile"
          className={`flex items-center gap-2.5 rounded-sm hover:bg-white/[0.04] transition-colors duration-200 overflow-hidden ${
            collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
          }`}
        >
          <div className="w-[30px] h-[30px] border border-[#C8A882]/30 flex items-center justify-center font-['Cormorant_Garamond'] text-[14px] font-light text-[#C8A882] shrink-0">
            {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className={`flex-1 overflow-hidden transition-opacity duration-150 ${collapsed ? "opacity-0 w-0" : "opacity-100"}`}>
            <div className="text-[13px] text-[#D4C4B0] truncate">{session?.user?.name ?? "Felhasználó"}</div>
            <div className="text-[9px] tracking-[0.12em] uppercase text-[#3A3530] mt-0.5">Admin</div>
          </div>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className={`flex items-center gap-3 rounded-sm text-[#3A3530] text-[13px] tracking-[0.03em] whitespace-nowrap hover:bg-red-500/[0.08] hover:text-red-400 transition-all duration-200 w-full ${
            collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className={`transition-opacity duration-150 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
            Kijelentkezés
          </span>
        </button>
      </div>
    </aside>
  );
}