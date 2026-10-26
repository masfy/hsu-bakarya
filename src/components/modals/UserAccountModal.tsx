import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Link as LinkIcon, AlertTriangle, ChevronDown } from "lucide-react";
import { UserAccount, UserRole, AccountStatus } from "../../types";
import { PRESET_AVATARS, KALSEL_REGIONS, getDistrictsForRegion, BAKARYA_DEFAULT_AVATAR_URL } from "../../data/initialData";
import { getDriveDirectImageUrl } from "../../utils/drive";

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
  const parseRegionAndDistrict = (d?: string) => {
    if (!d) return { region: "Kab. Hulu Sungai Utara (HSU)", district: "Amuntai Tengah" };
    const matchedRegion =
      KALSEL_REGIONS.find((r) => d.toLowerCase().includes(r.toLowerCase())) ||
      (d.includes("HSU") ? "Kab. Hulu Sungai Utara (HSU)" : "Kab. Hulu Sungai Utara (HSU)");
    const subList = getDistrictsForRegion(matchedRegion);
    const matchedKec = subList.find((k) => d.toLowerCase().includes(k.toLowerCase())) || subList[0] || "Amuntai Tengah";
    return { region: matchedRegion, district: matchedKec };
  };

  const initialLoc = parseRegionAndDistrict(initialData?.district);
  const [displayName, setDisplayName] = useState(initialData?.displayName || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [username, setUsername] = useState(initialData?.username || "");
  const [tempPassword, setTempPassword] = useState("");
  const [institution, setInstitution] = useState(initialData?.institution || "");
  const [selectedRegion, setSelectedRegion] = useState<string>(initialLoc.region);
  const [district, setDistrict] = useState<string>(initialLoc.district);
  const [avatar, setAvatar] = useState(initialData?.avatar || PRESET_AVATARS[0]);
  const [userRole, setUserRole] = useState<UserRole>(initialData?.role || "contributor");
  const [accountStatus, setAccountStatus] = useState<AccountStatus>(
    initialData?.accountStatus || "active"
  );
  const [error, setError] = useState<string | null>(null);

  const availableDistricts = useMemo(() => getDistrictsForRegion(selectedRegion), [selectedRegion]);

  React.useEffect(() => {
    if (initialData) {
      setDisplayName(initialData.displayName || "");
      setEmail(initialData.email || "");
      setUsername(initialData.username || "");
      setTempPassword("");
      setInstitution(initialData.institution || "");
      const loc = parseRegionAndDistrict(initialData.district);
      setSelectedRegion(loc.region);
      setDistrict(loc.district);
      setAvatar(initialData.avatar || PRESET_AVATARS[0]);
      setUserRole(initialData.role || "contributor");
      setAccountStatus(initialData.accountStatus || "active");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !email || !username) {
      setError("Nama Lengkap, Email, dan Username wajib diisi.");
      return;
    }
    const fullDistrict = `${district}, ${selectedRegion}`;
    onSave({
      displayName,
      email,
      username,
      tempPassword,
      institution,
      district: fullDistrict,
      avatar: getDriveDirectImageUrl(avatar, "w400") || avatar,
      role: userRole,
      accountStatus,
    });
  };

  const displayAvatar = getDriveDirectImageUrl(avatar, "w400");

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
              {initialData ? "Edit Akun Pengguna" : "Tambah Pengguna Baru"}
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
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bagian Foto Profil / Avatar */}
          <div className="bg-[#F8F7F2] p-4 rounded-2xl border border-[#14213D]/10 space-y-3">
            <div className="flex items-center gap-4">
              <img
                src={displayAvatar}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#F2B84B] shadow-sm shrink-0 bg-white"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = BAKARYA_DEFAULT_AVATAR_URL;
                }}
              />
              <div className="space-y-1.5 flex-1">
                <label className="block text-xs font-bold uppercase text-[#14213D]">
                  Link Foto Profil (Google Drive / Web)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... atau https://..."
                    className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-white border border-[#14213D]/15 text-xs font-mono outline-none focus:border-[#167D78]"
                  />
                  <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-bold text-[#727782]">Avatar Cepat:</span>
              <div className="flex items-center gap-1.5">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-7 h-7 rounded-lg overflow-hidden border transition-transform ${
                      avatar === url ? "border-[#167D78] scale-110 shadow-sm" : "border-transparent opacity-75"
                    }`}
                  >
                    <img src={url} alt={`preset-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

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
              Asal Sekolah / Instansi *
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs outline-none focus:border-[#167D78]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-[#14213D]">
                Kabupaten / Kota se-Kalsel *
              </label>
              <div className="relative">
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    const newReg = e.target.value;
                    setSelectedRegion(newReg);
                    const subList = getDistrictsForRegion(newReg);
                    setDistrict(subList[0] || "");
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-bold text-[#14213D] outline-none focus:border-[#167D78] focus:ring-1 focus:ring-[#167D78] cursor-pointer appearance-none pr-9"
                >
                  {KALSEL_REGIONS.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#727782]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-[#14213D]">
                Kecamatan / Wilayah Tugas *
              </label>
              <div className="relative">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-bold text-[#14213D] outline-none focus:border-[#167D78] focus:ring-1 focus:ring-[#167D78] cursor-pointer appearance-none pr-9"
                >
                  {availableDistricts.map((kec) => (
                    <option key={kec} value={kec}>
                      {kec}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#727782]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
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
              Kata Sandi / Reset Password
            </label>
            <input
              type="password"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="Kosongkan jika menggunakan Google Login / tidak diubah"
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-mono outline-none focus:border-[#167D78]"
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
              Simpan Pengguna
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
