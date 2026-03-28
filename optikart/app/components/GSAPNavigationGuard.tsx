"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Globális GSAP NavigationGuard
 * Ezt tedd a root layout-ba (app/layout.tsx) vagy egy Provider-be.
 * Navigációkor kitörli a régi ScrollTrigger példányokat.
 */
export default function GSAPNavigationGuard() {
  const pathname = usePathname();

  useEffect(() => {
    async function cleanup() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      // Régi triggerek törlése
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.clearScrollMemory();

      // Oldal tetejére ugrás
      window.scrollTo(0, 0);

      // Kis delay után refresh – megvárja a DOM-ot
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }

    cleanup();
  }, [pathname]); // ← minden navigációnál lefut

  return null;
}
