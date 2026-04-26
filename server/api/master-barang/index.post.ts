/**
 * Create Master Barang + Auto-generate UnitBarang dari distribusiLokasi.
 * (Replaces Laravel MasterBarangObserver.created)
 */
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.CREATE_MASTER_BARANGS)
  const body = await readBody(event)

  if (!body.namaBarang || !body.kategoriId) {
    throw createError({ statusCode: 400, statusMessage: 'Nama barang dan kategori wajib diisi' })
  }

  const kodeMaster = await generateKodeMaster(body.namaBarang, body.kategoriId)
  const distribusiLokasi: Array<{ ruangId: number; jumlah: number }> = body.distribusiLokasi || []

  // Create master barang in a transaction (with auto-generated units)
  const result = await prisma.$transaction(async (tx) => {
    const master = await tx.masterBarang.create({
      data: {
        kodeMaster,
        namaBarang: body.namaBarang,
        kategoriId: body.kategoriId,
        satuan: body.satuan || 'pcs',
        merk: body.merk || null,
        hargaSatuan: body.hargaSatuan || null,
        reorderPoint: body.reorderPoint || 0,
        deskripsi: body.deskripsi || null,
        distribusiLokasi: distribusiLokasi.length > 0 ? distribusiLokasi : undefined,
        createdBy: userId,
      },
    })

    // Auto-generate unit barang dari distribusi lokasi
    let unitCounter = 1
    for (const dist of distribusiLokasi) {
      const ruangId = dist.ruangId
      const jumlah = dist.jumlah || 0
      if (!ruangId || jumlah <= 0) continue

      for (let i = 0; i < jumlah; i++) {
        const kodeUnit = `${kodeMaster}-${String(unitCounter).padStart(3, '0')}`
        await tx.unitBarang.create({
          data: {
            kodeUnit,
            masterBarangId: kodeMaster,
            ruangId,
            status: 'baik',
            isActive: true,
            tanggalPembelian: new Date(),
            createdBy: userId,
          },
        })
        unitCounter++
      }
    }

    return { master, unitCount: unitCounter - 1 }
  })

  await logAktivitas({
    userId,
    jenis: 'create',
    deskripsi: `Master barang ${result.master.namaBarang} dibuat dengan ${result.unitCount} unit`,
    namaTabel: 'master_barang',
    recordId: kodeMaster,
    perubahanData: { namaBarang: body.namaBarang, jumlahUnit: result.unitCount, distribusiLokasi },
  })

  return result.master
})
