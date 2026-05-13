import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.BACKUP_DATABASE)
  
  const files = await readMultipartFormData(event)
  if (!files || files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'File backup tidak ditemukan' })
  }

  const backupFile = files[0]
  let backupContent: any
  
  try {
    backupContent = JSON.parse(backupFile.data.toString())
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: 'Format file tidak valid' })
  }

  if (!backupContent.data) {
    throw createError({ statusCode: 400, statusMessage: 'Struktur data backup tidak valid' })
  }

  const d = backupContent.data

  // Restore logic: Delete all current data and insert from backup
  // Urutan penghapusan penting karena foreign key (terbalik dari dependensi)
  // Catatan: Ini adalah operasi destruktif
  
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete current data
      await tx.logAktivitas.deleteMany()
      await tx.mutasiLokasi.deleteMany()
      await tx.barangRusak.deleteMany()
      await tx.transaksiKeluar.deleteMany()
      await tx.transaksiBarang.deleteMany()
      await tx.unitBarang.deleteMany()
      await tx.masterBarang.deleteMany()
      await tx.ruang.deleteMany()
      await tx.kategori.deleteMany()
      await tx.rolePermission.deleteMany()
      await tx.permission.deleteMany()
      await tx.user.deleteMany()
      await tx.role.deleteMany()

      // 2. Insert from backup (Urutan penting)
      if (d.roles?.length) await tx.role.createMany({ data: d.roles })
      if (d.users?.length) await tx.user.createMany({ data: d.users })
      if (d.permissions?.length) await tx.permission.createMany({ data: d.permissions })
      if (d.rolePermissions?.length) await tx.rolePermission.createMany({ data: d.rolePermissions })
      if (d.kategori?.length) await tx.kategori.createMany({ data: d.kategori })
      if (d.ruang?.length) await tx.ruang.createMany({ data: d.ruang })
      if (d.masterBarang?.length) await tx.masterBarang.createMany({ data: d.masterBarang })
      if (d.unitBarang?.length) await tx.unitBarang.createMany({ data: d.unitBarang })
      if (d.transaksiBarang?.length) await tx.transaksiBarang.createMany({ data: d.transaksiBarang })
      if (d.transaksiKeluar?.length) await tx.transaksiKeluar.createMany({ data: d.transaksiKeluar })
      if (d.barangRusak?.length) await tx.barangRusak.createMany({ data: d.barangRusak })
      if (d.mutasiLokasi?.length) await tx.mutasiLokasi.createMany({ data: d.mutasiLokasi })
      if (d.logAktivitas?.length) await tx.logAktivitas.createMany({ data: d.logAktivitas })
    })

    await logAktivitas({ 
      userId, 
      jenis: 'update', 
      deskripsi: `Sistem di-restore dari file ${backupFile.filename} oleh Admin`, 
      namaTabel: 'system' 
    })

    return { message: 'Data sistem berhasil dipulihkan' }
  } catch (error: any) {
    console.error('Restore error:', error)
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Gagal memulihkan data: ${error.message}` 
    })
  }
})
