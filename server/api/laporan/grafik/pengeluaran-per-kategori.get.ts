export default defineEventHandler(async (event) => {
  await requirePermission(event, 'view_transaksi_barangs')

  const query = getQuery(event)
  const tahun = parseInt(query.tahun as string) || new Date().getFullYear()

  const transaksis = await prisma.transaksiBarang.findMany({
    where: {
      approvalStatus: 'approved',
      tanggalTransaksi: {
        gte: new Date(`${tahun}-01-01`),
        lte: new Date(`${tahun}-12-31`)
      }
    },
    include: {
      masterBarang: {
        include: { kategori: true }
      }
    }
  })

  const categorySpending: Record<string, number> = {}
  transaksis.forEach(t => {
    const catName = t.masterBarang.kategori.namaKategori
    const total = t.totalPesanan * Number(t.masterBarang.hargaSatuan || 0)
    categorySpending[catName] = (categorySpending[catName] || 0) + total
  })

  return Object.entries(categorySpending).map(([label, total]) => ({
    label,
    total
  }))
})
