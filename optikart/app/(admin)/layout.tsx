"use client";

import { useState, useEffect } from "react";
import SidebarDark from "@/app/components/AdminDashNav";

export default function AdminLayout({
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
    <div className="flex min-h-screen bg-[#0C0A08]">
      <SidebarDark collapsed={collapsed} onCollapse={setCollapsed} />

      <main
        className="flex-1 min-h-screen bg-[#0C0A08] transition-[margin] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          marginLeft: isDesktop ? (collapsed ? "72px" : "260px") : "0px",
        }}
      >
        {/* Mobil topbar offset */}
        <div className="lg:hidden h-14" />
        {children}
      </main>
    </div>
  );
}