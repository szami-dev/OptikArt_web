import Navbar from "../components/Nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "68px" }}>{children}</main>
    </>
  );
}
