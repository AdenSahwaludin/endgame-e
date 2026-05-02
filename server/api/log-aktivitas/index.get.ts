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
  await requirePermission(event, PERMISSIONS.VIEW_LOG_AKTIVITAS)
  const session = await getUserSession(event)
  const user = session.user as any
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
    const sortBy = (query.sortBy as string) || "createdAt";
  const sortMap: Record<string, string> = {
    "aktivitas": "jenisAktivitas",
    "tabel": "namaTabel",
    "createdAt": "createdAt"
  };
  const orderByField = sortMap[sortBy] || "createdAt";
  const sortOrder = (query.sortOrder as string) === "asc" ? "asc" : "desc";
  const limit = parseInt(query.limit as string) || 20

  const where: any = {}
  // Petugas hanya bisa lihat log sendiri
  if (user.role === 'Petugas Inventaris') {
    where.userId = user.id
  }

  const [data, total] = await Promise.all([
    prisma.logAktivitas.findMany({
      where, include: { user: { select: { id: true, name: true } } },
      skip: (page - 1) * limit, take: limit, orderBy: { [orderByField]: sortOrder },
    }),
    prisma.logAktivitas.count({ where }),
  ])
  return { data, total, page, limit }
})
