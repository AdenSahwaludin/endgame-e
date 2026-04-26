export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.EDIT_KATEGORIS)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const kategori = await prisma.kategori.update({
    where: { kodeKategori: id },
    data: {
      namaKategori: body.namaKategori,
      deskripsi: body.deskripsi,
    },
  })

  await logAktivitas({ userId, jenis: 'update', deskripsi: `Kategori ${kategori.namaKategori} diupdate`, namaTabel: 'kategori', recordId: id })
  return kategori
})
