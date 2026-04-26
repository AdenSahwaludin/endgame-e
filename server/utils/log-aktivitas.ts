import { prisma } from './prisma'

interface LogParams {
  userId: number
  jenis: string
  deskripsi: string
  namaTabel?: string
  recordId?: string
  perubahanData?: any
  ipAddress?: string
  userAgent?: string
}

/**
 * Create an activity log entry (replaces Laravel LogAktivitas::log())
 */
export async function logAktivitas(params: LogParams) {
  try {
    await prisma.logAktivitas.create({
      data: {
        userId: params.userId,
        jenisAktivitas: params.jenis,
        deskripsi: params.deskripsi,
        namaTabel: params.namaTabel || null,
        recordId: params.recordId || null,
        perubahanData: params.perubahanData || undefined,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    })
  } catch (e) {
    // Don't let logging errors break the main operation
    console.error('Failed to log activity:', e)
  }
}
