"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { menuItems, bottomItems } from "./sidebarData";

export default function SidebarLight() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    href === "/user" ? pathname === "/user" : pathname.startsWith(href);

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 flex flex-col bg-[#FAF8F5] border-r border-black/[0.07] z-50 transition-[width] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* ── Header ── */}
      <div className={`flex items-center border-b border-black/[0.06] min-h-[68px] transition-all duration-[350ms] py-[22px] ${
        collapsed ? "justify-center px-0" : "justify-between px-5"
      }`}>

        {!collapsed && (
          <Link href="/user/dashboard" className="flex items-center overflow-hidden">
            <Image
              src="/assets/9optik1 (4).png"
              alt="OptikArt"
              width={110}
              height={40}
              className="object-contain"
            />
          </Link>
        )}

        {collapsed && (
          <Link href="/user/dashboard" className="w-8 h-8 bg-gradient-to-br from-[#1A1510] to-[#3A3530] flex items-center justify-center shrink-0">
            <span className="font-['Cormorant_Garamond'] text-[15px] font-semibold text-[#F5F0E8]">O</span>
          </Link>
        )}

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-7 h-7 rounded-md border border-black/[0.08] flex items-center justify-center text-[#9A9088] hover:bg-black/[0.04] hover:text-[#3A3530] hover:border-black/[0.14] transition-all duration-200 shrink-0 ml-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav
        className="flex-1 flex flex-col gap-0.5 py-3 overflow-y-auto overflow-x-hidden scrollbar-none"
        style={{ paddingLeft: collapsed ? 0 : "10px", paddingRight: collapsed ? 0 : "10px" }}
      >
        {!collapsed && (
          <div className="text-[9px] font-medium tracking-[0.18em] uppercase text-[#B8B0A8] px-3 pt-4 pb-2">
            Navigáció
          </div>
        )}

        {menuItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}

        <div className={`h-px bg-black/[0.06] my-1 ${collapsed ? "mx-3" : "mx-2.5"}`} />

        {bottomItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* ── Bottom: toggle + user + logout ── */}
      <div className={`pb-4 pt-2.5 border-t border-black/[0.06] flex flex-col gap-0.5 ${
        collapsed ? "px-0 items-center" : "px-2.5"
      }`}>

        {/* Expand gomb – csak collapsed módban */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-9 h-9 rounded-md border border-black/[0.08] flex items-center justify-center text-[#9A9088] hover:bg-black/[0.04] hover:text-[#3A3530] transition-all duration-200 mb-1"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 rotate-180">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* User */}
        <Link
          href="/user/profile"
          className={`flex items-center rounded-md hover:bg-black/[0.04] transition-colors duration-200 group relative ${
            collapsed
              ? "justify-center w-10 h-10 mx-auto"
              : "gap-2.5 px-3 py-2.5"
          }`}
        >
          <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#C8B89A] to-[#A09070] flex items-center justify-center font-['Cormorant_Garamond'] text-[13px] font-semibold text-white shrink-0">
            {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden min-w-0">
              <div className="text-[13px] text-[#2A2520] truncate">{session?.user?.name ?? "Felhasználó"}</div>
              <div className="text-[10px] tracking-[0.08em] uppercase text-[#B8B0A8]">Felhasználó</div>
            </div>
          )}
          {collapsed && (
            <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1A1510] text-[#F5F0E8] text-[12px] px-2.5 py-1.5 rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[200]">
              {session?.user?.name ?? "Profil"}
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1A1510]" />
            </span>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className={`flex items-center rounded-md text-[#9A9088] text-[13px] whitespace-nowrap hover:bg-red-500/[0.06] hover:text-red-500 transition-all duration-200 w-full group relative ${
            collapsed
              ? "justify-center w-10 h-10 mx-auto"
              : "gap-3 px-3 py-2.5"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span>Kijelentkezés</span>}
          {collapsed && (
            <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1A1510] text-red-400 text-[12px] px-2.5 py-1.5 rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[200]">
              Kijelentkezés
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1A1510]" />
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

// ── NavItem ───────────────────────────────────────────────────
function NavItem({
  item,
  active,
  collapsed,
}: {
  item: { href: string; label: string; icon: React.ReactNode; badge?: string | number };
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={`relative flex items-center rounded-md text-[13px] tracking-[0.03em] whitespace-nowrap transition-all duration-200 group ${
        collapsed
          ? "justify-center w-10 h-10 mx-auto"
          : "gap-3 px-3 py-2.5"
      } ${
        active
          ? "bg-[#1A1510] text-[#F5F0E8]"
          : "text-[#6A6258] hover:bg-black/[0.04] hover:text-[#1A1A1A]"
      }`}
    >
      <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center">
        {item.icon}
      </span>

      {!collapsed && (
        <>
          <span className="flex-1 min-w-0 truncate">{item.label}</span>
          {item.badge && (
            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-medium ${
              active ? "bg-white/20 text-[#F5F0E8]" : "bg-[#E8E2DA] text-[#5A5248]"
            }`}>
              {item.badge}
            </span>
          )}
        </>
      )}

      {collapsed && (
        <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1A1510] text-[#F5F0E8] text-[12px] px-2.5 py-1.5 rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[200]">
          {item.label}
          {item.badge && (
            <span className="ml-2 bg-white/20 text-[#F5F0E8] text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>
          )}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1A1510]" />
        </span>
      )}
    </Link>
  );
}