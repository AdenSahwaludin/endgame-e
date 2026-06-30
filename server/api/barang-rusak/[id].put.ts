export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.CREATE_BARANG_RUSAKS)

  const id = parseInt(event.context.params?.id || '0')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const body = await readBody(event)
  const { status, keterangan, penanggungJawab } = body

  const report = await prisma.barangRusak.findUnique({
    where: { id },
    include: { unitBarang: true }
  })
  if (!report) throw createError({ statusCode: 404, statusMessage: 'Laporan tidak ditemukan' })

  const result = await prisma.$transaction(async (tx) => {
    const updatedReport = await tx.barangRusak.update({
      where: { id },
      data: {
        status: status || report.status,
        keterangan: keterangan !== undefined ? keterangan : report.keterangan,
        penanggungJawab: penanggungJawab !== undefined ? penanggungJawab : report.penanggungJawab,
      } as any
    })

    if (status === 'selesai_diperbaiki' && report.unitBarang.status === 'rusak') {
      await tx.unitBarang.update({
        where: { kodeUnit: report.unitBarangId },
        data: { status: 'baik', isActive: true }
      })
    } else if (status && status !== 'selesai_diperbaiki' && report.unitBarang.status !== 'rusak') {
      await tx.unitBarang.update({
        where: { kodeUnit: report.unitBarangId },
        data: { status: 'rusak', isActive: false }
      })
    }

    return updatedReport
  })

  return result
})
