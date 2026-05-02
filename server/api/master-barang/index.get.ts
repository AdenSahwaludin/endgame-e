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
  await requirePermission(event, PERMISSIONS.VIEW_MASTER_BARANGS);
  const query = getQuery(event);
  const search = (query.search as string) || "";
  const page = parseInt(query.page as string) || 1;
  const sortBy = (query.sortBy as string) || "createdAt";
  const sortOrder = (query.sortOrder as string) === "asc" ? "asc" : "desc";
  const limit = parseInt(query.limit as string) || 20;

  const where: any = { deletedAt: null };
  if (search) {
    where.OR = [
      { namaBarang: { contains: search } },
      { kodeMaster: { contains: search } },
      { merk: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.masterBarang.findMany({
      where,
      include: {
        kategori: true,
        _count: { select: { unitBarang: { where: { isActive: true } } } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: buildOrderBy(sortBy, sortOrder),
    }),
    prisma.masterBarang.count({ where }),
  ]);

  return { data, total, page, limit };
});
