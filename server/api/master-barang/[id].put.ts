export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.EDIT_MASTER_BARANGS)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const master = await prisma.masterBarang.update({
    where: { kodeMaster: id },
    data: {
      namaBarang: body.namaBarang,
      kategoriId: body.kategoriId,
      satuan: body.satuan,
      merk: body.merk,
      hargaSatuan: body.hargaSatuan,
      reorderPoint: body.reorderPoint,
      deskripsi: body.deskripsi,
    },
  })

  await logAktivitas({ userId, jenis: 'update', deskripsi: `Master barang ${master.namaBarang} diupdate`, namaTabel: 'master_barang', recordId: id })
  return master
})
