export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.CREATE_TRANSAKSI_KELUARS)
  const body = await readBody(event)

  if (!body.unitBarangId || !body.tipe) throw createError({ statusCode: 400, statusMessage: 'Unit barang dan tipe wajib diisi' })

  const unit = await prisma.unitBarang.findUnique({ where: { kodeUnit: body.unitBarangId } })
  if (!unit || !unit.isActive || unit.status !== 'baik') {
    throw createError({ statusCode: 400, statusMessage: 'Unit barang tidak tersedia untuk transaksi' })
  }

  const kodeTransaksi = await generateKodeTransaksiKeluar()

  const transaksi = await prisma.$transaction(async (tx) => {
    const t = await tx.transaksiKeluar.create({
      data: {
        kodeTransaksi,
        unitBarangId: body.unitBarangId,
        ruangAsalId: unit.ruangId,
        ruangTujuanId: body.ruangTujuanId || null,
        tipe: body.tipe,
        tanggalTransaksi: body.tanggalTransaksi ? new Date(body.tanggalTransaksi) : new Date(),
        penerima: body.penerima || null,
        tujuan: body.tujuan || null,
        keterangan: body.keterangan || null,
        catatan: body.catatan || null,
        userId,
        approvalStatus: 'approved',
        approvedBy: userId,
        approvedAt: new Date(),
      },
      include: { unitBarang: true },
    })

    // Langsung update status unit sesuai tipe (logic dari approve.post.ts)
    if (body.tipe === 'pemindahan' && body.ruangTujuanId) {
      await tx.unitBarang.update({
        where: { kodeUnit: body.unitBarangId },
        data: { ruangId: body.ruangTujuanId, status: 'baik' },
      })
      await tx.mutasiLokasi.create({
        data: {
          unitBarangId: body.unitBarangId,
          ruangAsalId: unit.ruangId,
          ruangTujuanId: body.ruangTujuanId,
          tanggalMutasi: new Date(),
          userId,
          tipeMutasi: 'transaksi_keluar',
          keterangan: `Pemindahan via ${kodeTransaksi}`,
        },
      })
    } else if (body.tipe === 'penghapusan') {
      await tx.unitBarang.update({
        where: { kodeUnit: body.unitBarangId },
        data: { status: 'dihapus', isActive: false },
      })
    } else {
      // peminjaman / penggunaan → status dipinjam
      await tx.unitBarang.update({
        where: { kodeUnit: body.unitBarangId },
        data: { status: 'dipinjam' },
      })
    }

    return t
  })

  await logAktivitas({ userId, jenis: 'create', deskripsi: `Pengelolaan aset ${kodeTransaksi} dibuat (Otomatis Approved)`, namaTabel: 'transaksi_keluar', recordId: String(transaksi.id) })
  return transaksi
})
