export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.CREATE_KATEGORIS)
  const body = await readBody(event)

  if (!body.namaKategori) {
    throw createError({ statusCode: 400, statusMessage: 'Nama kategori wajib diisi' })
  }

  let kodeKategori = body.kodeKategori
  
  if (kodeKategori) {
    // Validasi kode custom
    if (kodeKategori.length < 2 || kodeKategori.length > 10) {
      throw createError({ statusCode: 400, statusMessage: 'Kode kategori harus 2-10 karakter' })
    }
    if (!/^[A-Z0-9-]+$/.test(kodeKategori)) {
      throw createError({ statusCode: 400, statusMessage: 'Kode kategori hanya boleh huruf kapital, angka, dan tanda hubung' })
    }

    const existing = await prisma.kategori.findUnique({
      where: { kodeKategori }
    })
    
    if (existing) {
      if (!existing.deletedAt) {
        throw createError({ statusCode: 400, statusMessage: 'Kode kategori sudah digunakan' })
      }

      // Restore data yang sudah dihapus
      const kategori = await prisma.kategori.update({
        where: { kodeKategori },
        data: {
          namaKategori: body.namaKategori,
          deskripsi: body.deskripsi || null,
          deletedAt: null,
        },
      })

      await logAktivitas({
        userId,
        jenis: 'create',
        deskripsi: `Kategori ${kategori.namaKategori} (${kategori.kodeKategori}) direstorasi dari data terhapus`,
        namaTabel: 'kategori',
        recordId: kategori.kodeKategori,
      })

      return kategori
    }
  } else {
    kodeKategori = await generateKodeKategori(body.namaKategori)
  }

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
    deskripsi: `Kategori ${kategori.namaKategori} (${kategori.kodeKategori}) dibuat`,
    namaTabel: 'kategori',
    recordId: kategori.kodeKategori,
  })

  return kategori
})
