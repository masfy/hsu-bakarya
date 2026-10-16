import React from "react";
import { motion } from "framer-motion";
import { X, Copy } from "lucide-react";
import { Work, MediaType } from "../../types";
import {
  getDriveDirectImageUrl,
  BAKARYA_DEFAULT_THUMBNAIL_URL,
  BAKARYA_LOGO_URL,
} from "../../utils/drive";

interface ShareWorkModalProps {
  work: Work;
  mediaTypesList: MediaType[];
  onClose: () => void;
  onCopied: () => void;
}

export function ShareWorkModal({
  work,
  mediaTypesList,
  onClose,
  onCopied,
}: ShareWorkModalProps) {
  const mediaType = mediaTypesList.find((m) => m.id === work.mediaTypeId);
  const shareThumbUrl = getDriveDirectImageUrl(work.thumbnailURL) || BAKARYA_DEFAULT_THUMBNAIL_URL;
  const isDefaultBanner = shareThumbUrl === BAKARYA_DEFAULT_THUMBNAIL_URL;
  const shareUrl = `${window.location.origin}/#jelajah?karya=${work.slug}`;

  const handleCopyShareLink = () => {
    const shareText = `${work.title} — Oleh ${work.contributorNameSnapshot} (${work.contributorInstitution})\nAkses di BAKARYA Gugus 2 HSU: ${shareUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    onCopied();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <img
              src={BAKARYA_LOGO_URL}
              alt="Logo"
              className="w-7 h-7 object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#167D78] block">
                Pratinjau Tautan Berbagi
              </span>
              <h3 className="font-display text-base font-extrabold text-[#14213D]">
                Bagikan Karya ke Guru / Grup WA
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F7F2] hover:bg-[#14213D]/10 flex items-center justify-center text-[#727782] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Kartu Pratinjau Sosial Media (Open Graph Card Preview) */}
        <div className="rounded-2xl overflow-hidden border border-[#14213D]/15 bg-[#F8F7F2] shadow-sm">
          <div
            className={`relative h-44 flex items-center justify-center p-2 ${
              isDefaultBanner
                ? "bg-gradient-to-b from-white to-slate-50 border-b border-slate-200"
                : "bg-[#14213D]"
            }`}
          >
            <img
              src={shareThumbUrl}
              alt={work.title}
              className={`w-full h-full ${isDefaultBanner ? "object-contain p-2" : "object-cover"}`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = BAKARYA_DEFAULT_THUMBNAIL_URL;
              }}
            />
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#14213D]/85 text-white text-[10px] font-bold">
                {mediaType?.name || "Media"}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#167D78]">
              BAKARYA-HSU.ID • KELAS DIGITALISASI GUGUS 2 HSU
            </div>
            <h4 className="font-display font-extrabold text-sm text-[#14213D] line-clamp-2">
              {work.title}
            </h4>
            <p className="text-xs text-[#727782] line-clamp-2">{work.shortDescription}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-mono text-[#14213D]"
          />
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="px-4 py-2.5 rounded-xl bg-[#167D78] hover:bg-[#14213D] text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-colors shadow-md"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
