export default defineEventHandler(async (event) => {
  await requirePermission(event, 'view_unit_barangs')

  const units = await prisma.unitBarang.findMany({
    where: { isActive: true },
    select: {
      masterBarang: {
        select: {
          kategori: {
            select: { namaKategori: true }
          }
        }
      }
    }
  })

  const counts: Record<string, number> = {}
  units.forEach(u => {
    const name = u.masterBarang.kategori.namaKategori
    counts[name] = (counts[name] || 0) + 1
  })

  return Object.entries(counts).map(([label, count]) => ({ label, count }))
})
