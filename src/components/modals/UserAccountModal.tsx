import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { UserAccount, UserRole, AccountStatus } from "../../types";

interface UserAccountModalProps {
  initialData: UserAccount | null;
  currentRole: UserRole;
  onClose: () => void;
  onSave: (data: Partial<UserAccount>) => void;
}

export function UserAccountModal({
  initialData,
  currentRole,
  onClose,
  onSave,
}: UserAccountModalProps) {
  const [displayName, setDisplayName] = useState(initialData?.displayName || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [username, setUsername] = useState(initialData?.username || "");
  const [tempPassword, setTempPassword] = useState(initialData?.tempPassword || "Bakarya#2026");
  const [institution, setInstitution] = useState(initialData?.institution || "");
  const [userRole, setUserRole] = useState<UserRole>(initialData?.role || "contributor");
  const [accountStatus, setAccountStatus] = useState<AccountStatus>(
    initialData?.accountStatus || "active"
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !email || !username) {
      setError("Nama Lengkap, Email, dan Username wajib diisi.");
      return;
    }
    onSave({
      displayName,
      email,
      username,
      tempPassword,
      institution,
      role: userRole,
      accountStatus,
    });
  };

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
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8"
      >
        <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">
              Manajemen Akun
            </span>
            <h2 className="font-display text-xl font-extrabold text-[#14213D]">
              {initialData ? "Edit Akun & Hak Akses" : "Tambah Akun Peserta"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F8F7F2] hover:bg-[#14213D]/10 transition-colors flex items-center justify-center text-[#727782]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-[#14213D]">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs outline-none focus:border-[#167D78]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-[#14213D]">
                Asal Instansi *
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs outline-none focus:border-[#167D78]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-[#14213D]">
                Email Google / Belajar.id *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-mono outline-none focus:border-[#167D78]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-[#14213D]">
                Username *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-mono outline-none focus:border-[#167D78]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1 text-[#14213D]">
              Password Sementara / Kunci Akses *
            </label>
            <input
              type="text"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-mono font-bold outline-none focus:border-[#167D78]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-[#14213D]">
                Peran (Role)
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-bold outline-none focus:border-[#167D78]"
              >
                <option value="contributor">Kontributor</option>
                <option value="admin">Admin Kurator</option>
                {currentRole === "superAdmin" && <option value="superAdmin">Super Admin</option>}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-[#14213D]">
                Status Akun
              </label>
              <select
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value as AccountStatus)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-bold outline-none focus:border-[#167D78]"
              >
                <option value="active">Active (Aktif)</option>
                <option value="pending">Pending (Menunggu)</option>
                <option value="suspended">Suspended (Dibekukan)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#14213D]/15 text-xs font-bold hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#167D78] hover:bg-[#14213D] transition-colors text-white text-xs font-bold shadow-md"
            >
              Simpan Akun
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
