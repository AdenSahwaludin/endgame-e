import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.DELETE_USERS)
  
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID User tidak valid' })

  const userToDelete = await prisma.user.findUnique({ where: { id } })
  if (!userToDelete) throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' })

  // Admin tidak bisa hapus diri sendiri dari sini
  if (userToDelete.id === userId) {
    throw createError({ statusCode: 400, statusMessage: 'Anda tidak dapat menghapus akun Anda sendiri' })
  }

  // Soft delete
  const deleted = await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false }
  })

  await logAktivitas({ 
    userId, 
    jenis: 'delete', 
    deskripsi: `User ${deleted.name} dihapus (soft delete) oleh Admin`, 
    namaTabel: 'users', 
    recordId: String(deleted.id) 
  })

  return { message: 'User berhasil dihapus' }
})
