export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } })
  return roles
})
