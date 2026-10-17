import React from "react";
import { motion } from "framer-motion";
import {
  Camera,
  ShieldCheck,
  Users,
  Plus,
  AlertTriangle,
  Eye,
  MousePointerClick,
  Edit3,
  Send,
  Trash2,
  BookOpen,
  Sparkles,
  LogIn,
  UserPlus,
  Compass,
  ArrowRight,
  School,
} from "lucide-react";
import { Work, UserAccount, UserRole } from "../types";
import { StatusBadge } from "../components/common/StatusBadge";
import { getDriveDirectImageUrl, BAKARYA_DEFAULT_THUMBNAIL_URL } from "../utils/drive";

interface DashboardViewProps {
  role: UserRole;
  currentUserProfile: UserAccount | null;
  works: Work[];
  usersList?: UserAccount[];
  onOpenWorkDetail: (w: Work) => void;
  onOpenUploadModal: () => void;
  onEditWork: (w: Work) => void;
  onDeleteWork?: (w: Work) => void;
  onOpenModerationModal: (w: Work) => void;
  onQuickSubmitReview: (workId: string) => void;
  onOpenSelfProfileModal: () => void;
  onOpenAuthModal?: (mode: "login" | "register") => void;
  setActiveTab: (tab: string) => void;
}

export function DashboardView({
  role,
  currentUserProfile,
  works,
  usersList = [],
  onOpenWorkDetail,
  onOpenUploadModal,
  onEditWork,
  onDeleteWork,
  onOpenModerationModal,
  onQuickSubmitReview,
  onOpenSelfProfileModal,
  onOpenAuthModal,
  setActiveTab,
}: DashboardViewProps) {
  // JIKA PENGUNJUNG PUBLIK (BELUM LOGIN), TAMPILKAN DASHBOARD PUBLIK TERBUKA
  if (role === "public") {
    const publishedWorks = works.filter((w) => !w.isDeleted && w.status === "published");
    const totalViews = works.filter((w) => !w.isDeleted).reduce((acc, w) => acc + (w.viewCount || 0), 0);
    const totalClicks = works.filter((w) => !w.isDeleted).reduce((acc, w) => acc + (w.outboundClickCount || 0), 0);
    const activeContributors = usersList.filter((u) => !u.isDeleted && u.accountStatus === "active");
    const popularWorks = [...publishedWorks]
      .sort((a, b) => b.outboundClickCount * 2 + b.viewCount - (a.outboundClickCount * 2 + a.viewCount))
      .slice(0, 4);

    return (
      <motion.div
        key="public-dashboard"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="space-y-8"
      >
        {/* Public Header Banner */}
        <div className="bg-[#14213D] text-white p-6 sm:p-8 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl border border-white/10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F2B84B] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Dashboard Publik Repositori Gugus 2 HSU</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight">
              Transparansi Capaian Digitalisasi Pembelajaran Banua
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Memantau pemanfaatan dan publikasi media pembelajaran interaktif karya pendidik di Kabupaten Hulu Sungai Utara (HSU) dalam program BOS Kinerja Sekolah Berprestasi 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenAuthModal && onOpenAuthModal("register")}
              className="bg-[#F2B84B] hover:bg-[#e3a839] text-[#14213D] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Kontributor</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAuthModal && onOpenAuthModal("login")}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/15 transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4 text-[#F2B84B]" />
              <span>Masuk Akun</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("jelajah")}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/15 transition-all flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-[#167D78]" />
              <span>Jelajah Karya</span>
            </button>
          </div>
        </div>

        {/* Public KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#14213D]/10 shadow-sm">
            <div className="flex items-center justify-between text-[#727782] mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Karya Terbit</span>
              <BookOpen className="w-4 h-4 text-[#167D78]" />
            </div>
            <div className="font-display text-3xl font-extrabold text-[#167D78] mt-1">
              {publishedWorks.length}
            </div>
            <p className="text-[11px] text-[#727782] mt-1.5">Karya pembelajaran siap pakai</p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#14213D]/10 shadow-sm">
            <div className="flex items-center justify-between text-[#727782] mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Akses Media</span>
              <MousePointerClick className="w-4 h-4 text-amber-500" />
            </div>
            <div className="font-display text-3xl font-extrabold text-[#14213D] mt-1">
              {totalClicks.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-[#727782] mt-1.5">Klik langsung ke materi ajar</p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#14213D]/10 shadow-sm">
            <div className="flex items-center justify-between text-[#727782] mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Kunjungan</span>
              <Eye className="w-4 h-4 text-[#167D78]" />
            </div>
            <div className="font-display text-3xl font-extrabold text-[#14213D] mt-1">
              {totalViews.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-[#727782] mt-1.5">Tayangan detail karya</p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#14213D]/10 shadow-sm">
            <div className="flex items-center justify-between text-[#727782] mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Pendidik</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="font-display text-3xl font-extrabold text-indigo-900 mt-1">
              {activeContributors.length}
            </div>
            <p className="text-[11px] text-[#727782] mt-1.5">Guru terdaftar Gugus 2 HSU</p>
          </div>
        </div>

        {/* Featured Popular Works for Public */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#14213D]/10 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#14213D]/10 pb-4">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#14213D]">
                Karya Pembelajaran Terpopuler
              </h2>
              <p className="text-xs text-[#727782]">
                Media interaktif dengan pemanfaatan tertinggi oleh siswa dan pendidik
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("jelajah")}
              className="text-xs font-bold text-[#167D78] hover:text-[#14213D] flex items-center gap-1"
            >
              <span>Lihat Semua Karya ({publishedWorks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularWorks.map((work) => {
              const thumb = getDriveDirectImageUrl(work.thumbnailURL, "w400") || BAKARYA_DEFAULT_THUMBNAIL_URL;
              return (
                <div
                  key={work.id}
                  className="rounded-2xl border border-[#14213D]/10 overflow-hidden bg-[#F8F7F2]/40 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-36 bg-[#14213D] overflow-hidden">
                      <img
                        src={thumb}
                        alt={work.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = BAKARYA_DEFAULT_THUMBNAIL_URL;
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <StatusBadge status={work.status} />
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-display text-sm font-extrabold text-[#14213D] line-clamp-2">
                        {work.title}
                      </h3>
                      <p className="text-[11px] text-[#727782] line-clamp-1">
                        Oleh {work.contributorNameSnapshot}
                      </p>
                      <p className="text-[10px] text-[#167D78] font-bold truncate">
                        {work.contributorInstitution}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="flex items-center justify-between text-[11px] text-[#727782] font-semibold border-t border-[#14213D]/10 pt-2.5 mb-3">
                      <span>{work.viewCount} Kunjungan</span>
                      <span className="text-amber-700 font-bold">{work.outboundClickCount} Klik Media</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenWorkDetail(work)}
                      className="w-full py-2 px-3 rounded-xl bg-[#14213D] hover:bg-[#167D78] text-white text-xs font-bold transition-colors"
                    >
                      Buka Detail Karya
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contribution Guide for Public */}
        <div className="bg-gradient-to-br from-emerald-900 to-[#14213D] text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#F2B84B]">
              Panduan Bergabung
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold">
              Ingin Karya Pembelajaran Anda Dipublikasikan di BAKARYA?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Seluruh pendidik di Gugus 2 Kabupaten Hulu Sungai Utara dapat mengunggah bahan ajar digital, game edukasi, e-LKPD, atau video interaktif secara gratis dan resmi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#F2B84B] text-[#14213D] font-display font-extrabold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-display text-sm font-bold">Siapkan Tautan Media</h3>
              <p className="text-xs text-white/75 leading-relaxed">
                Buat materi di Google Drive, Canva, Quizizz, atau YouTube dengan izin tautan &quot;Siapa saja memiliki tautan&quot;.
              </p>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#F2B84B] text-[#14213D] font-display font-extrabold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-display text-sm font-bold">Daftar Akun Pendidik</h3>
              <p className="text-xs text-white/75 leading-relaxed">
                Pilih kecamatan di HSU, isi nama sekolah dan data profil untuk verifikasi akun pendidik.
              </p>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#F2B84B] text-[#14213D] font-display font-extrabold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-display text-sm font-bold">Kurasi & Terbit Resmi</h3>
              <p className="text-xs text-white/75 leading-relaxed">
                Tim kurator Gugus 2 HSU meninjau keamanan tautan dan menerbitkan karya ke repositori publik.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onOpenAuthModal && onOpenAuthModal("register")}
              className="px-6 py-3 rounded-xl bg-[#F2B84B] hover:bg-[#e3a839] text-[#14213D] font-extrabold text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Sekarang Sebagai Kontributor</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // JIKA SUDAH LOGIN (CONTRIBUTOR / ADMIN / SUPER ADMIN)
  const currentUid = currentUserProfile?.uid || "uid-contrib-1";
  const userWorks = works.filter(
    (w) => !w.isDeleted && (role === "contributor" ? w.contributorId === currentUid : true)
  );

  const publishedCount = userWorks.filter((w) => w.status === "published").length;
  const pendingCount = userWorks.filter((w) => w.status === "pending_review").length;
  const revisionCount = userWorks.filter((w) => w.status === "revision_requested").length;
  const totalClicks = userWorks.reduce((acc, w) => acc + w.outboundClickCount, 0);

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8"
    >
      {/* User / Curator Header Banner */}
      <div className="bg-[#14213D] text-white p-6 sm:p-8 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {currentUserProfile && (
            <div
              onClick={onOpenSelfProfileModal}
              className="relative group cursor-pointer shrink-0 self-start"
              title="Edit Profil & Foto"
            >
              <img
                src={getDriveDirectImageUrl(currentUserProfile.avatar, "w300") || currentUserProfile.avatar}
                alt={currentUserProfile.displayName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#F2B84B] shadow-md bg-white"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/150x150/14213D/F2B84B?text=Foto";
                }}
              />
              <div className="absolute inset-0 rounded-2xl bg-[#14213D]/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-6 h-6 text-[#F2B84B]" />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F2B84B] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {role === "contributor"
                  ? "Kontributor Pendidik"
                  : role === "admin"
                  ? "Admin Kurator Gugus"
                  : "Super Admin Pengelola"}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
              {currentUserProfile?.displayName || "Pengelola BAKARYA"}
            </h1>
            <p className="text-xs sm:text-sm text-white/75 max-w-2xl">
              {currentUserProfile?.institution || "Kabupaten Hulu Sungai Utara"} •{" "}
              {currentUserProfile?.district || "Gugus 2 HSU"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenSelfProfileModal}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/15 transition-all flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4 text-[#F2B84B]" />
            <span>Profil</span>
          </button>
          {(role === "admin" || role === "superAdmin") && (
            <button
              type="button"
              onClick={() => setActiveTab("pengguna")}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/15 transition-all flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-[#F2B84B]" />
              <span>Kelola Akun</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="bg-[#F2B84B] hover:bg-[#e3a839] text-[#14213D] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Unggah Karya</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10 shadow-sm">
          <span className="text-[11px] font-extrabold text-[#727782] uppercase tracking-wider">
            Karya Terbit
          </span>
          <div className="font-display text-3xl font-extrabold text-[#167D78] mt-2">
            {publishedCount}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10 shadow-sm">
          <span className="text-[11px] font-extrabold text-[#727782] uppercase tracking-wider">
            Menunggu Tinjauan
          </span>
          <div className="font-display text-3xl font-extrabold text-[#F2B84B] mt-2">
            {pendingCount}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10 shadow-sm">
          <span className="text-[11px] font-extrabold text-[#727782] uppercase tracking-wider">
            Perlu Direvisi
          </span>
          <div className="font-display text-3xl font-extrabold text-orange-600 mt-2">
            {revisionCount}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10 shadow-sm">
          <span className="text-[11px] font-extrabold text-[#727782] uppercase tracking-wider">
            Total Akses/Klik
          </span>
          <div className="font-display text-3xl font-extrabold text-[#14213D] mt-2">
            {totalClicks}
          </div>
        </div>
      </div>

      {/* Works Table / List */}
      <div className="bg-white rounded-3xl border border-[#14213D]/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#14213D]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-extrabold text-[#14213D]">
              {role === "contributor"
                ? "Daftar Karya Milik Saya"
                : "Antrean Moderasi & Seluruh Karya Kontributor"}
            </h2>
            <p className="text-xs text-[#727782]">
              {role === "contributor"
                ? "Anda dapat memperbarui draf atau menanggapi revisi kurator."
                : "Tim Kurator bertugas mereviu kesesuaian media dan keamanan link Drive."}
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#14213D]/10">
          {userWorks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#727782]">
              Belum ada karya yang diunggah. Klik tombol <strong>Unggah Karya</strong> di atas untuk mulai berbagi karya pembelajaran!
            </div>
          ) : (
            userWorks.map((work) => (
              <div
                key={work.id}
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-[#F8F7F2]/60 transition-colors"
              >
                <div className="space-y-2.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={work.status} />
                    <span className="text-xs font-bold text-[#14213D]">
                      {work.contributorNameSnapshot}
                    </span>
                    <span className="text-xs text-[#727782]">
                      ({work.contributorInstitution})
                    </span>
                    <span className="text-xs text-[#727782]">• Diperbarui: {work.updatedAt}</span>
                  </div>

                  <h3 className="font-display text-lg font-extrabold text-[#14213D]">
                    {work.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#727782] leading-relaxed">
                    {work.shortDescription}
                  </p>

                  {work.moderationNote && (
                    <div
                      className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                        work.status === "revision_requested"
                          ? "bg-amber-50 border-amber-200 text-amber-950"
                          : "bg-[#F8F7F2] border-[#14213D]/10 text-[#20252D]"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold block mb-0.5">Catatan Moderasi Kurator:</span>
                        {work.moderationNote}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-[#727782]">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-[#167D78]" />
                      {work.viewCount} Kunjungan
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="w-3.5 h-3.5 text-[#F2B84B]" />
                      {work.outboundClickCount} Klik Media
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenWorkDetail(work)}
                    className="px-3.5 py-2 rounded-xl border border-[#14213D]/15 text-xs font-bold text-[#14213D] hover:bg-[#F8F7F2]"
                  >
                    Lihat
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditWork(work)}
                    className="px-3.5 py-2 rounded-xl bg-[#14213D] hover:bg-[#167D78] transition-colors text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    title="Edit Karya & Perbarui Link"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {role === "contributor" && (work.status === "draft" || work.status === "revision_requested") && (
                    <button
                      type="button"
                      onClick={() => onQuickSubmitReview(work.id)}
                      className="px-3.5 py-2 rounded-xl bg-[#167D78] hover:bg-[#14213D] transition-colors text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Ajukan Kurasi</span>
                    </button>
                  )}

                  {(role === "admin" || role === "superAdmin") && (
                    <button
                      type="button"
                      onClick={() => onOpenModerationModal(work)}
                      className="px-4 py-2 rounded-xl bg-[#167D78] hover:bg-[#14213D] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Moderasi</span>
                    </button>
                  )}

                  {(role === "admin" || role === "superAdmin") && onDeleteWork && (
                    <button
                      type="button"
                      onClick={() => onDeleteWork(work)}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                      title="Hapus Karya Pembelajaran"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
