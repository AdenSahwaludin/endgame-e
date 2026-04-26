import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  const count = await prisma.ruang.count()
  const data = await prisma.ruang.findMany()
  console.log('Total data Ruang:', count)
  console.log('Sample data:', JSON.stringify(data, null, 2))
  await prisma.$disconnect()
}

check()
