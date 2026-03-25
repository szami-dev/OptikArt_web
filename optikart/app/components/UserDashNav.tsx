"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Projektek",
    href: "/admin/projects",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Felhasználók",
    href: "/admin/users",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Üzenetek",
    href: "/admin/messages",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    badge: 3,
  },
  {
    label: "Naptár",
    href: "/admin/calendar",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

const bottomItems = [
  {
    label: "Beállítások",
    href: "/admin/settings",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Jost:wght@300;400;500&display=swap');

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: ${collapsed ? "72px" : "260px"};
          background: #faf8f5;
          border-right: 1px solid rgba(0,0,0,0.07);
          display: flex;
          flex-direction: column;
          font-family: 'Jost', sans-serif;
          transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 50;
          overflow: hidden;
        }

        /* Top: logo + collapse */
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${collapsed ? "22px 18px" : "22px 20px"};
          border-bottom: 1px solid rgba(0,0,0,0.06);
          min-height: 68px;
          transition: padding 0.35s ease;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          overflow: hidden;
        }

        .logo-mark {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #1a1a1a, #3a3530);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 600;
          color: #f5f0e8;
          flex-shrink: 0;
        }

        .logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 500;
          color: #1a1a1a;
          letter-spacing: 0.04em;
          white-space: nowrap;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.2s ease;
        }

        .collapse-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid rgba(0,0,0,0.08);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #9a9088;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .collapse-btn:hover {
          background: rgba(0,0,0,0.04);
          color: #3a3530;
          border-color: rgba(0,0,0,0.14);
        }

        .collapse-btn svg {
          width: 14px;
          height: 14px;
          transition: transform 0.35s ease;
          transform: ${collapsed ? "rotate(180deg)" : "rotate(0deg)"};
        }

        /* Section label */
        .sidebar-section-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #b8b0a8;
          padding: ${collapsed ? "20px 0 8px" : "20px 20px 8px"};
          white-space: nowrap;
          overflow: hidden;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.2s ease;
          height: ${collapsed ? "0px" : "auto"};
        }

        /* Nav */
        .sidebar-nav {
          flex: 1;
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-nav::-webkit-scrollbar { width: 0; }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: ${collapsed ? "10px 0" : "10px 12px"};
          border-radius: 6px;
          text-decoration: none;
          color: #6a6258;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.03em;
          white-space: nowrap;
          transition: all 0.2s ease;
          cursor: pointer;
          justify-content: ${collapsed ? "center" : "flex-start"};
        }

        .nav-item:hover {
          background: rgba(0,0,0,0.04);
          color: #1a1a1a;
        }

        .nav-item.active {
          background: #1a1a1a;
          color: #f5f0e8;
        }

        .nav-item.active .nav-badge {
          background: rgba(245,240,232,0.2);
          color: #f5f0e8;
        }

        .nav-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .nav-label {
          flex: 1;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.15s ease;
          overflow: hidden;
        }

        .nav-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 9px;
          background: #e8e2da;
          color: #5a5248;
          font-size: 10px;
          font-weight: 500;
          flex-shrink: 0;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.15s ease;
        }

        /* Tooltip on collapsed */
        .nav-item:hover .nav-tooltip {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
        }

        .nav-tooltip {
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateX(-6px) translateY(-50%);
          background: #1a1a1a;
          color: #f5f0e8;
          font-size: 12px;
          padding: 5px 10px;
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s ease;
          display: ${collapsed ? "block" : "none"};
          z-index: 200;
        }

        .nav-tooltip::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-right-color: #1a1a1a;
        }

        /* Divider */
        .sidebar-divider {
          height: 1px;
          background: rgba(0,0,0,0.06);
          margin: 4px 10px;
        }

        /* Bottom: user */
        .sidebar-bottom {
          padding: 10px 10px 16px;
          border-top: 1px solid rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .user-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: ${collapsed ? "10px 0" : "10px 12px"};
          border-radius: 6px;
          text-decoration: none;
          transition: background 0.2s ease;
          overflow: hidden;
          justify-content: ${collapsed ? "center" : "flex-start"};
        }

        .user-card:hover {
          background: rgba(0,0,0,0.04);
        }

        .user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c8b89a, #a09070);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          flex-shrink: 0;
        }

        .user-info {
          flex: 1;
          overflow: hidden;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.15s ease;
        }

        .user-name {
          font-size: 13px;
          font-weight: 400;
          color: #2a2520;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #b8b0a8;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: ${collapsed ? "10px 0" : "10px 12px"};
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #9a9088;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.03em;
          cursor: pointer;
          width: 100%;
          white-space: nowrap;
          transition: all 0.2s ease;
          justify-content: ${collapsed ? "center" : "flex-start"};
        }

        .logout-btn:hover {
          background: rgba(192,57,43,0.06);
          color: #c0392b;
        }

        .logout-btn svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .logout-label {
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.15s ease;
        }
      `}</style>

      <aside className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <Link href="/admin" className="sidebar-logo">
            <Image
              src="/assets/9optik1 (4).png"
              alt="OptikArt"
              width={150}
              height={150}
            />
          </Link>
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigáció</div>

          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
              <span className="nav-tooltip">{item.label}</span>
            </Link>
          ))}

          <div className="sidebar-divider" />

          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              <span className="nav-tooltip">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom: user + logout */}
        <div className="sidebar-bottom">
          <Link href="/profile" className="user-card">
            <div className="user-avatar">
              {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="user-info">
              <div className="user-name">
                {session?.user?.name ?? "Felhasználó"}
              </div>
              <div className="user-role">Admin</div>
            </div>
          </Link>

          <button
            className="logout-btn"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="logout-label">Kijelentkezés</span>
          </button>
        </div>
      </aside>
    </>
  );
}
