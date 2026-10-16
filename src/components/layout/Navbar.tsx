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
import { BAKARYA_LOGO_URL } from "../../utils/drive";

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
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "beranda", label: "Beranda" },
    { id: "jelajah", label: "Karya" },
    { id: "kontributor", label: "Kontributor" },
    ...(role !== "public"
      ? [
          {
            id: "dashboard",
            label: role === "contributor" ? "Dashboard" : "Moderasi",
            highlight: true,
          },
        ]
      : []),
    ...(role === "admin" || role === "superAdmin"
      ? [
          {
            id: "pengguna",
            label: pendingUsersCount > 0 ? `Akun (${pendingUsersCount})` : "Akun",
            highlight: true,
          },
          { id: "analitik", label: "Analitik" },
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
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#F8F7F2]/90 border-b border-[#14213D]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div
          onClick={() => handleTabClick("beranda")}
          className="flex items-center gap-3.5 cursor-pointer group shrink-0"
        >
          <div className="w-11 h-11 rounded-2xl bg-white border border-[#14213D]/15 flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-300 overflow-hidden p-1">
            <img
              src={BAKARYA_LOGO_URL}
              alt="Logo BAKARYA"
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://placehold.co/100x100/14213D/F2B84B?text=B";
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl tracking-tight text-[#14213D]">
                BAKARYA
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#167D78]/15 text-[#167D78]">
                Gugus 2 HSU
              </span>
            </div>
            <p className="text-[11px] text-[#727782] hidden sm:block font-medium">
              Kelas Digitalisasi Gugus 2 HSU • BOS Kinerja Terbaik 2026
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-[#14213D]/10 shadow-sm">
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
        <div className="flex items-center gap-2">
          {role === "public" ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuthModal("login")}
                className="bg-white hover:bg-[#F8F7F2] text-[#14213D] border border-[#14213D]/15 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4 text-[#167D78]" />
                <span>Masuk</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal("register")}
                className="bg-[#14213D] hover:bg-[#167D78] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4 text-[#F2B84B]" />
                <span>Daftar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {currentUserProfile && (
                <button
                  type="button"
                  onClick={onOpenSelfProfileModal}
                  className="bg-white hover:bg-[#F8F7F2] text-[#14213D] border border-[#14213D]/15 text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition-all flex items-center gap-2"
                  title="Profil Saya"
                >
                  <img
                    src={currentUserProfile.avatar}
                    alt={currentUserProfile.displayName}
                    className="w-6 h-6 rounded-lg object-cover border border-[#F2B84B]"
                  />
                  <span className="hidden md:inline max-w-[110px] truncate">
                    {currentUserProfile.displayName.split(",")[0]}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="bg-[#167D78] hover:bg-[#14213D] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Unggah</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("public");
                  setLoggedInUserUid(null);
                  setActiveTab("beranda");
                  onToast("Anda telah keluar dari sesi akun.", "info");
                }}
                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white border border-[#14213D]/15 text-[#14213D]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 py-3 bg-white border-b border-[#14213D]/10 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                activeTab === item.id
                  ? "bg-[#14213D] text-white"
                  : "text-[#20252D] hover:bg-[#F8F7F2]"
              }`}
            >
              {item.superOnly && <Lock className="w-3.5 h-3.5" />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
