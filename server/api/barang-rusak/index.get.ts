export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.VIEW_BARANG_RUSAKS)
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20

  const [data, total] = await Promise.all([
    prisma.barangRusak.findMany({
      include: { unitBarang: { include: { masterBarang: true } }, ruang: true, user: { select: { id: true, name: true } } },
      skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
    }),
    prisma.barangRusak.count(),
  ])
  return { data, total, page, limit }
})
