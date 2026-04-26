import type { H3Event } from 'h3'
import { prisma } from './prisma'

// All permission names (matching Laravel's Spatie permissions)
export const PERMISSIONS = {
  // Kategori
  VIEW_KATEGORIS: 'view_kategoris',
  CREATE_KATEGORIS: 'create_kategoris',
  EDIT_KATEGORIS: 'edit_kategoris',
  DELETE_KATEGORIS: 'delete_kategoris',
  // Ruang
  VIEW_RUANGS: 'view_ruangs',
  CREATE_RUANGS: 'create_ruangs',
  EDIT_RUANGS: 'edit_ruangs',
  DELETE_RUANGS: 'delete_ruangs',
  // Master Barang
  VIEW_MASTER_BARANGS: 'view_master_barangs',
  CREATE_MASTER_BARANGS: 'create_master_barangs',
  EDIT_MASTER_BARANGS: 'edit_master_barangs',
  DELETE_MASTER_BARANGS: 'delete_master_barangs',
  // Unit Barang
  VIEW_UNIT_BARANGS: 'view_unit_barangs',
  CREATE_UNIT_BARANGS: 'create_unit_barangs',
  EDIT_UNIT_BARANGS: 'edit_unit_barangs',
  NONAKTIFKAN_UNIT_BARANGS: 'nonaktifkan_unit_barangs',
  // Transaksi Masuk
  VIEW_TRANSAKSI_BARANGS: 'view_transaksi_barangs',
  CREATE_TRANSAKSI_BARANGS: 'create_transaksi_barangs',
  EDIT_TRANSAKSI_BARANGS: 'edit_transaksi_barangs',
  APPROVE_TRANSAKSI_BARANGS: 'approve_transaksi_barangs',
  // Transaksi Keluar
  VIEW_TRANSAKSI_KELUARS: 'view_transaksi_keluars',
  CREATE_TRANSAKSI_KELUARS: 'create_transaksi_keluars',
  EDIT_TRANSAKSI_KELUARS: 'edit_transaksi_keluars',
  APPROVE_TRANSAKSI_KELUARS: 'approve_transaksi_keluars',
  // Barang Rusak
  VIEW_BARANG_RUSAKS: 'view_barang_rusaks',
  CREATE_BARANG_RUSAKS: 'create_barang_rusaks',
  // Mutasi Lokasi
  VIEW_MUTASI_LOKASIS: 'view_mutasi_lokasis',
  CREATE_MUTASI_LOKASIS: 'create_mutasi_lokasis',
  EDIT_MUTASI_LOKASIS: 'edit_mutasi_lokasis',
  DELETE_MUTASI_LOKASIS: 'delete_mutasi_lokasis',
  // Log Aktivitas
  VIEW_LOG_AKTIVITAS: 'view_log_aktivitas',
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  // Laporan
  GENERATE_LAPORAN: 'generate_laporan',
  EXPORT_DATA: 'export_data',
  // System
  BACKUP_DATABASE: 'backup_database',
  SYSTEM_SETTINGS: 'system_settings',
} as const

/**
 * Check if a user has a specific permission.
 */
export async function hasPermission(userId: number, permissionName: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  })

  if (!user) return false

  // Admin bypass - full access
  if (user.role.name === 'Admin') return true

  return user.role.permissions.some(rp => rp.permission.name === permissionName)
}

/**
 * Check if user has a specific role.
 */
export async function hasRole(userId: number, roleName: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  })
  return user?.role.name === roleName
}

/**
 * Require a permission or throw 403.
 */
export async function requirePermission(event: H3Event, permissionName: string): Promise<void> {
  const session = await getUserSession(event)
  const userId = (session.user as any)?.id
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const allowed = await hasPermission(userId, permissionName)
  if (!allowed) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Anda tidak memiliki izin untuk aksi ini' })
  }
}

/**
 * Get authenticated user ID from session or throw 401.
 */
export async function requireAuth(event: H3Event): Promise<number> {
  const session = await getUserSession(event)
  const userId = (session.user as any)?.id
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Silakan login terlebih dahulu' })
  }
  return userId
}
