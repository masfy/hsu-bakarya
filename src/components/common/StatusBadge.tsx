import React from "react";
import { CheckCircle2, Clock, AlertTriangle, XCircle, Lock } from "lucide-react";
import { WorkStatus } from "../../types";

interface StatusBadgeProps {
  status: WorkStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "published":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#167D78]/15 text-[#167D78] border border-[#167D78]/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Terbit</span>
        </span>
      );
    case "pending_review":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#F2B84B]/20 text-[#14213D] border border-[#F2B84B]/40">
          <Clock className="w-3.5 h-3.5 text-[#14213D]" />
          <span>Menunggu Kurasi</span>
        </span>
      );
    case "revision_requested":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-700 border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Perlu Revisi</span>
        </span>
      );
    case "draft":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-gray-200 text-gray-700 border border-gray-300">
          <Lock className="w-3.5 h-3.5" />
          <span>Draf</span>
        </span>
      );
    case "archived":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-red-100 text-red-600 border border-red-200">
          <XCircle className="w-3.5 h-3.5" />
          <span>Arsip</span>
        </span>
      );
    default:
      return null;
  }
}
