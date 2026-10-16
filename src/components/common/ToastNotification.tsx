import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { ToastInfo } from "../../types";

interface ToastNotificationProps {
  toast: ToastInfo | null;
}

export function ToastNotification({ toast }: ToastNotificationProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -25, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-20 right-4 sm:right-8 z-50 flex items-center gap-3 bg-[#14213D] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#F2B84B]/40 max-w-md backdrop-blur-md"
        >
          <div className="w-8 h-8 rounded-xl bg-[#F2B84B]/20 flex items-center justify-center text-[#F2B84B] shrink-0">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : toast.type === "error" ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#F2B84B]" />
            )}
          </div>
          <span className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
