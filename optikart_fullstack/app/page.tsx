export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
      <h1 className="text-3xl font-semibold">Fotós foglalási dashboard – skeleton</h1>
      <p className="text-zinc-600">
        Minimal Next.js fullstack példa: App Router + NextAuth (Credentials/JWT) + Prisma + PostgreSQL.
      </p>

      <div className="flex flex-wrap gap-3">
        <a className="rounded-md bg-black px-4 py-2 text-white" href="/login">
          Bejelentkezés
        </a>
        <a className="rounded-md border px-4 py-2" href="/dashboard">
          Dashboard
        </a>
      </div>

      <div className="text-sm text-zinc-600">
        A <code>/dashboard</code> oldal szerver komponensből közvetlenül olvas DB-ből,
        a <code>BookingForm</code> pedig kliensből hívja a <code>/api/bookings</code> route-ot.
      </div>
    </div>
  );
}
