import { buildOrderBy } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.GENERATE_LAPORAN)
  const query = getQuery(event)

  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20
  const search = (query.search as string) || ''
  const sortBy = (query.sortBy as string) || 'tanggalTransaksi'
  const sortOrder = (query.sortOrder as string) === 'asc' ? 'asc' : 'desc'
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const kategoriId = query.kategoriId as string

  const skip = (page - 1) * limit

  const where: any = {
    approvalStatus: 'approved', // Hanya yang sudah disetujui
  }

  if (search) {
    where.OR = [
      { kodeTransaksi: { contains: search } },
      { masterBarang: { namaBarang: { contains: search } } },
      { masterBarang: { kategori: { namaKategori: { contains: search } } } },
    ]
  }

  if (kategoriId) {
    where.masterBarang = { ...where.masterBarang, kategoriId }
  }

  if (startDate || endDate) {
    where.tanggalTransaksi = {}
    if (startDate) where.tanggalTransaksi.gte = new Date(startDate)
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      where.tanggalTransaksi.lte = end
    }
  }

  const sortMap: Record<string, string> = {
    tanggal: 'tanggalTransaksi',
    kode: 'kodeTransaksi',
    barang: 'masterBarang.namaBarang',
    kategori: 'masterBarang.kategori.namaKategori',
    jumlah: 'totalPesanan',
    harga: 'masterBarang.hargaSatuan',
    total: 'calculated_total', // Placeholder for in-memory sort
    createdAt: 'createdAt',
    tanggalTransaksi: 'tanggalTransaksi',
  }
  const orderByField = sortMap[sortBy] || 'tanggalTransaksi'

  // Special handling for in-memory sorting (Total Pengeluaran)
  if (sortBy === 'total') {
    const allRows = await prisma.transaksiBarang.findMany({
      where,
      include: {
        masterBarang: { include: { kategori: true } },
        user: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
        ruangTujuan: true,
      },
    })

    const sortedData = allRows.sort((a, b) => {
      const valA = a.totalPesanan * Number(a.masterBarang.hargaSatuan || 0)
      const valB = b.totalPesanan * Number(b.masterBarang.hargaSatuan || 0)
      return sortOrder === 'asc' ? valA - valB : valB - valA
    })

    const totalCount = sortedData.length
    const pagedData = sortedData.slice((page - 1) * limit, page * limit)

    // Calculate grand total for summary
    const grandTotalAll = sortedData.reduce((acc, row) => {
      return acc + row.totalPesanan * Number(row.masterBarang.hargaSatuan || 0)
    }, 0)

    const grandTotal = pagedData.reduce((acc, row) => {
      return acc + row.totalPesanan * Number(row.masterBarang.hargaSatuan || 0)
    }, 0)

    return {
      data: pagedData,
      total: totalCount,
      page,
      limit,
      grandTotal,
      grandTotalAll
    }
  }

  const [rows, total] = await Promise.all([
    prisma.transaksiBarang.findMany({
      where,
      include: {
        masterBarang: { include: { kategori: true } },
        user: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
        ruangTujuan: true,
      },
      ...(query.export ? {} : { skip, take: limit }),
      orderBy: buildOrderBy(orderByField, sortOrder),
    }),
    prisma.transaksiBarang.count({ where }),
  ])

  // Kalkulasi grand total pengeluaran untuk halaman yang ditampilkan
  const grandTotal = rows.reduce((acc, row) => {
    const harga = Number(row.masterBarang.hargaSatuan || 0)
    return acc + row.totalPesanan * harga
  }, 0)

  // Kalkulasi grand total keseluruhan (tanpa pagination) untuk summary
  const allRows = await prisma.transaksiBarang.findMany({
    where,
    select: { totalPesanan: true, masterBarang: { select: { hargaSatuan: true } } },
  })
  const grandTotalAll = allRows.reduce((acc, row) => {
    return acc + row.totalPesanan * Number(row.masterBarang.hargaSatuan || 0)
  }, 0)

  return {
    data: rows,
    total,
    page,
    limit,
    grandTotal,       // Total pengeluaran pada halaman ini
    grandTotalAll,    // Total pengeluaran keseluruhan (semua halaman)
  }
})
