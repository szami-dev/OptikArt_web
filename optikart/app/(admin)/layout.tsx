"use client";

import SidebarDark from "../components/AdminDashNav";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0C0A08]">
      <SidebarDark collapsed={collapsed} onCollapse={setCollapsed} />
      <main
        className="flex-1 min-h-screen bg-[#0C0A08] transition-[margin] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          marginLeft: collapsed ? "72px" : "260px",
        }}
      >
        {/* Mobil topbar offset */}
        <div className="lg:hidden h-14" />
        {children}
      </main>
    </div>
  );
}