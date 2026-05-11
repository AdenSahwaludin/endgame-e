export default defineEventHandler(async (event) => {
  await requirePermission(event, 'view_unit_barangs')

  const ruangs = await prisma.ruang.findMany({
    include: {
      _count: {
        select: {
          unitBarang: {
            where: { isActive: true, status: { not: 'dihapus' } }
          }
        }
      }
    }
  })

  return ruangs.map(r => ({
    label: r.namaRuang,
    count: r._count.unitBarang
  })).filter(r => r.count > 0)
})
