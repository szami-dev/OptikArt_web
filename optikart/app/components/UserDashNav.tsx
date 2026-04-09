"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

// ── Nav elemek beégetve ───────────────────────────────────────
const menuItems = [
  {
    href: "/user/dashboard",
    label: "Dashboard",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    href: "/user/projects",
    label: "Projektek",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>,
  },
  /*
  {
    href: "/user/messages",
    label: "Üzenetek",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },*/
  {
    href: "/user/calendar",
    label: "Naptár",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    href: "/user/galleries",
    label: "Galériáim",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  },
];

const bottomItems = [
  {
    href: "/user/profile",
    label: "Profilom",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    href: "/contact",
    label: "Új projekt",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  },
];

// ── Komponens ─────────────────────────────────────────────────
export default function SidebarLight({
  collapsed: collapsedProp,
  onCollapse,
}: {
  collapsed?: boolean;
  onCollapse?: (v: boolean) => void;
} = {}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const collapsed = collapsedProp !== undefined ? collapsedProp : internalCollapsed;
  const setCollapsed = (v: boolean) => {
    onCollapse?.(v);
    if (collapsedProp === undefined) setInternalCollapsed(v);
  };

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/user" ? pathname === "/user" : pathname.startsWith(href);

  function SidebarContent({ isMobile = false }: { isMobile?: boolean }) {
    const isCollapsed = !isMobile && collapsed;

    return (
      <>
        {/* Header */}
        <div className={`flex items-center border-b border-black/[0.06] min-h-[68px] py-[22px] transition-all duration-[350ms] ${isCollapsed ? "justify-center px-0" : "justify-between px-5"}`}>
          {isCollapsed ? (
            <Link href="/" className="w-8 h-8 flex items-center justify-center shrink-0">
              <Image src="/assets/11symbol1.png" alt="OptikArt" width={40} height={40} className="object-contain" />
            </Link>
          ) : (
            <Link href="/" className="flex items-center overflow-hidden">
              <Image src="/assets/11optic3.png" alt="OptikArt" width={110} height={40} className="object-contain" />
            </Link>
          )}
          {!isMobile && !isCollapsed && (
            <button onClick={() => setCollapsed(true)} className="w-7 h-7 rounded-md border border-black/[0.08] flex items-center justify-center text-[#9A9088] hover:bg-black/[0.04] hover:text-[#3A3530] hover:border-black/[0.14] transition-all duration-200 shrink-0 ml-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          {isMobile && (
            <button onClick={() => setMobileOpen(false)} className="w-7 h-7 rounded-md border border-black/[0.08] flex items-center justify-center text-[#9A9088] hover:bg-black/[0.04] hover:text-[#3A3530] transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5 py-3 overflow-y-auto overflow-x-hidden scrollbar-none"
          style={{ paddingLeft: isCollapsed ? 0 : "10px", paddingRight: isCollapsed ? 0 : "10px" }}>
          {!isCollapsed && (
            <div className="text-[9px] font-medium tracking-[0.18em] uppercase text-[#B8B0A8] px-3 pt-4 pb-2">Navigáció</div>
          )}
          {menuItems.map(item => (
            <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={isCollapsed} />
          ))}
          <div className={`h-px bg-black/[0.06] my-1 ${isCollapsed ? "mx-3" : "mx-2.5"}`} />
          {bottomItems.map(item => (
            <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={isCollapsed} />
          ))}
        </nav>

        {/* Bottom */}
        <div className={`pb-4 pt-2.5 border-t border-black/[0.06] flex flex-col gap-0.5 ${isCollapsed ? "px-0 items-center" : "px-2.5"}`}>
          {isCollapsed && (
            <button onClick={() => setCollapsed(false)} className="w-9 h-9 rounded-md border border-black/[0.08] flex items-center justify-center text-[#9A9088] hover:bg-black/[0.04] hover:text-[#3A3530] transition-all duration-200 mb-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 rotate-180"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          <Link href="/user/profile" className={`flex items-center rounded-md hover:bg-black/[0.04] transition-colors duration-200 group relative ${isCollapsed ? "justify-center w-10 h-10 mx-auto" : "gap-2.5 px-3 py-2.5"}`}>
            <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#C8B89A] to-[#A09070] flex items-center justify-center font-['Cormorant_Garamond'] text-[13px] font-semibold text-white shrink-0">
              {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden min-w-0">
                <div className="text-[13px] text-[#2A2520] truncate">{session?.user?.name ?? "Felhasználó"}</div>
                <div className="text-[10px] tracking-[0.08em] uppercase text-[#B8B0A8]">Felhasználó</div>
              </div>
            )}
            {isCollapsed && (
              <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1A1510] text-[#F5F0E8] text-[12px] px-2.5 py-1.5 rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[200]">
                {session?.user?.name ?? "Profil"}
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1A1510]" />
              </span>
            )}
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className={`flex items-center rounded-md text-[#9A9088] text-[13px] whitespace-nowrap hover:bg-red-500/[0.06] hover:text-red-500 transition-all duration-200 w-full group relative ${isCollapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5"}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {!isCollapsed && <span>Kijelentkezés</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1A1510] text-red-400 text-[12px] px-2.5 py-1.5 rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[200]">
                Kijelentkezés
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1A1510]" />
              </span>
            )}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobil topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4 bg-[#FAF8F5] border-b border-black/[0.07]">
        <Link href="/user/dashboard">
          <Image src="/assets/9optik1 (4).png" alt="OptikArt" width={90} height={32} className="object-contain" />
        </Link>
        <button onClick={() => setMobileOpen(true)} className="w-9 h-9 border border-black/[0.08] flex items-center justify-center text-[#9A9088] hover:text-[#3A3530] hover:border-black/[0.14] transition-all">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Mobil overlay */}
      <div className={`lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)} />

      {/* Mobil drawer */}
      <aside className={`lg:hidden fixed top-0 left-0 bottom-0 w-[280px] flex flex-col bg-[#FAF8F5] border-r border-black/[0.07] z-50 transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent isMobile />
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex fixed top-0 left-0 bottom-0 flex-col bg-[#FAF8F5] border-r border-black/[0.07] z-50 transition-[width] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${collapsed ? "w-[72px]" : "w-[260px]"}`}>
        <SidebarContent />
      </aside>
    </>
  );
}

function NavItem({ item, active, collapsed }: {
  item: { href: string; label: string; icon: React.ReactNode; badge?: string | number };
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link href={item.href} className={`relative flex items-center rounded-md text-[13px] tracking-[0.03em] whitespace-nowrap transition-all duration-200 group ${
      collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5"
    } ${active ? "bg-[#1A1510] text-[#F5F0E8]" : "text-[#6A6258] hover:bg-black/[0.04] hover:text-[#1A1A1A]"}`}>
      <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center">{item.icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 min-w-0 truncate">{item.label}</span>
          {item.badge && (
            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-medium ${active ? "bg-white/20 text-[#F5F0E8]" : "bg-[#E8E2DA] text-[#5A5248]"}`}>
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && (
        <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1A1510] text-[#F5F0E8] text-[12px] px-2.5 py-1.5 rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[200]">
          {item.label}
          {item.badge && <span className="ml-2 bg-white/20 text-[#F5F0E8] text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1A1510]" />
        </span>
      )}
    </Link>
  );
}