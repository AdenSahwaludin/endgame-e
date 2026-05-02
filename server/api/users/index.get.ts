import bcrypt from 'bcryptjs'

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
  await requirePermission(event, PERMISSIONS.VIEW_USERS)
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
    const sortBy = (query.sortBy as string) || "createdAt";
  const sortMap: Record<string, string> = {
    "nama": "name",
    "email": "email",
    "createdAt": "createdAt"
  };
  const orderByField = sortMap[sortBy] || "createdAt";
  const sortOrder = (query.sortOrder as string) === "asc" ? "asc" : "desc";
  const limit = parseInt(query.limit as string) || 20

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, email: true, isActive: true, role: true, createdAt: true },
      skip: (page - 1) * limit, take: limit, orderBy: { [orderByField]: sortOrder },
    }),
    prisma.user.count({ where: { deletedAt: null } }),
  ])
  return { data, total, page, limit }
})
