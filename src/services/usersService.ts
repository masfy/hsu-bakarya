import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { UserAccount } from "../types";

const USERS_COLLECTION = "users";

export async function fetchUsersFromFirestore(): Promise<UserAccount[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    const list: UserAccount[] = [];
    snapshot.forEach((d) => {
      list.push({ uid: d.id, ...d.data() } as UserAccount);
    });
    return list.length > 0 ? list : null;
  } catch (error) {
    console.warn("Gagal memuat pengguna dari Firestore:", error);
    return null;
  }
}

export async function saveUserToFirestore(user: UserAccount): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    await setDoc(userRef, user, { merge: true });
    return true;
  } catch (error) {
    console.error("Gagal menyimpan pengguna ke Firestore:", error);
    return false;
  }
}

export async function deleteUserInFirestore(userId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, { isDeleted: true, deletedAt: new Date().toISOString() });
    return true;
  } catch (error) {
    console.error("Gagal menghapus pengguna di Firestore:", error);
    return false;
  }
}
