import React, { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  UserRole,
  UserAccount,
  Work,
  WorkStatus,
  AccountStatus,
  Subject,
  Category,
  MediaType,
  DailyAnalytics,
  MonthlyAnalytics,
  ModerationLog,
  AuditLog,
  ToastInfo,
} from "./types";
import {
  HERO_ANIMATED_PHRASES,
  INITIAL_SUBJECTS_DATA,
  INITIAL_CATEGORIES_DATA,
  INITIAL_MEDIA_TYPES,
  CONTRIBUTORS,
  INITIAL_WORKS,
  INITIAL_DAILY_ANALYTICS,
  INITIAL_MONTHLY_ANALYTICS,
} from "./data/initialData";
import {
  getDriveDirectImageUrl,
  BAKARYA_LOGO_URL,
  BAKARYA_FAVICON_URL,
  BAKARYA_DEFAULT_THUMBNAIL_URL,
  BAKARYA_DEFAULT_AVATAR_URL,
} from "./utils/drive";
import { getWorkEffectiveTime, getWorkApprovalTime } from "./utils/date";
import { auth, isFirebaseConfigured, googleProvider } from "./services/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  fetchWorksFromFirestore,
  saveWorkToFirestore,
  deleteWorkInFirestore,
  incrementWorkViewsInFirestore,
  incrementWorkClicksInFirestore,
  addModerationLogInFirestore,
  getDeletedWorkIds,
  markWorkAsDeletedLocally,
  subscribeWorksFromFirestore,
} from "./services/worksService";
import {
  fetchUsersFromFirestore,
  saveUserToFirestore,
  deleteUserInFirestore,
  subscribeUsersFromFirestore,
  deduplicateUsers,
} from "./services/usersService";
import {
  fetchRealDailyAnalytics,
  recordRealVisit,
  recordRealOutboundClick,
} from "./services/analyticsService";

// Layout & Components
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { ToastNotification } from "./components/common/ToastNotification";

// Modals
import { WorkDetailModal } from "./components/modals/WorkDetailModal";
import { ShareWorkModal } from "./components/modals/ShareWorkModal";
import { ModerationDecisionModal } from "./components/modals/ModerationDecisionModal";
import { WorkFormWizardModal } from "./components/modals/WorkFormWizardModal";
import { UserAccountModal } from "./components/modals/UserAccountModal";
import { SelfProfileModal } from "./components/modals/SelfProfileModal";
import { GoogleAuthModal, GoogleAuthPayload } from "./components/modals/GoogleAuthModal";
import { ConfirmDeleteModal } from "./components/modals/ConfirmDeleteModal";
import { ConfirmDeleteWorkModal } from "./components/modals/ConfirmDeleteWorkModal";

// Views
import { HomeView } from "./views/HomeView";
import { ExploreView } from "./views/ExploreView";
import { ContributorsView } from "./views/ContributorsView";
import { DashboardView } from "./views/DashboardView";
import { UsersView } from "./views/UsersView";
import { AnalyticsView } from "./views/AnalyticsView";
import { GuideView } from "./views/GuideView";

// Batas Waktu Inaktivitas Akun: 30 Menit (1.800.000 ms)
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

// Helper validasi email Super Admin portal BAKARYA
export const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const configuredAdmin = import.meta.env.VITE_SUPERADMIN_EMAIL?.trim().toLowerCase();
  return (
    normalized === "alfyarnaim@gmail.com" ||
    normalized === "admin@bakarya.hsu.go.id" ||
    Boolean(configuredAdmin && normalized === configuredAdmin)
  );
};

export default function App() {
  const [role, setRole] = useState<UserRole>(() => {
    try {
      const lastActive = localStorage.getItem("bakarya_last_activity_time");
      if (lastActive && Date.now() - Number(lastActive) > INACTIVITY_TIMEOUT_MS) {
        localStorage.removeItem("bakarya_user_uid");
        localStorage.removeItem("bakarya_user_role");
        localStorage.removeItem("bakarya_last_activity_time");
        return "public";
      }
      const saved = localStorage.getItem("bakarya_user_role");
      return (saved as UserRole) || "public";
    } catch {
      return "public";
    }
  });
  const [loggedInUserUid, setLoggedInUserUid] = useState<string | null>(() => {
    try {
      const lastActive = localStorage.getItem("bakarya_last_activity_time");
      if (lastActive && Date.now() - Number(lastActive) > INACTIVITY_TIMEOUT_MS) {
        return null;
      }
      return localStorage.getItem("bakarya_user_uid") || null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const hash = window.location.hash.replace("#", "").trim();
      if (["beranda", "jelajah", "kontributor", "dashboard", "pengguna", "analitik", "panduan"].includes(hash)) {
        return hash;
      }
    } catch {}
    return "beranda";
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "").trim();
      if (["beranda", "jelajah", "kontributor", "dashboard", "pengguna", "analitik", "panduan"].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    try {
      window.location.hash = tab;
    } catch {}
    if (tab === "pengguna" || tab === "dashboard") {
      handleRefreshDataFromFirestore();
    }
  };

  const [works, setWorks] = useState<Work[]>(() => {
    let deletedWorkIds: string[] = [];
    try {
      deletedWorkIds = JSON.parse(localStorage.getItem("bakarya_deleted_work_ids") || "[]");
    } catch {}

    try {
      const cached = localStorage.getItem("bakarya_cached_works");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((w: Work) => !w.isDeleted && !deletedWorkIds.includes(w.id));
        }
      }
    } catch {}
    return isFirebaseConfigured
      ? []
      : INITIAL_WORKS.filter((w) => !w.isDeleted && !deletedWorkIds.includes(w.id));
  });

  const [usersList, setUsersList] = useState<UserAccount[]>(() => {
    let deletedUids: string[] = [];
    try {
      deletedUids = JSON.parse(localStorage.getItem("bakarya_deleted_user_uids") || "[]");
    } catch {}

    try {
      const cached = localStorage.getItem("bakarya_cached_users");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Bersihkan tempPassword lawas dari localStorage agar tidak mengunci pengguna
          const valid = parsed
            .filter((u: UserAccount) => !deletedUids.includes(u.uid) && !u.isDeleted)
            .map((u: UserAccount) => {
              const { tempPassword, ...safe } = u;
              if (isSuperAdminEmail(safe.email)) {
                safe.role = "superAdmin";
                safe.accountStatus = "active";
              }
              if (!safe.avatar || safe.avatar.includes("photo-1534528741775-53994a69daeb")) {
                safe.avatar = BAKARYA_DEFAULT_AVATAR_URL;
              }
              return safe;
            });
          return deduplicateUsers(valid);
        }
      }
    } catch {}
    if (isFirebaseConfigured) {
      const superAdmin = CONTRIBUTORS.find((u) => u.role === "superAdmin");
      return superAdmin && !deletedUids.includes(superAdmin.uid) ? [superAdmin] : [];
    }
    return deduplicateUsers(CONTRIBUTORS.filter((u) => !deletedUids.includes(u.uid) && !u.isDeleted));
  });

  // Sync usersList and works to localStorage as instant offline cache
  useEffect(() => {
    try {
      if (usersList && usersList.length > 0) {
        localStorage.setItem("bakarya_cached_users", JSON.stringify(usersList));
      }
    } catch {}
  }, [usersList]);

  useEffect(() => {
    try {
      if (works && works.length > 0) {
        localStorage.setItem("bakarya_cached_works", JSON.stringify(works));
      }
    } catch {}
  }, [works]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>(INITIAL_SUBJECTS_DATA);
  const [categoriesList, setCategoriesList] = useState<Category[]>(INITIAL_CATEGORIES_DATA);
  const [mediaTypesList, setMediaTypesList] = useState<MediaType[]>(INITIAL_MEDIA_TYPES);

  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [shareModalWork, setShareModalWork] = useState<Work | null>(null);
  const [selectedContributor, setSelectedContributor] = useState<UserAccount | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [moderationModalWork, setModerationModalWork] = useState<Work | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [userConfirmDelete, setUserConfirmDelete] = useState<UserAccount | null>(null);
  const [workConfirmDelete, setWorkConfirmDelete] = useState<Work | null>(null);
  const [isSelfProfileModalOpen, setIsSelfProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userFilterRole, setUserFilterRole] = useState("all");
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const [heroPhraseIdx, setHeroPhraseIdx] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMediaType, setSelectedMediaType] = useState("all");
  const [selectedContributorFilter, setSelectedContributorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [dailyStats, setDailyStats] = useState<DailyAnalytics[]>(() => {
    try {
      const cached = localStorage.getItem("bakarya_real_daily_analytics");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [monthlyStats] = useState<MonthlyAnalytics[]>(INITIAL_MONTHLY_ANALYTICS);
  const [sessionId, setSessionId] = useState("");
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>(() =>
    isFirebaseConfigured
      ? []
      : [
          {
            id: "mod-log-1",
            workId: "work-106",
            workTitle: "Kamus Visual Bersuara Bahasa Banjar Hulu — Indonesia untuk PAUD",
            actorName: "Admin Kurator Guru Banua",
            action: "revision_requested",
            previousStatus: "pending_review",
            newStatus: "revision_requested",
            note: "Mohon ubah izin tautan Google Drive menjadi 'Siapa saja yang memiliki tautan (Anyone with the link)'.",
            createdAt: "14 Okt 2026, 11:40 WITA",
          },
          {
            id: "mod-log-2",
            workId: "work-101",
            workTitle: "Petualangan Matematika di Rawa Lebak Amuntai",
            actorName: "Admin Kurator Guru Banua",
            action: "published",
            previousStatus: "pending_review",
            newStatus: "published",
            note: "Karya memenuhi standar kurasi dan sangat kontekstual.",
            createdAt: "11 Okt 2026, 14:20 WITA",
          },
        ]
  );

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    isFirebaseConfigured
      ? []
      : [
          {
            id: "aud-1",
            actorName: "Super Admin BAKARYA",
            action: "site_settings_updated",
            targetType: "siteSettings/general",
            summary: "Memperbarui zona waktu laporan ke Asia/Makassar (WITA)",
            createdAt: "01 Okt 2026, 08:00 WITA",
          },
          {
            id: "aud-2",
            actorName: "Admin Kurator Guru Banua",
            action: "work_published",
            targetType: "works/work-101",
            summary: "Menerbitkan karya 'Petualangan Matematika di Rawa Lebak Amuntai'",
            createdAt: "11 Okt 2026, 14:20 WITA",
          },
        ]
  );

  const handleRefreshDataFromFirestore = () => {
    fetchRealDailyAnalytics().then((realStats) => {
      if (realStats && realStats.length > 0) {
        setDailyStats(realStats);
      }
    });

    if (isFirebaseConfigured) {
      fetchWorksFromFirestore().then((remoteWorks) => {
        if (remoteWorks !== null) {
          const deletedWorkIds = getDeletedWorkIds();
          const validWorks = remoteWorks.filter(
            (w) => !w.isDeleted && !deletedWorkIds.includes(w.id)
          );
          setWorks(validWorks);
          try {
            localStorage.setItem("bakarya_cached_works", JSON.stringify(validWorks));
          } catch {}
        }
      });
      fetchUsersFromFirestore().then((remoteUsers) => {
        if (remoteUsers !== null) {
          let deletedUids: string[] = [];
          try {
            deletedUids = JSON.parse(localStorage.getItem("bakarya_deleted_user_uids") || "[]");
          } catch {}

          const activeRemote = remoteUsers.filter(
            (remote) => !deletedUids.includes(remote.uid) && !remote.isDeleted
          );
          const deduped = deduplicateUsers(activeRemote);
          setUsersList(deduped);
          try {
            localStorage.setItem("bakarya_cached_users", JSON.stringify(deduped));
          } catch {}
        }
      });
    }
  };

  // Real-time listener dari Cloud Firestore agar data karya & pengguna selalu sinkron seketika
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubWorks = subscribeWorksFromFirestore((remoteWorks) => {
      const deletedWorkIds = getDeletedWorkIds();
      const validWorks = remoteWorks.filter(
        (w) => !w.isDeleted && !deletedWorkIds.includes(w.id)
      );
      setWorks(validWorks);
      try {
        localStorage.setItem("bakarya_cached_works", JSON.stringify(validWorks));
      } catch {}
    });

    const unsubUsers = subscribeUsersFromFirestore((remoteUsers) => {
      let deletedUids: string[] = [];
      try {
        deletedUids = JSON.parse(localStorage.getItem("bakarya_deleted_user_uids") || "[]");
      } catch {}

      const activeRemote = remoteUsers.filter(
        (u) => !deletedUids.includes(u.uid) && !u.isDeleted
      );
      const deduped = deduplicateUsers(activeRemote);
      setUsersList(deduped);
      try {
        localStorage.setItem("bakarya_cached_users", JSON.stringify(deduped));
      } catch {}
    });

    return () => {
      unsubWorks();
      unsubUsers();
    };
  }, []);

  // Sync with Firestore if configured
  useEffect(() => {
    handleRefreshDataFromFirestore();
  }, []);

  // Listener Firebase Auth agar sesi tidak keluar otomatis
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const lastActiveStr = localStorage.getItem("bakarya_last_activity_time");
        if (lastActiveStr && Date.now() - Number(lastActiveStr) > INACTIVITY_TIMEOUT_MS) {
          handleLogout("inactivity");
          return;
        }

        const userEmail = firebaseUser.email?.toLowerCase();
        console.log("🔥 Sesi Firebase Auth terdeteksi aktif:", userEmail);

        const isSuper = isSuperAdminEmail(userEmail);

        let found = usersList.find(
          (u) => u.uid === firebaseUser.uid || (userEmail && Boolean(u.email) && u.email.toLowerCase() === userEmail)
        );

        if (!found) {
          const remoteUsers = await fetchUsersFromFirestore();
          if (remoteUsers) {
            setUsersList(remoteUsers);
            found = remoteUsers.find(
              (u) => u.uid === firebaseUser.uid || (userEmail && Boolean(u.email) && u.email.toLowerCase() === userEmail)
            );
          }
        }

        // Jika akun berstatus pending atau dibekukan, jangan beri akses masuk ke dashboard
        if (found && !isSuper) {
          if (found.accountStatus === "pending" || found.accountStatus === "suspended") {
            console.log("Akun belum disetujui / dibekukan, batalkan auto-login:", found.displayName);
            try {
              await signOut(auth);
            } catch {}
            setRole("public");
            setLoggedInUserUid(null);
            return;
          }
        }

        // Jika akun belum terdaftar sama sekali di database dan bukan superAdmin
        if (!found && !isSuper) {
          setRole("public");
          setLoggedInUserUid(null);
          return;
        }

        const effectiveRole: UserRole = isSuper ? "superAdmin" : (found?.role || "contributor");
        const effectiveUid = found?.uid || firebaseUser.uid;

        if (!found && isSuper) {
          found = {
            uid: firebaseUser.uid,
            username: userEmail?.split("@")[0].replace(/[^a-z0-9.]/g, "") || "alfyarnaim",
            displayName: firebaseUser.displayName || "Alfyar Naim",
            email: userEmail || "alfyarnaim@gmail.com",
            institution: "Inovator Komunitas Guru Banua Kalsel",
            district: "Amuntai Tengah, Kab. HSU",
            bio: "Inovator Komunitas Guru Banua & Super Admin Pengelola Portal Pembelajaran Digital BAKARYA Kalimantan Selatan.",
            role: "superAdmin",
            accountStatus: "active",
            publicProfileEnabled: true,
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            lastLoginAt: new Date().toLocaleString("id-ID"),
            avatar: firebaseUser.photoURL || BAKARYA_DEFAULT_AVATAR_URL,
          };
          saveUserToFirestore(found);
          setUsersList((prev) => deduplicateUsers([found!, ...prev.filter((u) => u.uid !== found!.uid)]));
        }

        setLoggedInUserUid(effectiveUid);
        setRole(effectiveRole);
        try {
          localStorage.setItem("bakarya_user_uid", effectiveUid);
          localStorage.setItem("bakarya_user_role", effectiveRole);
          if (!lastActiveStr) {
            localStorage.setItem("bakarya_last_activity_time", Date.now().toString());
          }
        } catch {}
      }
    });

    return () => unsubscribe();
  }, [usersList]);

  const handleLogout = async (reason: "inactivity" | "manual" = "manual") => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn("Gagal signOut dari Firebase Auth:", err);
      }
    }
    try {
      localStorage.removeItem("bakarya_user_uid");
      localStorage.removeItem("bakarya_user_role");
      localStorage.removeItem("bakarya_last_activity_time");
    } catch {}
    setRole("public");
    setLoggedInUserUid(null);
    setActiveTab("beranda");
    if (reason === "inactivity") {
      triggerToast(
        "Sesi Anda berakhir otomatis demi keamanan karena tidak ada aktivitas selama 30 menit.",
        "warning"
      );
    } else {
      triggerToast("Anda telah keluar dari sesi akun.", "info");
    }
  };

  // Proteksi Keamanan Akun: Auto-Logout jika 30 Menit Tidak Ada Aktivitas
  useEffect(() => {
    if (role === "public" || !loggedInUserUid) return;

    // Pastikan timestamp aktivitas awal tercatat
    if (!localStorage.getItem("bakarya_last_activity_time")) {
      try {
        localStorage.setItem("bakarya_last_activity_time", Date.now().toString());
      } catch {}
    }

    let lastRecordedActivity = Date.now();

    // Catat aktivitas pengguna (throttled tiap 8 detik agar performa ringan)
    const recordActivity = () => {
      const now = Date.now();
      if (now - lastRecordedActivity > 8000) {
        lastRecordedActivity = now;
        try {
          localStorage.setItem("bakarya_last_activity_time", now.toString());
        } catch {}
      }
    };

    // Event interaksi pengguna: mouse, klik, keyboard, sentuhan layar HP, scrolling
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "touchstart",
      "touchmove",
      "scroll",
      "click",
    ];

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, recordActivity, { passive: true });
    });

    // Pengecekan inaktivitas berkala setiap 20 detik
    const timerInterval = setInterval(() => {
      const lastActiveStr = localStorage.getItem("bakarya_last_activity_time");
      const lastActive = lastActiveStr ? Number(lastActiveStr) : lastRecordedActivity;
      const elapsed = Date.now() - lastActive;

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        clearInterval(timerInterval);
        handleLogout("inactivity");
      }
    }, 20000);

    // Saat tab dibuka kembali dari background/sleep
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const lastActiveStr = localStorage.getItem("bakarya_last_activity_time");
        if (lastActiveStr && Date.now() - Number(lastActiveStr) >= INACTIVITY_TIMEOUT_MS) {
          clearInterval(timerInterval);
          handleLogout("inactivity");
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, recordActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(timerInterval);
    };
  }, [role, loggedInUserUid]);

  // Set Session ID & Record Real Daily Traffic
  useEffect(() => {
    const generated = "sess_wita_" + Math.random().toString(36).substring(2, 9);
    setSessionId(generated);

    try {
      const sessionKey = "bakarya_visit_counted_" + new Date().toISOString().slice(0, 10);
      const isNewSession = !sessionStorage.getItem(sessionKey);
      if (isNewSession) {
        sessionStorage.setItem(sessionKey, "1");
      }
      recordRealVisit(isNewSession);
      fetchRealDailyAnalytics().then((realStats) => {
        if (realStats && realStats.length > 0) {
          setDailyStats(realStats);
        }
      });
    } catch (e) {
      console.warn("Real analytics tracking error:", e);
    }
  }, []);

  // Title, Favicon & Hero Phrase Rotation
  useEffect(() => {
    document.title = "BAKARYA — Banua Berkarya Digital (Guru Banua Kalsel)";
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = BAKARYA_FAVICON_URL || "/favicon.png";

    const interval = setInterval(() => {
      setHeroPhraseIdx((prev) => (prev + 1) % HERO_ANIMATED_PHRASES.length);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  // Proteksi Keamanan: Nonaktifkan Klik Kanan & Inspeksi Elemen (DevTools)
  useEffect(() => {
    let lastToastTime = 0;
    const notifyThrottled = (msg: string, type: "info" | "warning" = "info") => {
      const now = Date.now();
      if (now - lastToastTime > 2500) {
        lastToastTime = now;
        triggerToast(msg, type);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      notifyThrottled("Aksi klik kanan dinonaktifkan demi perlindungan karya pendidik.", "info");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // F12
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        notifyThrottled("Inspeksi elemen dinonaktifkan demi keamanan portal.", "warning");
        return;
      }

      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
      if (
        isCtrlOrMeta &&
        e.shiftKey &&
        ["I", "i", "J", "j", "C", "c"].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        notifyThrottled("Inspeksi elemen dinonaktifkan demi keamanan portal.", "warning");
        return;
      }

      // Ctrl+U (View Page Source)
      if (isCtrlOrMeta && ["U", "u"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        notifyThrottled("Melihat kode sumber (view-source) dinonaktifkan.", "info");
        return;
      }

      // Ctrl+S (Save Page)
      if (isCtrlOrMeta && ["S", "s"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Dynamic OpenGraph Image updater
  useEffect(() => {
    const activeWork = shareModalWork || selectedWork;
    const rawThumb = activeWork?.thumbnailURL || BAKARYA_DEFAULT_THUMBNAIL_URL;
    const resolvedThumb = getDriveDirectImageUrl(rawThumb, "w1200") || BAKARYA_DEFAULT_THUMBNAIL_URL;

    let ogImage = document.querySelector("meta[property='og:image']");
    if (!ogImage) {
      ogImage = document.createElement("meta");
      ogImage.setAttribute("property", "og:image");
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute("content", resolvedThumb);
  }, [selectedWork, shareModalWork]);

  const currentActiveUid = useMemo(() => {
    if (role === "public") return null;
    if (loggedInUserUid) {
      const found = usersList.find((u) => u.uid === loggedInUserUid && !u.isDeleted);
      if (found && found.role === role) return found.uid;
    }
    return role === "contributor"
      ? "uid-contrib-1"
      : role === "admin"
      ? "uid-admin-1"
      : role === "superAdmin"
      ? usersList.find((u) => u.role === "superAdmin")?.uid || "uid-super-admin"
      : null;
  }, [role, loggedInUserUid, usersList]);

  const currentUserProfile = useMemo(() => {
    if (!currentActiveUid) return null;
    return usersList.find((u) => u.uid === currentActiveUid) || null;
  }, [usersList, currentActiveUid]);

  const pendingUsersCount = useMemo(() => {
    return usersList.filter((u) => !u.isDeleted && u.accountStatus === "pending").length;
  }, [usersList]);

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const triggerToast = (message: string, type: "info" | "success" | "error" | "warning" = "info") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    const duration = type === "error" ? 6500 : 4500;
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
  };


  const handleAddCustomSubject = (rawName: string) => {
    const clean = rawName.trim();
    if (!clean) return null;
    const existing = subjectsList.find((s) => s.name.toLowerCase() === clean.toLowerCase());
    if (existing) return existing.id;
    const newId = "sub-" + clean.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-3);
    const created: Subject = { id: newId, name: clean };
    setSubjectsList((prev) => [...prev, created]);
    triggerToast(`Mapel "${clean}" ditambahkan.`);
    return newId;
  };

  const handleAddCustomCategory = (rawName: string) => {
    const clean = rawName.trim();
    if (!clean) return null;
    const existing = categoriesList.find((c) => c.name.toLowerCase() === clean.toLowerCase());
    if (existing) return existing.id;
    const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newId = "cat-" + slug + "-" + Date.now().toString().slice(-3);
    const created: Category = { id: newId, name: clean, slug };
    setCategoriesList((prev) => [...prev, created]);
    triggerToast(`Kategori "${clean}" ditambahkan.`);
    return newId;
  };

  const handleAddCustomMediaType = (rawName: string) => {
    const clean = rawName.trim();
    if (!clean) return null;
    const existing = mediaTypesList.find((m) => m.name.toLowerCase() === clean.toLowerCase());
    if (existing) return existing.id;
    const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newId = "media-" + slug + "-" + Date.now().toString().slice(-3);
    const created: MediaType = {
      id: newId,
      name: clean,
      slug,
      description: `Format media ${clean} karya pendidik Banua`,
      icon: Sparkles,
    };
    setMediaTypesList((prev) => [...prev, created]);
    triggerToast(`Jenis Media "${clean}" ditambahkan.`);
    return newId;
  };

  // Autentikasi Masuk Otomatis 1-Klik via Google
  const handleGoogleSignIn = async (): Promise<{
    success: boolean;
    isUnregistered?: boolean;
    googleProfile?: {
      uid: string;
      email: string;
      displayName: string;
      photoURL: string;
    };
    message?: string;
  }> => {
    if (!isFirebaseConfigured || !auth) {
      const msg = "Firebase Authentication belum terkonfigurasi di sistem.";
      triggerToast(msg, "error");
      return { success: false, message: msg };
    }

    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const googleUser = cred.user;
      const userEmail = (googleUser.email || "").trim().toLowerCase();
      const isSuper = isSuperAdminEmail(userEmail);
      const nowWITA = new Date().toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }) + " WITA";

      // Cari pengguna di state lokal atau Firestore
      let targetUser = usersList.find(
        (u) => !u.isDeleted && ((Boolean(u.email) && u.email.toLowerCase() === userEmail) || u.uid === googleUser.uid)
      );

      if (!targetUser) {
        const remoteUsers = await fetchUsersFromFirestore();
        if (remoteUsers) {
          setUsersList(remoteUsers);
          targetUser = remoteUsers.find(
            (u) => !u.isDeleted && ((Boolean(u.email) && u.email.toLowerCase() === userEmail) || u.uid === googleUser.uid)
          );
        }
      }

      // Jika Super Admin, selalu berikan akses Super Admin dan buat otomatis bila belum ada
      if (isSuper) {
        const targetUid = targetUser?.uid || googleUser.uid;
        if (!targetUser) {
          targetUser = {
            uid: targetUid,
            username: userEmail.split("@")[0].replace(/[^a-z0-9.]/g, "") || "alfyarnaim",
            displayName: googleUser.displayName || "Alfyar Naim",
            email: userEmail,
            institution: "Inovator Komunitas Guru Banua",
            district: "Amuntai Tengah, Kab. HSU",
            bio: "Pengembang Komunitas Belajar & Super Admin Pengelola Utama Portal Pembelajaran Digital BAKARYA Kalimantan Selatan.",
            role: "superAdmin",
            accountStatus: "active",
            publicProfileEnabled: true,
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            lastLoginAt: nowWITA,
            avatar: googleUser.photoURL || BAKARYA_DEFAULT_AVATAR_URL,
          };
          saveUserToFirestore(targetUser);
          setUsersList((prev) => [targetUser!, ...prev.filter((u) => u.uid !== targetUid)]);
        } else {
          if (targetUser.role !== "superAdmin") {
            targetUser = { ...targetUser, role: "superAdmin" };
            saveUserToFirestore(targetUser);
          }
          setUsersList((prev) =>
            prev.map((u) => (u.uid === targetUser!.uid ? { ...targetUser!, lastLoginAt: nowWITA } : u))
          );
        }

        setLoggedInUserUid(targetUid);
        setRole("superAdmin");
        try {
          localStorage.setItem("bakarya_user_uid", targetUid);
          localStorage.setItem("bakarya_user_role", "superAdmin");
          localStorage.setItem("bakarya_last_activity_time", Date.now().toString());
        } catch {}

        setActiveTab("dashboard");
        setIsAuthModalOpen(false);
        triggerToast(`Berhasil masuk! Selamat datang kembali, ${targetUser.displayName} (Super Admin)!`, "success");
        return { success: true };
      }

      // Jika akun pengguna ditemukan (kontributor / admin yang sudah terdaftar)
      if (targetUser) {
        if (targetUser.accountStatus === "pending") {
          const msg = `Halo ${targetUser.displayName}, akun Anda masih menunggu persetujuan Kurator Guru Banua.`;
          triggerToast(msg, "info");
          return { success: false, message: msg };
        }
        if (targetUser.accountStatus !== "active") {
          const msg = "Akses akun ini sedang dibekukan oleh Admin.";
          triggerToast(msg, "error");
          return { success: false, message: msg };
        }

        const targetUid = targetUser.uid;
        const targetRole = targetUser.role;

        setUsersList((prev) =>
          prev.map((u) => (u.uid === targetUid ? { ...u, lastLoginAt: nowWITA } : u))
        );
        setLoggedInUserUid(targetUid);
        setRole(targetRole);
        try {
          localStorage.setItem("bakarya_user_uid", targetUid);
          localStorage.setItem("bakarya_user_role", targetRole);
          localStorage.setItem("bakarya_last_activity_time", Date.now().toString());
        } catch {}

        setActiveTab("dashboard");
        setIsAuthModalOpen(false);
        triggerToast(`Selamat datang kembali, ${targetUser.displayName}!`, "success");
        return { success: true };
      }

      // Jika akun Google valid tapi BELUM terdaftar di portal
      return {
        success: false,
        isUnregistered: true,
        googleProfile: {
          uid: googleUser.uid,
          email: userEmail,
          displayName: googleUser.displayName || "",
          photoURL: googleUser.photoURL || "",
        },
        message: `Akun Google (${userEmail}) belum terdaftar. Silakan lengkapi data pendaftaran di bawah.`,
      };
    } catch (err: any) {
      console.error("Google Auth error:", err);
      let msg = "Gagal menghubungkan ke Akun Google.";
      if (err.code === "auth/popup-closed-by-user") {
        msg = "Jendela login Google ditutup sebelum proses selesai.";
      } else if (err.code === "auth/popup-blocked") {
        msg = "Jendela popup Google diblokir oleh browser. Izinkan pop-up pada peramban Anda.";
      } else if (err.code === "auth/cancelled-popup-request") {
        msg = "Proses login Google dibatalkan.";
      } else if (err.code === "auth/network-request-failed") {
        msg = "Gagal terhubung ke Google. Periksa koneksi internet Anda.";
      } else if (err.message) {
        msg = err.message;
      }
      triggerToast(msg, "error");
      return { success: false, message: msg };
    }
  };

  // Menyimpan kelengkapan data pendaftaran pengguna (Langkah 2)
  const handleCompleteRegistration = async (payload: GoogleAuthPayload): Promise<{ success: boolean; message?: string }> => {
    const userEmail = payload.email.trim().toLowerCase();
    const isSuper = isSuperAdminEmail(userEmail);
    const nowWITA = new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }) + " WITA";

    const usernameFromEmail = userEmail.split("@")[0].replace(/[^a-z0-9.]/g, "");
    const newContributor: UserAccount = {
      uid: payload.uid,
      username: usernameFromEmail || "guru.banua",
      displayName: payload.displayName,
      email: userEmail,
      institution: payload.institution,
      district: payload.district,
      bio: "Pendidik Kontributor Inovasi Pembelajaran Digital Banua Kalimantan Selatan.",
      role: isSuper ? "superAdmin" : "contributor",
      accountStatus: isSuper ? "active" : "pending",
      publicProfileEnabled: true,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      lastLoginAt: isSuper ? nowWITA : "Menunggu Kurasi Akun",
      avatar: payload.avatar || BAKARYA_DEFAULT_AVATAR_URL,
    };

    setUsersList((prev) => {
      const next = deduplicateUsers([newContributor, ...prev.filter((u) => u.uid !== payload.uid)]);
      try {
        localStorage.setItem("bakarya_cached_users", JSON.stringify(next));
      } catch {}
      return next;
    });

    if (isFirebaseConfigured) {
      await saveUserToFirestore(newContributor);
    }

    if (isSuper) {
      setLoggedInUserUid(newContributor.uid);
      setRole("superAdmin");
      try {
        localStorage.setItem("bakarya_user_uid", newContributor.uid);
        localStorage.setItem("bakarya_user_role", "superAdmin");
        localStorage.setItem("bakarya_last_activity_time", Date.now().toString());
      } catch {}
      setActiveTab("dashboard");
      setIsAuthModalOpen(false);
      triggerToast(`Selamat datang kembali, ${newContributor.displayName} (Super Admin)!`, "success");
      return { success: true };
    }

    // Pendaftar baru non-superadmin: keluarkan sesi agar tidak menggantung sebagai login
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch {}
    }
    setRole("public");
    setLoggedInUserUid(null);
    setIsAuthModalOpen(false);
    triggerToast(
      "Pendaftaran berhasil! Akun Anda telah terdaftar dan otomatis muncul di antrean persetujuan Tim Kurasi Admin.",
      "success"
    );
    return { success: true };
  };


  const handleUpdateUserRole = (targetUid: string, newRole: UserRole) => {
    if (role !== "superAdmin" && role !== "admin") {
      triggerToast("Anda tidak memiliki kewenangan mengubah peran pengguna.", "error");
      return;
    }
    const targetUser = usersList.find((u) => u.uid === targetUid);
    if (!targetUser) return;

    if (role === "admin" && (targetUser.role === "superAdmin" || newRole === "superAdmin")) {
      triggerToast("Admin hanya dapat mengatur peran Kontributor atau Admin Kurator.", "error");
      return;
    }

    const updated = { ...targetUser, role: newRole };
    setUsersList((prev) => prev.map((u) => (u.uid === targetUid ? updated : u)));
    if (isFirebaseConfigured) saveUserToFirestore(updated);

    triggerToast(`Hak akses ${targetUser.displayName} berhasil diubah menjadi ${newRole.toUpperCase()}.`, "success");
  };

  const handleUpdateAccountStatus = async (targetUid: string, newStatus: AccountStatus) => {
    const targetUser = usersList.find((u) => u.uid === targetUid);
    if (!targetUser) return;

    const updated = { ...targetUser, accountStatus: newStatus };
    setUsersList((prev) => {
      const next = prev.map((u) => (u.uid === targetUid ? updated : u));
      try {
        localStorage.setItem("bakarya_cached_users", JSON.stringify(next));
      } catch {}
      return next;
    });
    if (isFirebaseConfigured) {
      await saveUserToFirestore(updated);
    }

    const label =
      newStatus === "active"
        ? "disetujui dan aktif"
        : newStatus === "suspended"
        ? "dibekukan"
        : "menunggu kurasi";
    triggerToast(`Akun ${targetUser.displayName} berhasil ${label}.`, "success");
  };

  const handleDeleteUser = async (targetUid: string, mode: "soft" | "permanent" = "permanent") => {
    const targetUser = usersList.find((u) => u.uid === targetUid);
    if (!targetUser) return;

    // Simpan UID ke daftar terhapus agar tidak muncul kembali setelah refresh
    try {
      const deleted: string[] = JSON.parse(localStorage.getItem("bakarya_deleted_user_uids") || "[]");
      if (!deleted.includes(targetUid)) {
        deleted.push(targetUid);
        localStorage.setItem("bakarya_deleted_user_uids", JSON.stringify(deleted));
      }
    } catch {}

    if (mode === "permanent") {
      setUsersList((prev) => {
        const next = prev.filter((u) => u.uid !== targetUid);
        try {
          localStorage.setItem("bakarya_cached_users", JSON.stringify(next));
        } catch {}
        return next;
      });

      let firestoreDeleted = true;
      if (isFirebaseConfigured) {
        firestoreDeleted = await deleteUserInFirestore(targetUid);
      }

      if (firestoreDeleted) {
        triggerToast(`Akun ${targetUser.displayName} telah dihapus permanen.`, "success");
      } else {
        triggerToast(
          `Akun ${targetUser.displayName} dihapus dari daftar lokal. Catatan: Firestore di cloud menolak penghapusan. Pastikan aturan 'allow read, write: if true;' telah di-Publish di Firebase Console.`,
          "warning"
        );
      }
    } else {
      const updated: UserAccount = {
        ...targetUser,
        isDeleted: true,
        accountStatus: "suspended",
        deletedAt: new Date().toISOString(),
        deletedBy: currentUserProfile?.displayName || "Admin",
      };
      setUsersList((prev) => {
        const next = prev.map((u) => (u.uid === targetUid ? updated : u));
        try {
          localStorage.setItem("bakarya_cached_users", JSON.stringify(next));
        } catch {}
        return next;
      });
      if (isFirebaseConfigured) saveUserToFirestore(updated);
      triggerToast(`Akun ${targetUser.displayName} dinonaktifkan (akses dibekukan).`, "info");
    }
    setUserConfirmDelete(null);
  };

  const handleRestoreUser = (targetUid: string) => {
    const targetUser = usersList.find((u) => u.uid === targetUid);
    if (!targetUser) return;

    // Hapus dari daftar terhapus
    try {
      const deleted: string[] = JSON.parse(localStorage.getItem("bakarya_deleted_user_uids") || "[]");
      const nextDeleted = deleted.filter((id) => id !== targetUid);
      localStorage.setItem("bakarya_deleted_user_uids", JSON.stringify(nextDeleted));
    } catch {}

    const updated: UserAccount = {
      ...targetUser,
      isDeleted: false,
      accountStatus: "active",
      deletedAt: null,
      deletedBy: null,
    };
    setUsersList((prev) => {
      const next = prev.map((u) => (u.uid === targetUid ? updated : u));
      try {
        localStorage.setItem("bakarya_cached_users", JSON.stringify(next));
      } catch {}
      return next;
    });
    if (isFirebaseConfigured) saveUserToFirestore(updated);

    triggerToast(`Akun ${targetUser.displayName} berhasil dipulihkan & aktif kembali!`, "success");
  };

  const filteredPublicWorks = useMemo(() => {
    return works
      .filter((w) => {
        if (w.status !== "published" || w.isDeleted) return false;

        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          w.title.toLowerCase().includes(q) ||
          w.shortDescription.toLowerCase().includes(q) ||
          w.contributorNameSnapshot.toLowerCase().includes(q);

        const matchesLevel =
          selectedLevel === "all" || w.educationLevelIds.includes(selectedLevel);
        const matchesClass =
          selectedClass === "all" || w.classIds.includes(selectedClass);
        const matchesSubject =
          selectedSubject === "all" || w.subjectIds.includes(selectedSubject);
        const matchesCategory =
          selectedCategory === "all" || w.categoryIds.includes(selectedCategory);
        const matchesMedia =
          selectedMediaType === "all" || w.mediaTypeId === selectedMediaType;
        const matchesContributor =
          selectedContributorFilter === "all" ||
          w.contributorId === selectedContributorFilter;

        return (
          matchesQuery &&
          matchesLevel &&
          matchesClass &&
          matchesSubject &&
          matchesCategory &&
          matchesMedia &&
          matchesContributor
        );
      })
      .sort((a, b) => {
        if (sortBy === "popular") {
          const clicksA = (a.outboundClickCount || 0) * 2 + (a.viewCount || 0);
          const clicksB = (b.outboundClickCount || 0) * 2 + (b.viewCount || 0);
          if (clicksB !== clicksA) return clicksB - clicksA;
        }

        // Pengurutan "Terbaru" diprioritaskan berdasarkan media yang terakhir disetujui / di-approve (publishedAt)
        const timeA = getWorkApprovalTime(a);
        const timeB = getWorkApprovalTime(b);
        if (timeB !== timeA) return timeB - timeA;
        return b.id.localeCompare(a.id);
      });
  }, [
    works,
    searchQuery,
    selectedLevel,
    selectedClass,
    selectedSubject,
    selectedCategory,
    selectedMediaType,
    selectedContributorFilter,
    sortBy,
  ]);

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedLevel("all");
    setSelectedClass("all");
    setSelectedSubject("all");
    setSelectedCategory("all");
    setSelectedMediaType("all");
    setSelectedContributorFilter("all");
  };

  const handleOpenWorkDetail = (work: Work) => {
    setWorks((prev) =>
      prev.map((w) => (w.id === work.id ? { ...w, viewCount: w.viewCount + 1 } : w))
    );
    setSelectedWork({ ...work, viewCount: work.viewCount + 1 });
    if (isFirebaseConfigured) {
      incrementWorkViewsInFirestore(work.id);
    }
  };

  const handleOutboundClick = (work: Work) => {
    setWorks((prev) =>
      prev.map((w) =>
        w.id === work.id ? { ...w, outboundClickCount: (w.outboundClickCount || 0) + 1 } : w
      )
    );
    recordRealOutboundClick();
    if (isFirebaseConfigured) {
      incrementWorkClicksInFirestore(work.id);
    }
  };

  const handleModerationDecision = (workId: string, newStatus: WorkStatus, note: string) => {
    const targetWork = works.find((w) => w.id === workId);
    if (!targetWork) return;

    const nowWITA = new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" }) + " WITA";
    const actor = role === "superAdmin" ? "Super Admin BAKARYA" : "Admin Kurator Guru Banua";

    const updatedWork: Work = {
      ...targetWork,
      status: newStatus,
      moderationNote: note,
      updatedAt: nowWITA,
      publishedAt: newStatus === "published" ? nowWITA : targetWork.publishedAt,
    };

    setWorks((prev) => prev.map((w) => (w.id === workId ? updatedWork : w)));

    const newLog: ModerationLog = {
      id: "mod-log-" + Date.now(),
      workId,
      workTitle: targetWork.title,
      actorName: actor,
      action: newStatus as any,
      previousStatus: targetWork.status,
      newStatus: newStatus,
      note,
      createdAt: nowWITA,
    };
    setModerationLogs((prev) => [newLog, ...prev]);

    if (isFirebaseConfigured) {
      saveWorkToFirestore(updatedWork);
      addModerationLogInFirestore(newLog);
    }

    setModerationModalWork(null);
    triggerToast(`Keputusan moderasi berhasil disimpan (${newStatus.toUpperCase()}).`, "success");
  };

  const handleDeleteWork = async (work: Work) => {
    if (role !== "admin" && role !== "superAdmin") {
      triggerToast("Hanya Admin dan Super Admin yang memiliki kewenangan menghapus karya.", "error");
      return;
    }

    // Catat karya terhapus secara permanen di cache lokal agar tidak pernah hidup kembali saat reload
    markWorkAsDeletedLocally(work.id);
    setWorks((prev) => {
      const next = prev.filter((w) => w.id !== work.id);
      try {
        localStorage.setItem("bakarya_cached_works", JSON.stringify(next));
      } catch {}
      return next;
    });
    if (selectedWork?.id === work.id) {
      setSelectedWork(null);
    }
    setWorkConfirmDelete(null);

    let firestoreDeleted = true;
    if (isFirebaseConfigured) {
      firestoreDeleted = await deleteWorkInFirestore(work.id);
    }

    if (firestoreDeleted) {
      triggerToast(`Karya "${work.title}" berhasil dihapus permanen dari sistem BAKARYA.`, "success");
    } else {
      triggerToast(
        `Karya "${work.title}" telah dihapus secara lokal dan dibekukan.`,
        "warning"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#20252D] font-sans selection:bg-[#167D78] selection:text-white flex flex-col justify-between w-full max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />

      {/* Header / Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        role={role}
        setRole={setRole}
        setLoggedInUserUid={setLoggedInUserUid}
        pendingUsersCount={pendingUsersCount}
        currentUserProfile={currentUserProfile}
        onOpenAuthModal={(m) => {
          setAuthModalMode(m);
          setIsAuthModalOpen(true);
        }}
        onOpenSelfProfileModal={() => setIsSelfProfileModalOpen(true)}
        onOpenUploadModal={() => {
          setEditingWork(null);
          setIsFormModalOpen(true);
        }}
        onToast={triggerToast}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "beranda" && (
            <HomeView
              works={works}
              usersList={usersList}
              mediaTypesList={mediaTypesList}
              filteredPublicWorks={filteredPublicWorks}
              dailyStats={dailyStats}
              monthlyStats={monthlyStats}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              setSelectedMediaType={setSelectedMediaType}
              resetAllFilters={resetAllFilters}
              setActiveTab={setActiveTab}
              sortBy={sortBy}
              setSortBy={setSortBy}
              role={role}
              heroPhraseIdx={heroPhraseIdx}
              currentUserProfile={currentUserProfile}
              onOpenUploadModal={() => {
                setEditingWork(null);
                setIsFormModalOpen(true);
              }}
              onOpenWorkDetail={handleOpenWorkDetail}
              onShareWork={(w) => setShareModalWork(w)}
              onSelectContributor={(c) => {
                resetAllFilters();
                setSelectedContributorFilter(c.uid);
                setActiveTab("jelajah");
              }}
              onOpenAuthModal={(m) => {
                setAuthModalMode(m);
                setIsAuthModalOpen(true);
              }}
            />
          )}

          {activeTab === "jelajah" && (
            <ExploreView
              filteredPublicWorks={filteredPublicWorks}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedMediaType={selectedMediaType}
              setSelectedMediaType={setSelectedMediaType}
              selectedContributorFilter={selectedContributorFilter}
              setSelectedContributorFilter={setSelectedContributorFilter}
              subjectsList={subjectsList}
              categoriesList={categoriesList}
              mediaTypesList={mediaTypesList}
              usersList={usersList}
              resetAllFilters={resetAllFilters}
              onOpenWorkDetail={handleOpenWorkDetail}
              onShareWork={(w) => setShareModalWork(w)}
              onSelectContributor={(c) => {
                resetAllFilters();
                setSelectedContributorFilter(c.uid);
              }}
            />
          )}

          {activeTab === "kontributor" && (
            <ContributorsView
              usersList={usersList}
              works={works}
              resetAllFilters={resetAllFilters}
              setSelectedContributorFilter={setSelectedContributorFilter}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "dashboard" && (
            <DashboardView
              role={role}
              currentUserProfile={currentUserProfile}
              works={works}
              usersList={usersList}
              onOpenWorkDetail={handleOpenWorkDetail}
              onOpenUploadModal={() => {
                setEditingWork(null);
                setIsFormModalOpen(true);
              }}
              onEditWork={(w) => {
                setEditingWork(w);
                setIsFormModalOpen(true);
              }}
              onDeleteWork={(w) => setWorkConfirmDelete(w)}
              onOpenModerationModal={(w) => setModerationModalWork(w)}
              onQuickSubmitReview={(workId) =>
                handleModerationDecision(
                  workId,
                  "pending_review",
                  "Kontributor telah memperbarui karya dan mengajukan peninjauan ulang."
                )
              }
              onOpenSelfProfileModal={() => setIsSelfProfileModalOpen(true)}
              onOpenAuthModal={(m) => {
                setAuthModalMode(m);
                setIsAuthModalOpen(true);
              }}
              setActiveTab={handleSetActiveTab}
            />
          )}

          {activeTab === "pengguna" && (role === "admin" || role === "superAdmin") && (
            <UsersView
              role={role}
              usersList={usersList}
              works={works}
              userSearchQuery={userSearchQuery}
              setUserSearchQuery={setUserSearchQuery}
              userFilterRole={userFilterRole}
              setUserFilterRole={setUserFilterRole}
              showDeletedUsers={showDeletedUsers}
              setShowDeletedUsers={setShowDeletedUsers}
              visiblePasswords={visiblePasswords}
              setVisiblePasswords={setVisiblePasswords}
              onOpenAddUserModal={() => {
                setEditingUser(null);
                setIsUserModalOpen(true);
              }}
              onEditUser={(u) => {
                setEditingUser(u);
                setIsUserModalOpen(true);
              }}
              onConfirmDeleteUser={(u) => setUserConfirmDelete(u)}
              onUpdateUserRole={handleUpdateUserRole}
              onUpdateAccountStatus={handleUpdateAccountStatus}
              onRestoreUser={handleRestoreUser}
            />
          )}

          {activeTab === "analitik" && (
            <AnalyticsView
              works={works}
              usersList={usersList}
              categoriesList={categoriesList}
              subjectsList={subjectsList}
              mediaTypesList={mediaTypesList}
              dailyStats={dailyStats}
              monthlyStats={monthlyStats}
              onOpenWorkDetail={handleOpenWorkDetail}
            />
          )}

          {activeTab === "panduan" && <GuideView />}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer setActiveTab={handleSetActiveTab} />

      {/* MODALS */}
      <AnimatePresence>
        {selectedWork && (
          <WorkDetailModal
            work={selectedWork}
            onClose={() => setSelectedWork(null)}
            onShare={(w) => setShareModalWork(w)}
            onOutboundClick={handleOutboundClick}
            canEdit={
              role === "admin" ||
              role === "superAdmin" ||
              (role !== "public" && currentUserProfile?.uid === selectedWork.contributorId)
            }
            onEdit={(w) => {
              setSelectedWork(null);
              setEditingWork(w);
              setIsFormModalOpen(true);
            }}
            canDelete={role === "admin" || role === "superAdmin"}
            onDelete={(w) => {
              setSelectedWork(null);
              setWorkConfirmDelete(w);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shareModalWork && (
          <ShareWorkModal
            work={shareModalWork}
            mediaTypesList={mediaTypesList}
            onClose={() => setShareModalWork(null)}
            onCopied={() => triggerToast("Tautan & ringkasan karya berhasil disalin!", "success")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {moderationModalWork && (
          <ModerationDecisionModal
            work={moderationModalWork}
            onClose={() => setModerationModalWork(null)}
            onConfirm={handleModerationDecision}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFormModalOpen && (
          <WorkFormWizardModal
            initialData={editingWork}
            subjectsList={subjectsList}
            categoriesList={categoriesList}
            mediaTypesList={mediaTypesList}
            userRole={role}
            onAddSubject={handleAddCustomSubject}
            onAddCategory={handleAddCustomCategory}
            onAddMediaType={handleAddCustomMediaType}
            onClose={() => setIsFormModalOpen(false)}
            onSave={async (payload, action) => {
              const nowWITA = new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" }) + " WITA";
              const resolvedThumb = payload.thumbnailURL?.trim()
                ? getDriveDirectImageUrl(payload.thumbnailURL)
                : getDriveDirectImageUrl(payload.mediaURL) !== payload.mediaURL
                ? getDriveDirectImageUrl(payload.mediaURL)
                : BAKARYA_DEFAULT_THUMBNAIL_URL;

              const targetStatus: WorkStatus =
                action === "publish"
                  ? "published"
                  : action === "review"
                  ? "pending_review"
                  : "draft";

              if (editingWork) {
                const targetClasses =
                  payload.classIds && payload.classIds.length > 0
                    ? payload.classIds
                    : editingWork.classIds || ["k4"];

                const updated: Work = {
                  ...editingWork,
                  ...payload,
                  classIds: targetClasses,
                  thumbnailURL: resolvedThumb,
                  status: targetStatus,
                  updatedAt: nowWITA,
                  submittedAt: action === "review" ? nowWITA : editingWork.submittedAt,
                  publishedAt: action === "publish" ? (editingWork.publishedAt || nowWITA) : editingWork.publishedAt,
                } as Work;

                setWorks((prev) => prev.map((w) => (w.id === editingWork.id ? updated : w)));
                if (isFirebaseConfigured) await saveWorkToFirestore(updated);
                triggerToast(
                  targetStatus === "published"
                    ? "Perubahan karya disimpan & berhasil diterbitkan!"
                    : targetStatus === "pending_review"
                    ? "Karya diajukan ke kurator!"
                    : "Draf berhasil disimpan.",
                  "success"
                );
              } else {
                const defaultContribId =
                  currentUserProfile?.uid ||
                  (role === "admin"
                    ? "uid-admin-1"
                    : role === "superAdmin"
                    ? usersList.find((u) => u.role === "superAdmin")?.uid || "uid-super-admin"
                    : "uid-contrib-1");
                const defaultContribName =
                  currentUserProfile?.displayName ||
                  (role === "admin"
                    ? "Admin Kurator Guru Banua"
                    : role === "superAdmin"
                    ? usersList.find((u) => u.role === "superAdmin")?.displayName || "Super Admin BAKARYA"
                    : "Siti Rahmah, S.Pd.");
                const defaultInstitution =
                  currentUserProfile?.institution || "Kabupaten Hulu Sungai Utara";

                const newWork: Work = {
                  id: "work-" + Date.now(),
                  title: payload.title || "Karya Baru",
                  slug: (payload.title || "karya-baru").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  shortDescription: payload.shortDescription || "",
                  description: payload.description || "",
                  thumbnailURL: resolvedThumb,
                  mediaURL: payload.mediaURL || "",
                  mediaTypeId: payload.mediaTypeId || "game",
                  categoryIds: payload.categoryIds || ["cat-ekologi"],
                  educationLevelIds: payload.educationLevelIds || ["sd"],
                  classIds: payload.classIds && payload.classIds.length > 0 ? payload.classIds : ["k4"],
                  subjectIds: payload.subjectIds || ["matematika"],
                  contributorId: defaultContribId,
                  contributorNameSnapshot: defaultContribName,
                  contributorInstitution: defaultInstitution,
                  status: targetStatus,
                  moderationNote: "",
                  viewCount: 0,
                  outboundClickCount: 0,
                  createdAt: nowWITA,
                  updatedAt: nowWITA,
                  submittedAt: action === "review" ? nowWITA : null,
                  publishedAt: action === "publish" ? nowWITA : null,
                  isDeleted: false,
                };

                setWorks((prev) => [newWork, ...prev]);
                if (isFirebaseConfigured) await saveWorkToFirestore(newWork);
                triggerToast(
                  targetStatus === "published"
                    ? "Karya baru berhasil diterbitkan langsung dan kini tampil di Beranda!"
                    : targetStatus === "pending_review"
                    ? "Karya baru berhasil diajukan ke kurator! Anda dapat memantau statusnya di menu Dashboard."
                    : "Karya baru disimpan sebagai Draf.",
                  "success"
                );
              }
              setIsFormModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isUserModalOpen && (
          <UserAccountModal
            key={editingUser ? editingUser.uid : "new-user-modal"}
            initialData={editingUser}
            currentRole={role}
            onClose={() => setIsUserModalOpen(false)}
            onSave={async (userData) => {
              const nowWITA = new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" }) + " WITA";
              if (editingUser) {
                const updatedDistrict = (userData.district || "").trim() || editingUser.district || "Amuntai Tengah";
                const updated = {
                  ...editingUser,
                  ...userData,
                  district: updatedDistrict,
                  updatedAt: nowWITA,
                } as UserAccount;

                // Update local state immediately
                setUsersList((prev) => prev.map((u) => (u.uid === editingUser.uid ? updated : u)));

                // Persist to Cloud Firestore
                if (isFirebaseConfigured) {
                  const saved = await saveUserToFirestore(updated);
                  if (!saved) {
                    triggerToast("Peringatan: Gagal menyimpan ke Firestore. Pastikan Firestore Rules telah di-Publish.", "error");
                  }
                }
                triggerToast(`Akun ${userData.displayName} berhasil diperbarui (${updatedDistrict})!`, "success");
              } else {
                const newDistrict = (userData.district || "").trim() || "Amuntai Tengah";
                const newUser: UserAccount = {
                  uid: "uid-user-" + Date.now(),
                  ...userData,
                  district: newDistrict,
                  avatar: userData.avatar || BAKARYA_DEFAULT_AVATAR_URL,
                  publicProfileEnabled: true,
                  isDeleted: false,
                  deletedAt: null,
                  deletedBy: null,
                  lastLoginAt: "Belum pernah login",
                } as UserAccount;

                setUsersList((prev) => [newUser, ...prev]);
                if (isFirebaseConfigured) {
                  await saveUserToFirestore(newUser);
                }
                triggerToast(`Akun ${userData.displayName} berhasil ditambahkan (${newDistrict})!`, "success");
              }
              setIsUserModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSelfProfileModalOpen && currentUserProfile && (
          <SelfProfileModal
            key={currentUserProfile.uid}
            user={currentUserProfile}
            onClose={() => setIsSelfProfileModalOpen(false)}
            onSave={async (updatedFields) => {
              const updatedDistrict = (updatedFields.district || "").trim() || currentUserProfile.district || "Amuntai Tengah";
              const updated = {
                ...currentUserProfile,
                ...updatedFields,
                district: updatedDistrict,
              };
              setUsersList((prev) =>
                prev.map((u) => (u.uid === currentUserProfile.uid ? updated : u))
              );
              if (isFirebaseConfigured) {
                const saved = await saveUserToFirestore(updated);
                if (!saved) {
                  triggerToast("Peringatan: Gagal menyimpan profil ke Firestore. Pastikan Firestore Rules telah di-Publish.", "error");
                }
              }
              setIsSelfProfileModalOpen(false);
              triggerToast(`Profil dan foto Anda berhasil diperbarui (${updatedDistrict})!`, "success");
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthModalOpen && (
          <GoogleAuthModal
            initialMode={authModalMode}
            usersList={usersList}
            onClose={() => setIsAuthModalOpen(false)}
            onGoogleSignIn={handleGoogleSignIn}
            onCompleteRegistration={handleCompleteRegistration}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {userConfirmDelete && (
          <ConfirmDeleteModal
            user={userConfirmDelete}
            role={role}
            onClose={() => setUserConfirmDelete(null)}
            onConfirm={handleDeleteUser}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {workConfirmDelete && (
          <ConfirmDeleteWorkModal
            work={workConfirmDelete}
            role={role}
            onClose={() => setWorkConfirmDelete(null)}
            onConfirm={handleDeleteWork}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
