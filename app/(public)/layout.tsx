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
      {/* Bebas Neue + Space Grotesk a /concert oldalhoz — ugyanúgy szó szerinti
          családnévvel, mint ahogy a Cormorant Garamond is be van töltve az
          /event oldalhoz. latin-ext kell az ékezetes karakterekhez (ő, ű). */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@300;400;500;700&subset=latin-ext&display=swap"
      />

      {/* CSS változók globálisan elérhetők minden gyerekben */}
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