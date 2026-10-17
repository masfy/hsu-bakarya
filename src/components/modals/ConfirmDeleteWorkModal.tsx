import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { Work, UserRole } from "../../types";
import { StatusBadge } from "../common/StatusBadge";
import { getDriveDirectImageUrl, BAKARYA_DEFAULT_THUMBNAIL_URL } from "../../utils/drive";

interface ConfirmDeleteWorkModalProps {
  work: Work | null;
  role: UserRole;
  onClose: () => void;
  onConfirm: (work: Work) => Promise<void> | void;
}

export function ConfirmDeleteWorkModal({
  work,
  role,
  onClose,
  onConfirm,
}: ConfirmDeleteWorkModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!work) return null;

  const displayThumb = getDriveDirectImageUrl(work.thumbnailURL, "w200") || BAKARYA_DEFAULT_THUMBNAIL_URL;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(work);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-[#14213D]/10 my-8"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F8F7F2] hover:bg-[#14213D]/10 text-[#727782] flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600">
              Konfirmasi Penghapusan Karya
            </span>
            <h3 className="font-display text-xl font-extrabold text-[#14213D]">
              Hapus Karya Ini?
            </h3>
          </div>
        </div>

        {/* Work summary card */}
        <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 flex items-center gap-4">
          <img
            src={displayThumb}
            alt={work.title}
            className="w-16 h-16 rounded-xl object-cover border border-[#14213D]/10 bg-white shrink-0"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = BAKARYA_DEFAULT_THUMBNAIL_URL;
            }}
          />
          <div className="space-y-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <StatusBadge status={work.status} />
            </div>
            <h4 className="font-display text-sm font-extrabold text-[#14213D] truncate" title={work.title}>
              {work.title}
            </h4>
            <p className="text-xs text-[#727782] truncate">
              Oleh {work.contributorNameSnapshot} • {work.contributorInstitution}
            </p>
          </div>
        </div>

        {/* Warning alert */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">Peringatan:</strong>
            <p className="leading-relaxed text-rose-900">
              Karya pembelajaran digital ini akan dihapus dari sistem BAKARYA dan basis data Cloud Firestore. 
              Karya ini tidak akan dapat diakses oleh publik, peserta didik, maupun kontributor lagi.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-[#14213D]/15 text-xs font-bold text-[#14213D] hover:bg-gray-100 transition-colors order-2 sm:order-1 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-colors order-1 sm:order-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Karya</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
