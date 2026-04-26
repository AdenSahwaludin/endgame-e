/**
 * Create Barang Rusak — auto-update unit status ke 'rusak'.
 * (Replaces BarangRusakObserver.created)
 */
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.CREATE_BARANG_RUSAKS)
  const body = await readBody(event)
  if (!body.unitBarangId) throw createError({ statusCode: 400, statusMessage: 'Unit barang wajib dipilih' })

  const unit = await prisma.unitBarang.findUnique({ where: { kodeUnit: body.unitBarangId } })
  if (!unit) throw createError({ statusCode: 404, statusMessage: 'Unit tidak ditemukan' })

  const result = await prisma.$transaction(async (tx) => {
    const report = await tx.barangRusak.create({
      data: {
        unitBarangId: body.unitBarangId,
        ruangId: unit.ruangId,
        tanggalKejadian: body.tanggalKejadian ? new Date(body.tanggalKejadian) : new Date(),
        keterangan: body.keterangan || null,
        penanggungJawab: body.penanggungJawab || null,
        userId,
      },
    })

    await tx.unitBarang.update({
      where: { kodeUnit: body.unitBarangId },
      data: { status: 'rusak', isActive: false },
    })

    return report
  })

  await logAktivitas({ userId, jenis: 'create', deskripsi: `Laporan barang rusak untuk unit ${body.unitBarangId}`, namaTabel: 'barang_rusak', recordId: String(result.id) })
  return result
})
