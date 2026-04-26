export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.VIEW_LOG_AKTIVITAS)
  const session = await getUserSession(event)
  const user = session.user as any
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20

  const where: any = {}
  // Petugas hanya bisa lihat log sendiri
  if (user.role === 'Petugas Inventaris') {
    where.userId = user.id
  }

  const [data, total] = await Promise.all([
    prisma.logAktivitas.findMany({
      where, include: { user: { select: { id: true, name: true } } },
      skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
    }),
    prisma.logAktivitas.count({ where }),
  ])
  return { data, total, page, limit }
})
