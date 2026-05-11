export default defineEventHandler(async (event) => {
  await requirePermission(event, 'view_transaksi_keluars')

  const result = await prisma.transaksiKeluar.groupBy({
    by: ['tipe'],
    _count: { id: true },
    where: { approvalStatus: 'approved' }
  })

  return result.map(r => ({
    label: r.tipe,
    count: r._count.id
  }))
})
