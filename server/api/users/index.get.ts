import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.VIEW_USERS)
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, email: true, isActive: true, role: true, createdAt: true },
      skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: { deletedAt: null } }),
  ])
  return { data, total, page, limit }
})
