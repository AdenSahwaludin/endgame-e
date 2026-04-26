export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.APPROVE_TRANSAKSI_BARANGS)
  const id = parseInt(getRouterParam(event, 'id')!)
  const body = await readBody(event)

  const transaksi = await prisma.transaksiBarang.findUnique({ where: { id } })
  if (!transaksi || transaksi.approvalStatus !== 'pending') {
    throw createError({ statusCode: 400, statusMessage: 'Transaksi tidak valid untuk di-reject' })
  }

  await prisma.transaksiBarang.update({
    where: { id },
    data: { approvalStatus: 'rejected', approvedBy: userId, approvedAt: new Date(), approvalNotes: body.approvalNotes || null },
  })

  await logAktivitas({ userId, jenis: 'update', deskripsi: `Transaksi ${transaksi.kodeTransaksi} ditolak`, namaTabel: 'transaksi_barang', recordId: String(id) })
  return { success: true }
})
