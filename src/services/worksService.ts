import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  query,
  orderBy,
  where,
  addDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { Work, ModerationLog } from "../types";

const WORKS_COLLECTION = "works";
const MODERATION_LOGS_COLLECTION = "moderationLogs";

export async function fetchWorksFromFirestore(): Promise<Work[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snapshot = await getDocs(collection(db, WORKS_COLLECTION));
    const list: Work[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      if (!data.isDeleted) {
        list.push({ id: d.id, ...data } as Work);
      }
    });
    return list;
  } catch (error) {
    console.warn("Gagal memuat karya dari Firestore:", error);
    return null;
  }
}

export async function saveWorkToFirestore(work: Work): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const workRef = doc(db, WORKS_COLLECTION, work.id);
    await setDoc(workRef, work, { merge: true });
    return true;
  } catch (error) {
    console.error("Gagal menyimpan karya ke Firestore:", error);
    return false;
  }
}

export async function deleteWorkInFirestore(workId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const workRef = doc(db, WORKS_COLLECTION, workId);
    await updateDoc(workRef, { isDeleted: true });
    return true;
  } catch (error) {
    console.error("Gagal menghapus karya di Firestore:", error);
    return false;
  }
}

export async function incrementWorkViewsInFirestore(workId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const workRef = doc(db, WORKS_COLLECTION, workId);
    await updateDoc(workRef, { viewCount: increment(1) });
  } catch (error) {
    console.warn("Gagal increment views di Firestore:", error);
  }
}

export async function incrementWorkClicksInFirestore(workId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const workRef = doc(db, WORKS_COLLECTION, workId);
    await updateDoc(workRef, { outboundClickCount: increment(1) });
  } catch (error) {
    console.warn("Gagal increment clicks di Firestore:", error);
  }
}

export async function addModerationLogInFirestore(log: Omit<ModerationLog, "id">): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    await addDoc(collection(db, MODERATION_LOGS_COLLECTION), log);
  } catch (error) {
    console.warn("Gagal menyimpan log moderasi ke Firestore:", error);
  }
}
