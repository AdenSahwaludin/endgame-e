import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const tb = await prisma.transaksiBarang.findFirst({
    select: { tanggalTransaksi: true }
  })
  const br = await prisma.barangRusak.findFirst({
    select: { tanggalKejadian: true }
  })
  console.log('Transaksi Barang Date:', tb?.tanggalTransaksi)
  console.log('Barang Rusak Date:', br?.tanggalKejadian)
}

main().catch(console.error).finally(() => prisma.$disconnect())
