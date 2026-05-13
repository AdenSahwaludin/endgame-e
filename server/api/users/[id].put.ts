import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.EDIT_USERS)
  
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID User tidak valid' })

  const body = await readBody(event)
  
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' })

  if (body.email && body.email !== existing.email) {
    const emailUsed = await prisma.user.findUnique({ where: { email: body.email } })
    if (emailUsed) throw createError({ statusCode: 400, statusMessage: 'Email sudah digunakan oleh user lain' })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email,
      roleId: body.roleId,
      isActive: body.isActive,
    },
    select: { id: true, name: true, email: true, isActive: true, role: true }
  })

  await logAktivitas({ 
    userId, 
    jenis: 'update', 
    deskripsi: `User ${updated.name} diperbarui oleh Admin`, 
    namaTabel: 'users', 
    recordId: String(updated.id) 
  })

  return updated
})
