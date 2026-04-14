"use client";

// app/components/DateBadge.tsx
// A projekt munka dátumát (eventDate) mutatja – NEM a calendarEvents[0]-t!

const HU_MONTHS_SH = [
  "jan",
  "feb",
  "már",
  "ápr",
  "máj",
  "jún",
  "júl",
  "aug",
  "szep",
  "okt",
  "nov",
  "dec",
];
const HU_DAYS_SH = ["V", "H", "K", "Sz", "Cs", "P", "Szo"];

type Props = {
  eventDate?: string | Date | null;
  size?: "sm" | "md" | "lg";
  dark?: boolean;
};

export default function DateBadge({
  eventDate,
  size = "md",
  dark = false,
}: Props) {
  if (!eventDate) return null;

  const d = new Date(eventDate);
  if (isNaN(d.getTime())) return null;

  const sizes = {
    sm: { outer: "px-2 py-1.5", num: "text-[1.4rem]", meta: "text-[7px]" },
    md: { outer: "px-3 py-2", num: "text-[1.8rem]", meta: "text-[8px]" },
    lg: { outer: "px-4 py-3", num: "text-[2.2rem]", meta: "text-[9px]" },
  }[size];

  const borderCls = dark
    ? "border-[#C8A882]/25 bg-[#C8A882]/5"
    : "border-[#EDE8E0] bg-white";
  const numCls = dark ? "text-[#C8A882]" : "text-[#1A1510]";
  const metaCls = dark ? "text-[#3A3530]" : "text-[#A08060]";

  return (
    <div
      className={`border ${borderCls} ${sizes.outer} text-center inline-flex flex-col items-center gap-0.5`}
    >
      <div className={`tracking-[0.15em] uppercase ${metaCls} ${sizes.meta}`}>
        {HU_MONTHS_SH[d.getMonth()]} {d.getFullYear()}
      </div>
      <div
        className={`font-['Cormorant_Garamond'] font-light leading-none ${numCls} ${sizes.num}`}
      >
        {d.getDate()}
      </div>
      <div className={`tracking-[0.1em] uppercase ${metaCls} ${sizes.meta}`}>
        {HU_DAYS_SH[d.getDay()]}
      </div>
    </div>
  );
}
