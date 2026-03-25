import { SessionProvider } from "next-auth/react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OptikArt",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
