export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId = (session.user as any)?.id
  
  if (userId) {
    await logAktivitas({
      userId,
      jenis: 'logout',
      deskripsi: 'User logout',
    })
  }

  await clearUserSession(event)
  return { success: true }
})
