# 🐉 Sistem Pakar Diagnosa Hama & Penyakit Buah Naga

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

Sistem pakar berbasis web untuk mendiagnosa hama dan penyakit pada tanaman buah naga menggunakan metode **Forward Chaining** dan **Certainty Factor (CF)**.

</div>

---

## 📋 Deskripsi

Sistem Pakar Buah Naga adalah aplikasi web yang membantu petani dan pengguna umum dalam mengidentifikasi hama dan penyakit yang menyerang tanaman buah naga. Sistem ini menggunakan dua metode utama:

- **Forward Chaining** — Penalaran maju dari gejala (fakta) menuju kesimpulan (hama/penyakit)
- **Certainty Factor (CF)** — Menghitung tingkat kepastian diagnosa berdasarkan keyakinan pakar

### Basis Pengetahuan

| Kategori | Jumlah | Keterangan |
|----------|--------|------------|
| Hama | 7 | H01 - H07 |
| Penyakit | 6 | P01 - P06 |
| Gejala | 77 | G00 - G76 |
| Rules | 13 | Forward Chaining |

## 🛠️ Teknologi

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| [React](https://react.dev/) | 19 | Framework UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.8 | Type-safe JavaScript |
| [Vite](https://vite.dev/) | 7 | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com/) | 3 | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com/) | - | Komponen UI premium |
| [Supabase](https://supabase.com/) | - | Backend & Database (PostgreSQL) |
| [React Router](https://reactrouter.com/) | 7 | Routing & navigasi |

## 📁 Struktur Folder

```
src/
├── components/          # Komponen reusable
│   ├── auth/            # LoginForm, RegisterForm
│   ├── layout/          # Layout, Navbar
│   └── ui/              # shadcn/ui components
├── data/                # Data statis (fallback)
│   ├── penyakit.ts      # 7 Hama + 6 Penyakit
│   ├── gejala.ts        # 77 Gejala dengan CF Pakar
│   ├── rules.ts         # 13 Rules Forward Chaining
│   └── pohonKeputusan.ts# Pohon keputusan
├── hooks/               # Custom React hooks
│   └── useAuth.ts       # Autentikasi via Supabase
├── lib/                 # Library config
│   └── supabase.ts      # Supabase client
├── pages/               # Halaman aplikasi
│   ├── admin/           # AdminDashboard, KelolaPenyakit, dll
│   ├── user/            # UserDashboard, Diagnosa, Riwayat, Profil
│   └── LandingPage.tsx  # Halaman utama
├── services/            # Service layer
│   └── supabaseService.ts # CRUD operations ke Supabase
├── types/               # TypeScript interfaces
│   └── index.ts
└── utils/               # Utilitas
    └── cfAlgorithm.ts   # Algoritma CF
```

## 🚀 Cara Menjalankan

### Prasyarat
- [Node.js](https://nodejs.org/) v20.19+ atau v22.12+
- [npm](https://www.npmjs.com/) atau package manager lainnya
- Akun [Supabase](https://supabase.com/) (gratis)

### 1. Clone Repository

```bash
git clone https://github.com/Rils24/Sistem-Pakar-Buah-Naga.git
cd Sistem-Pakar-Buah-Naga
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [Supabase Dashboard](https://supabase.com/dashboard)
2. Buka **SQL Editor** dan jalankan file berikut secara berurutan:
   - `supabase_schema.sql` — Membuat tabel dan kebijakan keamanan
   - `supabase_seed.sql` — Mengisi data awal (gejala, penyakit, rules, admin)

### 4. Konfigurasi Environment

Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

> Dapatkan URL dan Anon Key dari: Supabase Dashboard → Settings → API

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser.

### 6. Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sistempakar.com | admin123 |
| User | *(Daftar akun baru)* | *(min. 6 karakter)* |

## 🔬 Metode Sistem Pakar

### Forward Chaining

Penalaran maju yang dimulai dari **fakta** (gejala yang diamati) menuju **kesimpulan** (identifikasi hama/penyakit).

```
IF Gejala_A AND Gejala_B AND Gejala_C
THEN Penyakit_X
```

### Certainty Factor (CF)

Menghitung tingkat kepastian diagnosa berdasarkan dua komponen:

| Komponen | Nilai | Keterangan |
|----------|-------|------------|
| CF User | 1 (Ya) / 0 (Tidak) | Jawaban user terhadap gejala |
| CF Pakar | 0.1 - 1.0 | Kepastian pakar per gejala |

**Rumus:**

```
CF(H,E) = CF(User) × CF(Pakar)

CF(Kombinasi) = CF_lama + CF_baru × (1 - CF_lama)
```

**Interpretasi Hasil:**

| Nilai CF | Interpretasi |
|----------|-------------|
| ≥ 0.9 | Sangat Yakin |
| ≥ 0.7 | Yakin |
| ≥ 0.5 | Cukup Yakin |
| ≥ 0.3 | Sedikit Yakin |
| < 0.3 | Tidak Yakin |

## 📊 Fitur Aplikasi

### 👤 User
- ✅ Diagnosa hama & penyakit (Ya/Tidak)
- ✅ Riwayat diagnosa tersimpan di database
- ✅ Detail perhitungan CF per langkah
- ✅ Solusi penanganan
- ✅ Manajemen profil

### 🛡️ Admin
- ✅ Dashboard statistik
- ✅ CRUD Penyakit/Hama
- ✅ CRUD Gejala (dengan CF Pakar)
- ✅ CRUD Rules Forward Chaining
- ✅ Manajemen Users

## 📄 Lisensi

Proyek ini dibuat untuk keperluan **Skripsi** di bidang Sistem Informasi.

---

<div align="center">

Dibuat dengan ❤️ menggunakan React + Supabase

</div>
