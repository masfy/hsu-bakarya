import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserX, AlertTriangle, X, Loader2 } from "lucide-react";
import { UserAccount, UserRole } from "../../types";

interface ConfirmDeleteModalProps {
  user: UserAccount | null;
  role: UserRole;
  onClose: () => void;
  onConfirm: (uid: string, mode: "soft" | "permanent") => Promise<void> | void;
}

export function ConfirmDeleteModal({
  user,
  role,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  const handleAction = async (mode: "soft" | "permanent") => {
    setIsDeleting(true);
    try {
      await onConfirm(user.uid, mode);
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
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 relative my-8 border border-[#14213D]/10"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F8F7F2] hover:bg-[#14213D]/10 text-[#727782] flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
          <UserX className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600">
            Penghapusan Akun Pengguna
          </span>
          <h3 className="font-display text-xl font-extrabold text-[#14213D]">
            Hapus Pengguna dari Sistem?
          </h3>
          <p className="text-xs sm:text-sm text-[#727782] leading-relaxed">
            Anda akan menghapus akun <strong>{user.displayName}</strong> ({user.email}) asal {user.institution}.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Peringatan Penghapusan Permanen:</span>
            <p className="leading-relaxed text-rose-900">
              Data pengguna akan dihapus permanen dari basis data Cloud Firestore dan tidak akan muncul kembali saat sinkronisasi.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => handleAction("permanent")}
            className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus dari Firebase...</span>
              </>
            ) : (
              <>
                <UserX className="w-4 h-4" />
                <span>Hapus Permanen dari Firebase</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={() => handleAction("soft")}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-colors disabled:opacity-50"
          >
            Nonaktifkan Saja (Bekukan Akses)
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-[#14213D]/15 text-xs font-bold text-[#727782] hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
