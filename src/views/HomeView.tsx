import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Compass,
  Plus,
  ArrowUpRight,
  Layers,
  Eye,
  MousePointerClick,
  Users,
  Activity,
  Award,
  TrendingUp,
  School,
  BookOpen,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Work,
  UserAccount,
  MediaType,
  UserRole,
  DailyAnalytics,
  MonthlyAnalytics,
} from "../types";
import { WorkCard } from "../components/cards/WorkCard";
import {
  HERO_ANIMATED_PHRASES,
  EDUCATION_LEVELS,
} from "../data/initialData";
import {
  BAKARYA_LOGO_URL,
  BAKARYA_DEFAULT_THUMBNAIL_URL,
} from "../utils/drive";

interface HomeViewProps {
  works: Work[];
  usersList: UserAccount[];
  mediaTypesList: MediaType[];
  filteredPublicWorks: Work[];
  dailyStats?: DailyAnalytics[];
  monthlyStats?: MonthlyAnalytics[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedLevel: string;
  setSelectedLevel: (lvl: string) => void;
  setSelectedMediaType: (m: string) => void;
  resetAllFilters: () => void;
  setActiveTab: (tab: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  role: UserRole;
  heroPhraseIdx: number;
  currentUserProfile?: UserAccount | null;
  onOpenWorkDetail: (w: Work) => void;
  onShareWork: (w: Work) => void;
  onSelectContributor: (c: UserAccount) => void;
  onOpenAuthModal: (mode: "login" | "register") => void;
  onOpenUploadModal?: () => void;
}

export function HomeView({
  works,
  usersList,
  mediaTypesList,
  filteredPublicWorks,
  dailyStats = [],
  monthlyStats = [],
  searchQuery,
  setSearchQuery,
  selectedLevel,
  setSelectedLevel,
  setSelectedMediaType,
  resetAllFilters,
  setActiveTab,
  sortBy,
  setSortBy,
  role,
  heroPhraseIdx,
  currentUserProfile,
  onOpenWorkDetail,
  onShareWork,
  onSelectContributor,
  onOpenAuthModal,
  onOpenUploadModal,
}: HomeViewProps) {
  const [homePage, setHomePage] = useState(1);
  const [showAllInHome, setShowAllInHome] = useState(false);
  const [activeWorkFilter, setActiveWorkFilter] = useState<"all" | "mine">("all");

  useEffect(() => {
    setHomePage(1);
  }, [sortBy, activeWorkFilter, searchQuery, selectedLevel]);

  // Perhitungan Statistik Kunjungan & Dampak Pemanfaatan 100% Nyata (Real Data)
  const publishedWorks = useMemo(
    () => works.filter((w) => w.status === "published" && !w.isDeleted),
    [works]
  );

  const activeContributors = useMemo(
    () =>
      usersList.filter(
        (u) => !u.isDeleted && u.accountStatus === "active" && u.role === "contributor"
      ),
    [usersList]
  );

  const totalViews = useMemo(
    () => works.filter((w) => !w.isDeleted).reduce((acc, w) => acc + (w.viewCount || 0), 0),
    [works]
  );

  const totalClicks = useMemo(
    () => works.filter((w) => !w.isDeleted).reduce((acc, w) => acc + (w.outboundClickCount || 0), 0),
    [works]
  );

  // Total kunjungan riil: akumulasi sesi kunjungan aktual + interaksi tayangan
  const totalVisits = useMemo(() => {
    const fromDaily = dailyStats.reduce((acc, d) => acc + (d.visits || 0), 0);
    return fromDaily > 0 ? fromDaily : totalViews;
  }, [dailyStats, totalViews]);

  // Statistik hari ini riil
  const todayStats = useMemo(() => {
    if (dailyStats && dailyStats.length > 0) {
      return dailyStats[dailyStats.length - 1];
    }
    return { visits: 0, pageViews: totalViews, outboundClicks: totalClicks };
  }, [dailyStats, totalViews, totalClicks]);

  // Jumlah instansi / sekolah riil terhubung
  const uniqueInstitutions = useMemo(() => {
    const instSet = new Set<string>();
    usersList.forEach((u) => {
      if (!u.isDeleted && u.institution && u.institution.trim()) {
        instSet.add(u.institution.trim());
      }
    });
    works.forEach((w) => {
      if (!w.isDeleted && w.contributorInstitution && w.contributorInstitution.trim()) {
        instSet.add(w.contributorInstitution.trim());
      }
    });
    return instSet.size;
  }, [usersList, works]);

  // Data grafik 7 hari terakhir riil
  const trafficChartData = useMemo(() => {
    if (dailyStats && dailyStats.length > 0) {
      return dailyStats.slice(-7);
    }
    return [];
  }, [dailyStats]);

  return (
    <motion.div
      key="beranda"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-14"
    >
      {/* HERO LANDING PAGE UTAMA BERANIMASI */}
      <section className="relative rounded-3xl bg-[#14213D] text-white p-7 sm:p-12 lg:p-14 overflow-hidden shadow-2xl border border-white/10">
        {/* Animated Floating Background Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            x: [0, 25, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-[#167D78]/40 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.22, 1],
            x: [0, -30, 0],
            y: [0, 25, 0],
          }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-28 left-1/4 w-80 h-80 rounded-full bg-[#F2B84B]/25 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#F2B84B] text-xs font-bold tracking-wider uppercase shadow-sm"
            >
              <motion.span
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-[#F2B84B]" />
              </motion.span>
              <span>Portal Karya Pendidik Banua</span>
            </motion.div>

            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.18]"
              >
                Dari Banua,{" "}
                <span className="block sm:inline-block relative min-w-0 sm:min-w-[340px]">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={heroPhraseIdx}
                      initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="inline-block text-[#F2B84B] underline decoration-[#167D78] decoration-wavy decoration-2 underline-offset-8"
                    >
                      {HERO_ANIMATED_PHRASES[heroPhraseIdx]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-white via-white to-[#F2B84B] bg-clip-text text-transparent">
                  Berdampak untuk Semua.
                </span>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/85 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl"
            >
              Pusat kurasi media pembelajaran interaktif, game edukasi, dan alat bantu kelas hasil program{" "}
              <strong className="text-[#F2B84B]">
                Kelas Digitalisasi Gugus 2 — Hulu Sungai Utara (Sekolah Penerima BOS Kinerja Terbaik 2026)
              </strong>
              , dikembangkan terbuka untuk seluruh guru Indonesia.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-xl border border-white/20"
            >
              <div className="flex items-center gap-3 px-3.5 py-2 w-full text-[#20252D]">
                <Search className="w-5 h-5 text-[#167D78] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setActiveTab("jelajah");
                  }}
                  placeholder="Cari game, pembagi kelompok, modul, atau nama guru..."
                  className="w-full text-sm font-medium focus:outline-none bg-transparent"
                />
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("jelajah")}
                className="w-full sm:w-auto shrink-0 bg-[#167D78] hover:bg-[#14213D] text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-md"
              >
                Cari
              </button>
            </motion.div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-white/60 font-semibold mr-1">Jenjang:</span>
              {EDUCATION_LEVELS.map((lvl, idx) => (
                <motion.button
                  key={lvl.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.06 }}
                  whileHover={{ scale: 1.07, y: -2 }}
                  onClick={() => {
                    setSelectedLevel(lvl.id);
                    setActiveTab("jelajah");
                  }}
                  className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-[#F2B84B] hover:text-[#14213D] transition-colors"
                >
                  {lvl.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* VISUAL BANNER DARI GOOGLE DRIVE & STATISTIK */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -6 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Gambar Dokumentasi / Visual Utama dari Google Drive */}
              <div className="relative w-full bg-gradient-to-b from-white via-[#FCFBF7] to-amber-50/20 p-5 sm:p-7 flex items-center justify-center border-b border-white/20">
                <img
                  src={BAKARYA_DEFAULT_THUMBNAIL_URL}
                  alt="Logo & Maskot BAKARYA Gugus 2 HSU"
                  className="w-full h-auto max-h-64 object-contain rounded-2xl drop-shadow-sm transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80";
                  }}
                />
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#14213D] px-3.5 py-1.5 rounded-full border border-slate-200/40 shadow-lg">
                  <img
                    src={BAKARYA_LOGO_URL}
                    alt="Logo"
                    className="w-4 h-4 object-contain rounded-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="text-[11px] font-extrabold text-[#F2B84B] tracking-wide">
                    Gugus 2 HSU • Kalsel
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#F2B84B] font-extrabold block">
                    Ekosistem Pendidikan Banua
                  </span>
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-white mt-0.5">
                    Ringkasan Portal BAKARYA
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <div className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                      {works.filter((w) => w.status === "published" && !w.isDeleted).length}
                    </div>
                    <div className="text-xs text-white/75 font-semibold mt-1">Karya Terbit</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#F2B84B]">
                      {
                        usersList.filter(
                          (u) => !u.isDeleted && u.role === "contributor" && u.accountStatus === "active"
                        ).length
                      }
                    </div>
                    <div className="text-xs text-white/75 font-semibold mt-1">Guru Kontributor</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-white/85">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F2B84B] shrink-0" />
                    <span>Game, Media, Video & Alat Bantu Kelas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F2B84B] shrink-0" />
                    <span>Mendukung Thumbnail Otomatis dari Google Drive</span>
                  </div>
                </div>

                {role === "public" && (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenAuthModal("register")}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#F2B84B] hover:bg-white text-[#14213D] font-extrabold text-xs transition-all text-center shadow-md"
                    >
                      Daftar Akun
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenAuthModal("login")}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all text-center border border-white/15"
                    >
                      Masuk
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEKSI STATISTIK KUNJUNGAN & DAMPAK PEMANFAATAN DIGITAL */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold tracking-wide uppercase shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Statistik Kunjungan Real-Time (WITA)</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14213D] mt-2">
              Dampak & Kunjungan Portal Pembelajaran
            </h2>
            <p className="text-xs sm:text-sm text-[#727782] max-w-2xl mt-1 leading-relaxed">
              Transparansi pantauan interaksi nyata para pendidik, peserta didik, dan pegiat literasi terhadap media pembelajaran digital kreasi guru Gugus 2 Kabupaten Hulu Sungai Utara.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("analitik")}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-white hover:bg-[#14213D] text-[#14213D] hover:text-white border border-[#14213D]/15 font-bold text-xs flex items-center gap-2 transition-all shadow-xs shrink-0"
          >
            <Activity className="w-4 h-4 text-[#167D78]" />
            <span>Lihat Analisis Lengkap</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Kartu Metrik Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Kunjungan Portal */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-[#14213D] to-[#1E2D4A] text-white p-5 rounded-3xl shadow-md border border-white/10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-[#F2B84B]">
                <Users className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F2B84B]/20 text-[#F2B84B] border border-[#F2B84B]/30 uppercase">
                Live Traffic
              </span>
            </div>
            <div className="mt-4">
              <div className="font-display text-3xl font-extrabold text-white tracking-tight">
                {totalVisits.toLocaleString("id-ID")}
              </div>
              <div className="text-xs font-bold text-white/90 mt-0.5">Total Kunjungan Portal</div>
              <div className="text-[11px] text-white/60 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{todayStats.visits} sesi aktif hari ini</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Tayangan Karya Pembelajaran */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-[#167D78] to-[#11625E] text-white p-5 rounded-3xl shadow-md border border-white/10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-white">
                <Eye className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase">
                Eksplorasi
              </span>
            </div>
            <div className="mt-4">
              <div className="font-display text-3xl font-extrabold text-white tracking-tight">
                {totalViews.toLocaleString("id-ID")}
              </div>
              <div className="text-xs font-bold text-white/90 mt-0.5">Tayangan Karya & Modul</div>
              <div className="text-[11px] text-white/70 mt-1">
                Terkurasi & dipelajari pendidik
              </div>
            </div>
          </motion.div>

          {/* Card 3: Pemanfaatan Praktik Kelas */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md border border-[#14213D]/10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 text-[#F2B84B]" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 uppercase">
                Praktik Kelas
              </span>
            </div>
            <div className="mt-4">
              <div className="font-display text-3xl font-extrabold text-[#14213D] tracking-tight">
                {totalClicks.toLocaleString("id-ID")}
              </div>
              <div className="text-xs font-bold text-[#14213D] mt-0.5">Interaksi Buka Media</div>
              <div className="text-[11px] text-[#727782] mt-1">
                Game, simulasi & tur interaktif
              </div>
            </div>
          </motion.div>

          {/* Card 4: Ekosistem Sekolah & Guru */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md border border-[#14213D]/10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-[#F8F7F2] text-[#167D78] flex items-center justify-center">
                <School className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 uppercase">
                Gugus 2 HSU
              </span>
            </div>
            <div className="mt-4">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#167D78] tracking-tight">
                {publishedWorks.length} <span className="text-base font-bold text-[#14213D]">Karya</span>
              </div>
              <div className="text-xs font-bold text-[#14213D] mt-0.5">
                {activeContributors.length} Guru Kontributor
              </div>
              <div className="text-[11px] text-[#727782] mt-1">
                {uniqueInstitutions} Sekolah terhubung di HSU
              </div>
            </div>
          </motion.div>
        </div>

        {/* Grafik Tren Kunjungan Harian & Detail Pemanfaatan */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#14213D]/10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Grafik Recharts 7 Hari Terakhir */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#14213D]/10 pb-3">
              <div>
                <h3 className="font-display font-extrabold text-[#14213D] text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#167D78]" />
                  <span>Tren Kunjungan Harian (7 Hari Terakhir)</span>
                </h3>
                <span className="text-xs text-[#727782]">
                  Perbandingan sesi kunjungan portal vs jumlah tayangan halaman
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-[#167D78]">
                  <span className="w-3 h-3 rounded-full bg-[#167D78]" />
                  <span>Kunjungan</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#F2B84B]">
                  <span className="w-3 h-3 rounded-full bg-[#F2B84B]" />
                  <span>Tayangan</span>
                </div>
              </div>
            </div>

            <div className="h-56 sm:h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="dateKey"
                    tick={{ fill: "#727782", fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#727782", fontSize: 11 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#14213D",
                      borderRadius: "1rem",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                      padding: "10px 14px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    }}
                    formatter={(val: any, name: string) => [
                      `${val} ${name === "visits" ? "Pengunjung" : "Tayangan"}`,
                      name === "visits" ? "Sesi Kunjungan" : "Tayangan Karya",
                    ]}
                    labelStyle={{ color: "#F2B84B", fontWeight: 700 }}
                  />
                  <Bar dataKey="visits" name="visits" fill="#167D78" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="pageViews" name="pageViews" fill="#F2B84B" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Kolom Informasi & Aksi Cepat */}
          <div className="lg:col-span-4 bg-[#F8F7F2] p-5 sm:p-6 rounded-2xl border border-[#14213D]/10 space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#167D78]">
                Kurasi Kinerja BOS 2026
              </span>
              <h4 className="font-display font-extrabold text-[#14213D] text-base mt-0.5">
                Karya Pilihan Terbanyak Digunakan
              </h4>
            </div>

            <p className="text-xs text-[#727782] leading-relaxed">
              Media pembelajaran digital karya pendidik HSU telah dimanfaatkan secara luas untuk penguatan literasi dan numerasi berbasis kearifan lokal Kalimantan Selatan.
            </p>

            <div className="space-y-2 pt-1 border-t border-[#14213D]/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#727782]">Status Cloud Database:</span>
                <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Online & Terhubung
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#727782]">Zona Waktu Pelaporan:</span>
                <span className="font-bold text-[#14213D]">WITA (UTC+8)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#727782]">Akses Publik:</span>
                <span className="font-bold text-[#167D78]">Terbuka untuk Umum</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("jelajah")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#14213D] hover:bg-[#167D78] text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Jelajahi Seluruh Karya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">
              Ragam Format Inovasi
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14213D] mt-1">
              Jenis Media & Alat Bantu Kelas
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("jelajah")}
            className="text-sm font-bold text-[#167D78] hover:text-[#14213D] flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mediaTypesList.map((media) => {
            const IconComponent = media.icon || Layers;
            const count = works.filter(
              (w) => w.status === "published" && !w.isDeleted && w.mediaTypeId === media.id
            ).length;
            return (
              <motion.button
                key={media.id}
                whileHover={{ y: -5, scale: 1.01 }}
                onClick={() => {
                  resetAllFilters();
                  setSelectedMediaType(media.id);
                  setActiveTab("jelajah");
                }}
                className="bg-white p-6 rounded-3xl border border-[#14213D]/10 shadow-sm hover:shadow-xl hover:border-[#167D78] transition-all text-left flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4 w-full">
                  <div className="w-14 h-14 rounded-2xl bg-[#F8F7F2] group-hover:bg-[#167D78] text-[#14213D] group-hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-sm">
                    <IconComponent className="w-7 h-7" />
                  </div>

                  <div className="text-right">
                    <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#167D78] group-hover:text-[#14213D] leading-none transition-colors">
                      {count}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#727782] block mt-1">
                      Karya Terbit
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#14213D]/5 flex items-end justify-between gap-2 w-full">
                  <div>
                    <h3 className="font-display font-extrabold text-[#14213D] text-lg group-hover:text-[#167D78] transition-colors">
                      {media.name}
                    </h3>
                    <p className="text-xs text-[#727782] mt-1 leading-relaxed">{media.description}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[#727782] group-hover:text-[#167D78] shrink-0 transition-colors" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* KARYA UNGGULAN & TERBARU */}
      {(() => {
        const myWorks = works.filter(
          (w) => !w.isDeleted && currentUserProfile?.uid && w.contributorId === currentUserProfile.uid
        );
        const myPendingOrDraftWorks = myWorks.filter((w) => w.status !== "published");

        const targetWorks = activeWorkFilter === "mine" ? myWorks : filteredPublicWorks;
        const ITEMS_PER_PAGE = 6;
        const totalPages = Math.ceil(targetWorks.length / ITEMS_PER_PAGE) || 1;
        const safePage = Math.min(Math.max(homePage, 1), totalPages);
        const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, targetWorks.length);
        const currentWorks = showAllInHome ? targetWorks : targetWorks.slice(startIndex, endIndex);

        return (
          <section id="section-karya-pilihan" className="space-y-6 pt-2">
            {/* Banner Pemberitahuan jika pengguna memiliki karya yang sedang di antrean/draf */}
            {role !== "public" && myPendingOrDraftWorks.length > 0 && (
              <div className="bg-gradient-to-r from-amber-500/10 via-[#F2B84B]/15 to-amber-500/10 border border-[#F2B84B]/30 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#F2B84B]/20 text-amber-800 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#14213D]">
                      Anda memiliki {myPendingOrDraftWorks.length} karya dalam status Kurasi / Draf:
                      <span className="font-extrabold text-[#167D78]"> &ldquo;{myPendingOrDraftWorks[0].title}&rdquo;</span>
                      {myPendingOrDraftWorks.length > 1 && ` dan ${myPendingOrDraftWorks.length - 1} lainnya.`}
                    </p>
                    <p className="text-[11px] text-[#727782] mt-0.5">
                      {role === "admin" || role === "superAdmin"
                        ? "Sebagai Admin / Super Admin, Anda dapat memoderasi atau menerbitkannya langsung di Dashboard."
                        : "Karya Anda tersimpan aman dan sedang ditinjau kurator. Anda dapat melihatnya di tab 'Karya Saya' atau Dashboard."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveWorkFilter("mine");
                      setHomePage(1);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      activeWorkFilter === "mine"
                        ? "bg-[#14213D] text-white"
                        : "bg-white text-[#14213D] hover:bg-[#F8F7F2] border border-[#14213D]/10"
                    }`}
                  >
                    Lihat Karya Saya
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("dashboard")}
                    className="px-4 py-2 rounded-xl bg-[#167D78] hover:bg-[#14213D] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>Buka Dashboard</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Header Section Karya Pilihan */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">
                  Karya Pilihan Banua
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14213D] mt-1">
                  Karya Terbaru & Terpopuler
                </h2>
              </div>

              {/* Kontrol Tab Filter & Urutan */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Tab Karya Publik vs Karya Saya */}
                {role !== "public" && (
                  <div className="flex items-center gap-1 bg-[#14213D]/5 p-1 rounded-xl border border-[#14213D]/10">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveWorkFilter("all");
                        setHomePage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeWorkFilter === "all"
                          ? "bg-[#14213D] text-white shadow-sm"
                          : "text-[#727782] hover:text-[#14213D]"
                      }`}
                    >
                      Semua Terbit ({filteredPublicWorks.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveWorkFilter("mine");
                        setHomePage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeWorkFilter === "mine"
                          ? "bg-[#167D78] text-white shadow-sm"
                          : "text-[#727782] hover:text-[#167D78]"
                      }`}
                    >
                      Karya Saya ({myWorks.length})
                    </button>
                  </div>
                )}

                {/* Tombol Urutan Terbaru / Populer */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#14213D]/10 shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("newest");
                      setHomePage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      sortBy === "newest"
                        ? "bg-[#14213D] text-white shadow-sm"
                        : "text-[#727782] hover:text-[#14213D]"
                    }`}
                  >
                    Terbaru
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("popular");
                      setHomePage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      sortBy === "popular"
                        ? "bg-[#14213D] text-white shadow-sm"
                        : "text-[#727782] hover:text-[#14213D]"
                    }`}
                  >
                    Populer
                  </button>
                </div>

                {/* Tombol Cepat Unggah Karya jika login */}
                {role !== "public" && onOpenUploadModal && (
                  <button
                    type="button"
                    onClick={onOpenUploadModal}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F2B84B] hover:bg-[#e0a83b] text-[#14213D] text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Unggah Karya</span>
                  </button>
                )}
              </div>
            </div>

            {/* Konten Daftar Karya */}
            {targetWorks.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-[#14213D]/10 shadow-sm max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                  <Sparkles className="w-8 h-8 text-[#F2B84B]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-[#14213D] text-lg sm:text-xl">
                    {activeWorkFilter === "mine"
                      ? "Anda Belum Mengunggah Karya"
                      : "Belum Ada Karya yang Diterbitkan"}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#727782] max-w-md mx-auto leading-relaxed">
                    {activeWorkFilter === "mine"
                      ? "Mulai bagikan media pembelajaran digital inovatif Anda sekarang untuk menginspirasi rekan pendidik di Gugus 2 HSU!"
                      : "Database Cloud Firestore dalam keadaan bersih. Guru dan Admin dapat masuk untuk mengunggah inovasi media pembelajaran interaktif!"}
                  </p>
                </div>
                {role === "public" ? (
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal("login")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#14213D] hover:bg-[#167D78] text-white text-xs font-bold shadow-md transition-all"
                  >
                    Masuk / Unggah Karya
                  </button>
                ) : onOpenUploadModal ? (
                  <button
                    type="button"
                    onClick={onOpenUploadModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#167D78] hover:bg-[#14213D] text-white text-xs font-bold shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Unggah Karya Baru</span>
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Grid Kartu Karya */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentWorks.map((work) => (
                    <WorkCard
                      key={work.id}
                      work={work}
                      mediaTypesList={mediaTypesList}
                      onSelect={() => onOpenWorkDetail(work)}
                      onShare={onShareWork}
                      onSelectContributor={(contribId) => {
                        const found = usersList.find((c) => c.uid === contribId);
                        if (found) onSelectContributor(found);
                      }}
                    />
                  ))}
                </div>

                {/* Tombol Navigasi Karya Selanjutnya, Pagination & Lihat Seluruh Karya */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#14213D]/10">
                  <div className="text-xs text-[#727782] font-medium text-center sm:text-left">
                    Menampilkan{" "}
                    <strong className="text-[#14213D]">
                      {startIndex + 1} - {endIndex}
                    </strong>{" "}
                    dari <strong className="text-[#14213D]">{targetWorks.length}</strong> karya{" "}
                    {activeWorkFilter === "mine" ? "milik Anda" : "pilihan"}
                  </div>

                  {/* Navigasi Paginasi Halaman */}
                  {targetWorks.length > ITEMS_PER_PAGE && !showAllInHome && (
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#14213D]/10 shadow-sm">
                      <button
                        type="button"
                        disabled={safePage <= 1}
                        onClick={() => {
                          setHomePage((p) => Math.max(p - 1, 1));
                          const el = document.getElementById("section-karya-pilihan");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          safePage <= 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-[#14213D] hover:bg-[#F8F7F2] active:scale-95"
                        }`}
                        title="Karya Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Sebelumnya</span>
                      </button>

                      {/* Angka Halaman */}
                      <div className="flex items-center gap-1 px-1">
                        {Array.from({ length: totalPages }).map((_, idx) => {
                          const pageNum = idx + 1;
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => {
                                setHomePage(pageNum);
                                const el = document.getElementById("section-karya-pilihan");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                              }}
                              className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all ${
                                safePage === pageNum
                                  ? "bg-[#14213D] text-white shadow-sm"
                                  : "text-[#727782] hover:bg-[#F8F7F2] hover:text-[#14213D]"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        disabled={safePage >= totalPages}
                        onClick={() => {
                          setHomePage((p) => Math.min(p + 1, totalPages));
                          const el = document.getElementById("section-karya-pilihan");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          safePage >= totalPages
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-[#14213D] hover:bg-[#F8F7F2] active:scale-95"
                        }`}
                        title="Karya Selanjutnya"
                      >
                        <span className="hidden sm:inline">Selanjutnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Tombol Aksi: Lihat Seluruh Karya */}
                  <div className="flex items-center gap-2">
                    {targetWorks.length > ITEMS_PER_PAGE && (
                      <button
                        type="button"
                        onClick={() => setShowAllInHome(!showAllInHome)}
                        className="px-3.5 py-2.5 rounded-xl border border-[#14213D]/15 text-xs font-bold text-[#727782] hover:text-[#14213D] hover:bg-white transition-colors"
                      >
                        {showAllInHome ? "Tampilkan Per Halaman (6)" : "Buka Semua di Beranda"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        resetAllFilters();
                        setActiveTab("jelajah");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#167D78] hover:bg-[#14213D] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Lihat Seluruh Karya ({filteredPublicWorks.length})</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      })()}
    </motion.div>
  );
}
