# 📊 Rencana Implementasi: Section Grafik & Visualisasi Data
**Proyek:** Endgame-E — Sistem Inventaris TK & Day Care  
**Library:** Chart.js (via CDN atau npm `chart.js`)  
**Halaman target:** `app/pages/laporan/index.vue` (tab baru atau section di bawah tab yang sudah ada)

---

## 1. Gambaran Umum

Section grafik ini akan ditambahkan sebagai **tab keempat** bernama **"Visualisasi"** di halaman laporan, sejajar dengan tab Stok, Aset, dan Keuangan yang sudah ada. Tab ini dapat diakses oleh semua role (Admin, Kepala Sekolah, Petugas Inventaris), namun beberapa grafik finansial hanya terlihat oleh Admin & Kepala Sekolah.

```
[Stok Fisik] [Pengelolaan Aset] [Keuangan] [📊 Visualisasi]  ← tab baru
```

---

## 2. Daftar Grafik & Sumber Data

### 🟢 GRUP A — Kondisi & Status Inventaris
> Sumber data: Tabel `UnitBarang`  
> Akses: Semua role

---

#### A1. Komposisi Status Barang (Donut Chart)
- **Tipe:** `doughnut`
- **Deskripsi:** Proporsi unit berdasarkan status (`baik`, `dipinjam`, `rusak`, `dihapus`).
- **Label:** Baik / Dipinjam / Rusak / Dihapus
- **Warna:** `success` / `warning` / `error` / `neutral`
- **Endpoint API baru:** `GET /api/laporan/grafik/status-barang`
- **Query Prisma:**
```ts
prisma.unitBarang.groupBy({
  by: ['status'],
  _count: { status: true },
  where: { isActive: true }
})
```

---

#### A2. Jumlah Barang per Kategori (Bar Chart Horizontal)
- **Tipe:** `bar` (horizontal, `indexAxis: 'y'`)
- **Deskripsi:** Berapa unit fisik yang dimiliki di setiap kategori (APE Dalam, Meubelair, Elektronik, dll).
- **Endpoint API baru:** `GET /api/laporan/grafik/barang-per-kategori`
- **Query Prisma:**
```ts
prisma.unitBarang.groupBy({
  by: ['masterBarang.kategori.namaKategori'],
  _count: true,
  where: { isActive: true }
})
// atau join melalui MasterBarang -> Kategori
```

---

#### A3. Distribusi Barang per Ruangan (Bar Chart)
- **Tipe:** `bar`
- **Deskripsi:** Berapa unit barang yang berada di setiap ruangan saat ini.
- **Endpoint API baru:** `GET /api/laporan/grafik/barang-per-ruang`
- **Query Prisma:**
```ts
prisma.unitBarang.groupBy({
  by: ['ruangId'],
  _count: true,
  where: { isActive: true, status: { not: 'dihapus' } },
  include: { ruang: { select: { namaRuang: true } } }
})
```

---

#### A4. Tingkat Kerusakan per Kategori (Stacked Bar)
- **Tipe:** `bar` (stacked)
- **Deskripsi:** Untuk setiap kategori, berapa unit yang `baik` vs `rusak`. Berguna untuk melihat kategori mana yang paling sering rusak.
- **Endpoint API baru:** `GET /api/laporan/grafik/kerusakan-per-kategori`

---

### 🔵 GRUP B — Tren Waktu & Aktivitas
> Sumber data: `TransaksiBarang`, `BarangRusak`, `MutasiLokasi`  
> Akses: Semua role

---

#### B1. Tren Pengadaan Barang per Bulan (Line Chart)
- **Tipe:** `line`
- **Deskripsi:** Berapa unit barang baru yang diadakan setiap bulan dalam 12 bulan terakhir. Menunjukkan pola belanja sekolah.
- **Endpoint API baru:** `GET /api/laporan/grafik/tren-pengadaan?tahun=2025`
- **Query Prisma:**
```ts
prisma.transaksiBarang.groupBy({
  by: ['createdAt'],  // di-group per bulan di query/aggregasi
  _sum: { totalPesanan: true },
  where: { status: 'approved' }
})
```

---

#### B2. Tren Laporan Kerusakan per Bulan (Line Chart)
- **Tipe:** `line`
- **Deskripsi:** Berapa laporan kerusakan masuk setiap bulan. Tren naik bisa jadi sinyal barang perlu maintenance rutin.
- **Endpoint API baru:** `GET /api/laporan/grafik/tren-kerusakan?tahun=2025`
- **Query Prisma:**
```ts
prisma.barangRusak.groupBy({
  by: ['createdAt'],
  _count: true
})
```

---

#### B3. Aktivitas Mutasi Lokasi per Bulan (Bar Chart)
- **Tipe:** `bar`
- **Deskripsi:** Seberapa sering barang dipindahkan antar ruangan setiap bulan. Aktivitas tinggi bisa jadi indikator event atau reorganisasi.
- **Endpoint API baru:** `GET /api/laporan/grafik/tren-mutasi?tahun=2025`

---

### 🟡 GRUP C — Analisis Transaksi Keluar
> Sumber data: `TransaksiKeluar`  
> Akses: Semua role

---

#### C1. Komposisi Tipe Pengelolaan Aset (Pie Chart)
- **Tipe:** `pie`
- **Deskripsi:** Proporsi tipe transaksi keluar: `pemindahan`, `peminjaman`, `penggunaan`, `penghapusan`. Memberikan gambaran bagaimana barang dikelola.
- **Endpoint API baru:** `GET /api/laporan/grafik/tipe-transaksi-keluar`
- **Query Prisma:**
```ts
prisma.transaksiKeluar.groupBy({
  by: ['tipe'],
  _count: true,
  where: { status: 'approved' }
})
```

---

#### C2. Status Peminjaman Aktif vs Selesai (Doughnut Chart)
- **Tipe:** `doughnut`
- **Deskripsi:** Dari semua transaksi peminjaman, berapa yang masih aktif (belum dikembalikan) vs sudah dikembalikan.
- **Endpoint API baru:** `GET /api/laporan/grafik/status-peminjaman`

---

### 🔴 GRUP D — Analisis Keuangan
> Sumber data: `TransaksiBarang` (status approved) + `MasterBarang.hargaSatuan`  
> Akses: **Admin & Kepala Sekolah saja** (gunakan `requirePermission`)

---

#### D1. Pengeluaran Pengadaan per Bulan (Bar Chart)
- **Tipe:** `bar`
- **Deskripsi:** Total nilai rupiah pengadaan barang yang disetujui setiap bulan dalam setahun.
- **Formula:** `totalPesanan × hargaSatuan`
- **Endpoint API baru:** `GET /api/laporan/grafik/pengeluaran-bulanan?tahun=2025`

---

#### D2. Distribusi Pengeluaran per Kategori (Doughnut Chart)
- **Tipe:** `doughnut`
- **Deskripsi:** Berapa persen anggaran habis untuk setiap kategori barang (APE, Meubelair, ATK, dll). Membantu perencanaan anggaran.
- **Endpoint API baru:** `GET /api/laporan/grafik/pengeluaran-per-kategori`

---

#### D3. Top 10 Barang Termahal (Bar Chart Horizontal)
- **Tipe:** `bar` (horizontal)
- **Deskripsi:** 10 jenis barang dengan total nilai pengadaan tertinggi.
- **Endpoint API baru:** `GET /api/laporan/grafik/top-barang-nilai`

---

## 3. Struktur File yang Perlu Dibuat/Dimodifikasi

```
app/
└── pages/
    └── laporan/
        └── index.vue                        ← MODIFIKASI: tambah tab Visualisasi
        
app/
└── components/
    └── laporan/
        └── GrafikStatusBarang.vue            ← A1
        └── GrafikBarangPerKategori.vue       ← A2
        └── GrafikBarangPerRuang.vue          ← A3
        └── GrafikKerusakanPerKategori.vue    ← A4
        └── GrafikTrenPengadaan.vue           ← B1
        └── GrafikTrenKerusakan.vue           ← B2
        └── GrafikTrenMutasi.vue              ← B3
        └── GrafikTipeTransaksiKeluar.vue     ← C1
        └── GrafikStatusPeminjaman.vue        ← C2
        └── GrafikPengeluaranBulanan.vue      ← D1
        └── GrafikPengeluaranPerKategori.vue  ← D2
        └── GrafikTopBarangNilai.vue          ← D3

server/
└── api/
    └── laporan/
        └── grafik/
            └── status-barang.get.ts
            └── barang-per-kategori.get.ts
            └── barang-per-ruang.get.ts
            └── kerusakan-per-kategori.get.ts
            └── tren-pengadaan.get.ts
            └── tren-kerusakan.get.ts
            └── tren-mutasi.get.ts
            └── tipe-transaksi-keluar.get.ts
            └── status-peminjaman.get.ts
            └── pengeluaran-bulanan.get.ts       ← restricted: KS & Admin
            └── pengeluaran-per-kategori.get.ts  ← restricted: KS & Admin
            └── top-barang-nilai.get.ts          ← restricted: KS & Admin
```

---

## 4. Layout Halaman Visualisasi

Halaman dibagi menjadi beberapa sub-section menggunakan heading dan grid:

```
┌─────────────────────────────────────────────────────────┐
│  Filter: [Tahun ▼]  [Kategori ▼]  [Ruang ▼]             │
├─────────────────────────────────────────────────────────┤
│  📦 KONDISI INVENTARIS                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  A1 Donut    │  │  A2 Bar-H    │  │  A3 Bar      │  │
│  │  Status      │  │  Per Kat.    │  │  Per Ruang   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  A4 Stacked Bar — Kerusakan per Kategori         │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  📅 TREN WAKTU                                          │
│  ┌─────────────────────────┐  ┌──────────────────────┐  │
│  │  B1 Line — Tren Pengad. │  │  B2 Line — Kerusakan │  │
│  └─────────────────────────┘  └──────────────────────┘  │
│  ┌─────────────────────────────────────────────────┐    │
│  │  B3 Bar — Tren Mutasi Lokasi                    │    │
│  └─────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│  🔄 TRANSAKSI KELUAR                                    │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │  C1 Pie — Tipe       │  │  C2 Donut — Peminjaman   │ │
│  └──────────────────────┘  └──────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  💰 KEUANGAN  [hanya Admin & Kepala Sekolah]            │
│  ┌─────────────────────────────────────────────────┐    │
│  │  D1 Bar — Pengeluaran Bulanan                   │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │  D2 Donut — Per Kat. │  │  D3 Bar-H — Top 10       │ │
│  └──────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Instalasi & Setup Chart.js

```bash
npm install chart.js vue-chartjs
```

Buat composable pembantu di `app/composables/useChartColors.ts` untuk palet warna konsisten yang mengikuti design system Nuxt UI (memanfaatkan CSS variable `--color-primary`, `--color-success`, `--color-error`, `--color-warning`).

Contoh palet default:
```ts
export const chartColors = {
  baik:      'rgba(34, 197, 94, 0.8)',   // success (green)
  dipinjam:  'rgba(234, 179, 8, 0.8)',   // warning (yellow)
  rusak:     'rgba(239, 68, 68, 0.8)',   // error (red)
  dihapus:   'rgba(156, 163, 175, 0.8)', // neutral (gray)
}
```

---

## 6. Contoh Template Komponen Grafik

```vue
<!-- app/components/laporan/GrafikStatusBarang.vue -->
<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend)

const { data, pending } = await useFetch('/api/laporan/grafik/status-barang')

const chartData = computed(() => ({
  labels: data.value?.map(d => d.status) ?? [],
  datasets: [{
    data: data.value?.map(d => d._count) ?? [],
    backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#9ca3af']
  }]
}))
</script>

<template>
  <div class="card p-4">
    <h3 class="font-semibold mb-4">Komposisi Status Barang</h3>
    <USkeleton v-if="pending" class="h-64" />
    <Doughnut v-else :data="chartData" />
  </div>
</template>
```

---

## 7. Contoh Template Endpoint API

```ts
// server/api/laporan/grafik/status-barang.get.ts
import { requirePermission } from '~/server/utils/permissions'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'view_unit_barangs')

  const result = await prisma.unitBarang.groupBy({
    by: ['status'],
    _count: { status: true },
    where: { isActive: true }
  })

  return result.map(r => ({
    status: r.status,
    _count: r._count.status
  }))
})
```

---

## 8. Prioritas Implementasi

| Prioritas | Grafik | Alasan |
|-----------|--------|--------|
| 🔴 High | A1 Status Barang | Informasi paling krusial & sering ditanyakan |
| 🔴 High | A2 Per Kategori | Gambaran komposisi inventaris |
| 🔴 High | D1 Pengeluaran Bulanan | Kebutuhan laporan keuangan |
| 🟡 Medium | B1 Tren Pengadaan | Analisis pola belanja |
| 🟡 Medium | C1 Tipe Transaksi | Monitoring sirkulasi |
| 🟡 Medium | A3 Per Ruangan | Manajemen ruang |
| 🟢 Low | B2 Tren Kerusakan | Nice to have |
| 🟢 Low | B3 Tren Mutasi | Nice to have |
| 🟢 Low | A4 Kerusakan per Kat | Nice to have |
| 🟢 Low | C2 Status Peminjaman | Nice to have |
| 🟢 Low | D2 Pengeluaran per Kat | Nice to have |
| 🟢 Low | D3 Top 10 Barang | Nice to have |

---

## 9. Catatan Penting & Konvensi

1. **SSR Safety:** Gunakan `useFetch` dengan `key` unik per grafik untuk mencegah hydration mismatch. Contoh: `key: 'grafik-status-barang'`.
2. **Permission Guard:** Section keuangan (Grup D) wajib dibungkus `v-if="hasPermission('view_laporan_keuangan')"` di frontend dan `requirePermission` di API.
3. **Loading State:** Gunakan `USkeleton` dengan `class="h-64"` saat `pending === true` sebelum chart dirender.
4. **Filter Tahun:** Tambahkan filter `tahun` (default: tahun berjalan) yang di-pass sebagai query parameter ke semua endpoint Grup B dan D.
5. **Responsif:** Setiap kartu grafik menggunakan grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` agar tampil baik di mobile maupun desktop.
6. **Tidak Ada `window.confirm()`:** Jika ada aksi dari grafik (misalnya klik bar untuk drill-down), tetap gunakan `useConfirm()`.
7. **Export:** Untuk saat ini, grafik tidak perlu di-export ke PDF. Bisa ditambahkan di iterasi berikutnya menggunakan `chart.toBase64Image()` dan `jspdf`.