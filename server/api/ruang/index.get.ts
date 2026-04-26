export default defineEventHandler(async (event) => {
  // await requirePermission(event, PERMISSIONS.VIEW_RUANGS)
  const query = getQuery(event);
  console.log("[API Ruang GET] Query:", query);
  const search = (query.search as string) || "";
  const all = query.all === "true";

  const where: any = { deletedAt: null };
  if (search) where.namaRuang = { contains: search };

  if (all) {
    return prisma.ruang.findMany({ where, orderBy: { namaRuang: "asc" } });
  }

  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 20;
  const [data, total] = await Promise.all([
    prisma.ruang.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { namaRuang: "asc" },
    }),
    prisma.ruang.count({ where }),
  ]);
  return { data, total, page, limit };
});
