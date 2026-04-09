"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";

// ── Consent ellenőrzés ────────────────────────────────────────
function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("optikart-cookie-consent") === "accepted";
}

// ── Session ID generálás / lekérés ────────────────────────────
function getSessionId(): string {
  const key = "optikart-session-id";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

// ── Alap track függvény ───────────────────────────────────────
async function track(
  type: string,
  page?: string,
  meta?: Record<string, unknown>
) {
  if (!hasConsent()) return;
  try {
    const sessionId   = getSessionId();
    const referrer    = document.referrer || undefined;
    const url         = new URL(window.location.href);
    const utmSource   = url.searchParams.get("utm_source")   ?? undefined;
    const utmMedium   = url.searchParams.get("utm_medium")   ?? undefined;
    const utmCampaign = url.searchParams.get("utm_campaign") ?? undefined;

    await fetch("/api/analytics/track", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        type,
        page:        page ?? window.location.pathname,
        meta:        meta ?? undefined,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
      }),
    });
  } catch {
    // Csendesen kezeljük, ne rontsa el az oldalt
  }
}

// ── Context típus ─────────────────────────────────────────────
type AnalyticsContextType = {
  trackClick:          (label: string, meta?: Record<string, unknown>) => void;
  trackWizardStep:     (step: number,  meta?: Record<string, unknown>) => void;
  trackWizardExit:     (step: number,  meta?: Record<string, unknown>) => void;
  trackWizardComplete: (meta?: Record<string, unknown>) => void;
  trackProjectCreated: (projectId: number, meta?: Record<string, unknown>) => void;
  trackGalleryView:    (galleryId: number) => void;
  trackEvent:          (type: string, meta?: Record<string, unknown>) => void;
};

// ── Context létrehozása ───────────────────────────────────────
const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

// ── Provider ─────────────────────────────────────────────────
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname     = usePathname();
  const lastPathRef  = useRef<string | null>(null);
  const sessionStart = useRef<number>(Date.now());

  // Pageview tracking útvonalváltáskor
  useEffect(() => {
    if (!hasConsent()) return;
    if (pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;
    track("pageview", pathname);
  }, [pathname]);

  // Session duration – beforeunload Beacon API-val
  useEffect(() => {
    const handleUnload = () => {
      if (!hasConsent()) return;
      const duration  = Math.round((Date.now() - sessionStart.current) / 1000);
      const sessionId = getSessionId();
      navigator.sendBeacon(
        "/api/analytics/track",
        JSON.stringify({ sessionId, type: "session_end", meta: { duration } })
      );
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // Consent változás figyelése (CookieBanner "Elfogadom" gomb)
  useEffect(() => {
    const handler = () => {
      if (hasConsent() && !lastPathRef.current) {
        lastPathRef.current = pathname;
        track("pageview", pathname);
      }
    };
    window.addEventListener("optikart-consent-change", handler);
    return () => window.removeEventListener("optikart-consent-change", handler);
  }, [pathname]);

  // ── Exportált tracking függvények ─────────────────────────
  const trackClick = useCallback(
    (label: string, meta?: Record<string, unknown>) =>
      track("click", window.location.pathname, { label, ...meta }),
    []
  );

  const trackWizardStep = useCallback(
    (step: number, meta?: Record<string, unknown>) =>
      track("wizard_step", "/contact", { step, ...meta }),
    []
  );

  const trackWizardExit = useCallback(
    (step: number, meta?: Record<string, unknown>) =>
      track("wizard_exit", "/contact", { step, ...meta }),
    []
  );

  const trackWizardComplete = useCallback(
    (meta?: Record<string, unknown>) =>
      track("wizard_complete", "/contact", meta),
    []
  );

  const trackProjectCreated = useCallback(
    (projectId: number, meta?: Record<string, unknown>) =>
      track("project_created", window.location.pathname, { projectId, ...meta }),
    []
  );

  const trackGalleryView = useCallback(
    (galleryId: number) =>
      track("gallery_view", window.location.pathname, { galleryId }),
    []
  );

  const trackEvent = useCallback(
    (type: string, meta?: Record<string, unknown>) =>
      track(type, window.location.pathname, meta),
    []
  );

  return (
    <AnalyticsContext.Provider
      value={{
        trackClick,
        trackWizardStep,
        trackWizardExit,
        trackWizardComplete,
        trackProjectCreated,
        trackGalleryView,
        trackEvent,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────
export function useAnalytics(): AnalyticsContextType {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error("useAnalytics: AnalyticsProvider hiányzik a layout-ban");
  return ctx;
}
