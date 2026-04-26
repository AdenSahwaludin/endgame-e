export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  await requirePermission(event, PERMISSIONS.CREATE_TRANSAKSI_KELUARS);

  const id = parseInt(getRouterParam(event, "id") || "0");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID transaksi tidak valid",
    });
  }

  const transaksi = await prisma.transaksiKeluar.findUnique({ where: { id } });
  if (!transaksi) {
    throw createError({
      statusCode: 404,
      statusMessage: "Transaksi tidak ditemukan",
    });
  }

  if (transaksi.approvalStatus !== "approved") {
    throw createError({
      statusCode: 400,
      statusMessage: "Hanya transaksi approved yang bisa dikembalikan",
    });
  }

  if (!["peminjaman", "penggunaan"].includes(transaksi.tipe)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tipe transaksi ini tidak membutuhkan pengembalian",
    });
  }

  const unit = await prisma.unitBarang.findUnique({
    where: { kodeUnit: transaksi.unitBarangId },
  });
  if (!unit) {
    throw createError({
      statusCode: 404,
      statusMessage: "Unit barang tidak ditemukan",
    });
  }

  if (unit.status !== "dipinjam") {
    throw createError({
      statusCode: 400,
      statusMessage: "Unit barang sudah tidak berstatus dipinjam",
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.unitBarang.update({
      where: { kodeUnit: transaksi.unitBarangId },
      data: {
        status: "baik",
        ...(transaksi.ruangAsalId ? { ruangId: transaksi.ruangAsalId } : {}),
      },
    });

    if (transaksi.ruangAsalId) {
      await tx.mutasiLokasi.create({
        data: {
          unitBarangId: transaksi.unitBarangId,
          ruangAsalId: unit.ruangId,
          ruangTujuanId: transaksi.ruangAsalId,
          tanggalMutasi: new Date(),
          tipeMutasi: "pengembalian",
          keterangan: `Pengembalian unit dari transaksi ${transaksi.kodeTransaksi}`,
          userId,
        },
      });
    }
  });

  await logAktivitas({
    userId,
    jenis: "update",
    namaTabel: "transaksi_keluar",
    recordId: String(id),
    deskripsi: `Unit ${transaksi.unitBarangId} dikembalikan dari transaksi ${transaksi.kodeTransaksi}`,
    perubahanData: {
      fromStatus: "dipinjam",
      toStatus: "baik",
      ruangAsalId: transaksi.ruangAsalId,
    },
  });

  return { success: true };
});
