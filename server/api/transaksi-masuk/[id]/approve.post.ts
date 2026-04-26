/**
 * Approve Transaksi Masuk — auto-generate units dari distribusiLokasi.
 * (Replaces TransaksiBarangObserver.handleApproval)
 */
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.APPROVE_TRANSAKSI_BARANGS)
  const id = parseInt(getRouterParam(event, 'id')!)

  const transaksi = await prisma.transaksiBarang.findUnique({ where: { id } })
  if (!transaksi) throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })
  if (transaksi.approvalStatus !== 'pending') {
    throw createError({ statusCode: 400, statusMessage: 'Transaksi sudah diproses sebelumnya' })
  }

  const distribusiLokasi = (transaksi.distribusiLokasi as any[]) || []

  await prisma.$transaction(async (tx) => {
    // Update transaksi status
    await tx.transaksiBarang.update({
      where: { id },
      data: { approvalStatus: 'approved', approvedBy: userId, approvedAt: new Date() },
    })

    // Generate unit barang for each ruang in distribusi
    for (const dist of distribusiLokasi) {
      const ruangId = dist.ruangId
      const jumlah = dist.jumlah || 0
      if (!ruangId || jumlah <= 0) continue

      for (let i = 0; i < jumlah; i++) {
        const kodeUnit = await generateKodeUnit(transaksi.masterBarangId)
        await tx.unitBarang.create({
          data: {
            kodeUnit,
            masterBarangId: transaksi.masterBarangId,
            ruangId,
            status: 'baik',
            isActive: true,
            tanggalPembelian: transaksi.tanggalTransaksi,
            catatan: `Auto-generated dari transaksi: ${transaksi.kodeTransaksi}`,
            createdBy: userId,
          },
        })
      }
    }
  })

  const totalJumlah = distribusiLokasi.reduce((sum: number, d: any) => sum + (d.jumlah || 0), 0)
  await logAktivitas({
    userId,
    jenis: 'update',
    deskripsi: `Transaksi ${transaksi.kodeTransaksi} disetujui. ${totalJumlah} unit dibuat.`,
    namaTabel: 'transaksi_barang',
    recordId: String(id),
  })

  return { success: true, message: `${totalJumlah} unit barang berhasil dibuat` }
})
