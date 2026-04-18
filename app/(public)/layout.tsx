// app/(public)/layout.tsx

import Navbar              from "../components/Nav";
import GSAPNavigationGuard from "@/app/components/GSAPNavigationGuard";
import Footer              from "@/app/components/Footer";
import CookieBanner        from "@/app/components/CookieBanner";
import { AnalyticsProvider } from "@/lib/analytics";
import ChatWidget          from "../components/Chatwidget";
import ContactSection      from "../components/ContactSection";
import { JSONLD }          from "@/lib/seo";

export const NAV_H = 68;

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* CSS variable globálisan elérhető minden gyerekben */}
      <style>{`:root { --nav-h: ${NAV_H}px; }`}</style>

      {/* JSON-LD – LocalBusiness + WebSite minden publikus oldalon megjelenik */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD.localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD.website) }}
      />

      <GSAPNavigationGuard />
      <Navbar />
      <ChatWidget />

      <AnalyticsProvider>
        <main>{children}</main>
      </AnalyticsProvider>

      <CookieBanner />
      <ContactSection />
      <Footer />
    </>
  );
}