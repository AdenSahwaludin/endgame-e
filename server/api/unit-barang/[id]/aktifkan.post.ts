/** Aktifkan kembali unit barang */
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.NONAKTIFKAN_UNIT_BARANGS)
  const id = getRouterParam(event, 'id')!

  await prisma.unitBarang.update({
    where: { kodeUnit: id },
    data: { status: 'baik', isActive: true },
  })

  await logAktivitas({ userId, jenis: 'update', deskripsi: `Unit ${id} diaktifkan kembali`, namaTabel: 'unit_barang', recordId: id })
  return { success: true }
})
