export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.DELETE_RUANGS)
  const id = parseInt(getRouterParam(event, 'id')!)
  await prisma.ruang.update({ where: { id }, data: { deletedAt: new Date() } })
  await logAktivitas({ userId, jenis: 'delete', deskripsi: `Ruang ${id} dihapus`, namaTabel: 'ruang', recordId: String(id) })
  return { success: true }
})
