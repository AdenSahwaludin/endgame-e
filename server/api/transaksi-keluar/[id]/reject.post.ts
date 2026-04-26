export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.APPROVE_TRANSAKSI_KELUARS)
  const id = parseInt(getRouterParam(event, 'id')!)
  const body = await readBody(event)

  await prisma.transaksiKeluar.update({
    where: { id },
    data: { approvalStatus: 'rejected', approvedBy: userId, approvedAt: new Date(), approvalNotes: body.approvalNotes || null },
  })

  await logAktivitas({ userId, jenis: 'update', deskripsi: `Transaksi keluar ${id} ditolak`, namaTabel: 'transaksi_keluar', recordId: String(id) })
  return { success: true }
})
