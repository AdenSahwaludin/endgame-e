export default defineEventHandler(async (event) => {
  await requirePermission(event, 'view_unit_barangs')

  const result = await prisma.unitBarang.groupBy({
    by: ['status'],
    _count: { status: true },
    where: { isActive: true }
  })

  return result.map(r => ({
    status: r.status,
    count: r._count.status
  }))
})
