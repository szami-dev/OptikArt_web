// Dashboard oldal – ez egy *Server Component* (nincs "use client").
// Itt közvetlenül elérjük a DB-t Prisma-val, és szerver oldalon kérjük le a session-t.

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/BookingForm";

export default async function DashboardPage() {
  // Szerveren: session lekérése cookie alapján (JWT stratégia esetén is működik).
  const session = await getServerSession(authOptions);

  // Követelmény: nem autentikált user -> /login
  if (!session?.user?.id) redirect("/login");

  // Szerveren: közvetlen DB hozzáférés (nincs API hívás).
  const [bookings, services] = await Promise.all([
    prisma.booking.findMany({
      where: { clientId: session.user.id },
      orderBy: { startTime: "desc" },
      include: {
        service: { include: { category: true } },
      },
    }),
    prisma.service.findMany({
      orderBy: { name: "asc" },
      include: { category: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="text-sm text-zinc-600">
          Bejelentkezve: <span className="font-medium">{session.user.email}</span>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Új foglalás</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Kliens → <code>/api/bookings</code> → DB (Prisma) flow demonstráció.
        </p>
        <div className="mt-4 rounded-lg border p-4">
          <BookingForm
            services={services.map((s) => ({
              id: s.id,
              name: s.name,
              categoryName: s.category.name,
              price: s.price,
            }))}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Foglalásaim</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Ezeket *szerveren* kérjük le Prisma-val, a session user id alapján.
        </p>

        <ul className="mt-4 space-y-3">
          {bookings.length === 0 ? (
            <li className="rounded-lg border p-4 text-sm text-zinc-600">
              Még nincs foglalásod.
            </li>
          ) : (
            bookings.map((b) => (
              <li key={b.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="font-medium">
                    {b.service.category.name} / {b.service.name}
                  </div>
                  <div className="text-sm text-zinc-600">{b.status}</div>
                </div>
                <div className="mt-2 text-sm text-zinc-700">
                  {new Date(b.startTime).toLocaleString()} →{" "}
                  {new Date(b.endTime).toLocaleString()}
                </div>
                {b.notes ? (
                  <div className="mt-2 text-sm text-zinc-600">Megjegyzés: {b.notes}</div>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

