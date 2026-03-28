import Navbar from "../components/Nav";
import GSAPNavigationGuard from "@/app/components/GSAPNavigationGuard";

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
    </>
  );
}
