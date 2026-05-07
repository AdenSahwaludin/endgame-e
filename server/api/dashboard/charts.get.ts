import { requireAuth } from '../../utils/permissions'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  // 1. Doughnut Chart: UnitBarang by status
  const statusGroup = await prisma.unitBarang.groupBy({
    by: ['status'],
    _count: {
      status: true
    }
  })

  const statusCount = {
    baik: 0,
    dipinjam: 0,
    rusak: 0
  }

  statusGroup.forEach(item => {
    if (item.status === 'baik') statusCount.baik = item._count.status
    if (item.status === 'dipinjam') statusCount.dipinjam = item._count.status
    if (item.status === 'rusak') statusCount.rusak = item._count.status
  })

  // 2. Bar Chart: UnitBarang by Kategori (Top 5-7)
  const kategoris = await prisma.kategori.findMany({
    select: {
      namaKategori: true,
      masterBarang: {
        select: {
          _count: {
            select: { unitBarang: true }
          }
        }
      }
    }
  })

  let barData = kategoris.map(k => {
    const totalUnits = k.masterBarang.reduce((sum, mb) => sum + mb._count.unitBarang, 0)
    return {
      kategori: k.namaKategori,
      total: totalUnits
    }
  })

  // Sort descending and take top 7
  barData.sort((a, b) => b.total - a.total)
  barData = barData.slice(0, 7)

  return {
    doughnut: statusCount,
    bar: barData
  }
})
