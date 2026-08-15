# Database - Sistem Pakar Buah Naga

Semua file SQL untuk setup database Supabase.

## Urutan Eksekusi

Jalankan di **Supabase SQL Editor** sesuai urutan berikut:

### 1. Schema (Struktur Tabel)
```
database/schema.sql
```
Membuat semua tabel: `penyakit`, `gejala`, `rules`, `users`, `hasil_diagnosa`, `pohon_keputusan`, beserta RLS policies.

### 2. Migrations (Perubahan Schema)
```
database/migrations/001_add_image_urls_penyakit.sql
```
Menambahkan kolom `image_urls TEXT[]` ke tabel `penyakit`.

### 3. Seeds (Data Awal)
```
database/seeds/001_seed_data.sql          -- Data penyakit, gejala, rules, user admin
database/seeds/002_seed_pohon_keputusan.sql  -- Data pohon keputusan (96 nodes)
```

## Struktur Folder

```
database/
├── README.md                              # File ini
├── schema.sql                             # DDL + RLS policies
├── migrations/
│   └── 001_add_image_urls_penyakit.sql    # ALTER TABLE migration
└── seeds/
    ├── 001_seed_data.sql                  # INSERT data awal
    └── 002_seed_pohon_keputusan.sql       # INSERT pohon keputusan
```
