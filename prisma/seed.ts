import "dotenv/config";
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database for TK & Day Care...')

  // 1. Create Permissions
  const permissionNames = [
    'view_kategoris', 'create_kategoris', 'edit_kategoris', 'delete_kategoris',
    'view_ruangs', 'create_ruangs', 'edit_ruangs', 'delete_ruangs',
    'view_master_barangs', 'create_master_barangs', 'edit_master_barangs', 'delete_master_barangs',
    'view_unit_barangs', 'create_unit_barangs', 'edit_unit_barangs', 'nonaktifkan_unit_barangs',
    'view_transaksi_barangs', 'create_transaksi_barangs', 'edit_transaksi_barangs', 'approve_transaksi_barangs',
    'view_transaksi_keluars', 'create_transaksi_keluars', 'edit_transaksi_keluars', 'approve_transaksi_keluars',
    'view_barang_rusaks', 'create_barang_rusaks',
    'view_mutasi_lokasis', 'create_mutasi_lokasis', 'edit_mutasi_lokasis', 'delete_mutasi_lokasis',
    'view_log_aktivitas',
    'view_users', 'create_users', 'edit_users', 'delete_users',
    'generate_laporan', 'export_data',
    'backup_database', 'system_settings',
  ]

  for (const name of permissionNames) {
    await prisma.permission.upsert({ where: { name }, update: {}, create: { name } })
  }
  console.log(`✅ ${permissionNames.length} permissions created/verified`)

  // 2. Create Roles
  const adminRole = await prisma.role.upsert({ where: { name: 'Admin' }, update: {}, create: { name: 'Admin' } })
  const kepsekRole = await prisma.role.upsert({ where: { name: 'Kepala Sekolah' }, update: {}, create: { name: 'Kepala Sekolah' } })
  const petugasRole = await prisma.role.upsert({ where: { name: 'Petugas Inventaris' }, update: {}, create: { name: 'Petugas Inventaris' } })
  console.log('✅ 3 roles created/verified')

  // 3. Assign Permissions
  const allPerms = await prisma.permission.findMany()
  
  // Admin all perms
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    })
  }

  // Kepsek perms
  const kepsekPerms = [
    'view_kategoris', 'view_ruangs', 'view_master_barangs', 'view_unit_barangs',
    'view_transaksi_barangs', 'view_transaksi_keluars', 'view_barang_rusaks',
    'view_mutasi_lokasis', 'view_log_aktivitas', 'view_users',
    'approve_transaksi_barangs', 'approve_transaksi_keluars',
    'generate_laporan', 'export_data',
  ]
  for (const name of kepsekPerms) {
    const perm = allPerms.find(p => p.name === name)
    if (perm) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: kepsekRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: kepsekRole.id, permissionId: perm.id },
      })
    }
  }

  // Petugas perms
  const petugasPerms = [
    'view_kategoris', 'view_ruangs', 'view_master_barangs', 'view_unit_barangs',
    'view_transaksi_barangs', 'view_transaksi_keluars', 'view_barang_rusaks',
    'view_mutasi_lokasis', 'view_log_aktivitas',
    'create_kategoris', 'edit_kategoris', 'delete_kategoris',
    'create_ruangs', 'edit_ruangs', 'delete_ruangs',
    'create_master_barangs', 'edit_master_barangs',
    'create_unit_barangs', 'edit_unit_barangs',
    'create_transaksi_barangs', 'edit_transaksi_barangs',
    'create_transaksi_keluars', 'edit_transaksi_keluars',
    'create_mutasi_lokasis', 'edit_mutasi_lokasis', 'delete_mutasi_lokasis',
    'create_barang_rusaks',
  ]
  for (const name of petugasPerms) {
    const perm = allPerms.find(p => p.name === name)
    if (perm) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: petugasRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: petugasRole.id, permissionId: perm.id },
      })
    }
  }
  console.log('✅ Permissions assigned')

  // 4. Create Users
  const hashedPassword = await bcrypt.hash('password', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: { name: 'Administrator TK', email: 'admin@gmail.com', password: hashedPassword, roleId: adminRole.id, isActive: true },
  })
  const kepsekUser = await prisma.user.upsert({
    where: { email: 'kepala@gmail.com' },
    update: {},
    create: { name: 'Bunda Siti (Kepala TK)', email: 'kepala@gmail.com', password: hashedPassword, roleId: kepsekRole.id, isActive: true },
  })
  const petugasUser = await prisma.user.upsert({
    where: { email: 'petugas@gmail.com' },
    update: {},
    create: { name: 'Mas Budi (Petugas Inventaris)', email: 'petugas@gmail.com', password: hashedPassword, roleId: petugasRole.id, isActive: true },
  })
  console.log('✅ 3 users created')

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
  ]
  for (const r of ruangs) {
    await prisma.ruang.upsert({ where: { id: r.id }, update: {}, create: r })
  }
  console.log(`✅ ${ruangs.length} ruang created`)

  // 6. Create Kategori
  const kategoris = [
    { kodeKategori: 'APE-D', namaKategori: 'APE Dalam', deskripsi: 'Alat Permainan Edukatif Indoor' },
    { kodeKategori: 'APE-L', namaKategori: 'APE Luar', deskripsi: 'Alat Permainan Edukatif Outdoor' },
    { kodeKategori: 'MEB', namaKategori: 'Meubelair', deskripsi: 'Meja, Kursi, Lemari' },
    { kodeKategori: 'BUK', namaKategori: 'Buku & Media', deskripsi: 'Buku cerita dan media belajar' },
    { kodeKategori: 'ELE', namaKategori: 'Elektronik', deskripsi: 'Peralatan elektronik penunjang' },
    { kodeKategori: 'KES', namaKategori: 'Kesehatan', deskripsi: 'Peralatan UKS dan kebersihan' },
  ]
  for (const k of kategoris) {
    await prisma.kategori.upsert({ where: { kodeKategori: k.kodeKategori }, update: {}, create: k })
  }
  console.log(`✅ ${kategoris.length} kategori created`)

  // 7. Create Master Barang
  const masterBarangs = [
    { kodeMaster: 'APE-001', namaBarang: 'Lego Duplo 100pcs', kategoriId: 'APE-D', satuan: 'set', merk: 'Lego', hargaSatuan: 450000 },
    { kodeMaster: 'APE-002', namaBarang: 'Puzzle Kayu Hijaiyah', kategoriId: 'APE-D', satuan: 'pcs', merk: 'EduToys', hargaSatuan: 35000 },
    { kodeMaster: 'APE-003', namaBarang: 'Balok Kayu Warna 50pcs', kategoriId: 'APE-D', satuan: 'set', merk: 'EduToys', hargaSatuan: 120000 },
    { kodeMaster: 'APE-L01', namaBarang: 'Perosotan Plastik Medium', kategoriId: 'APE-L', satuan: 'unit', merk: 'Labeille', hargaSatuan: 1200000 },
    { kodeMaster: 'APE-L02', namaBarang: 'Ayunan Duduk 2 Kursi', kategoriId: 'APE-L', satuan: 'unit', merk: 'Local', hargaSatuan: 2500000 },
    { kodeMaster: 'MEB-001', namaBarang: 'Meja Belajar Anak Persegi', kategoriId: 'MEB', satuan: 'unit', merk: 'Informa', hargaSatuan: 350000 },
    { kodeMaster: 'MEB-002', namaBarang: 'Kursi Anak Plastik Warna', kategoriId: 'MEB', satuan: 'unit', merk: 'Napolly', hargaSatuan: 85000 },
    { kodeMaster: 'MEB-003', namaBarang: 'Lemari Loker 12 Pintu', kategoriId: 'MEB', satuan: 'unit', merk: 'Lion', hargaSatuan: 1800000 },
    { kodeMaster: 'MEB-004', namaBarang: 'Kasur Busa Day Care', kategoriId: 'MEB', satuan: 'unit', merk: 'Inoac', hargaSatuan: 400000 },
    { kodeMaster: 'BUK-001', namaBarang: 'Seri Cerita Nabi 25 Judul', kategoriId: 'BUK', satuan: 'set', merk: 'Mizan', hargaSatuan: 750000 },
    { kodeMaster: 'BUK-002', namaBarang: 'Flashcard Alfabet & Angka', kategoriId: 'BUK', satuan: 'set', merk: 'Rabbit', hargaSatuan: 25000 },
    { kodeMaster: 'ELE-001', namaBarang: 'Speaker Portable 12 Inch', kategoriId: 'ELE', satuan: 'unit', merk: 'Polytron', hargaSatuan: 1500000 },
    { kodeMaster: 'ELE-002', namaBarang: 'Smart TV 43 Inch', kategoriId: 'ELE', satuan: 'unit', merk: 'Samsung', hargaSatuan: 4200000 },
    { kodeMaster: 'KES-001', namaBarang: 'Termometer Gun Infra', kategoriId: 'KES', satuan: 'unit', merk: 'Omron', hargaSatuan: 350000 },
    { kodeMaster: 'KES-002', namaBarang: 'Timbangan Badan Digital', kategoriId: 'KES', satuan: 'unit', merk: 'Gea', hargaSatuan: 150000 },
  ]
  for (const mb of masterBarangs) {
    await prisma.masterBarang.upsert({ where: { kodeMaster: mb.kodeMaster }, update: {}, create: mb })
  }
  console.log(`✅ ${masterBarangs.length} master barang created`)

  // 8. Create Unit Barang (Some samples)
  const unitBarangs = [
    // Lego Duplo 2 sets in Indoor Play
    { kodeUnit: 'APE-001-01', masterBarangId: 'APE-001', ruangId: 1, status: 'baik', tanggalPembelian: new Date('2023-01-15') },
    { kodeUnit: 'APE-001-02', masterBarangId: 'APE-001', ruangId: 1, status: 'baik', tanggalPembelian: new Date('2023-01-15') },
    // Meja and Kursi in TK A
    { kodeUnit: 'MEB-001-01', masterBarangId: 'MEB-001', ruangId: 2, status: 'baik', tanggalPembelian: new Date('2023-01-10') },
    { kodeUnit: 'MEB-001-02', masterBarangId: 'MEB-001', ruangId: 2, status: 'baik', tanggalPembelian: new Date('2023-01-10') },
    { kodeUnit: 'MEB-002-01', masterBarangId: 'MEB-002', ruangId: 2, status: 'baik', tanggalPembelian: new Date('2023-01-10') },
    { kodeUnit: 'MEB-002-02', masterBarangId: 'MEB-002', ruangId: 2, status: 'baik', tanggalPembelian: new Date('2023-01-10') },
    { kodeUnit: 'MEB-002-03', masterBarangId: 'MEB-002', ruangId: 2, status: 'baik', tanggalPembelian: new Date('2023-01-10') },
    // Speaker in Ruang Guru
    { kodeUnit: 'ELE-001-01', masterBarangId: 'ELE-001', ruangId: 8, status: 'baik', tanggalPembelian: new Date('2022-12-20') },
    // Smart TV in TK B
    { kodeUnit: 'ELE-002-01', masterBarangId: 'ELE-002', ruangId: 3, status: 'baik', tanggalPembelian: new Date('2023-05-05') },
    // Perosotan in Area Luar
    { kodeUnit: 'APE-L01-01', masterBarangId: 'APE-L01', ruangId: 6, status: 'baik', tanggalPembelian: new Date('2023-02-14') },
    // Broken item sample
    { kodeUnit: 'MEB-002-04', masterBarangId: 'MEB-002', ruangId: 2, status: 'rusak', catatan: 'Kaki kursi patah', tanggalPembelian: new Date('2023-01-10') },
  ]
  for (const ub of unitBarangs) {
    await prisma.unitBarang.upsert({ where: { kodeUnit: ub.kodeUnit }, update: {}, create: { ...ub, createdBy: petugasUser.id } })
  }
  console.log(`✅ ${unitBarangs.length} unit barang created`)

  // 9. Clear non-idempotent tables for sample data
  await prisma.barangRusak.deleteMany()
  await prisma.mutasiLokasi.deleteMany()

  // 10. Create initial Transaksi Barang (Inbound)
  const inboundTx = await prisma.transaksiBarang.upsert({
    where: { kodeTransaksi: 'TX-IN-001' },
    update: {},
    create: {
      kodeTransaksi: 'TX-IN-001',
      masterBarangId: 'ELE-002',
      tanggalTransaksi: new Date('2024-01-10'),
      totalPesanan: 1,
      penanggungJawab: 'Mas Budi',
      keterangan: 'Pengadaan Smart TV untuk Ruang TK B',
      userId: petugasUser.id,
      approvedBy: kepsekUser.id,
      approvedAt: new Date('2024-01-11'),
      approvalStatus: 'approved',
      ruangTujuanId: 3
    }
  })
  console.log('✅ 1 inbound transaction created')

  // 11. Create initial Transaksi Keluar (Distribution/Loan)
  await prisma.transaksiKeluar.upsert({
    where: { kodeTransaksi: 'TX-OUT-001' },
    update: {},
    create: {
      kodeTransaksi: 'TX-OUT-001',
      unitBarangId: 'ELE-001-01',
      ruangAsalId: 8,
      ruangTujuanId: 6,
      tipe: 'peminjaman',
      tanggalTransaksi: new Date(),
      penerima: 'Ibu Ratna',
      tujuan: 'Senam Pagi Anak TK',
      keterangan: 'Peminjaman speaker untuk kegiatan senam',
      userId: petugasUser.id,
      approvalStatus: 'approved',
      approvedBy: adminUser.id,
      approvedAt: new Date()
    }
  })
  console.log('✅ 1 outbound transaction created')

  // 12. Create Barang Rusak entry
  await prisma.barangRusak.create({
    data: {
      unitBarangId: 'MEB-002-04',
      ruangId: 2,
      tanggalKejadian: new Date('2024-03-15'),
      keterangan: 'Anak-anak melompat di atas kursi',
      penanggungJawab: 'Ibu Ratna (Wali Kelas TK A)',
      userId: petugasUser.id
    }
  })
  console.log('✅ 1 broken item report created')

  // 13. Create Mutasi Lokasi entry
  await prisma.mutasiLokasi.create({
    data: {
      unitBarangId: 'APE-001-02',
      ruangAsalId: 1,
      ruangTujuanId: 7,
      tanggalMutasi: new Date(),
      tipeMutasi: 'manual',
      keterangan: 'Dipindahkan sementara ke gudang untuk pembersihan ruang',
      userId: petugasUser.id
    }
  })
  console.log('✅ 1 mutation log created')

  console.log('\n🎉 Seeding completed for TK & Day Care!')
  console.log('\n📋 Login credentials:')
  console.log('  Admin:    admin@gmail.com / password')
  console.log('  Kepsek:   kepala@gmail.com / password')
  console.log('  Petugas:  petugas@gmail.com / password')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
