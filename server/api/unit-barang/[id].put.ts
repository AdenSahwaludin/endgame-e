/**
 * Update Unit Barang — auto-logs mutasi lokasi jika ruangId berubah.
 * (Replaces UnitBarangObserver.updating)
 */
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.EDIT_UNIT_BARANGS)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const oldUnit = await prisma.unitBarang.findUnique({ where: { kodeUnit: id } })
  if (!oldUnit) throw createError({ statusCode: 404, statusMessage: 'Unit barang tidak ditemukan' })

  const newRuangId = body.ruangId ? parseInt(body.ruangId) : oldUnit.ruangId

  // If ruangId changed, log mutasi lokasi
  if (newRuangId !== oldUnit.ruangId) {
    await prisma.mutasiLokasi.create({
      data: {
        unitBarangId: id,
        ruangAsalId: oldUnit.ruangId,
        ruangTujuanId: newRuangId,
        tanggalMutasi: new Date(),
        userId,
        tipeMutasi: 'manual',
        keterangan: 'Mutasi ruang via admin panel',
      },
    })
  }

  const unit = await prisma.unitBarang.update({
    where: { kodeUnit: id },
    data: {
      ruangId: newRuangId,
      status: body.status || oldUnit.status,
      catatan: body.catatan !== undefined ? body.catatan : oldUnit.catatan,
    },
    include: { masterBarang: true, ruang: true },
  })

  await logAktivitas({
    userId,
    jenis: 'update',
    deskripsi: `Unit barang ${id} diupdate`,
    namaTabel: 'unit_barang',
    recordId: id,
    perubahanData: { old: { ruangId: oldUnit.ruangId, status: oldUnit.status }, new: { ruangId: newRuangId, status: body.status } },
  })

  return unit
})
