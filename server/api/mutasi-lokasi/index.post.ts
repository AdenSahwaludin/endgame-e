export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  await requirePermission(event, PERMISSIONS.CREATE_MUTASI_LOKASIS);

  const body = await readBody(event);
  const unitBarangId = String(body.unitBarangId || "");
  const ruangTujuanId = Number(body.ruangTujuanId);
  const tanggalMutasi = body.tanggalMutasi
    ? new Date(body.tanggalMutasi)
    : new Date();
  const tipeMutasi = String(body.tipeMutasi || "manual");
  const keterangan = body.keterangan ? String(body.keterangan) : null;

  if (!unitBarangId || !ruangTujuanId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unit barang dan ruang tujuan wajib diisi",
    });
  }

  const unit = await prisma.unitBarang.findUnique({
    where: { kodeUnit: unitBarangId },
    include: { ruang: true },
  });

  if (!unit) {
    throw createError({
      statusCode: 404,
      statusMessage: "Unit barang tidak ditemukan",
    });
  }

  if (!unit.isActive) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unit non-aktif tidak bisa dimutasi",
    });
  }

  const ruangTujuan = await prisma.ruang.findFirst({
    where: { id: ruangTujuanId, deletedAt: null },
  });
  if (!ruangTujuan) {
    throw createError({
      statusCode: 404,
      statusMessage: "Ruang tujuan tidak ditemukan",
    });
  }

  if (unit.ruangId === ruangTujuanId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ruang tujuan harus berbeda dari ruang saat ini",
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const mutasi = await tx.mutasiLokasi.create({
      data: {
        unitBarangId,
        ruangAsalId: unit.ruangId,
        ruangTujuanId,
        tanggalMutasi,
        tipeMutasi,
        keterangan,
        userId,
      },
      include: {
        unitBarang: { include: { masterBarang: true } },
        ruangAsal: true,
        ruangTujuan: true,
        user: { select: { id: true, name: true } },
      },
    });

    await tx.unitBarang.update({
      where: { kodeUnit: unitBarangId },
      data: {
        ruangId: ruangTujuanId,
        ...(tipeMutasi === "pengembalian"
          ? { status: "baik", isActive: true }
          : {}),
      },
    });

    return mutasi;
  });

  await logAktivitas({
    userId,
    jenis: "update",
    namaTabel: "mutasi_lokasi",
    recordId: String(result.id),
    deskripsi: `Mutasi unit ${unitBarangId} dari ruang ${unit.ruangId} ke ${ruangTujuanId}`,
    perubahanData: {
      ruangAsalId: unit.ruangId,
      ruangTujuanId,
      tanggalMutasi,
      tipeMutasi,
      keterangan,
    },
  });

  return result;
});
