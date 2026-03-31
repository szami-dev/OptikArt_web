import SidebarDark from "../components/AdminDashNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SidebarDark />
      <main style={{ marginLeft: "260px", flex: 1, padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
}
