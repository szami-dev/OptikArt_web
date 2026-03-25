"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Hibás email vagy jelszó");
    } else {
      router.push("/");
    }
  }

  return (
    <div>
      <h1>Bejelentkezés</h1>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Jelszó" required />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Bejelentkezés</button>
      </form>
      <p>
        Nincs még fiókod? <a href="/auth/register">Regisztrálj itt</a>
      </p>
    </div>
  );
}