"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    // Meghívjuk a backend API-t a megerősítéshez
    fetch(`/api/auth/verify?token=${token}`)
      .then((res) => {
        if (res.ok) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF8F4] p-6 text-center">
      <div className="max-w-md w-full bg-white p-10 border border-[#EDE8E0] shadow-sm">
        {status === "loading" && <p className="text-[#A08060] animate-pulse">Ellenőrzés folyamatban...</p>}
        
        {status === "success" && (
          <>
            <h1 className="text-2xl font-['Cormorant_Garamond'] text-[#1A1510] mb-4">Sikeres igazolás!</h1>
            <p className="text-[#7A6A58] mb-8">Az e-mail címedet megerősítettük. Most már beléphetsz a fiókodba.</p>
            <Link href="/auth/login" className="bg-[#1A1510] text-white px-8 py-3 uppercase text-[11px] tracking-widest hover:bg-[#C8A882] transition-colors">
              Bejelentkezés
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-['Cormorant_Garamond'] text-red-800 mb-4">Hiba történt</h1>
            <p className="text-[#7A6A58] mb-8">A link érvénytelen vagy már lejárt.</p>
            <Link href="/auth/register" className="text-[#C8A882] underline">Próbáld újra a regisztrációt</Link>
          </>
        )}
      </div>
    </div>
  );
}