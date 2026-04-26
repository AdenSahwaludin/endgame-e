import { PrismaClient } from '@prisma/client'

async function testConnection() {
  const prisma = new PrismaClient()
  console.log('🔍 Mengetes koneksi ke MySQL (127.0.0.1:3306)...')
  
  try {
    await prisma.$connect()
    console.log('✅ KONEKSI BERHASIL!')
    
    const userCount = await prisma.user.count()
    console.log(`📊 Total User di DB: ${userCount}`)
    
    const roles = await prisma.role.findMany({ select: { name: true } })
    console.log('🎭 Role yang tersedia:', roles.map(r => r.name).join(', '))
    
  } catch (error: any) {
    console.error('❌ KONEKSI GAGAL!')
    console.error('Pesan Error:', error.message)
    console.log('\n💡 TIPS:')
    console.log('1. Pastikan MySQL (XAMPP/Laragon) sudah RUNNING.')
    console.log('2. Cek apakah port 3306 sudah benar.')
    console.log('3. Jika MySQL Anda pakai password, update .env: root:PASSWORD@127.0.0.1')
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
