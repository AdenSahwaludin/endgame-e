# Dokumentasi Implementasi Kode Sistem Inventaris

## 5.1 Implementasi Kode
### 5.1.2 Implementasi Sistem
Sistem dikembangkan dengan logika pemrograman yang fokus pada integritas data dan keamanan akses menggunakan Nuxt 3 dan Prisma ORM.

**a. Manajemen Aset**
Logika pencarian dan filter data aset dilakukan pada sisi server untuk memastikan performa yang efisien dengan relasi data yang kompleks.
```typescript
const data = await prisma.unitBarang.findMany({
  where: { 
    status: statusFilter || undefined,
    masterBarang: { namaBarang: { contains: search } }
  },
  include: { masterBarang: true, ruang: true }
});
```

**b. Pengelolaan Transaksi**
Logika transaksi menggunakan *Database Transaction* untuk memastikan perubahan status aset dan pencatatan riwayat terjadi secara atomik (keduanya berhasil atau tidak sama sekali).
```typescript
await prisma.$transaction([
  prisma.transaksiKeluar.update({ where: { id }, data: { approvalStatus: 'approved' } }),
  prisma.unitBarang.update({ where: { kodeUnit }, data: { status: 'dipinjam' } })
]);
```

**c. Riwayat Aktivitas**
Sistem mengimplementasikan logika *Logging* otomatis yang menangkap setiap perubahan data penting untuk kebutuhan audit jejak digital.
```typescript
const saveLog = async (userId, aksi, tabel, detail) => {
  await prisma.logAktivitas.create({
    data: { userId, jenisAktivitas: aksi, namaTabel: tabel, deskripsi: detail }
  });
};
```

**d. Dashboard Statistik**
Logika agregasi data digunakan untuk menghitung total aset dan status transaksi secara real-time dari berbagai tabel.
```typescript
const stats = await prisma.unitBarang.groupBy({
  by: ['status'],
  _count: { _all: true }
});
```

**e. Manajemen Pengguna**
Implementasi logika *Role-Based Access Control* (RBAC) dilakukan melalui middleware untuk memvalidasi hak akses setiap pengguna sebelum mengeksekusi aksi.
```typescript
const hasAccess = (permission) => {
  return user.role.permissions.some(p => p.name === permission);
};
```

**f. Pemeliharaan Sistem**
Logika *Backup & Restore* menangani pembersihan data lama dan sinkronisasi data baru dalam satu rangkaian transaksi yang aman.
```typescript
await prisma.$transaction([
  prisma.unitBarang.deleteMany(),
  prisma.unitBarang.createMany({ data: backupData })
]);
```

## 5.2 Pembahasan Basis Data
### 5.2.1 Implementasi DML (Prisma Client)
Berikut adalah implementasi logika manipulasi data menggunakan Prisma Client yang mencakup operasi dasar penambahan, pengambilan, pembaruan, dan penghapusan data pada sistem secara lebih mendalam.

**5.2.1.1 Create Data Barang**
Operasi ini digunakan untuk menambah record baru ke dalam tabel master barang menggunakan fungsi `create` Prisma. Data harus sesuai skema, mencakup kode unik, nama, dan relasi kategori guna menjaga integritas data dalam sistem inventaris sekolah secara menyeluruh bagi semua pengguna.
```typescript
await prisma.masterBarang.create({
  data: {
    kodeMaster: 'BRG-001',
    namaBarang: 'Laptop ASUS VivoBook',
    kategori: { connect: { kodeKategori: 'K-001' } },
    satuan: 'unit',
    merk: 'ASUS',
    hargaSatuan: 7500000,
    reorderPoint: 2,
    deskripsi: 'Laptop inventaris untuk guru TK Teratai',
    createdBy: 1
  }
});
```

**5.2.1.2 Read Data Barang**
Fungsi `findMany` digunakan untuk mengambil seluruh data master barang secara efisien. Dengan fitur `include`, sistem otomatis melakukan join ke tabel kategori sehingga informasi detail barang beserta nama kategorinya dapat ditampilkan langsung dalam satu permintaan query database yang sangat cepat dan akurat.
```typescript
const barangList = await prisma.masterBarang.findMany({
  where: {
    deletedAt: null,
    OR: [
      { namaBarang: { contains: search } },
      { kodeMaster: { contains: search } }
    ]
  },
  include: {
    kategori: true,
    unitBarang: {
      where: { status: 'baik' },
      include: { ruang: true }
    }
  },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit
});
```

**5.2.1.3 Update Data Barang**
Pembaruan data dilakukan menggunakan metode `update` dengan kriteria unik seperti kode unit. Logika ini krusial untuk sinkronisasi status barang, misalnya mengubah kondisi aset secara real-time, memastikan informasi ketersediaan di gudang selalu akurat dan terbarui bagi seluruh pengguna aplikasi inventaris sekolah.
```typescript
await prisma.masterBarang.update({
  where: { kodeMaster: 'BRG-001' },
  data: {
    namaBarang: 'Laptop ASUS VivoBook Pro',
    hargaSatuan: 8000000,
    kategori: { connect: { kodeKategori: 'K-002' } },
    updatedAt: new Date()
  }
});
```

**5.2.1.4 Delete Data Barang**
Sistem menerapkan metode *soft delete* untuk menjaga keamanan histori. Alih-alih menghapus permanen, sistem memperbarui kolom `deletedAt` dengan timestamp saat ini. Hal ini memungkinkan pemulihan data jika terjadi kesalahan serta mendukung kebutuhan audit log aktivitas pengguna di masa mendatang guna menjamin keamanan data.
```typescript
await prisma.$transaction([
  prisma.masterBarang.update({
    where: { kodeMaster: 'BRG-001' },
    data: { deletedAt: new Date() }
  }),
  prisma.unitBarang.updateMany({
    where: { masterBarangId: 'BRG-001' },
    data: { isActive: false }
  })
]);
```
