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

  // 8. Create Unit Barang (Expanded for more variety)
  const units: any[] = []
  const allMasterKeys = masterBarangs.map(m => m.kodeMaster)

  for (let i = 0; i < 80; i++) {
    const masterId = allMasterKeys[i % allMasterKeys.length]
    const ruangId = (i % 12) + 1
    const statusIdx = i % 10
    let status = 'baik'
    if (statusIdx === 7) status = 'rusak'
    if (statusIdx === 8) status = 'dipinjam'
    if (statusIdx === 9) status = 'dihapus'

    units.push({
      kodeUnit: `${masterId}-${String(i + 1).padStart(3, '0')}`,
      masterBarangId: masterId,
      ruangId: ruangId,
      status: status,
      createdBy: petugasUser.id,
      isActive: status !== 'dihapus'
    })
  }

  await prisma.unitBarang.createMany({ data: units })
  const createdUnits = await prisma.unitBarang.findMany()
  console.log(`✅ ${createdUnits.length} Unit Barang created`)

  // Helper for random dates in last 60 days
  const getRandomDate = (daysBack = 60) => {
    const d = new Date()
    d.setDate(d.getDate() - Math.floor(Math.random() * daysBack))
    return d
  }

  // 9. Create Transaksi Barang (25 records)
  console.log('📦 Seeding 25 Transaksi Barang...')
  for (let i = 1; i <= 25; i++) {
    const status = ['approved', 'pending', 'rejected'][i % 3]
    const isApproved = status === 'approved'
    const isRejected = status === 'rejected'

    await prisma.transaksiBarang.create({
      data: {
        kodeTransaksi: `TRX-IN-${String(i).padStart(3, '0')}`,
        masterBarangId: allMasterKeys[i % allMasterKeys.length],
        tanggalTransaksi: getRandomDate(),
        totalPesanan: Math.floor(Math.random() * 10) + 1,
        penanggungJawab: ['Mas Budi', 'Ibu Ratna', 'Pak Eko'][i % 3],
        userId: petugasUser.id,
        approvalStatus: status as any,
        approvedBy: (isApproved || isRejected) ? kepsekUser.id : null,
        approvedAt: (isApproved || isRejected) ? getRandomDate(5) : null,
        ruangTujuanId: (i % 12) + 1
      }
    })
  }

  // 10. Create Transaksi Keluar (25 records)
  console.log('📤 Seeding 25 Transaksi Keluar...')
  const types = ['pemindahan', 'peminjaman', 'penggunaan', 'penghapusan']
  for (let i = 1; i <= 25; i++) {
    const unit = createdUnits[i % createdUnits.length]
    const status = i % 5 === 0 ? 'pending' : 'approved'

    await prisma.transaksiKeluar.create({
      data: {
        kodeTransaksi: `TRX-OUT-${String(i).padStart(3, '0')}`,
        unitBarangId: unit.kodeUnit,
        ruangAsalId: unit.ruangId,
        ruangTujuanId: (unit.ruangId % 12) + 1,
        tipe: types[i % types.length] as any,
        tanggalTransaksi: getRandomDate(),
        penerima: ['Guru Kelas', 'Staf TU', 'Yayasan'][i % 3],
        userId: petugasUser.id,
        approvalStatus: status as any,
        approvedBy: status === 'approved' ? adminUser.id : null,
        approvedAt: status === 'approved' ? getRandomDate(5) : null
      }
    })
  }

  // 11. Barang Rusak (25 records)
  console.log('⚠️ Seeding 25 Barang Rusak...')
  for (let i = 1; i <= 25; i++) {
    const unit = createdUnits[(i * 2) % createdUnits.length]
    await prisma.barangRusak.create({
      data: {
        unitBarangId: unit.kodeUnit,
        ruangId: unit.ruangId,
        tanggalKejadian: getRandomDate(30),
        keterangan: ['Pecah', 'Lecet parah', 'Hilang komponen', 'Baut lepas', 'Kain robek'][i % 5],
        penanggungJawab: 'Petugas Kebersihan',
        userId: petugasUser.id
      }
    })
  }

  // 12. Mutasi Lokasi (25 records)
  console.log('🔄 Seeding 25 Mutasi Lokasi...')
  for (let i = 1; i <= 25; i++) {
    const unit = createdUnits[(i * 3) % createdUnits.length]
    await prisma.mutasiLokasi.create({
      data: {
        unitBarangId: unit.kodeUnit,
        ruangAsalId: (unit.ruangId % 12) + 1,
        ruangTujuanId: unit.ruangId,
        tanggalMutasi: getRandomDate(90),
        tipeMutasi: i % 2 === 0 ? 'transaksi' : 'manual',
        keterangan: 'Penataan ulang aset rutin',
        userId: petugasUser.id
      }
    })
  }

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
