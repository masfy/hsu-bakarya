import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, Link as LinkIcon, Sparkles, AlertTriangle, Check } from "lucide-react";
import { UserAccount } from "../../types";
import { PRESET_AVATARS } from "../../data/initialData";
import { getDriveDirectImageUrl } from "../../utils/drive";

interface SelfProfileModalProps {
  user: UserAccount;
  onClose: () => void;
  onSave: (data: Partial<UserAccount>) => void;
}

/**
 * Kompresi gambar client-side menggunakan HTML5 Canvas
 * Menghasilkan avatar 160x160 piksel format JPEG ~15-25 KB
 * Aman disimpan langsung di Firestore tanpa butuh Firebase Storage!
 */
function compressImageFile(file: File, maxSize: number = 160, quality: number = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function SelfProfileModal({ user, onClose, onSave }: SelfProfileModalProps) {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [institution, setInstitution] = useState(user.institution || "");
  const [district, setDistrict] = useState(user.district || "Kec. Amuntai Tengah, HSU");
  const [bio, setBio] = useState(user.bio || "");
  const [avatar, setAvatar] = useState(user.avatar || PRESET_AVATARS[0]);
  const [photoTab, setPhotoTab] = useState<"link" | "preset" | "upload">("link");
  const [linkInput, setLinkInput] = useState(
    user.avatar && !user.avatar.startsWith("data:") ? user.avatar : ""
  );
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLinkChange = (url: string) => {
    setLinkInput(url);
    setErrorMsg(null);
    if (!url.trim()) return;
    const resolved = getDriveDirectImageUrl(url.trim(), "w400");
    setAvatar(resolved);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Format file harus berupa gambar (JPG, PNG, atau WEBP).");
      e.target.value = "";
      return;
    }

    try {
      // Kompresi otomatis ke resolusi avatar mini
      const compressedDataUrl = await compressImageFile(file, 160, 0.82);
      setAvatar(compressedDataUrl);
      setUploadedFileName(`${file.name} (Terkonversi mini ~${Math.round(compressedDataUrl.length / 1024)} KB)`);
    } catch {
      setErrorMsg("Gagal memproses gambar. Silakan gunakan link URL atau avatar pilihan.");
    }
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
      district,
      bio,
      avatar: getDriveDirectImageUrl(avatar, "w400"),
      ...(newPassword ? { tempPassword: newPassword } : {}),
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
              Profil Saya
            </span>
            <h2 className="font-display text-xl font-extrabold text-[#14213D]">
              Edit Profil & Foto Pendidik
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
          {/* Card Pengaturan Foto Profil Fleksibel Tanpa Membutuhkan Firebase Storage */}
          <div className="bg-[#F8F7F2] p-4 sm:p-5 rounded-2xl border border-[#14213D]/10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#F2B84B] shadow-md shrink-0 bg-white flex items-center justify-center">
                <img
                  src={displayAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://placehold.co/150x150/14213D/F2B84B?text=Foto";
                  }}
                />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#167D78]">
                  Foto Profil Pengguna
                </span>
                <h3 className="font-display font-extrabold text-sm text-[#14213D]">
                  Pilih Metode Foto (Tanpa Firebase Storage)
                </h3>
                <p className="text-[11px] text-[#727782] mt-0.5 leading-relaxed">
                  Gunakan link Google Drive, avatar ilustrasi, atau kompresi otomatis langsung ke Firestore.
                </p>
              </div>
            </div>

            {/* Switcher Tab Metode Foto */}
            <div className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-xl border border-[#14213D]/10">
              <button
                type="button"
                onClick={() => setPhotoTab("link")}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  photoTab === "link"
                    ? "bg-[#14213D] text-white shadow-sm"
                    : "text-[#727782] hover:text-[#14213D]"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Link / Drive</span>
              </button>
              <button
                type="button"
                onClick={() => setPhotoTab("preset")}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  photoTab === "preset"
                    ? "bg-[#14213D] text-white shadow-sm"
                    : "text-[#727782] hover:text-[#14213D]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F2B84B]" />
                <span>Avatar Guru</span>
              </button>
              <button
                type="button"
                onClick={() => setPhotoTab("upload")}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  photoTab === "upload"
                    ? "bg-[#14213D] text-white shadow-sm"
                    : "text-[#727782] hover:text-[#14213D]"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>File HP/PC</span>
              </button>
            </div>

            {/* Konten Tab 1: Link URL / Google Drive */}
            {photoTab === "link" && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-[#14213D]">
                  Tempel Link Google Drive / URL Foto Web:
                </label>
                <input
                  type="text"
                  value={linkInput}
                  onChange={(e) => handleLinkChange(e.target.value)}
                  placeholder="Contoh: https://drive.google.com/file/d/... atau https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#14213D]/15 text-xs font-mono outline-none focus:border-[#167D78]"
                />
                <p className="text-[11px] text-[#727782] leading-relaxed bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 text-amber-900">
                  💡 <strong>Tip Google Drive:</strong> Klik kanan foto di Google Drive &gt; <em>Bagikan (Share)</em> &gt; ubah akses ke <strong>"Siapa saja yang memiliki link"</strong> &gt; salin link ke sini. Sistem otomatis mengubahnya menjadi foto profil!
                </p>
              </div>
            )}

            {/* Konten Tab 2: Avatar Pendidik Siap Pakai */}
            {photoTab === "preset" && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-[#14213D]">
                  Klik untuk Memilih Avatar Karakter Guru:
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {PRESET_AVATARS.map((url, idx) => {
                    const isSelected = avatar === url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatar(url);
                          setLinkInput(url);
                          setUploadedFileName("");
                          setErrorMsg(null);
                        }}
                        className={`relative w-11 h-11 rounded-xl overflow-hidden border-2 transition-all ${
                          isSelected
                            ? "border-[#167D78] scale-110 shadow-md ring-2 ring-[#167D78]/30"
                            : "border-transparent opacity-75 hover:opacity-100 hover:scale-105"
                        }`}
                      >
                        <img src={url} alt={`preset-${idx}`} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#167D78]/25 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Konten Tab 3: Upload File HP / PC (Kompresi Otomatis) */}
            {photoTab === "upload" && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-[#14213D]">
                  Pilih Foto dari Galeri HP atau Laptop:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#14213D] hover:bg-[#167D78] text-white text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-sm">
                    <Upload className="w-4 h-4 text-[#F2B84B]" />
                    <span>Pilih Berkas Foto</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadedFileName && (
                    <span className="text-[11px] font-bold text-[#167D78] bg-[#167D78]/10 px-3 py-1.5 rounded-xl">
                      ✓ {uploadedFileName}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#727782] leading-relaxed">
                  Foto akan otomatis di-compress menjadi ukuran mini (~15-25 KB) oleh browser sehingga tersimpan langsung ke database tanpa memerlukan Firebase Storage.
                </p>
              </div>
            )}
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

          <div>
            <label className="block text-xs font-bold uppercase mb-1 text-[#14213D]">
              Kecamatan / Wilayah Tugas *
            </label>
            <input
              type="text"
              list="profile-district-list"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Pilih atau ketik nama kecamatan (contoh: Kec. Amuntai Tengah)..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs outline-none focus:border-[#167D78]"
            />
            <datalist id="profile-district-list">
              <option value="Kec. Amuntai Tengah, HSU" />
              <option value="Kec. Amuntai Selatan, HSU" />
              <option value="Kec. Amuntai Utara, HSU" />
              <option value="Kec. Banjang, HSU" />
              <option value="Kec. Babirik, HSU" />
              <option value="Kec. Danau Panggang, HSU" />
              <option value="Kec. Haur Gading, HSU" />
              <option value="Kec. Paminggir, HSU" />
              <option value="Kec. Sungai Pandan, HSU" />
              <option value="Kec. Sungai Tabukan, HSU" />
              <option value="Gugus 2 HSU" />
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1 text-[#14213D]">
              Bio Singkat
            </label>
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
