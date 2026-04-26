export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.VIEW_MASTER_BARANGS);
  const query = getQuery(event);
  const search = (query.search as string) || "";
  const page = parseInt(query.page as string) || 1;
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
      orderBy: { createdAt: "desc" },
    }),
    prisma.masterBarang.count({ where }),
  ]);

  return { data, total, page, limit };
});
