import "dotenv/config";
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Expanded Massive Seeder...')

  // 1. Permissions
  const permissionNames = [
    'view_kategoris', 'create_kategoris', 'edit_kategoris', 'delete_kategoris',
    'view_ruangs', 'create_ruangs', 'edit_ruangs', 'delete_ruangs',
    'view_master_barangs', 'create_master_barangs', 'edit_master_barangs', 'delete_master_barangs',
    'view_unit_barangs', 'create_unit_barangs', 'edit_unit_barangs', 'nonaktifkan_unit_barangs',
    'view_transaksi_barangs', 'create_transaksi_barangs', 'edit_transaksi_barangs', 'approve_transaksi_barangs',
    'view_transaksi_keluars', 'create_transaksi_keluars', 'edit_transaksi_keluars', 'approve_transaksi_keluars',
    'view_barang_rusaks', 'create_barang_rusaks',
    'view_mutasi_lokasis', 'create_mutasi_lokasis', 'edit_mutasi_lokasis', 'delete_mutasi_lokasis',
    'view_log_aktivitas', 'view_users', 'create_users', 'edit_users', 'delete_users',
    'generate_laporan', 'export_data', 'backup_database', 'system_settings',
  ]

  for (const name of permissionNames) {
    await prisma.permission.upsert({ where: { name }, update: {}, create: { name } })
  }
  console.log('✅ Permissions verified')

  // 2. Roles
  const adminRole = await prisma.role.upsert({ where: { name: 'Admin' }, update: {}, create: { name: 'Admin' } })
  const kepsekRole = await prisma.role.upsert({ where: { name: 'Kepala Sekolah' }, update: {}, create: { name: 'Kepala Sekolah' } })
  const petugasRole = await prisma.role.upsert({ where: { name: 'Petugas Inventaris' }, update: {}, create: { name: 'Petugas Inventaris' } })

  const allPerms = await prisma.permission.findMany()
  // Admin: All perms
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    })
  }

  // 3. Users
  const hashedPassword = await bcrypt.hash('password', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: { name: 'Administrator', email: 'admin@gmail.com', password: hashedPassword, roleId: adminRole.id, isActive: true },
  })
  const kepsekUser = await prisma.user.upsert({
    where: { email: 'kepala@gmail.com' },
    update: {},
    create: { name: 'Bunda Siti', email: 'kepala@gmail.com', password: hashedPassword, roleId: kepsekRole.id, isActive: true },
  })
  const petugasUser = await prisma.user.upsert({
    where: { email: 'petugas@gmail.com' },
    update: {},
    create: { name: 'Mas Budi', email: 'petugas@gmail.com', password: hashedPassword, roleId: petugasRole.id, isActive: true },
  })
  console.log('✅ Users verified')

  // 4. Cleanup sample data (Order is important due to FKs)
  console.log('🧹 Cleaning up old sample data...')
  await prisma.logAktivitas.deleteMany()
  await prisma.mutasiLokasi.deleteMany()
  await prisma.barangRusak.deleteMany()
  await prisma.transaksiKeluar.deleteMany()
  await prisma.transaksiBarang.deleteMany()
  await prisma.unitBarang.deleteMany()
  await prisma.masterBarang.deleteMany()
  await prisma.kategori.deleteMany()
  await prisma.ruang.deleteMany()

  // 5. Create Ruang
  const ruangs = [
    { id: 1, namaRuang: 'Ruang Bermain Indoor' },
    { id: 2, namaRuang: 'Ruang Belajar TK A' },
    { id: 3, namaRuang: 'Ruang Belajar TK B' },
    { id: 4, namaRuang: 'Ruang Tidur Day Care' },
    { id: 5, namaRuang: 'Dapur & Ruang Makan' },
    { id: 6, namaRuang: 'Area Bermain Luar' },
    { id: 7, namaRuang: 'Gudang Inventaris' },
    { id: 8, namaRuang: 'Ruang Guru & Tata Usaha' },
    { id: 9, namaRuang: 'Perpustakaan Mini' },
    { id: 10, namaRuang: 'Ruang Musik & Seni' },
    { id: 11, namaRuang: 'Kantor Yayasan' },
    { id: 12, namaRuang: 'Toilet & Wastafel Anak' },
  ]
  await prisma.ruang.createMany({ data: ruangs })
  console.log('✅ Ruang created')

  // 6. Create Kategori
  const kategoris = [
    { kodeKategori: 'APE-D', namaKategori: 'APE Dalam', deskripsi: 'Alat Permainan Edukatif Indoor' },
    { kodeKategori: 'APE-L', namaKategori: 'APE Luar', deskripsi: 'Alat Permainan Edukatif Outdoor' },
    { kodeKategori: 'MEB', namaKategori: 'Meubelair', deskripsi: 'Meja, Kursi, Lemari' },
    { kodeKategori: 'BUK', namaKategori: 'Buku & Media', deskripsi: 'Buku cerita dan media belajar' },
    { kodeKategori: 'ELE', namaKategori: 'Elektronik', deskripsi: 'Peralatan elektronik penunjang' },
    { kodeKategori: 'KES', namaKategori: 'Kesehatan', deskripsi: 'Peralatan UKS dan kebersihan' },
    { kodeKategori: 'OLA', namaKategori: 'Olahraga', deskripsi: 'Peralatan olahraga anak' },
    { kodeKategori: 'ART', namaKategori: 'Kesenian', deskripsi: 'Alat musik dan alat lukis' },
  ]
  await prisma.kategori.createMany({ data: kategoris })
  console.log('✅ Kategori created')

  // 7. Create Master Barang (Tepat 24 Jenis)
  const masterBarangs = [
    { kodeMaster: 'APE-001', namaBarang: 'Lego Duplo 100pcs', kategoriId: 'APE-D', satuan: 'set', hargaSatuan: 450000 },
    { kodeMaster: 'APE-002', namaBarang: 'Puzzle Kayu Hijaiyah', kategoriId: 'APE-D', satuan: 'pcs', hargaSatuan: 35000 },
    { kodeMaster: 'APE-003', namaBarang: 'Balok Kayu Warna 50pcs', kategoriId: 'APE-D', satuan: 'set', hargaSatuan: 120000 },
    { kodeMaster: 'APE-L01', namaBarang: 'Perosotan Plastik Medium', kategoriId: 'APE-L', satuan: 'unit', hargaSatuan: 1200000 },
    { kodeMaster: 'APE-L02', namaBarang: 'Ayunan Duduk 2 Kursi', kategoriId: 'APE-L', satuan: 'unit', hargaSatuan: 2500000 },
    { kodeMaster: 'MEB-001', namaBarang: 'Meja Belajar Anak Persegi', kategoriId: 'MEB', satuan: 'unit', hargaSatuan: 350000 },
    { kodeMaster: 'MEB-002', namaBarang: 'Kursi Anak Plastik Warna', kategoriId: 'MEB', satuan: 'unit', hargaSatuan: 85000 },
    { kodeMaster: 'MEB-003', namaBarang: 'Lemari Loker 12 Pintu', kategoriId: 'MEB', satuan: 'unit', hargaSatuan: 1800000 },
    { kodeMaster: 'MEB-004', namaBarang: 'Kasur Busa Day Care', kategoriId: 'MEB', satuan: 'unit', hargaSatuan: 400000 },
    { kodeMaster: 'ELE-001', namaBarang: 'Speaker Portable 12 Inch', kategoriId: 'ELE', satuan: 'unit', hargaSatuan: 1500000 },
    { kodeMaster: 'ELE-002', namaBarang: 'Smart TV 43 Inch', kategoriId: 'ELE', satuan: 'unit', hargaSatuan: 4200000 },
    { kodeMaster: 'ELE-003', namaBarang: 'AC Split 1/2 PK', kategoriId: 'ELE', satuan: 'unit', hargaSatuan: 3200000 },
    { kodeMaster: 'OLA-001', namaBarang: 'Bola Plastik 100pcs', kategoriId: 'OLA', satuan: 'karung', hargaSatuan: 150000 },
    { kodeMaster: 'ART-001', namaBarang: 'Keyboard Yamaha', kategoriId: 'ART', satuan: 'unit', hargaSatuan: 2200000 },
    { kodeMaster: 'ART-002', namaBarang: 'Set Perkusi Anak', kategoriId: 'ART', satuan: 'set', hargaSatuan: 450000 },
    { kodeMaster: 'BUK-001', namaBarang: 'Seri Cerita Nabi 25 Judul', kategoriId: 'BUK', satuan: 'set', hargaSatuan: 750000 },
    { kodeMaster: 'KES-001', namaBarang: 'Peralatan UKS Lengkap', kategoriId: 'KES', satuan: 'set', hargaSatuan: 850000 },
    // 7 Data Baru
    { kodeMaster: 'KES-002', namaBarang: 'Pipa PVC', kategoriId: 'KES', satuan: 'batang', hargaSatuan: 45000 },
    { kodeMaster: 'ELE-004', namaBarang: 'Rice Cooker', kategoriId: 'ELE', satuan: 'unit', hargaSatuan: 550000 },
    { kodeMaster: 'ELE-005', namaBarang: 'Printer L3110', kategoriId: 'ELE', satuan: 'unit', hargaSatuan: 2400000 },
    { kodeMaster: 'MEB-005', namaBarang: 'Rak Sepatu Kayu', kategoriId: 'MEB', satuan: 'unit', hargaSatuan: 250000 },
    { kodeMaster: 'ELE-006', namaBarang: 'Vacuum Cleaner', kategoriId: 'ELE', satuan: 'unit', hargaSatuan: 1100000 },
    { kodeMaster: 'ELE-007', namaBarang: 'Dispenser Galon Atas', kategoriId: 'ELE', satuan: 'unit', hargaSatuan: 850000 },
    { kodeMaster: 'ELE-008', namaBarang: 'Kipas Angin Dinding', kategoriId: 'ELE', satuan: 'unit', hargaSatuan: 320000 },
  ]
  await prisma.masterBarang.createMany({ data: masterBarangs })
  const allMasterKeys = masterBarangs.map(m => m.kodeMaster)
  console.log('✅ 24 Master Barang created')

  // 8. Create Unit Barang (360 Aktif + Dinamis)
  console.log('📦 Seeding 360+ Unit Barang...')
  const units = []
  // 360 Unit Aktif/Baik
  for (let i = 1; i <= 360; i++) {
    units.push({
      kodeUnit: `UNIT-B-${String(i).padStart(3, '0')}`,
      masterBarangId: allMasterKeys[i % 24],
      ruangId: (i % 12) + 1,
      status: 'baik',
      createdBy: petugasUser.id,
      isActive: true
    })
  }
  // 40 Unit Dipinjam & 25 Unit Rusak
  for (let i = 1; i <= 40; i++) {
    units.push({
      kodeUnit: `UNIT-P-${String(i).padStart(3, '0')}`,
      masterBarangId: allMasterKeys[i % 24],
      ruangId: (i % 12) + 1,
      status: 'dipinjam',
      createdBy: petugasUser.id,
      isActive: true
    })
  }
  for (let i = 1; i <= 25; i++) {
    units.push({
      kodeUnit: `UNIT-R-${String(i).padStart(3, '0')}`,
      masterBarangId: allMasterKeys[i % 24],
      ruangId: (i % 12) + 1,
      status: 'rusak',
      createdBy: petugasUser.id,
      isActive: true
    })
  }
  await prisma.unitBarang.createMany({ data: units })
  const createdUnits = await prisma.unitBarang.findMany()
  console.log(`✅ ${createdUnits.length} Unit Barang created`)

  // Helper Tanggal Modulus 2026
  const getModulusDate = (i: number) => new Date(2026, i % 12, (i % 28) + 1)

  // 9. Transaksi Barang (Pengadaan) - 60 Records
  console.log('📈 Seeding 60 Transaksi Barang (Yearly Pattern)...')
  for (let i = 1; i <= 60; i++) {
    const status = i % 10 === 0 ? 'pending' : 'approved'
    await prisma.transaksiBarang.create({
      data: {
        kodeTransaksi: `TRX-IN-2026-${String(i).padStart(3, '0')}`,
        masterBarangId: allMasterKeys[i % 24],
        tanggalTransaksi: getModulusDate(i),
        totalPesanan: Math.floor(Math.random() * 5) + 1,
        penanggungJawab: 'Mas Budi',
        userId: petugasUser.id,
        approvalStatus: status as any,
        approvedBy: status === 'approved' ? kepsekUser.id : null,
        approvedAt: status === 'approved' ? getModulusDate(i) : null,
        ruangTujuanId: (i % 12) + 1
      }
    })
  }

  // 10. Transaksi Keluar (Pengelolaan) - 50 Records
  console.log('📉 Seeding 50 Transaksi Keluar (Yearly Pattern)...')
  const types = ['peminjaman', 'penggunaan', 'pemindahan', 'penghapusan']
  for (let i = 1; i <= 50; i++) {
    const status = i % 8 === 0 ? 'pending' : 'approved'
    await prisma.transaksiKeluar.create({
      data: {
        kodeTransaksi: `TRX-OUT-2026-${String(i).padStart(3, '0')}`,
        unitBarangId: createdUnits[i % createdUnits.length].kodeUnit,
        ruangAsalId: (i % 12) + 1,
        ruangTujuanId: ((i + 1) % 12) + 1,
        tipe: types[i % 4] as any,
        tanggalTransaksi: getModulusDate(i),
        penerima: 'Guru/Staf',
        userId: petugasUser.id,
        approvalStatus: status as any,
        approvedBy: status === 'approved' ? adminUser.id : null,
        approvedAt: status === 'approved' ? getModulusDate(i) : null
      }
    })
  }

  // 11. Barang Rusak - 30 Records
  console.log('⚠️ Seeding 30 Laporan Barang Rusak...')
  for (let i = 1; i <= 30; i++) {
    await prisma.barangRusak.create({
      data: {
        unitBarangId: createdUnits[(i * 3) % createdUnits.length].kodeUnit,
        ruangId: (i % 12) + 1,
        tanggalKejadian: getModulusDate(i),
        keterangan: 'Kerusakan terdeteksi saat inspeksi rutin',
        penanggungJawab: 'Tim Sarpras',
        userId: petugasUser.id
      }
    })
  }

  console.log('\n🎉 Massive Yearly Seeding Completed Successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeder Failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
