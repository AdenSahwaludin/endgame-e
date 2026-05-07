import { prisma } from './prisma'

/**
 * Generate kode kategori from nama.
 * Pattern: 3 huruf pertama uppercase, suffix angka jika duplikat.
 */
export async function generateKodeKategori(nama: string): Promise<string> {
  const cleaned = nama.replace(/[^A-Za-z]/g, '')
  let prefix = cleaned.substring(0, 3).toUpperCase()
  if (prefix.length < 3) prefix = prefix.padEnd(3, 'X')

  let kode = prefix
  let counter = 1
  while (await prisma.kategori.findUnique({ where: { kodeKategori: kode } })) {
    kode = `${prefix}${counter++}`
  }
  return kode
}

/**
 * Generate kode master from nama_barang & kategori_id.
 * Pattern: NAM-KAT (3 huruf nama + 3 huruf kategori)
 */
export async function generateKodeMaster(namaBarang: string, kategoriId: string): Promise<string> {
  const namaClean = namaBarang.replace(/[^A-Za-z]/g, '')
  let namaCode = namaClean.substring(0, 3).toUpperCase()
  if (namaCode.length < 3) namaCode = namaCode.padEnd(3, 'X')

  const katClean = kategoriId.replace(/[^A-Za-z]/g, '')
  let katCode = katClean.substring(0, 3).toUpperCase()
  if (katCode.length < 3) katCode = katCode.padEnd(3, 'X')

  const baseKode = `${namaCode}-${katCode}`
  let kode = baseKode
  let counter = 1
  while (await prisma.masterBarang.findUnique({ where: { kodeMaster: kode } })) {
    kode = `${baseKode}${counter++}`
  }
  return kode
}

/**
 * Generate kode unit from master barang.
 * Pattern: {KODE_MASTER}-{SEQUENCE} e.g. LAP-ELE-001
 */
export async function generateKodeUnit(masterBarangId: string): Promise<string> {
  const prefix = `${masterBarangId}-`
  const lastUnit = await prisma.unitBarang.findFirst({
    where: { kodeUnit: { startsWith: prefix } },
    orderBy: { kodeUnit: 'desc' },
  })

  if (!lastUnit) return `${prefix}001`

  const lastNumber = parseInt(lastUnit.kodeUnit.slice(-3), 10)
  return `${prefix}${String(lastNumber + 1).padStart(3, '0')}`
}

/**
 * Generate kode transaksi masuk.
 * Pattern: TRX-PENGADAAN-YYYYMMDD-XXX
 */
export async function generateKodeTransaksiMasuk(): Promise<string> {
  const now = new Date()
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0')
  const prefix = `TRX-PENGADAAN-${dateStr}-`

  const last = await prisma.transaksiBarang.findFirst({
    where: { kodeTransaksi: { startsWith: prefix } },
    orderBy: { kodeTransaksi: 'desc' },
  })

  if (!last) return `${prefix}001`
  const lastNum = parseInt(last.kodeTransaksi.slice(-3), 10)
  return `${prefix}${String(lastNum + 1).padStart(3, '0')}`
}

/**
 * Generate kode transaksi keluar.
 * Pattern: TRX-ASET-YYYYMMDD-XXX
 */
export async function generateKodeTransaksiKeluar(): Promise<string> {
  const now = new Date()
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0')
  const prefix = `TRX-ASET-${dateStr}-`

  const last = await prisma.transaksiKeluar.findFirst({
    where: { kodeTransaksi: { startsWith: prefix } },
    orderBy: { kodeTransaksi: 'desc' },
  })

  if (!last) return `${prefix}001`
  const lastNum = parseInt(last.kodeTransaksi.slice(-3), 10)
  return `${prefix}${String(lastNum + 1).padStart(3, '0')}`
}
