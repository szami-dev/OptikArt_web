import { SessionProvider } from "next-auth/react";
import type { Metadata } from "next";
import "./globals.css";
import GSAPNavigationGuard from "@/app/components/GSAPNavigationGuard";

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
        <GSAPNavigationGuard />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
