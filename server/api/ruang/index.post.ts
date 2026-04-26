export default defineEventHandler(async (event) => {
  try {
    const userId = await requireAuth(event)
    await requirePermission(event, PERMISSIONS.CREATE_RUANGS)
    const body = await readBody(event)
    
    if (!body.namaRuang) {
      throw createError({ statusCode: 400, statusMessage: 'Nama ruang wajib diisi' })
    }

    const ruang = await prisma.ruang.create({ 
      data: { 
        namaRuang: body.namaRuang 
      } 
    })
    
    await logAktivitas({ 
      userId, 
      jenis: 'create', 
      deskripsi: `Ruang ${ruang.namaRuang} dibuat`, 
      namaTabel: 'ruang', 
      recordId: String(ruang.id) 
    })
    
    return ruang
  } catch (error: any) {
    console.error('[API Ruang Create Error]:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    })
  }
})
