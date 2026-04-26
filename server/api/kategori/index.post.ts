export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.CREATE_KATEGORIS)
  const body = await readBody(event)

  if (!body.namaKategori) {
    throw createError({ statusCode: 400, statusMessage: 'Nama kategori wajib diisi' })
  }

  const kodeKategori = body.kodeKategori || await generateKodeKategori(body.namaKategori)

  const kategori = await prisma.kategori.create({
    data: {
      kodeKategori,
      namaKategori: body.namaKategori,
      deskripsi: body.deskripsi || null,
    },
  })

  await logAktivitas({
    userId,
    jenis: 'create',
    deskripsi: `Kategori ${kategori.namaKategori} dibuat`,
    namaTabel: 'kategori',
    recordId: kategori.kodeKategori,
  })

  return kategori
})
