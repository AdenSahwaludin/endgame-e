export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.CREATE_TRANSAKSI_KELUARS)
  const body = await readBody(event)

  if (!body.unitBarangId || !body.tipe) throw createError({ statusCode: 400, statusMessage: 'Unit barang dan tipe wajib diisi' })

  const unit = await prisma.unitBarang.findUnique({ where: { kodeUnit: body.unitBarangId } })
  if (!unit || !unit.isActive || unit.status !== 'baik') {
    throw createError({ statusCode: 400, statusMessage: 'Unit barang tidak tersedia untuk transaksi' })
  }

  const kodeTransaksi = await generateKodeTransaksiKeluar()

  const transaksi = await prisma.transaksiKeluar.create({
    data: {
      kodeTransaksi,
      unitBarangId: body.unitBarangId,
      ruangAsalId: unit.ruangId,
      ruangTujuanId: body.ruangTujuanId || null,
      tipe: body.tipe,
      tanggalTransaksi: body.tanggalTransaksi ? new Date(body.tanggalTransaksi) : new Date(),
      penerima: body.penerima || null,
      tujuan: body.tujuan || null,
      keterangan: body.keterangan || null,
      catatan: body.catatan || null,
      userId,
      approvalStatus: 'pending',
    },
    include: { unitBarang: true },
  })

  await logAktivitas({ userId, jenis: 'create', deskripsi: `Pengelolaan aset ${kodeTransaksi} dibuat`, namaTabel: 'transaksi_keluar', recordId: String(transaksi.id) })
  return transaksi
})
