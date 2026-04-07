import Image from "next/image";
import Link from "next/link";
export default function Footer() {
  return (
    <footer className="py-10 bg-[#F5EFE6] border-t border-[#EDE8E0]">
      <div className="max-w-7xl mx-auto px-8 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/assets/9optik1 (4).png"
            alt="OptikArt"
            width={80}
            height={80}
            className="object-contain"
          />
        </Link>
        <span className="text-[11px] tracking-[0.08em] text-[#A08060]">
          © {new Date().getFullYear()} OptikArt · Minden jog fenntartva
        </span>
      </div>
    </footer>
  );
}
