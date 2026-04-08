import Navbar from "../components/Nav";
import GSAPNavigationGuard from "@/app/components/GSAPNavigationGuard";
import Footer from "@/app/components/Footer";
import CookieBanner from "@/app/components/Cookies";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
     <GSAPNavigationGuard />
      <Navbar />
      <main style={{ paddingTop: "68px" }}>{children}</main>
      <Footer />
      <CookieBanner />
    </>
  );
}
