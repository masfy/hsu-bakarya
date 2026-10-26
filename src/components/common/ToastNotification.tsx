import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { ToastInfo } from "../../types";

interface ToastNotificationProps {
  toast: ToastInfo | null;
  onDismiss?: () => void;
}

export function ToastNotification({ toast, onDismiss }: ToastNotificationProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`fixed top-5 right-4 sm:right-8 z-[9999] flex items-start gap-3.5 px-5 py-4 rounded-2xl shadow-2xl border max-w-md w-[calc(100vw-2rem)] sm:w-auto backdrop-blur-xl ${
            toast.type === "success"
              ? "bg-[#0b2b1d]/95 border-emerald-400/50 text-emerald-100 shadow-emerald-950/50"
              : toast.type === "error"
              ? "bg-[#330c14]/95 border-rose-500/70 text-rose-100 shadow-rose-950/60"
              : toast.type === "warning"
              ? "bg-[#331c0a]/95 border-amber-500/60 text-amber-100 shadow-amber-950/50"
              : "bg-[#14213D]/95 border-[#F2B84B]/60 text-amber-50 shadow-black/50"
          }`}
          role="alert"
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
              toast.type === "success"
                ? "bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-400/30"
                : toast.type === "error"
                ? "bg-rose-500/25 text-rose-300 ring-1 ring-rose-400/30"
                : toast.type === "warning"
                ? "bg-amber-500/25 text-amber-300 ring-1 ring-amber-400/30"
                : "bg-[#F2B84B]/25 text-[#F2B84B] ring-1 ring-[#F2B84B]/30"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : toast.type === "error" ? (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            ) : toast.type === "warning" ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-[#F2B84B]" />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  toast.type === "success"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : toast.type === "error"
                    ? "bg-rose-500/25 text-rose-300"
                    : toast.type === "warning"
                    ? "bg-amber-500/25 text-amber-300"
                    : "bg-[#F2B84B]/20 text-[#F2B84B]"
                }`}
              >
                {toast.type === "success"
                  ? "Berhasil"
                  : toast.type === "error"
                  ? "Pemberitahuan / Gagal"
                  : toast.type === "warning"
                  ? "Peringatan"
                  : "Informasi"}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium leading-relaxed break-words">
              {toast.message}
            </p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0"
              title="Tutup pemberitahuan"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
