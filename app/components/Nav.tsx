"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Button from "@/app/components/Button";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const menuItems = [
  { label: "Főoldal", href: "/" },
  { label: "Esküvő", href: "/wedding" },
  { label: "Portré", href: "/portrait" },
  { label: "Marketing", href: "/marketing" },
  { label: "Rendezvény", href: "/event" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-['Jost',sans-serif] ${
          scrolled 
            ? "bg-[#FCFAF7]/90 backdrop-blur-xl border-b border-black/5 shadow-[0_1px_40px_rgba(0,0,0,0.06)] h-[64px]" 
            : "bg-[#FCFAF7]/60 backdrop-blur-md border-b border-black/5 h-[68px]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between gap-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/assets/9optik1 (4).png"
              alt="OptikArt"
              width={80}
              height={80}
              className="object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative px-3.5 py-1.5 text-[12px] tracking-[0.08em] uppercase transition-colors group ${
                    isActive(item.href) ? "text-black font-medium" : "text-[#3A3530] hover:text-black"
                  }`}
                >
                  {item.label}
                  {/* Underline animation */}
                  <span 
                    className={`absolute bottom-0.5 left-3.5 right-3.5 h-[1px] bg-black transition-transform duration-300 ease-out origin-left ${
                      isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`} 
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* Button           <Button variant="primary">
                Projekt indítása
              </Button>
*/}

          {/* User section */}
          <div className="flex items-center gap-3 shrink-0">
            {status === "loading" && (
              <div className="w-[90px] h-[32px] rounded-sm bg-neutral-200 animate-pulse" />
            )}

            {status === "unauthenticated" && (
              <Link 
                href="/auth/login" 
                className="flex items-center gap-2 px-5 py-2 bg-[#1A1A1A] text-[#F5F0E8] text-[11px] tracking-widest uppercase rounded-[2px] border border-transparent transition-all hover:bg-transparent hover:text-[#1A1A1A] hover:border-[#1A1A1A]"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Belépés
              </Link>
            )}

            {status === "authenticated" && session?.user && (
              <div className="flex items-center gap-3">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2.5 p-1 pr-3 rounded-full border border-black/10 bg-white/70 transition-all hover:bg-white hover:border-black/20 hover:shadow-lg group"
                >
                  <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#C8B89A] to-[#A09070] flex items-center justify-center font-['Cormorant_Garamond'] text-[13px] font-semibold text-white shrink-0">
                    {session.user.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <span className="hidden sm:block text-[13px] font-normal text-[#2A2520] tracking-tight max-w-[120px] truncate">
                    {session.user.name}
                  </span>
                  <span className="hidden sm:block text-[10px] text-neutral-400 group-hover:translate-y-0.5 transition-transform">▾</span>
                </Link>

                <div className="w-px h-5 bg-black/10" />

                <button
                  className="flex items-center justify-center w-[34px] h-[34px] rounded-sm border border-black/10 text-neutral-500 transition-all hover:border-red-600 hover:text-red-600 hover:bg-red-50"
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  title="Kijelentkezés"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="flex md:hidden flex-col gap-[5px] p-1.5 focus:outline-none group"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className={`block w-[22px] h-[1.5px] bg-[#1A1A1A] transition-all duration-300 origin-center ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`} />
              <span className={`block w-[22px] h-[1.5px] bg-[#1A1A1A] transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block w-[22px] h-[1.5px] bg-[#1A1A1A] transition-all duration-300 origin-center ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div 
        className={`md:hidden fixed top-[64px] left-0 right-0 bg-[#FCFAF7]/95 backdrop-blur-xl border-b border-black/5 z-[99] p-6 transition-all duration-500 ease-out flex flex-col gap-1 ${
          menuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`py-3 text-[14px] tracking-widest uppercase border-b border-black/5 last:border-none transition-colors ${
              isActive(item.href) ? "text-black font-medium" : "text-[#3A3530]"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}