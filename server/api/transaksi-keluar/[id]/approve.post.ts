/**
 * Approve Transaksi Keluar — update unit status berdasarkan tipe.
 * (Replaces TransaksiKeluarObserver.handleApproval)
 */
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.APPROVE_TRANSAKSI_KELUARS)
  const id = parseInt(getRouterParam(event, 'id')!)

  const transaksi = await prisma.transaksiKeluar.findUnique({ where: { id } })
  if (!transaksi || transaksi.approvalStatus !== 'pending') {
    throw createError({ statusCode: 400, statusMessage: 'Transaksi tidak valid' })
  }

  await prisma.$transaction(async (tx) => {
    await tx.transaksiKeluar.update({
      where: { id },
      data: { approvalStatus: 'approved', approvedBy: userId, approvedAt: new Date() },
    })

    if (transaksi.tipe === 'pemindahan' && transaksi.ruangTujuanId) {
      // Pemindahan: pindah ruang, status tetap baik
      await tx.unitBarang.update({
        where: { kodeUnit: transaksi.unitBarangId },
        data: { ruangId: transaksi.ruangTujuanId, status: 'baik' },
      })
      // Log mutasi lokasi
      await tx.mutasiLokasi.create({
        data: {
          unitBarangId: transaksi.unitBarangId,
          ruangAsalId: transaksi.ruangAsalId,
          ruangTujuanId: transaksi.ruangTujuanId,
          tanggalMutasi: new Date(),
          userId,
          tipeMutasi: 'transaksi_keluar',
          keterangan: `Pemindahan via ${transaksi.kodeTransaksi}`,
        },
      })
    } else if (transaksi.tipe === 'penghapusan') {
      await tx.unitBarang.update({
        where: { kodeUnit: transaksi.unitBarangId },
        data: { status: 'dihapus', isActive: false },
      })
    } else {
      // peminjaman / penggunaan → status dipinjam
      await tx.unitBarang.update({
        where: { kodeUnit: transaksi.unitBarangId },
        data: { status: 'dipinjam' },
      })
    }
  })

  await logAktivitas({ userId, jenis: 'update', deskripsi: `Pengelolaan aset ${transaksi.kodeTransaksi} disetujui (${transaksi.tipe})`, namaTabel: 'transaksi_keluar', recordId: String(id) })
  return { success: true }
})
