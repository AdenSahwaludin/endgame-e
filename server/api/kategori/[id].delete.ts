export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.DELETE_KATEGORIS)
  const id = getRouterParam(event, 'id')!

  await prisma.kategori.update({
    where: { kodeKategori: id },
    data: { deletedAt: new Date() },
  })

  await logAktivitas({ userId, jenis: 'delete', deskripsi: `Kategori ${id} dihapus (soft)`, namaTabel: 'kategori', recordId: id })
  return { success: true }
})
