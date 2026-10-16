import React from "react";
import { motion } from "framer-motion";
import { Lock, Shield, Database, Terminal, CheckCircle2, AlertTriangle } from "lucide-react";
import { CodeBlockCard } from "../components/common/CodeBlockCard";
import { isFirebaseConfigured } from "../services/firebase";

export function ArchitectureView() {
  const firestoreRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function getUserData() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data; }
    function hasRole(roles) { return isSignedIn() && getUserData().accountStatus == 'active' && (getUserData().role in roles); }
    function isAdmin() { return hasRole(['admin', 'superAdmin']); }

    // Karya Digital (Works)
    match /works/{workId} {
      allow read: if (resource.data.status == 'published' && resource.data.isDeleted == false) 
                  || isAdmin() 
                  || (isSignedIn() && resource.data.contributorId == request.auth.uid);
      allow create: if isSignedIn();
      allow update: if (isSignedIn() && resource.data.contributorId == request.auth.uid) || isAdmin();
      allow delete: if isAdmin();
    }

    // Profil Pengguna (Users)
    match /users/{userId} {
      allow read: if true;
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if (isSignedIn() && request.auth.uid == userId) || isAdmin();
      allow delete: if hasRole(['superAdmin']);
    }

    // Taksonomi
    match /subjects/{id} { allow read: if true; allow write: if isSignedIn(); }
    match /categories/{id} { allow read: if true; allow write: if isSignedIn(); }
    match /mediaTypes/{id} { allow read: if true; allow write: if isAdmin(); }
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

  const deployGuideCode = `# 1. Install Firebase CLI jika belum ada
npm install -g firebase-tools

# 2. Login ke akun Google
firebase login

# 3. Hubungkan project BAKARYA
firebase use --add

# 4. Deploy Security Rules & Composite Indexes
firebase deploy --only firestore:rules,firestore:indexes`;

  return (
    <motion.div
      key="arsitektur"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div className="bg-[#14213D] text-white p-6 sm:p-8 rounded-3xl space-y-3 shadow-xl border border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2B84B] text-[#14213D] text-xs font-extrabold uppercase">
          <Lock className="w-3.5 h-3.5" />
          <span>Eksklusif Super Admin</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
          Konfigurasi Cloud Firestore, Security Rules & Vercel
        </h1>
        <p className="text-xs sm:text-sm text-white/80 max-w-2xl">
          Dokumentasi teknis arsitektur basis data NoSQL Cloud Firestore, aturan keamanan deklaratif (Security Rules), serta indeks query untuk performa tinggi.
        </p>

        {/* Live Firebase status badge */}
        <div className="pt-2 flex items-center gap-2">
          {isFirebaseConfigured ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Firebase SDK Terhubung & Aktif</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Mode Demo Lokal Aktif (Silakan atur .env.local untuk menghubungkan Firebase produksi)</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CodeBlockCard title="firestore.rules" code={firestoreRulesCode} />
        <CodeBlockCard title="firestore.indexes.json" code={firestoreIndexesCode} />
      </div>

      <div className="space-y-4">
        <CodeBlockCard title="Deployment Command (Terminal)" code={deployGuideCode} />
      </div>
    </motion.div>
  );
}
