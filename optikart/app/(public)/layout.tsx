import Navbar from "../components/Nav";
import GSAPNavigationGuard from "@/app/components/GSAPNavigationGuard";
import Footer from "@/app/components/Footer";
import CookieBanner from "@/app/components/CookieBanner";
import { AnalyticsProvider } from "@/lib/analytics";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
     <GSAPNavigationGuard />
     <Navbar />
      <AnalyticsProvider>
      <main style={{ paddingTop: "68px" }}>{children}</main>
      </AnalyticsProvider>
      <Footer />
      <CookieBanner />
    </>
  );
}
