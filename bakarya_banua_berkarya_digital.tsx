import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Eye,
  MousePointerClick,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Plus,
  FileText,
  Video,
  Gamepad2,
  Layers,
  UserCheck,
  ShieldAlert,
  BarChart3,
  ChevronRight,
  ArrowUpRight,
  Compass,
  Award,
  Send,
  Edit3,
  Trash2,
  Check,
  Info,
  Lock,
  Globe,
  X,
  SlidersHorizontal,
  User,
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  Settings,
  Database,
  Activity,
  HelpCircle,
  FileCode,
  Copy,
  CheckCheck,
  Volume2,
  Presentation,
  KeyRound,
  EyeOff,
  UserPlus,
  UserX,
  RotateCcw,
  Shield,
  Users,
  Camera,
  Upload,
  LogIn,
  LogOut,
  BadgeCheck,
  Building2,
  Wrench,
  Share2,
  Dices
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Helper pengekstrak ID Google Drive agar dapat dirender langsung sebagai gambar/thumbnail di website
const getDriveDirectImageUrl = (urlOrId, size = "w1200") => {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  // Jika hanya berupa ID Google Drive langsung
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return `https://drive.google.com/thumbnail?id=${trimmed}&sz=${size}`;
  }
  // Ekstrak dari pola /file/d/{ID} atau ?id={ID}
  const match =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=${size}`;
  }
  return trimmed;
};

// ID Aset Google Drive Resmi BAKARYA
const BAKARYA_LOGO_DRIVE_ID = "12d63rkseNKj6_emhc3iwjwg24ONzH_s6";
const BAKARYA_HERO_BANNER_DRIVE_ID = "1KAn_yZaoB7PtKwVIpzYpCvz-2ie8wYPH";

const BAKARYA_LOGO_URL = getDriveDirectImageUrl(BAKARYA_LOGO_DRIVE_ID, "w400");
const BAKARYA_DEFAULT_THUMBNAIL_URL = getDriveDirectImageUrl(BAKARYA_HERO_BANNER_DRIVE_ID, "w1200");

const HERO_ANIMATED_PHRASES = [
  "Bertumbuh Bersama",
  "Berkarya Digital",
  "Menginspirasi Kelas",
  "Memajukan Banua"
];

const EDUCATION_LEVELS = [
  { id: "paud", name: "PAUD", slug: "paud", sortOrder: 1, isActive: true },
  { id: "sd", name: "SD/MI", slug: "sd-mi", sortOrder: 2, isActive: true },
  { id: "smp", name: "SMP/MTs", slug: "smp-mts", sortOrder: 3, isActive: true },
  { id: "sma", name: "SMA/SMK/MA", slug: "sma-smk-ma", sortOrder: 4, isActive: true },
  { id: "umum", name: "Umum", slug: "umum", sortOrder: 5, isActive: true }
];

const CLASSES_DATA = [
  { id: "paud-all", name: "TK A / TK B", educationLevelId: "paud" },
  { id: "k1", name: "Kelas 1", educationLevelId: "sd" },
  { id: "k2", name: "Kelas 2", educationLevelId: "sd" },
  { id: "k3", name: "Kelas 3", educationLevelId: "sd" },
  { id: "k4", name: "Kelas 4", educationLevelId: "sd" },
  { id: "k5", name: "Kelas 5", educationLevelId: "sd" },
  { id: "k6", name: "Kelas 6", educationLevelId: "sd" },
  { id: "k7", name: "Kelas 7", educationLevelId: "smp" },
  { id: "k8", name: "Kelas 8", educationLevelId: "smp" },
  { id: "k9", name: "Kelas 9", educationLevelId: "smp" },
  { id: "k10", name: "Kelas 10", educationLevelId: "sma" },
  { id: "k11", name: "Kelas 11", educationLevelId: "sma" },
  { id: "k12", name: "Kelas 12", educationLevelId: "sma" },
  { id: "umum-all", name: "Lintas Kelas / Umum", educationLevelId: "umum" }
];

const INITIAL_SUBJECTS_DATA = [
  { id: "matematika", name: "Matematika" },
  { id: "ipa", name: "IPAS / Sains" },
  { id: "bahasa", name: "Bahasa Indonesia" },
  { id: "lokal", name: "Muatan Lokal Banjar" },
  { id: "seni", name: "Seni & Budaya Kriya" },
  { id: "informatika", name: "Informatika & Koding" }
];

const INITIAL_CATEGORIES_DATA = [
  { id: "cat-ekologi", name: "Kearifan Lokal & Lahan Basah", slug: "kearifan-lokal" },
  { id: "cat-numerasi", name: "Penguatan Numerasi", slug: "penguatan-numerasi" },
  { id: "cat-literasi", name: "Literasi Bahasa & Budaya", slug: "literasi-budaya" },
  { id: "cat-stem", name: "Eksperimen Sains & STEM", slug: "sains-stem" },
  { id: "cat-p5", name: "Projek Profil Pelajar (P5)", slug: "projek-p5" },
  { id: "cat-manajemen", name: "Manajemen & Pengelolaan Kelas", slug: "manajemen-kelas" }
];

const INITIAL_MEDIA_TYPES = [
  {
    id: "game",
    name: "Game",
    slug: "game",
    description: "Permainan edukasi interaktif berbasis kuis & tantangan",
    icon: Gamepad2
  },
  {
    id: "interaktif",
    name: "Media",
    slug: "media",
    description: "Media interaktif, simulasi eksplorasi, & LKPD digital",
    icon: Layers
  },
  {
    id: "video",
    name: "Video",
    slug: "video",
    description: "Video pembelajaran, animasi konsep, & dokumenter lokal",
    icon: Video
  },
  {
    id: "tools",
    name: "Alat Bantu Kelas",
    slug: "alat-bantu-kelas",
    description: "Pembagi kelompok otomatis, roda undian maju, timer, & papan skor kelas",
    icon: Wrench
  },
  {
    id: "modul",
    name: "Modul / PDF",
    slug: "modul-pdf",
    description: "E-Book kontekstual, bahan ajar, & komik edukasi",
    icon: FileText
  },
  {
    id: "audio",
    name: "Audio",
    slug: "audio",
    description: "Cerita rakyat Banjar bersuara & latihan menyimak",
    icon: Volume2
  }
];

const CONTRIBUTORS = [
  {
    uid: "uid-contrib-1",
    username: "siti.rahmah.hsu",
    tempPassword: "Bakarya#HSU2026!",
    displayName: "Siti Rahmah, S.Pd.",
    email: "siti.rahmah@guru.sd.belajar.id",
    institution: "SDN Paliwara 1 Amuntai",
    district: "Kec. Amuntai Tengah, HSU",
    bio: "Pendidik kelas atas yang antusias mengembangkan game numerasi berbasis ekosistem rawa lebak dan kearifan lokal Kalimantan Selatan.",
    role: "contributor",
    accountStatus: "active",
    publicProfileEnabled: true,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    lastLoginAt: "16 Okt 2026, 07:45 WITA",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
  },
  {
    uid: "uid-contrib-pending-1",
    username: "muhammad.rizki.hsu",
    tempPassword: "GoogleAuth#OAuth2",
    displayName: "Muhammad Rizki, S.Pd.",
    email: "m.rizki.gugus2@guru.sd.belajar.id",
    institution: "SDN Murung Sari 2 Amuntai",
    district: "Kec. Amuntai Tengah, HSU",
    bio: "Peserta Kelas Digitalisasi Gugus 2 HSU yang mengembangkan media interaktif muatan lokal Kalimantan Selatan.",
    role: "contributor",
    accountStatus: "pending",
    authProvider: "google",
    publicProfileEnabled: true,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    lastLoginAt: "Menunggu Persetujuan Admin",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"
  },
  {
    uid: "uid-admin-1",
    username: "kurator.disdik.hsu",
    tempPassword: "AdminKurator!2026",
    displayName: "H. Hendra Wijaya, M.Pd.",
    email: "kurator.bakarya@disdik.hsu.go.id",
    institution: "Dinas Pendidikan Kab. HSU",
    district: "Amuntai Tengah, HSU",
    bio: "Tim Kurator dan Moderator Media Pembelajaran Digital Kabupaten Hulu Sungai Utara.",
    role: "admin",
    accountStatus: "active",
    publicProfileEnabled: false,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    lastLoginAt: "16 Okt 2026, 08:15 WITA",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80"
  },
  {
    uid: "uid-super-1",
    username: "root.superadmin",
    tempPassword: "SuperBakarya#Root99",
    displayName: "Rizky Pratama, S.Kom.",
    email: "superadmin@bakarya.hsu.go.id",
    institution: "Pengelola Sistem Utama BAKARYA",
    district: "Amuntai Tengah, HSU",
    bio: "Arsitek Sistem & Pengelola Keamanan Cloud Firestore BAKARYA HSU.",
    role: "superAdmin",
    accountStatus: "active",
    publicProfileEnabled: false,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    lastLoginAt: "16 Okt 2026, 08:40 WITA",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  }
];

const INITIAL_WORKS = [
  {
    id: "work-100",
    title: "Aplikasi Pembagi Kelompok Otomatis & Roda Undian Maju Siswa",
    slug: "pembagi-kelompok-otomatis-roda-undian-siswa",
    shortDescription:
      "Alat bantu pengelolaan kelas interaktif untuk mengacak kelompok belajar secara adil, undian giliran maju ke depan, serta timer diskusi.",
    description:
      "Dirancang khusus untuk membantu guru mengelola dinamika kelas dengan seru dan transparan. Fitur meliputi: (1) Generator pembagian kelompok otomatis berdasarkan daftar nama siswa, (2) Roda putar (spinner) undian giliran maju presentasi dengan efek suara, dan (3) Pengatur waktu (timer) kegiatan diskusi kelompok.",
    thumbnailURL: BAKARYA_DEFAULT_THUMBNAIL_URL,
    mediaURL: "https://drive.google.com/file/d/1KAn_yZaoB7PtKwVIpzYpCvz-2ie8wYPH/view?usp=sharing",
    mediaTypeId: "tools",
    categoryIds: ["cat-manajemen"],
    educationLevelIds: ["sd", "smp", "sma", "umum"],
    classIds: ["umum-all"],
    subjectIds: ["informatika"],
    contributorId: "uid-contrib-1",
    contributorNameSnapshot: "Siti Rahmah, S.Pd.",
    contributorInstitution: "SDN Paliwara 1 Amuntai",
    status: "published",
    moderationNote: "Sangat praktis membantu pengelolaan kelas harian seluruh guru.",
    viewCount: 512,
    outboundClickCount: 389,
    createdAt: "12 Okt 2026, 08:00 WITA",
    updatedAt: "12 Okt 2026, 11:30 WITA",
    submittedAt: "12 Okt 2026, 09:00 WITA",
    publishedAt: "12 Okt 2026, 11:30 WITA",
    isDeleted: false
  },
  {
    id: "work-101",
    title: "Petualangan Matematika di Rawa Lebak Amuntai",
    slug: "petualangan-matematika-rawa-lebak-amuntai",
    shortDescription:
      "Game edukasi interaktif berlatar ekosistem rawa lebak Hulu Sungai Utara untuk melatih operasi hitung pecahan kelas 4-5 SD.",
    description:
      "Media pembelajaran berbasis kearifan lokal Kabupaten Hulu Sungai Utara. Siswa diajak menjelajahi ekosistem rawa lebak, menghitung populasi Itik Alabio dan hasil panen tanaman purun menggunakan konsep pecahan senilai, desimal, dan perbandingan. Dilengkapi kuis adaptif otomatis serta panduan fasilitasi untuk guru.",
    thumbnailURL:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
    mediaURL: "https://drive.google.com/file/d/1exampleAlabioMathHSU/view?usp=sharing",
    mediaTypeId: "game",
    categoryIds: ["cat-numerasi", "cat-ekologi"],
    educationLevelIds: ["sd"],
    classIds: ["k4", "k5"],
    subjectIds: ["matematika", "lokal"],
    contributorId: "uid-contrib-1",
    contributorNameSnapshot: "Siti Rahmah, S.Pd.",
    contributorInstitution: "SDN Paliwara 1 Amuntai",
    status: "published",
    moderationNote: "Karya sangat kontekstual dan tautan Google Drive berfungsi dengan baik.",
    viewCount: 418,
    outboundClickCount: 276,
    createdAt: "10 Okt 2026, 09:15 WITA",
    updatedAt: "11 Okt 2026, 14:20 WITA",
    submittedAt: "10 Okt 2026, 16:00 WITA",
    publishedAt: "11 Okt 2026, 14:20 WITA",
    isDeleted: false
  },
  {
    id: "work-102",
    title: "Eksplorasi Virtual 360° Situs Candi Agung & Sejarah Negara Dipa",
    slug: "eksplorasi-virtual-candi-agung-amuntai",
    shortDescription:
      "Tur interaktif 360 derajat dan lembar kerja digital mengenal situs cagar budaya Candi Agung di Amuntai Tengah.",
    description:
      "Membawa siswa mengenal warisan sejarah Kalimantan Selatan langsung dari dalam ruang kelas. Karya ini memuat peta interaktif titik-titik arkeologi Candi Agung, narasi audio sejarah Kerajaan Negara Dipa, serta tantangan refleksi kritis bagi siswa tingkat SMP/MTs.",
    thumbnailURL:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80",
    mediaURL: "https://drive.google.com/file/d/1exampleCandiAgung360/view?usp=sharing",
    mediaTypeId: "interaktif",
    categoryIds: ["cat-literasi", "cat-ekologi"],
    educationLevelIds: ["smp"],
    classIds: ["k7", "k8"],
    subjectIds: ["lokal", "seni"],
    contributorId: "uid-contrib-2",
    contributorNameSnapshot: "Ahmad Fauzan, M.Pd.",
    contributorInstitution: "SMPN 1 Amuntai",
    status: "published",
    moderationNote: "Visual jernih dan navigasi antar-hotspot berjalan lancar.",
    viewCount: 356,
    outboundClickCount: 219,
    createdAt: "08 Okt 2026, 11:00 WITA",
    updatedAt: "09 Okt 2026, 10:05 WITA",
    submittedAt: "08 Okt 2026, 15:30 WITA",
    publishedAt: "09 Okt 2026, 10:05 WITA",
    isDeleted: false
  },
  {
    id: "work-103",
    title: "E-Modul Kriya Anyaman Purun: Ekologi Lahan Basah & Ekonomi Kreatif",
    slug: "e-modul-kriya-anyaman-purun-hsu",
    shortDescription:
      "Modul digital terintegrasi video tutorial pembuatan kerajinan purun ramah lingkungan untuk Projek Penguatan Profil Pelajar.",
    description:
      "Modul PDF interaktif yang mengupas tuntas tanaman purun (Eleocharis dulcis) sebagai vegetasi khas lahan basah HSU, proses penumbukan dan pewarnaan alami, hingga inovasi desain produk bernilai ekonomi tinggi untuk generasi muda Banua.",
    thumbnailURL:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=80",
    mediaURL: "https://drive.google.com/file/d/1examplePurunModuleHSU/view?usp=sharing",
    mediaTypeId: "modul",
    categoryIds: ["cat-p5", "cat-ekologi"],
    educationLevelIds: ["sma"],
    classIds: ["k10", "k11"],
    subjectIds: ["ipa", "seni", "lokal"],
    contributorId: "uid-contrib-3",
    contributorNameSnapshot: "Norhalimah, S.Pd., Gr.",
    contributorInstitution: "SMAN 1 Amuntai",
    status: "published",
    moderationNote: "Sangat direkomendasikan untuk referensi P5 tema Gaya Hidup Berkelanjutan.",
    viewCount: 294,
    outboundClickCount: 188,
    createdAt: "04 Okt 2026, 08:00 WITA",
    updatedAt: "05 Okt 2026, 13:10 WITA",
    submittedAt: "04 Okt 2026, 14:00 WITA",
    publishedAt: "05 Okt 2026, 13:10 WITA",
    isDeleted: false
  },
  {
    id: "work-104",
    title: "Video Animasi Bioekologi Itik Alabio: Plasma Nutfah Kebanggaan HSU",
    slug: "video-animasi-bioekologi-itik-alabio",
    shortDescription:
      "Video pembelajaran sains tentang adaptasi morfologi dan pelestarian Itik Alabio di perairan rawa Kalimantan Selatan.",
    description:
      "Video berdurasi 12 menit dengan ilustrasi animasi yang menjelaskan ciri khas Itik Alabio, pola pakan alami di rawa lebak, serta peran pentingnya bagi ketahanan pangan masyarakat Hulu Sungai Utara.",
    thumbnailURL:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80",
    mediaURL: "https://drive.google.com/file/d/1exampleItikAlabioVideo/view?usp=sharing",
    mediaTypeId: "video",
    categoryIds: ["cat-stem", "cat-ekologi"],
    educationLevelIds: ["sd", "smp"],
    classIds: ["k6", "k7"],
    subjectIds: ["ipa", "lokal"],
    contributorId: "uid-contrib-2",
    contributorNameSnapshot: "Ahmad Fauzan, M.Pd.",
    contributorInstitution: "SMPN 1 Amuntai",
    status: "published",
    moderationNote: "Audio jernih dan takarir Bahasa Indonesia akurat.",
    viewCount: 245,
    outboundClickCount: 152,
    createdAt: "01 Okt 2026, 10:20 WITA",
    updatedAt: "02 Okt 2026, 09:00 WITA",
    submittedAt: "01 Okt 2026, 17:00 WITA",
    publishedAt: "02 Okt 2026, 09:00 WITA",
    isDeleted: false
  },
  {
    id: "work-105",
    title: "Laboratorium Maya Siklus Air & Hidrologi Sungai Negara",
    slug: "lab-maya-siklus-air-sungai-negara",
    shortDescription:
      "Simulasi sains interaktif untuk mengamati evaporasi, kondensasi, dan pasang surut rawa dengan studi kasus Sungai Negara.",
    description:
      "Dirancang untuk memudahkan guru menjelaskan konsep perubahan wujud zat dan siklus hidrologi tanpa keterbatasan alat lab fisik. Dilengkapi lembar pengamatan digital yang dapat langsung diisi oleh siswa.",
    thumbnailURL:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80",
    mediaURL: "https://drive.google.com/file/d/1exampleSiklusAirNegara/view?usp=sharing",
    mediaTypeId: "interaktif",
    categoryIds: ["cat-stem"],
    educationLevelIds: ["sd"],
    classIds: ["k4", "k5"],
    subjectIds: ["ipa"],
    contributorId: "uid-contrib-1",
    contributorNameSnapshot: "Siti Rahmah, S.Pd.",
    contributorInstitution: "SDN Paliwara 1 Amuntai",
    status: "pending_review",
    moderationNote: "",
    viewCount: 0,
    outboundClickCount: 0,
    createdAt: "15 Okt 2026, 19:30 WITA",
    updatedAt: "15 Okt 2026, 20:15 WITA",
    submittedAt: "15 Okt 2026, 20:15 WITA",
    publishedAt: null,
    isDeleted: false
  },
  {
    id: "work-106",
    title: "Kamus Visual Bersuara Bahasa Banjar Hulu — Indonesia untuk PAUD",
    slug: "kamus-visual-bersuara-bahasa-banjar-paud",
    shortDescription:
      "Media kartu visual interaktif bersuara untuk mengenalkan kosakata santun Bahasa Banjar sejak jenjang PAUD dan SD kelas awal.",
    description:
      "Berisi lebih dari 80 kosakata keseharian dalam Bahasa Banjar dialek Hulu lengkap dengan ilustrasi ramah anak, pelafalan audio penutur asli, dan contoh kalimat sederhana.",
    thumbnailURL:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    mediaURL: "https://drive.google.com/file/d/1exampleKamusBanjarPAUD/view",
    mediaTypeId: "audio",
    categoryIds: ["cat-literasi"],
    educationLevelIds: ["paud", "sd"],
    classIds: ["paud-all", "k1", "k2"],
    subjectIds: ["bahasa", "lokal"],
    contributorId: "uid-contrib-1",
    contributorNameSnapshot: "Siti Rahmah, S.Pd.",
    contributorInstitution: "SDN Paliwara 1 Amuntai",
    status: "revision_requested",
    moderationNote:
      "Karya sangat bagus Ibu Siti! Namun tautan Google Drive saat ini masih berstatus 'Dibatasi (Restricted)'. Mohon ubah pengaturan akses umum menjadi 'Siapa saja yang memiliki tautan (Anyone with the link)' lalu kirim ulang.",
    viewCount: 0,
    outboundClickCount: 0,
    createdAt: "13 Okt 2026, 10:00 WITA",
    updatedAt: "14 Okt 2026, 11:40 WITA",
    submittedAt: "13 Okt 2026, 14:00 WITA",
    publishedAt: null,
    isDeleted: false
  }
];

const INITIAL_DAILY_ANALYTICS = [
  { dateKey: "10 Okt", visits: 82, pageViews: 240, uniqueVisitorsEstimate: 69, outboundClicks: 51 },
  { dateKey: "11 Okt", visits: 95, pageViews: 285, uniqueVisitorsEstimate: 78, outboundClicks: 64 },
  { dateKey: "12 Okt", visits: 128, pageViews: 390, uniqueVisitorsEstimate: 104, outboundClicks: 89 },
  { dateKey: "13 Okt", visits: 114, pageViews: 342, uniqueVisitorsEstimate: 92, outboundClicks: 76 },
  { dateKey: "14 Okt", visits: 146, pageViews: 450, uniqueVisitorsEstimate: 119, outboundClicks: 105 },
  { dateKey: "15 Okt", visits: 162, pageViews: 512, uniqueVisitorsEstimate: 134, outboundClicks: 124 },
  { dateKey: "16 Okt (Hari Ini)", visits: 108, pageViews: 318, uniqueVisitorsEstimate: 89, outboundClicks: 79 }
];

const INITIAL_MONTHLY_ANALYTICS = [
  { monthKey: "Mei 2026", visits: 940, pageViews: 2810, outboundClicks: 520 },
  { monthKey: "Jun 2026", visits: 1280, pageViews: 3790, outboundClicks: 740 },
  { monthKey: "Jul 2026", visits: 1650, pageViews: 4920, outboundClicks: 980 },
  { monthKey: "Agu 2026", visits: 1980, pageViews: 5840, outboundClicks: 1210 },
  { monthKey: "Sep 2026", visits: 2340, pageViews: 7120, outboundClicks: 1560 },
  { monthKey: "Okt 2026", visits: 1845, pageViews: 5490, outboundClicks: 1230 }
];

export default function BakaryaApp() {
  const [role, setRole] = useState("public");
  const [loggedInUserUid, setLoggedInUserUid] = useState(null);
  const [activeTab, setActiveTab] = useState("beranda");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [works, setWorks] = useState(INITIAL_WORKS);
  const [usersList, setUsersList] = useState(CONTRIBUTORS);
  const [subjectsList, setSubjectsList] = useState(INITIAL_SUBJECTS_DATA);
  const [categoriesList, setCategoriesList] = useState(INITIAL_CATEGORIES_DATA);
  const [mediaTypesList, setMediaTypesList] = useState(INITIAL_MEDIA_TYPES);

  const [selectedWork, setSelectedWork] = useState(null);
  const [shareModalWork, setShareModalWork] = useState(null);
  const [selectedContributor, setSelectedContributor] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [moderationModalWork, setModerationModalWork] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userConfirmDelete, setUserConfirmDelete] = useState(null);
  const [isSelfProfileModalOpen, setIsSelfProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userFilterRole, setUserFilterRole] = useState("all");
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const [toast, setToast] = useState(null);
  const [heroPhraseIdx, setHeroPhraseIdx] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMediaType, setSelectedMediaType] = useState("all");
  const [selectedContributorFilter, setSelectedContributorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [dailyStats, setDailyStats] = useState(INITIAL_DAILY_ANALYTICS);
  const [analyticsRange, setAnalyticsRange] = useState("daily");
  const [sessionId, setSessionId] = useState("");
  const [moderationLogs, setModerationLogs] = useState([
    {
      id: "mod-log-1",
      workId: "work-106",
      workTitle: "Kamus Visual Bersuara Bahasa Banjar Hulu — Indonesia untuk PAUD",
      actorName: "Admin Kurator Disdik HSU",
      action: "revision_requested",
      previousStatus: "pending_review",
      newStatus: "revision_requested",
      note: "Mohon ubah izin tautan Google Drive menjadi 'Siapa saja yang memiliki tautan (Anyone with the link)'.",
      createdAt: "14 Okt 2026, 11:40 WITA"
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
      createdAt: "11 Okt 2026, 14:20 WITA"
    }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    {
      id: "aud-1",
      actorName: "Super Admin BAKARYA",
      action: "site_settings_updated",
      targetType: "siteSettings/general",
      summary: "Memperbarui zona waktu laporan ke Asia/Makassar (WITA)",
      createdAt: "01 Okt 2026, 08:00 WITA"
    },
    {
      id: "aud-2",
      actorName: "Admin Kurator Disdik HSU",
      action: "work_published",
      targetType: "works/work-101",
      summary: "Menerbitkan karya 'Petualangan Matematika di Rawa Lebak Amuntai'",
      createdAt: "11 Okt 2026, 14:20 WITA"
    }
  ]);

  useEffect(() => {
    const generated = "sess_wita_" + Math.random().toString(36).substring(2, 9);
    setSessionId(generated);
  }, []);

  // Set Favicon & Title + Rotasi Teks Animasi Hero
  useEffect(() => {
    document.title = "BAKARYA — Banua Berkarya Digital (Gugus 2 HSU)";
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = BAKARYA_LOGO_URL;

    const interval = setInterval(() => {
      setHeroPhraseIdx((prev) => (prev + 1) % HERO_ANIMATED_PHRASES.length);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  // Update OpenGraph Thumbnail dinamis saat melihat atau membagikan karya
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

  const triggerToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4200);
  };

  const handleAddCustomSubject = (rawName) => {
    const clean = rawName.trim();
    if (!clean) return null;
    const existing = subjectsList.find((s) => s.name.toLowerCase() === clean.toLowerCase());
    if (existing) return existing.id;
    const newId = "sub-" + clean.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-3);
    const created = { id: newId, name: clean };
    setSubjectsList((prev) => [...prev, created]);
    triggerToast(`Mapel "${clean}" ditambahkan.`);
    return newId;
  };

  const handleAddCustomCategory = (rawName) => {
    const clean = rawName.trim();
    if (!clean) return null;
    const existing = categoriesList.find((c) => c.name.toLowerCase() === clean.toLowerCase());
    if (existing) return existing.id;
    const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newId = "cat-" + slug + "-" + Date.now().toString().slice(-3);
    const created = { id: newId, name: clean, slug };
    setCategoriesList((prev) => [...prev, created]);
    triggerToast(`Kategori "${clean}" ditambahkan.`);
    return newId;
  };

  const handleAddCustomMediaType = (rawName) => {
    const clean = rawName.trim();
    if (!clean) return null;
    const existing = mediaTypesList.find((m) => m.name.toLowerCase() === clean.toLowerCase());
    if (existing) return existing.id;
    const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newId = "media-" + slug + "-" + Date.now().toString().slice(-3);
    const created = {
      id: newId,
      name: clean,
      slug,
      description: `Format media ${clean} karya pendidik Banua`,
      icon: Sparkles
    };
    setMediaTypesList((prev) => [...prev, created]);
    triggerToast(`Jenis Media "${clean}" ditambahkan.`);
    return newId;
  };

  const handleGoogleLoginOrRegister = (payload) => {
    const nowWITA = "16 Okt 2026, 10:05 WITA";
    const normalizedEmail = payload.email.trim().toLowerCase();
    const existing = usersList.find(
      (u) => !u.isDeleted && u.email.toLowerCase() === normalizedEmail
    );

    if (payload.mode === "login") {
      if (!existing) {
        triggerToast(
          "Email belum terdaftar. Silakan gunakan tab 'Daftar Kontributor dgn Google'.",
          "error"
        );
        return;
      }
      if (existing.accountStatus === "pending") {
        triggerToast(
          `Halo ${existing.displayName}, akun Google Anda masih menunggu persetujuan Admin Kurator.`,
          "info"
        );
        return;
      }
      if (existing.accountStatus !== "active") {
        triggerToast("Akses akun ini sedang dibekukan oleh Admin.", "error");
        return;
      }

      setUsersList((prev) =>
        prev.map((u) =>
          u.uid === existing.uid ? { ...u, lastLoginAt: nowWITA } : u
        )
      );
      setLoggedInUserUid(existing.uid);
      setRole(existing.role);
      setActiveTab("dashboard");
      setIsAuthModalOpen(false);
      triggerToast(`Selamat datang kembali, ${existing.displayName}!`, "success");
      return;
    }

    // Mode Register dengan Akun Google
    if (existing) {
      if (existing.accountStatus === "active") {
        setLoggedInUserUid(existing.uid);
        setRole(existing.role);
        setActiveTab("dashboard");
        setIsAuthModalOpen(false);
        triggerToast(`Akun Google sudah aktif! Masuk sebagai ${existing.displayName}.`, "success");
      } else {
        triggerToast(
          `Akun ${existing.email} sudah terdaftar dan sedang menunggu persetujuan Admin.`,
          "info"
        );
      }
      return;
    }

    const newUid = "uid-google-" + Date.now();
    const usernameFromEmail = normalizedEmail.split("@")[0].replace(/[^a-z0-9.]/g, "");
    const newGoogleContributor = {
      uid: newUid,
      username: usernameFromEmail || "guru.bakarya",
      tempPassword: "GoogleOAuth2#Verified",
      displayName: payload.displayName,
      email: normalizedEmail,
      institution: payload.institution,
      district: payload.district || "Kab. Hulu Sungai Utara",
      bio:
        payload.bio ||
        "Pendidik peserta pengembangan karya pembelajaran digital BAKARYA Hulu Sungai Utara.",
      role: "contributor",
      accountStatus: "pending",
      authProvider: "google",
      publicProfileEnabled: true,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      lastLoginAt: "Menunggu Persetujuan Admin",
      avatar:
        payload.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
    };

    setUsersList((prev) => [newGoogleContributor, ...prev]);
    setAuditLogs((prev) => [
      {
        id: "aud-" + Date.now(),
        actorName: payload.displayName,
        action: "google_registration_submitted",
        targetType: `users/${newUid}`,
        summary: `Pendaftaran kontributor baru via Akun Google (${normalizedEmail}) menunggu persetujuan Admin`,
        createdAt: nowWITA
      },
      ...prev
    ]);
    setIsAuthModalOpen(false);
    triggerToast(
      "Pendaftaran dengan Akun Google berhasil dikirim! Begitu disetujui Admin, akun Anda otomatis aktif.",
      "success"
    );
  };

  const handleUpdateUserRole = (targetUid, newRole) => {
    if (role !== "superAdmin" && role !== "admin") {
      triggerToast("Anda tidak memiliki kewenangan mengubah level peran (role).", "error");
      return;
    }
    const targetUser = usersList.find((u) => u.uid === targetUid);
    if (!targetUser) return;

    if (role === "admin" && (targetUser.role === "superAdmin" || newRole === "superAdmin")) {
      triggerToast("Admin hanya dapat mengatur peran Kontributor atau Admin Kurator.", "error");
      return;
    }

    const nowWITA = "16 Okt 2026, 08:55 WITA";
    const actor =
      role === "superAdmin"
        ? "Super Admin BAKARYA"
        : currentUserProfile?.displayName || "Admin Kurator Disdik HSU";

    setUsersList((prev) =>
      prev.map((u) => (u.uid === targetUid ? { ...u, role: newRole } : u))
    );

    setAuditLogs((prev) => [
      {
        id: "aud-" + Date.now(),
        actorName: actor,
        action: "user_role_changed",
        targetType: `users/${targetUid}`,
        summary: `Mengubah hak akses ${targetUser.displayName} dari '${targetUser.role}' menjadi '${newRole}'`,
        createdAt: nowWITA
      },
      ...prev
    ]);

    triggerToast(`Hak akses ${targetUser.displayName} berhasil diubah menjadi ${newRole.toUpperCase()}.`, "success");
  };

  const handleUpdateAccountStatus = (targetUid, newStatus) => {
    const targetUser = usersList.find((u) => u.uid === targetUid);
    if (!targetUser) return;

    if (role === "admin" && targetUser.role === "superAdmin") {
      return;
    }

    const nowWITA = "16 Okt 2026, 08:55 WITA";
    const actor =
      role === "superAdmin"
        ? "Super Admin BAKARYA"
        : currentUserProfile?.displayName || "Admin Kurator Disdik HSU";

    setUsersList((prev) =>
      prev.map((u) => (u.uid === targetUid ? { ...u, accountStatus: newStatus } : u))
    );

    setAuditLogs((prev) => [
      {
        id: "aud-" + Date.now(),
        actorName: actor,
        action: "user_status_changed",
        targetType: `users/${targetUid}`,
        summary: `Mengubah status akun ${targetUser.displayName} menjadi '${newStatus}'`,
        createdAt: nowWITA
      },
      ...prev
    ]);

    triggerToast(`Status akses akun ${targetUser.displayName} ditetapkan ke: ${newStatus.toUpperCase()}.`, "success");
  };

  const handleDeleteUser = (targetUid, mode = "soft") => {
    const targetUser = usersList.find((u) => u.uid === targetUid);
    if (!targetUser) return;

    const nowWITA = "16 Okt 2026, 08:45 WITA";
    const actor = role === "superAdmin" ? "Super Admin BAKARYA" : "Admin Kurator Disdik HSU";

    if (mode === "permanent") {
      setUsersList((prev) => prev.filter((u) => u.uid !== targetUid));
      setAuditLogs((prev) => [
        {
          id: "aud-" + Date.now(),
          actorName: actor,
          action: "user_permanently_deleted",
          targetType: `users/${targetUid}`,
          summary: `Menghapus permanen akun ${targetUser.displayName} (${targetUser.email})`,
          createdAt: nowWITA
        },
        ...prev
      ]);
      triggerToast(`Akun ${targetUser.displayName} telah dihapus secara permanen.`, "info");
    } else {
      setUsersList((prev) =>
        prev.map((u) =>
          u.uid === targetUid
            ? {
                ...u,
                isDeleted: true,
                accountStatus: "disabled",
                deletedAt: nowWITA,
                deletedBy: actor
              }
            : u
        )
      );
      setAuditLogs((prev) => [
        {
          id: "aud-" + Date.now(),
          actorName: actor,
          action: "user_soft_deleted",
          targetType: `users/${targetUid}`,
          summary: `Menonaktifkan & menandai terhapus (soft delete) akun ${targetUser.displayName}`,
          createdAt: nowWITA
        },
        ...prev
      ]);
      triggerToast(`Akun ${targetUser.displayName} dipindahkan ke daftar terhapus & akses dicabut.`, "info");
    }
    setUserConfirmDelete(null);
  };

  const handleRestoreUser = (targetUid) => {
    const targetUser = usersList.find((u) => u.uid === targetUid);
    if (!targetUser) return;

    const nowWITA = "16 Okt 2026, 08:45 WITA";
    const actor = role === "superAdmin" ? "Super Admin BAKARYA" : "Admin Kurator Disdik HSU";

    setUsersList((prev) =>
      prev.map((u) =>
        u.uid === targetUid
          ? {
              ...u,
              isDeleted: false,
              accountStatus: "active",
              deletedAt: null,
              deletedBy: null
            }
          : u
      )
    );

    setAuditLogs((prev) => [
      {
        id: "aud-" + Date.now(),
        actorName: actor,
        action: "user_restored",
        targetType: `users/${targetUid}`,
        summary: `Memulihkan akun ${targetUser.displayName} dan mengaktifkan kembali akses login`,
        createdAt: nowWITA
      },
      ...prev
    ]);

    triggerToast(`Akun ${targetUser.displayName} berhasil dipulihkan & kembali aktif!`, "success");
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
    sortBy
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

  const handleOpenWorkDetail = (work) => {
    setWorks((prev) =>
      prev.map((w) => (w.id === work.id ? { ...w, viewCount: w.viewCount + 1 } : w))
    );
    setSelectedWork({ ...work, viewCount: work.viewCount + 1 });
  };

  const handleOutboundClick = (work) => {
    setWorks((prev) =>
      prev.map((w) =>
        w.id === work.id ? { ...w, outboundClickCount: w.outboundClickCount + 1 } : w
      )
    );
  };

  const handleModerationDecision = (workId, newStatus, note) => {
    const targetWork = works.find((w) => w.id === workId);
    if (!targetWork) return;

    const nowWITA = "16 Okt 2026, 08:40 WITA";
    const actor = role === "superAdmin" ? "Super Admin BAKARYA" : "Admin Kurator Disdik HSU";

    setWorks((prev) =>
      prev.map((w) =>
        w.id === workId
          ? {
              ...w,
              status: newStatus,
              moderationNote: note,
              updatedAt: nowWITA,
              publishedAt: newStatus === "published" ? nowWITA : w.publishedAt
            }
          : w
      )
    );

    setModerationLogs((prev) => [
      {
        id: "mod-log-" + Date.now(),
        workId,
        workTitle: targetWork.title,
        actorName: actor,
        action: newStatus,
        previousStatus: targetWork.status,
        newStatus: newStatus,
        note,
        createdAt: nowWITA
      },
      ...prev
    ]);

    setModerationModalWork(null);
    triggerToast(`Keputusan moderasi berhasil disimpan (${newStatus.toUpperCase()}).`, "success");
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#20252D] font-sans selection:bg-[#167D78] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
        body { font-family: 'Manrope', sans-serif; }
        h1, h2, h3, h4, .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 sm:right-8 z-50 flex items-center gap-3 bg-[#14213D] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#F2B84B]/40 max-w-md"
          >
            <div className="w-8 h-8 rounded-xl bg-[#F2B84B]/20 flex items-center justify-center text-[#F2B84B] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#F8F7F2]/90 border-b border-[#14213D]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          <div onClick={() => setActiveTab("beranda")} className="flex items-center gap-3.5 cursor-pointer group shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#14213D]/15 flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-300 overflow-hidden p-1">
              <img
                src={BAKARYA_LOGO_URL}
                alt="Logo BAKARYA"
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/100x100/14213D/F2B84B?text=B";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl tracking-tight text-[#14213D]">BAKARYA</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#167D78]/15 text-[#167D78]">
                  Gugus 2 HSU
                </span>
              </div>
              <p className="text-[11px] text-[#727782] hidden sm:block font-medium">
                Kelas Digitalisasi Gugus 2 HSU • BOS Kinerja Terbaik 2026
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-[#14213D]/10 shadow-sm">
            {[
              { id: "beranda", label: "Beranda" },
              { id: "jelajah", label: "Karya" },
              { id: "kontributor", label: "Kontributor" },
              ...(role !== "public"
                ? [{ id: "dashboard", label: role === "contributor" ? "Dashboard" : "Moderasi", highlight: true }]
                : []),
              ...(role === "admin" || role === "superAdmin"
                ? [
                    {
                      id: "pengguna",
                      label: pendingUsersCount > 0 ? `Akun (${pendingUsersCount})` : "Akun",
                      highlight: true
                    },
                    { id: "analitik", label: "Analitik" }
                  ]
                : []),
              { id: "panduan", label: "Panduan" },
              ...(role === "superAdmin"
                ? [{ id: "arsitektur", label: "🔒 Firebase", superOnly: true }]
                : [])
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === item.id
                    ? item.superOnly
                      ? "bg-[#F2B84B] text-[#14213D] shadow-sm"
                      : item.highlight
                      ? "bg-[#167D78] text-white shadow-sm"
                      : "bg-[#14213D] text-white shadow-sm"
                    : item.superOnly
                    ? "text-[#14213D] bg-[#F2B84B]/20 hover:bg-[#F2B84B]/35"
                    : item.highlight
                    ? "text-[#167D78] hover:bg-[#167D78]/10"
                    : "text-[#727782] hover:text-[#14213D] hover:bg-[#F8F7F2]"
                }`}
              >
                {item.superOnly && <Lock className="w-3 h-3" />}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {role === "public" ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthModalMode("login");
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-white hover:bg-[#F8F7F2] text-[#14213D] border border-[#14213D]/15 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-[#167D78]" />
                  <span>Masuk</span>
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode("register");
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-[#14213D] hover:bg-[#167D78] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4 text-[#F2B84B]" />
                  <span>Daftar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {currentUserProfile && (
                  <button
                    onClick={() => setIsSelfProfileModalOpen(true)}
                    className="bg-white hover:bg-[#F8F7F2] text-[#14213D] border border-[#14213D]/15 text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition-all flex items-center gap-2"
                    title="Profil Saya"
                  >
                    <img
                      src={currentUserProfile.avatar}
                      alt={currentUserProfile.displayName}
                      className="w-6 h-6 rounded-lg object-cover border border-[#F2B84B]"
                    />
                    <span className="hidden md:inline max-w-[110px] truncate">
                      {currentUserProfile.displayName.split(",")[0]}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingWork(null);
                    setIsFormModalOpen(true);
                  }}
                  className="bg-[#167D78] hover:bg-[#14213D] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Unggah</span>
                </button>
                <button
                  onClick={() => {
                    setRole("public");
                    setLoggedInUserUid(null);
                    setActiveTab("beranda");
                    triggerToast("Anda telah keluar dari sesi akun.", "info");
                  }}
                  className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "beranda" && (
            <motion.div
              key="beranda"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-14"
            >
              {/* HERO LANDING PAGE UTAMA BERANIMASI */}
              <section className="relative rounded-3xl bg-[#14213D] text-white p-7 sm:p-12 lg:p-14 overflow-hidden shadow-2xl border border-white/10">
                {/* Animated Floating Background Orbs */}
                <motion.div
                  animate={{
                    scale: [1, 1.18, 1],
                    x: [0, 25, 0],
                    y: [0, -20, 0]
                  }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-[#167D78]/40 blur-3xl pointer-events-none"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.22, 1],
                    x: [0, -30, 0],
                    y: [0, 25, 0]
                  }}
                  transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-28 left-1/4 w-80 h-80 rounded-full bg-[#F2B84B]/25 blur-3xl pointer-events-none"
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#F2B84B] text-xs font-bold tracking-wider uppercase shadow-sm"
                    >
                      <motion.span
                        animate={{ rotate: [0, 20, -20, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Sparkles className="w-4 h-4 text-[#F2B84B]" />
                      </motion.span>
                      <span>Portal Karya Pendidik Banua</span>
                    </motion.div>

                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.18]"
                      >
                        Dari Banua,{" "}
                        <span className="inline-block relative min-w-[260px] sm:min-w-[340px]">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={heroPhraseIdx}
                              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                              exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                              transition={{ duration: 0.45, ease: "easeOut" }}
                              className="inline-block text-[#F2B84B] underline decoration-[#167D78] decoration-wavy decoration-2 underline-offset-8"
                            >
                              {HERO_ANIMATED_PHRASES[heroPhraseIdx]}
                            </motion.span>
                          </AnimatePresence>
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-white via-white to-[#F2B84B] bg-clip-text text-transparent">
                          Berdampak untuk Semua.
                        </span>
                      </motion.h1>
                    </div>

                    <motion.p
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="text-white/85 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl"
                    >
                      Pusat kurasi media pembelajaran interaktif, game edukasi, dan alat bantu kelas hasil program{" "}
                      <strong className="text-[#F2B84B]">
                        Kelas Digitalisasi Gugus 2 — Hulu Sungai Utara (Sekolah Penerima BOS Kinerja Terbaik 2026)
                      </strong>
                      , dikembangkan terbuka untuk seluruh guru Indonesia.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-xl border border-white/20"
                    >
                      <div className="flex items-center gap-3 px-3.5 py-2 w-full text-[#20252D]">
                        <Search className="w-5 h-5 text-[#167D78] shrink-0" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setActiveTab("jelajah");
                          }}
                          placeholder="Cari game, pembagi kelompok, modul, atau nama guru..."
                          className="w-full text-sm font-medium focus:outline-none bg-transparent"
                        />
                      </div>
                      <button
                        onClick={() => setActiveTab("jelajah")}
                        className="w-full sm:w-auto shrink-0 bg-[#167D78] hover:bg-[#14213D] text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors"
                      >
                        Cari
                      </button>
                    </motion.div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs text-white/60 font-semibold mr-1">Jenjang:</span>
                      {EDUCATION_LEVELS.map((lvl, idx) => (
                        <motion.button
                          key={lvl.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + idx * 0.06 }}
                          whileHover={{ scale: 1.07, y: -2 }}
                          onClick={() => {
                            setSelectedLevel(lvl.id);
                            setActiveTab("jelajah");
                          }}
                          className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-[#F2B84B] hover:text-[#14213D] transition-colors"
                        >
                          {lvl.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* VISUAL BANNER DARI GOOGLE DRIVE & STATISTIK */}
                  <div className="lg:col-span-5">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      whileHover={{ y: -6 }}
                      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
                    >
                      {/* Gambar Dokumentasi / Visual Utama dari Google Drive - Tampil Utuh Tanpa Terpotong */}
                      <div className="relative w-full bg-[#0f192f] p-3 sm:p-4 flex items-center justify-center border-b border-white/10">
                        <img
                          src={BAKARYA_DEFAULT_THUMBNAIL_URL}
                          alt="Kelas Digitalisasi Gugus 2 HSU"
                          className="w-full h-auto max-h-64 object-contain rounded-2xl shadow-lg transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80";
                          }}
                        />
                        <div className="absolute top-5 left-5 flex items-center gap-2 bg-[#14213D]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-md">
                          <img
                            src={BAKARYA_LOGO_URL}
                            alt="Logo"
                            className="w-4 h-4 object-contain rounded-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <span className="text-[11px] font-extrabold text-[#F2B84B] tracking-wide">
                            Gugus 2 HSU • Kalsel
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-5">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-[#F2B84B] font-extrabold block">
                            Ekosistem Pendidikan Banua
                          </span>
                          <h3 className="font-display text-base sm:text-lg font-extrabold text-white mt-0.5">
                            Ringkasan Portal BAKARYA
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                            <div className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                              {works.filter((w) => w.status === "published").length}
                            </div>
                            <div className="text-xs text-white/75 font-semibold mt-1">Karya Terbit</div>
                          </div>
                          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                            <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#F2B84B]">
                              {
                                usersList.filter(
                                  (u) => !u.isDeleted && u.role === "contributor" && u.accountStatus === "active"
                                ).length
                              }
                            </div>
                            <div className="text-xs text-white/75 font-semibold mt-1">Guru Kontributor</div>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs text-white/85">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#F2B84B] shrink-0" />
                            <span>Game, Media, Video & Alat Bantu Kelas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#F2B84B] shrink-0" />
                            <span>Mendukung Thumbnail Otomatis dari Google Drive</span>
                          </div>
                        </div>

                        {role === "public" && (
                          <div className="pt-1 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setAuthModalMode("register");
                                setIsAuthModalOpen(true);
                              }}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-[#F2B84B] hover:bg-white text-[#14213D] font-extrabold text-xs transition-all text-center shadow-md"
                            >
                              Daftar
                            </button>
                            <button
                              onClick={() => {
                                setAuthModalMode("login");
                                setIsAuthModalOpen(true);
                              }}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all text-center border border-white/15"
                            >
                              Masuk
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* PILIHAN JENIS MEDIA (DENGAN ANGKA JUMLAH DIPERBESAR & ALAT BANTU KELAS) */}
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">Ragam Format Inovasi</span>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14213D] mt-1">
                      Jenis Media & Alat Bantu Kelas
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("jelajah")}
                    className="text-sm font-bold text-[#167D78] hover:text-[#14213D] flex items-center gap-1"
                  >
                    <span>Semua</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {mediaTypesList.map((media) => {
                    const IconComponent = media.icon || Layers;
                    const count = works.filter((w) => w.status === "published" && w.mediaTypeId === media.id).length;
                    return (
                      <motion.button
                        key={media.id}
                        whileHover={{ y: -5, scale: 1.01 }}
                        onClick={() => {
                          resetAllFilters();
                          setSelectedMediaType(media.id);
                          setActiveTab("jelajah");
                        }}
                        className="bg-white p-6 rounded-3xl border border-[#14213D]/10 shadow-sm hover:shadow-xl hover:border-[#167D78] transition-all text-left flex flex-col justify-between group relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between gap-4 w-full">
                          <div className="w-14 h-14 rounded-2xl bg-[#F8F7F2] group-hover:bg-[#167D78] text-[#14213D] group-hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-sm">
                            <IconComponent className="w-7 h-7" />
                          </div>

                          {/* ANGKA JUMLAH KARYA DIPERBESAR & MENONJOL */}
                          <div className="text-right">
                            <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#167D78] group-hover:text-[#14213D] leading-none transition-colors">
                              {count}
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#727782] block mt-1">
                              Karya Terbit
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-[#14213D]/5 flex items-end justify-between gap-2 w-full">
                          <div>
                            <h3 className="font-display font-extrabold text-[#14213D] text-lg group-hover:text-[#167D78] transition-colors">
                              {media.name}
                            </h3>
                            <p className="text-xs text-[#727782] mt-1 leading-relaxed">{media.description}</p>
                          </div>
                          <ArrowUpRight className="w-5 h-5 text-[#727782] group-hover:text-[#167D78] shrink-0 transition-colors" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">Karya Pilihan Banua</span>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14213D] mt-1">
                      Karya Terbaru & Terpopuler
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#14213D]/10">
                    <button
                      onClick={() => setSortBy("newest")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        sortBy === "newest" ? "bg-[#14213D] text-white" : "text-[#727782] hover:text-[#14213D]"
                      }`}
                    >
                      Terbaru
                    </button>
                    <button
                      onClick={() => setSortBy("popular")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        sortBy === "popular" ? "bg-[#14213D] text-white" : "text-[#727782] hover:text-[#14213D]"
                      }`}
                    >
                      Populer
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPublicWorks.map((work) => (
                    <WorkCard
                      key={work.id}
                      work={work}
                      mediaTypesList={mediaTypesList}
                      onSelect={() => handleOpenWorkDetail(work)}
                      onShare={(w) => setShareModalWork(w)}
                      onSelectContributor={(contribId) => {
                        const found = usersList.find((c) => c.uid === contribId);
                        if (found) setSelectedContributor(found);
                      }}
                    />
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {}
          {activeTab === "jelajah" && (
            <motion.div
              key="jelajah"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-8"
            >
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#14213D]/10 shadow-sm space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">
                      Direktori Terkurasi
                    </span>
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14213D] mt-0.5">
                      Eksplorasi Karya Pembelajaran
                    </h1>
                  </div>

                  <div className="relative w-full lg:w-96">
                    <Search className="w-4 h-4 text-[#167D78] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari judul karya, topik, atau nama guru..."
                      className="w-full pl-11 pr-4 py-3 bg-[#F8F7F2] border border-[#14213D]/15 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#167D78]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-[#14213D]/10">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#727782] mb-1.5">
                      1. Jenjang Pendidikan
                    </label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#14213D]"
                    >
                      <option value="all">Semua Jenjang</option>
                      {EDUCATION_LEVELS.map((lvl) => (
                        <option key={lvl.id} value={lvl.id}>
                          {lvl.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#727782] mb-1.5">
                      2. Kelas
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#14213D]"
                    >
                      <option value="all">Semua Kelas</option>
                      {CLASSES_DATA.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#727782] mb-1.5">
                      3. Mata Pelajaran
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#14213D]"
                    >
                      <option value="all">Semua Mapel</option>
                      {subjectsList.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#727782] mb-1.5">
                      4. Kategori Karya
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#14213D]"
                    >
                      <option value="all">Semua Kategori</option>
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#727782] mb-1.5">
                      5. Jenis Media
                    </label>
                    <select
                      value={selectedMediaType}
                      onChange={(e) => setSelectedMediaType(e.target.value)}
                      className="w-full bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#14213D]"
                    >
                      <option value="all">Semua Media</option>
                      {mediaTypesList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#727782] mb-1.5">
                      6. Kontributor
                    </label>
                    <select
                      value={selectedContributorFilter}
                      onChange={(e) => setSelectedContributorFilter(e.target.value)}
                      className="w-full bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#14213D]"
                    >
                      <option value="all">Semua Kontributor</option>
                      {usersList
                        .filter((c) => !c.isDeleted && c.role === "contributor")
                        .map((c) => (
                          <option key={c.uid} value={c.uid}>
                            {c.displayName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-[#727782]">
                  <span>
                    Menampilkan <strong>{filteredPublicWorks.length}</strong> karya.
                  </span>
                  <button onClick={resetAllFilters} className="text-[#167D78] hover:underline font-bold">
                    Reset
                  </button>
                </div>
              </div>

              {filteredPublicWorks.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#14213D]/10 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F8F7F2] text-[#727782] flex items-center justify-center mx-auto">
                    <Filter className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-[#14213D]">
                    Tidak Ada Karya yang Sesuai Filter
                  </h3>
                  <button
                    onClick={resetAllFilters}
                    className="px-5 py-2.5 rounded-xl bg-[#14213D] text-white text-xs font-bold"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPublicWorks.map((work) => (
                    <WorkCard
                      key={work.id}
                      work={work}
                      mediaTypesList={mediaTypesList}
                      onSelect={() => handleOpenWorkDetail(work)}
                      onShare={(w) => setShareModalWork(w)}
                      onSelectContributor={(contribId) => {
                        const found = usersList.find((c) => c.uid === contribId);
                        if (found) setSelectedContributor(found);
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "kontributor" && (
            <motion.div
              key="kontributor"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-8"
            >
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#14213D]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">Pendidik & Kreator Banua</span>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14213D] mt-1">
                    Profil Publik Kontributor BAKARYA
                  </h1>
                  <p className="text-xs sm:text-sm text-[#727782] mt-1">
                    Sesuai kebijakan privasi PRD, alamat email pribadi kontributor tidak ditampilkan secara publik.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {usersList
                  .filter((c) => !c.isDeleted && c.accountStatus === "active" && c.publicProfileEnabled)
                  .map((contrib) => {
                    const contribWorks = works.filter((w) => w.contributorId === contrib.uid && w.status === "published");
                    const totalViews = contribWorks.reduce((acc, w) => acc + w.viewCount, 0);

                    return (
                      <motion.div
                        key={contrib.uid}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-3xl border border-[#14213D]/10 p-6 shadow-sm flex flex-col justify-between space-y-6"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={contrib.avatar}
                              alt={contrib.displayName}
                              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#F2B84B]"
                            />
                            <div>
                              <h3 className="font-display font-extrabold text-lg text-[#14213D]">{contrib.displayName}</h3>
                              <p className="text-xs font-bold text-[#167D78]">{contrib.institution}</p>
                              <p className="text-[11px] text-[#727782] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {contrib.district}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-[#20252D] leading-relaxed">{contrib.bio}</p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-[#14213D]/10">
                          <div className="grid grid-cols-2 gap-2 text-center bg-[#F8F7F2] p-3 rounded-2xl">
                            <div>
                              <div className="font-display font-extrabold text-base text-[#14213D]">{contribWorks.length}</div>
                              <div className="text-[11px] text-[#727782]">Karya Terbit</div>
                            </div>
                            <div>
                              <div className="font-display font-extrabold text-base text-[#167D78]">{totalViews}</div>
                              <div className="text-[11px] text-[#727782]">Total Kunjungan</div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              resetAllFilters();
                              setSelectedContributorFilter(contrib.uid);
                              setActiveTab("jelajah");
                            }}
                            className="w-full py-2.5 rounded-xl bg-[#14213D] hover:bg-[#167D78] text-white text-xs font-bold transition-colors"
                          >
                            Lihat Karya {contrib.displayName.split(",")[0]}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          )}

          {activeTab === "dashboard" && role !== "public" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-8"
            >
              <div className="bg-[#14213D] text-white p-6 sm:p-8 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  {currentUserProfile && (
                    <div
                      onClick={() => setIsSelfProfileModalOpen(true)}
                      className="relative group cursor-pointer shrink-0 self-start"
                      title="Edit Profil"
                    >
                      <img
                        src={currentUserProfile.avatar}
                        alt={currentUserProfile.displayName}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-[#F2B84B] shadow-md"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-[#14213D]/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-6 h-6 text-[#F2B84B]" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F2B84B] text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      {role === "contributor"
                        ? "Kontributor"
                        : role === "admin"
                        ? "Admin Kurator"
                        : "Super Admin"}
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
                      {currentUserProfile?.displayName || "Pengelola BAKARYA"}
                    </h1>
                    <p className="text-xs sm:text-sm text-white/75 max-w-2xl">
                      {currentUserProfile?.institution || "Kabupaten Hulu Sungai Utara"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setIsSelfProfileModalOpen(true)}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/15 transition-all flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4 text-[#F2B84B]" />
                    <span>Profil</span>
                  </button>
                  {(role === "admin" || role === "superAdmin") && (
                    <button
                      onClick={() => setActiveTab("pengguna")}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/15 transition-all flex items-center gap-1.5"
                    >
                      <Users className="w-4 h-4 text-[#F2B84B]" />
                      <span>Akun</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingWork(null);
                      setIsFormModalOpen(true);
                    }}
                    className="bg-[#F2B84B] hover:bg-[#e3a839] text-[#14213D] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Unggah</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10 shadow-sm">
                  <span className="text-[11px] font-extrabold text-[#727782] uppercase tracking-wider">Karya Terbit</span>
                  <div className="font-display text-3xl font-extrabold text-[#167D78] mt-2">
                    {works.filter((w) => w.status === "published" && (role === "contributor" ? w.contributorId === "uid-contrib-1" : true)).length}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10 shadow-sm">
                  <span className="text-[11px] font-extrabold text-[#727782] uppercase tracking-wider">Menunggu Tinjauan</span>
                  <div className="font-display text-3xl font-extrabold text-[#F2B84B] mt-2">
                    {works.filter((w) => w.status === "pending_review" && (role === "contributor" ? w.contributorId === "uid-contrib-1" : true)).length}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10 shadow-sm">
                  <span className="text-[11px] font-extrabold text-[#727782] uppercase tracking-wider">Perlu Direvisi</span>
                  <div className="font-display text-3xl font-extrabold text-orange-600 mt-2">
                    {works.filter((w) => w.status === "revision_requested" && (role === "contributor" ? w.contributorId === "uid-contrib-1" : true)).length}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10 shadow-sm">
                  <span className="text-[11px] font-extrabold text-[#727782] uppercase tracking-wider">Total Klik Karya</span>
                  <div className="font-display text-3xl font-extrabold text-[#14213D] mt-2">
                    {works.filter((w) => role === "contributor" ? w.contributorId === "uid-contrib-1" : true).reduce((acc, w) => acc + w.outboundClickCount, 0)}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#14213D]/10 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[#14213D]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-lg font-extrabold text-[#14213D]">
                      {role === "contributor" ? "Daftar Karya Milik Saya" : "Antrean Moderasi & Seluruh Karya Kontributor"}
                    </h2>
                    <p className="text-xs text-[#727782]">Kontributor hanya dapat mengelola karyanya sendiri.</p>
                  </div>
                </div>

                <div className="divide-y divide-[#14213D]/10">
                  {works
                    .filter((w) => (role === "contributor" ? w.contributorId === (currentUserProfile?.uid || "uid-contrib-1") : true))
                    .map((work) => (
                      <div
                        key={work.id}
                        className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-[#F8F7F2]/60 transition-colors"
                      >
                        <div className="space-y-2.5 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={work.status} />
                            <span className="text-xs font-bold text-[#14213D]">{work.contributorNameSnapshot}</span>
                            <span className="text-xs text-[#727782]">({work.contributorInstitution})</span>
                            <span className="text-xs text-[#727782]">• Diperbarui: {work.updatedAt}</span>
                          </div>

                          <h3 className="font-display text-lg font-extrabold text-[#14213D]">{work.title}</h3>
                          <p className="text-xs sm:text-sm text-[#727782] leading-relaxed">{work.shortDescription}</p>

                          {work.moderationNote && (
                            <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                              work.status === "revision_requested" ? "bg-amber-50 border-amber-200 text-amber-950" : "bg-[#F8F7F2] border-[#14213D]/10 text-[#20252D]"
                            }`}>
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-extrabold block mb-0.5">Catatan Moderasi Kurator:</span>
                                {work.moderationNote}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-[#727782]">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-[#167D78]" />
                              {work.viewCount} Kunjungan
                            </span>
                            <span className="flex items-center gap-1">
                              <MousePointerClick className="w-3.5 h-3.5 text-[#F2B84B]" />
                              {work.outboundClickCount} Klik
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleOpenWorkDetail(work)}
                            className="px-3.5 py-2 rounded-xl border border-[#14213D]/15 text-xs font-bold text-[#14213D] hover:bg-[#F8F7F2]"
                          >
                            Lihat
                          </button>

                          {role === "contributor" && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingWork(work);
                                  setIsFormModalOpen(true);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-[#14213D] text-white text-xs font-bold flex items-center gap-1.5"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              {(work.status === "draft" || work.status === "revision_requested") && (
                                <button
                                  onClick={() =>
                                    handleModerationDecision(
                                      work.id,
                                      "pending_review",
                                      "Kontributor telah memperbarui karya dan mengajukan peninjauan ulang."
                                    )
                                  }
                                  className="px-3.5 py-2 rounded-xl bg-[#167D78] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  Ajukan
                                </button>
                              )}
                            </>
                          )}

                          {(role === "admin" || role === "superAdmin") && (
                            <button
                              onClick={() => setModerationModalWork(work)}
                              className="px-4 py-2 rounded-xl bg-[#167D78] hover:bg-[#14213D] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>Moderasi</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "pengguna" && (role === "admin" || role === "superAdmin") && (
            <motion.div
              key="pengguna"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-8"
            >
              <div className="bg-[#14213D] text-white p-6 sm:p-8 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F2B84B] text-xs font-extrabold uppercase tracking-wider">
                    <KeyRound className="w-3.5 h-3.5" />
                    Manajemen Akun, Kredensial & Hak Akses
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
                    Daftar Kontributor, Pengelola & Kontrol Akses
                  </h1>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                    Kelola pendaftaran peserta/kontributor baru, lihat kredensial login (Email, Username & Password),
                    ubah peran, bekukan akses, atau hapus/pulihkan akun.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingUser(null);
                    setIsUserModalOpen(true);
                  }}
                  className="bg-[#F2B84B] hover:bg-[#e3a839] text-[#14213D] font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tambah Akun Peserta / Kontributor</span>
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#14213D]/10 shadow-sm space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#167D78] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Cari nama kontributor, username, email, atau asal sekolah..."
                      className="w-full pl-11 pr-4 py-2.5 bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#167D78]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <select
                      value={userFilterRole}
                      onChange={(e) => setUserFilterRole(e.target.value)}
                      className="bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#14213D]"
                    >
                      <option value="all">Semua Hak Akses (Role)</option>
                      <option value="contributor">Kontributor (Guru/Peserta)</option>
                      <option value="admin">Admin Kurator</option>
                      {role === "superAdmin" && <option value="superAdmin">Super Admin</option>}
                    </select>

                    <button
                      onClick={() => setShowDeletedUsers(!showDeletedUsers)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        showDeletedUsers ? "bg-rose-600 text-white border-rose-600" : "bg-[#F8F7F2] text-[#727782] border-[#14213D]/15"
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{showDeletedUsers ? "Sembunyikan Terhapus" : "Lihat Akun Terhapus"}</span>
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-[#14213D]/10">
                  {usersList
                    .filter((u) => {
                      // KUNCI: Sembunyikan Super Admin dari Admin & Kontributor
                      if (role !== "superAdmin" && u.role === "superAdmin") return false;
                      if (!showDeletedUsers && u.isDeleted) return false;
                      if (userFilterRole !== "all" && u.role !== userFilterRole) return false;
                      const q = userSearchQuery.toLowerCase().trim();
                      if (!q) return true;
                      return (
                        u.displayName.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        u.username.toLowerCase().includes(q) ||
                        u.institution.toLowerCase().includes(q)
                      );
                    })
                    .map((userItem) => {
                      const isPassVisible = !!visiblePasswords[userItem.uid];
                      const userWorksCount = works.filter((w) => w.contributorId === userItem.uid).length;

                      return (
                        <div
                          key={userItem.uid}
                          className={`py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-5 transition-colors ${
                            userItem.isDeleted ? "opacity-65 bg-rose-50/40 px-4 rounded-2xl" : ""
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <img
                              src={userItem.avatar}
                              alt={userItem.displayName}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#F2B84B] shrink-0"
                            />
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-display font-extrabold text-base text-[#14213D]">{userItem.displayName}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                                  userItem.role === "superAdmin"
                                    ? "bg-[#14213D] text-[#F2B84B]"
                                    : userItem.role === "admin"
                                    ? "bg-[#167D78] text-white"
                                    : "bg-[#F2B84B]/30 text-[#14213D]"
                                }`}>
                                  {userItem.role === "superAdmin" ? "Super Admin" : userItem.role === "admin" ? "Admin Kurator" : "Kontributor"}
                                </span>

                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                  userItem.isDeleted
                                    ? "bg-rose-100 text-rose-800 border-rose-300"
                                    : userItem.accountStatus === "active"
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : userItem.accountStatus === "pending"
                                    ? "bg-amber-100 text-amber-900 border-amber-400 animate-pulse"
                                    : "bg-rose-100 text-rose-800 border-rose-300"
                                }`}>
                                  {userItem.isDeleted
                                    ? "Terhapus"
                                    : userItem.accountStatus === "active"
                                    ? "Akses Aktif"
                                    : userItem.accountStatus === "pending"
                                    ? "Menunggu Persetujuan Admin"
                                    : "Dibekukan"}
                                </span>

                                {userItem.authProvider === "google" && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                                    Akun Google Terhubung
                                  </span>
                                )}
                              </div>

                              <p className="text-xs font-bold text-[#167D78]">
                                {userItem.institution} • <span className="font-normal text-[#727782]">{userItem.district} ({userWorksCount} Karya)</span>
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 bg-[#F8F7F2] p-3 rounded-2xl border border-[#14213D]/10 text-xs">
                                <div>
                                  <span className="text-[10px] font-extrabold uppercase text-[#727782] block">Email Login:</span>
                                  <span className="font-mono font-bold text-[#14213D] break-all">{userItem.email}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-extrabold uppercase text-[#727782] block">Username:</span>
                                  <span className="font-mono font-bold text-[#167D78]">@{userItem.username}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-extrabold uppercase text-[#727782] block">Password:</span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="font-mono font-bold text-[#14213D] bg-white px-2 py-0.5 rounded border">
                                      {isPassVisible ? userItem.tempPassword : "••••••••"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setVisiblePasswords((prev) => ({ ...prev, [userItem.uid]: !prev[userItem.uid] }))
                                      }
                                      className="p-1 rounded-lg hover:bg-white text-[#727782]"
                                    >
                                      {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {!userItem.isDeleted ? (
                              <>
                                <div className="flex flex-col">
                                  <label className="text-[10px] font-extrabold uppercase text-[#727782] mb-0.5">Hak Akses:</label>
                                  <select
                                    value={userItem.role}
                                    onChange={(e) => handleUpdateUserRole(userItem.uid, e.target.value)}
                                    className="px-3 py-2 rounded-xl text-xs font-bold border bg-[#F8F7F2] border-[#14213D]/20 text-[#14213D]"
                                  >
                                    <option value="contributor">Kontributor</option>
                                    <option value="admin">Admin Kurator</option>
                                    {role === "superAdmin" && <option value="superAdmin">Super Admin</option>}
                                  </select>
                                </div>

                                <div className="flex flex-col">
                                  <label className="text-[10px] font-extrabold uppercase text-[#727782] mb-0.5">Status:</label>
                                  {userItem.accountStatus === "pending" ? (
                                    <button
                                      onClick={() => handleUpdateAccountStatus(userItem.uid, "active")}
                                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors flex items-center gap-1.5 shadow-sm"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Setujui & Aktifkan</span>
                                    </button>
                                  ) : userItem.accountStatus === "active" ? (
                                    <button
                                      onClick={() => handleUpdateAccountStatus(userItem.uid, "suspended")}
                                      className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
                                    >
                                      Bekukan
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateAccountStatus(userItem.uid, "active")}
                                      className="px-3.5 py-2 rounded-xl bg-[#167D78] text-white text-xs font-bold transition-colors"
                                    >
                                      Aktifkan
                                    </button>
                                  )}
                                </div>

                                <div className="flex flex-col">
                                  <label className="text-[10px] font-extrabold uppercase text-transparent mb-0.5 select-none">Aksi</label>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setEditingUser(userItem);
                                        setIsUserModalOpen(true);
                                      }}
                                      className="px-3 py-2 rounded-xl border border-[#14213D]/15 hover:bg-[#F8F7F2] text-xs font-bold text-[#14213D]"
                                      title="Edit Akun"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setUserConfirmDelete(userItem)}
                                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold"
                                      title="Hapus"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <button
                                onClick={() => handleRestoreUser(userItem.uid)}
                                className="px-4 py-2 rounded-xl bg-[#167D78] text-white text-xs font-bold flex items-center gap-1.5"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Pulihkan Akun</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "analitik" && (
            <motion.div
              key="analitik"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-8"
            >
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#14213D]/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">Analitik Transparan</span>
                    <span className="text-[11px] bg-[#F2B84B]/25 text-[#14213D] font-extrabold px-2.5 py-0.5 rounded-full">
                      Zona Waktu: Asia/Makassar (WITA)
                    </span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14213D] mt-1">
                    Statistik Kunjungan & Interaksi Karya
                  </h1>
                </div>

                <div className="flex items-center gap-1.5 bg-[#F8F7F2] p-1.5 rounded-2xl border border-[#14213D]/10 self-start">
                  <button
                    onClick={() => setAnalyticsRange("daily")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      analyticsRange === "daily" ? "bg-[#14213D] text-white" : "text-[#727782]"
                    }`}
                  >
                    Harian
                  </button>
                  <button
                    onClick={() => setAnalyticsRange("monthly")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      analyticsRange === "monthly" ? "bg-[#14213D] text-white" : "text-[#727782]"
                    }`}
                  >
                    Bulanan
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10">
                  <span className="text-[11px] font-extrabold text-[#727782] uppercase">Kunjungan Hari Ini</span>
                  <div className="font-display text-3xl font-extrabold text-[#14213D] mt-2">
                    {dailyStats[dailyStats.length - 1].visits}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10">
                  <span className="text-[11px] font-extrabold text-[#727782] uppercase">Kunjungan Bulan Ini</span>
                  <div className="font-display text-3xl font-extrabold text-[#167D78] mt-2">1.845</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10">
                  <span className="text-[11px] font-extrabold text-[#727782] uppercase">Total Kunjungan</span>
                  <div className="font-display text-3xl font-extrabold text-[#14213D] mt-2">10.035</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10">
                  <span className="text-[11px] font-extrabold text-[#727782] uppercase">Tampilan Halaman</span>
                  <div className="font-display text-3xl font-extrabold text-[#F2B84B] mt-2">
                    {dailyStats[dailyStats.length - 1].pageViews}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#14213D]/10">
                  <span className="text-[11px] font-extrabold text-[#727782] uppercase">Pengunjung Unik</span>
                  <div className="font-display text-3xl font-extrabold text-[#167D78] mt-2">
                    {dailyStats[dailyStats.length - 1].uniqueVisitorsEstimate}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-[#14213D]/10 space-y-4">
                  <h3 className="font-display text-base font-extrabold text-[#14213D]">Grafik Kunjungan Harian</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="dateKey" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="visits" stroke="#167D78" strokeWidth={3} fill="#167D78" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#14213D]/10 space-y-4">
                  <h3 className="font-display text-base font-extrabold text-[#14213D]">Grafik Kunjungan Bulanan</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={INITIAL_MONTHLY_ANALYTICS}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="monthKey" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="visits" fill="#14213D" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "panduan" && (
            <motion.div
              key="panduan"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-8"
            >
              {/* HEADER INFORMASI PROGRAM */}
              <div className="bg-[#14213D] text-white p-7 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-[#167D78]/30 blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-3xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F2B84B] text-[#14213D] text-xs font-extrabold uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    Tentang Program & Panduan Singkat
                  </div>
                  <h1 className="font-display text-2xl sm:text-4xl font-extrabold leading-tight">
                    Hasil Karya Kelas Digitalisasi Gugus 2 — Hulu Sungai Utara
                  </h1>
                  <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                    <strong>BAKARYA (Banua Berkarya Digital)</strong> lahir dari inisiatif{" "}
                    <strong className="text-[#F2B84B]">
                      Kelas Digitalisasi Gugus 2 — Kabupaten Hulu Sungai Utara, Sekolah Penerima BOS Kinerja Terbaik Tahun 2026
                    </strong>
                    . Portal ini dikembangkan secara terbuka untuk seluruh guru dan pendidik agar dapat saling berbagi media pembelajaran yang berkualitas, aman, dan berdampak.
                  </p>
                </div>
              </div>

              {/* 3 LANGKAH MUDAH MENJADI KONTRIBUTOR */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#14213D]/10 shadow-sm space-y-6">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">
                    Alur Cepat & Mudah Dipahami
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#14213D] mt-1">
                    3 Langkah Berbagi Karya di BAKARYA
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#14213D] text-[#F2B84B] font-display font-extrabold text-sm flex items-center justify-center">
                      1
                    </div>
                    <h3 className="font-display font-extrabold text-base text-[#14213D]">
                      Daftar dengan Akun Google
                    </h3>
                    <p className="text-xs text-[#727782] leading-relaxed">
                      Klik tombol <strong>"Daftar dgn Google"</strong> di pojok kanan atas. Setelah Admin menyetujui pendaftaran Anda, akun otomatis aktif dan siap digunakan.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#167D78] text-white font-display font-extrabold text-sm flex items-center justify-center">
                      2
                    </div>
                    <h3 className="font-display font-extrabold text-base text-[#14213D]">
                      Siapkan Tautan Karya
                    </h3>
                    <p className="text-xs text-[#727782] leading-relaxed">
                      Unggah file/media Anda ke Google Drive, Canva, atau platform edukasi lainnya. Pastikan akses tautan diatur ke <strong>"Siapa saja yang memiliki tautan"</strong>.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F2B84B] text-[#14213D] font-display font-extrabold text-sm flex items-center justify-center">
                      3
                    </div>
                    <h3 className="font-display font-extrabold text-base text-[#14213D]">
                      Kirim & Terbit ke Publik
                    </h3>
                    <p className="text-xs text-[#727782] leading-relaxed">
                      Isi judul, jenjang, dan tempel tautan karya Anda. Tim Kurator akan memeriksa tautan, lalu menerbitkannya ke halaman publik.
                    </p>
                  </div>
                </div>
              </div>

              {/* PANDUAN GOOGLE DRIVE & PRIVASI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-7 rounded-3xl border border-[#14213D]/10 space-y-4 shadow-sm">
                  <div className="w-11 h-11 rounded-2xl bg-[#167D78]/15 text-[#167D78] flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-lg font-extrabold text-[#14213D]">
                    Cara Mengatur Izin Tautan Google Drive
                  </h2>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-[#20252D]">
                    <li className="flex items-start gap-2.5">
                      <span className="font-extrabold text-[#167D78]">1.</span>
                      <span>Klik kanan file karya di Google Drive, lalu pilih <strong>Bagikan (Share)</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="font-extrabold text-[#167D78]">2.</span>
                      <span>Ubah bagian <em>Akses Umum</em> dari <strong>Dibatasi</strong> menjadi <strong>Siapa saja yang memiliki tautan (Anyone with the link)</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="font-extrabold text-[#167D78]">3.</span>
                      <span>Pastikan peran diatur sebagai <strong>Pelihat (Viewer)</strong>, lalu klik <strong>Salin Tautan</strong>.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-7 rounded-3xl border border-[#14213D]/10 space-y-4 shadow-sm">
                  <div className="w-11 h-11 rounded-2xl bg-[#14213D]/10 text-[#14213D] flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-lg font-extrabold text-[#14213D]">
                    Keamanan Akun & Privasi Pengunjung
                  </h2>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-[#20252D]">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#167D78] shrink-0 mt-0.5" />
                      <span><strong>Foto Profil Maksimal 1 MB:</strong> Kontributor & Admin dapat mengunggah foto profil sendiri dari perangkat (maks. 1 MB).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#167D78] shrink-0 mt-0.5" />
                      <span><strong>Privasi Email Guru:</strong> Alamat email pribadi kontributor tidak ditampilkan di halaman publik.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#167D78] shrink-0 mt-0.5" />
                      <span><strong>Analitik Anonim WITA:</strong> Statistik kunjungan hanya mencatat sesi anonim tanpa menyimpan alamat IP pengunjung.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "arsitektur" && role === "superAdmin" && (
            <motion.div
              key="arsitektur"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <div className="bg-[#14213D] text-white p-6 sm:p-8 rounded-3xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2B84B] text-[#14213D] text-xs font-extrabold uppercase">
                  <Lock className="w-3.5 h-3.5" />
                  Eksklusif Super Admin
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold">Konfigurasi Cloud Firestore & Security Rules</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CodeBlockCard
                  title="firestore.rules"
                  code={`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function getUserData() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data; }
    function hasRole(roles) { return isSignedIn() && getUserData().accountStatus == 'active' && (getUserData().role in roles); }
    function isAdmin() { return hasRole(['admin', 'superAdmin']); }

    match /works/{workId} {
      allow read: if (resource.data.status == 'published' && resource.data.isDeleted == false) || isAdmin();
      allow create, update: if isSignedIn();
    }
  }
}`}
                />
                <CodeBlockCard
                  title="firestore.indexes.json"
                  code={`{
  "indexes": [
    {
      "collectionGroup": "works",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "isDeleted", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    }
  ]
}`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MODAL DETAIL KARYA */}
      <AnimatePresence>
        {selectedWork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#14213D]/10 my-8"
            >
              <div className="relative h-60 sm:h-72 bg-[#14213D] flex items-center justify-center p-2">
                <img
                  src={getDriveDirectImageUrl(selectedWork.thumbnailURL) || BAKARYA_DEFAULT_THUMBNAIL_URL}
                  alt={selectedWork.title}
                  className={`w-full h-full opacity-95 ${
                    (getDriveDirectImageUrl(selectedWork.thumbnailURL) || BAKARYA_DEFAULT_THUMBNAIL_URL) ===
                    BAKARYA_DEFAULT_THUMBNAIL_URL
                      ? "object-contain p-2"
                      : "object-cover"
                  }`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = BAKARYA_DEFAULT_THUMBNAIL_URL;
                  }}
                />
                <button
                  onClick={() => setSelectedWork(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#14213D]/80 text-white flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-6 right-6 flex items-center gap-2">
                  <StatusBadge status={selectedWork.status} />
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-[#14213D]">{selectedWork.title}</h2>
                  <p className="text-sm font-bold text-[#167D78] mt-1">
                    Oleh {selectedWork.contributorNameSnapshot} • {selectedWork.contributorInstitution}
                  </p>
                </div>

                <p className="text-sm sm:text-base text-[#20252D] leading-relaxed">{selectedWork.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#14213D]/10">
                  <span className="text-xs text-[#727782]">Tautan Google Drive tervalidasi aman.</span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShareModalWork(selectedWork)}
                      className="px-4 py-3 rounded-xl bg-[#F8F7F2] hover:bg-[#14213D] text-[#14213D] hover:text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-[#14213D]/15 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Bagikan</span>
                    </button>
                    <a
                      href={selectedWork.mediaURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleOutboundClick(selectedWork)}
                      className="px-6 py-3 rounded-xl bg-[#167D78] hover:bg-[#14213D] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md"
                    >
                      <span>Buka Karya</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL BAGIKAN KARYA DENGAN THUMBNAIL PRATINJAU MEDIA / DEFAULT DRIVE */}
      <AnimatePresence>
        {shareModalWork && (
          <ShareWorkModal
            work={shareModalWork}
            mediaTypesList={mediaTypesList}
            onClose={() => setShareModalWork(null)}
            onCopied={() => triggerToast("Tautan & pratinjau karya berhasil disalin!", "success")}
          />
        )}
      </AnimatePresence>

      {/* MODAL MODERASI ADMIN */}
      <AnimatePresence>
        {moderationModalWork && (
          <ModerationDecisionModal
            work={moderationModalWork}
            onClose={() => setModerationModalWork(null)}
            onConfirm={handleModerationDecision}
          />
        )}
      </AnimatePresence>

      {/* MODAL EDIT/TAMBAH KARYA */}
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
            onSave={(payload, submitForReview) => {
              const nowWITA = "16 Okt 2026, 20:30 WITA";
              // Jika thumbnail kosong, gunakan thumbnail dari link Google Drive media atau gambar default BAKARYA
              const resolvedThumb = payload.thumbnailURL?.trim()
                ? getDriveDirectImageUrl(payload.thumbnailURL)
                : getDriveDirectImageUrl(payload.mediaURL) !== payload.mediaURL
                ? getDriveDirectImageUrl(payload.mediaURL)
                : BAKARYA_DEFAULT_THUMBNAIL_URL;

              if (editingWork) {
                setWorks((prev) =>
                  prev.map((w) =>
                    w.id === editingWork.id
                      ? {
                          ...w,
                          ...payload,
                          thumbnailURL: resolvedThumb,
                          status: submitForReview ? "pending_review" : "draft",
                          updatedAt: nowWITA,
                          submittedAt: submitForReview ? nowWITA : w.submittedAt
                        }
                      : w
                  )
                );
                triggerToast(submitForReview ? "Karya diajukan ke Admin!" : "Draf disimpan.", "success");
              } else {
                const newWork = {
                  id: "work-" + Date.now(),
                  title: payload.title,
                  slug: payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  shortDescription: payload.shortDescription,
                  description: payload.description,
                  thumbnailURL: resolvedThumb,
                  mediaURL: payload.mediaURL,
                  mediaTypeId: payload.mediaTypeId,
                  categoryIds: payload.categoryIds,
                  educationLevelIds: payload.educationLevelIds,
                  classIds: payload.classIds || ["k4"],
                  subjectIds: payload.subjectIds,
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
                  isDeleted: false
                };
                setWorks((prev) => [newWork, ...prev]);
                triggerToast(submitForReview ? "Karya diajukan ke Admin!" : "Disimpan sebagai Draf.", "success");
              }
              setIsFormModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* MODAL TAMBAH/EDIT AKUN PENGGUNA */}
      <AnimatePresence>
        {isUserModalOpen && (
          <UserAccountModal
            initialData={editingUser}
            currentRole={role}
            onClose={() => setIsUserModalOpen(false)}
            onSave={(userData) => {
              const nowWITA = "16 Okt 2026, 09:00 WITA";
              if (editingUser) {
                setUsersList((prev) =>
                  prev.map((u) => (u.uid === editingUser.uid ? { ...u, ...userData, updatedAt: nowWITA } : u))
                );
                triggerToast(`Akun ${userData.displayName} berhasil diperbarui!`, "success");
              } else {
                const newUser = {
                  uid: "uid-user-" + Date.now(),
                  ...userData,
                  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                  publicProfileEnabled: true,
                  isDeleted: false,
                  deletedAt: null,
                  deletedBy: null,
                  lastLoginAt: "Belum pernah login"
                };
                setUsersList((prev) => [newUser, ...prev]);
                triggerToast(`Akun ${userData.displayName} berhasil ditambahkan!`, "success");
              }
              setIsUserModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* MODAL EDIT PROFIL MANDIRI */}
      <AnimatePresence>
        {isSelfProfileModalOpen && currentUserProfile && (
          <SelfProfileModal
            user={currentUserProfile}
            onClose={() => setIsSelfProfileModalOpen(false)}
            onSave={(updatedFields) => {
              setUsersList((prev) =>
                prev.map((u) => (u.uid === currentUserProfile.uid ? { ...u, ...updatedFields } : u))
              );
              setIsSelfProfileModalOpen(false);
              triggerToast("Profil, foto, dan password Anda berhasil diperbarui!", "success");
            }}
          />
        )}
      </AnimatePresence>

      {/* MODAL LOGIN & DAFTAR DENGAN AKUN GOOGLE */}
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

      {/* MODAL KONFIRMASI HAPUS PENGGUNA */}
      <AnimatePresence>
        {userConfirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <UserX className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display text-lg font-extrabold text-[#14213D]">Hapus & Cabut Akses Pengguna?</h3>
                <p className="text-xs sm:text-sm text-[#727782] leading-relaxed">
                  Anda akan menonaktifkan akun <strong>{userConfirmDelete.displayName}</strong>.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => handleDeleteUser(userConfirmDelete.uid, "soft")}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold"
                >
                  Nonaktifkan (Soft Delete)
                </button>
                {role === "superAdmin" && (
                  <button
                    onClick={() => handleDeleteUser(userConfirmDelete.uid, "permanent")}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold"
                  >
                    Hapus Permanen
                  </button>
                )}
                <button
                  onClick={() => setUserConfirmDelete(null)}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#14213D]/15 text-xs font-bold text-[#727782]"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-20 border-t border-[#14213D]/10 bg-white py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#727782]">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <img
              src={BAKARYA_LOGO_URL}
              alt="Logo BAKARYA"
              className="w-10 h-10 object-contain rounded-xl border border-[#14213D]/10 p-1 bg-[#F8F7F2] hidden sm:block"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="font-display font-extrabold text-[#14213D] text-sm">BAKARYA</span>
                <span>•</span>
                <span className="font-bold text-[#167D78]">
                  Kelas Digitalisasi Gugus 2 — Hulu Sungai Utara (Sekolah Penerima BOS Kinerja Terbaik 2026)
                </span>
              </div>
              <p className="text-[11px] text-[#727782]">
                Dikembangkan untuk seluruh guru • Dari Banua, Bertumbuh Bersama, Berdampak untuk Semua.
              </p>
            </div>
          </div>
          <div className="text-center md:text-right shrink-0">
            Kabupaten Hulu Sungai Utara, Kalimantan Selatan • Zona Waktu WITA
          </div>
        </div>
      </footer>
    </div>
  );
}

function WorkCard({ work, mediaTypesList, onSelect, onShare, onSelectContributor }) {
  const list = mediaTypesList || INITIAL_MEDIA_TYPES;
  const mediaType = list.find((m) => m.id === work.mediaTypeId);
  const displayThumb = getDriveDirectImageUrl(work.thumbnailURL) || BAKARYA_DEFAULT_THUMBNAIL_URL;
  const isDefaultBanner = displayThumb === BAKARYA_DEFAULT_THUMBNAIL_URL;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="bg-white rounded-3xl border border-[#14213D]/10 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
    >
      <div onClick={onSelect} className="cursor-pointer">
        <div className="relative h-48 overflow-hidden bg-[#14213D] flex items-center justify-center">
          <img
            src={displayThumb}
            alt={work.title}
            className={`w-full h-full group-hover:scale-105 transition-transform duration-500 ${
              isDefaultBanner ? "object-contain p-2" : "object-cover"
            }`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = BAKARYA_DEFAULT_THUMBNAIL_URL;
            }}
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-3 py-1 rounded-full bg-[#14213D]/85 backdrop-blur-md text-white text-[11px] font-bold">
              {mediaType?.name || "Media"}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#F2B84B] text-[#14213D] text-[11px] font-extrabold uppercase">
              {work.educationLevelIds.join(" • ")}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-2.5">
          <h3 className="font-display font-extrabold text-lg text-[#14213D] group-hover:text-[#167D78] transition-colors line-clamp-2 leading-snug">
            {work.title}
          </h3>
          <p className="text-xs text-[#727782] line-clamp-2 leading-relaxed">{work.shortDescription}</p>
        </div>
      </div>

      <div className="px-6 pb-5 pt-3 border-t border-[#14213D]/5 flex items-center justify-between text-xs">
        <div onClick={() => onSelectContributor && onSelectContributor(work.contributorId)} className="cursor-pointer hover:underline">
          <span className="font-bold text-[#14213D] block">{work.contributorNameSnapshot}</span>
          <span className="text-[#727782] text-[11px]">{work.contributorInstitution}</span>
        </div>
        <div className="flex items-center gap-2.5 text-[#727782] font-bold">
          <span className="flex items-center gap-1" title="Kunjungan">
            <Eye className="w-3.5 h-3.5 text-[#167D78]" />
            {work.viewCount}
          </span>
          <span className="flex items-center gap-1" title="Klik Karya">
            <MousePointerClick className="w-3.5 h-3.5 text-[#F2B84B]" />
            {work.outboundClickCount}
          </span>
          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare(work);
              }}
              className="p-1.5 rounded-lg bg-[#F8F7F2] hover:bg-[#14213D] text-[#14213D] hover:text-white transition-colors"
              title="Bagikan Karya"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const map = {
    draft: { label: "Draf", cls: "bg-slate-100 text-slate-700 border-slate-300", icon: FileText },
    pending_review: { label: "Menunggu Tinjauan", cls: "bg-amber-100 text-amber-900 border-amber-300", icon: Clock },
    revision_requested: { label: "Perlu Revisi", cls: "bg-orange-100 text-orange-900 border-orange-300", icon: AlertTriangle },
    published: { label: "Terbit", cls: "bg-emerald-100 text-emerald-900 border-emerald-300", icon: CheckCircle2 },
    rejected: { label: "Ditolak", cls: "bg-rose-100 text-rose-900 border-rose-300", icon: XCircle },
    archived: { label: "Arsip", cls: "bg-gray-200 text-gray-700 border-gray-300", icon: Lock }
  };
  const item = map[status] || map.draft;
  const Icon = item.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${item.cls}`}>
      <Icon className="w-3 h-3" />
      {item.label}
    </span>
  );
}

function ModerationDecisionModal({ work, onClose, onConfirm }) {
  const [decision, setDecision] = useState("published");
  const [note, setNote] = useState(work?.moderationNote || "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase text-[#167D78]">Moderasi Kurator</span>
            <h3 className="font-display text-lg font-extrabold text-[#14213D] line-clamp-1">{work.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F8F7F2] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-extrabold uppercase text-[#14213D]">Keputusan Moderasi:</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "published", label: "Terbitkan" },
              { id: "revision_requested", label: "Minta Revisi" },
              { id: "rejected", label: "Tolak" },
              { id: "archived", label: "Arsipkan" }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDecision(opt.id)}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                  decision === opt.id ? "bg-[#14213D] text-white border-[#14213D]" : "bg-[#F8F7F2] text-[#20252D] border-[#14213D]/15"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">Catatan Moderasi / Revisi:</label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Berikan catatan umpan balik untuk kontributor..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border text-xs font-bold">
            Batal
          </button>
          <button
            onClick={() => onConfirm(work.id, decision, note)}
            className="px-5 py-2 rounded-xl bg-[#167D78] text-white text-xs font-bold"
          >
            Simpan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ShareWorkModal({ work, mediaTypesList, onClose, onCopied }) {
  const mediaType = (mediaTypesList || INITIAL_MEDIA_TYPES).find((m) => m.id === work.mediaTypeId);
  // Gunakan thumbnail karya jika ada; jika kosong gunakan gambar default Google Drive BAKARYA
  const shareThumbUrl = getDriveDirectImageUrl(work.thumbnailURL) || BAKARYA_DEFAULT_THUMBNAIL_URL;
  const isDefaultBanner = shareThumbUrl === BAKARYA_DEFAULT_THUMBNAIL_URL;
  const shareUrl = `https://bakarya-hsu.id/karya/${work.slug}`;

  const handleCopyShareLink = () => {
    const shareText = `${work.title} — Oleh ${work.contributorNameSnapshot} (${work.contributorInstitution})\nAkses di BAKARYA Gugus 2 HSU: ${shareUrl}`;
    const textarea = document.createElement("textarea");
    textarea.value = shareText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    onCopied();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <img
              src={BAKARYA_LOGO_URL}
              alt="Logo"
              className="w-7 h-7 object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#167D78] block">
                Pratinjau Tautan Berbagi
              </span>
              <h3 className="font-display text-base font-extrabold text-[#14213D]">Bagikan Karya ke Guru / Grup WA</h3>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F8F7F2] flex items-center justify-center text-[#727782]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Kartu Pratinjau Sosial Media (Open Graph Card Preview) */}
        <div className="rounded-2xl overflow-hidden border border-[#14213D]/15 bg-[#F8F7F2] shadow-sm">
          <div className="relative h-44 bg-[#14213D] flex items-center justify-center">
            <img
              src={shareThumbUrl}
              alt={work.title}
              className={`w-full h-full ${isDefaultBanner ? "object-contain p-2" : "object-cover"}`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = BAKARYA_DEFAULT_THUMBNAIL_URL;
              }}
            />
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#14213D]/85 text-white text-[10px] font-bold">
                {mediaType?.name || "Media"}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#167D78]">
              BAKARYA-HSU.ID • KELAS DIGITALISASI GUGUS 2 HSU
            </div>
            <h4 className="font-display font-extrabold text-sm text-[#14213D] line-clamp-2">{work.title}</h4>
            <p className="text-xs text-[#727782] line-clamp-2">{work.shortDescription}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-mono text-[#14213D]"
          />
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="px-4 py-2.5 rounded-xl bg-[#167D78] hover:bg-[#14213D] text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WorkFormWizardModal({
  initialData,
  subjectsList,
  categoriesList,
  mediaTypesList,
  onAddSubject,
  onAddCategory,
  onAddMediaType,
  onClose,
  onSave
}) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(initialData?.title || "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [mediaTypeId, setMediaTypeId] = useState(initialData?.mediaTypeId || "game");
  const [educationLevelIds, setEducationLevelIds] = useState(initialData?.educationLevelIds || ["sd"]);
  const [subjectIds, setSubjectIds] = useState(initialData?.subjectIds || ["matematika"]);
  const [categoryIds, setCategoryIds] = useState(initialData?.categoryIds || ["cat-ekologi"]);
  const [mediaURL, setMediaURL] = useState(initialData?.mediaURL || "");
  const [thumbnailURL, setThumbnailURL] = useState(initialData?.thumbnailURL || "");
  const [errorMsg, setErrorMsg] = useState(null);

  // Input manual baru
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [customMediaInput, setCustomMediaInput] = useState("");

  const toggleArrayItem = (arr, setter, item) => {
    if (arr.includes(item)) {
      if (arr.length > 1) setter(arr.filter((i) => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const validateAndSubmit = (submitForReview) => {
    if (!title.trim() || title.trim().length < 5) {
      setErrorMsg("Judul karya minimal 5 karakter.");
      setStep(1);
      return;
    }
    if (!shortDescription.trim()) {
      setErrorMsg("Ringkasan singkat wajib diisi.");
      setStep(1);
      return;
    }
    try {
      const parsed = new URL(mediaURL);
      if (parsed.protocol !== "https:") {
        setErrorMsg("Tautan wajib diawali dengan https://");
        setStep(3);
        return;
      }
    } catch {
      setErrorMsg("Format URL media tidak valid.");
      setStep(3);
      return;
    }
    onSave(
      { title, shortDescription, description, mediaTypeId, educationLevelIds, subjectIds, categoryIds, mediaURL, thumbnailURL },
      submitForReview
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8"
      >
        <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">Formulir Karya</span>
            <h2 className="font-display text-xl font-extrabold text-[#14213D]">
              {initialData ? "Edit Karya" : "Unggah Karya"}
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F8F7F2] flex items-center justify-center text-[#727782]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { num: 1, label: "1. Info" },
            { num: 2, label: "2. Mapel & Media" },
            { num: 3, label: "3. Tautan" }
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                step === s.num ? "bg-[#14213D] text-white" : "bg-[#F8F7F2] text-[#727782]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">Judul Karya *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Petualangan Matematika Rawa Lebak"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">Ringkasan Singkat *</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="1-2 kalimat ringkasan..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">Deskripsi Lengkap</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-sm"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {/* Jenjang Pendidikan */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1.5">Jenjang Pendidikan:</label>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => toggleArrayItem(educationLevelIds, setEducationLevelIds, lvl.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      educationLevelIds.includes(lvl.id) ? "bg-[#14213D] text-white border-[#14213D]" : "bg-[#F8F7F2] text-[#20252D] border-[#14213D]/15"
                    }`}
                  >
                    {lvl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Jenis Media (Wajib ada Game, Media, Video + bisa ketik tambah sendiri) */}
            <div className="p-3.5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 space-y-2.5">
              <label className="block text-xs font-extrabold uppercase text-[#14213D]">
                Jenis Media (Wajib ada: Game, Media, Video — atau ketik baru):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {mediaTypesList.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMediaTypeId(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      mediaTypeId === m.id
                        ? "bg-[#167D78] text-white border-[#167D78]"
                        : "bg-white text-[#20252D] border-[#14213D]/15"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customMediaInput}
                  onChange={(e) => setCustomMediaInput(e.target.value)}
                  placeholder="Ketik jenis media baru (misal: Komik, Podcast)..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#14213D]/15 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newId = onAddMediaType(customMediaInput);
                    if (newId) {
                      setMediaTypeId(newId);
                      setCustomMediaInput("");
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#14213D] text-white text-xs font-bold"
                >
                  + Tambah
                </button>
              </div>
            </div>

            {/* Mata Pelajaran (Pilih dari yang pernah dibuat atau ketik baru) */}
            <div className="p-3.5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 space-y-2.5">
              <label className="block text-xs font-extrabold uppercase text-[#14213D]">
                Mata Pelajaran (Pilih atau ketik baru):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {subjectsList.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleArrayItem(subjectIds, setSubjectIds, sub.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      subjectIds.includes(sub.id)
                        ? "bg-[#167D78] text-white border-[#167D78]"
                        : "bg-white text-[#20252D] border-[#14213D]/15"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                  placeholder="Ketik mata pelajaran baru..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#14213D]/15 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newId = onAddSubject(customSubjectInput);
                    if (newId) {
                      if (!subjectIds.includes(newId)) setSubjectIds([...subjectIds, newId]);
                      setCustomSubjectInput("");
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#14213D] text-white text-xs font-bold"
                >
                  + Tambah
                </button>
              </div>
            </div>

            {/* Kategori Karya (Pilih dari yang pernah dibuat atau ketik baru) */}
            <div className="p-3.5 rounded-2xl bg-[#F8F7F2] border border-[#14213D]/10 space-y-2.5">
              <label className="block text-xs font-extrabold uppercase text-[#14213D]">
                Kategori Karya (Pilih atau ketik baru):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleArrayItem(categoryIds, setCategoryIds, cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      categoryIds.includes(cat.id)
                        ? "bg-[#167D78] text-white border-[#167D78]"
                        : "bg-white text-[#20252D] border-[#14213D]/15"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  placeholder="Ketik kategori baru..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#14213D]/15 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newId = onAddCategory(customCategoryInput);
                    if (newId) {
                      if (!categoryIds.includes(newId)) setCategoryIds([...categoryIds, newId]);
                      setCustomCategoryInput("");
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#14213D] text-white text-xs font-bold"
                >
                  + Tambah
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#167D78]/10 border border-[#167D78]/25 space-y-2">
              <label className="block text-xs font-extrabold uppercase text-[#167D78]">URL Google Drive / Media (HTTPS) *</label>
              <input
                type="url"
                value={mediaURL}
                onChange={(e) => setMediaURL(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#14213D]/15 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
                URL Gambar Sampul / Link Foto Google Drive (Opsional)
              </label>
              <input
                type="url"
                value={thumbnailURL}
                onChange={(e) => setThumbnailURL(e.target.value)}
                placeholder="Tempel link Google Drive gambar atau kosongkan untuk memakai sampul resmi BAKARYA..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-sm"
              />
              <p className="text-[11px] text-[#727782] mt-1">
                Mendukung tautan berbagi Google Drive (ID gambar akan diambil otomatis). Jika dikosongkan, sistem otomatis memakai gambar sampul resmi BAKARYA Gugus 2 HSU.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-[#14213D]/10">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 rounded-xl border text-xs font-bold">
              Kembali
            </button>
          ) : <div />}
          {step < 3 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="px-5 py-2 rounded-xl bg-[#14213D] text-white text-xs font-bold">
              Lanjut
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => validateAndSubmit(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">
                Draf
              </button>
              <button onClick={() => validateAndSubmit(true)} className="px-5 py-2 rounded-xl bg-[#167D78] text-white text-xs font-bold">
                Kirim
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function UserAccountModal({ initialData, currentRole, onClose, onSave }) {
  const [displayName, setDisplayName] = useState(initialData?.displayName || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [username, setUsername] = useState(initialData?.username || "");
  const [tempPassword, setTempPassword] = useState(initialData?.tempPassword || "Bakarya#2026");
  const [institution, setInstitution] = useState(initialData?.institution || "");
  const [userRole, setUserRole] = useState(initialData?.role || "contributor");
  const [accountStatus, setAccountStatus] = useState(initialData?.accountStatus || "active");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!displayName || !email || !username) {
      setError("Nama, Email, dan Username wajib diisi.");
      return;
    }
    onSave({ displayName, email, username, tempPassword, institution, role: userRole, accountStatus });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8"
      >
        <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">Manajemen Akun</span>
            <h2 className="font-display text-xl font-extrabold text-[#14213D]">
              {initialData ? "Edit Akun & Password" : "Tambah Akun Peserta"}
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F8F7F2] flex items-center justify-center text-[#727782]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Nama Lengkap & Gelar *</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Asal Instansi *</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Username *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border text-xs font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Password Sementara *</label>
            <input
              type="text"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border text-xs font-mono font-bold"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Hak Akses (Role)</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border text-xs font-bold"
              >
                <option value="contributor">Kontributor</option>
                <option value="admin">Admin Kurator</option>
                {currentRole === "superAdmin" && <option value="superAdmin">Super Admin</option>}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Status Akun</label>
              <select
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border text-xs font-bold"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border text-xs font-bold">Batal</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-[#167D78] text-white text-xs font-bold">Simpan Akun</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
];

function SelfProfileModal({ user, onClose, onSave }) {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [institution, setInstitution] = useState(user.institution || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatar, setAvatar] = useState(user.avatar || PRESET_AVATARS[0]);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const maxSizeBytes = 1024 * 1024; // 1 MB
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Format file harus berupa gambar (JPG, PNG, atau WEBP).");
      e.target.value = "";
      return;
    }
    if (file.size > maxSizeBytes) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMsg(`Ukuran foto (${sizeInMB} MB) melebihi batas maksimal 1 MB. Silakan pilih foto yang lebih kecil.`);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result);
        setUploadedFileName(`${file.name} (${(file.size / 1024).toFixed(0)} KB)`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!displayName || !institution) {
      setErrorMsg("Nama dan instansi wajib diisi.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setErrorMsg("Password baru minimal 6 karakter.");
      return;
    }
    onSave({
      displayName,
      institution,
      bio,
      avatar,
      ...(newPassword ? { tempPassword: newPassword } : {})
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8"
      >
        <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#167D78]">Profil Saya</span>
            <h2 className="font-display text-xl font-extrabold text-[#14213D]">Edit Profil, Upload Foto & Password</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F8F7F2] flex items-center justify-center text-[#727782]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#F8F7F2] p-4 rounded-2xl border border-[#14213D]/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-[#F2B84B] shrink-0" />
              <div className="space-y-2 flex-1">
                <label className="block text-xs font-extrabold uppercase text-[#14213D]">
                  Upload Foto Profil Sendiri (Maks. 1 MB)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-[#14213D] hover:bg-[#167D78] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#F2B84B]" />
                    <span>Pilih Foto dari Perangkat</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadedFileName && (
                    <span className="text-[11px] font-bold text-[#167D78] bg-[#167D78]/10 px-2.5 py-1 rounded-lg">
                      ✓ {uploadedFileName}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#727782]">
                  Mendukung JPG, PNG, atau WEBP dengan ukuran maksimal 1 MB. Atau pilih avatar cepat:
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(url);
                        setUploadedFileName("");
                        setErrorMsg(null);
                      }}
                      className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-transform ${
                        avatar === url ? "border-[#167D78] scale-110" : "border-transparent"
                      }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Nama Lengkap *</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Asal Sekolah / Instansi *</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Bio Singkat</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F2] border text-xs"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#167D78]/10 border border-[#167D78]/25 space-y-2">
            <label className="block text-xs font-bold uppercase text-[#167D78]">Ganti Password Baru (Opsional)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border text-xs font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border text-xs font-bold">Batal</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-[#167D78] text-white text-xs font-bold">Simpan Profil</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function GoogleAuthModal({ initialMode, usersList, onClose, onSubmitAuth }) {
  const [mode, setMode] = useState(initialMode || "login");
  const [email, setEmail] = useState("siti.rahmah@guru.sd.belajar.id");
  const [displayName, setDisplayName] = useState("");
  const [institution, setInstitution] = useState("");
  const [district, setDistrict] = useState("Kec. Amuntai Tengah, HSU");
  const [errorMsg, setErrorMsg] = useState(null);

  const activeUsers = usersList.filter((u) => !u.isDeleted);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Masukkan alamat email Akun Google / Belajar.id yang valid.");
      return;
    }

    if (mode === "register") {
      if (!displayName.trim() || !institution.trim()) {
        setErrorMsg("Nama lengkap dan asal sekolah wajib diisi saat mendaftar.");
        return;
      }
    }

    onSubmitAuth({
      mode,
      email,
      displayName,
      institution,
      district
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8"
      >
        <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#167D78]">
              Akun Google
            </span>
            <h2 className="font-display text-xl font-extrabold text-[#14213D] mt-0.5">
              {mode === "login" ? "Masuk" : "Daftar"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F8F7F2] flex items-center justify-center text-[#727782]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Switcher Login / Register */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#F8F7F2] p-1.5 rounded-2xl border border-[#14213D]/10">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
              mode === "login" ? "bg-[#14213D] text-white shadow-sm" : "text-[#727782]"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setEmail("");
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
              mode === "register" ? "bg-[#167D78] text-white shadow-sm" : "text-[#727782]"
            }`}
          >
            Daftar
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div className="p-3.5 rounded-2xl bg-[#167D78]/10 border border-[#167D78]/25 text-xs text-[#14213D] leading-relaxed">
                Daftar dengan <strong>Akun Google / belajar.id</strong>. Begitu disetujui Admin, akun otomatis aktif!
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
                  Asal Sekolah / Instansi *
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Contoh: SDN Paliwara 2 Amuntai"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-medium"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-extrabold uppercase text-[#14213D] mb-1">
              Email Google / Belajar.id *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama.guru@guru.sd.belajar.id"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#14213D]/15 text-xs font-mono"
            />
          </div>

          {mode === "login" && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#727782]">
                Pilih Akun Terdaftar:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activeUsers.map((u) => (
                  <button
                    key={u.uid}
                    type="button"
                    onClick={() => setEmail(u.email)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                      email === u.email
                        ? "bg-[#14213D] text-white border-[#14213D]"
                        : "bg-[#F8F7F2] text-[#20252D] border-[#14213D]/15"
                    }`}
                  >
                    {u.displayName.split(",")[0]} ({u.accountStatus === "pending" ? "Pending" : u.role})
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#14213D] hover:bg-[#167D78] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span className="w-5 h-5 rounded-full bg-white text-[#14213D] font-extrabold text-xs flex items-center justify-center">
              G
            </span>
            <span>{mode === "login" ? "Masuk" : "Daftar"}</span>
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function CodeBlockCard({ title, code }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-[#14213D] text-white rounded-3xl p-6 space-y-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <span className="text-xs font-bold text-[#F2B84B]">{title}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="px-3 py-1 rounded-lg bg-white/10 text-[11px] font-bold flex items-center gap-1"
        >
          {copied ? <CheckCheck className="w-3.5 h-3.5 text-[#F2B84B]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Tersalin" : "Salin"}</span>
        </button>
      </div>
      <pre className="text-[11px] font-mono text-white/90 overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  );
}