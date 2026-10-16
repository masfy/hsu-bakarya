import React from "react";
import { motion } from "framer-motion";
import { Search, Filter, RotateCcw } from "lucide-react";
import {
  Work,
  UserAccount,
  Subject,
  Category,
  MediaType,
} from "../types";
import { WorkCard } from "../components/cards/WorkCard";
import { EDUCATION_LEVELS, CLASSES_DATA } from "../data/initialData";

interface ExploreViewProps {
  filteredPublicWorks: Work[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedLevel: string;
  setSelectedLevel: (lvl: string) => void;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  selectedSubject: string;
  setSelectedSubject: (sub: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedMediaType: string;
  setSelectedMediaType: (m: string) => void;
  selectedContributorFilter: string;
  setSelectedContributorFilter: (c: string) => void;
  subjectsList: Subject[];
  categoriesList: Category[];
  mediaTypesList: MediaType[];
  usersList: UserAccount[];
  resetAllFilters: () => void;
  onOpenWorkDetail: (w: Work) => void;
  onShareWork: (w: Work) => void;
  onSelectContributor: (c: UserAccount) => void;
}

export function ExploreView({
  filteredPublicWorks,
  searchQuery,
  setSearchQuery,
  selectedLevel,
  setSelectedLevel,
  selectedClass,
  setSelectedClass,
  selectedSubject,
  setSelectedSubject,
  selectedCategory,
  setSelectedCategory,
  selectedMediaType,
  setSelectedMediaType,
  selectedContributorFilter,
  setSelectedContributorFilter,
  subjectsList,
  categoriesList,
  mediaTypesList,
  usersList,
  resetAllFilters,
  onOpenWorkDetail,
  onShareWork,
  onSelectContributor,
}: ExploreViewProps) {
  return (
    <motion.div
      key="jelajah"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8"
    >
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#14213D]/10 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">
              Direktori Terkurasi
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14213D] mt-0.5">
              Eksplorasi Karya Pembelajaran
            </h1>
          </div>

          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-[#167D78] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul karya, topik, atau nama guru..."
              className="w-full pl-11 pr-4 py-3 bg-[#F8F7F2] border border-[#14213D]/15 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#167D78]"
            />
          </div>
        </div>

        {/* 6-Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-[#14213D]/10">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#727782] mb-1.5">
              1. Jenjang Pendidikan
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#14213D] outline-none focus:border-[#167D78]"
            >
              <option value="all">Semua Jenjang</option>
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#727782] mb-1.5">
              2. Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#14213D] outline-none focus:border-[#167D78]"
            >
              <option value="all">Semua Kelas</option>
              {CLASSES_DATA.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#727782] mb-1.5">
              3. Mata Pelajaran
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#14213D] outline-none focus:border-[#167D78]"
            >
              <option value="all">Semua Mapel</option>
              {subjectsList.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#727782] mb-1.5">
              4. Kategori Karya
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#14213D] outline-none focus:border-[#167D78]"
            >
              <option value="all">Semua Kategori</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#727782] mb-1.5">
              5. Jenis Media
            </label>
            <select
              value={selectedMediaType}
              onChange={(e) => setSelectedMediaType(e.target.value)}
              className="w-full bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#14213D] outline-none focus:border-[#167D78]"
            >
              <option value="all">Semua Media</option>
              {mediaTypesList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#727782] mb-1.5">
              6. Kontributor
            </label>
            <select
              value={selectedContributorFilter}
              onChange={(e) => setSelectedContributorFilter(e.target.value)}
              className="w-full bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#14213D] outline-none focus:border-[#167D78]"
            >
              <option value="all">Semua Kontributor</option>
              {usersList
                .filter((c) => !c.isDeleted && c.role === "contributor")
                .map((c) => (
                  <option key={c.uid} value={c.uid}>
                    {c.displayName}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-[#727782]">
          <span>
            Menampilkan <strong>{filteredPublicWorks.length}</strong> karya aktif.
          </span>
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-[#167D78] hover:text-[#14213D] hover:underline font-bold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>
      </div>

      {filteredPublicWorks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#14213D]/10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F8F7F2] text-[#727782] flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-extrabold text-[#14213D]">
            Tidak Ada Karya yang Sesuai Filter
          </h3>
          <p className="text-xs text-[#727782] max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau bersihkan filter untuk menampilkan seluruh karya.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-5 py-2.5 rounded-xl bg-[#14213D] hover:bg-[#167D78] text-white text-xs font-bold transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPublicWorks.map((work) => (
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
      )}
    </motion.div>
  );
}
