// ── PaymentStatus komponensek – importáld be a detail oldalakba ──

// Típus
export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "REFUNDED";

export const PAYMENT_META: Record<PaymentStatus, {
  label: string; color: string; bg: string; border: string; desc: string;
}> = {
  PENDING:  { label: "Függőben",   color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", desc: "A fizetés még nem érkezett meg." },
  PAID:     { label: "Fizetve",    color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", desc: "A fizetés sikeresen megérkezett." },
  OVERDUE:  { label: "Lejárt",     color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", desc: "A fizetési határidő lejárt." },
  REFUNDED: { label: "Visszatérítve", color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE", desc: "Az összeg visszatérítésre került." },
};

// ── Light (user) badge ────────────────────────────────────────
export function PaymentBadgeLight({ status }: { status: PaymentStatus | null | undefined }) {
  if (!status) return null;
  const m = PAYMENT_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.08em] px-2.5 py-1 border font-medium"
      style={{ color: m.color, background: m.bg, borderColor: m.border }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

// ── Dark (admin) badge ────────────────────────────────────────
export function PaymentBadgeDark({ status }: { status: PaymentStatus | null | undefined }) {
  if (!status) return null;
  const m = PAYMENT_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.1em] uppercase px-2 py-1 border"
      style={{ color: m.color, background: `${m.color}15`, borderColor: `${m.color}30` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

// ── Admin gyors státuszváltó panel ────────────────────────────
export function AdminPaymentPanel({
  projectId,
  currentStatus,
  totalPrice,
  onUpdated,
}: {
  projectId: number;
  currentStatus: PaymentStatus | null;
  totalPrice: number | null;
  onUpdated: (status: PaymentStatus) => void;
}) {
  const [saving, setSaving] = React.useState(false);

  async function updateStatus(status: PaymentStatus) {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: status }),
      });
      if (!res.ok) throw new Error();
      onUpdated(status);
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  return (
    <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
      <div className="text-[9px] tracking-[0.16em] uppercase text-[#3A3530] mb-4">Fizetési státusz</div>

      {/* Összeg */}
      {totalPrice != null && totalPrice > 0 && (
        <div className="mb-4 pb-4 border-b border-white/[0.05]">
          <div className="text-[9px] tracking-[0.12em] uppercase text-[#3A3530] mb-1">Fizetendő összeg</div>
          <div className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#C8A882]">
            {totalPrice.toLocaleString("hu-HU")} Ft
          </div>
        </div>
      )}

      {/* Gombok */}
      <div className="flex flex-col gap-1.5">
        {(Object.keys(PAYMENT_META) as PaymentStatus[]).map(s => {
          const m = PAYMENT_META[s];
          const active = currentStatus === s;
          return (
            <button key={s} onClick={() => !active && updateStatus(s)} disabled={saving || active}
              className={`py-2 px-3 text-left text-[11px] tracking-[0.08em] uppercase border transition-all ${active ? "border-current" : "border-white/[0.04] hover:border-current/30"}`}
              style={{ color: m.color, background: active ? `${m.color}18` : "transparent", borderColor: active ? `${m.color}40` : undefined }}>
              {active && "✓ "}{m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Szükséges a React importhoz a JSX-hez
import React from "react";
