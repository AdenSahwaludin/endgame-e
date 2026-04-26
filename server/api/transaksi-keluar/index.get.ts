export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.VIEW_TRANSAKSI_KELUARS)
  const query = getQuery(event)
  const status = query.status as string
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20
  const where: any = {}
  if (status) where.approvalStatus = status

  const [data, total] = await Promise.all([
    prisma.transaksiKeluar.findMany({
      where, include: { unitBarang: { include: { masterBarang: true } }, ruangAsal: true, ruangTujuan: true, user: { select: { id: true, name: true } }, approver: { select: { id: true, name: true } } },
      skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
    }),
    prisma.transaksiKeluar.count({ where }),
  ])
  return { data, total, page, limit }
})
