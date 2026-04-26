export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.CREATE_TRANSAKSI_BARANGS)
  const body = await readBody(event)

  if (!body.masterBarangId) throw createError({ statusCode: 400, statusMessage: 'Master barang wajib dipilih' })

  const kodeTransaksi = await generateKodeTransaksiMasuk()
  const distribusiLokasi = body.distribusiLokasi || []
  const totalPesanan = distribusiLokasi.reduce((sum: number, d: any) => sum + (d.jumlah || 0), 0)

  const transaksi = await prisma.transaksiBarang.create({
    data: {
      kodeTransaksi,
      masterBarangId: body.masterBarangId,
      distribusiLokasi,
      tanggalTransaksi: body.tanggalTransaksi ? new Date(body.tanggalTransaksi) : new Date(),
      totalPesanan,
      penanggungJawab: body.penanggungJawab || null,
      keterangan: body.keterangan || null,
      userId,
      approvalStatus: 'pending',
    },
    include: { masterBarang: true },
  })

  await logAktivitas({ userId, jenis: 'create', deskripsi: `Transaksi masuk ${kodeTransaksi} dibuat`, namaTabel: 'transaksi_barang', recordId: String(transaksi.id) })
  return transaksi
})
