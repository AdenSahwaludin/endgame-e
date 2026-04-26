export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.VIEW_MASTER_BARANGS)
  const id = getRouterParam(event, 'id')!

  const master = await prisma.masterBarang.findUnique({
    where: { kodeMaster: id },
    include: {
      kategori: true,
      unitBarang: { include: { ruang: true }, orderBy: { kodeUnit: 'asc' } },
    },
  })

  if (!master) throw createError({ statusCode: 404, statusMessage: 'Master barang tidak ditemukan' })
  return master
})
