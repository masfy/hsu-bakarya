import React from "react";
import { motion } from "framer-motion";
import { UserX } from "lucide-react";
import { UserAccount, UserRole } from "../../types";

interface ConfirmDeleteModalProps {
  user: UserAccount | null;
  role: UserRole;
  onClose: () => void;
  onConfirm: (uid: string, mode: "soft" | "permanent") => void;
}

export function ConfirmDeleteModal({
  user,
  role,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!user) return null;

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
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5"
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
          <UserX className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-display text-lg font-extrabold text-[#14213D]">
            Hapus & Cabut Akses Pengguna?
          </h3>
          <p className="text-xs sm:text-sm text-[#727782] leading-relaxed">
            Anda akan menonaktifkan akun <strong>{user.displayName}</strong> ({user.email}).
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={() => onConfirm(user.uid, "soft")}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold transition-colors shadow-sm"
          >
            Nonaktifkan (Soft Delete)
          </button>
          {role === "superAdmin" && (
            <button
              type="button"
              onClick={() => onConfirm(user.uid, "permanent")}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-colors shadow-sm"
            >
              Hapus Permanen
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-[#14213D]/15 text-xs font-bold text-[#727782] hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
