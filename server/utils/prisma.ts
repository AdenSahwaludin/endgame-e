import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export function buildOrderBy(sortBy: string, sortOrder: string) {
  if (!sortBy) return { createdAt: sortOrder };
  
  if (sortBy.includes('.')) {
    const parts = sortBy.split('.');
    const obj: any = {};
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!;
      current[part] = {};
      current = current[part];
    }
    
    const lastPart = parts[parts.length - 1]!;
    current[lastPart] = sortOrder;
    return obj;
  }
  
  return { [sortBy]: sortOrder };
}
