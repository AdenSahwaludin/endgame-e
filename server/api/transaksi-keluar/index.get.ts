export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.VIEW_TRANSAKSI_KELUARS);
  const query = getQuery(event);
  const search = (query.search as string) || "";
  const status = query.status as string;
  const page = parseInt(query.page as string) || 1;
    const sortBy = (query.sortBy as string) || "createdAt";
  const sortMap: Record<string, string> = {
    "kode": "kodeTransaksi",
    "tipe": "tipe",
    "tanggal": "tanggalTransaksi",
    "createdAt": "createdAt"
  };
  const orderByField = sortMap[sortBy] || "createdAt";
  const sortOrder = (query.sortOrder as string) === "asc" ? "asc" : "desc";
  const limit = parseInt(query.limit as string) || 20;
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;

  const where: any = {};
  if (status) where.approvalStatus = status;
  if (search) {
    where.OR = [
      { kodeTransaksi: { contains: search } },
      { tipe: { contains: search } },
      { unitBarang: { kodeUnit: { contains: search } } },
      {
        unitBarang: {
          masterBarang: {
            namaBarang: { contains: search },
          },
        },
      },
      { user: { name: { contains: search } } },
    ];
  }

  if (startDate || endDate) {
    where.tanggalTransaksi = {};
    if (startDate) where.tanggalTransaksi.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.tanggalTransaksi.lte = end;
    }
  }

  const [data, total] = await Promise.all([
    prisma.transaksiKeluar.findMany({
      where,
      include: {
        unitBarang: { include: { masterBarang: true } },
        ruangAsal: true,
        ruangTujuan: true,
        user: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [orderByField]: sortOrder },
    }),
    prisma.transaksiKeluar.count({ where }),
  ]);
  return { data, total, page, limit };
});
