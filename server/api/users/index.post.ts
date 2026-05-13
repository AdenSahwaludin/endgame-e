import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.CREATE_USERS)
  const body = await readBody(event)

  if (!body.name || !body.email || !body.password || !body.roleId) {
    throw createError({ statusCode: 400, statusMessage: 'Semua field wajib diisi' })
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } })
  
  if (existing && !existing.deletedAt) {
    throw createError({ statusCode: 400, statusMessage: 'Email sudah terdaftar dan aktif' })
  }

  const hashedPassword = await bcrypt.hash(body.password, 12)
  let user;

  if (existing && existing.deletedAt) {
    // Restore and update existing soft-deleted user
    user = await prisma.user.update({
      where: { id: existing.id },
      data: { 
        name: body.name, 
        password: hashedPassword, 
        roleId: body.roleId, 
        isActive: body.isActive ?? true,
        deletedAt: null 
      },
      select: { id: true, name: true, email: true, isActive: true, role: true },
    })
    await logAktivitas({ userId, jenis: 'update', deskripsi: `User ${user.name} dipulihkan (restore dari soft-delete)`, namaTabel: 'users', recordId: String(user.id) })
  } else {
    // Create new user
    user = await prisma.user.create({
      data: { name: body.name, email: body.email, password: hashedPassword, roleId: body.roleId, isActive: body.isActive ?? true },
      select: { id: true, name: true, email: true, isActive: true, role: true },
    })
    await logAktivitas({ userId, jenis: 'create', deskripsi: `User ${user.name} dibuat`, namaTabel: 'users', recordId: String(user.id) })
  }
  return user
})
