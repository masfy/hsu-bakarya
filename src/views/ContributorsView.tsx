import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { UserAccount, Work } from "../types";
import { getDriveDirectImageUrl } from "../utils/drive";

interface ContributorsViewProps {
  usersList: UserAccount[];
  works: Work[];
  resetAllFilters: () => void;
  setSelectedContributorFilter: (uid: string) => void;
  setActiveTab: (tab: string) => void;
}

export function ContributorsView({
  usersList,
  works,
  resetAllFilters,
  setSelectedContributorFilter,
  setActiveTab,
}: ContributorsViewProps) {
  const activeContributors = usersList.filter(
    (c) => !c.isDeleted && c.accountStatus === "active" && c.publicProfileEnabled
  );

  return (
    <motion.div
      key="kontributor"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8"
    >
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#14213D]/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">
            Pendidik & Kreator Banua
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14213D] mt-1">
            Profil Publik Kontributor BAKARYA
          </h1>
          <p className="text-xs sm:text-sm text-[#727782] mt-1">
            Sesuai kebijakan privasi PRD, alamat email pribadi kontributor tidak ditampilkan secara publik demi menjaga keamanan privasi guru.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeContributors.map((contrib) => {
          const contribWorks = works.filter(
            (w) => w.contributorId === contrib.uid && w.status === "published" && !w.isDeleted
          );
          const totalViews = contribWorks.reduce((acc, w) => acc + w.viewCount, 0);

          return (
            <motion.div
              key={contrib.uid}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl border border-[#14213D]/10 p-6 shadow-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={getDriveDirectImageUrl(contrib.avatar, "w300") || contrib.avatar}
                    alt={contrib.displayName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#F2B84B] shadow-sm shrink-0 bg-white"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://placehold.co/150x150/14213D/F2B84B?text=Guru";
                    }}
                  />
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-[#14213D]">
                      {contrib.displayName}
                    </h3>
                    <p className="text-xs font-bold text-[#167D78]">{contrib.institution}</p>
                    <p className="text-[11px] text-[#727782] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#F2B84B]" />
                      <span>{contrib.district}</span>
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#20252D] leading-relaxed">{contrib.bio}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#14213D]/10">
                <div className="grid grid-cols-2 gap-2 text-center bg-[#F8F7F2] p-3 rounded-2xl">
                  <div>
                    <div className="font-display font-extrabold text-base text-[#14213D]">
                      {contribWorks.length}
                    </div>
                    <div className="text-[11px] text-[#727782] font-semibold">Karya Terbit</div>
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-base text-[#167D78]">
                      {totalViews}
                    </div>
                    <div className="text-[11px] text-[#727782] font-semibold">Total Kunjungan</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    resetAllFilters();
                    setSelectedContributorFilter(contrib.uid);
                    setActiveTab("jelajah");
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#14213D] hover:bg-[#167D78] text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Lihat Karya {contrib.displayName.split(",")[0]}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
