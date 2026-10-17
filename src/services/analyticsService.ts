import {
  collection,
  doc,
  getDocs,
  setDoc,
  increment,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { DailyAnalytics } from "../types";

const ANALYTICS_DAILY_COLLECTION = "analyticsDaily";

// Format tanggal Indonesia ringkas: "18 Okt"
export function formatIndonesianDateKey(date: Date = new Date()): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export function getDateDocId(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Generate rentang 7 hari terakhir nyata
export function generateRealSevenDaysTimeline(): DailyAnalytics[] {
  const result: DailyAnalytics[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateKey = formatIndonesianDateKey(d);
    result.push({
      dateKey,
      visits: 0,
      pageViews: 0,
      uniqueVisitorsEstimate: 0,
      outboundClicks: 0,
    });
  }

  return result;
}

// Catat kunjungan pengunjung nyata
export async function recordRealVisit(isNewSession: boolean): Promise<void> {
  const docId = getDateDocId();
  const dateKey = formatIndonesianDateKey();

  // Catat juga ke cache lokal
  try {
    const cached = localStorage.getItem("bakarya_real_daily_analytics");
    let list: DailyAnalytics[] = cached ? JSON.parse(cached) : generateRealSevenDaysTimeline();

    let todayItem = list.find((item) => item.dateKey === dateKey);
    if (!todayItem) {
      todayItem = {
        dateKey,
        visits: 0,
        pageViews: 0,
        uniqueVisitorsEstimate: 0,
        outboundClicks: 0,
      };
      list.push(todayItem);
      if (list.length > 7) list = list.slice(-7);
    }

    if (isNewSession) {
      todayItem.visits = (todayItem.visits || 0) + 1;
      todayItem.uniqueVisitorsEstimate = (todayItem.uniqueVisitorsEstimate || 0) + 1;
    }
    todayItem.pageViews = (todayItem.pageViews || 0) + 1;

    localStorage.setItem("bakarya_real_daily_analytics", JSON.stringify(list));
  } catch (err) {
    console.warn("Gagal mencatat analitik lokal:", err);
  }

  // Catat ke Cloud Firestore
  if (!isFirebaseConfigured || !db) return;
  try {
    const ref = doc(db, ANALYTICS_DAILY_COLLECTION, docId);
    const payload: Record<string, any> = {
      dateKey,
      dateId: docId,
      pageViews: increment(1),
      updatedAt: new Date().toISOString(),
    };
    if (isNewSession) {
      payload.visits = increment(1);
      payload.uniqueVisitorsEstimate = increment(1);
    }
    await setDoc(ref, payload, { merge: true });
  } catch (error) {
    console.warn("Gagal update real visit ke Firestore:", error);
  }
}

// Catat klik link keluar (media karya)
export async function recordRealOutboundClick(): Promise<void> {
  const docId = getDateDocId();
  const dateKey = formatIndonesianDateKey();

  try {
    const cached = localStorage.getItem("bakarya_real_daily_analytics");
    if (cached) {
      const list: DailyAnalytics[] = JSON.parse(cached);
      const todayItem = list.find((item) => item.dateKey === dateKey);
      if (todayItem) {
        todayItem.outboundClicks = (todayItem.outboundClicks || 0) + 1;
        localStorage.setItem("bakarya_real_daily_analytics", JSON.stringify(list));
      }
    }
  } catch {}

  if (!isFirebaseConfigured || !db) return;
  try {
    const ref = doc(db, ANALYTICS_DAILY_COLLECTION, docId);
    await setDoc(
      ref,
      {
        dateKey,
        dateId: docId,
        outboundClicks: increment(1),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn("Gagal update outbound click ke Firestore:", error);
  }
}

// Ambil data statistik harian nyata dari Firestore
export async function fetchRealDailyAnalytics(): Promise<DailyAnalytics[]> {
  const timeline = generateRealSevenDaysTimeline();

  // Cek cache lokal dulu
  try {
    const cached = localStorage.getItem("bakarya_real_daily_analytics");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Gabungkan timeline 7 hari dengan data cache
        timeline.forEach((day, idx) => {
          const match = parsed.find((p) => p.dateKey === day.dateKey);
          if (match) {
            timeline[idx] = { ...day, ...match };
          }
        });
      }
    }
  } catch {}

  if (!isFirebaseConfigured || !db) return timeline;

  try {
    const q = query(
      collection(db, ANALYTICS_DAILY_COLLECTION),
      orderBy("dateId", "desc"),
      limit(7)
    );
    const snap = await getDocs(q);
    const remoteDocs: DailyAnalytics[] = [];

    snap.forEach((d) => {
      const data = d.data();
      remoteDocs.push({
        dateKey: data.dateKey || formatIndonesianDateKey(),
        visits: Number(data.visits || 0),
        pageViews: Number(data.pageViews || 0),
        uniqueVisitorsEstimate: Number(data.uniqueVisitorsEstimate || 0),
        outboundClicks: Number(data.outboundClicks || 0),
      });
    });

    if (remoteDocs.length > 0) {
      // Petakan ke 7 hari terakhir
      timeline.forEach((day, idx) => {
        const match = remoteDocs.find((r) => r.dateKey === day.dateKey);
        if (match) {
          timeline[idx] = { ...day, ...match };
        }
      });
      try {
        localStorage.setItem("bakarya_real_daily_analytics", JSON.stringify(timeline));
      } catch {}
    }

    return timeline;
  } catch (error) {
    console.warn("Gagal memuat analitik harian dari Firestore:", error);
    return timeline;
  }
}
