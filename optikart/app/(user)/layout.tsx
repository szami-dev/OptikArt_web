import Sidebar from "../components/UserDashNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ marginLeft: "260px", flex: 1, padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
}
