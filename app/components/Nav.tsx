"use client";

// app/components/Nav.tsx
// FIX: navbar mindig ugyanolyan – nincs scrolled-függő háttér változás
// A gomb is egységes (második verzió az etalon)

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const menuItems = [
  { label: "Főoldal", href: "/" },
  { label: "Esküvő", href: "/wedding" },
  { label: "Portré", href: "/portrait" },
  { label: "Marketing", href: "/marketing" },
  { label: "Rendezvény", href: "/event" },
  //{ label: "Drón", href: "/drone" },
];

const NAV_H = 68; // szinkronban a layout.tsx és hero komponensekkel

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[100] font-['Jost',sans-serif] transition-shadow duration-300"
        style={{
          height: `${NAV_H}px`,
          // ── FIX: mindig ugyanaz a fehér krém háttér, csak az árnyék változik ──
          backgroundColor: "#FCFAF7",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          boxShadow: scrolled ? "0 1px 32px rgba(0,0,0,0.07)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-full flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/assets/9optik1 (4).png"
              alt="OptikArt"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop menü */}
          <ul className="hidden md:flex items-center gap-0.5 list-none m-0 p-0 flex-1 justify-center">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative px-3.5 py-2 text-[12px] tracking-[0.08em] uppercase transition-colors duration-200 group block ${
                    isActive(item.href)
                      ? "text-[#1A1A1A] font-medium"
                      : "text-[#5A5248] hover:text-[#1A1A1A]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-1 left-3.5 right-3.5 h-[1px] bg-[#1A1A1A] transition-transform duration-300 ease-out origin-left ${
                      isActive(item.href)
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* Jobb oldal: belépés / profil */}
          <div className="flex items-center gap-3 shrink-0">
            {status === "loading" && (
              <div className="w-[88px] h-[36px] bg-[#EDE8E0] animate-pulse rounded-sm" />
            )}

            {status === "unauthenticated" && (
              // ── ETALON gomb: bg-[#1A1A1A], szöveg fehér, nincs lekerekítés ──
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white text-[11px] tracking-[0.12em] uppercase border border-[#1A1A1A] transition-all duration-200 hover:bg-transparent hover:text-[#1A1A1A] whitespace-nowrap"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Belépés
              </Link>
            )}

            {status === "authenticated" && session?.user && (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 border border-[#EDE8E0] bg-white transition-all duration-200 hover:border-[#C8A882]/50 hover:shadow-sm group"
                >
                  <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-[#C8B89A] to-[#A09070] flex items-center justify-center font-['Cormorant_Garamond'] text-[12px] font-semibold text-white shrink-0">
                    {session.user.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <span className="hidden sm:block text-[12px] text-[#2A2520] tracking-tight max-w-[110px] truncate">
                    {session.user.name}
                  </span>
                  <span className="text-[9px] text-[#A08060] group-hover:translate-y-0.5 transition-transform">
                    ▾
                  </span>
                </Link>

                <div className="w-px h-5 bg-[#EDE8E0]" />

                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  title="Kijelentkezés"
                  className="flex items-center justify-center w-[34px] h-[34px] border border-[#EDE8E0] text-[#A08060] transition-all duration-200 hover:border-red-300 hover:text-red-500 hover:bg-red-50"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Mobil hamburger */}
            <button
              className="flex md:hidden flex-col gap-[5px] p-1.5 ml-1 focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menü"
            >
              <span
                className={`block w-[22px] h-[1.5px] bg-[#1A1A1A] transition-all duration-300 origin-center ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`}
              />
              <span
                className={`block w-[22px] h-[1.5px] bg-[#1A1A1A] transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`}
              />
              <span
                className={`block w-[22px] h-[1.5px] bg-[#1A1A1A] transition-all duration-300 origin-center ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobil menü */}
      <div
        className={`md:hidden fixed left-0 right-0 bg-[#FCFAF7] border-b border-black/5 z-[99] px-6 pb-5 transition-all duration-400 ease-out ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ top: `${NAV_H}px` }}
      >
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block py-3.5 text-[13px] tracking-[0.1em] uppercase border-b border-black/5 last:border-none transition-colors ${
              isActive(item.href)
                ? "text-[#1A1A1A] font-medium"
                : "text-[#5A5248]"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}

        {/* Mobil belépés */}
        {status === "unauthenticated" && (
          <div className="pt-4">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#1A1A1A] text-white text-[11px] tracking-[0.12em] uppercase"
              onClick={() => setMenuOpen(false)}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Belépés
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
