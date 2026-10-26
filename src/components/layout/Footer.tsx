import React from "react";
import { Sparkles, Heart } from "lucide-react";
import { BAKARYA_LOGO_URL } from "../../utils/drive";

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export function Footer({ setActiveTab }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-[#14213D]/10 bg-white/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={BAKARYA_LOGO_URL}
                alt="Logo BAKARYA"
                className="w-9 h-9 object-contain rounded-xl"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div>
                <span className="font-display font-extrabold text-lg tracking-tight text-[#14213D]">
                  BAKARYA
                </span>
                <span className="ml-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#167D78]/15 text-[#167D78]">
                  Banua Berkarya Digital
                </span>
              </div>
            </div>
            <p className="text-xs text-[#727782] leading-relaxed max-w-md">
              Portal repositori dan kurasi media pembelajaran digital interaktif ciptaan Guru Banua di Kalimantan Selatan. Gerakan mandiri dari guru, oleh guru, dan untuk guru demi transformasi pembelajaran yang hidup, bermakna, serta berakar kearifan lokal.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#167D78]">
              <Sparkles className="w-3.5 h-3.5 text-[#F2B84B]" />
              <span>Inisiatif Inovasi Pembelajaran Digital Guru Banua Kalsel</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#14213D] mb-3">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#727782]">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab("beranda")}
                  className="hover:text-[#167D78] transition-colors"
                >
                  Beranda Portal
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab("jelajah")}
                  className="hover:text-[#167D78] transition-colors"
                >
                  Katalog Karya Pembelajaran
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab("kontributor")}
                  className="hover:text-[#167D78] transition-colors"
                >
                  Direktori Pendidik Banua
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab("panduan")}
                  className="hover:text-[#167D78] transition-colors"
                >
                  Panduan Kurasi & Google Drive
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#14213D] mb-3">
              Semangat Kolaborasi
            </h4>
            <p className="text-xs text-[#727782] leading-relaxed">
              Mulai guru, dari guru, dan untuk guru di Kalimantan Selatan. Wadah terbuka untuk saling berbagi dan menginspirasi karya media pembelajaran digital Banua.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#14213D]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#727782]">
          <p>© {new Date().getFullYear()} BAKARYA — Banua Berkarya Digital Kalimantan Selatan. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex flex-wrap items-center gap-2">
            <span>Support by</span>
            <a
              href="https://www.mfytech.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#167D78] hover:text-[#14213D] underline underline-offset-2 transition-colors flex items-center gap-1"
            >
              <span>MfyTech</span>
              <span className="text-[10px] text-[#727782]"></span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
