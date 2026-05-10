import "dotenv/config";
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Expanded Seeder...')

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
  console.log(`✅ Permissions verified`)

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

  // Kepala Sekolah: View all + Approvals + Reports
  const kepsekPerms = allPerms.filter(p =>
    p.name.startsWith('view_') ||
    p.name.includes('approve_') ||
    ['generate_laporan', 'export_data'].includes(p.name)
  )
  for (const perm of kepsekPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: kepsekRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: kepsekRole.id, permissionId: perm.id },
    })
  }

  // Petugas: View all + Create/Edit (except approve and delete)
  const petugasPerms = allPerms.filter(p =>
    p.name.startsWith('view_') ||
    p.name.startsWith('create_') ||
    p.name.startsWith('edit_') ||
    p.name.includes('nonaktifkan_')
  ).filter(p => !p.name.includes('delete_') && !p.name.includes('approve_'))

  for (const perm of petugasPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: petugasRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: petugasRole.id, permissionId: perm.id },
    })
  }

  console.log('✅ Roles and Permissions assigned')

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

  // 7. Create Master Barang
  const masterBarangs = [
    { kodeMaster: 'APE-001', namaBarang: 'Lego Duplo 100pcs', kategoriId: 'APE-D', satuan: 'set', merk: 'Lego', hargaSatuan: 450000, reorderPoint: 2 },
    { kodeMaster: 'APE-002', namaBarang: 'Puzzle Kayu Hijaiyah', kategoriId: 'APE-D', satuan: 'pcs', merk: 'EduToys', hargaSatuan: 35000, reorderPoint: 5 },
    { kodeMaster: 'APE-003', namaBarang: 'Balok Kayu Warna 50pcs', kategoriId: 'APE-D', satuan: 'set', merk: 'EduToys', hargaSatuan: 120000, reorderPoint: 3 },
    { kodeMaster: 'APE-L01', namaBarang: 'Perosotan Plastik Medium', kategoriId: 'APE-L', satuan: 'unit', merk: 'Labeille', hargaSatuan: 1200000, reorderPoint: 1 },
    { kodeMaster: 'APE-L02', namaBarang: 'Ayunan Duduk 2 Kursi', kategoriId: 'APE-L', satuan: 'unit', merk: 'Local', hargaSatuan: 2500000, reorderPoint: 1 },
    { kodeMaster: 'MEB-001', namaBarang: 'Meja Belajar Anak Persegi', kategoriId: 'MEB', satuan: 'unit', merk: 'Informa', hargaSatuan: 350000, reorderPoint: 10 },
    { kodeMaster: 'MEB-002', namaBarang: 'Kursi Anak Plastik Warna', kategoriId: 'MEB', satuan: 'unit', merk: 'Napolly', hargaSatuan: 85000, reorderPoint: 20 },
    { kodeMaster: 'MEB-003', namaBarang: 'Lemari Loker 12 Pintu', kategoriId: 'MEB', satuan: 'unit', merk: 'Lion', hargaSatuan: 1800000, reorderPoint: 2 },
    { kodeMaster: 'MEB-004', namaBarang: 'Kasur Busa Day Care', kategoriId: 'MEB', satuan: 'unit', merk: 'Inoac', hargaSatuan: 400000, reorderPoint: 5 },
    { kodeMaster: 'ELE-001', namaBarang: 'Speaker Portable 12 Inch', kategoriId: 'ELE', satuan: 'unit', merk: 'Polytron', hargaSatuan: 1500000, reorderPoint: 1 },
    { kodeMaster: 'ELE-002', namaBarang: 'Smart TV 43 Inch', kategoriId: 'ELE', satuan: 'unit', merk: 'Samsung', hargaSatuan: 4200000, reorderPoint: 1 },
    { kodeMaster: 'ELE-003', namaBarang: 'AC Split 1/2 PK', kategoriId: 'ELE', satuan: 'unit', merk: 'LG', hargaSatuan: 3200000, reorderPoint: 1 },
    { kodeMaster: 'OLA-001', namaBarang: 'Bola Plastik 100pcs', kategoriId: 'OLA', satuan: 'karung', merk: 'Local', hargaSatuan: 150000, reorderPoint: 2 },
    { kodeMaster: 'ART-001', namaBarang: 'Keyboard Yamaha', kategoriId: 'ART', satuan: 'unit', merk: 'Yamaha', hargaSatuan: 2200000, reorderPoint: 1 },
    { kodeMaster: 'ART-002', namaBarang: 'Set Perkusi Anak', kategoriId: 'ART', satuan: 'set', merk: 'EduToys', hargaSatuan: 450000, reorderPoint: 2 },
    { kodeMaster: 'BUK-001', namaBarang: 'Seri Cerita Nabi 25 Judul', kategoriId: 'BUK', satuan: 'set', merk: 'Mizan', hargaSatuan: 750000, reorderPoint: 1 },
    { kodeMaster: 'KES-001', namaBarang: 'Peralatan UKS Lengkap', kategoriId: 'KES', satuan: 'set', merk: 'Onemed', hargaSatuan: 850000, reorderPoint: 1 },
  ]
  await prisma.masterBarang.createMany({ data: masterBarangs })
  console.log('✅ Master Barang created')

  // 8. Create Unit Barang (Limited to ~50 units with variety)
  const units: any[] = []

  // APE Dalam units (10 units)
  for (let i = 1; i <= 3; i++) units.push({ kodeUnit: `APE01-IND-${i}`, masterBarangId: 'APE-001', ruangId: 1, status: 'baik', createdBy: petugasUser.id })
  for (let i = 1; i <= 7; i++) units.push({ kodeUnit: `APE02-PZL-${i}`, masterBarangId: 'APE-002', ruangId: 2, status: i > 5 ? 'rusak' : 'baik', createdBy: petugasUser.id })

  // Furniture units (25 units)
  for (let i = 1; i <= 8; i++) units.push({ kodeUnit: `TKA-MJA-${i}`, masterBarangId: 'MEB-001', ruangId: 2, status: 'baik', createdBy: petugasUser.id })
  for (let i = 1; i <= 8; i++) units.push({ kodeUnit: `TKB-MJA-${i}`, masterBarangId: 'MEB-001', ruangId: 3, status: 'baik', createdBy: petugasUser.id })
  for (let i = 1; i <= 9; i++) units.push({ kodeUnit: `TKA-KRS-${i}`, masterBarangId: 'MEB-002', ruangId: 2, status: i === 5 ? 'rusak' : 'baik', createdBy: petugasUser.id })

  // Electronics, Arts, Books (15 units)
  units.push({ kodeUnit: 'SPK-GYM-01', masterBarangId: 'ELE-001', ruangId: 10, status: 'dipinjam', createdBy: petugasUser.id })
  units.push({ kodeUnit: 'TV-TKB-01', masterBarangId: 'ELE-002', ruangId: 3, status: 'baik', createdBy: petugasUser.id })
  units.push({ kodeUnit: 'AC-TKA-01', masterBarangId: 'ELE-003', ruangId: 2, status: 'baik', createdBy: petugasUser.id })
  units.push({ kodeUnit: 'KBD-MUS-01', masterBarangId: 'ART-001', ruangId: 10, status: 'baik', createdBy: petugasUser.id })
  for (let i = 1; i <= 5; i++) units.push({ kodeUnit: `BUK-REL-${i}`, masterBarangId: 'BUK-001', ruangId: 9, status: 'baik', createdBy: petugasUser.id })
  for (let i = 1; i <= 6; i++) units.push({ kodeUnit: `OLA-BLA-${i}`, masterBarangId: 'OLA-001', ruangId: 6, status: 'baik', createdBy: petugasUser.id })

  await prisma.unitBarang.createMany({ data: units })
  console.log(`✅ ${units.length} Unit Barang created (Capped at 50)`)

  // 9. Create Transaksi Barang (Sync with auto-gen pattern)
  const now = new Date()
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0')
  const isoDate = now.toISOString().split('T')[0]

  const pengadaan = [
    { kode: `TRX-PENGADAAN-${dateStr}-001`, mb: 'ELE-001', qty: 2, status: 'approved', space: 8, date: isoDate, appBy: kepsekUser.id },
    { kode: `TRX-PENGADAAN-${dateStr}-002`, mb: 'APE-001', qty: 5, status: 'pending', space: 1, date: isoDate },
    { kode: `TRX-PENGADAAN-${dateStr}-003`, mb: 'ART-002', qty: 3, status: 'rejected', space: 10, date: isoDate, appBy: kepsekUser.id },
    { kode: `TRX-PENGADAAN-${dateStr}-004`, mb: 'KES-001', qty: 1, status: 'approved', space: 8, date: isoDate, appBy: kepsekUser.id },
  ]

  for (const p of pengadaan) {
    await prisma.transaksiBarang.create({
      data: {
        kodeTransaksi: p.kode,
        masterBarangId: p.mb,
        tanggalTransaksi: new Date(p.date),
        totalPesanan: p.qty,
        penanggungJawab: 'Mas Budi',
        userId: petugasUser.id,
        approvalStatus: p.status as any,
        approvedBy: p.appBy,
        approvedAt: p.appBy ? new Date(p.date) : null,
        ruangTujuanId: p.space
      }
    })
  }
  console.log('✅ Sync Transaksi Barang created')

  // 10. Create Transaksi Keluar (Sync with auto-gen pattern)
  const keluar = [
    { kode: `TRX-ASET-${dateStr}-001`, unit: 'APE01-IND-1', type: 'peminjaman', status: 'approved', from: 1, to: 2, date: isoDate, appBy: adminUser.id },
    { kode: `TRX-ASET-${dateStr}-002`, unit: 'TKA-MJA-1', type: 'pemindahan', status: 'pending', from: 2, to: 7, date: isoDate },
    { kode: `TRX-ASET-${dateStr}-003`, unit: 'SPK-GYM-01', type: 'peminjaman', status: 'approved', from: 10, to: 6, date: isoDate, appBy: kepsekUser.id },
  ]

  for (const o of keluar) {
    await prisma.transaksiKeluar.create({
      data: {
        kodeTransaksi: o.kode,
        unitBarangId: o.unit,
        ruangAsalId: o.from,
        ruangTujuanId: o.to,
        tipe: o.type as any,
        tanggalTransaksi: new Date(o.date),
        penerima: 'Staf Pengajar',
        userId: petugasUser.id,
        approvalStatus: o.status as any,
        approvedBy: o.appBy,
        approvedAt: o.appBy ? new Date(o.date) : null
      }
    })
  }
  console.log('✅ Sync Transaksi Keluar created')

  // 11. Broken Items & Mutations
  const lastMonth = new Date(now)
  lastMonth.setMonth(now.getMonth() - 1)
  const twoMonthsAgo = new Date(now)
  twoMonthsAgo.setMonth(now.getMonth() - 2)

  await prisma.barangRusak.createMany({
    data: [
      { unitBarangId: 'APE02-PZL-6', ruangId: 2, tanggalKejadian: lastMonth, keterangan: 'Pecah saat dimainkan', penanggungJawab: 'Ibu Ratna', userId: petugasUser.id },
      { unitBarangId: 'TKA-KRS-5', ruangId: 2, tanggalKejadian: twoMonthsAgo, keterangan: 'Baut lepas', penanggungJawab: 'Mas Budi', userId: petugasUser.id },
    ]
  })

  await prisma.mutasiLokasi.create({
    data: {
      unitBarangId: 'TV-TKB-01',
      ruangAsalId: 7,
      ruangTujuanId: 3,
      tanggalMutasi: twoMonthsAgo,
      tipeMutasi: 'manual',
      keterangan: 'Pemasangan awal di TKB',
      userId: petugasUser.id
    }
  })
  console.log('✅ Final broken reports & Mutation logs created')
  console.log('\n🎉 Seeding Completed Successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeder Failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
