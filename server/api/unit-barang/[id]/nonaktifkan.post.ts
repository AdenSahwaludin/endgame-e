/** Nonaktifkan unit barang (replaces UnitBarangObserver.deleting) */
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.NONAKTIFKAN_UNIT_BARANGS)
  const id = getRouterParam(event, 'id')!

  await prisma.unitBarang.update({
    where: { kodeUnit: id },
    data: { status: 'dihapus', isActive: false },
  })

  await logAktivitas({ userId, jenis: 'update', deskripsi: `Unit ${id} dinonaktifkan`, namaTabel: 'unit_barang', recordId: id })
  return { success: true }
})
