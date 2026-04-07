"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// ── Kis segéd komponens: form mező ────────────────────────────
function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060] mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-transparent border-0 border-b py-2.5 text-[14px] font-light text-[#1A1510] placeholder:text-[#C8B8A0]/60 focus:outline-none transition-colors ${
          error ? "border-red-300" : "border-[#EDE8E0] focus:border-[#C8A882]"
        }`}
      />
      {error && (
        <p className="mt-1.5 text-[11px] text-red-400/80 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-red-400/80 shrink-0 inline-block" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Törlés megerősítő modal ───────────────────────────────────
function DeleteModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1A1510]/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-[#FAF8F4] border border-[#EDE8E0] p-8 max-w-md w-full">
        {/* Sarokdíszek */}
        {[
          "top-3 left-3 border-t border-l",
          "top-3 right-3 border-t border-r",
          "bottom-3 left-3 border-b border-l",
          "bottom-3 right-3 border-b border-r",
        ].map((cls, i) => (
          <div
            key={i}
            className={`absolute w-4 h-4 ${cls} border-[#C8A882]/40`}
          />
        ))}

        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-px bg-red-300" />
          <span className="text-[10px] tracking-[0.22em] uppercase text-red-400/80">
            Figyelem
          </span>
        </div>

        <h3 className="font-['Cormorant_Garamond'] text-[1.8rem] font-light text-[#1A1510] leading-[1.1] mb-3">
          Biztosan törölni
          <br />
          <em className="not-italic text-red-400">szeretnéd?</em>
        </h3>

        <p className="text-[13px] font-light text-[#7A6A58] leading-[1.8] mb-8">
          Ez a művelet{" "}
          <strong className="font-normal text-[#1A1510]">
            visszafordíthatatlan
          </strong>{" "}
          — minden adatod, projekted és üzeneted véglegesen törlődik.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-[#EDE8E0] text-[#7A6A58] text-[11px] tracking-[0.15em] uppercase py-3.5 hover:border-[#C8A882] hover:text-[#1A1510] transition-all duration-200 disabled:opacity-50"
          >
            Mégsem
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-400 text-white text-[11px] tracking-[0.15em] uppercase py-3.5 hover:bg-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Törlés..." : "Igen, törlöm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sikeres mentés toast ──────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-[#1A1510] text-white px-5 py-3.5 shadow-xl">
      <div className="w-1.5 h-1.5 rounded-full bg-[#C8A882]" />
      <span className="text-[12px] tracking-[0.06em]">{message}</span>
    </div>
  );
}

// ── Fő profil oldal ───────────────────────────────────────────
export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);

  // Aktív tab
  const [tab, setTab] = useState<"profile" | "password" | "danger">("profile");

  // Profil form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {},
  );
  const [profileLoading, setProfileLoading] = useState(false);

  // Jelszó form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Törlés
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState("");

  // Session adatok betöltése
  useEffect(() => {
    if (session?.user) {
      setName((session.user as any).name || "");
      setPhone((session.user as any).phone || "");
    }
  }, [session]);

  // GSAP belépő animáció
  useEffect(() => {
    let ctx: any;
    let mounted = true;

    async function animate() {
      const { gsap } = await import("gsap");
      if (!mounted) return;

      ctx = gsap.context(() => {
        gsap.fromTo(
          ".profile-panel",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        );
        gsap.fromTo(
          ".profile-sidebar > *",
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.08,
            duration: 0.6,
            ease: "power2.out",
          },
        );
      }, rootRef);
    }

    animate();
    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  // ── Profil mentés ─────────────────────────────────────────
  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileErrors({});

    if (!name.trim()) {
      setProfileErrors({ name: "A név megadása kötelező" });
      return;
    }

    setProfileLoading(true);

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });

    const data = await res.json();
    setProfileLoading(false);

    if (!res.ok) {
      setProfileErrors({ general: data.error });
      return;
    }

    // Session frissítése hogy a névváltozás látszódjon a navbarban is
    await updateSession({ name: data.user.name });
    setToast("Adatok sikeresen mentve");
  }

  // ── Jelszó módosítás ──────────────────────────────────────
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordErrors({});

    if (!currentPassword) {
      setPasswordErrors({ currentPassword: "Add meg a jelenlegi jelszavad" });
      return;
    }
    if (!newPassword) {
      setPasswordErrors({ newPassword: "Add meg az új jelszót" });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordErrors({ newPassword: "Legalább 8 karakter legyen" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirmPassword: "A két jelszó nem egyezik" });
      return;
    }

    setPasswordLoading(true);

    const res = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    setPasswordLoading(false);

    if (!res.ok) {
      setPasswordErrors({ currentPassword: data.error });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setToast("Jelszó sikeresen módosítva");
  }

  // ── Fiók törlés ───────────────────────────────────────────
  async function handleDelete() {
    setDeleteLoading(true);

    const res = await fetch("/api/user/delete", { method: "DELETE" });

    if (res.ok) {
      await signOut({ redirect: false });
      router.push("/");
    } else {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setToast("Hiba történt a törlés során");
    }
  }

  const tabs = [
    { key: "profile", label: "Személyes adatok" },
    { key: "password", label: "Jelszó módosítása" },
    { key: "danger", label: "Fiók törlése" },
  ] as const;

  return (
    <div ref={rootRef} className="min-h-screen bg-[#FAF8F4]">
      {/* Finom háttér minta */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle, #C8A882 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-16 py-16 lg:py-24">
        {/* Oldal fejléc */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#C8A882]" />
            <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
              Fiók
            </span>
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.1] text-[#1A1510]">
            Profil
            <br />
            <em className="not-italic text-[#C8A882]">beállítások</em>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* ── Bal oldal: navigáció + info ── */}
          <div className="profile-sidebar lg:col-span-3 flex flex-col gap-1">
            {/* Avatar */}
            <div className="mb-6 flex items-center gap-4 lg:flex-col lg:items-start">
              <div className="w-14 h-14 bg-[#C8A882]/20 border border-[#C8A882]/30 flex items-center justify-center shrink-0">
                <span className="font-['Cormorant_Garamond'] text-2xl font-light text-[#C8A882]">
                  {name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
              <div>
                <p className="text-[13px] font-light text-[#1A1510]">
                  {name || "—"}
                </p>
                <p className="text-[11px] text-[#A08060]">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            {/* Tab navigáció */}
            <nav className="flex flex-row lg:flex-col gap-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`text-left px-4 py-3 text-[11px] tracking-[0.1em] uppercase transition-all duration-200 ${
                    tab === t.key
                      ? "bg-[#1A1510] text-white"
                      : t.key === "danger"
                        ? "text-red-400/70 hover:text-red-400 hover:bg-red-50"
                        : "text-[#7A6A58] hover:text-[#1A1510] hover:bg-[#EDE8E0]/50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            {/* Vissza link */}
            <div className="mt-auto pt-8 hidden lg:block">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[10px] tracking-[0.12em] uppercase text-[#A08060] hover:text-[#1A1510] transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3 h-3"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Vissza
              </button>
            </div>
          </div>

          {/* ── Jobb oldal: form panel ── */}
          <div className="profile-panel lg:col-span-9">
            <div className="bg-white border border-[#EDE8E0] p-8 lg:p-10 relative">
              {/* Sarokdíszek */}
              {[
                "top-3 left-3 border-t border-l",
                "top-3 right-3 border-t border-r",
                "bottom-3 left-3 border-b border-l",
                "bottom-3 right-3 border-b border-r",
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`absolute w-4 h-4 ${cls} border-[#C8A882]/30`}
                />
              ))}

              {/* ── TAB: Személyes adatok ── */}
              {tab === "profile" && (
                <form
                  onSubmit={handleProfileSave}
                  className="flex flex-col gap-7"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-6 h-px bg-[#C8A882]" />
                      <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                        Személyes adatok
                      </span>
                    </div>
                    <p className="text-[13px] font-light text-[#7A6A58] leading-relaxed">
                      A neved és telefonszámod módosíthatod itt. Email cím nem
                      változtatható.
                    </p>
                  </div>

                  {/* Email – readonly */}
                  <div>
                    <label className="block text-[10px] tracking-[0.15em] uppercase text-[#A08060] mb-2">
                      Email cím
                    </label>
                    <div className="flex items-center gap-3 border-b border-[#EDE8E0] py-2.5">
                      <input
                        type="email"
                        value={session?.user?.email || ""}
                        disabled
                        className="flex-1 bg-transparent text-[14px] font-light text-[#A08060] cursor-not-allowed outline-none"
                      />
                      <span className="text-[9px] tracking-[0.1em] uppercase text-[#C8A882] border border-[#C8A882]/30 px-2 py-0.5 shrink-0">
                        Nem módosítható
                      </span>
                    </div>
                  </div>

                  <Field
                    label="Teljes név"
                    name="name"
                    value={name}
                    onChange={setName}
                    placeholder="Szabó Máté"
                    error={profileErrors.name}
                  />

                  <Field
                    label="Telefonszám"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    placeholder="+36 30 123 4567"
                  />

                  {profileErrors.general && (
                    <p className="text-[12px] text-red-400/80 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-red-400/80 shrink-0 inline-block" />
                      {profileErrors.general}
                    </p>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="bg-[#1A1510] text-white text-[11px] tracking-[0.18em] uppercase py-4 px-8 hover:bg-[#C8A882] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {profileLoading ? "Mentés..." : "Módosítások mentése"}
                    </button>
                  </div>
                </form>
              )}

              {/* ── TAB: Jelszó ── */}
              {tab === "password" && (
                <form
                  onSubmit={handlePasswordChange}
                  className="flex flex-col gap-7"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-6 h-px bg-[#C8A882]" />
                      <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                        Jelszó módosítása
                      </span>
                    </div>
                    <p className="text-[13px] font-light text-[#7A6A58] leading-relaxed">
                      Az új jelszó legalább 8 karakterből álljon.
                    </p>
                  </div>

                  <Field
                    label="Jelenlegi jelszó"
                    name="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    placeholder="••••••••"
                    error={passwordErrors.currentPassword}
                  />

                  <Field
                    label="Új jelszó"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="••••••••"
                    error={passwordErrors.newPassword}
                  />

                  <Field
                    label="Új jelszó megerősítése"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="••••••••"
                    error={passwordErrors.confirmPassword}
                  />

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="bg-[#1A1510] text-white text-[11px] tracking-[0.18em] uppercase py-4 px-8 hover:bg-[#C8A882] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? "Mentés..." : "Jelszó módosítása"}
                    </button>
                  </div>
                </form>
              )}

              {/* ── TAB: Fiók törlése ── */}
              {tab === "danger" && (
                <div className="flex flex-col gap-7">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-6 h-px bg-red-300" />
                      <span className="text-[10px] tracking-[0.22em] uppercase text-red-400/80">
                        Veszélyes zóna
                      </span>
                    </div>
                    <p className="text-[13px] font-light text-[#7A6A58] leading-relaxed">
                      A fiókod végleges törlése visszafordíthatatlan művelet.
                    </p>
                  </div>

                  {/* Figyelmeztetés doboz */}
                  <div className="border border-red-200 bg-red-50/50 p-5">
                    <h3 className="text-[12px] tracking-[0.08em] uppercase text-red-400 mb-3 font-normal">
                      Mi törlődik?
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {[
                        "Személyes adataid (név, telefonszám)",
                        "Minden projekthez kapcsolódó adatod",
                        "Összes üzeneted",
                        "Bejelentkezési munkamenetek",
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2.5 text-[13px] font-light text-[#7A6A58]"
                        >
                          <div className="w-1 h-1 rounded-full bg-red-300 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="border border-red-300 text-red-400 text-[11px] tracking-[0.18em] uppercase py-4 px-8 hover:bg-red-400 hover:text-white transition-all duration-300"
                    >
                      Fiók végleges törlése
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Törlés modal */}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleteLoading}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}
