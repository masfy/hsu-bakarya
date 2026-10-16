# 🌟 BAKARYA — Banua Berkarya Digital
> **Portal Repositori & Kurasi Media Pembelajaran Digital Interaktif**  
> Inovasi Komunitas Belajar & Kelas Digitalisasi Pendidik Gugus 2 Kabupaten Hulu Sungai Utara (HSU), Kalimantan Selatan  
> *Penerima BOS Kinerja Sekolah Berprestasi Terbaik Tahun 2026*

---

## 🚀 Fitur Utama Portal

1. **Beranda Interaktif & Beranimasi**:
   - Hero banner dengan teks berputar dinamis (*"Bertumbuh Bersama"*, *"Berkarya Digital"*, *"Menginspirasi Kelas"*, *"Memajukan Banua"*).
   - Penampil visual dan thumbnail otomatis dari Google Drive resmi BAKARYA.
   - Pilihan kategori media interaktif (Game Edukasi, Media Simulasi, Video Animasi, Alat Bantu Kelas, Modul PDF, Audio Banjar).
   - Katalog karya pilihan dan unggulan terbaru.

2. **Jelajah Karya (Multi-Faceted Search & Filters)**:
   - Pencarian real-time berdasarkan judul, deskripsi, atau nama guru.
   - 6 Filter simultan: Jenjang Pendidikan (PAUD, SD, SMP, SMA, Umum), Kelas, Mata Pelajaran, Kategori Inovasi, Format Media, dan Guru Kontributor.
   - Pengurutan karya: Terbaru atau Paling Populer (berdasarkan jumlah kunjungan).

3. **Direktori Pendidik Banua (Kontributor)**:
   - Profil publik guru kreator beserta asal sekolah/instansi dan kecamatan.
   - Statistik karya terbit dan akumulasi jumlah kunjungan.
   - Perlindungan privasi guru (email pribadi tidak diekspos ke publik).

4. **Portal Kerja & Kurasi (Dashboard)**:
   - **Untuk Guru / Kontributor**: Formulir wizard 3 langkah untuk mengunggah draf karya, menambahkan mapel/kategori/media kustom, serta menanggapi catatan revisi kurator.
   - **Untuk Admin Kurator Disdik HSU**: Antrean kurasi karya digital dengan opsi *Terbitkan*, *Minta Revisi* (disertai catatan umpan balik), atau *Tolak*.
   - **Untuk Super Admin**: Kontrol penuh hak akses, penghapusan permanen/pemulihan, dan manajemen arsitektur.

5. **Manajemen Pengguna & Kredensial**:
   - Persetujuan pendaftaran akun baru dengan Akun Google / Belajar.id.
   - Pengaturan level hak akses (*Contributor*, *Admin Kurator*, *Super Admin*).
   - Fitur pembekuan akun (*Suspend*), hapus lunak (*Soft Delete*), dan pemulihan akun (*Restore*).

6. **Analitik Transparan (WITA)**:
   - Metrik pengunjung harian, kunjungan bulanan, tampilan halaman, dan klik tautan karya.
   - Grafik interaktif Recharts (`AreaChart` & `BarChart`) disesuaikan dengan zona waktu Asia/Makassar (WITA).

7. **Integrasi Firebase Hybrid (Real + Demo Fallback)**:
   - Jika konfigurasi Firebase di `.env.local` tersedia, portal langsung terhubung secara live ke Cloud Firestore & Firebase Auth.
   - Jika belum dikonfigurasi, portal tetap berjalan 100% mulus dengan dataset interaktif default tanpa crash atau layar kosong!

---

## 📁 Struktur Folder Proyek (Clean Architecture)

```
BAKARYA/
├── public/                       # Aset publik statis
│   └── favicon.ico
├── src/
│   ├── components/               # Komponen UI modular
│   │   ├── cards/
│   │   │   └── WorkCard.tsx      # Kartu karya dengan thumbnail Drive & stats
│   │   ├── common/
│   │   │   ├── CodeBlockCard.tsx # Penampil syntax kode dengan tombol salin
│   │   │   ├── StatusBadge.tsx   # Label status (Terbit, Menunggu, Revisi, Draf)
│   │   │   └── ToastNotification.tsx # Notifikasi pop-up animasi
│   │   ├── layout/
│   │   │   ├── Navbar.tsx        # Navigasi atas responsif (Desktop & Mobile)
│   │   │   └── Footer.tsx        # Footer resmi mitra & BOS Kinerja
│   │   └── modals/               # Dialog & Form Interaktif
│   │       ├── ConfirmDeleteModal.tsx
│   │       ├── GoogleAuthModal.tsx
│   │       ├── ModerationDecisionModal.tsx
│   │       ├── SelfProfileModal.tsx
│   │       ├── ShareWorkModal.tsx
│   │       ├── UserAccountModal.tsx
│   │       └── WorkFormWizardModal.tsx
│   ├── data/
│   │   └── initialData.ts        # Data awal kurasi, taksonomi, dan demo
│   ├── services/                 # Layer koneksi Firebase
│   │   ├── firebase.ts           # Inisialisasi Firebase SDK & fallback detector
│   │   ├── worksService.ts       # Firestore CRUD karya & counter analitik
│   │   └── usersService.ts       # Firestore operasi akun & hak akses
│   ├── types/
│   │   └── index.ts              # Definisi tipe TypeScript lengkap
│   ├── utils/
│   │   └── drive.ts              # Ekstraktor ID Google Drive & thumbnail otomatis
│   ├── views/                    # Tampilan tab / halaman utama
│   │   ├── AnalyticsView.tsx     # Statistik & Grafik Recharts
│   │   ├── ArchitectureView.tsx  # Dokumentasi Firestore & Security Rules
│   │   ├── ContributorsView.tsx  # Direktori Pendidik Banua
│   │   ├── DashboardView.tsx     # Workspace Guru & Kurasi Kurator
│   │   ├── ExploreView.tsx       # Jelajah Karya & 6-Faceted Filters
│   │   ├── GuideView.tsx         # Panduan Kontributor & Google Drive
│   │   ├── HomeView.tsx          # Beranda & Hero Section
│   │   └── UsersView.tsx         # Kelola Pengguna & Akun Belajar.id
│   ├── App.tsx                   # Orkestrator utama aplikasi
│   ├── index.css                 # Konfigurasi Tailwind & tema desain
│   ├── main.tsx                  # Titik masuk React (DOM Mount)
│   └── vite-env.d.ts             # Deklarasi tipe environment Vite
├── firestore.indexes.json        # Indeks komposit Cloud Firestore
├── firestore.rules               # Aturan keamanan database Cloud Firestore
├── vercel.json                   # Konfigurasi rewrite SPA untuk Vercel
├── .env.example                  # Contoh template variabel lingkungan Firebase
├── .gitignore                    # File yang diabaikan oleh Git
├── index.html                    # Kerangka HTML utama dengan SEO & Font
├── package.json                  # Dependensi dan script build
├── tailwind.config.js            # Tema palet warna resmi BAKARYA
├── tsconfig.json                 # Konfigurasi compiler TypeScript
└── vite.config.ts                # Konfigurasi bundler Vite
```

---

## 💻 Panduan Menjalankan Secara Lokal

### 1. Prasyarat
- Pastikan telah terpasang **Node.js** (versi 18 ke atas) dan **npm**.

### 2. Jalankan Server Pengembangan
```bash
# Masuk ke folder proyek
cd BAKARYA

# Jalankan server lokal (Vite)
npm run dev
```
Buka browser di `http://localhost:3000/`.

### 3. Build untuk Produksi
```bash
npm run build
```
Hasil build yang siap di-deploy akan berada di dalam folder `dist/`.

---

## 🔥 Konfigurasi Firebase (Opsional / Siap Produksi)

Jika Anda ingin menghubungkan data ke Firebase Firestore asli:

1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat project baru (misal: `bakarya-portal`).
2. Aktifkan **Authentication** dengan penyedia **Google** dan **Email/Password**.
3. Buat database **Cloud Firestore** dalam mode *Production*.
4. Salin file `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
5. Isi konfigurasi API Key dan Project ID dari Firebase Console:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=bakarya-portal.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=bakarya-portal
   VITE_FIREBASE_STORAGE_BUCKET=bakarya-portal.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:...
   ```
6. Deploy aturan keamanan dan indeks ke Firestore menggunakan Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

---

## 🐙 Langkah Upload ke GitHub

1. Buka [GitHub](https://github.com/) dan buat repositori baru bernama `bakarya-portal` (set ke **Public** atau **Private**).
2. Di terminal Anda:
   ```bash
   # Tambahkan semua file yang telah diatur
   git add .

   # Buat commit pertama
   git commit -m "feat: inisialisasi portal BAKARYA terstruktur dan siap deploy"

   # Hubungkan ke repositori GitHub Anda (ganti USERNAME dengan username GitHub Anda)
   git branch -M main
   git remote add origin https://github.com/USERNAME/bakarya-portal.git

   # Push ke GitHub
   git push -u origin main
   ```

---

## ⚡ Langkah Deploy ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/) dan login menggunakan akun GitHub Anda.
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Pilih repositori **`bakarya-portal`** yang baru saja di-push ke GitHub.
4. Pada bagian konfigurasi:
   - **Framework Preset**: Vercel akan otomatis mendeteksi **Vite**.
   - **Root Directory**: `./` (default).
   - **Build Command**: `npm run build` (default).
   - **Output Directory**: `dist` (default).
5. Masukkan **Environment Variables** (jika menggunakan Firebase produksi) dengan menyalin nama variabel dari file `.env.example`.
6. Klik tombol **"Deploy"**.
7. Dalam ~1 menit, portal **BAKARYA** Anda akan aktif secara langsung dengan domain publik Vercel yang cepat dan aman! (misal: `https://bakarya-portal.vercel.app`).

---

## 🏆 Kemitraan & Lisensi
Dikembangkan untuk mendukung **Kelas Digitalisasi Gugus 2 Kabupaten Hulu Sungai Utara (HSU)** dalam rangka program BOS Kinerja Sekolah Berprestasi 2026.
Hak Cipta © 2026 BAKARYA HSU.
