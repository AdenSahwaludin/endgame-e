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

  // 6. Create Kategori (Following Generator Logic)
  const kategoris = [
    { kodeKategori: 'APE', namaKategori: 'APE Dalam', deskripsi: 'Alat Permainan Edukatif Indoor' },
    { kodeKategori: 'APE1', namaKategori: 'APE Luar', deskripsi: 'Alat Permainan Edukatif Outdoor' },
    { kodeKategori: 'MEU', namaKategori: 'Meubelair', deskripsi: 'Meja, Kursi, Lemari' },
    { kodeKategori: 'BUK', namaKategori: 'Buku & Media', deskripsi: 'Buku cerita dan media belajar' },
    { kodeKategori: 'ELE', namaKategori: 'Elektronik', deskripsi: 'Peralatan elektronik penunjang' },
    { kodeKategori: 'KES', namaKategori: 'Kesehatan', deskripsi: 'Peralatan UKS dan kebersihan' },
    { kodeKategori: 'OLA', namaKategori: 'Olahraga', deskripsi: 'Peralatan olahraga anak' },
    { kodeKategori: 'KES1', namaKategori: 'Kesenian', deskripsi: 'Alat musik dan alat lukis' },
  ]
  await prisma.kategori.createMany({ data: kategoris })
  console.log('✅ Kategori created')

  // 7. Create Master Barang (Following Generator Logic: NAM-KAT)
  const masterBarangSeeds = [
    { name: 'Lego Duplo 100pcs', kat: 'APE', sat: 'set', hrg: 450000, merk: 'LEGO', min: 2 },
    { name: 'Puzzle Kayu Hijaiyah', kat: 'APE', sat: 'pcs', hrg: 35000, merk: 'Local Artisans', min: 10 },
    { name: 'Balok Kayu Warna 50pcs', kat: 'APE', sat: 'set', hrg: 120000, merk: 'Joyo Toy', min: 5 },
    { name: 'Perosotan Plastik Medium', kat: 'APE1', sat: 'unit', hrg: 1200000, merk: 'Labeille', min: 1 },
    { name: 'Ayunan Duduk 2 Kursi', kat: 'APE1', sat: 'unit', hrg: 2500000, merk: 'Bestway', min: 1 },
    { name: 'Meja Belajar Anak Persegi', kat: 'MEU', sat: 'unit', hrg: 350000, merk: 'IKEA', min: 4 },
    { name: 'Kursi Anak Plastik Warna', kat: 'MEU', sat: 'unit', hrg: 85000, merk: 'Lion Star', min: 20 },
    { name: 'Lemari Loker 12 Pintu', kat: 'MEU', sat: 'unit', hrg: 1800000, merk: 'Alba', min: 1 },
    { name: 'Kasur Busa Day Care', kat: 'MEU', sat: 'unit', hrg: 400000, merk: 'Inoac', min: 5 },
    { name: 'Speaker Portable 12 Inch', kat: 'ELE', sat: 'unit', hrg: 1500000, merk: 'Polytron', min: 2 },
    { name: 'Smart TV 43 Inch', kat: 'ELE', sat: 'unit', hrg: 4200000, merk: 'Samsung', min: 1 },
    { name: 'AC Split 1/2 PK', kat: 'ELE', sat: 'unit', hrg: 3200000, merk: 'Sharp', min: 2 },
    { name: 'Bola Plastik 100pcs', kat: 'OLA', sat: 'karung', hrg: 150000, merk: 'Bestway', min: 5 },
    { name: 'Keyboard Yamaha', kat: 'KES1', sat: 'unit', hrg: 2200000, merk: 'Yamaha', min: 1 },
    { name: 'Set Perkusi Anak', kat: 'KES1', sat: 'set', hrg: 450000, merk: 'Stagg', min: 2 },
    { name: 'Seri Cerita Nabi 25 Judul', kat: 'BUK', sat: 'set', hrg: 750000, merk: 'Mizan', min: 3 },
    { name: 'Peralatan UKS Lengkap', kat: 'KES', sat: 'set', hrg: 850000, merk: 'Onemed', min: 1 },
    { name: 'Pipa PVC', kat: 'KES', sat: 'batang', hrg: 45000, merk: 'Wavin', min: 10 },
    { name: 'Rice Cooker', kat: 'ELE', sat: 'unit', hrg: 550000, merk: 'Miyako', min: 2 },
    { name: 'Printer L3110', kat: 'ELE', sat: 'unit', hrg: 2400000, merk: 'Epson', min: 1 },
    { name: 'Rak Sepatu Kayu', kat: 'MEU', sat: 'unit', hrg: 250000, merk: 'Olimpic', min: 3 },
    { name: 'Vacuum Cleaner', kat: 'ELE', sat: 'unit', hrg: 1100000, merk: 'Denpoo', min: 1 },
    { name: 'Dispenser Galon Atas', kat: 'ELE', sat: 'unit', hrg: 850000, merk: 'Cosmos', min: 2 },
    { name: 'Kipas Angin Dinding', kat: 'ELE', sat: 'unit', hrg: 320000, merk: 'Maspion', min: 5 },
  ]

  const masterBarangs: any[] = []
  const usedMasterKodes = new Set<string>()

  for (const s of masterBarangSeeds) {
    const nameClean = s.name.replace(/[^A-Za-z]/g, '')
    let namePart = nameClean.substring(0, 3).toUpperCase().padEnd(3, 'X')
    let katPart = s.kat.substring(0, 3).toUpperCase().padEnd(3, 'X')

    let kode = `${namePart}-${katPart}`
    let counter = 1
    while (usedMasterKodes.has(kode)) {
      kode = `${namePart}-${katPart}${counter++}`
    }
    usedMasterKodes.add(kode)

    masterBarangs.push({
      kodeMaster: kode,
      namaBarang: s.name,
      kategoriId: s.kat,
      satuan: s.sat,
      hargaSatuan: s.hrg,
      merk: s.merk,
      reorderPoint: s.min
    })
  }

  await prisma.masterBarang.createMany({ data: masterBarangs })
  const allMasterKeys = masterBarangs.map(m => m.kodeMaster)
  console.log(`✅ ${masterBarangs.length} Master Barang created`)

  // 8. Create Unit Barang (Following Generator Logic: MASTER-SEQ)
  console.log('📦 Seeding 360+ Unit Barang...')
  const units: any[] = []

  // Distribusi Unit: 360 Aktif, 40 Dipinjam, 25 Rusak
  const unitDist = [
    { count: 390, status: 'baik' },
    { count: 6, status: 'dipinjam' },
    { count: 25, status: 'rusak' }
  ]

  let totalUnitCount = 0
  for (const dist of unitDist) {
    for (let i = 0; i < dist.count; i++) {
      const masterId = allMasterKeys[totalUnitCount % masterBarangs.length]
      totalUnitCount++

      // Count existing units for this master to gen sequence
      const seq = units.filter(u => u.masterBarangId === masterId).length + 1

      units.push({
        kodeUnit: `${masterId}-${String(seq).padStart(3, '0')}`,
        masterBarangId: masterId,
        ruangId: (totalUnitCount % 12) + 1,
        status: dist.status,
        createdBy: petugasUser.id,
        isActive: true
      })
    }
  }

  await prisma.unitBarang.createMany({ data: units })
  const createdUnits = await prisma.unitBarang.findMany()
  console.log(`✅ ${createdUnits.length} Unit Barang created`)

  // Helper Tanggal Modulus 2026
  const getModulusDate = (i: number) => new Date(2026, i % 12, (i % 28) + 1)
  const formatDateStr = (date: Date) => {
    return date.getFullYear() + 
           String(date.getMonth() + 1).padStart(2, '0') + 
           String(date.getDate()).padStart(2, '0');
  }

  // 9. Transaksi Barang (Pengadaan) - 60 Records
  console.log('📈 Seeding 60 Transaksi Barang (Yearly Pattern)...')
  for (let i = 1; i <= 60; i++) {
    const status = i % 10 === 0 ? 'pending' : 'approved'
    const tgl = getModulusDate(i)
    await prisma.transaksiBarang.create({
      data: {
        kodeTransaksi: `TRX-PENGADAAN-${formatDateStr(tgl)}-${String(i).padStart(3, '0')}`,
        masterBarangId: allMasterKeys[i % 24],
        tanggalTransaksi: tgl,
        totalPesanan: Math.floor(Math.random() * 5) + 1,
        penanggungJawab: 'Mas Budi',
        userId: petugasUser.id,
        approvalStatus: status as any,
        approvedBy: status === 'approved' ? kepsekUser.id : null,
        approvedAt: status === 'approved' ? tgl : null,
        ruangTujuanId: (i % 12) + 1
      }
    })
  }

  // 10. Transaksi Keluar (Pengelolaan) - 50 Records
  console.log('📉 Seeding 50 Transaksi Keluar (Yearly Pattern)...')
  
  // Get units by status for precise stats
  const dipinjamUnits = createdUnits.filter(u => u.status === 'dipinjam')
  const baikUnits = createdUnits.filter(u => u.status === 'baik')
  
  // Target: 6 Aktif (Dipinjam), 13 Selesai (Baik) -> Total 19 Approved Loan
  for (let i = 1; i <= 50; i++) {
    const tgl = getModulusDate(i)
    let type: string = 'pemindahan'
    let status: string = 'approved'
    let unitId = createdUnits[i % createdUnits.length].kodeUnit

    if (i <= 6) {
      // 6 Approved Loan (Aktif)
      type = 'peminjaman'
      status = 'approved'
      unitId = dipinjamUnits[i - 1].kodeUnit
    } else if (i <= 19) {
      // 13 Approved Loan (Selesai/Returned)
      type = 'peminjaman'
      status = 'approved'
      unitId = baikUnits[i % baikUnits.length].kodeUnit
    } else if (i <= 25) {
      // 6 Pending Loan (Matches dashboard pending count)
      type = 'peminjaman'
      status = 'pending'
    } else {
      // Sisanya random tipe lain
      const otherTypes = ['pemindahan', 'penggunaan', 'penghapusan']
      type = otherTypes[i % 3]
      status = i % 10 === 0 ? 'pending' : 'approved'
    }

    await prisma.transaksiKeluar.create({
      data: {
        kodeTransaksi: `TRX-ASET-${formatDateStr(tgl)}-${String(i).padStart(3, '0')}`,
        unitBarangId: unitId,
        ruangAsalId: (i % 12) + 1,
        ruangTujuanId: ((i + 1) % 12) + 1,
        tipe: type as any,
        tanggalTransaksi: tgl,
        penerima: 'Guru/Staf',
        userId: petugasUser.id,
        approvalStatus: status as any,
        approvedBy: status === 'approved' ? adminUser.id : null,
        approvedAt: status === 'approved' ? tgl : null
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
