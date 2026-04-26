export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await requirePermission(event, PERMISSIONS.EDIT_RUANGS)
  const id = parseInt(getRouterParam(event, 'id')!)
  const body = await readBody(event)
  const ruang = await prisma.ruang.update({ where: { id }, data: { namaRuang: body.namaRuang } })
  await logAktivitas({ userId, jenis: 'update', deskripsi: `Ruang ${ruang.namaRuang} diupdate`, namaTabel: 'ruang', recordId: String(id) })
  return ruang
})
