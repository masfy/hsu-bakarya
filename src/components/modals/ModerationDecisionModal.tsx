import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Work, WorkStatus } from "../../types";

interface ModerationDecisionModalProps {
  work: Work;
  onClose: () => void;
  onConfirm: (workId: string, decision: WorkStatus, note: string) => void;
}

export function ModerationDecisionModal({
  work,
  onClose,
  onConfirm,
}: ModerationDecisionModalProps) {
  const [decision, setDecision] = useState<WorkStatus>("published");
  const [note, setNote] = useState(work?.moderationNote || "");

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
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase text-[#167D78]">Moderasi Kurator</span>
            <h3 className="font-display text-lg font-extrabold text-[#14213D] line-clamp-1">{work.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F7F2] hover:bg-[#14213D]/10 transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4 text-[#14213D]" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-extrabold uppercase text-[#14213D]">Keputusan Moderasi:</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "published", label: "Terbitkan" },
              { id: "revision_requested", label: "Minta Revisi" },
              { id: "rejected", label: "Tolak" },
              { id: "archived", label: "Arsipkan" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDecision(opt.id as WorkStatus)}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                  decision === opt.id
                    ? "bg-[#14213D] text-white border-[#14213D]"
                    : "bg-[#F8F7F2] text-[#20252D] border-[#14213D]/15 hover:bg-gray-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
            Catatan Moderasi / Revisi:
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Berikan catatan umpan balik untuk kontributor..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs outline-none focus:border-[#167D78]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#14213D]/15 text-xs font-bold hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(work.id, decision, note)}
            className="px-5 py-2 rounded-xl bg-[#167D78] hover:bg-[#14213D] transition-colors text-white text-xs font-bold shadow-md"
          >
            Simpan Keputusan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
