import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  query,
  orderBy,
  where,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { Work, ModerationLog } from "../types";

const WORKS_COLLECTION = "works";
const MODERATION_LOGS_COLLECTION = "moderationLogs";

export function getDeletedWorkIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem("bakarya_deleted_work_ids") || "[]");
  } catch {
    return [];
  }
}

export function markWorkAsDeletedLocally(workId: string) {
  try {
    const deleted = getDeletedWorkIds();
    if (!deleted.includes(workId)) {
      deleted.push(workId);
      localStorage.setItem("bakarya_deleted_work_ids", JSON.stringify(deleted));
    }
    // Bersihkan juga langsung dari bakarya_cached_works agar tidak muncul saat re-render
    const cached = localStorage.getItem("bakarya_cached_works");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        const next = parsed.filter((w: Work) => w.id !== workId);
        localStorage.setItem("bakarya_cached_works", JSON.stringify(next));
      }
    }
  } catch {}
}

export async function fetchWorksFromFirestore(): Promise<Work[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snapshot = await getDocs(collection(db, WORKS_COLLECTION));
    const list: Work[] = [];
    const deletedIds = getDeletedWorkIds();
    snapshot.forEach((d) => {
      const data = d.data();
      const id = d.id;
      // Jangan masukkan jika terhapus di Firestore atau ada di daftar karya terhapus
      if (!data.isDeleted && !deletedIds.includes(id) && !deletedIds.includes(data.id)) {
        list.push({ id, ...data } as Work);
      }
    });
    return list;
  } catch (error) {
    console.warn("Gagal memuat karya dari Firestore:", error);
    return null;
  }
}

export function subscribeWorksFromFirestore(callback: (works: Work[]) => void): () => void {
  if (!isFirebaseConfigured || !db) return () => {};
  try {
    const worksCol = collection(db, WORKS_COLLECTION);
    const unsubscribe = onSnapshot(
      worksCol,
      (snapshot) => {
        const list: Work[] = [];
        const deletedIds = getDeletedWorkIds();
        snapshot.forEach((d) => {
          const data = d.data() as Work;
          const id = d.id;
          if (!data.isDeleted && !deletedIds.includes(id) && !deletedIds.includes(data.id)) {
            list.push({ id, ...data });
          }
        });
        callback(list);
      },
      (error) => {
        console.warn("Firestore works snapshot error:", error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Failed to subscribe to works in Firestore:", err);
    return () => {};
  }
}

export async function saveWorkToFirestore(work: Work): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const workRef = doc(db, WORKS_COLLECTION, work.id);
    const cleanWork = JSON.parse(JSON.stringify(work));
    await setDoc(workRef, cleanWork, { merge: true });
    return true;
  } catch (error) {
    console.error("Gagal menyimpan karya ke Firestore:", error);
    return false;
  }
}

export async function deleteWorkInFirestore(workId: string): Promise<boolean> {
  // Selalu catat ID karya terhapus di localStorage agar tidak pernah muncul lagi saat refresh
  markWorkAsDeletedLocally(workId);

  if (!isFirebaseConfigured || !db) return true;
  try {
    const workRef = doc(db, WORKS_COLLECTION, workId);
    await deleteDoc(workRef);
    console.log("🔥 Karya berhasil dihapus permanen dari Firestore:", workId);
    return true;
  } catch (error) {
    console.warn("deleteDoc gagal, mencoba soft delete isDeleted: true...", error);
    try {
      const workRef = doc(db, WORKS_COLLECTION, workId);
      await setDoc(workRef, { isDeleted: true, deletedAt: new Date().toISOString() }, { merge: true });
      return true;
    } catch (e2) {
      console.error("Gagal menghapus karya di Firestore:", e2);
      return false;
    }
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
