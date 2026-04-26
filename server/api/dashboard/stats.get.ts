/** Dashboard stats — replaces Filament StatsOverviewWidget */
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const [totalMaster, totalUnitAktif, totalUnitRusak, totalUnitDipinjam, transaksiMasukPending, transaksiKeluarPending] = await Promise.all([
    prisma.masterBarang.count({ where: { deletedAt: null } }),
    prisma.unitBarang.count({ where: { isActive: true } }),
    prisma.unitBarang.count({ where: { status: 'rusak' } }),
    prisma.unitBarang.count({ where: { status: 'dipinjam' } }),
    prisma.transaksiBarang.count({ where: { approvalStatus: 'pending' } }),
    prisma.transaksiKeluar.count({ where: { approvalStatus: 'pending' } }),
  ])

  return { totalMaster, totalUnitAktif, totalUnitRusak, totalUnitDipinjam, transaksiMasukPending, transaksiKeluarPending }
})
