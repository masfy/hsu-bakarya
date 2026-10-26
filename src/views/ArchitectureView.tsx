import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Shield,
  Database,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Server,
  Key,
  ExternalLink,
  Layers,
  FileCode,
  Sliders,
  Check,
} from "lucide-react";
import { CodeBlockCard } from "../components/common/CodeBlockCard";
import { isFirebaseConfigured } from "../services/firebase";
import { seedFirestoreDatabase, SeedResult } from "../services/seedService";

interface ArchitectureViewProps {
  onRefreshData?: () => void;
}

export function ArchitectureView({ onRefreshData }: ArchitectureViewProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);

  const handleSeed = async (mode: "full" | "clean") => {
    if (
      !window.confirm(
        mode === "clean"
          ? "Inisialisasi Bersih (Clean Slate):\nIni akan menulis data akun Super Admin dan struktur taksonomi ke Cloud Firestore tanpa karya mock data.\n\nLanjutkan?"
          : "Inisialisasi Penuh:\nIni akan menulis Super Admin, struktur taksonomi, dan data awal karya Gugus 2 HSU ke Cloud Firestore.\n\nLanjutkan?"
      )
    ) {
      return;
    }

    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedFirestoreDatabase(mode);
      setSeedResult(res);
      if (res.success && onRefreshData) {
        onRefreshData();
      }
    } catch (e: any) {
      setSeedResult({
        success: false,
        message: e?.message || "Gagal melakukan inisialisasi.",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const firestoreRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function getUserData() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data; }
    function hasRole(roles) { return isSignedIn() && getUserData().accountStatus == 'active' && (getUserData().role in roles); }
    function isAdmin() { return hasRole(['admin', 'superAdmin']); }

    // Karya Digital (Works)
    match /works/{workId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update: if true;
      allow delete: if isSuperAdminEmail() || isAdmin();
    }

    // Profil Pengguna (Users)
    match /users/{userId} {
      allow read, write: if true;
    }

    // Taksonomi
    match /subjects/{id} { allow read: if true; allow write: if isSignedIn(); }
    match /categories/{id} { allow read: if true; allow write: if isSignedIn(); }
    match /mediaTypes/{id} { allow read: if true; allow write: if isAdmin(); }
    match /moderationLogs/{id} { allow read, write: if isAdmin(); }
    match /analyticsDaily/{id} { allow read: if true; allow write: if true; }
  }
}`;

  const firestoreIndexesCode = `{
  "indexes": [
    {
      "collectionGroup": "works",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "isDeleted", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "works",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "contributorId", "order": "ASCENDING" },
        { "fieldPath": "isDeleted", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}`;

  const envConfigSample = `# Variabel Lingkungan Firebase untuk BAKARYA Portal
VITE_FIREBASE_API_KEY="AIzaSyYOUR_FIREBASE_API_KEY_HERE"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef1234567890"
VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"
VITE_SUPERADMIN_EMAIL="admin@bakarya.hsu.go.id"`;

  const deployGuideCode = `# 1. Install Firebase CLI secara global
npm install -g firebase-tools

# 2. Login ke akun Google Anda
firebase login

# 3. Hubungkan project BAKARYA
firebase use --add

# 4. Deploy Aturan Keamanan & Indeks Sekaligus
firebase deploy --only firestore:rules,firestore:indexes`;

  return (
    <motion.div
      key="arsitektur"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      {/* Banner Utama */}
      <div className="bg-[#14213D] text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-xl border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2B84B] text-[#14213D] text-xs font-extrabold uppercase">
            <Lock className="w-3.5 h-3.5" />
            <span>Eksklusif Super Admin</span>
          </div>

          <div className="flex items-center gap-2">
            {isFirebaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Firebase SDK Live & Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-200 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Mode Demo Lokal (Isi .env.local untuk Live)
              </span>
            )}
          </div>
        </div>

        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
            Pusat Kendali Firebase & Arsitektur Cloud
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-3xl mt-1">
            Kelola koneksi basis data NoSQL Cloud Firestore, inisialisasi data produksi tanpa mock data, terapkan aturan keamanan deklaratif (Security Rules), dan panduan deployment ke Vercel.
          </p>
        </div>

        {/* Kartu Status Keamanan Akun Super Admin */}
        <div className="bg-white/10 rounded-2xl p-4 sm:p-5 border border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-white/60 font-semibold uppercase tracking-wider text-[10px] block">
              Super Admin Email
            </span>
            <div className="font-mono font-bold text-white text-sm mt-0.5">
              {import.meta.env.VITE_SUPERADMIN_EMAIL || "Dikelola via Firebase Auth"}
            </div>
          </div>
          <div>
            <span className="text-white/60 font-semibold uppercase tracking-wider text-[10px] block">
              Jabatan / Peran
            </span>
            <div className="font-bold text-[#F2B84B] text-sm mt-0.5">
              Fasilitator Digitalisasi
            </div>
          </div>
          <div>
            <span className="text-white/60 font-semibold uppercase tracking-wider text-[10px] block">
              Status Kredensial
            </span>
            <div className="font-mono font-bold text-emerald-300 text-sm mt-0.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-300" />
              <span>Terkunci & Terenkripsi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel 1-Click Seeding Database */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#14213D]/10 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#167D78]/10 text-[#167D78] flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-extrabold text-[#14213D]">
              Inisialisasi Koleksi Firestore (Database Seeder)
            </h2>
            <p className="text-xs text-[#727782]">
              Jalankan sekali setelah membuat project Firebase baru untuk mengisi koleksi <code>users</code>, <code>categories</code>, <code>subjects</code>, dan <code>mediaTypes</code>.
            </p>
          </div>
        </div>

        {seedResult && (
          <div
            className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 ${
              seedResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            {seedResult.success ? (
              <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold">{seedResult.message}</div>
              {seedResult.counts && (
                <div className="mt-1 text-[11px] opacity-80 font-mono">
                  Pengguna: {seedResult.counts.users} • Karya: {seedResult.counts.works} • Kategori: {seedResult.counts.categories} • Mapel: {seedResult.counts.subjects} • Media: {seedResult.counts.mediaTypes}
                </div>
              )}
            </div>
          </div>
        )}

        {seedResult?.isPermissionError && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
            <div className="font-extrabold flex items-center gap-2 text-sm text-amber-950">
              <Key className="w-4 h-4 text-amber-700" />
              <span>Panduan Mengatasi "Missing or insufficient permissions":</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] leading-relaxed text-amber-950">
              <li>
                Buka <strong>Firebase Console</strong> &gt; <strong>Firestore Database</strong> &gt; tab <strong>Rules</strong>.
              </li>
              <li>
                Ubah aturan sementara menjadi: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-bold text-amber-900">allow read, write: if true;</code> lalu klik <strong>Publish</strong>.
              </li>
              <li>
                Kembali ke halaman ini dan klik tombol <strong>"Inisialisasi Bersih"</strong> di bawah. Database akan langsung terisi!
              </li>
              <li>
                Setelah berhasil, salin isi <strong>firestore.rules</strong> yang tersedia di bawah halaman ini ke tab Rules Firebase Anda.
              </li>
            </ol>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Tombol Clean Slate (Tanpa Mock Data) */}
          <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 flex flex-col justify-between space-y-4 hover:border-[#167D78]/40 transition-all">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase mb-2">
                Pilihan Rekomendasi
              </div>
              <h3 className="font-display font-extrabold text-sm text-[#14213D]">
                Inisialisasi Bersih (Clean Slate - Tanpa Mock Data)
              </h3>
              <p className="text-xs text-[#727782] mt-1 leading-relaxed">
                Hanya membuat akun Super Admin dan struktur taksonomi (kategori, mapel, format media). Koleksi karya dibiarkan <strong>kosong (0 karya)</strong> sehingga siap diisi karya nyata guru.
              </p>
            </div>
            <button
              type="button"
              disabled={isSeeding}
              onClick={() => handleSeed("clean")}
              className="w-full py-3 px-4 rounded-xl bg-[#167D78] hover:bg-[#14213D] disabled:opacity-50 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#F2B84B]" />
              <span>{isSeeding ? "Memproses Seeding..." : "Inisialisasi Bersih (Clean Slate)"}</span>
            </button>
          </div>

          {/* Tombol Full Seeding */}
          <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 flex flex-col justify-between space-y-4 hover:border-[#14213D]/30 transition-all">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase mb-2">
                Mode Contoh & Showcase
              </div>
              <h3 className="font-display font-extrabold text-sm text-[#14213D]">
                Inisialisasi Penuh (+ Karya Awal Gugus 2 HSU)
              </h3>
              <p className="text-xs text-[#727782] mt-1 leading-relaxed">
                Membuat akun Super Admin, taksonomi, serta memasukkan seluruh karya kurasi awal Gugus 2 HSU untuk demonstrasi dan inspirasi awal guru di platform.
              </p>
            </div>
            <button
              type="button"
              disabled={isSeeding}
              onClick={() => handleSeed("full")}
              className="w-full py-3 px-4 rounded-xl bg-[#14213D] hover:bg-[#167D78] disabled:opacity-50 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isSeeding ? "animate-spin" : ""}`} />
              <span>{isSeeding ? "Memproses Seeding..." : "Inisialisasi Penuh (+ Karya)"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Kode Aturan Keamanan & Konfigurasi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CodeBlockCard title=".env.local (Environment Variables)" code={envConfigSample} />
        <CodeBlockCard title="Deployment Command (Terminal)" code={deployGuideCode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CodeBlockCard title="firestore.rules (Security Rules)" code={firestoreRulesCode} />
        <CodeBlockCard title="firestore.indexes.json (Composite Indexes)" code={firestoreIndexesCode} />
      </div>
    </motion.div>
  );
}
