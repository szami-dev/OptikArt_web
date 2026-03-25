"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  function checkPasswordStrength(pw: string) {
    let strength = 0;
    if (pw.length >= 8) strength++;
    if (/[A-Z]/.test(pw)) strength++;
    if (/[0-9]/.test(pw)) strength++;
    if (/[^A-Za-z0-9]/.test(pw)) strength++;
    setPasswordStrength(strength);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const passwordConfirm = (form.elements.namedItem("passwordConfirm") as HTMLInputElement).value;

    if (password !== passwordConfirm) {
      setError("A két jelszó nem egyezik meg!");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("A jelszónak legalább 8 karakter hosszúnak kell lennie!");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push("/auth/login?registered=true");
  }

  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-400", "bg-emerald-400"];
  const strengthLabels = ["Gyenge", "Közepes", "Erős", "Nagyon erős"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        .register-root {
          font-family: 'DM Mono', monospace;
          min-height: 100vh;
          background: #020408;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          overflow: hidden;
          position: relative;
        }

        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,255,180,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,180,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .glow-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(0,255,180,0.12) 0%, transparent 70%);
          top: -100px;
          right: -100px;
          animation: orbFloat1 8s ease-in-out infinite;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(0,100,255,0.1) 0%, transparent 70%);
          bottom: -80px;
          left: -80px;
          animation: orbFloat2 10s ease-in-out infinite;
        }

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, 30px); }
        }

        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }

        .card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(0,255,180,0.15);
          border-radius: 2px;
          padding: 2.5rem;
          backdrop-filter: blur(20px);
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? 'translateY(0)' : 'translateY(20px)'};
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,255,180,0.6), transparent);
        }

        .corner {
          position: absolute;
          width: 12px;
          height: 12px;
          border-color: rgba(0,255,180,0.6);
          border-style: solid;
        }
        .corner-tl { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
        .corner-tr { top: -1px; right: -1px; border-width: 1px 1px 0 0; }
        .corner-bl { bottom: -1px; left: -1px; border-width: 0 0 1px 1px; }
        .corner-br { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0,255,180,0.7);
          margin-bottom: 1.5rem;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00ffb4;
          box-shadow: 0 0 8px #00ffb4;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .title {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 0.4rem;
        }

        .title span {
          color: #00ffb4;
        }

        .subtitle {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.05em;
          margin-bottom: 2rem;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(0,255,180,0.2), transparent);
          margin-bottom: 2rem;
        }

        .field-group {
          margin-bottom: 1.25rem;
          position: relative;
        }

        .field-label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 0.5rem;
          transition: color 0.2s;
        }

        .field-label.active {
          color: #00ffb4;
        }

        .field-label .required {
          color: #ff4d6d;
          margin-left: 2px;
        }

        .field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 12px;
          color: rgba(255,255,255,0.2);
          font-size: 14px;
          transition: color 0.2s;
          pointer-events: none;
        }

        .field-wrapper.active .field-icon {
          color: #00ffb4;
        }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 2px;
          padding: 10px 12px 10px 36px;
          color: #ffffff;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
          caret-color: #00ffb4;
        }

        .field-input::placeholder {
          color: rgba(255,255,255,0.15);
        }

        .field-input:focus {
          border-color: rgba(0,255,180,0.4);
          background: rgba(0,255,180,0.04);
          box-shadow: 0 0 0 1px rgba(0,255,180,0.1), inset 0 0 20px rgba(0,255,180,0.02);
        }

        .field-line {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 1px;
          width: 0;
          background: #00ffb4;
          transition: width 0.3s ease;
        }

        .field-wrapper.active .field-line {
          width: 100%;
        }

        .row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .strength-bar {
          margin-top: 8px;
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .strength-segment {
          height: 2px;
          flex: 1;
          border-radius: 1px;
          background: rgba(255,255,255,0.08);
          transition: background 0.3s;
        }

        .strength-label {
          font-size: 9px;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.3);
          margin-left: 6px;
          min-width: 60px;
        }

        .error-box {
          background: rgba(255,77,109,0.08);
          border: 1px solid rgba(255,77,109,0.25);
          border-radius: 2px;
          padding: 10px 14px;
          font-size: 11px;
          color: #ff4d6d;
          letter-spacing: 0.05em;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, rgba(0,255,180,0.15), rgba(0,255,180,0.05));
          border: 1px solid rgba(0,255,180,0.4);
          border-radius: 2px;
          padding: 12px;
          color: #00ffb4;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0,255,180,0.1), transparent);
          transition: left 0.4s ease;
        }

        .submit-btn:hover::before {
          left: 100%;
        }

        .submit-btn:hover {
          background: rgba(0,255,180,0.12);
          box-shadow: 0 0 20px rgba(0,255,180,0.15);
          border-color: rgba(0,255,180,0.7);
        }

        .submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .submit-btn:disabled::before {
          display: none;
        }

        .loading-dots {
          display: inline-flex;
          gap: 4px;
          align-items: center;
        }

        .loading-dots span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #00ffb4;
          animation: dotBounce 1.2s ease-in-out infinite;
        }

        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        .footer-text {
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          margin-top: 1.5rem;
          letter-spacing: 0.05em;
        }

        .footer-text a {
          color: rgba(0,255,180,0.7);
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-text a:hover {
          color: #00ffb4;
        }

        .sys-info {
          position: absolute;
          bottom: 1rem;
          right: 1.5rem;
          font-size: 9px;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.1);
          text-transform: uppercase;
        }
      `}</style>

      <div className="register-root">
        <div className="grid-bg" />
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />

        <div className="card">
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          <div className="badge">
            <span className="badge-dot" />
            Secure Registration
          </div>

          <h1 className="title">Hozz létre<br /><span>fiókot</span></h1>
          <p className="subtitle">// SYSTEM ACCESS INITIALIZATION</p>

          <div className="divider" />

          <form onSubmit={handleSubmit}>

            {/* Név */}
            <div className="field-group">
              <label className={`field-label ${focusedField === "name" ? "active" : ""}`}>
                Teljes név <span className="required">*</span>
              </label>
              <div className={`field-wrapper ${focusedField === "name" ? "active" : ""}`}>
                <span className="field-icon">◈</span>
                <input
                  name="name"
                  type="text"
                  placeholder="Szabó Máté"
                  required
                  className="field-input"
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                />
                <div className="field-line" />
              </div>
            </div>

            {/* Email */}
            <div className="field-group">
              <label className={`field-label ${focusedField === "email" ? "active" : ""}`}>
                Email cím <span className="required">*</span>
              </label>
              <div className={`field-wrapper ${focusedField === "email" ? "active" : ""}`}>
                <span className="field-icon">◎</span>
                <input
                  name="email"
                  type="email"
                  placeholder="pelda@email.com"
                  required
                  className="field-input"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
                <div className="field-line" />
              </div>
            </div>

            {/* Telefon */}
            <div className="field-group">
              <label className={`field-label ${focusedField === "phone" ? "active" : ""}`}>
                Telefonszám
              </label>
              <div className={`field-wrapper ${focusedField === "phone" ? "active" : ""}`}>
                <span className="field-icon">◷</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+36301234567"
                  className="field-input"
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                />
                <div className="field-line" />
              </div>
            </div>

            {/* Jelszavak */}
            <div className="row-2">
              <div className="field-group">
                <label className={`field-label ${focusedField === "password" ? "active" : ""}`}>
                  Jelszó <span className="required">*</span>
                </label>
                <div className={`field-wrapper ${focusedField === "password" ? "active" : ""}`}>
                  <span className="field-icon">◉</span>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="field-input"
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => checkPasswordStrength(e.target.value)}
                  />
                  <div className="field-line" />
                </div>
                {passwordStrength > 0 && (
                  <div className="strength-bar">
                    {[0,1,2,3].map((i) => (
                      <div
                        key={i}
                        className={`strength-segment ${i < passwordStrength ? strengthColors[passwordStrength - 1] : ""}`}
                      />
                    ))}
                    <span className="strength-label">{strengthLabels[passwordStrength - 1]}</span>
                  </div>
                )}
              </div>

              <div className="field-group">
                <label className={`field-label ${focusedField === "passwordConfirm" ? "active" : ""}`}>
                  Megerősítés <span className="required">*</span>
                </label>
                <div className={`field-wrapper ${focusedField === "passwordConfirm" ? "active" : ""}`}>
                  <span className="field-icon">◉</span>
                  <input
                    name="passwordConfirm"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="field-input"
                    onFocus={() => setFocusedField("passwordConfirm")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <div className="field-line" />
                </div>
              </div>
            </div>

            {error && (
              <div className="error-box">
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="loading-dots">
                  <span /><span /><span />
                </span>
              ) : (
                "Regisztráció indítása →"
              )}
            </button>
          </form>

          <p className="footer-text">
            Már van fiókod?{" "}
            <Link href="/auth/login">Bejelentkezés</Link>
          </p>

          <div className="sys-info">v1.0.0 · enc:aes-256</div>
        </div>
      </div>
    </>
  );
}
