"use client";

// Kliens komponens: itt kezeljük az űrlapot és a next-auth `signIn()` hívást.
// Fontos: itt NEM használunk `useSearchParams()`-t, így nem kell CSR bailout.

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginClient({ error }: { error?: string }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.ok) {
      router.push("/dashboard");
      return;
    }

    router.push("/login?error=CredentialsSignin");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Bejelentkezés</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Demo: Credentials provider (email + jelszó) + JWT session stratégia.
      </p>

      {error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Hibás email vagy jelszó.
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Jelszó</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {isLoading ? "Bejelentkezés..." : "Bejelentkezés"}
        </button>
      </form>

      <div className="mt-6 text-xs text-zinc-500">
        Tipp: hozz létre egy usert a DB-ben (bcrypt hash-elt jelszóval), vagy seedelj.
      </div>
    </div>
  );
}

