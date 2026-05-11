import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const all = await prisma.transaksiBarang.findMany({select: {id: true, approvalStatus: true}});
  console.log('All TransaksiBarang:', all);
}
main().finally(() => prisma.$disconnect());
