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
    snapshot.forEach((d) => {
      const data = d.data() as UserAccount;
      if (!data.isDeleted) {
        list.push({ uid: d.id, ...data });
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
    // Sanitize to remove any undefined fields before sending to Firestore
    const cleanUser = JSON.parse(JSON.stringify(user));
    await setDoc(userRef, cleanUser, { merge: true });
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
    await deleteDoc(userRef);
    return true;
  } catch (error) {
    console.warn("deleteDoc pengguna gagal, mencoba soft delete...", error);
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, { isDeleted: true, deletedAt: new Date().toISOString() });
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
