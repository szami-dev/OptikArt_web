import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, } from "lucide-react";
import { SiYoutube } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-[#eeeeee] border-t border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* LOGO & SZLOGEN */}
          <div className="flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center">
              <Image

            src="/assets/10optik2 (1).png"

            alt="OptikArt"

            width={100}

            height={100}

            className="object-contain"

          />
              
            </Link>
            <p className="text-[13px] text-[#888888] leading-relaxed max-w-[250px]">
              Hagyd, hogy a kép beszéljen
            </p>
          </div>

          {/* ELÉRHETŐSÉG */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[12px] font-semibold tracking-widest uppercase text-[#A08060]">Kapcsolat</h4>
            <div className="flex flex-col gap-3 text-[14px] text-[#bbbbbb]">
              <a href="mailto:business@optikart.hu" className="flex items-center gap-3 hover:text-white transition-colors group">
                <Mail size={18} strokeWidth={1.5} className="text-[#A08060] group-hover:text-white" />
                business@optikart.hu
              </a>
              <a href="tel:+36301234567" className="flex items-center gap-3 hover:text-white transition-colors group">
                <Phone size={18} strokeWidth={1.5} className="text-[#A08060] group-hover:text-white" />
                +36 30 922 1702
              </a>
            </div>
          </div>

          {/* SOCIAL */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[12px] font-semibold tracking-widest uppercase text-[#A08060]">Kövess minket</h4>
            <div className="flex gap-4">
              {/* Instagram SVG */}
              <Link href="https://instagram.com/optikart_hu" target="_blank" className="p-2.5 border border-[#333333] rounded-full hover:border-[#A08060] transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-[#A08060]">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </Link>
              {/* Facebook SVG */}
              <Link href="https://www.facebook.com/profile.php?id=61559809194634" target="_blank" className="p-2.5 border border-[#333333] rounded-full hover:border-[#A08060] transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-[#A08060]">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </Link>
              {/* Portfolio/Camera (Lucide-ból ez van) */}
              <Link href="https://www.youtube.com/@OptikArt-gf3gq" target="_blank" className="p-2.5 border border-[#333333] rounded-full hover:border-[#A08060] transition-all group">
                <SiYoutube size={18} className="group-hover:text-[#A08060]" />
              </Link>
            </div>
          </div>
        </div>

        {/* ALSÓ COPYRIGHT SÁV */}
        <div className="pt-8 border-t border-[#222222] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             
            <span className="text-[10px] tracking-[0.2em] text-[#555555] uppercase">
              © {new Date().getFullYear()} OptikArt · Minden jog fenntartva
            </span>
          </div>
          <div className="flex gap-8">
            <Link href="/adatvedelem" className="text-[10px] text-[#555555] hover:text-[#A08060] uppercase tracking-widest transition-colors">Adatvédelem</Link>
            <Link href="/aszf" className="text-[10px] text-[#555555] hover:text-[#A08060] uppercase tracking-widest transition-colors">ÁSZF</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}