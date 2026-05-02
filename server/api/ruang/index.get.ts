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
  // await requirePermission(event, PERMISSIONS.VIEW_RUANGS)
  const query = getQuery(event);
  console.log("[API Ruang GET] Query:", query);
  const search = (query.search as string) || "";
  const all = query.all === "true";

  const where: any = { deletedAt: null };
  if (search) where.namaRuang = { contains: search };

  const sortBy = (query.sortBy as string) || "createdAt";
  const sortOrder = (query.sortOrder as string) === "asc" ? "asc" : "desc";

  if (all) {
    return prisma.ruang.findMany({ where, orderBy: buildOrderBy(sortBy, sortOrder) });
  }

  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 20;

  const [data, total] = await Promise.all([
    prisma.ruang.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: buildOrderBy(sortBy, sortOrder),
    }),
    prisma.ruang.count({ where }),
  ]);
  return { data, total, page, limit };
});
