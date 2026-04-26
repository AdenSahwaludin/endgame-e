export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.VIEW_MUTASI_LOKASIS)
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20

  const [data, total] = await Promise.all([
    prisma.mutasiLokasi.findMany({
      include: { unitBarang: { include: { masterBarang: true } }, ruangAsal: true, ruangTujuan: true, user: { select: { id: true, name: true } } },
      skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
    }),
    prisma.mutasiLokasi.count(),
  ])
  return { data, total, page, limit }
})
