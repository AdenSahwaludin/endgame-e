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
    }
  })

  const monthlyCounts = Array(12).fill(0)
  transaksis.forEach(t => {
    const month = new Date(t.tanggalTransaksi).getMonth()
    monthlyCounts[month] += t.totalPesanan
  })

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return monthlyCounts.map((count, i) => ({
    label: monthNames[i],
    count
  }))
})
