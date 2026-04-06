"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Adatok ───────────────────────────────────────────────────
const PROJECT_TYPES = [
  {
    id: 1, name: "Esküvő",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-5 h-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    desc: "Fotó, videó vagy mindkettő a nagy napra",
  },
  {
    id: 2, name: "Portré",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    desc: "Egyéni, páros vagy családi",
  },
  {
    id: 3, name: "Rendezvény",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    desc: "Céges esemény, konferencia, party",
  },
  {
    id: 4, name: "Marketing",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-5 h-5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
    desc: "Social media, reels, brand fotó",
  },
  {
    id: 5, name: "Drón",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-5 h-5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    desc: "Légifotó és videó, engedéllyel",
  },
  {
    id: 6, name: "Egyéb",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    desc: "Egyedi igény, írd le részletesen",
  },
];

const PACKAGES: Record<number, Array<{
  id: number; name: string; price: string; duration: string; desc: string; bullets: string[];
}>> = {
  1: [
    { id: 11, name: "Alap", price: "150 000 Ft", duration: "4 óra", desc: "Ceremónia + pár kreatív fotó", bullets: ["400+ kép", "Online galéria 30 napig", "2 hét átfutás"] },
    { id: 12, name: "Standard", price: "280 000 Ft", duration: "8 óra", desc: "Teljes nap fotódokumentáció", bullets: ["800+ kép", "Highlight videó", "Online galéria 60 napig"] },
    { id: 13, name: "Prémium", price: "450 000 Ft", duration: "Teljes nap", desc: "Fotó + Videó + Drón", bullets: ["1200+ kép", "Film + highlight", "Drón felvételek", "Nyomtatott album"] },
  ],
  2: [
    { id: 21, name: "Mini", price: "25 000 Ft", duration: "45 perc", desc: "Egyéni vagy páros fotózás", bullets: ["30+ kép", "Online galéria 30 napig", "1 hét átfutás"] },
    { id: 22, name: "Standard", price: "45 000 Ft", duration: "90 perc", desc: "Részletesebb, több helyszín", bullets: ["80+ kép", "Retusálás", "5 nap átfutás"] },
    { id: 23, name: "Prémium", price: "75 000 Ft", duration: "3 óra", desc: "Brand / modell portfólió", bullets: ["150+ kép", "Professzionális retusálás", "Brand kit"] },
  ],
  3: [
    { id: 31, name: "Alap", price: "80 000 Ft", duration: "3 óra", desc: "Esemény fotódokumentáció", bullets: ["300+ kép", "Online galéria", "3 nap átfutás"] },
    { id: 32, name: "Standard", price: "150 000 Ft", duration: "6 óra", desc: "Fotó + összefoglaló videó", bullets: ["600+ kép", "Összefoglaló videó", "Online galéria 60 napig"] },
    { id: 33, name: "Prémium", price: "280 000 Ft", duration: "Egész nap", desc: "Teljes dokumentáció + drón", bullets: ["1000+ kép", "Film + highlight", "Drón felvételek"] },
  ],
  4: [
    { id: 41, name: "Alap", price: "60 000 Ft/hó", duration: "1 forgatási nap", desc: "Havi alap tartalom", bullets: ["20 poszt anyag", "5 reel videó", "Szerkesztés + caption"] },
    { id: 42, name: "Growth", price: "120 000 Ft/hó", duration: "2 forgatási nap", desc: "Aktív jelenlét minden platformon", bullets: ["40 poszt anyag", "12 reel", "Ütemezés + analitika"] },
    { id: 43, name: "Pro", price: "220 000 Ft/hó", duration: "4 forgatási nap", desc: "Teljes tartalom ügynökség", bullets: ["80+ anyag/hó", "20+ reel/hó", "Brand film", "Havi riport"] },
  ],
  5: [
    { id: 51, name: "Alap", price: "50 000 Ft", duration: "2 óra", desc: "Légifotók alap szerkesztéssel", bullets: ["50+ kép", "Online galéria", "2 nap átfutás"] },
    { id: 52, name: "Standard", price: "90 000 Ft", duration: "4 óra", desc: "Fotó + videó kombináció", bullets: ["100+ kép", "2-3 perces videó", "4K"] },
    { id: 53, name: "Prémium", price: "160 000 Ft", duration: "Egész nap", desc: "Teljes projekttámogatás", bullets: ["Korlátlan felvétel", "Szerkesztett videó", "Helyszínbejárás"] },
  ],
  6: [
    { id: 61, name: "Egyedi árajánlat", price: "Egyedi", duration: "Egyedi", desc: "Részletezd az igényeidet, 24 órán belül visszajelzünk", bullets: ["Személyre szabott csomag", "Rugalmas időbeosztás", "Ingyenes konzultáció"] },
  ],
};

type Step = 1 | 2 | 3 | 4;
interface FormData {
  typeId: number | null; typeName: string;
  packageId: number | null; packageName: string; packagePrice: string;
  projectName: string; description: string; date: string; phone: string;
}

// ── Lépés jelző (vízszintes, kompakt) ────────────────────────
function StepDots({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map(n => (
        <div key={n} className={`transition-all duration-300 ${
          n === current ? "w-6 h-1.5 bg-[#C8A882]" :
          n < current  ? "w-1.5 h-1.5 rounded-full bg-[#C8A882]/40" :
                         "w-1.5 h-1.5 rounded-full bg-[#EDE8E0]"
        }`} />
      ))}
      <span className="text-[10px] tracking-[0.1em] text-[#A08060] ml-1">{current} / {total}</span>
    </div>
  );
}

// ── Input mező ────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] tracking-[0.15em] uppercase text-[#A08060]">
        {label}{required && <span className="text-[#C8A882] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white border border-[#EDE8E0] text-[13px] text-[#1A1510] placeholder:text-[#C8B8A0]/60 focus:outline-none focus:border-[#C8A882] px-3 py-2.5 transition-colors";

// ── Fő komponens ─────────────────────────────────────────────
export default function ContactPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormData>({
    typeId: null, typeName: "",
    packageId: null, packageName: "", packagePrice: "",
    projectName: "", description: "", date: "", phone: "",
  });

  const packages = form.typeId ? PACKAGES[form.typeId] ?? [] : [];

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.projectName,
          description: form.description,
          typeId: form.typeId,
          packageId: form.packageId,
          date: form.date || null,
          phone: form.phone || null,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Hiba"); }
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message ?? "Szerverhiba");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success képernyő ─────────────────────────────────────
  if (submitted) {
    return (
      <div className="fixed inset-0 bg-[#FAF8F4] flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 border border-[#C8A882]/40 flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.5" className="w-6 h-6"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-5 h-px bg-[#C8A882]/40" />
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">Köszönjük</span>
            <div className="w-5 h-px bg-[#C8A882]/40" />
          </div>
          <h2 className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#1A1510] mb-3">Igénylés elküldve!</h2>
          <p className="text-[13px] text-[#7A6A58] leading-relaxed mb-8">
            Hamarosan felvesszük veled a kapcsolatot.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="px-7 py-3 border border-[#EDE8E0] text-[11px] tracking-[0.12em] uppercase text-[#7A6A58] hover:border-[#C8A882]/40 transition-all text-center">
              Főoldal
            </Link>
            <Link href="/user/profile" className="px-7 py-3 bg-[#1A1510] text-[11px] tracking-[0.12em] uppercase text-white hover:bg-[#C8A882] transition-all text-center">
              Projektem →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    // fixed inset-0 → nincs scroll, mindig viewport méretű
    <div className="fixed inset-0 bg-[#FAF8F4] flex flex-col overflow-hidden">

      {/* ── Fejléc sáv ── */}
      <div className="shrink-0 flex items-center justify-between px-5 sm:px-8 lg:px-12 py-4 border-b border-[#EDE8E0] bg-white">
        <Link href="/" className="flex items-center gap-2 text-[#1A1510] hover:text-[#C8A882] transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span className="text-[11px] tracking-[0.1em] uppercase hidden sm:block">Vissza</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-5 h-px bg-[#C8A882]" />
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">Projekt igénylés</span>
        </div>

        <StepDots current={step} total={4} />
      </div>

      {/* ── Fő tartalom – flex-1, overflow-hidden ── */}
      <div className="flex-1 overflow-hidden flex">

        {/* ── BAL oldali dekor panel – csak lg+ ── */}
        <div className="hidden lg:flex w-[320px] xl:w-[380px] shrink-0 flex-col justify-between bg-[#F5EFE6] border-r border-[#EDE8E0] px-10 py-10">
          <div>
            <h1 className="font-['Cormorant_Garamond'] text-[2.8rem] xl:text-[3.2rem] font-light text-[#1A1510] leading-[1] mb-6">
              Kezdjük el<br />a közös<br /><em className="not-italic text-[#C8A882]">munkát</em>
            </h1>
            <p className="text-[13px] font-light text-[#7A6A58] leading-[1.9] mb-8">
              Négy lépésben elindíthatod a projektedet. Visszajelzünk 24 órán belül.
            </p>

            {/* Lépés lista */}
            <div className="flex flex-col gap-3">
              {[
                { n: 1, label: "Projekt típusa" },
                { n: 2, label: "Csomag választás" },
                { n: 3, label: "Részletek" },
                { n: 4, label: "Összefoglaló" },
              ].map(s => (
                <div key={s.n} className={`flex items-center gap-3 transition-all duration-300 ${step === s.n ? "opacity-100" : step > s.n ? "opacity-50" : "opacity-30"}`}>
                  <div className={`w-6 h-6 flex items-center justify-center border text-[10px] shrink-0 transition-all duration-300 ${
                    step > s.n ? "bg-[#C8A882] border-[#C8A882] text-white" :
                    step === s.n ? "border-[#C8A882] text-[#C8A882]" :
                    "border-[#DDD5C8] text-[#A08060]"
                  }`}>
                    {step > s.n
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                      : s.n
                    }
                  </div>
                  <span className={`text-[12px] ${step === s.n ? "text-[#1A1510] font-medium" : "text-[#7A6A58]"}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bejelentkezett felhasználó */}
          {session?.user && (
            <div className="flex items-center gap-3 pt-6 border-t border-[#EDE8E0]">
              <div className="w-8 h-8 bg-[#C8A882]/20 border border-[#C8A882]/30 flex items-center justify-center font-['Cormorant_Garamond'] text-[14px] text-[#C8A882]">
                {session.user.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <div>
                <div className="text-[12px] text-[#1A1510]">{session.user.name}</div>
                <div className="text-[10px] text-[#A08060]">{session.user.email}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── JOBB: Wizard tartalom ── */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {/* Step content – overflow-y-auto ha szükséges kis képernyőn */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-xl mx-auto px-5 sm:px-8 py-6 sm:py-10 h-full flex flex-col">

              {/* ── STEP 1: Típus ── */}
              {step === 1 && (
                <div className="flex flex-col flex-1 gap-6">
                  <div>
                    <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2.2rem] font-light text-[#1A1510] leading-tight mb-1">
                      Milyen projektre van szükséged?
                    </h2>
                    <p className="text-[12px] text-[#A08060]">Válaszd ki a kategóriát</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1 content-start">
                    {PROJECT_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => {
                          setForm(f => ({ ...f, typeId: type.id, typeName: type.name, packageId: null, packageName: "", packagePrice: "" }));
                          setStep(2);
                        }}
                        className="group flex flex-col gap-3 p-4 sm:p-5 border border-[#EDE8E0] bg-white hover:border-[#C8A882]/50 hover:bg-[#FAF8F4] transition-all duration-200 text-left"
                      >
                        <span className="text-[#C8A882]/70 group-hover:text-[#C8A882] transition-colors">{type.icon}</span>
                        <div>
                          <div className="text-[13px] text-[#1A1510] font-medium mb-0.5">{type.name}</div>
                          <div className="text-[11px] text-[#A08060] leading-snug">{type.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 2: Csomag ── */}
              {step === 2 && (
                <div className="flex flex-col flex-1 gap-6">
                  <div>
                    <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2.2rem] font-light text-[#1A1510] leading-tight mb-1">
                      {form.typeName} — csomagok
                    </h2>
                    <p className="text-[12px] text-[#A08060]">Válaszd ki az igényeidhez illő csomagot</p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {packages.map(pkg => (
                      <button
                        key={pkg.id}
                        onClick={() => {
                          setForm(f => ({ ...f, packageId: pkg.id, packageName: pkg.name, packagePrice: pkg.price }));
                          setStep(3);
                        }}
                        className="group flex items-start gap-4 p-4 sm:p-5 border border-[#EDE8E0] bg-white hover:border-[#C8A882]/50 hover:bg-[#FAF8F4] transition-all duration-200 text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <span className="text-[13px] text-[#1A1510] font-medium">{pkg.name}</span>
                              <span className="text-[11px] text-[#A08060] ml-2">{pkg.duration}</span>
                            </div>
                            <span className="font-['Cormorant_Garamond'] text-[1.1rem] font-light text-[#C8A882] shrink-0">{pkg.price}</span>
                          </div>
                          <p className="text-[11px] text-[#7A6A58] mb-2">{pkg.desc}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {pkg.bullets.map((b, i) => (
                              <span key={i} className="flex items-center gap-1 text-[10px] text-[#A08060]">
                                <span className="w-1 h-1 rounded-full bg-[#C8A882]/50 shrink-0" />
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#C8A882]/30 group-hover:text-[#C8A882] shrink-0 mt-0.5 transition-colors">
                          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </button>
                    ))}
                  </div>

                  <button onClick={() => setStep(1)} className="text-[11px] tracking-[0.1em] uppercase text-[#A08060] hover:text-[#1A1510] transition-colors text-left">
                    ← Vissza
                  </button>
                </div>
              )}

              {/* ── STEP 3: Részletek ── */}
              {step === 3 && (
                <div className="flex flex-col flex-1 gap-6">
                  <div>
                    <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2.2rem] font-light text-[#1A1510] leading-tight mb-1">
                      Projekt részletei
                    </h2>
                    <p className="text-[12px] text-[#A08060]">Segíts megismernünk az elképzeléseidet</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Projekt neve" required>
                        <input type="text" value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
                          placeholder="Pl. Kovács Esküvő 2025" className={inputCls} />
                      </Field>
                      <Field label="Tervezett időpont">
                        <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                          className={inputCls} style={{ colorScheme: "light" }} />
                      </Field>
                    </div>

                    <Field label="Telefonszám">
                      <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+36 30 123 4567" className={inputCls} />
                    </Field>

                    <Field label="Leírás, elképzelések" required>
                      <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Mesélj a projektről — helyszín, hangulat, különleges kérések..."
                        className={`${inputCls} resize-none`} />
                    </Field>
                  </div>

                  {error && <p className="text-[11px] text-red-500">{error}</p>}

                  <div className="flex gap-3 mt-auto">
                    <button onClick={() => setStep(2)} className="px-5 py-3 border border-[#EDE8E0] text-[11px] tracking-[0.1em] uppercase text-[#A08060] hover:text-[#1A1510] hover:border-[#C8A882]/40 transition-all">
                      ← Vissza
                    </button>
                    <button
                      onClick={() => {
                        if (!form.projectName.trim() || !form.description.trim()) {
                          setError("A projekt neve és leírása kötelező.");
                          return;
                        }
                        setError("");
                        setStep(4);
                      }}
                      className="flex-1 py-3 bg-[#1A1510] text-[11px] tracking-[0.14em] uppercase text-white hover:bg-[#C8A882] transition-all duration-300"
                    >
                      Összefoglaló →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Összefoglaló ── */}
              {step === 4 && (
                <div className="flex flex-col flex-1 gap-6">
                  <div>
                    <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] sm:text-[2.2rem] font-light text-[#1A1510] leading-tight mb-1">
                      Összefoglaló
                    </h2>
                    <p className="text-[12px] text-[#A08060]">Ellenőrizd az adatokat</p>
                  </div>

                  {/* Összefoglaló kártyák */}
                  <div className="flex flex-col gap-1.5">
                    {/* Típus + csomag – kiemelt */}
                    <div className="bg-[#F5EFE6] border border-[#EDE8E0] p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[9px] tracking-[0.14em] uppercase text-[#A08060] mb-1">Típus & Csomag</div>
                        <div className="text-[14px] text-[#1A1510] font-medium">{form.typeName} — {form.packageName}</div>
                      </div>
                      <div className="font-['Cormorant_Garamond'] text-[1.3rem] font-light text-[#C8A882] shrink-0">{form.packagePrice}</div>
                    </div>

                    {[
                      { label: "Projekt neve", value: form.projectName },
                      { label: "Időpont", value: form.date ? new Date(form.date).toLocaleDateString("hu-HU") : "Nincs megadva" },
                      { label: "Telefon", value: form.phone || "Nincs megadva" },
                      { label: "Email", value: session?.user?.email ?? "—" },
                    ].map(row => (
                      <div key={row.label} className="bg-white border border-[#EDE8E0] px-4 py-3 flex items-center justify-between gap-4">
                        <span className="text-[10px] tracking-[0.12em] uppercase text-[#A08060]">{row.label}</span>
                        <span className="text-[13px] text-[#1A1510] text-right truncate">{row.value}</span>
                      </div>
                    ))}

                    <div className="bg-white border border-[#EDE8E0] px-4 py-3">
                      <div className="text-[10px] tracking-[0.12em] uppercase text-[#A08060] mb-1.5">Leírás</div>
                      <div className="text-[12px] text-[#7A6A58] leading-relaxed line-clamp-3">{form.description}</div>
                    </div>
                  </div>

                  {error && <p className="text-[11px] text-red-500">{error}</p>}

                  <div className="flex gap-3 mt-auto">
                    <button onClick={() => setStep(3)} className="px-5 py-3 border border-[#EDE8E0] text-[11px] tracking-[0.1em] uppercase text-[#A08060] hover:text-[#1A1510] hover:border-[#C8A882]/40 transition-all">
                      ← Módosítás
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 py-3 bg-[#1A1510] text-[11px] tracking-[0.14em] uppercase text-white hover:bg-[#C8A882] transition-all duration-300 disabled:opacity-50"
                    >
                      {submitting ? "Küldés..." : "Igénylés elküldése →"}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── Mobil lépés jelző (alul) ── */}
          <div className="lg:hidden shrink-0 border-t border-[#EDE8E0] bg-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className={`transition-all duration-300 ${
                  n === step ? "w-5 h-1.5 bg-[#C8A882]" :
                  n < step   ? "w-1.5 h-1.5 rounded-full bg-[#C8A882]/40" :
                               "w-1.5 h-1.5 rounded-full bg-[#EDE8E0]"
                }`} />
              ))}
            </div>
            <div className="text-[10px] text-[#A08060]">
              {["", "Típus kiválasztása", "Csomag kiválasztása", "Részletek megadása", "Ellenőrzés és küldés"][step]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}