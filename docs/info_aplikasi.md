# Informasi Sistem Inventaris TK & Day Care (Endgame-E)

Dokumen ini merupakan panduan komprehensif tentang arsitektur, alur kerja, struktur database, dan konvensi kode untuk aplikasi inventaris TK dan Day Care. Dokumen ini ditujukan sebagai referensi bagi developer dan AI yang akan melanjutkan atau mengelola proyek ini.

## 1. Ikhtisar Aplikasi

*   **Nama Proyek:** Endgame-E (Sistem Inventaris)
*   **Domain:** Pendidikan (Taman Kanak-Kanak & Day Care)
*   **Tech Stack:**
    *   **Frontend:** Vue 3, Nuxt 3/4, Nuxt UI (Tailwind CSS)
    *   **Backend:** Nitro (Nuxt API Routes)
    *   **Database:** MySQL
    *   **ORM:** Prisma
    *   **Authentication:** `nuxt-auth-utils` (Session/Cookie based) dengan hashing `bcryptjs`.
*   **Konvensi Penulisan:** Bahasa utama untuk UI, model database, dan variabel mayoritas menggunakan Bahasa Indonesia, sedangkan sintaksis, metode bawaan, dan komentar teknis bisa bercampur dengan Bahasa Inggris.

---

## 2. Struktur Database (Prisma Schema)

Database menggunakan paradigma relasional dengan entitas utama sebagai berikut:

### Master Data (Referensi Utama)
1.  **`Kategori`**: Mengelompokkan barang (cth: APE Dalam, Meubelair, Elektronik). Primary key: `kodeKategori`.
2.  **`Ruang`**: Daftar ruangan di fasilitas (cth: Ruang Belajar TK A, Gudang). Primary key: `id`.
3.  **`MasterBarang`**: Katalog jenis barang. Menyimpan spesifikasi umum seperti `namaBarang`, `merk`, `hargaSatuan`, `satuan`. Primary key: `kodeMaster`. Terdapat relasi ke `Kategori`.

### Data Operasional (Tracking)
4.  **`UnitBarang`**: Item fisik aktual. Setiap barang fisik memiliki satu *record* di sini.
    *   Primary key: `kodeUnit` (Format biasanya gabungan kode master dan nomor urut).
    *   Properti penting: `status` (baik, dipinjam, rusak, dihapus), `isActive` (boolean), dan referensi `ruangId` (lokasi fisik saat ini).
5.  **`BarangRusak`**: Catatan pelaporan ketika sebuah `UnitBarang` mengalami kerusakan.
6.  **`MutasiLokasi`**: Log riwayat perpindahan `UnitBarang` dari satu `Ruang` ke `Ruang` lainnya.
7.  **`LogAktivitas`**: Log audit/sistem yang mencatat aksi (create, update, delete, approve) yang dilakukan oleh *user* beserta IP dan *user-agent*.

### Transaksi & Workflow
8.  **`TransaksiBarang` (Pengadaan Barang)**: Digunakan untuk mencatat pengadaan barang baru.
    *   Alur: Petugas membuat -> Status `pending` -> Kepala Sekolah `approve` -> Sistem otomatis men-generate data `UnitBarang` sebanyak `totalPesanan` dan menempatkannya ke `ruangTujuan`.
9.  **`TransaksiKeluar` (Pengelolaan Aset)**: Digunakan untuk mencatat distribusi atau sirkulasi barang.
    *   **Tipe**: `pemindahan`, `peminjaman`, `penggunaan`, `penghapusan`.
    *   Alur: Tergantung tipe. Membutuhkan `approval` dari Admin/Kepala Sekolah. Jika tipe `peminjaman`, status `UnitBarang` akan berubah menjadi `dipinjam`. Terdapat fitur "Kembalikan" untuk mengubah status unit kembali menjadi `baik`.

### Keamanan
10. **`User`**, **`Role`**, **`Permission`**, **`RolePermission`**: Tabel untuk Sistem *Role-Based Access Control* (RBAC).

---

## 3. Sistem Hak Akses (RBAC)

Aplikasi ini menggunakan RBAC granular, bukan sekadar hardcode "Admin" atau "User".

*   **Roles yang tersedia:**
    1.  `Admin`: Memiliki semua *permission* secara absolut (Superadmin).
    2.  `Kepala Sekolah`: Memiliki akses *view* untuk semua tabel, akses *approve* untuk menyetujui transaksi masuk/keluar, dan melihat laporan.
    3.  `Petugas Inventaris`: Pelaksana harian. Memiliki hak *create*, *edit*, dan *view* untuk menambah barang, melakukan transaksi, dan pelaporan, namun tidak bisa melakukan *approve*.
*   **Penerapan di Backend:**
    API routes dilindungi menggunakan fungsi utilitas `requirePermission(event, 'nama_permission')`.
*   **Penerapan di Frontend:**
    Tombol aksi disembunyikan menggunakan composable `usePermission()`, contoh: `v-if="hasPermission('create_unit_barangs')"`.

---

## 4. Alur Kerja & Siklus Hidup Barang

1.  **Inisialisasi Master:**
    Admin/Petugas memasukkan daftar `Kategori` dan `Ruang`.
    Kemudian memasukkan `MasterBarang` (Katalog dasar).
    Stok fisik tidak ditambahkan secara manual ke tabel `UnitBarang` oleh petugas. Petugas harus membuat `Pengadaan Barang`.
    Setelah Transaksi disetujui (`approve`) oleh Kepala Sekolah/Admin, sistem (*backend*) akan melakukan perulangan (*looping*) sebanyak jumlah barang yang dipesan dan **membuatkan kode unit secara otomatis** di tabel `UnitBarang`.
3.  **Sirkulasi & Distribusi:**
    Ketika barang dipinjamkan atau digunakan untuk event tertentu, petugas membuat `Pengelolaan Aset`. Transaksi ini juga butuh `approve`.
4.  **Mutasi Lokasi:**
    Pindah ruangan dicatat menggunakan `MutasiLokasi`, dan secara otomatis memperbarui `ruangId` pada tabel `UnitBarang`.
5.  **Barang Rusak & Dihapus:**
    Jika rusak, petugas melaporkan ke form `Barang Rusak`, status `UnitBarang` menjadi "rusak". Barang yang sudah tidak layak pakai dapat diproses melalui `Pengelolaan Aset` dengan tipe `penghapusan` (status unit menjadi "dihapus").

---

## 5. UI/UX dan Konvensi Frontend

*   **Komponen Tabel Kustom (`AppTable.vue`):**
    Aplikasi menggunakan wrapper kustom untuk `UTable` (Nuxt UI) agar mendukung sorting kolom secara dinamis dan tipe data yang *strict* (*Vue 3 Generic*).
*   **Sistem Konfirmasi (`AppConfirm.vue` & `useConfirm.ts`):**
    Fungsi bawaan browser seperti `confirm()` dan `prompt()` diharamkan demi UX yang lebih baik. Kami menggunakan modal kustom yang dapat dipanggil secara global via composable `const { confirm } = useConfirm()`. Modal ini bisa bertindak sebagai validasi (Ya/Tidak) maupun form input singkat (Prompt).
*   **Animasi Tombol (Jelly UI):**
    Tombol-tombol aksi utama ditata menggunakan kelas CSS kustom:
    *   `.btn-jelly`: Memberikan efek *bounce* atau menekan cairan (*fluid*) saat di-klik.
    *   `.btn-soft`: Varian tombol tanpa background padat (mirip *ghost button*) yang menjadi tebal saat di-hover.
    Warna tombol bahaya wajib menggunakan *color* `error` (bukan `red`), sedangkan warna berhasil menggunakan `success`.

---

## 6. Backend & Konvensi API

*   **Lokasi:** Folder `server/api/...`
*   **Utilitas Prisma (`server/utils/prisma.ts`):**
    Client prisma (`prisma`) diekspor dari sini sebagai Singleton untuk mencegah kelebihan koneksi selama *hot reload* di mode *development*.
*   **Fungsi Sorting Kustom (`buildOrderBy`):**
    Terletak di `server/utils/prisma.ts`. Fungsi ini mengubah struktur string pemilahan seperti `masterBarang.namaBarang` menjadi object bersarang Prisma `{ masterBarang: { namaBarang: 'asc' } }`. API tidak boleh mendefinisikan ini secara lokal, melainkan mengandalkan *auto-import* dari utility.
*   **Server-Side Processing:**
    Pencarian (Search), Pemilahan (Sorting), dan Paginasi diproses **di sisi server** menggunakan *query parameters*. Frontend hanya menerima array sebanyak `limit` (biasanya 20).

---

## 7. Modul Laporan (Reporting)

Modul ini menyediakan ringkasan data inventaris dan keuangan untuk kebutuhan audit dan pengambilan keputusan.

### Laporan Stok Fisik (Akses: Admin & PI)
Difokuskan pada manajemen aset operasional, terbagi menjadi tiga sub-tipe:
1.  **Inventaris Barang (Unit):** Status terkini item fisik (Baik, Rusak, Dipinjam).
2.  **Pengelolaan Aset:** Riwayat sirkulasi barang (Peminjaman, Penggunaan, Hibah).
3.  **Barang Rusak:** Rekapitulasi laporan kerusakan beserta estimasi kerugian (khusus Admin/KS).

### Laporan Keuangan (Akses: Admin & Kepala Sekolah)
Difokuskan pada valuasi aset dan realisasi pengeluaran sekolah.
*   Hanya menampilkan data pengadaan barang (`TransaksiBarang`) yang berstatus **Approved**.
*   **Kalkulasi:** Menghitung total pengeluaran dengan mengalikan `totalPesanan` dengan `hargaSatuan` dari relasi Master Barang.
*   **Summary Badge:** Menampilkan *Grand Total* keseluruhan (semua halaman) dan total per halaman secara *real-time*.

### Fitur Ekspor Data
Modul ini mendukung ekspor data dalam dua format utama:
*   **PDF:** Menggunakan library `jspdf` dan `jspdf-autotable`. Didesain dengan tampilan tabel grid profesional untuk laporan resmi.
*   **CSV:** Menggunakan library `papaparse`. Diformat khusus untuk kebutuhan integrasi dengan alat pengolah data besar (*Big Data*) seperti **RapidMiner** atau **AI Studio**.
*   **Mekanisme:** Proses ekspor mengirimkan query parameter `export=true` ke API untuk melewati batas paginasi (*bypass limit*), sehingga seluruh data hasil filter terunduh sekaligus.

### Konvensi Frontend Laporan
*   **Tab Dinamis:** Tab *default* disesuaikan dengan role. Kepala Sekolah otomatis diarahkan ke tab Keuangan, sementara role lain ke tab Stok.
*   **SSR Stability:** Menggunakan `useFetch` dengan reactive `query` (computed) dan `key` yang unik untuk memastikan data tetap muncul saat halaman di-*refresh* (menghindari isu *hydration mismatch* pada session server-ke-server).

---

## 8. Folder Structure Penting

*   `app/pages/`: File Vue *file-based routing*. Masing-masing folder mewakili entitas (cth: `ruang/index.vue`).
*   `app/components/`: Komponen *reusable* (AppTable, AppConfirm).
*   `app/composables/`: Fungsi pembantu global (useConfirm, usePermission).
*   `app/assets/css/main.css`: Konvensi styling kustom (Jelly animation).
*   `server/api/`: Endpoint REST API. File dipecah berdasarkan method HTTP (cth: `index.get.ts`, `[id].put.ts`).
*   `server/utils/`: Utilitas untuk database dan validasi (Permissions list, Prisma client).
*   `prisma/seed.ts`: Script generator data dummy & inisialisasi awal.

## 9. Panduan Untuk AI Berikutnya
Jika Anda diminta untuk memodifikasi atau menambah fitur, **HARAP PATUHI ATURAN BERIKUT**:
1. Selalu pertahankan *server-side pagination* menggunakan `useFetch` dan jangan meload semua data ke client.
2. Saat membuat interaksi pengguna yang berbahaya (Hapus, Tolak), selalu gunakan `useConfirm()`, jangan gunakan `alert()` atau `window.confirm()`.
3. Jaga struktur CSS. Tombol-tombol di dalam tabel atau aksi *inline* lebih diutamakan memakai kelas `btn-jelly btn-soft`.
4. Jika menemui error "unknown" pada `row.original` di dalam tag slot `<template #namakolom-cell="{ row }">`, ingatlah untuk menambahkan interface `Response` sebagai argumen *generic* ke pemanggilan `useFetch` di halaman tersebut.k
5. Saat membuat endpoint `.get.ts`, selalu verifikasi *Role & Permission* dan dukung sorting terpusat menggunakan `buildOrderBy`.