"use client";

import { useState, useEffect } from "react";
import SidebarLight from "../components/UserDashNav";
import AnalyticsTracker from "../components/ActivityMonitor";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FAF8F4]">
      <SidebarLight collapsed={collapsed} onCollapse={setCollapsed} />
        <AnalyticsTracker />
      <main
        className="flex-1 min-h-screen bg-[#FAF8F4] transition-[margin] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          // Mobilon (overlay sidebar): nincs margin
          // Desktopon: margin = sidebar szélessége
          marginLeft: isDesktop ? (collapsed ? "72px" : "260px") : "0px",
        }}
      >
        {/* Mobil topbar offset – h-14 = 56px */}
        <div className="lg:hidden h-14" />
        {children}
      </main>
    </div>
  );
}