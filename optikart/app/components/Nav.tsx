"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const menuItems = [
  { label: "Főoldal", href: "/" },
  { label: "Rólunk", href: "/about" },
  { label: "Galéria", href: "/gallery" },
  { label: "Projektek", href: "/projects" },
  { label: "Kapcsolat", href: "/contact" },
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Jost:wght@300;400;500&display=swap');

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          font-family: 'Jost', sans-serif;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .navbar.scrolled {
          background: rgba(252, 250, 247, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 1px 40px rgba(0,0,0,0.06);
        }

        .navbar.top {
          background: rgba(252, 250, 247, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(0,0,0,0.04);
        }

        .navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        /* Logo */
        .navbar-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          flex-shrink: 0;
        }

        .logo-img-wrapper {
          width: 36px;
          height: 36px;
          position: relative;
          border-radius: 4px;
          overflow: hidden;
        }

        .logo-placeholder {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 600;
          color: #f5f0e8;
          letter-spacing: 0.05em;
        }

        /* Menu */
        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          position: relative;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #3a3530;
          text-decoration: none;
          transition: color 0.2s;
          white-space: nowrap;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 14px;
          right: 14px;
          height: 1px;
          background: #3a3530;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-link:hover {
          color: #1a1a1a;
        }

        .nav-link:hover::after,
        .nav-link.active::after {
          transform: scaleX(1);
        }

        .nav-link.active {
          color: #1a1a1a;
          font-weight: 500;
        }

        /* User section */
        .navbar-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        /* Login button */
        .btn-login {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: #1a1a1a;
          color: #f5f0e8;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 2px;
          transition: all 0.25s ease;
          border: 1px solid transparent;
        }

        .btn-login:hover {
          background: transparent;
          color: #1a1a1a;
          border-color: #1a1a1a;
        }

        /* User info */
        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-profile-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 10px 5px 5px;
          border-radius: 100px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .user-profile-btn:hover {
          background: rgba(255,255,255,0.95);
          border-color: rgba(0,0,0,0.15);
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }

        .user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c8b89a 0%, #a09070 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          flex-shrink: 0;
        }

        .user-name {
          font-size: 13px;
          font-weight: 400;
          color: #2a2520;
          letter-spacing: 0.02em;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-chevron {
          color: #9a9088;
          font-size: 10px;
          transition: transform 0.2s;
        }

        /* Logout button */
        .btn-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 2px;
          border: 1px solid rgba(0,0,0,0.1);
          background: transparent;
          color: #7a7068;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .btn-logout:hover {
          border-color: #c0392b;
          color: #c0392b;
          background: rgba(192,57,43,0.04);
        }

        .btn-logout svg {
          width: 15px;
          height: 15px;
        }

        /* Divider */
        .user-divider {
          width: 1px;
          height: 20px;
          background: rgba(0,0,0,0.1);
        }

        /* Loading skeleton */
        .skeleton {
          width: 90px;
          height: 32px;
          border-radius: 2px;
          background: linear-gradient(90deg, #f0ede8 25%, #e8e4de 50%, #f0ede8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Mobile hamburger */
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 4px;
          background: none;
          border: none;
        }

        .hamburger span {
          display: block;
          width: 22px;
          height: 1.5px;
          background: #1a1a1a;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .hamburger.open span:nth-child(1) {
          transform: translateY(6.5px) rotate(45deg);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        .hamburger.open span:nth-child(3) {
          transform: translateY(-6.5px) rotate(-45deg);
        }

        /* Mobile menu */
        .mobile-menu {
          display: none;
          position: fixed;
          top: 68px;
          left: 0;
          right: 0;
          background: rgba(252, 250, 247, 0.97);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          padding: 1rem 2rem 1.5rem;
          flex-direction: column;
          gap: 0.25rem;
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-menu.open {
          display: flex;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mobile-nav-link {
          padding: 12px 0;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #3a3530;
          text-decoration: none;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          transition: color 0.2s;
        }

        .mobile-nav-link:last-child {
          border-bottom: none;
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          color: #1a1a1a;
        }

        @media (max-width: 900px) {
          .navbar-menu { display: none; }
          .hamburger { display: flex; }
        }

        @media (max-width: 480px) {
          .user-name { display: none; }
          .user-chevron { display: none; }
        }
      `}</style>

      <nav className={`navbar ${scrolled ? "scrolled" : "top"}`}>
        <div className="navbar-inner">
          {/* Logo */}
          <Link href="/" className="navbar-logo">
            <Image
              src="/assets/9optik1 (4).png"
              alt="OptikArt"
              width={90}
              height={90}
            />
          </Link>

          {/* Desktop Menu */}
          <ul className="navbar-menu">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link ${isActive(item.href) ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* User section */}
          <div className="navbar-user">
            {status === "loading" && <div className="skeleton" />}

            {status === "unauthenticated" && (
              <Link href="/auth/login" className="btn-login">
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
              <div className="user-info">
                <Link href="/profile" className="user-profile-btn">
                  <div className="user-avatar">
                    {session.user.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <span className="user-name">{session.user.name}</span>
                  <span className="user-chevron">▾</span>
                </Link>

                <div className="user-divider" />

                <button
                  className="btn-logout"
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  title="Kijelentkezés"
                >
                  <svg
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

            {/* Mobile hamburger */}
            <button
              className={`hamburger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menü"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-link ${isActive(item.href) ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}
