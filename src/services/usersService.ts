import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { UserAccount } from "../types";

const USERS_COLLECTION = "users";

export async function fetchUsersFromFirestore(): Promise<UserAccount[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    const list: UserAccount[] = [];
    let deletedUids: string[] = [];
    try {
      deletedUids = JSON.parse(localStorage.getItem("bakarya_deleted_user_uids") || "[]");
    } catch {}

    snapshot.forEach((d) => {
      const data = d.data() as UserAccount;
      const uid = d.id;
      // Jangan masukkan jika akun berstatus isDeleted di Firestore atau ada dalam daftar akun terhapus
      if (!data.isDeleted && !deletedUids.includes(uid) && !deletedUids.includes(data.uid)) {
        list.push({ uid, ...data, email: data.email || "" });
      }
    });
    return list;
  } catch (error) {
    console.warn("Gagal memuat pengguna dari Firestore:", error);
    return null;
  }
}

export async function saveUserToFirestore(user: UserAccount): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    // Sanitize to remove any undefined fields and NEVER store plain passwords in Firestore database!
    const cleanUser = JSON.parse(JSON.stringify(user));
    delete cleanUser.tempPassword;
    delete cleanUser.password;
    await setDoc(userRef, cleanUser, { merge: true });
    return true;

  } catch (error) {
    console.error("Gagal menyimpan pengguna ke Firestore:", error);
    return false;
  }
}

export async function deleteUserInFirestore(userId: string): Promise<boolean> {
  // Catat langsung ke daftar akun terhapus di localStorage agar tidak pernah muncul lagi saat refresh
  try {
    const deleted: string[] = JSON.parse(localStorage.getItem("bakarya_deleted_user_uids") || "[]");
    if (!deleted.includes(userId)) {
      deleted.push(userId);
      localStorage.setItem("bakarya_deleted_user_uids", JSON.stringify(deleted));
    }
  } catch {}

  if (!isFirebaseConfigured || !db) return true;
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
    console.log("🔥 Akun pengguna berhasil dihapus permanen dari Firestore:", userId);
    return true;
  } catch (error) {
    console.warn("deleteDoc pengguna gagal di Firestore, mencoba soft delete...", error);
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await setDoc(userRef, { isDeleted: true, deletedAt: new Date().toISOString() }, { merge: true });
      return true;
    } catch (e2) {
      console.error("Gagal menghapus pengguna di Firestore:", e2);
      return false;
    }
  }
}

export async function deleteUserPermanentlyInFirestore(userId: string): Promise<boolean> {
  return deleteUserInFirestore(userId);
}
