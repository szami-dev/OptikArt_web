"use client";

import { useState } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled || loading) return;

    // Ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);

    props.onClick?.(e);
  }

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "btn-danger",
    outline: "btn-outline",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap');

        .btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border: 1px solid transparent;
          border-radius: 2px;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          user-select: none;
          text-decoration: none;
        }

        .btn:disabled, .btn.loading {
          opacity: 0.45;
          cursor: not-allowed;
          pointer-events: none;
        }

        /* Sizes */
        .btn-sm { font-size: 11px; padding: 7px 16px; }
        .btn-md { font-size: 12px; padding: 10px 22px; }
        .btn-lg { font-size: 13px; padding: 13px 30px; }

        /* Full width */
        .btn-full { width: 100%; }

        /* Variants */
        .btn-primary {
          background: #1a1a1a;
          color: #f5f0e8;
          border-color: #1a1a1a;
        }
        .btn-primary:hover:not(:disabled) {
          background: #2e2e2e;
          border-color: #2e2e2e;
          box-shadow: 0 4px 20px rgba(0,0,0,0.18);
          transform: translateY(-1px);
        }
        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: none;
        }

        .btn-secondary {
          background: #f0ece6;
          color: #3a3530;
          border-color: #e8e2da;
        }
        .btn-secondary:hover:not(:disabled) {
          background: #e8e2da;
          border-color: #d8d0c8;
          transform: translateY(-1px);
        }

        .btn-outline {
          background: transparent;
          color: #1a1a1a;
          border-color: #1a1a1a;
        }
        .btn-outline:hover:not(:disabled) {
          background: #1a1a1a;
          color: #f5f0e8;
          transform: translateY(-1px);
        }

        .btn-ghost {
          background: transparent;
          color: #5a5248;
          border-color: transparent;
        }
        .btn-ghost:hover:not(:disabled) {
          background: rgba(0,0,0,0.05);
          color: #1a1a1a;
        }

        .btn-danger {
          background: transparent;
          color: #c0392b;
          border-color: rgba(192,57,43,0.3);
        }
        .btn-danger:hover:not(:disabled) {
          background: #c0392b;
          color: #fff;
          border-color: #c0392b;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(192,57,43,0.25);
        }

        /* Icon */
        .btn-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-sm .btn-icon { width: 13px; height: 13px; }
        .btn-lg .btn-icon { width: 18px; height: 18px; }

        /* Loading spinner */
        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 1.5px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: btnSpin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes btnSpin {
          to { transform: rotate(360deg); }
        }

        /* Ripple */
        .btn-ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          width: 100px;
          height: 100px;
          margin-left: -50px;
          margin-top: -50px;
          animation: rippleAnim 0.6s ease-out forwards;
          pointer-events: none;
        }

        .btn-primary .btn-ripple,
        .btn-danger.active .btn-ripple { background: rgba(255,255,255,0.2); }
        .btn-secondary .btn-ripple,
        .btn-ghost .btn-ripple { background: rgba(0,0,0,0.08); }

        @keyframes rippleAnim {
          from { transform: scale(0); opacity: 1; }
          to { transform: scale(4); opacity: 0; }
        }
      `}</style>

      <button
        {...props}
        disabled={disabled || loading}
        onClick={handleClick}
        className={[
          "btn",
          sizeStyles[size],
          variantStyles[variant],
          fullWidth ? "btn-full" : "",
          loading ? "loading" : "",
          props.className ?? "",
        ].join(" ")}
      >
        {/* Ripples */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="btn-ripple"
            style={{ left: r.x, top: r.y }}
          />
        ))}

        {/* Loading spinner */}
        {loading && <span className="btn-spinner" />}

        {/* Icon left */}
        {!loading && icon && iconPosition === "left" && (
          <span className="btn-icon">{icon}</span>
        )}

        {/* Label */}
        <span>{children}</span>

        {/* Icon right */}
        {!loading && icon && iconPosition === "right" && (
          <span className="btn-icon">{icon}</span>
        )}
      </button>
    </>
  );
}

// ─── Usage example (törölheted) ───────────────────────────────────────────────
export function ButtonShowcase() {
  const [loading, setLoading] = useState(false);

  const ArrowIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", padding: "2rem", background: "#faf8f5" }}>
      <Button variant="primary">Elsődleges</Button>
      <Button variant="secondary">Másodlagos</Button>
      <Button variant="outline">Körvonal</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Törlés</Button>
      <Button variant="primary" icon={ArrowIcon} iconPosition="right">Tovább</Button>
      <Button variant="primary" size="sm">Kis gomb</Button>
      <Button variant="primary" size="lg">Nagy gomb</Button>
      <Button
        variant="primary"
        loading={loading}
        onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}
      >
        Küldés
      </Button>
      <Button variant="primary" disabled>Letiltva</Button>
    </div>
  );
}
