import bcrypt from 'bcryptjs'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.EDIT_USERS)
  
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID User tidak valid' })

  const body = await readBody(event)
  const newPassword = body.password || 'Password123!' // Default password if not provided
  
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' })

  const hashedPassword = await bcrypt.hash(newPassword, 12)
  
  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword }
  })

  await logAktivitas({ 
    userId, 
    jenis: 'update', 
    deskripsi: `Password user ${user.name} direset oleh Admin`, 
    namaTabel: 'users', 
    recordId: String(user.id) 
  })

  return { message: `Password user ${user.name} berhasil direset` }
})
