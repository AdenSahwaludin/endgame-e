export default defineEventHandler(async (event) => {
  await requirePermission(event, 'view_barang_rusaks')

  const query = getQuery(event)
  const tahun = parseInt(query.tahun as string) || new Date().getFullYear()

  const reports = await prisma.barangRusak.findMany({
    where: {
      tanggalKejadian: {
        gte: new Date(`${tahun}-01-01`),
        lte: new Date(`${tahun}-12-31`)
      }
    }
  })

  const monthlyCounts = Array(12).fill(0)
  reports.forEach(r => {
    const month = new Date(r.tanggalKejadian).getMonth()
    monthlyCounts[month] += 1
  })

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return monthlyCounts.map((count, i) => ({
    label: monthNames[i],
    count
  }))
})
