import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { UserAccount } from "../types";

const USERS_COLLECTION = "users";

export function deduplicateUsers(users: UserAccount[]): UserAccount[] {
  const map = new Map<string, UserAccount>();
  for (const u of users) {
    if (!u || u.isDeleted) continue;
    const emailKey = u.email ? u.email.trim().toLowerCase() : "";
    const key = emailKey || u.uid;

    if (map.has(key)) {
      const existing = map.get(key)!;
      // Jika salah satunya superAdmin, peran harus tetap superAdmin
      const isSuper = existing.role === "superAdmin" || u.role === "superAdmin";
      // Lebih utamakan UID Firebase Auth yang asli daripada mock uid-super-admin
      const preferredUid =
        existing.uid === "uid-super-admin" && u.uid !== "uid-super-admin"
          ? u.uid
          : existing.uid;

      map.set(key, {
        ...existing,
        ...u,
        uid: preferredUid,
        role: isSuper ? "superAdmin" : (u.role || existing.role),
        accountStatus: isSuper ? "active" : (u.accountStatus || existing.accountStatus),
      });
    } else {
      map.set(key, u);
    }
  }
  return Array.from(map.values());
}

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
        let avatar = data.avatar || "/default-avatar.png";
        if (avatar.includes("photo-1534528741775-53994a69daeb")) {
          avatar = "/default-avatar.png";
        }
        list.push({ uid, ...data, email: data.email || "", avatar });
      }
    });
    return deduplicateUsers(list);
  } catch (error) {
    console.warn("Gagal memuat pengguna dari Firestore:", error);
    return null;
  }
}

export function subscribeUsersFromFirestore(callback: (users: UserAccount[]) => void): () => void {
  if (!isFirebaseConfigured || !db) return () => {};
  try {
    const usersCol = collection(db, USERS_COLLECTION);
    const unsubscribe = onSnapshot(
      usersCol,
      (snapshot) => {
        const list: UserAccount[] = [];
        let deletedUids: string[] = [];
        try {
          deletedUids = JSON.parse(localStorage.getItem("bakarya_deleted_user_uids") || "[]");
        } catch {}

        snapshot.forEach((d) => {
          const data = d.data() as UserAccount;
          const uid = d.id;
          if (!data.isDeleted && !deletedUids.includes(uid) && !deletedUids.includes(data.uid)) {
            let avatar = data.avatar || "/default-avatar.png";
            if (avatar.includes("photo-1534528741775-53994a69daeb")) {
              avatar = "/default-avatar.png";
            }
            list.push({ uid, ...data, email: data.email || "", avatar });
          }
        });
        callback(deduplicateUsers(list));
      },
      (error) => {
        console.warn("Firestore users snapshot error:", error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Failed to subscribe to users in Firestore:", err);
    return () => {};
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
    if (!cleanUser.avatar || cleanUser.avatar.includes("photo-1534528741775-53994a69daeb")) {
      cleanUser.avatar = "/default-avatar.png";
    }
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
