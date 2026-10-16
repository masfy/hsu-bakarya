import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, AlertTriangle } from "lucide-react";
import { UserAccount } from "../../types";
import { PRESET_AVATARS } from "../../data/initialData";

interface SelfProfileModalProps {
  user: UserAccount;
  onClose: () => void;
  onSave: (data: Partial<UserAccount>) => void;
}

export function SelfProfileModal({ user, onClose, onSave }: SelfProfileModalProps) {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [institution, setInstitution] = useState(user.institution || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatar, setAvatar] = useState(user.avatar || PRESET_AVATARS[0]);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const maxSizeBytes = 1024 * 1024; // 1 MB
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Format file harus berupa gambar (JPG, PNG, atau WEBP).");
      e.target.value = "";
      return;
    }
    if (file.size > maxSizeBytes) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMsg(
        `Ukuran foto (${sizeInMB} MB) melebihi batas maksimal 1 MB. Silakan pilih foto yang lebih kecil.`
      );
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
        setUploadedFileName(`${file.name} (${(file.size / 1024).toFixed(0)} KB)`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !institution) {
      setErrorMsg("Nama Lengkap dan Instansi wajib diisi.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setErrorMsg("Password baru minimal 6 karakter.");
      return;
    }
    onSave({
      displayName,
      institution,
      bio,
      avatar,
      ...(newPassword ? { tempPassword: newPassword } : {}),
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
              Profil Saya
            </span>
            <h2 className="font-display text-xl font-extrabold text-[#14213D]">
              Edit Profil, Upload Foto & Password
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

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#F8F7F2] p-4 rounded-2xl border border-[#14213D]/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <img
                src={avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#F2B84B] shrink-0"
              />
              <div className="space-y-2 flex-1">
                <label className="block text-xs font-extrabold uppercase text-[#14213D]">
                  Upload Foto Profil Sendiri (Maks. 1 MB)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-[#14213D] hover:bg-[#167D78] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#F2B84B]" />
                    <span>Pilih Foto dari Perangkat</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadedFileName && (
                    <span className="text-[11px] font-bold text-[#167D78] bg-[#167D78]/10 px-2.5 py-1 rounded-lg">
                      ✓ {uploadedFileName}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#727782]">
                  Mendukung JPG, PNG, atau WEBP (maks. 1 MB). Atau pilih avatar preset:
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(url);
                        setUploadedFileName("");
                        setErrorMsg(null);
                      }}
                      className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-transform ${
                        avatar === url ? "border-[#167D78] scale-110" : "border-transparent"
                      }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1 text-[#14213D]">Nama Lengkap & Gelar *</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs outline-none focus:border-[#167D78]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1 text-[#14213D]">Asal Sekolah / Instansi *</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs outline-none focus:border-[#167D78]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1 text-[#14213D]">Bio Singkat</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs outline-none focus:border-[#167D78]"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#167D78]/10 border border-[#167D78]/25 space-y-2">
            <label className="block text-xs font-bold uppercase text-[#167D78]">
              Ganti Password Baru (Opsional)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#14213D]/15 text-xs font-mono outline-none focus:border-[#167D78]"
            />
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
              Simpan Profil
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
