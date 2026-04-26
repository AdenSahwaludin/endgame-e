import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Memperbaiki sequence database...')
  
  const tables = ['ruang', 'users', 'roles', 'permissions', 'transaksi_barang', 'transaksi_keluar', 'barang_rusak', 'mutasi_lokasi', 'log_aktivitas']
  
  for (const table of tables) {
    try {
      // Query untuk mereset sequence ke ID tertinggi saat ini
      await prisma.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), coalesce(max(id), 0) + 1, false) FROM "${table}";
      `)
      console.log(`✅ Sequence untuk tabel ${table} berhasil diperbarui.`)
    } catch (e: any) {
      console.warn(`⚠️ Gagal memperbarui sequence ${table}: ${e.message}`)
    }
  }
  
  console.log('\n🚀 Semua sequence sudah sinkron. Silakan coba tambah data lagi!')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
