"use client";

// BookingForm – *Client Component*.
// Böngészőben fut, és egy API route-on keresztül ír a DB-be:
//   client (fetch) -> /api/bookings (server) -> Prisma -> PostgreSQL

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type ServiceOption = {
  id: string;
  name: string;
  categoryName: string;
  price: number;
};

export default function BookingForm({ services }: { services: ServiceOption[] }) {
  const router = useRouter();

  const defaultServiceId = services[0]?.id ?? "";
  const [serviceId, setServiceId] = useState(defaultServiceId);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceLabel = useMemo(() => {
    const s = services.find((x) => x.id === serviceId);
    return s ? `${s.categoryName} / ${s.name}` : "";
  }, [services, serviceId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, startTime, endTime, notes }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as any;
        throw new Error(data?.error ?? "Hiba történt a mentés közben");
      }

      // Server Component (dashboard) frissítése – újra lefut a szerver oldali lekérdezés.
      router.refresh();

      // UI reset
      setNotes("");
    } catch (err: any) {
      setError(err?.message ?? "Ismeretlen hiba");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {services.length === 0 ? (
        <div className="text-sm text-zinc-600">
          Nincs szolgáltatás a DB-ben. Hozz létre legalább egy `Category` + `Service` rekordot.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <label className="block">
        <span className="text-sm font-medium">Szolgáltatás</span>
        <select
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          disabled={services.length === 0}
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.categoryName} / {s.name} – {s.price}
            </option>
          ))}
        </select>
        <div className="mt-1 text-xs text-zinc-500">Kiválasztva: {serviceLabel}</div>
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Kezdés</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Befejezés</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Megjegyzés</span>
        <textarea
          className="mt-1 w-full rounded-md border px-3 py-2"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="pl. kültéri fotózás, 2 fő, stb."
        />
      </label>

      <button
        type="submit"
        disabled={isLoading || services.length === 0}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {isLoading ? "Mentés..." : "Foglalás létrehozása"}
      </button>
    </form>
  );
}

