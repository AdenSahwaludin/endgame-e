import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const aktif = await prisma.unitBarang.count({
    where: { status: 'dipinjam', isActive: true }
  })
  const totalLoan = await prisma.transaksiKeluar.count({
    where: { 
      tipe: 'peminjaman', 
      approvalStatus: 'approved' 
    }
  })
  console.log('Aktif (status=dipinjam):', aktif)
  console.log('Total Loan Transactions (peminjaman & approved):', totalLoan)
  console.log('Calculated Selesai:', totalLoan - aktif)
}

main().catch(console.error).finally(() => prisma.$disconnect())
