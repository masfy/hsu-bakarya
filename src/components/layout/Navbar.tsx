import React, { useState } from "react";
import {
  Lock,
  LogIn,
  UserPlus,
  Plus,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { UserRole, UserAccount } from "../../types";
import { BAKARYA_LOGO_URL, getDriveDirectImageUrl } from "../../utils/drive";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  setLoggedInUserUid: (uid: string | null) => void;
  pendingUsersCount: number;
  currentUserProfile: UserAccount | null;
  onOpenAuthModal: (mode: "login" | "register") => void;
  onOpenSelfProfileModal: () => void;
  onOpenUploadModal: () => void;
  onToast: (msg: string, type?: "info" | "success" | "error") => void;
  onLogout?: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  role,
  setRole,
  setLoggedInUserUid,
  pendingUsersCount,
  currentUserProfile,
  onOpenAuthModal,
  onOpenSelfProfileModal,
  onOpenUploadModal,
  onToast,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "beranda", label: "Beranda" },
    { id: "jelajah", label: "Katalog Karya" },
    ...(role !== "public"
      ? [
          {
            id: "dashboard",
            label: role === "contributor" ? "Ruang Kerja Guru" : "Meja Kurasi",
            highlight: true,
          },
        ]
      : []),
    { id: "kontributor", label: "Kontributor" },
    { id: "analitik", label: "Analitik" },
    ...(role === "admin" || role === "superAdmin"
      ? [
          {
            id: "pengguna",
            label: pendingUsersCount > 0 ? `Akun (${pendingUsersCount})` : "Akun",
            highlight: true,
          },
        ]
      : []),
    { id: "panduan", label: "Panduan" },
    ...(role === "superAdmin"
      ? [{ id: "arsitektur", label: "🔒 Firebase", superOnly: true }]
      : []),
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#F8F7F2]/95 border-b border-[#14213D]/10 w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Title */}
        <div
          onClick={() => handleTabClick("beranda")}
          className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group shrink min-w-0"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white border border-[#14213D]/15 flex items-center justify-center shadow-sm sm:shadow-md group-hover:scale-105 transition-all duration-300 overflow-hidden p-1 shrink-0">
            <img
              src={BAKARYA_LOGO_URL}
              alt="Logo BAKARYA"
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://placehold.co/100x100/14213D/F2B84B?text=B";
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-display font-extrabold text-base sm:text-xl tracking-tight text-[#14213D]">
                BAKARYA
              </span>
              <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full bg-[#167D78]/15 text-[#167D78] truncate">
                Gugus 2 HSU
              </span>
            </div>
            <p className="text-[11px] text-[#727782] hidden md:block font-medium truncate">
              Kelas Digitalisasi Gugus 2 HSU • BOS Kinerja Terbaik 2026
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-[#14213D]/10 shadow-sm shrink-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === item.id
                  ? item.superOnly
                    ? "bg-[#F2B84B] text-[#14213D] shadow-sm"
                    : item.highlight
                    ? "bg-[#167D78] text-white shadow-sm"
                    : "bg-[#14213D] text-white shadow-sm"
                  : item.superOnly
                  ? "text-[#14213D] bg-[#F2B84B]/20 hover:bg-[#F2B84B]/35"
                  : item.highlight
                  ? "text-[#167D78] hover:bg-[#167D78]/10"
                  : "text-[#727782] hover:text-[#14213D] hover:bg-[#F8F7F2]"
              }`}
            >
              {item.superOnly && <Lock className="w-3 h-3" />}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User / Auth Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {role === "public" ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => onOpenAuthModal("login")}
                className="bg-white hover:bg-[#F8F7F2] text-[#14213D] border border-[#14213D]/15 text-xs sm:text-sm font-bold p-2 sm:px-3.5 sm:py-2 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                title="Masuk ke Akun"
                aria-label="Masuk"
              >
                <LogIn className="w-4 h-4 text-[#167D78]" />
                <span className="hidden sm:inline">Masuk</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal("register")}
                className="bg-[#14213D] hover:bg-[#167D78] text-white text-xs sm:text-sm font-bold p-2 sm:px-3.5 sm:py-2 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                title="Daftar Akun Baru"
                aria-label="Daftar"
              >
                <UserPlus className="w-4 h-4 text-[#F2B84B]" />
                <span className="hidden sm:inline">Daftar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {currentUserProfile && (
                <button
                  type="button"
                  onClick={onOpenSelfProfileModal}
                  className="bg-white hover:bg-[#F8F7F2] text-[#14213D] border border-[#14213D]/15 text-xs font-bold p-1.5 sm:px-3 sm:py-2 rounded-xl shadow-sm transition-all flex items-center gap-2 active:scale-95"
                  title="Profil Saya"
                >
                  <img
                    src={getDriveDirectImageUrl(currentUserProfile.avatar, "w100") || currentUserProfile.avatar}
                    alt={currentUserProfile.displayName}
                    className="w-6 h-6 rounded-lg object-cover border border-[#F2B84B] bg-white shrink-0"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://placehold.co/100x100/14213D/F2B84B?text=U";
                    }}
                  />
                  <span className="hidden md:inline max-w-[110px] truncate">
                    {currentUserProfile.displayName.split(",")[0]}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="bg-[#167D78] hover:bg-[#14213D] text-white text-xs sm:text-sm font-bold p-2 sm:px-3.5 sm:py-2 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                title="Unggah Karya Baru"
                aria-label="Unggah"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Unggah</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onLogout) {
                    onLogout();
                  } else {
                    setRole("public");
                    setLoggedInUserUid(null);
                    setActiveTab("beranda");
                    onToast("Anda telah keluar dari sesi akun.", "info");
                  }
                }}
                className="p-2 sm:p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all active:scale-95 shrink-0"
                title="Keluar"
                aria-label="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile Menu Button (Hamburger) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white border border-[#14213D]/15 text-[#14213D] hover:bg-[#F8F7F2] active:scale-95 transition-all shrink-0"
            aria-label="Menu navigasi"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 py-3 bg-white border-b border-[#14213D]/10 space-y-1 shadow-lg">
          {role === "public" && (
            <div className="grid grid-cols-2 gap-2 pb-3 mb-2 border-b border-[#14213D]/10">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal("login");
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#14213D]/15 bg-[#F8F7F2] text-[#14213D] font-bold text-xs active:bg-gray-200 transition-all"
              >
                <LogIn className="w-4 h-4 text-[#167D78]" />
                <span>Masuk</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal("register");
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#14213D] text-white font-bold text-xs shadow-sm active:bg-[#167D78] transition-all"
              >
                <UserPlus className="w-4 h-4 text-[#F2B84B]" />
                <span>Daftar Akun</span>
              </button>
            </div>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                activeTab === item.id
                  ? item.superOnly
                    ? "bg-[#F2B84B] text-[#14213D] font-extrabold shadow-sm"
                    : item.highlight
                    ? "bg-[#167D78] text-white font-extrabold shadow-sm"
                    : "bg-[#14213D] text-white font-extrabold shadow-sm"
                  : "text-[#20252D] hover:bg-[#F8F7F2]"
              }`}
            >
              <div className="flex items-center gap-2">
                {item.superOnly && <Lock className="w-3.5 h-3.5 text-[#14213D]" />}
                <span>{item.label}</span>
              </div>
            </button>
          ))}

          {role !== "public" && (
            <div className="pt-2 mt-2 border-t border-[#14213D]/10">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLogout) {
                    onLogout();
                  } else {
                    setRole("public");
                    setLoggedInUserUid(null);
                    setActiveTab("beranda");
                    onToast("Anda telah keluar dari sesi akun.", "info");
                  }
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
