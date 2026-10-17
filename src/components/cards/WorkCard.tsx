import React from "react";
import { motion } from "framer-motion";
import { Eye, MousePointerClick, Share2 } from "lucide-react";
import { Work, MediaType } from "../../types";
import { getDriveDirectImageUrl, BAKARYA_DEFAULT_THUMBNAIL_URL } from "../../utils/drive";
import { CLASSES_DATA } from "../../data/initialData";

interface WorkCardProps {
  work: Work;
  mediaTypesList: MediaType[];
  onSelect: () => void;
  onShare?: (work: Work) => void;
  onSelectContributor?: (contributorId: string) => void;
}

export function WorkCard({
  work,
  mediaTypesList,
  onSelect,
  onShare,
  onSelectContributor,
}: WorkCardProps) {
  const mediaType = mediaTypesList.find((m) => m.id === work.mediaTypeId);
  const displayThumb = getDriveDirectImageUrl(work.thumbnailURL) || BAKARYA_DEFAULT_THUMBNAIL_URL;
  const isDefaultBanner = displayThumb === BAKARYA_DEFAULT_THUMBNAIL_URL;

  // Format label kelas singkat
  const classBadgeText = React.useMemo(() => {
    if (!work.classIds || work.classIds.length === 0) return null;
    const names = CLASSES_DATA.filter((c) => work.classIds.includes(c.id)).map((c) =>
      c.name.replace("Kelas ", "Kls ").replace("TK A / TK B", "PAUD/TK").replace("Lintas Kelas / Umum", "Umum")
    );
    if (names.length === 0) return null;
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
  }, [work.classIds]);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="bg-white rounded-3xl border border-[#14213D]/10 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
    >
      <div onClick={onSelect} className="cursor-pointer">
        <div
          className={`relative h-48 overflow-hidden flex items-center justify-center transition-colors ${
            isDefaultBanner
              ? "bg-gradient-to-b from-white to-slate-50 border-b border-slate-100"
              : "bg-[#14213D]"
          }`}
        >
          <img
            src={displayThumb}
            alt={work.title}
            className={`w-full h-full group-hover:scale-105 transition-transform duration-500 ${
              isDefaultBanner ? "object-contain p-2" : "object-cover"
            }`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = BAKARYA_DEFAULT_THUMBNAIL_URL;
            }}
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-3 py-1 rounded-full bg-[#14213D]/85 backdrop-blur-md text-white text-[11px] font-bold">
              {mediaType?.name || "Media"}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#F2B84B] text-[#14213D] text-[11px] font-extrabold uppercase">
              {work.educationLevelIds.join(" • ")}
            </span>
            {classBadgeText && (
              <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#14213D] text-[10px] font-extrabold shadow-sm">
                {classBadgeText}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-2.5">
          <h3 className="font-display font-extrabold text-lg text-[#14213D] group-hover:text-[#167D78] transition-colors line-clamp-2 leading-snug">
            {work.title}
          </h3>
          <p className="text-xs text-[#727782] line-clamp-2 leading-relaxed">{work.shortDescription}</p>
        </div>
      </div>

      <div className="px-6 pb-5 pt-3 border-t border-[#14213D]/5 flex items-center justify-between text-xs">
        <div
          onClick={() => onSelectContributor && onSelectContributor(work.contributorId)}
          className="cursor-pointer hover:underline"
        >
          <span className="font-bold text-[#14213D] block">{work.contributorNameSnapshot}</span>
          <span className="text-[#727782] text-[11px]">{work.contributorInstitution}</span>
        </div>
        <div className="flex items-center gap-2.5 text-[#727782] font-bold">
          <span className="flex items-center gap-1" title="Kunjungan">
            <Eye className="w-3.5 h-3.5 text-[#167D78]" />
            {work.viewCount}
          </span>
          <span className="flex items-center gap-1" title="Klik Karya">
            <MousePointerClick className="w-3.5 h-3.5 text-[#F2B84B]" />
            {work.outboundClickCount}
          </span>
          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare(work);
              }}
              className="p-1.5 rounded-lg bg-[#F8F7F2] hover:bg-[#14213D] text-[#14213D] hover:text-white transition-colors"
              title="Bagikan Karya"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
