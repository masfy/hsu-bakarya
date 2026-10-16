import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { Work, Subject, Category, MediaType } from "../../types";
import { EDUCATION_LEVELS } from "../../data/initialData";

interface WorkFormWizardModalProps {
  initialData: Work | null;
  subjectsList: Subject[];
  categoriesList: Category[];
  mediaTypesList: MediaType[];
  onAddSubject: (name: string) => string | null;
  onAddCategory: (name: string) => string | null;
  onAddMediaType: (name: string) => string | null;
  onClose: () => void;
  onSave: (data: Partial<Work>, submitForReview: boolean) => void;
}

export function WorkFormWizardModal({
  initialData,
  subjectsList,
  categoriesList,
  mediaTypesList,
  onAddSubject,
  onAddCategory,
  onAddMediaType,
  onClose,
  onSave,
}: WorkFormWizardModalProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(initialData?.title || "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [mediaTypeId, setMediaTypeId] = useState(initialData?.mediaTypeId || "game");
  const [educationLevelIds, setEducationLevelIds] = useState<string[]>(
    initialData?.educationLevelIds || ["sd"]
  );
  const [subjectIds, setSubjectIds] = useState<string[]>(
    initialData?.subjectIds || ["matematika"]
  );
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initialData?.categoryIds || ["cat-ekologi"]
  );
  const [mediaURL, setMediaURL] = useState(initialData?.mediaURL || "");
  const [thumbnailURL, setThumbnailURL] = useState(initialData?.thumbnailURL || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Input manual baru
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [customMediaInput, setCustomMediaInput] = useState("");

  const toggleArrayItem = (
    arr: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (arr.includes(item)) {
      if (arr.length > 1) setter(arr.filter((i) => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const validateAndSubmit = (submitForReview: boolean) => {
    if (!title.trim() || title.trim().length < 5) {
      setErrorMsg("Judul karya minimal 5 karakter.");
      setStep(1);
      return;
    }
    if (!shortDescription.trim()) {
      setErrorMsg("Ringkasan singkat wajib diisi.");
      setStep(1);
      return;
    }
    try {
      const parsed = new URL(mediaURL);
      if (parsed.protocol !== "https:") {
        setErrorMsg("Tautan media wajib diawali dengan https://");
        setStep(3);
        return;
      }
    } catch {
      setErrorMsg("Format URL media tidak valid. Pastikan menyertakan https://");
      setStep(3);
      return;
    }
    onSave(
      {
        title,
        shortDescription,
        description,
        mediaTypeId,
        educationLevelIds,
        subjectIds,
        categoryIds,
        mediaURL,
        thumbnailURL,
      },
      submitForReview
    );
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
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8"
      >
        <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">
              Formulir Karya
            </span>
            <h2 className="font-display text-xl font-extrabold text-[#14213D]">
              {initialData ? "Edit Karya" : "Unggah Karya Digital"}
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

        {/* Wizard Steps */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: 1, label: "1. Info Dasar" },
            { num: 2, label: "2. Mapel & Format" },
            { num: 3, label: "3. Tautan Media" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                step === s.num
                  ? "bg-[#14213D] text-white shadow-sm"
                  : "bg-[#F8F7F2] text-[#727782] hover:bg-gray-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Info Dasar */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
                Judul Karya *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Petualangan Matematika Rawa Lebak Amuntai"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-sm outline-none focus:border-[#167D78]"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
                Ringkasan Singkat *
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="1-2 kalimat ringkasan yang menarik minat guru lain..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-sm outline-none focus:border-[#167D78]"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
                Deskripsi Lengkap
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan tujuan pembelajaran, petunjuk penggunaan, atau keterkaitan dengan muatan lokal..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-sm outline-none focus:border-[#167D78]"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Mapel & Media */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Jenjang Pendidikan */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1.5">
                Jenjang Pendidikan:
              </label>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => toggleArrayItem(educationLevelIds, setEducationLevelIds, lvl.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      educationLevelIds.includes(lvl.id)
                        ? "bg-[#14213D] text-white border-[#14213D]"
                        : "bg-[#F8F7F2] text-[#20252D] border-[#14213D]/15 hover:bg-gray-100"
                    }`}
                  >
                    {lvl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Jenis Media */}
            <div className="p-3.5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 space-y-2.5">
              <label className="block text-xs font-extrabold uppercase text-[#14213D]">
                Jenis Media (Pilih atau ketik format baru):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {mediaTypesList.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMediaTypeId(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      mediaTypeId === m.id
                        ? "bg-[#167D78] text-white border-[#167D78]"
                        : "bg-white text-[#20252D] border-[#14213D]/15 hover:bg-gray-50"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customMediaInput}
                  onChange={(e) => setCustomMediaInput(e.target.value)}
                  placeholder="Ketik jenis media baru (misal: Komik, Podcast)..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#14213D]/15 text-xs outline-none focus:border-[#167D78]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newId = onAddMediaType(customMediaInput);
                    if (newId) {
                      setMediaTypeId(newId);
                      setCustomMediaInput("");
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#14213D] hover:bg-[#167D78] transition-colors text-white text-xs font-bold shrink-0"
                >
                  + Tambah
                </button>
              </div>
            </div>

            {/* Mata Pelajaran */}
            <div className="p-3.5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 space-y-2.5">
              <label className="block text-xs font-extrabold uppercase text-[#14213D]">
                Mata Pelajaran (Pilih atau ketik baru):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {subjectsList.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleArrayItem(subjectIds, setSubjectIds, sub.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      subjectIds.includes(sub.id)
                        ? "bg-[#167D78] text-white border-[#167D78]"
                        : "bg-white text-[#20252D] border-[#14213D]/15 hover:bg-gray-50"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                  placeholder="Ketik mata pelajaran baru..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#14213D]/15 text-xs outline-none focus:border-[#167D78]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newId = onAddSubject(customSubjectInput);
                    if (newId) {
                      if (!subjectIds.includes(newId)) setSubjectIds([...subjectIds, newId]);
                      setCustomSubjectInput("");
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#14213D] hover:bg-[#167D78] transition-colors text-white text-xs font-bold shrink-0"
                >
                  + Tambah
                </button>
              </div>
            </div>

            {/* Kategori Karya */}
            <div className="p-3.5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 space-y-2.5">
              <label className="block text-xs font-extrabold uppercase text-[#14213D]">
                Kategori Karya (Pilih atau ketik baru):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleArrayItem(categoryIds, setCategoryIds, cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      categoryIds.includes(cat.id)
                        ? "bg-[#167D78] text-white border-[#167D78]"
                        : "bg-white text-[#20252D] border-[#14213D]/15 hover:bg-gray-50"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  placeholder="Ketik kategori baru..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#14213D]/15 text-xs outline-none focus:border-[#167D78]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newId = onAddCategory(customCategoryInput);
                    if (newId) {
                      if (!categoryIds.includes(newId)) setCategoryIds([...categoryIds, newId]);
                      setCustomCategoryInput("");
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#14213D] hover:bg-[#167D78] transition-colors text-white text-xs font-bold shrink-0"
                >
                  + Tambah
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Tautan */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#167D78]/10 border border-[#167D78]/25 space-y-2">
              <label className="block text-xs font-extrabold uppercase text-[#167D78]">
                URL Google Drive / Media (HTTPS) *
              </label>
              <input
                type="url"
                value={mediaURL}
                onChange={(e) => setMediaURL(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#14213D]/15 text-sm outline-none focus:border-[#167D78]"
              />
              <p className="text-[11px] text-[#727782]">
                Pastikan izin berbagi pada Google Drive telah disetel: "Siapa saja yang memiliki tautan (Anyone with the link can view)".
              </p>
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
                URL Gambar Sampul / Link Foto Google Drive (Opsional)
              </label>
              <input
                type="url"
                value={thumbnailURL}
                onChange={(e) => setThumbnailURL(e.target.value)}
                placeholder="Tempel link Google Drive gambar atau kosongkan untuk memakai sampul resmi BAKARYA..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-sm outline-none focus:border-[#167D78]"
              />
              <p className="text-[11px] text-[#727782] mt-1">
                Mendukung tautan berbagi Google Drive (ID gambar akan diambil otomatis). Jika dikosongkan, sistem otomatis memakai gambar sampul resmi BAKARYA Gugus 2 HSU.
              </p>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#14213D]/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-[#14213D]/15 text-xs font-bold hover:bg-gray-100"
            >
              Kembali
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 rounded-xl bg-[#14213D] hover:bg-[#167D78] transition-colors text-white text-xs font-bold"
            >
              Lanjut
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => validateAndSubmit(false)}
                className="px-4 py-2 rounded-xl border border-[#14213D]/15 text-xs font-bold hover:bg-gray-100"
              >
                Simpan Draf
              </button>
              <button
                type="button"
                onClick={() => validateAndSubmit(true)}
                className="px-5 py-2 rounded-xl bg-[#167D78] hover:bg-[#14213D] transition-colors text-white text-xs font-bold shadow-md"
              >
                Ajukan Kurasi
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
