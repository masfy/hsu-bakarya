import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Eye,
  MousePointerClick,
  BookOpen,
  Users,
  Trophy,
  TrendingUp,
  Sparkles,
  School,
  Layers,
  ExternalLink,
} from "lucide-react";
import {
  Work,
  UserAccount,
  Category,
  Subject,
  MediaType,
  DailyAnalytics,
  MonthlyAnalytics,
} from "../types";
import { getDriveDirectImageUrl, BAKARYA_DEFAULT_THUMBNAIL_URL } from "../utils/drive";

interface AnalyticsViewProps {
  works: Work[];
  usersList: UserAccount[];
  categoriesList?: Category[];
  subjectsList?: Subject[];
  mediaTypesList?: MediaType[];
  dailyStats?: DailyAnalytics[];
  monthlyStats?: MonthlyAnalytics[];
  onOpenWorkDetail?: (w: Work) => void;
}

export function AnalyticsView({
  works,
  usersList,
  categoriesList = [],
  subjectsList = [],
  mediaTypesList = [],
  dailyStats = [],
  onOpenWorkDetail,
}: AnalyticsViewProps) {
  const [chartMetric, setChartMetric] = useState<"views" | "clicks">("views");

  // Filter karya aktif
  const activeWorks = useMemo(
    () => works.filter((w) => !w.isDeleted && w.status === "published"),
    [works]
  );

  const allActiveWorks = useMemo(
    () => works.filter((w) => !w.isDeleted),
    [works]
  );

  // Metrik Nyata Real-Time
  const totalViews = useMemo(
    () => allActiveWorks.reduce((acc, w) => acc + (w.viewCount || 0), 0),
    [allActiveWorks]
  );

  const totalClicks = useMemo(
    () => allActiveWorks.reduce((acc, w) => acc + (w.outboundClickCount || 0), 0),
    [allActiveWorks]
  );

  const activeContributors = useMemo(
    () => usersList.filter((u) => !u.isDeleted && u.accountStatus === "active"),
    [usersList]
  );

  const publishedCount = activeWorks.length;
  const pendingCount = allActiveWorks.filter((w) => w.status === "pending_review").length;

  // Hitung sebaran per jenjang
  const levelData = useMemo(() => {
    const levels = [
      { id: "paud", name: "PAUD / TK" },
      { id: "sd", name: "SD / MI" },
      { id: "smp", name: "SMP / MTs" },
      { id: "sma", name: "SMA / SMK" },
      { id: "slb", name: "SLB Khusus" },
    ];
    return levels.map((lvl) => ({
      name: lvl.name,
      karya: activeWorks.filter((w) => w.educationLevelIds.includes(lvl.id)).length,
      views: activeWorks
        .filter((w) => w.educationLevelIds.includes(lvl.id))
        .reduce((sum, w) => sum + (w.viewCount || 0), 0),
    }));
  }, [activeWorks]);

  // Hitung sebaran per kategori
  const categoryData = useMemo(() => {
    return categoriesList
      .map((cat) => {
        const catWorks = activeWorks.filter((w) => w.categoryIds.includes(cat.id));
        return {
          name: cat.name.length > 18 ? cat.name.slice(0, 18) + "..." : cat.name,
          fullName: cat.name,
          karya: catWorks.length,
          klik: catWorks.reduce((sum, w) => sum + (w.outboundClickCount || 0), 0),
        };
      })
      .filter((c) => c.karya > 0 || c.klik > 0);
  }, [categoriesList, activeWorks]);

  // Top 5 Karya Paling Interaktif
  const topWorks = useMemo(() => {
    return [...activeWorks]
      .sort((a, b) => b.outboundClickCount * 2 + b.viewCount - (a.outboundClickCount * 2 + a.viewCount))
      .slice(0, 5);
  }, [activeWorks]);

  // Distribusi Aktivitas 7 Hari Terakhir dari data harian nyata (Real Data)
  const dynamicWeeklyData = useMemo(() => {
    if (dailyStats && dailyStats.length > 0) {
      return dailyStats.slice(-7).map((d) => ({
        hari: d.dateKey,
        kunjungan: d.visits || d.pageViews || 0,
        klikMedia: d.outboundClicks || 0,
      }));
    }
    return [];
  }, [dailyStats]);

  return (
    <motion.div
      key="analitik"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8"
    >
      {/* Header Banner */}
      <div className="bg-[#14213D] text-white p-6 sm:p-8 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl border border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-[#F2B84B]">
              Data Aktual Cloud Firestore
            </span>
            <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Live Real-Time
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold mt-2">
            Statistik & Analitik Pembelajaran Digital
          </h1>
          <p className="text-xs sm:text-sm text-white/75 mt-1 max-w-2xl">
            Capaian transparansi pemanfaatan repositori digital karya Guru Banua Kalimantan Selatan bersama Mitra BPMP Provinsi Kalimantan Selatan.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10 self-start">
          <button
            type="button"
            onClick={() => setChartMetric("views")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              chartMetric === "views" ? "bg-[#167D78] text-white shadow-md" : "text-white/75 hover:text-white"
            }`}
          >
            Kunjungan Karya
          </button>
          <button
            type="button"
            onClick={() => setChartMetric("clicks")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              chartMetric === "clicks" ? "bg-[#F2B84B] text-[#14213D] shadow-md" : "text-white/75 hover:text-white"
            }`}
          >
            Akses Link Media
          </button>
        </div>
      </div>

      {/* KPI Stats Cards — 100% dari Data Nyata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-[#14213D]/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#727782] uppercase tracking-wider">
              Karya Terpublikasi
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display text-3xl font-extrabold text-[#14213D] mt-3">
            {publishedCount}
          </div>
          <div className="mt-2 text-xs text-[#727782] flex items-center gap-1.5">
            <span className="text-emerald-700 font-bold">Aktif Tayang</span>
            {pendingCount > 0 && <span>• {pendingCount} dalam kurasi</span>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#14213D]/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#727782] uppercase tracking-wider">
              Total Dilihat / Tayangan
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#167D78] flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display text-3xl font-extrabold text-[#167D78] mt-3">
            {totalViews.toLocaleString("id-ID")}
          </div>
          <div className="mt-2 text-xs text-[#727782]">
            Interaksi detail karya oleh publik & siswa
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#14213D]/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#727782] uppercase tracking-wider">
              Total Akses Link Media
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F2B84B] flex items-center justify-center">
              <MousePointerClick className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="font-display text-3xl font-extrabold text-[#14213D] mt-3">
            {totalClicks.toLocaleString("id-ID")}
          </div>
          <div className="mt-2 text-xs text-[#727782]">
            Klik tautan langsung ke Drive / Canva / Web
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#14213D]/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#727782] uppercase tracking-wider">
              Pendidik Terdaftar
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display text-3xl font-extrabold text-indigo-900 mt-3">
            {activeContributors.length}
          </div>
          <div className="mt-2 text-xs text-[#727782]">
            Guru dan kurator aktif se-Kalimantan Selatan
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Chart */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#14213D]/10 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-extrabold text-[#14213D] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#167D78]" />
                <span>Tren Aktivitas 7 Hari Terakhir</span>
              </h3>
              <p className="text-xs text-[#727782]">
                {chartMetric === "views" ? "Jumlah tayangan karya per hari" : "Jumlah klik tautan media per hari"}
              </p>
            </div>
            <span className="text-xs font-bold text-[#167D78] bg-[#167D78]/10 px-2.5 py-1 rounded-xl">
              {chartMetric === "views" ? `${totalViews} Tayang` : `${totalClicks} Klik`}
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicWeeklyData}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={chartMetric === "views" ? "#167D78" : "#F2B84B"}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor={chartMetric === "views" ? "#167D78" : "#F2B84B"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="hari" tick={{ fontSize: 12, fill: "#727782" }} />
                <YAxis tick={{ fontSize: 11, fill: "#727782" }} />
                <Tooltip
                  formatter={(value: any) => [
                    `${value} ${chartMetric === "views" ? "Tayangan" : "Klik"}`,
                    chartMetric === "views" ? "Kunjungan" : "Akses Media",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={chartMetric === "views" ? "kunjungan" : "klikMedia"}
                  stroke={chartMetric === "views" ? "#167D78" : "#F2B84B"}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Level Distribution Chart */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#14213D]/10 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-extrabold text-[#14213D] flex items-center gap-2">
                <School className="w-4 h-4 text-[#14213D]" />
                <span>Distribusi Karya Berdasarkan Jenjang</span>
              </h3>
              <p className="text-xs text-[#727782]">Jumlah karya yang siap pakai di tiap jenjang sekolah</p>
            </div>
            <span className="text-xs font-bold text-[#14213D] bg-[#F8F7F2] px-2.5 py-1 rounded-xl border">
              {publishedCount} Karya
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#727782" }} />
                <YAxis tick={{ fontSize: 11, fill: "#727782" }} />
                <Tooltip
                  formatter={(value: any) => [`${value} Karya`, "Jumlah Karya"]}
                />
                <Bar dataKey="karya" fill="#14213D" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown List */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#14213D]/10 space-y-4 shadow-sm">
          <h3 className="font-display text-base font-extrabold text-[#14213D] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#167D78]" />
            <span>Kategori Tematik Banua</span>
          </h3>
          <p className="text-xs text-[#727782]">Penyebaran karya berdasarkan topik kearifan lokal</p>

          <div className="space-y-3 pt-2">
            {categoryData.length === 0 ? (
              <p className="text-xs text-[#727782] text-center py-6">Belum ada karya terpublikasi.</p>
            ) : (
              categoryData.map((cat, i) => {
                const percent = publishedCount > 0 ? Math.round((cat.karya / publishedCount) * 100) : 0;
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#14213D] truncate" title={cat.fullName}>
                        {cat.fullName}
                      </span>
                      <span className="font-mono text-[#167D78] font-bold shrink-0">
                        {cat.karya} Karya ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#F8F7F2] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#167D78] to-[#F2B84B] rounded-full"
                        style={{ width: `${Math.max(percent, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top 5 Most Accessed Media (Leaderboard) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-[#14213D]/10 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-extrabold text-[#14213D] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Peringkat Karya Terpopuler</span>
              </h3>
              <p className="text-xs text-[#727782]">Karya dengan interaksi dan pemanfaatan tertinggi</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
              Top 5 Karya
            </span>
          </div>

          <div className="divide-y divide-[#14213D]/10 pt-1">
            {topWorks.length === 0 ? (
              <p className="text-xs text-[#727782] text-center py-8">Belum ada data karya terpublikasi.</p>
            ) : (
              topWorks.map((work, idx) => {
                const thumb = getDriveDirectImageUrl(work.thumbnailURL, "w200") || BAKARYA_DEFAULT_THUMBNAIL_URL;
                return (
                  <div
                    key={work.id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-[#F8F7F2]/60 px-2 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-display font-extrabold text-xs shrink-0 ${
                          idx === 0
                            ? "bg-amber-400 text-amber-950 shadow-sm"
                            : idx === 1
                            ? "bg-slate-300 text-slate-800"
                            : idx === 2
                            ? "bg-amber-700 text-white"
                            : "bg-[#F8F7F2] text-[#727782] border"
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <img
                        src={thumb}
                        alt={work.title}
                        className="w-12 h-12 rounded-xl object-cover border border-[#14213D]/10 bg-white shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = BAKARYA_DEFAULT_THUMBNAIL_URL;
                        }}
                      />

                      <div className="min-w-0">
                        <h4
                          onClick={() => onOpenWorkDetail && onOpenWorkDetail(work)}
                          className="font-display text-sm font-extrabold text-[#14213D] truncate cursor-pointer hover:text-[#167D78] transition-colors"
                          title={work.title}
                        >
                          {work.title}
                        </h4>
                        <p className="text-xs text-[#727782] truncate">
                          Oleh {work.contributorNameSnapshot} • {work.contributorInstitution}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold text-[#14213D] flex items-center justify-end gap-1">
                          <MousePointerClick className="w-3.5 h-3.5 text-amber-600" />
                          <span>{work.outboundClickCount} Klik</span>
                        </div>
                        <div className="text-[11px] text-[#727782] flex items-center justify-end gap-1">
                          <Eye className="w-3 h-3 text-[#167D78]" />
                          <span>{work.viewCount} Dilihat</span>
                        </div>
                      </div>

                      {onOpenWorkDetail && (
                        <button
                          type="button"
                          onClick={() => onOpenWorkDetail(work)}
                          className="p-2 rounded-xl bg-[#F8F7F2] hover:bg-[#14213D] text-[#14213D] hover:text-white transition-colors"
                          title="Lihat Detail Karya"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
