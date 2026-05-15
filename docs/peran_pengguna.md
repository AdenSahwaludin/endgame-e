# Dokumentasi Peran dan Hak Akses Pengguna

Sistem Inventaris TK Teratai menggunakan mekanisme *Role-Based Access Control* (RBAC) untuk memastikan setiap pengguna memiliki akses yang sesuai dengan wewenang dan tanggung jawabnya. Berikut adalah pembagian peran pengguna dalam sistem:

## 1. Admin (Administrator)
Peran ini memiliki kontrol penuh atas seluruh fungsi sistem untuk pemeliharaan dan pengelolaan data tingkat lanjut.
*   **Manajemen Pengguna**: Membuat, mengubah, menonaktifkan akun pengguna, serta mengelola hak akses (*permissions*).
*   **Pemeliharaan Sistem**: Melakukan pencadangan (*backup*) dan pemulihan (*restore*) database secara berkala.
*   **Audit Trail**: Memantau seluruh riwayat aktivitas pengguna melalui menu Log Aktivitas untuk menjaga keamanan data.
*   **Konfigurasi Data Master**: Mengelola data referensi utama seperti kategori barang, data ruang, dan master barang.
*   **Validasi Akhir**: Memiliki otoritas untuk menyetujui atau menolak transaksi pengelolaan aset.

## 2. Petugas Inventaris
Peran operasional yang bertanggung jawab atas pengelolaan teknis barang dan pencatatan transaksi harian.
*   **Pencatatan Transaksi**: Menginput data pengadaan barang masuk dan transaksi barang keluar (peminjaman, penggunaan, mutasi).
*   **Manajemen Unit Aset**: Mengelola data unit barang individu, termasuk pemberian kode unik dan penentuan lokasi penyimpanan.
*   **Pelaporan Kondisi**: Melaporkan temuan barang rusak atau hilang ke dalam sistem untuk diproses lebih lanjut.
*   **Monitoring Stok**: Memantau ketersediaan stok barang dan status peminjaman aset secara real-time.
*   **Ekspor Data**: Menghasilkan dan mengekspor laporan inventaris bulanan dalam format yang diperlukan.

## 3. Kepala Sekolah
Peran manajerial yang berfokus pada pengawasan, persetujuan anggaran pengadaan, dan peninjauan laporan.
*   **Otorisasi Pengadaan**: Meninjau dan memberikan persetujuan (*approval*) terhadap transaksi pengadaan barang baru.
*   **Dashboard Statistik**: Memantau ringkasan data inventaris sekolah melalui grafik dan kartu informasi pada dashboard.
*   **Peninjauan Laporan**: Mengakses seluruh laporan inventaris, riwayat transaksi, dan laporan barang rusak sebagai dasar pengambilan keputusan.
*   **Pengawasan Aset**: Memastikan distribusi dan penggunaan aset sekolah berjalan sesuai dengan prosedur yang berlaku.
