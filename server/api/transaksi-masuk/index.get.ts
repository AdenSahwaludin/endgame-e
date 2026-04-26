export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.VIEW_TRANSAKSI_BARANGS);
  const query = getQuery(event);
  const search = (query.search as string) || "";
  const status = query.status as string;
  const page = parseInt(query.page as string) || 1;
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
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaksiBarang.count({ where }),
  ]);

  return { data, total, page, limit };
});
