<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' });
import { useCurrency } from '~/composables/useCurrency';
const { formatRupiah } = useCurrency();
const { isAdmin, isKepsek, hasPermission } = usePermission();

// =====================
// STATE
// =====================
const page = ref(1);
const sortBy = ref('createdAt');
const sortOrder = ref('desc');
const search = ref('');
const startDate = ref('');
const endDate = ref('');

// Stok sub-tipe: 'unit' | 'transaksi_keluar' | 'barang_rusak'
const stokTipe = ref<'unit' | 'transaksi_keluar' | 'barang_rusak'>('unit');
const stokStatus = ref<string | null>(null);

watch([search, startDate, endDate, stokTipe, stokStatus], () => { page.value = 1; });

// =====================
// INTERFACES
// =====================
interface StokResponse { data: any[]; total: number; page: number; limit: number; tipe: string; }
interface KeuanganResponse { data: any[]; total: number; page: number; limit: number; grandTotal: number; grandTotalAll: number; }

// =====================
// FETCH DATA
// =====================

// Fetch untuk PI (Stok Fisik)
const { data: stokData, refresh: refreshStok } = await useFetch<StokResponse>('/api/laporan/stok', {
  query: computed(() => ({
    page: page.value,
    limit: 20,
    search: search.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    tipe: stokTipe.value,
    status: stokStatus.value || undefined,
    startDate: startDate.value || undefined,
    endDate: endDate.value || undefined,
  })),
  key: 'laporan-stok',
  watch: [page, search, sortBy, sortOrder, stokTipe, stokStatus, startDate, endDate]
});

// Fetch untuk KS (Keuangan) - hanya dieksekusi jika bukan PI murni
const { data: keuanganData, refresh: refreshKeuangan } = await useFetch<KeuanganResponse>('/api/laporan/keuangan', {
  query: computed(() => ({
    page: page.value,
    limit: 20,
    search: search.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    startDate: startDate.value || undefined,
    endDate: endDate.value || undefined,
  })),
  key: 'laporan-keuangan',
  watch: [page, search, sortBy, sortOrder, startDate, endDate]
});

// =====================
// KOLOM TABEL
// =====================

// Kolom Laporan Unit Barang
const columnsUnit = computed<any[]>(() => [
  { id: 'kode', accessorKey: 'kodeUnit', header: 'Kode Unit', sortable: true },
  { id: 'barang', header: 'Nama Barang', sortable: true },
  { id: 'kategori', header: 'Kategori', sortable: true },
  { id: 'ruang', header: 'Lokasi Ruang', sortable: true },
  { id: 'status', accessorKey: 'status', header: 'Status', sortable: true },
  { id: 'aktif', header: 'Aktif', sortable: true },
]);

// Kolom Laporan Transaksi Keluar
const columnsTransaksiKeluar = computed<any[]>(() => [
  { id: 'kode', accessorKey: 'kodeTransaksi', header: 'Kode Transaksi', sortable: true },
  { id: 'barang', header: 'Nama Barang', sortable: true },
  { id: 'kategori', header: 'Kategori', sortable: true },
  { id: 'tipe', accessorKey: 'tipe', header: 'Tipe', sortable: true },
  { id: 'tanggal', header: 'Tanggal', sortable: true },
  { id: 'penerima', accessorKey: 'penerima', header: 'Penerima' },
  { id: 'approvalStatus', accessorKey: 'approvalStatus', header: 'Status' },
]);

// Kolom Laporan Barang Rusak
const columnsBarangRusak = computed<any[]>(() => [
  { id: 'unit', accessorKey: 'unitBarangId', header: 'Kode Unit', sortable: true },
  { id: 'barang', header: 'Nama Barang', sortable: true },
  { id: 'kategori', header: 'Kategori', sortable: true },
  { id: 'ruang', header: 'Ruang', sortable: true },
  { id: 'tanggal', header: 'Tanggal Kejadian', sortable: true },
  { id: 'keterangan', accessorKey: 'keterangan', header: 'Keterangan' },
  { id: 'pelapor', header: 'Pelapor', sortable: true },
  ...(isAdmin() || isKepsek() ? [{ id: 'kerugian', header: 'Est. Kerugian', sortable: true }] : []),
]);

// Kolom Laporan Keuangan (KS/Admin)
const columnsKeuangan = computed<any[]>(() => [
  { id: 'kode', accessorKey: 'kodeTransaksi', header: 'Kode Transaksi', sortable: true },
  { id: 'barang', header: 'Nama Barang', sortable: true },
  { id: 'kategori', header: 'Kategori', sortable: true },
  { id: 'jumlah', accessorKey: 'totalPesanan', header: 'Jumlah', sortable: true },
  { id: 'harga', header: 'Harga Satuan', sortable: true },
  { id: 'total', header: 'Total Pengeluaran', sortable: true },
  { id: 'tanggal', header: 'Tanggal', sortable: true },
  { id: 'approver', header: 'Disetujui Oleh' },
]);

// =====================
// HELPERS
// =====================
function formatDate(d: string | Date | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusColor(s: string) {
  const map: Record<string, string> = { baik: 'success', dipinjam: 'warning', rusak: 'error', dihapus: 'neutral', approved: 'success', pending: 'warning', rejected: 'error' };
  return (map[s] || 'neutral') as any;
}

function tipeColor(t: string) {
  const map: Record<string, string> = {pemindahan: 'warning', peminjaman: 'info', penggunaan: 'primary', penghapusan: 'error', hibah: 'success' };
  return (map[t] || 'neutral') as any;
}

// Computed active columns based on stokTipe
const activeStokColumns = computed(() => {
  if (stokTipe.value === 'unit') return columnsUnit.value;
  if (stokTipe.value === 'transaksi_keluar') return columnsTransaksiKeluar.value;
  return columnsBarangRusak.value;
});

// Tab aktif untuk mode view
type LaporanTab = 'stok' | 'keuangan' | 'visualisasi';
const activeTab = ref<LaporanTab>(isKepsek() && !isAdmin() ? 'keuangan' : 'visualisasi');

watch(activeTab, () => {
  page.value = 1;
  search.value = '';
  startDate.value = '';
  endDate.value = '';
  sortBy.value = 'createdAt';
  sortOrder.value = 'desc';
});

// Reset sorting saat ganti tipe/tab untuk menghindari bug Unknown Field
watch([activeTab, stokTipe], () => {
  sortBy.value = activeTab.value === 'keuangan' ? 'tanggal' : (stokTipe.value === 'unit' ? 'kode' : 'tanggal');
  sortOrder.value = 'desc';
  page.value = 1;
});
const exportLoading = ref(false);

async function exportData(format: 'pdf' | 'csv') {
  exportLoading.value = true;
  try {
    let endpoint = '';
    let queryParams: any = { export: 'true' };

    if (activeTab.value === 'stok') {
      endpoint = '/api/laporan/stok';
      queryParams = { ...queryParams, tipe: stokTipe.value, status: stokStatus.value, search: search.value, startDate: startDate.value, endDate: endDate.value };
    } else {
      endpoint = '/api/laporan/keuangan';
      queryParams = { ...queryParams, search: search.value, startDate: startDate.value, endDate: endDate.value };
    }

    const response: any = await $fetch(endpoint, { query: queryParams });
    const rawData = response.data || [];

    let head: string[] = [];
    let body: any[][] = [];
    let filename = `laporan_${activeTab.value}_${new Date().getTime()}.${format}`;

    if (activeTab.value === 'stok') {
       if (stokTipe.value === 'unit') {
          head = ['Kode Unit', 'Nama Barang', 'Kategori', 'Lokasi Ruang', 'Status', 'Aktif'];
          body = rawData.map((r: any) => [
            r.kodeUnit, r.masterBarang?.namaBarang, r.masterBarang?.kategori?.namaKategori,
            r.ruang?.namaRuang || '-', r.status, r.isActive ? 'Aktif' : 'Nonaktif'
          ]);
       } else if (stokTipe.value === 'transaksi_keluar') {
          head = ['Kode Transaksi', 'Nama Barang', 'Tipe', 'Tanggal', 'Penerima', 'Status'];
          body = rawData.map((r: any) => [
            r.kodeTransaksi, r.unitBarang?.masterBarang?.namaBarang, r.tipe,
            formatDate(r.tanggalTransaksi), r.penerima || '-', r.approvalStatus
          ]);
       } else if (stokTipe.value === 'barang_rusak') {
          head = ['Kode Unit', 'Nama Barang', 'Ruang', 'Tanggal Kejadian', 'Keterangan', 'Pelapor'];
          if (isAdmin() || isKepsek()) head.push('Est. Kerugian');
          body = rawData.map((r: any) => {
             const row = [r.unitBarangId, r.unitBarang?.masterBarang?.namaBarang, r.ruang?.namaRuang || '-', formatDate(r.tanggalKejadian), r.keterangan || '-', r.user?.name || '-'];
             if (isAdmin() || isKepsek()) row.push(r.unitBarang?.masterBarang?.hargaSatuan || 0);
             return row;
          });
       }
    } else {
       head = ['Kode Transaksi', 'Nama Barang', 'Kategori', 'Jumlah', 'Harga Satuan', 'Total Pengeluaran', 'Tanggal', 'Disetujui Oleh'];
       body = rawData.map((r: any) => [
         r.kodeTransaksi, r.masterBarang?.namaBarang, r.masterBarang?.kategori?.namaKategori,
         r.totalPesanan, Number(r.masterBarang?.hargaSatuan || 0),
         r.totalPesanan * Number(r.masterBarang?.hargaSatuan || 0),
         formatDate(r.tanggalTransaksi), r.approver?.name || '-'
       ]);
    }

    if (format === 'csv') {
      const Papa = (await import('papaparse')).default;
      const csv = Papa.unparse({ fields: head, data: body });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();
      
      // 1. Tambahkan Logo
      try {
        const img = new Image();
        img.src = '/Logo Tk Teratai.png';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        doc.addImage(img, 'PNG', 15, 8, 25, 25);
      } catch (e) {
        console.error('Gagal memuat logo:', e);
      }

      // 2. Kop Surat (Teks Tengah)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('YAYASAN PENDIDIKAN TERATAI', 110, 15, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text('TK TERATAI Kota Cirebon', 110, 22, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('NPSN: 20265773', 110, 27, { align: 'center' });
      
      doc.setFontSize(9);
      doc.text('Jl. Teratai No. 24 BTN Kalijaga Permai Barat, RT 05 / RW 11, Kel. Kalijaga,', 110, 32, { align: 'center' });
      doc.text('Kec. Harjamukti, Kota Cirebon, Jawa Barat 45144', 110, 36, { align: 'center' });
      doc.text('Email: tkterataicrb@gmail.com', 110, 40, { align: 'center' });
      
      // 3. Garis Pemisah (Double Line style)
      doc.setLineWidth(0.8);
      doc.line(15, 43, 195, 43);
      doc.setLineWidth(0.2);
      doc.line(15, 44.2, 195, 44.2);
      
      // 4. Judul Laporan & Periode (Format Lebih Ringkas & Profesional)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('LAPORAN INVENTARIS', 105, 52, { align: 'center' });
      
      const subTitle = activeTab.value === 'stok' ? 
        (stokTipe.value === 'unit' ? 'Stok Fisik Barang' : (stokTipe.value === 'transaksi_keluar' ? 'Pengelolaan Aset' : 'Barang Rusak')) : 
        'Laporan Keuangan';

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const tp = month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`${subTitle} - Tahun Pelajaran ${tp}`, 105, 58, { align: 'center' });
      
      // 5. Metadata Cetak
      doc.setFontSize(8);
      doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 65);

      // 6. Tabel Data
      autoTable(doc, {
        head: [head],
        body: body,
        startY: 70,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], halign: 'center' },
        columnStyles: {
          // Center align some columns if needed
        }
      });

      doc.save(filename);
    }

  } catch (error) {
    console.error('Export failed:', error);
    useToast().add({ title: 'Gagal Ekspor', description: 'Terjadi kesalahan saat mengunduh data.', color: 'error' });
  } finally {
    exportLoading.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Laporan</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Ringkasan data inventaris dan keuangan aset sekolah.</p>
      </div>
      <div class="flex gap-2">
        <UButton icon="i-heroicons-document-text" color="primary" variant="soft" class="btn-jelly" @click="exportData('csv')" :loading="exportLoading">Export CSV</UButton>
        <UButton icon="i-heroicons-document-chart-bar" color="error" variant="soft" class="btn-jelly" @click="exportData('pdf')" :loading="exportLoading">Export PDF</UButton>
      </div>
    </div>

    <!-- Tab Navigasi (Admin lihat keduanya, PI hanya Stok, KS hanya Keuangan) -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="flex gap-1">
        <button
          v-if="!isKepsek()"
          @click="activeTab = 'stok'"
          :class="[
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'stok'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
          ]"
        >
          <span class="flex items-center gap-2">
            <UIcon name="i-heroicons-cube-transparent" class="w-4 h-4" />
            Laporan Stok Fisik
          </span>
        </button>
        <button
          v-if="isAdmin() || isKepsek()"
          @click="activeTab = 'keuangan'"
          :class="[
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'keuangan'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
          ]"
        >
          <span class="flex items-center gap-2">
            <UIcon name="i-heroicons-banknotes" class="w-4 h-4" />
            Laporan Keuangan
          </span>
        </button>
        <button
          @click="activeTab = 'visualisasi'"
          :class="[
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'visualisasi'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
          ]"
        >
          <span class="flex items-center gap-2">
            <UIcon name="i-heroicons-chart-bar" class="w-4 h-4" />
            Visualisasi
          </span>
        </button>
      </nav>
    </div>

    <!-- ===== TAB STOK FISIK (PI & Admin) ===== -->
    <div v-if="activeTab === 'stok' && !isKepsek()" class="space-y-4">
      <!-- Sub-menu tipe laporan -->
      <div class="flex gap-2 flex-wrap">
        <UButton
          v-for="item in [
            { label: 'Inventaris Barang', value: 'unit', icon: 'i-heroicons-cube' },
            { label: 'Pengelolaan Aset', value: 'transaksi_keluar', icon: 'i-heroicons-arrow-up-tray' },
            { label: 'Barang Rusak', value: 'barang_rusak', icon: 'i-heroicons-exclamation-triangle' },
          ]"
          :key="item.value"
          :icon="item.icon"
          :variant="stokTipe === item.value ? 'solid' : 'soft'"
          :color="stokTipe === item.value ? 'primary' : 'neutral'"
          size="sm"
          class="btn-jelly"
          @click="stokTipe = item.value as any"
        >{{ item.label }}</UButton>
      </div>

      <!-- Filter -->
      <div class="flex gap-3 flex-wrap items-center">
        <UInput
          v-model="search"
          placeholder="Cari data..."
          icon="i-heroicons-magnifying-glass"
          class="max-w-sm"
        />
        <!-- Status filter (hanya untuk unit barang) -->
        <USelectMenu
          v-if="stokTipe === 'unit'"
          v-model="stokStatus"
          :items="[
            { label: 'Semua Status', value: null },
            { label: 'Baik', value: 'baik' },
            { label: 'Dipinjam', value: 'dipinjam' },
            { label: 'Rusak', value: 'rusak' },
            { label: 'Dihapus', value: 'dihapus' },
          ]"
          value-key="value"
          placeholder="Filter status"
          class="w-44 relative z-20"
        />
        <!-- Date range (transaksi keluar & barang rusak) -->
        <template v-if="stokTipe !== 'unit'">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Rentang:</span>
          <UInput v-model="startDate" type="date" class="w-40" />
          <span class="text-gray-500">-</span>
          <UInput v-model="endDate" type="date" class="w-40" />
        </template>
      </div>

      <!-- Tabel Unit Barang -->
      <AppTable
        v-if="stokTipe === 'unit'"
        :data="stokData?.data || []"
        :columns="columnsUnit"
        v-model:sortBy="sortBy"
        v-model:sortOrder="sortOrder"
      >
        <template #barang-cell="{ row }">{{ row.original.masterBarang?.namaBarang }}</template>
        <template #kategori-cell="{ row }">
          <UBadge variant="subtle">{{ row.original.masterBarang?.kategori?.namaKategori }}</UBadge>
        </template>
        <template #ruang-cell="{ row }">{{ row.original.ruang?.namaRuang }}</template>
        <template #status-cell="{ row }">
          <UBadge :color="statusColor(row.original.status)" variant="subtle">{{ row.original.status }}</UBadge>
        </template>
        <template #aktif-cell="{ row }">
          <UBadge :color="row.original.isActive ? 'success' : 'error'" variant="subtle">
            {{ row.original.isActive ? 'Aktif' : 'Nonaktif' }}
          </UBadge>
        </template>
      </AppTable>

      <!-- Tabel Transaksi Keluar -->
      <AppTable
        v-if="stokTipe === 'transaksi_keluar'"
        :data="stokData?.data || []"
        :columns="columnsTransaksiKeluar"
        v-model:sortBy="sortBy"
        v-model:sortOrder="sortOrder"
      >
        <template #barang-cell="{ row }">{{ row.original.unitBarang?.masterBarang?.namaBarang }}</template>
        <template #kategori-cell="{ row }">
          <UBadge variant="subtle">{{ row.original.unitBarang?.masterBarang?.kategori?.namaKategori }}</UBadge>
        </template>
        <template #tipe-cell="{ row }">
          <UBadge :color="tipeColor(row.original.tipe)" variant="subtle">{{ row.original.tipe }}</UBadge>
        </template>
        <template #tanggal-cell="{ row }">{{ formatDate(row.original.tanggalTransaksi) }}</template>
        <template #approvalStatus-cell="{ row }">
          <UBadge :color="statusColor(row.original.approvalStatus)" variant="subtle">{{ row.original.approvalStatus }}</UBadge>
        </template>
      </AppTable>

      <!-- Tabel Barang Rusak -->
      <AppTable
        v-if="stokTipe === 'barang_rusak'"
        :data="stokData?.data || []"
        :columns="columnsBarangRusak"
        v-model:sortBy="sortBy"
        v-model:sortOrder="sortOrder"
      >
        <template #barang-cell="{ row }">{{ row.original.unitBarang?.masterBarang?.namaBarang }}</template>
        <template #kategori-cell="{ row }">
          <UBadge variant="subtle">{{ row.original.unitBarang?.masterBarang?.kategori?.namaKategori }}</UBadge>
        </template>
        <template #ruang-cell="{ row }">{{ row.original.ruang?.namaRuang ?? '-' }}</template>
        <template #tanggal-cell="{ row }">{{ formatDate(row.original.tanggalKejadian) }}</template>
        <template #pelapor-cell="{ row }">{{ row.original.user?.name }}</template>
        <template #kerugian-cell="{ row }">
          <span class="text-red-500 font-medium">
            {{ formatRupiah(row.original.unitBarang?.masterBarang?.hargaSatuan || 0) }}
          </span>
        </template>
      </AppTable>

      <!-- Paginasi -->
      <div class="flex justify-center">
        <UPagination
          v-if="stokData && stokData.total > 20"
          v-model:page="page"
          :total="stokData.total"
          :items-per-page="20"
        />
      </div>
    </div>

    <!-- ===== TAB KEUANGAN (KS & Admin) ===== -->
    <div v-if="activeTab === 'keuangan' && (isAdmin() || isKepsek())" class="space-y-4">

      <!-- Summary Badge Grand Total -->
      <div v-if="keuanganData" class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px] rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">Total Pengeluaran (Keseluruhan)</p>
          <p class="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
            {{ formatRupiah(keuanganData.grandTotalAll) }}
          </p>
        </div>
        <div class="flex-1 min-w-[200px] rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Total Pengeluaran (Halaman Ini)</p>
          <p class="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
            {{ formatRupiah(keuanganData.grandTotal) }}
          </p>
        </div>
        <div class="flex-1 min-w-[200px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Transaksi Disetujui</p>
          <p class="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-1">{{ keuanganData.total }}</p>
        </div>
      </div>

      <!-- Filter -->
      <div class="flex gap-3 flex-wrap items-center">
        <UInput
          v-model="search"
          placeholder="Cari barang / kategori..."
          icon="i-heroicons-magnifying-glass"
          class="max-w-sm"
        />
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Rentang:</span>
        <UInput v-model="startDate" type="date" class="w-40" />
        <span class="text-gray-500">-</span>
        <UInput v-model="endDate" type="date" class="w-40" />
      </div>

      <!-- Tabel Keuangan -->
      <AppTable
        :data="keuanganData?.data || []"
        :columns="columnsKeuangan"
        v-model:sortBy="sortBy"
        v-model:sortOrder="sortOrder"
      >
        <template #barang-cell="{ row }">{{ row.original.masterBarang?.namaBarang }}</template>
        <template #kategori-cell="{ row }">
          <UBadge variant="subtle">{{ row.original.masterBarang?.kategori?.namaKategori }}</UBadge>
        </template>
        <template #harga-cell="{ row }">
          {{ formatRupiah(row.original.masterBarang?.hargaSatuan || 0) }}
        </template>
        <template #total-cell="{ row }">
          <span class="font-semibold text-green-600 dark:text-green-400">
            {{ formatRupiah((row.original.totalPesanan || 0) * Number(row.original.masterBarang?.hargaSatuan || 0)) }}
          </span>
        </template>
        <template #tanggal-cell="{ row }">{{ formatDate(row.original.tanggalTransaksi) }}</template>
        <template #approver-cell="{ row }">{{ row.original.approver?.name ?? '-' }}</template>
      </AppTable>

      <!-- Paginasi -->
      <div class="flex justify-center">
        <UPagination
          v-if="keuanganData && keuanganData.total > 20"
          v-model:page="page"
          :total="keuanganData.total"
          :items-per-page="20"
        />
      </div>
    </div>

    <!-- ===== TAB VISUALISASI ===== -->
    <div v-if="activeTab === 'visualisasi'" class="space-y-10 pb-10">
      
      <!-- Grup A: Kondisi Inventaris -->
      <div>
        <div class="flex items-center gap-2 mb-6">
          <div class="w-1.5 h-6 bg-primary-500 rounded-full"></div>
          <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Kondisi & Status Inventaris</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LaporanGrafikStatusBarang />
          <LaporanGrafikBarangPerKategori />
          <LaporanGrafikBarangPerRuang />
        </div>
      </div>

      <!-- Grup D: Keuangan (Hanya Admin/KS) -->
      <div v-if="isAdmin() || isKepsek()">
        <div class="flex items-center gap-2 mb-6">
          <div class="w-1.5 h-6 bg-red-500 rounded-full"></div>
          <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Analisis Keuangan</h3>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LaporanGrafikPengeluaranBulanan />
          <LaporanGrafikPengeluaranPerKategori />
        </div>
      </div>

      <!-- Tren Waktu -->
      <div>
        <div class="flex items-center gap-2 mb-6">
          <div class="w-1.5 h-6 bg-amber-500 rounded-full"></div>
          <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Tren & Pola Bulanan</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LaporanGrafikTrenPengadaan />
          <LaporanGrafikTrenKerusakan />
        </div>
      </div>

      <!-- Aktivitas Lainnya -->
      <div>
        <div class="flex items-center gap-2 mb-6">
          <div class="w-1.5 h-6 bg-blue-500 rounded-full"></div>
          <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Pengelolaan Aset</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LaporanGrafikTipeTransaksiKeluar />
          <LaporanGrafikStatusPeminjaman />
        </div>
      </div>

    </div>
  </div>
</template>
