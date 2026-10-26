import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  ChevronDown,
  Loader2,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
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
  }) => Promise<{ success: boolean; message?: string; code?: string } | void> | void;
  onGooglePopupAuth?: () => Promise<{ success: boolean; message?: string } | void>;
  onForgotPassword?: (email: string) => Promise<{ success: boolean; message?: string } | void>;
}

export function GoogleAuthModal({
  initialMode,
  usersList,
  onClose,
  onSubmitAuth,
  onGooglePopupAuth,
  onForgotPassword,
}: GoogleAuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [institution, setInstitution] = useState("");
  const [district, setDistrict] = useState<string>("Amuntai Tengah");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Masukkan alamat email yang valid (contoh: alfyarnaim@gmail.com).");
      return;
    }

    if (mode === "register") {
      if (!displayName.trim() || !institution.trim()) {
        setErrorMsg("Nama lengkap dan asal sekolah/instansi wajib diisi saat mendaftar.");
        return;
      }
      if (!password || password.length < 6) {
        setErrorMsg("Kata sandi pendaftaran minimal 6 karakter demi keamanan akun.");
        return;
      }
    } else {
      if (!password) {
        setErrorMsg("Silakan masukkan kata sandi akun Anda.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmitAuth({
        mode,
        email: cleanEmail,
        password,
        displayName,
        institution,
        district,
      });

      if (res && typeof res === "object" && !res.success) {
        setErrorMsg(res.message || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
      }
    } catch (err: any) {
      console.error("Kesalahan proses login:", err);
      setErrorMsg(err.message || "Terjadi kendala saat menghubungkan ke server Firebase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGooglePopupClick = async () => {
    if (!onGooglePopupAuth) return;
    setErrorMsg(null);
    setInfoMsg(null);
    setIsGoogleSubmitting(true);
    try {
      const res = await onGooglePopupAuth();
      if (res && typeof res === "object" && !res.success) {
        setErrorMsg(res.message || "Gagal masuk menggunakan Akun Google.");
      }
    } catch (err: any) {
      console.error("Kesalahan popup Google Auth:", err);
      setErrorMsg(err.message || "Gagal menghubungkan ke sesi Google.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleForgotPasswordClick = async () => {
    if (!onForgotPassword) return;
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Isi kolom email di bawah terlebih dahulu, lalu klik 'Lupa kata sandi?'.");
      return;
    }

    setErrorMsg(null);
    setInfoMsg(null);
    setIsResettingPassword(true);
    try {
      const res = await onForgotPassword(cleanEmail);
      if (res && typeof res === "object") {
        if (res.success) {
          setInfoMsg(res.message || `Tautan reset kata sandi telah dikirim ke ${cleanEmail}. Periksa inbox / spam email Anda.`);
        } else {
          setErrorMsg(res.message || "Gagal mengirimkan email reset kata sandi.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengirimkan email reset kata sandi.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#14213D]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 border border-[#14213D]/10 relative"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#167D78]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Autentikasi Aman BAKARYA</span>
            </div>
            <h2 className="font-display text-xl font-extrabold text-[#14213D] mt-0.5">
              {mode === "login" ? "Masuk ke Portal" : "Daftar Akun Kontributor"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-9 h-9 rounded-full bg-[#F8F7F2] hover:bg-[#14213D]/10 transition-colors flex items-center justify-center text-[#727782] disabled:opacity-50"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Masuk vs Daftar */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#F8F7F2] p-1.5 rounded-2xl border border-[#14213D]/10">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
              mode === "login" ? "bg-[#14213D] text-white shadow-md" : "text-[#727782] hover:text-[#14213D]"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
              mode === "register" ? "bg-[#167D78] text-white shadow-md" : "text-[#727782] hover:text-[#14213D]"
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Notifikasi Error Banner (Jelas & Informatif) */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs shadow-sm flex items-start gap-3"
          >
            <div className="w-7 h-7 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-[11px] text-rose-800 uppercase tracking-wider mb-0.5">
                Gagal Masuk / Kesalahan Akun
              </div>
              <p className="font-medium leading-relaxed">{errorMsg}</p>
            </div>
          </motion.div>
        )}

        {/* Notifikasi Info / Sukses Banner */}
        {infoMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs shadow-sm flex items-start gap-3"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-[11px] text-emerald-800 uppercase tracking-wider mb-0.5">
                Informasi
              </div>
              <p className="font-medium leading-relaxed">{infoMsg}</p>
            </div>
          </motion.div>
        )}

        {/* Opsi 1: Masuk 1-Klik dengan Akun Google */}
        {onGooglePopupAuth && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGooglePopupClick}
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full py-3 px-4 rounded-2xl border-2 border-[#14213D]/15 bg-white hover:bg-[#F8F7F2] active:scale-[0.99] text-[#14213D] text-xs sm:text-sm font-extrabold shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isGoogleSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#167D78]" />
                  <span>Menghubungkan ke Akun Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Masuk Cepat dengan Akun Google (1-Klik)</span>
                </>
              )}
            </button>

            {/* Garis Pemisah Antara Google Popup dan Email/Password */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-[#14213D]/10"></div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#727782] bg-white px-2">
                Atau dengan Email & Kata Sandi
              </span>
              <div className="flex-1 h-px bg-[#14213D]/10"></div>
            </div>
          </div>
        )}

        {/* Form Email & Password */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div className="p-3.5 rounded-2xl bg-[#167D78]/10 border border-[#167D78]/25 text-xs text-[#14213D] leading-relaxed">
                Pendidik Gugus 2 HSU dapat mendaftar dengan akun Google / Belajar.id. Begitu disetujui Admin Kurator, Anda dapat mengunggah karya interaktif!
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
                  disabled={isSubmitting || isGoogleSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-medium outline-none focus:border-[#167D78] disabled:opacity-60"
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
                  disabled={isSubmitting || isGoogleSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-medium outline-none focus:border-[#167D78] disabled:opacity-60"
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
                    disabled={isSubmitting || isGoogleSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-bold text-[#14213D] outline-none focus:border-[#167D78] focus:ring-1 focus:ring-[#167D78] cursor-pointer appearance-none pr-9 disabled:opacity-60"
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
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-mono outline-none focus:border-[#167D78] disabled:opacity-60"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-extrabold uppercase text-[#14213D]">
                Kata Sandi (Password) *
              </label>
              {mode === "login" && onForgotPassword && (
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  disabled={isResettingPassword || isSubmitting || isGoogleSubmitting}
                  className="text-[11px] font-bold text-[#167D78] hover:text-[#14213D] transition-colors underline disabled:opacity-50"
                >
                  {isResettingPassword ? "Mengirim link..." : "Lupa kata sandi?"}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-mono outline-none focus:border-[#167D78] disabled:opacity-60"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-[#14213D] hover:bg-[#167D78] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Memverifikasi Akun ke Firebase...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-[#F2B84B]" />
                <span>{mode === "login" ? "Masuk ke Akun" : "Daftar Akun Baru"}</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
