import React, { useState } from "react";
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
import { DailyAnalytics, MonthlyAnalytics } from "../types";

interface AnalyticsViewProps {
  dailyStats: DailyAnalytics[];
  monthlyStats: MonthlyAnalytics[];
}

export function AnalyticsView({ dailyStats, monthlyStats }: AnalyticsViewProps) {
  const [analyticsRange, setAnalyticsRange] = useState<"daily" | "monthly">("daily");

  const latestDaily = dailyStats[dailyStats.length - 1] || {
    visits: 0,
    pageViews: 0,
    uniqueVisitorsEstimate: 0,
    outboundClicks: 0,
  };

  const totalVisits = monthlyStats.reduce((acc, m) => acc + m.visits, 0) + 1200;

  return (
    <motion.div
      key="analitik"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8"
    >
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#14213D]/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">
              Analitik Transparan
            </span>
            <span className="text-[11px] bg-[#F2B84B]/25 text-[#14213D] font-extrabold px-2.5 py-0.5 rounded-full">
              Zona Waktu: Asia/Makassar (WITA)
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14213D] mt-1">
            Statistik Kunjungan & Interaksi Karya
          </h1>
        </div>

        <div className="flex items-center gap-1.5 bg-[#F8F7F2] p-1.5 rounded-2xl border border-[#14213D]/10 self-start">
          <button
            type="button"
            onClick={() => setAnalyticsRange("daily")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              analyticsRange === "daily" ? "bg-[#14213D] text-white shadow-sm" : "text-[#727782]"
            }`}
          >
            Harian
          </button>
          <button
            type="button"
            onClick={() => setAnalyticsRange("monthly")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              analyticsRange === "monthly" ? "bg-[#14213D] text-white shadow-sm" : "text-[#727782]"
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10 shadow-sm">
          <span className="text-[11px] font-extrabold text-[#727782] uppercase">Kunjungan Hari Ini</span>
          <div className="font-display text-3xl font-extrabold text-[#14213D] mt-2">
            {latestDaily.visits}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10 shadow-sm">
          <span className="text-[11px] font-extrabold text-[#727782] uppercase">Kunjungan Bulan Ini</span>
          <div className="font-display text-3xl font-extrabold text-[#167D78] mt-2">1.845</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10 shadow-sm">
          <span className="text-[11px] font-extrabold text-[#727782] uppercase">Total Kunjungan</span>
          <div className="font-display text-3xl font-extrabold text-[#14213D] mt-2">
            {totalVisits.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10 shadow-sm">
          <span className="text-[11px] font-extrabold text-[#727782] uppercase">Tampilan Halaman</span>
          <div className="font-display text-3xl font-extrabold text-[#F2B84B] mt-2">
            {latestDaily.pageViews}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10 shadow-sm">
          <span className="text-[11px] font-extrabold text-[#727782] uppercase">Pengunjung Unik</span>
          <div className="font-display text-3xl font-extrabold text-[#167D78] mt-2">
            {latestDaily.uniqueVisitorsEstimate}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#14213D]/10 space-y-4 shadow-sm">
          <h3 className="font-display text-base font-extrabold text-[#14213D]">
            Grafik Kunjungan Harian (7 Hari Terakhir)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="dateKey" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="visits"
                  name="Kunjungan"
                  stroke="#167D78"
                  strokeWidth={3}
                  fill="#167D78"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#14213D]/10 space-y-4 shadow-sm">
          <h3 className="font-display text-base font-extrabold text-[#14213D]">
            Grafik Kunjungan Bulanan (Tahun 2026)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="monthKey" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="visits" name="Kunjungan" fill="#14213D" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
