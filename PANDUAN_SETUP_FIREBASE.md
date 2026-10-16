# 📘 Panduan Lengkap Setup Firebase — Portal BAKARYA Gugus 2 HSU

Panduan ini disusun khusus untuk **Super Admin Portal BAKARYA** agar dapat menghubungkan seluruh fungsionalitas portal (Autentikasi, Database Karya, Akun Pengguna, Moderasi, dan Analitik) ke **Google Firebase (Cloud Firestore & Firebase Auth)** secara nyata **tanpa data tiruan (mock data)**.

---

## 🔑 1. Kredensial Akun Super Admin Utama

Portal BAKARYA telah dikonfigurasi dengan akun Super Admin default berikut:

| Parameter | Nilai Konfigurasi |
| :--- | :--- |
| **Email** | `alfyarnaim@gmail.com` |
| **Nama Lengkap** | `Alfyar Naim` |
| **Jabatan / Instansi** | `Fasilitator Digitalisasi` |
| **Wilayah Gugus** | `Gugus 2 HSU` |
| **Kata Sandi (Password)** | `kadabakarya` |
| **Peran Sistem (Role)** | `superAdmin` *(Akses Penuh: Kelola User, Moderasi, Analitik, Konfigurasi Firestore)* |

---

## 🚀 2. Langkah Demi Langkah Setup di Firebase Console

### Langkah 2.1: Buat Proyek Firebase Baru
1. Buka browser dan kunjungi [Firebase Console](https://console.firebase.google.com/).
2. Login menggunakan akun Google Anda (`alfyarnaim@gmail.com`).
3. Klik tombol **"Add project"** (Tambah Proyek).
4. Masukkan nama project, contoh: `bakarya-gugus2-hsu`.
5. Pada pilihan *Google Analytics*, Anda dapat mengaktifkannya (disarankan) lalu klik **Create project**.
6. Tunggu proses inisialisasi selesai, lalu klik **Continue**.

---

### Langkah 2.2: Aktifkan Firebase Authentication
1. Pada menu navigasi sebelah kiri, klik **Build** > **Authentication**.
2. Klik tombol **Get Started**.
3. Di tab **Sign-in method**, aktifkan 2 penyedia layanan:
   - **Email/Password**:
     - Klik pada baris *Email/Password*.
     - Geser toggle *Enable* menjadi aktif.
     - Klik **Save**.
   - **Google**:
     - Klik pada baris *Google*.
     - Geser toggle *Enable* menjadi aktif.
     - Pilih *Project public-facing name* (misal: `BAKARYA Gugus 2 HSU`).
     - Pilih *Project support email*: `alfyarnaim@gmail.com`.
     - Klik **Save**.
4. Pindah ke tab **Users** di halaman Authentication:
   - Klik tombol **Add user**.
   - Masukkan Email: `alfyarnaim@gmail.com`.
   - Masukkan Password: `kadabakarya`.
   - Klik **Add user**.
   *(Langkah ini mendaftarkan akun Super Admin langsung di Firebase Authentication)*.

---

### Langkah 2.3: Aktifkan Cloud Firestore Database
1. Pada menu navigasi sebelah kiri, klik **Build** > **Firestore Database**.
2. Klik tombol **Create database**.
3. **Database location**: Pilih **`asia-southeast2 (Jakarta)`** agar latensi akses dari Indonesia dan Kalimantan Selatan super cepat dan stabil.
4. **Security rules**: Pilih **Start in production mode** lalu klik **Next** dan **Enable**.

---

### Langkah 2.4: Terapkan Firestore Security Rules
Di root repository BAKARYA sudah tersedia file `firestore.rules`. Anda dapat menerapkannya dengan salah satu dari dua cara berikut:

#### Cara A: Langsung via Firebase Console (Paling Mudah)
1. Di Firebase Console, buka **Firestore Database** > klik tab **Rules**.
2. Hapus seluruh isi yang ada, lalu salin isi file [firestore.rules](file:///d:/AntiGravity/BAKARYA/firestore.rules):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function getUserData() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data; }
    function hasRole(roles) { return isSignedIn() && getUserData().accountStatus == 'active' && (getUserData().role in roles); }
    function isAdmin() { return hasRole(['admin', 'superAdmin']); }

    match /works/{workId} {
      allow read: if (resource.data.status == 'published' && resource.data.isDeleted == false) 
                  || isAdmin() 
                  || (isSignedIn() && resource.data.contributorId == request.auth.uid);
      allow create: if isSignedIn();
      allow update: if (isSignedIn() && resource.data.contributorId == request.auth.uid) || isAdmin();
      allow delete: if isAdmin();
    }

    match /users/{userId} {
      allow read: if true;
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if (isSignedIn() && request.auth.uid == userId) || isAdmin();
      allow delete: if hasRole(['superAdmin']);
    }

    match /subjects/{id} { allow read: if true; allow write: if isSignedIn(); }
    match /categories/{id} { allow read: if true; allow write: if isSignedIn(); }
    match /mediaTypes/{id} { allow read: if true; allow write: if isAdmin(); }
    match /moderationLogs/{id} { allow read, write: if isAdmin(); }
    match /analyticsDaily/{id} { allow read: if true; allow write: if true; }
  }
}
```
3. Klik tombol **Publish**.

#### Cara B: Menggunakan Firebase CLI (Terminal)
```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes
```

---

### Langkah 2.5: Aktifkan Firebase Storage (Untuk Foto Profil & Dokumen)
1. Pada menu navigasi sebelah kiri, klik **Build** > **Storage**.
2. Klik tombol **Get Started**.
3. Pilih lokasi: **`asia-southeast2 (Jakarta)`**.
4. Di tab **Rules**, pastikan aturan mengizinkan upload oleh pengguna terdaftar:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
5. Klik **Publish**.

---

### Langkah 2.6: Daftarkan Web App & Ambil Konfigurasi Firebase
1. Klik ikon **Project Settings** (ikon gerigi di samping *Project Overview* di pojok kiri atas).
2. Di tab **General**, scroll ke bawah ke bagian **Your apps**.
3. Klik ikon Web (`</>`).
4. Masukkan nama aplikasi: `BAKARYA Web`.
5. Klik **Register app**.
6. Anda akan melihat objek konfigurasi JavaScript seperti:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "bakarya-gugus2.firebaseapp.com",
  projectId: "bakarya-gugus2",
  storageBucket: "bakarya-gugus2.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

---

## 💻 3. Konfigurasi File Lingkungan `.env.local`

Buat file baru bernama `.env.local` di folder root proyek `BAKARYA` (sejajar dengan `package.json`). Isi dengan nilai yang Anda peroleh dari Langkah 2.6:

```env
VITE_FIREBASE_API_KEY="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
VITE_FIREBASE_AUTH_DOMAIN="bakarya-gugus2.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="bakarya-gugus2"
VITE_FIREBASE_STORAGE_BUCKET="bakarya-gugus2.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"
```

> **Catatan Keamanan**: File `.env.local` sudah masuk ke dalam `.gitignore` sehingga tidak akan bocor ke publik saat di-push ke GitHub.

---

## ⚡ 4. Inisialisasi Database Nyata (1-Click Seeding Tanpa Mock Data)

Setelah file `.env.local` dibuat dan server dijalankan (`npm run dev`):

1. Buka browser di `http://localhost:3000/`.
2. Klik tombol **"Masuk"** di navigasi kanan atas.
3. Masuk dengan:
   - Email: `alfyarnaim@gmail.com`
   - Password: `kadabakarya`
4. Di navigasi atas, klik tab **"🔒 Firebase"** (hanya muncul untuk Super Admin).
5. Pada panel **Inisialisasi Koleksi Firestore (Database Seeder)**, Anda memiliki dua pilihan:
   - **Tombol "Inisialisasi Bersih (Clean Slate)"**:
     - Menulis dokumen Super Admin `alfyarnaim@gmail.com` (Jabatan: Fasilitator Digitalisasi) ke koleksi `users`.
     - Menulis seluruh struktur taksonomi (`categories`, `subjects`, `mediaTypes`).
     - Membiarkan koleksi karya **kosong (0 karya)** sehingga siap menerima karya nyata asli dari guru tanpa ada mock data.
   - **Tombol "Inisialisasi Penuh (+ Karya Awal)"**:
     - Menulis Super Admin, taksonomi, dan menyertakan karya awal Gugus 2 HSU untuk demonstrasi.
6. Klik salah satu tombol tersebut. Dalam hitungan detik, Firestore Anda langsung aktif dan terhubung secara live!

---

## ☁️ 5. Deployment ke GitHub & Vercel

### Langkah 5.1: Push ke GitHub
Buka terminal dan jalankan:
```bash
git add .
git commit -m "feat: setup firebase dan konfigurasi superadmin alfyarnaim"
git push origin main
```

### Langkah 5.2: Deploy di Vercel
1. Buka [Vercel Dashboard](https://vercel.com/dashboard).
2. Klik **Add New** > **Project**.
3. Pilih repository GitHub `BAKARYA`.
4. Pada bagian **Environment Variables**, tambahkan seluruh variabel yang ada di `.env.local`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
5. Klik **Deploy**.
6. Portal BAKARYA siap diakses di seluruh dunia dengan domain Vercel gratis (atau custom domain dinas pendidikan)!
