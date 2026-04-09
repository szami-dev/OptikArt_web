"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Minden Next.js client-side navigációkor megöli az összes aktív
 * ScrollTrigger példányt és törli a scroll memóriát.
 *
 * Ezt tedd be az app/layout.tsx <body>-jába, a többi elem elé:
 *   <GSAPNavigationGuard />
 *
 * Miért kell:
 * - A GSAP pin: true ScrollTrigger pin-spacer div-et injektál a DOM-ba
 * - Next.js client nav esetén ez a div megmarad, és a következő
 *   mountolásnál a ScrollTrigger hibás pozíciókkal számol
 * - ctx.revert() a komponensben megöli az animációkat,
 *   de a globális ScrollTrigger registry-t nem üríti
 */
export default function GSAPNavigationGuard() {
  const pathname = usePathname();

  useEffect(() => {
    async function cleanup() {
      try {
        const { default: gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);

        // Minden aktív trigger megölése
        ScrollTrigger.getAll().forEach(t => t.kill());

        // Scroll memória törlése (ha elérhető)
        if (typeof ScrollTrigger.clearScrollMemory === "function") {
          ScrollTrigger.clearScrollMemory();
        }

        // window scroll pozíció nullázása – néha a böngésző megjegyzi
        // az előző oldal scroll pozícióját és ez összezavarja a trigger-eket
        // (ezt csak akkor engedélyezd ha a Next.js scroll restoration ki van kapcsolva)
        // window.scrollTo(0, 0);
      } catch {
        // gsap nem töltött be, nincs teendő
      }
    }

    cleanup();
  }, [pathname]); // pathname változáskor fut

  return null;
}