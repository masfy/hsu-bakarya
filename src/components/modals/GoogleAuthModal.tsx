import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  X,
  AlertTriangle,
  ChevronDown,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  UserCheck,
  School,
  MapPin,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import { UserAccount } from "../../types";
import { KALSEL_REGIONS, getDistrictsForRegion, BAKARYA_DEFAULT_AVATAR_URL } from "../../data/initialData";

// Generator Kode Captcha Keamanan (Karakter Unik & Non-Ambigu)
const generateCaptchaCode = () => {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export interface GoogleAuthPayload {
  uid: string;
  email: string;
  displayName: string;
  institution: string;
  district: string;
  avatar: string;
}

interface GoogleAuthModalProps {
  initialMode: "login" | "register";
  usersList: UserAccount[];
  onClose: () => void;
  onGoogleSignIn: () => Promise<{
    success: boolean;
    isUnregistered?: boolean;
    googleProfile?: {
      uid: string;
      email: string;
      displayName: string;
      photoURL: string;
    };
    message?: string;
  }>;
  onCompleteRegistration: (payload: GoogleAuthPayload) => Promise<{
    success: boolean;
    message?: string;
  }>;
}

export function GoogleAuthModal({
  initialMode,
  usersList,
  onClose,
  onGoogleSignIn,
  onCompleteRegistration,
}: GoogleAuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode || "login");
  const [googleProfile, setGoogleProfile] = useState<{
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
  } | null>(null);

  // Form Fields for Step 2 Registration
  const [displayName, setDisplayName] = useState("");
  const [institution, setInstitution] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("Kab. Hulu Sungai Utara (HSU)");
  const [district, setDistrict] = useState<string>("Amuntai Tengah");

  // State Captcha Keamanan
  const [captchaCode, setCaptchaCode] = useState<string>(() => generateCaptchaCode());
  const [captchaInput, setCaptchaInput] = useState<string>("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const availableDistricts = useMemo(() => getDistrictsForRegion(selectedRegion), [selectedRegion]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validasi Captcha sebelum menghubungkan akun Google
  const validateCaptcha = () => {
    if (!captchaInput.trim()) {
      setCaptchaError("Mohon ketik 5 karakter kode captcha keamanan di atas.");
      return false;
    }
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setCaptchaError("Kode captcha tidak cocok. Silakan coba kode baru yang tertera.");
      setCaptchaCode(generateCaptchaCode());
      setCaptchaInput("");
      return false;
    }
    setCaptchaError(null);
    return true;
  };

  // Handler Masuk via Google (1-Klik setelah validasi Captcha)
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!validateCaptcha()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onGoogleSignIn();
      if (!res.success) {
        if (res.isUnregistered && res.googleProfile) {
          // Akun Google valid tetapi belum terdaftar di database
          setErrorMsg(
            `Akun Google (${res.googleProfile.email}) belum terdaftar sebagai kontributor. Silakan lengkapi pendaftaran di bawah.`
          );
          setGoogleProfile(res.googleProfile);
          setDisplayName(res.googleProfile.displayName || "");
          setMode("register");
        } else {
          setErrorMsg(res.message || "Gagal masuk menggunakan Akun Google.");
        }
      }
    } catch (err: any) {
      console.error("Login Google Auth error:", err);
      setErrorMsg(err.message || "Terjadi kendala saat menghubungkan ke sesi Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler Daftar via Google (Langkah 1: Verifikasi Akun Google setelah validasi Captcha)
  const handleGoogleRegisterAuth = async () => {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!validateCaptcha()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onGoogleSignIn();
      if (res.success) {
        // Akun ternyata sudah ada dan langsung masuk
        return;
      }
      if (res.isUnregistered && res.googleProfile) {
        setGoogleProfile(res.googleProfile);
        setDisplayName(res.googleProfile.displayName || "");
        setInfoMsg(`Akun Google ${res.googleProfile.email} berhasil terhubung! Silakan lengkapi data sekolah di bawah.`);
      } else {
        setErrorMsg(res.message || "Gagal menghubungkan Akun Google untuk pendaftaran.");
      }
    } catch (err: any) {
      console.error("Register Google Auth error:", err);
      setErrorMsg(err.message || "Gagal menghubungkan Akun Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler Simpan Data Pendaftaran (Langkah 2: Lengkapi Data)
  const handleSaveRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleProfile) return;

    setErrorMsg(null);
    const cleanName = displayName.trim();
    const cleanInst = institution.trim();

    if (!cleanName) {
      setErrorMsg("Nama lengkap beserta gelar wajib diisi untuk atribusi karya.");
      return;
    }
    if (!cleanInst) {
      setErrorMsg("Asal sekolah / instansi wajib diisi.");
      return;
    }

    const fullDistrict = selectedRegion.includes("HSU")
      ? `${district}, ${selectedRegion}`
      : selectedRegion;

    setIsSubmitting(true);
    try {
      const res = await onCompleteRegistration({
        uid: googleProfile.uid,
        email: googleProfile.email,
        displayName: cleanName,
        institution: cleanInst,
        district: fullDistrict,
        avatar: googleProfile.photoURL || BAKARYA_DEFAULT_AVATAR_URL,
      });

      if (!res.success) {
        setErrorMsg(res.message || "Gagal menyimpan pendaftaran.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan data akun.");
    } finally {
      setIsSubmitting(false);
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
              <span>Autentikasi Otomatis Google</span>
            </div>
            <h2 className="font-display text-xl font-extrabold text-[#14213D] mt-0.5">
              {mode === "login"
                ? "Masuk ke Portal BAKARYA"
                : googleProfile
                ? "Lengkapi Data Pendaftaran"
                : "Daftar Akun Guru Banua"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-9 h-9 rounded-full bg-[#F8F7F2] hover:bg-[#14213D]/10 transition-colors flex items-center justify-center text-[#727782] disabled:opacity-50 cursor-pointer"
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
            className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
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
            className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              mode === "register" ? "bg-[#167D78] text-white shadow-md" : "text-[#727782] hover:text-[#14213D]"
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Notifikasi Error Banner */}
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
                Pemberitahuan
              </div>
              <p className="font-medium leading-relaxed">{errorMsg}</p>
            </div>
          </motion.div>
        )}

        {/* Notifikasi Info Banner */}
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
                Akun Terverifikasi
              </div>
              <p className="font-medium leading-relaxed">{infoMsg}</p>
            </div>
          </motion.div>
        )}

        {/* KONTEN TAB: MASUK */}
        {mode === "login" && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 text-xs text-[#727782] leading-relaxed">
              Masuk otomatis menggunakan <strong>Akun Google / Belajar.id</strong> resmi Anda. Tanpa perlu mengetik atau mengingat kata sandi manual.
            </div>

            {/* Widget Captcha Keamanan */}
            <div className="p-3.5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/15 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#14213D] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#167D78]" />
                  Verifikasi Keamanan (Captcha)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCaptchaCode(generateCaptchaCode());
                    setCaptchaInput("");
                    setCaptchaError(null);
                  }}
                  className="text-[10px] font-bold text-[#167D78] hover:text-[#14213D] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Ganti Kode Baru"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Acak Kode</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Visual Badge Captcha */}
                <div className="relative select-none px-4 py-2 rounded-xl bg-white border border-[#14213D]/20 shadow-inner flex items-center justify-center tracking-[0.25em] font-mono font-black text-lg text-[#14213D] overflow-hidden shrink-0 min-w-[125px] h-11">
                  <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#167D78_1px,transparent_1px)] [background-size:6px_6px]" />
                  <div className="absolute w-full h-[1.5px] bg-[#167D78]/30 -rotate-6 top-1/2 pointer-events-none" />
                  <div className="absolute w-full h-[1.5px] bg-[#F2B84B]/40 rotate-6 top-1/2 pointer-events-none" />
                  <span className="relative z-10 font-black italic drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]">
                    {captchaCode}
                  </span>
                </div>

                {/* Input Captcha */}
                <input
                  type="text"
                  maxLength={5}
                  value={captchaInput}
                  onChange={(e) => {
                    setCaptchaInput(e.target.value.toUpperCase());
                    if (captchaError) setCaptchaError(null);
                  }}
                  placeholder="Ketik 5 kode di kiri..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#14213D]/15 text-xs font-bold uppercase tracking-wider text-[#14213D] outline-none focus:border-[#167D78] focus:ring-1 focus:ring-[#167D78] transition-all"
                />
              </div>

              {captchaError && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{captchaError}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#14213D] hover:bg-[#167D78] active:scale-[0.99] text-white text-xs sm:text-sm font-extrabold shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Menghubungkan ke Akun Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
                  <span>Masuk dengan Akun Google</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-[#727782]">
                Belum pernah mendaftar?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMsg(null);
                    setCaptchaError(null);
                    setCaptchaCode(generateCaptchaCode());
                    setCaptchaInput("");
                  }}
                  className="font-bold text-[#167D78] hover:underline cursor-pointer"
                >
                  Daftar di sini
                </button>
              </span>
            </div>
          </div>
        )}

        {/* KONTEN TAB: DAFTAR */}
        {mode === "register" && !googleProfile && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-[#167D78]/10 border border-[#167D78]/25 text-xs text-[#14213D] leading-relaxed space-y-1.5">
              <div className="font-extrabold text-[#167D78] flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                <span>Pendaftaran Pendidik Kalimantan Selatan</span>
              </div>
              <p>
                Hubungkan <strong>Akun Google / Belajar.id</strong> Anda terlebih dahulu. Setelah berhasil diverifikasi, Anda cukup melengkapi asal sekolah dan wilayah tugas.
              </p>
            </div>

            {/* Widget Captcha Keamanan di Tab Daftar */}
            <div className="p-3.5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/15 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#14213D] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#167D78]" />
                  Verifikasi Keamanan (Captcha)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCaptchaCode(generateCaptchaCode());
                    setCaptchaInput("");
                    setCaptchaError(null);
                  }}
                  className="text-[10px] font-bold text-[#167D78] hover:text-[#14213D] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Ganti Kode Baru"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Acak Kode</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative select-none px-4 py-2 rounded-xl bg-white border border-[#14213D]/20 shadow-inner flex items-center justify-center tracking-[0.25em] font-mono font-black text-lg text-[#14213D] overflow-hidden shrink-0 min-w-[125px] h-11">
                  <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#167D78_1px,transparent_1px)] [background-size:6px_6px]" />
                  <div className="absolute w-full h-[1.5px] bg-[#167D78]/30 -rotate-6 top-1/2 pointer-events-none" />
                  <div className="absolute w-full h-[1.5px] bg-[#F2B84B]/40 rotate-6 top-1/2 pointer-events-none" />
                  <span className="relative z-10 font-black italic drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]">
                    {captchaCode}
                  </span>
                </div>

                <input
                  type="text"
                  maxLength={5}
                  value={captchaInput}
                  onChange={(e) => {
                    setCaptchaInput(e.target.value.toUpperCase());
                    if (captchaError) setCaptchaError(null);
                  }}
                  placeholder="Ketik 5 kode di kiri..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#14213D]/15 text-xs font-bold uppercase tracking-wider text-[#14213D] outline-none focus:border-[#167D78] focus:ring-1 focus:ring-[#167D78] transition-all"
                />
              </div>

              {captchaError && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{captchaError}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleGoogleRegisterAuth}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#167D78] hover:bg-[#14213D] active:scale-[0.99] text-white text-xs sm:text-sm font-extrabold shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Memverifikasi Akun Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
                  <span>Daftar dengan Akun Google</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* KONTEN FORMULIR LENGKAPI DATA PENDAFTARAN (SETELAH GOOGLE LOGIN) */}
        {mode === "register" && googleProfile && (
          <form onSubmit={handleSaveRegistration} className="space-y-4">
            {/* Kartu Akun Google Terkunci */}
            <div className="p-3.5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/15 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={googleProfile.photoURL || BAKARYA_DEFAULT_AVATAR_URL}
                  alt={googleProfile.displayName}
                  className="w-10 h-10 rounded-xl object-cover border border-[#167D78] shrink-0"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = BAKARYA_DEFAULT_AVATAR_URL;
                  }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#167D78]">
                    <Lock className="w-3 h-3" />
                    <span>Email Google Terkunci</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#14213D] truncate">
                    {googleProfile.email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGoogleProfile(null)}
                className="text-[11px] font-bold text-[#727782] hover:text-rose-600 transition-colors shrink-0 p-1 cursor-pointer"
                title="Ganti akun Google"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Nama Lengkap & Gelar */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Contoh: Muhammad Rizki, S.Pd."
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-medium outline-none focus:border-[#167D78] disabled:opacity-60"
                required
              />
            </div>

            {/* Asal Sekolah / Instansi */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
                Asal Sekolah / Instansi *
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Contoh: SDN Paliwara 2 Amuntai / SMPN 1 Banjarmasin"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-medium outline-none focus:border-[#167D78] disabled:opacity-60"
                required
              />
            </div>

            {/* Kabupaten / Kota di Kalsel */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
                Kabupaten / Kota (Kalimantan Selatan) *
              </label>
              <div className="relative">
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    const newReg = e.target.value;
                    setSelectedRegion(newReg);
                    const subList = getDistrictsForRegion(newReg);
                    setDistrict(subList[0] || "");
                  }}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-bold text-[#14213D] outline-none focus:border-[#167D78] focus:ring-1 focus:ring-[#167D78] cursor-pointer appearance-none pr-9 disabled:opacity-60"
                >
                  {KALSEL_REGIONS.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#727782]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Pilihan Kecamatan di Kabupaten / Kota Terpilih */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
                Kecamatan / Wilayah Tugas *
              </label>
              <div className="relative">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-bold text-[#14213D] outline-none focus:border-[#167D78] focus:ring-1 focus:ring-[#167D78] cursor-pointer appearance-none pr-9 disabled:opacity-60"
                >
                  {availableDistricts.map((kec) => (
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#167D78] hover:bg-[#14213D] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Menyimpan & Mengajukan Akun...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#F2B84B]" />
                  <span>Selesaikan Pendaftaran</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
