import React, { useState, useEffect, useMemo } from "react";
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
} from "./utils/drive";
import { auth, isFirebaseConfigured } from "./services/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
} from "./services/worksService";
import {
  fetchUsersFromFirestore,
  saveUserToFirestore,
  deleteUserInFirestore,
} from "./services/usersService";

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
import { GoogleAuthModal } from "./components/modals/GoogleAuthModal";
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
import { ArchitectureView } from "./views/ArchitectureView";

export default function App() {
  const [role, setRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("bakarya_user_role");
      return (saved as UserRole) || "public";
    } catch {
      return "public";
    }
  });
  const [loggedInUserUid, setLoggedInUserUid] = useState<string | null>(() => {
    try {
      return localStorage.getItem("bakarya_user_uid") || null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const hash = window.location.hash.replace("#", "").trim();
      if (["beranda", "jelajah", "kontributor", "dashboard", "pengguna", "analitik", "panduan", "arsitektur"].includes(hash)) {
        return hash;
      }
    } catch {}
    return "beranda";
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "").trim();
      if (["beranda", "jelajah", "kontributor", "dashboard", "pengguna", "analitik", "panduan", "arsitektur"].includes(hash)) {
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
  };

  const [works, setWorks] = useState<Work[]>(() => {
    try {
      const cached = localStorage.getItem("bakarya_cached_works");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return isFirebaseConfigured ? [] : INITIAL_WORKS;
  });

  const [usersList, setUsersList] = useState<UserAccount[]>(() => {
    try {
      const cached = localStorage.getItem("bakarya_cached_users");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    if (isFirebaseConfigured) {
      const superAdmin = CONTRIBUTORS.find((u) => u.role === "superAdmin");
      return superAdmin ? [superAdmin] : [];
    }
    return CONTRIBUTORS;
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

  const [dailyStats, setDailyStats] = useState<DailyAnalytics[]>(INITIAL_DAILY_ANALYTICS);
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
            actorName: "Admin Kurator Disdik HSU",
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
            actorName: "Admin Kurator Disdik HSU",
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
            actorName: "Admin Kurator Disdik HSU",
            action: "work_published",
            targetType: "works/work-101",
            summary: "Menerbitkan karya 'Petualangan Matematika di Rawa Lebak Amuntai'",
            createdAt: "11 Okt 2026, 14:20 WITA",
          },
        ]
  );

  const handleRefreshDataFromFirestore = () => {
    if (isFirebaseConfigured) {
      fetchWorksFromFirestore().then((remoteWorks) => {
        if (remoteWorks !== null) {
          setWorks(remoteWorks);
        }
      });
      fetchUsersFromFirestore().then((remoteUsers) => {
        if (remoteUsers !== null && remoteUsers.length > 0) {
          setUsersList((prev) => {
            const merged = remoteUsers.map((remote) => {
              const local = prev.find((p) => p.uid === remote.uid);
              if (
                local &&
                local.district &&
                local.district !== "Kec. Amuntai Tengah, HSU" &&
                (!remote.district || remote.district === "Kec. Amuntai Tengah, HSU")
              ) {
                return { ...remote, district: local.district };
              }
              return remote;
            });
            return merged;
          });
        }
      });
    }
  };

  // Sync with Firestore if configured
  useEffect(() => {
    handleRefreshDataFromFirestore();
  }, []);

  // Listener Firebase Auth agar sesi tidak keluar otomatis
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userEmail = firebaseUser.email?.toLowerCase();
        console.log("🔥 Sesi Firebase Auth terdeteksi aktif:", userEmail);

        let found = usersList.find(
          (u) => u.uid === firebaseUser.uid || (userEmail && u.email.toLowerCase() === userEmail)
        );

        if (!found) {
          const remoteUsers = await fetchUsersFromFirestore();
          if (remoteUsers) {
            setUsersList(remoteUsers);
            found = remoteUsers.find(
              (u) => u.uid === firebaseUser.uid || (userEmail && u.email.toLowerCase() === userEmail)
            );
          }
        }

        if (found) {
          if (found.accountStatus === "active") {
            setLoggedInUserUid(found.uid);
            setRole(found.role);
            try {
              localStorage.setItem("bakarya_user_uid", found.uid);
              localStorage.setItem("bakarya_user_role", found.role);
            } catch {}
          }
        } else if (userEmail === "alfyarnaim@gmail.com") {
          setRole("superAdmin");
          setLoggedInUserUid("uid-super-alfyarnaim");
          try {
            localStorage.setItem("bakarya_user_uid", "uid-super-alfyarnaim");
            localStorage.setItem("bakarya_user_role", "superAdmin");
          } catch {}
        }
      }
    });

    return () => unsubscribe();
  }, [usersList]);

  const handleLogout = async () => {
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
    } catch {}
    setRole("public");
    setLoggedInUserUid(null);
    setActiveTab("beranda");
    triggerToast("Anda telah keluar dari sesi akun.", "info");
  };

  // Set Session ID & Increment Daily Traffic
  useEffect(() => {
    const generated = "sess_wita_" + Math.random().toString(36).substring(2, 9);
    setSessionId(generated);

    try {
      const sessionKey = "bakarya_visit_counted_" + new Date().toISOString().slice(0, 10);
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "1");
        setDailyStats((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            const last = { ...updated[updated.length - 1] };
            last.visits = (last.visits || 0) + 1;
            last.pageViews = (last.pageViews || 0) + 1;
            updated[updated.length - 1] = last;
          }
          return updated;
        });
      }
    } catch {}
  }, []);

  // Title, Favicon & Hero Phrase Rotation
  useEffect(() => {
    document.title = "BAKARYA — Banua Berkarya Digital (Gugus 2 HSU)";
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
      ? "uid-super-1"
      : null;
  }, [role, loggedInUserUid, usersList]);

  const currentUserProfile = useMemo(() => {
    if (!currentActiveUid) return null;
    return usersList.find((u) => u.uid === currentActiveUid) || null;
  }, [usersList, currentActiveUid]);

  const pendingUsersCount = useMemo(() => {
    return usersList.filter((u) => !u.isDeleted && u.accountStatus === "pending").length;
  }, [usersList]);

  const triggerToast = (message: string, type: "info" | "success" | "error" | "warning" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4200);
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

  const handleGoogleLoginOrRegister = async (payload: {
    mode: "login" | "register";
    email: string;
    password?: string;
    displayName: string;
    institution: string;
    district: string;
  }) => {
    const nowWITA = "16 Okt 2026, 22:00 WITA";
    const normalizedEmail = payload.email.trim().toLowerCase();
    const existing = usersList.find(
      (u) => !u.isDeleted && u.email.toLowerCase() === normalizedEmail
    );

    if (payload.mode === "login") {
      let targetUser = existing;

      // Jika user belum ada di state lokal tapi Firebase terhubung, coba cek Firebase Auth & Firestore
      if (!targetUser && isFirebaseConfigured) {
        if (auth && payload.password) {
          try {
            const authUser = await signInWithEmailAndPassword(auth, normalizedEmail, payload.password);
            const remoteUsers = await fetchUsersFromFirestore();
            if (remoteUsers) {
              setUsersList(remoteUsers);
              targetUser = remoteUsers.find(
                (u) => u.email.toLowerCase() === normalizedEmail || u.uid === authUser.user.uid
              );
            }
          } catch (e: any) {
            console.warn("Gagal login Firebase Auth langsung:", e);
          }
        }
      }

      if (!targetUser) {
        triggerToast(
          "Email belum terdaftar. Silakan gunakan tab 'Daftar' untuk membuat akun baru.",
          "error"
        );
        return;
      }

      // Validasi kata sandi jika user mengisi atau akun memiliki kata sandi terdaftar
      if (payload.password && targetUser.tempPassword) {
        if (payload.password !== targetUser.tempPassword) {
          triggerToast("Kata sandi yang Anda masukkan salah. Silakan coba lagi.", "error");
          return;
        }
      }

      if (targetUser.accountStatus === "pending") {
        triggerToast(
          `Halo ${targetUser.displayName}, akun Anda masih menunggu persetujuan Admin Kurator.`,
          "info"
        );
        return;
      }
      if (targetUser.accountStatus !== "active") {
        triggerToast("Akses akun ini sedang dibekukan oleh Admin.", "error");
        return;
      }

      // Otentikasi sesi live ke Firebase Auth jika aktif
      if (isFirebaseConfigured && auth && payload.password) {
        try {
          await signInWithEmailAndPassword(auth, normalizedEmail, payload.password);
          console.log("🔥 Berhasil masuk ke sesi Firebase Auth:", normalizedEmail);
        } catch (authErr: any) {
          if (
            authErr.code === "auth/user-not-found" ||
            authErr.code === "auth/invalid-credential"
          ) {
            try {
              await createUserWithEmailAndPassword(auth, normalizedEmail, payload.password);
              console.log("🔥 Berhasil membuat sesi Firebase Auth baru:", normalizedEmail);
            } catch (createErr) {
              console.warn("Gagal auto-create Firebase Auth:", createErr);
            }
          }
        }
      }

      setUsersList((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, lastLoginAt: nowWITA } : u))
      );
      setLoggedInUserUid(targetUser.uid);
      setRole(targetUser.role);
      try {
        localStorage.setItem("bakarya_user_uid", targetUser.uid);
        localStorage.setItem("bakarya_user_role", targetUser.role);
      } catch {}
      setActiveTab("dashboard");
      setIsAuthModalOpen(false);
      triggerToast(`Selamat datang kembali, ${targetUser.displayName}!`, "success");
      return;
    }

    // Register mode
    if (existing) {
      if (existing.accountStatus === "active") {
        setLoggedInUserUid(existing.uid);
        setRole(existing.role);
        try {
          localStorage.setItem("bakarya_user_uid", existing.uid);
          localStorage.setItem("bakarya_user_role", existing.role);
        } catch {}
        setActiveTab("dashboard");
        setIsAuthModalOpen(false);
        triggerToast(`Akun Anda sudah aktif! Masuk sebagai ${existing.displayName}.`, "success");
      } else {
        triggerToast(
          `Akun ${existing.email} sudah terdaftar dan sedang menunggu persetujuan Admin.`,
          "info"
        );
      }
      return;
    }

    let newUid = "uid-google-" + Date.now();

    // 1. Buat akun kredensial di Firebase Auth jika Firebase aktif & ada password
    if (isFirebaseConfigured && auth && payload.password) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, normalizedEmail, payload.password);
        newUid = userCred.user.uid;
        console.log("🔥 Berhasil mendaftarkan akun di Firebase Auth:", normalizedEmail, newUid);
      } catch (authErr: any) {
        console.warn("Peringatan pembuatan user Firebase Auth:", authErr);
        if (authErr.code === "auth/email-already-in-use") {
          try {
            const userCred = await signInWithEmailAndPassword(auth, normalizedEmail, payload.password);
            newUid = userCred.user.uid;
          } catch (loginErr) {
            triggerToast("Alamat email ini sudah terdaftar di Firebase Auth. Silakan gunakan tab Masuk.", "error");
            return;
          }
        } else if (authErr.code === "auth/weak-password") {
          triggerToast("Kata sandi terlalu pendek. Gunakan minimal 6 karakter.", "error");
          return;
        }
      }
    }

    const usernameFromEmail = normalizedEmail.split("@")[0].replace(/[^a-z0-9.]/g, "");
    const newGoogleContributor: UserAccount = {
      uid: newUid,
      username: usernameFromEmail || "guru.bakarya",
      tempPassword: payload.password || "", // KATA SANDI TERSIMPAN SECARA NYATA
      displayName: payload.displayName,
      email: normalizedEmail,
      institution: payload.institution,
      district: payload.district || "Kab. Hulu Sungai Utara",
      bio: "Pendidik peserta pengembangan karya pembelajaran digital BAKARYA Hulu Sungai Utara.",
      role: "contributor",
      accountStatus: "pending",
      publicProfileEnabled: true,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      lastLoginAt: "Menunggu Persetujuan Admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    };

    setUsersList((prev) => [newGoogleContributor, ...prev]);
    if (isFirebaseConfigured) {
      await saveUserToFirestore(newGoogleContributor);
    }

    setIsAuthModalOpen(false);
    triggerToast(
      "Pendaftaran berhasil! Kata sandi telah disimpan. Akun Anda sedang menunggu persetujuan Admin.",
      "success"
    );
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

  const handleUpdateAccountStatus = (targetUid: string, newStatus: AccountStatus) => {
    const targetUser = usersList.find((u) => u.uid === targetUid);
    if (!targetUser) return;

    const updated = { ...targetUser, accountStatus: newStatus };
    setUsersList((prev) => prev.map((u) => (u.uid === targetUid ? updated : u)));
    if (isFirebaseConfigured) saveUserToFirestore(updated);

    triggerToast(`Status akses akun ${targetUser.displayName} disetel ke: ${newStatus.toUpperCase()}.`, "success");
  };

  const handleDeleteUser = async (targetUid: string, mode: "soft" | "permanent" = "permanent") => {
    const targetUser = usersList.find((u) => u.uid === targetUid);
    if (!targetUser) return;

    if (mode === "permanent") {
      setUsersList((prev) => prev.filter((u) => u.uid !== targetUid));
      if (isFirebaseConfigured) {
        await deleteUserInFirestore(targetUid);
      }
      triggerToast(`Akun ${targetUser.displayName} telah dihapus permanen dari Firebase.`, "info");
    } else {
      const updated: UserAccount = {
        ...targetUser,
        isDeleted: true,
        accountStatus: "suspended",
        deletedAt: new Date().toISOString(),
        deletedBy: currentUserProfile?.displayName || "Admin",
      };
      setUsersList((prev) => prev.map((u) => (u.uid === targetUid ? updated : u)));
      if (isFirebaseConfigured) saveUserToFirestore(updated);
      triggerToast(`Akun ${targetUser.displayName} dinonaktifkan (akses dibekukan).`, "info");
    }
    setUserConfirmDelete(null);
  };

  const handleRestoreUser = (targetUid: string) => {
    const targetUser = usersList.find((u) => u.uid === targetUid);
    if (!targetUser) return;

    const updated: UserAccount = {
      ...targetUser,
      isDeleted: false,
      accountStatus: "active",
      deletedAt: null,
      deletedBy: null,
    };
    setUsersList((prev) => prev.map((u) => (u.uid === targetUid ? updated : u)));
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
        if (sortBy === "popular") return b.viewCount - a.viewCount;
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
        w.id === work.id ? { ...w, outboundClickCount: w.outboundClickCount + 1 } : w
      )
    );
    if (isFirebaseConfigured) {
      incrementWorkClicksInFirestore(work.id);
    }
  };

  const handleModerationDecision = (workId: string, newStatus: WorkStatus, note: string) => {
    const targetWork = works.find((w) => w.id === workId);
    if (!targetWork) return;

    const nowWITA = "16 Okt 2026, 08:40 WITA";
    const actor = role === "superAdmin" ? "Super Admin BAKARYA" : "Admin Kurator Disdik HSU";

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

    try {
      if (isFirebaseConfigured) {
        await deleteWorkInFirestore(work.id);
      }
      setWorks((prev) => prev.filter((w) => w.id !== work.id));
      if (selectedWork?.id === work.id) {
        setSelectedWork(null);
      }
      setWorkConfirmDelete(null);
      triggerToast(`Karya "${work.title}" berhasil dihapus dari sistem BAKARYA.`, "success");
    } catch (err) {
      console.error("Gagal menghapus karya:", err);
      triggerToast("Terjadi kendala saat menghapus karya di Firestore.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#20252D] font-sans selection:bg-[#167D78] selection:text-white flex flex-col justify-between">
      {/* Toast Notification */}
      <ToastNotification toast={toast} />

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
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full">
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

          {activeTab === "arsitektur" && role === "superAdmin" && (
            <ArchitectureView onRefreshData={handleRefreshDataFromFirestore} />
          )}
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
            onAddSubject={handleAddCustomSubject}
            onAddCategory={handleAddCustomCategory}
            onAddMediaType={handleAddCustomMediaType}
            onClose={() => setIsFormModalOpen(false)}
            onSave={async (payload, submitForReview) => {
              const nowWITA = new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" }) + " WITA";
              const resolvedThumb = payload.thumbnailURL?.trim()
                ? getDriveDirectImageUrl(payload.thumbnailURL)
                : getDriveDirectImageUrl(payload.mediaURL) !== payload.mediaURL
                ? getDriveDirectImageUrl(payload.mediaURL)
                : BAKARYA_DEFAULT_THUMBNAIL_URL;

              if (editingWork) {
                const isAlreadyPublished = editingWork.status === "published";
                const targetClasses =
                  payload.classIds && payload.classIds.length > 0
                    ? payload.classIds
                    : editingWork.classIds || ["k4"];

                const updated: Work = {
                  ...editingWork,
                  ...payload,
                  classIds: targetClasses,
                  thumbnailURL: resolvedThumb,
                  status: isAlreadyPublished
                    ? "published"
                    : submitForReview
                    ? "pending_review"
                    : "draft",
                  updatedAt: nowWITA,
                  submittedAt: submitForReview ? nowWITA : editingWork.submittedAt,
                } as Work;

                setWorks((prev) => prev.map((w) => (w.id === editingWork.id ? updated : w)));
                if (isFirebaseConfigured) await saveWorkToFirestore(updated);
                triggerToast(
                  isAlreadyPublished
                    ? "Perubahan karya & tautan media berhasil disimpan!"
                    : submitForReview
                    ? "Karya diajukan ke Admin Kurator!"
                    : "Draf disimpan.",
                  "success"
                );
              } else {
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
                  contributorId: currentUserProfile?.uid || "uid-contrib-1",
                  contributorNameSnapshot: currentUserProfile?.displayName || "Siti Rahmah, S.Pd.",
                  contributorInstitution: currentUserProfile?.institution || "SDN Paliwara 1 Amuntai",
                  status: submitForReview ? "pending_review" : "draft",
                  moderationNote: "",
                  viewCount: 0,
                  outboundClickCount: 0,
                  createdAt: nowWITA,
                  updatedAt: nowWITA,
                  submittedAt: submitForReview ? nowWITA : null,
                  publishedAt: null,
                  isDeleted: false,
                };

                setWorks((prev) => [newWork, ...prev]);
                if (isFirebaseConfigured) await saveWorkToFirestore(newWork);
                triggerToast(submitForReview ? "Karya berhasil diajukan ke Admin!" : "Disimpan sebagai Draf.", "success");
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
                const updatedDistrict = (userData.district || "").trim() || editingUser.district || "Kec. Amuntai Tengah, HSU";
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
                const newDistrict = (userData.district || "").trim() || "Kec. Amuntai Tengah, HSU";
                const newUser: UserAccount = {
                  uid: "uid-user-" + Date.now(),
                  ...userData,
                  district: newDistrict,
                  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
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
              const updatedDistrict = (updatedFields.district || "").trim() || currentUserProfile.district || "Kec. Amuntai Tengah, HSU";
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
            onSubmitAuth={handleGoogleLoginOrRegister}
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
