import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.BACKUP_DATABASE)
  
  // Ambil semua data dari semua tabel utama
  // Menggunakan pendekatan manual untuk fleksibilitas maksimal tanpa ketergantungan mysqldump
  const [
    users, roles, permissions, rolePermissions,
    kategori, ruang, masterBarang, unitBarang,
    transaksiBarang, transaksiKeluar, barangRusak,
    mutasiLokasi, logAktivitasData
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.role.findMany(),
    prisma.permission.findMany(),
    prisma.rolePermission.findMany(),
    prisma.kategori.findMany(),
    prisma.ruang.findMany(),
    prisma.masterBarang.findMany(),
    prisma.unitBarang.findMany(),
    prisma.transaksiBarang.findMany(),
    prisma.transaksiKeluar.findMany(),
    prisma.barangRusak.findMany(),
    prisma.mutasiLokasi.findMany(),
    prisma.logAktivitas.findMany(),
  ])

  const backupData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: {
      users, roles, permissions, rolePermissions,
      kategori, ruang, masterBarang, unitBarang,
      transaksiBarang, transaksiKeluar, barangRusak,
      mutasiLokasi, logAktivitas: logAktivitasData
    }
  }

  const filename = `backup_inventaris_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  
  setResponseHeader(event, 'Content-Type', 'application/json')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)

  return JSON.stringify(backupData, null, 2)
})
