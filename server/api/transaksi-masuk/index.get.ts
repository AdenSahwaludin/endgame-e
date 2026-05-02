function buildOrderBy(sortBy: string, sortOrder: string) {
  if (!sortBy) return { createdAt: sortOrder };
  if (sortBy.includes('.')) {
    const parts = sortBy.split('.');
    let obj: any = {};
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = sortOrder;
    return obj;
  }
  return { [sortBy]: sortOrder };
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.VIEW_TRANSAKSI_BARANGS);
  const query = getQuery(event);
  const search = (query.search as string) || "";
  const status = query.status as string;
  const page = parseInt(query.page as string) || 1;
    const sortBy = (query.sortBy as string) || "createdAt";
  const sortMap: Record<string, string> = {
    "kode": "kodeTransaksi",
    "barang": "masterBarangId",
    "tanggal": "tanggalTransaksi",
    "createdAt": "createdAt"
  };
  const orderByField = sortMap[sortBy] || "createdAt";
  const sortOrder = (query.sortOrder as string) === "asc" ? "asc" : "desc";
  const limit = parseInt(query.limit as string) || 20;

  const where: any = {};
  if (status) where.approvalStatus = status;
  if (search) {
    where.OR = [
      { kodeTransaksi: { contains: search } },
      { masterBarang: { namaBarang: { contains: search } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.transaksiBarang.findMany({
      where,
      include: {
        masterBarang: true,
        user: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [orderByField]: sortOrder },
    }),
    prisma.transaksiBarang.count({ where }),
  ]);

  return { data, total, page, limit };
});
