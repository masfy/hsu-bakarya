import React from "react";
import { motion } from "framer-motion";
import { Award, Globe, Lock, CheckCircle2 } from "lucide-react";

export function GuideView() {
  return (
    <motion.div
      key="panduan"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8"
    >
      {/* HEADER INFORMASI PROGRAM */}
      <div className="bg-[#14213D] text-white p-7 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-[#167D78]/30 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F2B84B] text-[#14213D] text-xs font-extrabold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Tentang Program & Panduan Singkat</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold leading-tight">
            Karya Inovatif Guru Banua Kalimantan Selatan
          </h1>
          <p className="text-sm sm:text-base text-white/85 leading-relaxed">
            <strong>BAKARYA (Banua Berkarya Digital)</strong> hadir sebagai wadah kolaborasi kreasi media pembelajaran digital persembahan{" "}
            <strong className="text-[#F2B84B]">
              Guru Banua di Kalimantan Selatan
            </strong>
            . Gerakan murni mulai dari guru, oleh guru, dan untuk guru agar seluruh pendidik dapat saling berbagi media pembelajaran yang berkualitas, kontekstual, dan menginspirasi kelas.
          </p>
        </div>
      </div>

      {/* 3 LANGKAH MUDAH MENJADI KONTRIBUTOR */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#14213D]/10 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">
            Alur Cepat & Mudah Dipahami
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#14213D] mt-1">
            3 Langkah Berbagi Karya di BAKARYA
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#14213D] text-[#F2B84B] font-display font-extrabold text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="font-display font-extrabold text-base text-[#14213D]">
              Daftar dengan Akun Google
            </h3>
            <p className="text-xs text-[#727782] leading-relaxed">
              Klik tombol <strong>"Daftar"</strong> di navigasi atas menggunakan akun Belajar.id atau Gmail. Setelah Admin menyetujui pendaftaran Anda, akun langsung aktif.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#167D78] text-white font-display font-extrabold text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="font-display font-extrabold text-base text-[#14213D]">
              Siapkan Tautan Karya
            </h3>
            <p className="text-xs text-[#727782] leading-relaxed">
              Unggah file atau media Anda ke Google Drive, Canva, Quizizz, Wordwall, atau YouTube. Pastikan akses tautan diatur ke <strong>"Siapa saja yang memiliki tautan"</strong>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F2B84B] text-[#14213D] font-display font-extrabold text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="font-display font-extrabold text-base text-[#14213D]">
              Kirim & Terbit ke Publik
            </h3>
            <p className="text-xs text-[#727782] leading-relaxed">
              Isi judul, jenjang, mapel, dan tempel tautan karya. Tim Kurator Guru Banua Kalimantan Selatan akan memoderasi sebelum karya resmi diterbitkan.
            </p>
          </div>
        </div>
      </div>

      {/* PANDUAN GOOGLE DRIVE & PRIVASI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-7 rounded-3xl border border-[#14213D]/10 space-y-4 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-[#167D78]/15 text-[#167D78] flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="font-display text-lg font-extrabold text-[#14213D]">
            Cara Mengatur Izin Tautan Google Drive
          </h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#20252D]">
            <li className="flex items-start gap-2.5">
              <span className="font-extrabold text-[#167D78]">1.</span>
              <span>
                Klik kanan file karya di Google Drive, lalu pilih <strong>Bagikan (Share)</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-extrabold text-[#167D78]">2.</span>
              <span>
                Ubah bagian <em>Akses Umum</em> dari <strong>Dibatasi (Restricted)</strong> menjadi{" "}
                <strong>Siapa saja yang memiliki tautan (Anyone with the link)</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-extrabold text-[#167D78]">3.</span>
              <span>
                Pastikan peran diatur sebagai <strong>Pelihat (Viewer)</strong>, lalu klik{" "}
                <strong>Salin Tautan</strong>.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-[#14213D]/10 space-y-4 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-[#14213D]/10 text-[#14213D] flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-display text-lg font-extrabold text-[#14213D]">
            Keamanan Akun & Privasi Pengunjung
          </h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#20252D]">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#167D78] shrink-0 mt-0.5" />
              <span>
                <strong>Foto Profil Maksimal 1 MB:</strong> Kontributor & Admin dapat mengunggah foto profil sendiri dari perangkat (maks. 1 MB).
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#167D78] shrink-0 mt-0.5" />
              <span>
                <strong>Privasi Email Guru:</strong> Alamat email pribadi kontributor tidak ditampilkan di halaman publik demi mencegah spam.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#167D78] shrink-0 mt-0.5" />
              <span>
                <strong>Analitik Anonim WITA:</strong> Statistik kunjungan hanya mencatat sesi anonim agregat tanpa menyimpan data pribadi pelacak.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
