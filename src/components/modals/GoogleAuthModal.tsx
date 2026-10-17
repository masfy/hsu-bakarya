import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, AlertTriangle, Eye, EyeOff, ChevronDown } from "lucide-react";
import { UserAccount } from "../../types";
import { HSU_DISTRICTS } from "../../data/initialData";

interface GoogleAuthModalProps {
  initialMode: "login" | "register";
  usersList: UserAccount[];
  onClose: () => void;
  onSubmitAuth: (payload: {
    mode: "login" | "register";
    email: string;
    password?: string;
    displayName: string;
    institution: string;
    district: string;
  }) => void;
}

export function GoogleAuthModal({
  initialMode,
  usersList,
  onClose,
  onSubmitAuth,
}: GoogleAuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [institution, setInstitution] = useState("");
  const [district, setDistrict] = useState<string>("Amuntai Tengah");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Masukkan alamat email yang valid (contoh: nama@email.com).");
      return;
    }

    if (mode === "register") {
      if (!displayName.trim() || !institution.trim()) {
        setErrorMsg("Nama lengkap dan asal sekolah/instansi wajib diisi saat mendaftar.");
        return;
      }
      if (!password || password.length < 6) {
        setErrorMsg("Kata sandi pendaftaran wajib diisi minimal 6 karakter demi keamanan akun.");
        return;
      }
    } else {
      if (!password) {
        setErrorMsg("Masukkan kata sandi akun Anda.");
        return;
      }
    }

    onSubmitAuth({
      mode,
      email,
      password,
      displayName,
      institution,
      district,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8"
      >
        <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#167D78]">
              Autentikasi Akun Google
            </span>
            <h2 className="font-display text-xl font-extrabold text-[#14213D] mt-0.5">
              {mode === "login" ? "Masuk ke Portal" : "Daftar Akun Kontributor"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F8F7F2] hover:bg-[#14213D]/10 transition-colors flex items-center justify-center text-[#727782]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Switcher Login / Register */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#F8F7F2] p-1.5 rounded-2xl border border-[#14213D]/10">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
              mode === "login" ? "bg-[#14213D] text-white shadow-sm" : "text-[#727782] hover:text-[#14213D]"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setEmail("");
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
              mode === "register" ? "bg-[#167D78] text-white shadow-sm" : "text-[#727782] hover:text-[#14213D]"
            }`}
          >
            Daftar
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div className="p-3.5 rounded-2xl bg-[#167D78]/10 border border-[#167D78]/25 text-xs text-[#14213D] leading-relaxed">
                Daftar dengan <strong>Akun Google / Belajar.id</strong>. Begitu disetujui Admin Kurator, Anda dapat langsung mengunggah karya interaktif!
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Contoh: Muhammad Rizki, S.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-medium outline-none focus:border-[#167D78]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
                  Asal Sekolah / Gugus 2 HSU *
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Contoh: SDN Paliwara 2 Amuntai"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-medium outline-none focus:border-[#167D78]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
                  Kecamatan / Wilayah Tugas (HSU) *
                </label>
                <div className="relative">
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-bold text-[#14213D] outline-none focus:border-[#167D78] focus:ring-1 focus:ring-[#167D78] cursor-pointer appearance-none pr-9"
                  >
                    {HSU_DISTRICTS.map((kec) => (
                      <option key={kec} value={kec}>
                        {kec}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#727782]">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
              Email Google / Akun Terdaftar *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-mono outline-none focus:border-[#167D78]"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
              Kata Sandi (Password) *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-mono outline-none focus:border-[#167D78]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#14213D] hover:bg-[#167D78] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span className="w-5 h-5 rounded-full bg-white text-[#14213D] font-extrabold text-xs flex items-center justify-center">
              G
            </span>
            <span>{mode === "login" ? "Masuk ke Akun" : "Daftar Akun Baru"}</span>
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
