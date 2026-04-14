// app/(public)/layout.tsx

import Navbar from "../components/Nav";
import GSAPNavigationGuard from "@/app/components/GSAPNavigationGuard";
import Footer from "@/app/components/Footer";
import CookieBanner from "@/app/components/CookieBanner";
import { AnalyticsProvider } from "@/lib/analytics";
import ChatWidget from "../components/Chatwidget";
import ContactSection from "../components/ContactSection";

// ── NAV_H: a navbar magassága px-ben ─────────────────────────
// Ha változtatod a navbar magasságát, csak itt kell módosítani.
// Minden hero komponens a --nav-h CSS variable-t használja.
export const NAV_H = 68;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* CSS variable globálisan elérhető minden gyerekben */}
      <style>{`:root { --nav-h: ${NAV_H}px; }`}</style>

      <GSAPNavigationGuard />
      <Navbar />
      <ChatWidget />

      <AnalyticsProvider>
        {/*
          NEM adunk paddingTop-ot a main-nek!
          A hero oldalak maguk kezelik a navbar magasságát CSS variable-lel.
          A NEM-hero oldalakhoz (pl. admin, user dashboard) saját layoutjuk van.
        */}
        <main>{children}</main>
      </AnalyticsProvider>

      <CookieBanner />
      <ContactSection />
      <Footer />
    </>
  );
}
