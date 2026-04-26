import "dotenv/config";
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create permissions
  const permissionNames = [
    'view_kategoris', 'create_kategoris', 'edit_kategoris', 'delete_kategoris',
    'view_ruangs', 'create_ruangs', 'edit_ruangs', 'delete_ruangs',
    'view_master_barangs', 'create_master_barangs', 'edit_master_barangs', 'delete_master_barangs',
    'view_unit_barangs', 'create_unit_barangs', 'edit_unit_barangs', 'nonaktifkan_unit_barangs',
    'view_transaksi_barangs', 'create_transaksi_barangs', 'edit_transaksi_barangs', 'approve_transaksi_barangs',
    'view_transaksi_keluars', 'create_transaksi_keluars', 'edit_transaksi_keluars', 'approve_transaksi_keluars',
    'view_barang_rusaks', 'create_barang_rusaks',
    'view_mutasi_lokasis', 'create_mutasi_lokasis', 'edit_mutasi_lokasis', 'delete_mutasi_lokasis',
    'view_log_aktivitas',
    'view_users', 'create_users', 'edit_users', 'delete_users',
    'generate_laporan', 'export_data',
    'backup_database', 'system_settings',
  ]

  for (const name of permissionNames) {
    await prisma.permission.upsert({ where: { name }, update: {}, create: { name } })
  }
  console.log(`✅ ${permissionNames.length} permissions created`)

  // Create roles
  const adminRole = await prisma.role.upsert({ where: { name: 'Admin' }, update: {}, create: { name: 'Admin' } })
  const kepsekRole = await prisma.role.upsert({ where: { name: 'Kepala Sekolah' }, update: {}, create: { name: 'Kepala Sekolah' } })
  const petugasRole = await prisma.role.upsert({ where: { name: 'Petugas Inventaris' }, update: {}, create: { name: 'Petugas Inventaris' } })
  console.log('✅ 3 roles created')

  // Assign all permissions to Admin
  const allPerms = await prisma.permission.findMany()
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    })
  }

  // Kepala Sekolah permissions
  const kepsekPerms = [
    'view_kategoris', 'view_ruangs', 'view_master_barangs', 'view_unit_barangs',
    'view_transaksi_barangs', 'view_transaksi_keluars', 'view_barang_rusaks',
    'view_mutasi_lokasis', 'view_log_aktivitas', 'view_users',
    'approve_transaksi_barangs', 'approve_transaksi_keluars',
    'generate_laporan', 'export_data',
  ]
  for (const name of kepsekPerms) {
    const perm = allPerms.find(p => p.name === name)
    if (perm) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: kepsekRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: kepsekRole.id, permissionId: perm.id },
      })
    }
  }

  // Petugas permissions
  const petugasPerms = [
    'view_kategoris', 'view_ruangs', 'view_master_barangs', 'view_unit_barangs',
    'view_transaksi_barangs', 'view_transaksi_keluars', 'view_barang_rusaks',
    'view_mutasi_lokasis', 'view_log_aktivitas',
    'create_kategoris', 'edit_kategoris', 'delete_kategoris',
    'create_ruangs', 'edit_ruangs', 'delete_ruangs',
    'create_master_barangs', 'edit_master_barangs',
    'create_unit_barangs', 'edit_unit_barangs',
    'create_transaksi_barangs', 'edit_transaksi_barangs',
    'create_transaksi_keluars', 'edit_transaksi_keluars',
    'create_mutasi_lokasis', 'edit_mutasi_lokasis', 'delete_mutasi_lokasis',
    'create_barang_rusaks',
  ]
  for (const name of petugasPerms) {
    const perm = allPerms.find(p => p.name === name)
    if (perm) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: petugasRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: petugasRole.id, permissionId: perm.id },
      })
    }
  }
  console.log('✅ Permissions assigned to roles')

  // Create users
  const hashedPassword = await bcrypt.hash('password', 12)

  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: { name: 'Administrator', email: 'admin@gmail.com', password: hashedPassword, roleId: adminRole.id, isActive: true },
  })
  await prisma.user.upsert({
    where: { email: 'kepala@gmail.com' },
    update: {},
    create: { name: 'Kepala Sekolah', email: 'kepala@gmail.com', password: hashedPassword, roleId: kepsekRole.id, isActive: true },
  })
  await prisma.user.upsert({
    where: { email: 'petugas@gmail.com' },
    update: {},
    create: { name: 'Petugas Inventaris', email: 'petugas@gmail.com', password: hashedPassword, roleId: petugasRole.id, isActive: true },
  })
  console.log('✅ 3 users created (password: "password")')

  // Sample data
  await prisma.ruang.upsert({ where: { id: 1 }, update: {}, create: { id: 1, namaRuang: 'Ruang Lab Komputer' } })
  await prisma.ruang.upsert({ where: { id: 2 }, update: {}, create: { id: 2, namaRuang: 'Ruang Kelas 1' } })
  await prisma.ruang.upsert({ where: { id: 3 }, update: {}, create: { id: 3, namaRuang: 'Ruang Guru' } })
  await prisma.ruang.upsert({ where: { id: 4 }, update: {}, create: { id: 4, namaRuang: 'Gudang' } })
  console.log('✅ 4 ruang created')

  await prisma.kategori.upsert({ where: { kodeKategori: 'ELE' }, update: {}, create: { kodeKategori: 'ELE', namaKategori: 'Elektronik' } })
  await prisma.kategori.upsert({ where: { kodeKategori: 'MEU' }, update: {}, create: { kodeKategori: 'MEU', namaKategori: 'Meubelair' } })
  await prisma.kategori.upsert({ where: { kodeKategori: 'ATK' }, update: {}, create: { kodeKategori: 'ATK', namaKategori: 'Alat Tulis Kantor' } })
  console.log('✅ 3 kategori created')

  console.log('\n🎉 Seeding completed!')
  console.log('\n📋 Login credentials:')
  console.log('  Admin:    admin@gmail.com / password')
  console.log('  Kepsek:   kepala@gmail.com / password')
  console.log('  Petugas:  petugas@gmail.com / password')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
