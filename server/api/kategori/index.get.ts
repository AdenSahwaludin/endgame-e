export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.VIEW_KATEGORIS)
  const query = getQuery(event)
  const search = (query.search as string) || ''
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20

  const where: any = { deletedAt: null }
  if (search) {
    where.OR = [
      { namaKategori: { contains: search, mode: 'insensitive' } },
      { kodeKategori: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.kategori.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.kategori.count({ where }),
  ])

  return { data, total, page, limit }
})
