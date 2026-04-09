"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { SiSalla } from "react-icons/si";

// ── Nav elemek beégetve ───────────────────────────────────────
const menuItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    href: "/admin/projects",
    label: "Projektek",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>,
  },
  {
    href: "/admin/users",
    label: "Felhasználók",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    href: "/admin/packages",
    label: "Csomagok",
    //badge: 3,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    href: "/admin/analytics",
    label: "Analitika",
    //badge: 3,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><path d="M3 3v18h18"/><path d="M9 17V9"/><path d="M13 17V5"/><path d="M17 17v-4"/></svg>,
  },
  {
    href: "/admin/calendar",
    label: "Naptár",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    href: "/admin/galleries",
    label: "Galériák",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  },
];

const bottomItems = [
  {
    href: "/admin/assets",
    label: "Segédletek",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
];

// ── Komponens ─────────────────────────────────────────────────
export default function SidebarDark({
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
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  function SidebarContent({ isMobile = false }: { isMobile?: boolean }) {
    const isCollapsed = !isMobile && collapsed;

    return (
      <>
        {/* Header */}
        <div className={`flex items-center border-b border-white/[0.06] min-h-[68px] py-[22px] transition-all duration-[350ms] ${isCollapsed ? "justify-center px-0" : "justify-between px-5"}`}>
          {isCollapsed ? (
            <Link href="/admin" className="w-8 h-8  flex items-center justify-center shrink-0">
              <Image src="/assets/14symbol3.png" alt="OptikArt" width={40} height={40} className="object-contain brightness-0 invert opacity-90" />

              </Link>
          ) : (
            <Link href="/admin" className="overflow-hidden">
              <Image src="/assets/10optik2 (1).png" alt="OptikArt" width={110} height={40} className="object-contain brightness-0 invert opacity-90" />
            </Link>
          )}
          {!isMobile && !isCollapsed && (
            <button onClick={() => setCollapsed(true)} className="w-7 h-7 rounded-md border border-white/[0.08] flex items-center justify-center text-[#5A5248] hover:bg-white/[0.04] hover:text-[#C8A882] transition-all shrink-0 ml-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          {isMobile && (
            <button onClick={() => setMobileOpen(false)} className="w-7 h-7 rounded-md border border-white/[0.08] flex items-center justify-center text-[#5A5248] hover:bg-white/[0.04] hover:text-[#C8A882] transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5 py-3 overflow-y-auto overflow-x-hidden scrollbar-none"
          style={{ paddingLeft: isCollapsed ? 0 : "10px", paddingRight: isCollapsed ? 0 : "10px" }}>
          {!isCollapsed && (
            <div className="text-[9px] font-medium tracking-[0.18em] uppercase text-[#3A3530] px-3 pt-4 pb-2">Navigáció</div>
          )}
          {menuItems.map(item => (
            <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={isCollapsed} />
          ))}
          <div className={`h-px bg-white/[0.05] my-1 ${isCollapsed ? "mx-3" : "mx-2.5"}`} />
          {bottomItems.map(item => (
            <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={isCollapsed} />
          ))}
        </nav>

        {/* Bottom */}
        <div className={`pb-4 pt-2.5 border-t border-white/[0.05] flex flex-col gap-0.5 ${isCollapsed ? "px-0 items-center" : "px-2.5"}`}>
          {isCollapsed && (
            <button onClick={() => setCollapsed(false)} className="w-9 h-9 rounded-md border border-white/[0.08] flex items-center justify-center text-[#5A5248] hover:bg-white/[0.04] hover:text-[#C8A882] transition-all mb-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 rotate-180"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          <Link href="/admin/users" className={`flex items-center rounded-sm hover:bg-white/[0.04] transition-colors group relative ${isCollapsed ? "justify-center w-10 h-10 mx-auto" : "gap-2.5 px-3 py-2.5"}`}>
            <div className="w-[30px] h-[30px] border border-[#C8A882]/30 flex items-center justify-center font-['Cormorant_Garamond'] text-[14px] font-light text-[#C8A882] shrink-0">
              {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden min-w-0">
                <div className="text-[13px] text-[#D4C4B0] truncate">{session?.user?.name ?? "Felhasználó"}</div>
                <div className="text-[9px] tracking-[0.12em] uppercase text-[#3A3530] mt-0.5">Admin</div>
              </div>
            )}
            {isCollapsed && (
              <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1A1410] border border-white/10 text-[#D4C4B0] text-[12px] px-2.5 py-1.5 rounded-sm whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[200]">
                {session?.user?.name ?? "Profil"}
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1A1410]" />
              </span>
            )}
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className={`flex items-center rounded-sm text-[#3A3530] text-[13px] whitespace-nowrap hover:bg-red-500/[0.08] hover:text-red-400 transition-all w-full group relative ${isCollapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5"}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {!isCollapsed && <span>Kijelentkezés</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1A1410] border border-white/10 text-red-400 text-[12px] px-2.5 py-1.5 rounded-sm whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[200]">
                Kijelentkezés
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1A1410]" />
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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4 bg-[#0E0C0A] border-b border-white/[0.06]">
        <Link href="/admin">
          <Image src="/assets/10optik2 (1).png" alt="OptikArt" width={90} height={32} className="object-contain brightness-0 invert opacity-90" />
        </Link>
        <button onClick={() => setMobileOpen(true)} className="w-9 h-9 border border-white/[0.08] flex items-center justify-center text-[#5A5248] hover:text-[#C8A882] hover:border-white/20 transition-all">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Mobil overlay */}
      <div className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)} />

      {/* Mobil drawer */}
      <aside className={`lg:hidden fixed top-0 left-0 bottom-0 w-[280px] flex flex-col bg-[#0E0C0A] border-r border-white/[0.06] z-50 transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent isMobile />
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex fixed top-0 left-0 bottom-0 flex-col bg-[#0E0C0A] border-r border-white/[0.06] z-50 transition-[width] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${collapsed ? "w-[72px]" : "w-[260px]"}`}>
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
    <Link href={item.href} className={`relative flex items-center rounded-sm text-[13px] tracking-[0.03em] whitespace-nowrap transition-all duration-200 group ${
      collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5"
    } ${active ? (collapsed ? "bg-[#C8A882]/15 text-[#C8A882]" : "bg-[#C8A882]/15 text-[#C8A882] border-l-2 border-[#C8A882]") : "text-[#5A5248] hover:bg-white/[0.04] hover:text-[#D4C4B0]"}`}>
      <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center">{item.icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 min-w-0 truncate">{item.label}</span>
          {item.badge && (
            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-medium ${active ? "bg-[#C8A882]/20 text-[#C8A882]" : "bg-[#C8A882]/10 text-[#C8A882]/70"}`}>
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && (
        <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1A1410] border border-white/10 text-[#D4C4B0] text-[12px] px-2.5 py-1.5 rounded-sm whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[200]">
          {item.label}
          {item.badge && <span className="ml-2 bg-[#C8A882]/20 text-[#C8A882] text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1A1410]" />
        </span>
      )}
    </Link>
  );
}