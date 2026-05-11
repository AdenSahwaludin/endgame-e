export default defineEventHandler(async (event) => {
  await requirePermission(event, 'view_transaksi_keluars')

  const [aktif, totalLoan] = await Promise.all([
    prisma.unitBarang.count({
      where: { status: 'dipinjam', isActive: true }
    }),
    prisma.transaksiKeluar.count({
      where: { 
        tipe: { in: ['peminjaman', 'penggunaan'] }, 
        approvalStatus: 'approved' 
      }
    })
  ])

  // 'Selesai' adalah total transaksi peminjaman yang sudah tidak berstatus dipinjam lagi
  // Ini adalah pendekatan estimasi karena satu unit bisa dipinjam berkali-kali secara sekuensial
  const selesai = Math.max(0, totalLoan - aktif)

  return [
    { label: 'Aktif', count: aktif },
    { label: 'Selesai', count: selesai }
  ]
})
