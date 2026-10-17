import React from "react";
import { motion } from "framer-motion";
import { X, Share2, ExternalLink, Edit3, Trash2 } from "lucide-react";
import { Work } from "../../types";
import { StatusBadge } from "../common/StatusBadge";
import {
  getDriveDirectImageUrl,
  BAKARYA_DEFAULT_THUMBNAIL_URL,
} from "../../utils/drive";
import { CLASSES_DATA } from "../../data/initialData";

interface WorkDetailModalProps {
  work: Work | null;
  onClose: () => void;
  onShare: (work: Work) => void;
  onOutboundClick: (work: Work) => void;
  onEdit?: (work: Work) => void;
  canEdit?: boolean;
  onDelete?: (work: Work) => void;
  canDelete?: boolean;
}

export function WorkDetailModal({
  work,
  onClose,
  onShare,
  onOutboundClick,
  onEdit,
  canEdit = false,
  onDelete,
  canDelete = false,
}: WorkDetailModalProps) {
  if (!work) return null;

  const displayThumb = getDriveDirectImageUrl(work.thumbnailURL) || BAKARYA_DEFAULT_THUMBNAIL_URL;
  const isDefaultBanner = displayThumb === BAKARYA_DEFAULT_THUMBNAIL_URL;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#14213D]/10 my-8"
      >
        <div
          className={`relative h-60 sm:h-72 flex items-center justify-center p-3 ${
            isDefaultBanner
              ? "bg-gradient-to-b from-white to-slate-50 border-b border-slate-100"
              : "bg-[#14213D]"
          }`}
        >
          <img
            src={displayThumb}
            alt={work.title}
            className={`w-full h-full opacity-95 ${
              isDefaultBanner ? "object-contain p-2" : "object-cover"
            }`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = BAKARYA_DEFAULT_THUMBNAIL_URL;
            }}
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#14213D]/80 hover:bg-[#14213D] text-white flex items-center justify-center transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-6 right-6 flex items-center gap-2">
            <StatusBadge status={work.status} />
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-[#14213D]">{work.title}</h2>
            <p className="text-sm font-bold text-[#167D78] mt-1">
              Oleh {work.contributorNameSnapshot} • {work.contributorInstitution}
            </p>
            {/* Badges for Jenjang & Kelas */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="px-2.5 py-1 rounded-lg bg-[#14213D] text-white text-xs font-extrabold uppercase tracking-wide">
                Jenjang: {work.educationLevelIds.join(", ").toUpperCase()}
              </span>
              {work.classIds && work.classIds.length > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                  Target Kelas:{" "}
                  {CLASSES_DATA.filter((c) => work.classIds.includes(c.id))
                    .map((c) => c.name)
                    .join(", ") || work.classIds.join(", ")}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#20252D] leading-relaxed whitespace-pre-line">
            {work.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#14213D]/10">
            <span className="text-xs text-[#727782]">Tautan media pembelajaran tervalidasi aman.</span>
            <div className="flex items-center gap-2.5">
              {canEdit && onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(work)}
                  className="px-4 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-sm"
                  title="Edit Karya & Tautan Media"
                >
                  <Edit3 className="w-4 h-4 text-amber-700" />
                  <span>Edit Karya</span>
                </button>
              )}
              {canDelete && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(work)}
                  className="px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-sm"
                  title="Hapus Karya Pembelajaran"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Hapus</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onShare(work)}
                className="px-4 py-3 rounded-xl bg-[#F8F7F2] hover:bg-[#14213D] text-[#14213D] hover:text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-[#14213D]/15 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan</span>
              </button>
              <a
                href={work.mediaURL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOutboundClick(work)}
                className="px-6 py-3 rounded-xl bg-[#167D78] hover:bg-[#14213D] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-colors"
              >
                <span>Buka Karya</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
