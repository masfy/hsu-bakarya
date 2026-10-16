import {
  collection,
  doc,
  setDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db, isFirebaseConfigured } from "./firebase";
import {
  CONTRIBUTORS,
  INITIAL_WORKS,
  INITIAL_CATEGORIES_DATA,
  INITIAL_SUBJECTS_DATA,
  INITIAL_MEDIA_TYPES,
} from "../data/initialData";
import { UserAccount, Work } from "../types";

export interface SeedResult {
  success: boolean;
  message: string;
  isPermissionError?: boolean;
  counts?: {
    users: number;
    works: number;
    categories: number;
    subjects: number;
    mediaTypes: number;
  };
}

/**
 * Inisialisasi & Seeding Database Cloud Firestore
 * @param mode 'full' untuk inisialisasi lengkap (karya + kategori + superadmin),
 *             'clean' untuk inisialisasi murni (hanya Super Admin alfyarnaim & taksonomi, 0 karya)
 */
export async function seedFirestoreDatabase(mode: "full" | "clean" = "full"): Promise<SeedResult> {
  if (!isFirebaseConfigured || !db) {
    return {
      success: false,
      message:
        "Firebase belum terhubung. Harap isi variabel konfigurasi VITE_FIREBASE_* di file .env.local terlebih dahulu.",
    };
  }

  // Jika Firebase Auth tersedia dan user belum login di SDK, otomatis login/buat akun Super Admin
  if (auth && !auth.currentUser) {
    try {
      await signInWithEmailAndPassword(auth, "alfyarnaim@gmail.com", "kadabakarya");
      console.log("🔥 Seed service: Berhasil login ke Firebase Auth sebagai Super Admin.");
    } catch (authErr: any) {
      if (
        authErr.code === "auth/user-not-found" ||
        authErr.code === "auth/invalid-credential" ||
        authErr.code === "auth/wrong-password"
      ) {
        try {
          await createUserWithEmailAndPassword(auth, "alfyarnaim@gmail.com", "kadabakarya");
          console.log("🔥 Seed service: Berhasil mendaftarkan akun Super Admin di Firebase Auth.");
        } catch (createErr) {
          console.warn("Seed service tidak dapat membuat user Auth:", createErr);
        }
      }
    }
  }

  try {
    const batch = writeBatch(db);

    // 1. Seed Taksonomi Kategori
    for (const cat of INITIAL_CATEGORIES_DATA) {
      const catRef = doc(db, "categories", cat.id);
      batch.set(catRef, cat, { merge: true });
    }

    // 2. Seed Taksonomi Mata Pelajaran
    for (const sub of INITIAL_SUBJECTS_DATA) {
      const subRef = doc(db, "subjects", sub.id);
      batch.set(subRef, sub, { merge: true });
    }

    // 3. Seed Format Jenis Media (tanpa fungsi ikon React)
    for (const med of INITIAL_MEDIA_TYPES) {
      const medRef = doc(db, "mediaTypes", med.id);
      batch.set(
        medRef,
        {
          id: med.id,
          name: med.name,
          slug: med.slug,
          description: med.description,
        },
        { merge: true }
      );
    }

    // 4. Seed Pengguna (Super Admin alfyarnaim@gmail.com dijamin ada)
    let usersToSeed: UserAccount[] = [];
    if (mode === "clean") {
      // Hanya Super Admin Alfyar Naim
      const superAdminUser = CONTRIBUTORS.find((u) => u.role === "superAdmin") || {
        uid: "uid-super-alfyarnaim",
        username: "alfyarnaim",
        tempPassword: "kadabakarya",
        displayName: "Alfyar Naim",
        email: "alfyarnaim@gmail.com",
        institution: "Fasilitator Digitalisasi",
        district: "Gugus 2 HSU",
        bio: "Fasilitator Digitalisasi & Super Admin Pengelola Utama Portal Pembelajaran Digital BAKARYA Gugus 2 HSU.",
        role: "superAdmin",
        accountStatus: "active",
        publicProfileEnabled: true,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        lastLoginAt: new Date().toLocaleString("id-ID"),
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      };
      usersToSeed = [superAdminUser];
    } else {
      usersToSeed = CONTRIBUTORS;
    }

    for (const user of usersToSeed) {
      const userRef = doc(db, "users", user.uid);
      batch.set(userRef, user, { merge: true });
    }

    // 5. Seed Karya
    let worksToSeed: Work[] = [];
    if (mode === "full") {
      worksToSeed = INITIAL_WORKS;
      for (const work of worksToSeed) {
        const workRef = doc(db, "works", work.id);
        batch.set(workRef, work, { merge: true });
      }
    }

    // Eksekusi Batch Commit ke Firestore
    await batch.commit();

    return {
      success: true,
      message:
        mode === "clean"
          ? "Database berhasil diinisialisasi bersih (Clean Slate)! Akun Super Admin alfyarnaim@gmail.com dan taksonomi telah aktif di Cloud Firestore. Koleksi karya 100% kosong (tanpa data mock)."
          : "Database berhasil diinisialisasi penuh dengan data kurasi Gugus 2 HSU dan Super Admin alfyarnaim@gmail.com.",
      counts: {
        users: usersToSeed.length,
        works: worksToSeed.length,
        categories: INITIAL_CATEGORIES_DATA.length,
        subjects: INITIAL_SUBJECTS_DATA.length,
        mediaTypes: INITIAL_MEDIA_TYPES.length,
      },
    };
  } catch (error: any) {
    console.error("Gagal melakukan seeding Firestore:", error);
    const isPermission =
      error?.code === "permission-denied" ||
      (error?.message && error.message.toLowerCase().includes("permission"));

    return {
      success: false,
      isPermissionError: isPermission,
      message: isPermission
        ? "Izin ditolak oleh Cloud Firestore (Missing or insufficient permissions). Aturan keamanan di Firebase Console Anda masih dalam status terkunci default ('allow read, write: if false;'). Buka Firebase Console > Firestore Database > Rules, ubah menjadi 'allow read, write: if true;' lalu Publish dan coba lagi."
        : `Gagal inisialisasi database: ${error?.message || "Terjadi kesalahan koneksi"}`,
    };
  }
}
