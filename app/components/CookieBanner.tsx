"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Info } from "lucide-react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("optikart-cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem("optikart-cookie-consent", accepted ? "accepted" : "declined");
    setShowBanner(false);

    if (accepted) {
      // Az AnalyticsProvider figyeli ezt és elindítja az első pageview-t
      window.dispatchEvent(new Event("optikart-consent-change"));
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-[380px] w-[calc(100%-2rem)] animate-fade-in-up">
      <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-[-10px_10px_30px_rgba(0,0,0,0.08)] border border-[#eeeeee]">

        {/* Fejléc */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#A08060]/10 rounded-full text-[#A08060]">
              <Info size={18} strokeWidth={1.5} />
            </div>
            <h3 className="text-[14px] font-semibold text-[#1a1a1a] uppercase tracking-wider">
              Süti Tájékoztató
            </h3>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-[#aaaaaa] hover:text-[#e74c3c] transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Szöveg */}
        <p className="text-[13px] text-[#666666] leading-relaxed mb-6">
          Az OptikArt sütiket használ a weboldal alapvető működéséhez, a forgalom
          elemzéséhez és marketing célokra. Ezzel biztosítjuk a legjobb felhasználói
          élményt. Részletek az{" "}
          <Link href="/adatvedelem" className="text-[#A08060] underline hover:text-[#8e6f52]">
            Adatkezelési tájékoztatóban
          </Link>.
        </p>

        {/* Gombok */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleConsent(false)}
            className="px-5 py-2.5 border border-[#dddddd] text-[#555555] text-[11px] font-semibold uppercase tracking-widest rounded-lg hover:bg-[#f9f9f9] transition-colors"
          >
            Elutasítom
          </button>
          <button
            onClick={() => handleConsent(true)}
            className="px-5 py-2.5 bg-[#1a1a1a] text-white text-[11px] font-semibold uppercase tracking-widest rounded-lg hover:bg-[#333333] transition-colors shadow-md"
          >
            Elfogadom
          </button>
        </div>
      </div>
    </div>
  );
}
