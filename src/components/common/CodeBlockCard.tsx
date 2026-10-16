import React, { useState } from "react";
import { Copy, CheckCheck } from "lucide-react";

interface CodeBlockCardProps {
  title: string;
  code: string;
}

export function CodeBlockCard({ title, code }: CodeBlockCardProps) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="bg-[#14213D] text-white rounded-3xl p-6 space-y-3 shadow-xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <span className="text-xs font-mono font-bold text-[#F2B84B] tracking-wide">{title}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-[11px] font-bold flex items-center gap-1.5"
        >
          {copied ? (
            <CheckCheck className="w-3.5 h-3.5 text-[#F2B84B]" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-white/70" />
          )}
          <span>{copied ? "Tersalin!" : "Salin Kode"}</span>
        </button>
      </div>
      <pre className="text-[11px] font-mono text-white/90 overflow-x-auto leading-relaxed p-2 bg-black/20 rounded-xl">
        {code}
      </pre>
    </div>
  );
}
