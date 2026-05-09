function buildOrderBy(sortBy: string, sortOrder: string) {
  if (!sortBy) return { createdAt: sortOrder };
  if (sortBy.includes('.')) {
    const parts = sortBy.split('.');
    let obj: any = {};
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]!] = {};
      current = current[parts[i]!];
    }
    current[parts[parts.length - 1]!] = sortOrder;
    return obj;
  }
  return { [sortBy]: sortOrder };
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.VIEW_BARANG_RUSAKS)
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const sortBy = (query.sortBy as string) || "createdAt";
  const sortMap: Record<string, string> = {
    "tanggal": "tanggalRusak",
    "createdAt": "createdAt"
  };
  const orderByField = sortMap[sortBy] || "createdAt";
  const sortOrder = (query.sortOrder as string) === "asc" ? "asc" : "desc";
  const limit = parseInt(query.limit as string) || 20

  const search = (query.search as string) || "";
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;

  const where: any = {};
  if (search) {
    where.OR = [
      { unitBarangId: { contains: search } },
      { unitBarang: { masterBarang: { namaBarang: { contains: search } } } },
      { keterangan: { contains: search } },
    ];
  }

  if (startDate || endDate) {
    where.tanggalKejadian = {};
    if (startDate) where.tanggalKejadian.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.tanggalKejadian.lte = end;
    }
  }

  const [data, total] = await Promise.all([
    prisma.barangRusak.findMany({
      where,
      include: { unitBarang: { include: { masterBarang: true } }, ruang: true, user: { select: { id: true, name: true } } },
      skip: (page - 1) * limit, take: limit, orderBy: { [orderByField]: sortOrder },
    }),
    prisma.barangRusak.count({ where }),
  ])
  return { data, total, page, limit }
})
