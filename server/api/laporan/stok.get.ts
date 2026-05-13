import { buildOrderBy } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.GENERATE_LAPORAN)
  const query = getQuery(event)

  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20
  const search = (query.search as string) || ''
  const tipe = (query.tipe as string) || 'unit' // 'unit' | 'transaksi_keluar' | 'barang_rusak'
  const sortBy = (query.sortBy as string) || 'createdAt'
  const sortOrder = (query.sortOrder as string) === 'asc' ? 'asc' : 'desc'
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const status = query.status as string

  const skip = (page - 1) * limit

  // --- LAPORAN UNIT BARANG (Inventaris Stok Fisik) ---
  if (tipe === 'unit') {
    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { kodeUnit: { contains: search } },
        { masterBarang: { namaBarang: { contains: search } } },
        { ruang: { namaRuang: { contains: search } } },
      ]
    }
    const sortMap: Record<string, string> = {
      kode: 'kodeUnit',
      kodeUnit: 'kodeUnit',
      barang: 'masterBarang.namaBarang',
      kategori: 'masterBarang.kategori.namaKategori',
      ruang: 'ruang.namaRuang',
      status: 'status',
      aktif: 'isActive',
      createdAt: 'createdAt',
    }
    const orderByField = sortMap[sortBy] || 'createdAt'
    const [data, total] = await Promise.all([
      prisma.unitBarang.findMany({
        where,
        include: {
          masterBarang: { include: { kategori: true } },
          ruang: true,
        },
        ...(query.export ? {} : { skip, take: limit }),
        orderBy: buildOrderBy(orderByField, sortOrder),
      }),
      prisma.unitBarang.count({ where }),
    ])
    return { data, total, page, limit, tipe }
  }

  // --- LAPORAN TRANSAKSI KELUAR (Peminjaman / Pengelolaan Aset) ---
  if (tipe === 'transaksi_keluar') {
    const where: any = {}
    if (status) where.tipe = status
    if (search) {
      where.OR = [
        { kodeTransaksi: { contains: search } },
        { unitBarang: { masterBarang: { namaBarang: { contains: search } } } },
        { penerima: { contains: search } },
      ]
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
      tanggalTransaksi: 'tanggalTransaksi',
      kode: 'kodeTransaksi',
      kodeTransaksi: 'kodeTransaksi',
      tipe: 'tipe',
      barang: 'unitBarang.masterBarang.namaBarang',
      kategori: 'unitBarang.masterBarang.kategori.namaKategori',
      createdAt: 'createdAt',
    }
    const orderByField = sortMap[sortBy] || 'tanggalTransaksi'
    const [data, total] = await Promise.all([
      prisma.transaksiKeluar.findMany({
        where,
        include: {
          unitBarang: { include: { masterBarang: { include: { kategori: true } } } },
          ruangAsal: true,
          ruangTujuan: true,
          user: { select: { id: true, name: true } },
        },
        ...(query.export ? {} : { skip, take: limit }),
        orderBy: buildOrderBy(orderByField, sortOrder),
      }),
      prisma.transaksiKeluar.count({ where }),
    ])
    return { data, total, page, limit, tipe }
  }

  // --- LAPORAN BARANG RUSAK ---
  if (tipe === 'barang_rusak') {
    const where: any = {}
    if (search) {
      where.OR = [
        { unitBarangId: { contains: search } },
        { unitBarang: { masterBarang: { namaBarang: { contains: search } } } },
        { keterangan: { contains: search } },
      ]
    }
    if (startDate || endDate) {
      where.tanggalKejadian = {}
      if (startDate) where.tanggalKejadian.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.tanggalKejadian.lte = end
      }
    }
    const sortMap: Record<string, string> = {
      tanggal: 'tanggalKejadian',
      tanggalKejadian: 'tanggalKejadian',
      unit: 'unitBarangId',
      unitBarangId: 'unitBarangId',
      barang: 'unitBarang.masterBarang.namaBarang',
      kategori: 'unitBarang.masterBarang.kategori.namaKategori',
      ruang: 'ruang.namaRuang',
      pelapor: 'user.name',
      kerugian: 'kerugian_calc', // Placeholder for in-memory sort
      createdAt: 'createdAt',
    }
    const orderByField = sortMap[sortBy] || 'tanggalKejadian'

    // Special handling for in-memory sorting (Est. Kerugian)
    if (sortBy === 'kerugian') {
      const allRows = await prisma.barangRusak.findMany({
        where,
        include: {
          unitBarang: { include: { masterBarang: { include: { kategori: true } } } },
          ruang: true,
          user: { select: { id: true, name: true } },
        },
      })

      const sortedData = allRows.sort((a, b) => {
        const valA = Number(a.unitBarang.masterBarang.hargaSatuan || 0)
        const valB = Number(b.unitBarang.masterBarang.hargaSatuan || 0)
        return sortOrder === 'asc' ? valA - valB : valB - valA
      })

      const totalCount = sortedData.length
      const pagedData = sortedData.slice((page - 1) * limit, page * limit)

      return { data: pagedData, total: totalCount, page, limit, tipe }
    }

    const [data, total] = await Promise.all([
      prisma.barangRusak.findMany({
        where,
        include: {
          unitBarang: { include: { masterBarang: { include: { kategori: true } } } },
          ruang: true,
          user: { select: { id: true, name: true } },
        },
        ...(query.export ? {} : { skip, take: limit }),
        orderBy: buildOrderBy(orderByField, sortOrder),
      }),
      prisma.barangRusak.count({ where }),
    ])
    return { data, total, page, limit, tipe }
  }

  throw createError({ statusCode: 400, statusMessage: 'Tipe laporan tidak valid' })
})
