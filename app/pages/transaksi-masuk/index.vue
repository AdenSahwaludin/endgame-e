<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
import { computed } from 'vue';
import { useCurrency } from '~/composables/useCurrency';
const { formatRupiah } = useCurrency();
const { hasPermission, canApprove, isAdmin, isKepsek } = usePermission();
const search = ref("");
const page = ref(1);
const sortBy = ref("createdAt");
const sortOrder = ref("desc");
const statusFilter = ref<string | null>(null);
const startDate = ref("");
const endDate = ref("");

watch([search, statusFilter, startDate, endDate], () => {
  page.value = 1;
});

interface TransaksiMasukResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

const { data, refresh } = await useAsyncData(
  'transaksi-masuk-list',
  () => $fetch<TransaksiMasukResponse>('/api/transaksi-masuk', {
    query: {
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      search: search.value,
      page: page.value,
      limit: 20,
      status: statusFilter.value || undefined,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
    }
  }),
  { watch: [page, search, statusFilter, sortBy, sortOrder, startDate, endDate] }
);

const columns = computed(() => {
  const cols: any[] = [
    { id: "kode", accessorKey: "kodeTransaksi", header: "Kode Transaksi", sortable: true },
    { id: "barang", accessorKey: "masterBarang.namaBarang", header: "Barang", sortable: true },
    { id: "jumlah", accessorKey: "totalPesanan", header: "Jumlah" },
  ];
  if (isAdmin() || isKepsek()) {
    cols.push({ id: "pengeluaran", header: "Total Pengeluaran" });
  }
  cols.push(
    { id: "tanggal", accessorKey: "tanggalTransaksi", header: "Tanggal", sortable: true },
    { id: "status", accessorKey: "approvalStatus", header: "Status" },
    { id: "user", accessorKey: "user.name", header: "Dibuat Oleh" },
    { id: "actions", header: "Aksi" }
  );
  return cols;
});

const grandTotal = computed(() => {
  if (!data.value?.data) return 0;
  return data.value.data.reduce((sum, item) => {
    return sum + (item.totalPesanan * (item.masterBarang?.hargaSatuan || 0));
  }, 0);
});

const statusColor = (s: string) =>
  (({ pending: "yellow", approved: "green", rejected: "red" })[s] ||
    "gray") as any;

const { confirm } = useConfirm();

async function handleApprove(id: number) {
  confirm({
    title: "Setujui Transaksi",
    message: "Setujui transaksi ini? Unit barang akan otomatis dibuat.",
    color: "success",
    onConfirm: async () => {
      try {
        const res = (await $fetch(`/api/transaksi-masuk/${id}/approve`, {
          method: "POST",
        })) as any;
        toast.add({
          title: "Disetujui",
          description: res.message,
          color: "success",
        });
        refresh();
      } catch (e: any) {
        toast.add({
          title: "Error",
          description: e.data?.statusMessage,
          color: "error",
        });
      }
    }
  });
}

async function handleReject(id: number) {
  confirm({
    title: "Tolak Transaksi",
    message: "Masukkan alasan penolakan untuk transaksi ini.",
    isPrompt: true,
    promptPlaceholder: "Alasan penolakan...",
    color: "error",
    onConfirm: async (notes) => {
      if (!notes) return;
      try {
        await $fetch(`/api/transaksi-masuk/${id}/reject`, {
          method: "POST",
          body: { approvalNotes: notes },
        });
        toast.add({ title: "Ditolak", color: "warning" });
        refresh();
      } catch (e: any) {
        toast.add({
          title: "Error",
          description: e.data?.statusMessage,
          color: "error",
        });
      }
    }
  });
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Pengadaan Barang
      </h2>
      <UButton
        v-if="hasPermission('create_transaksi_barangs')"
        icon="i-heroicons-plus"
        to="/transaksi-masuk/create"
        >Tambah</UButton
      >
    </div>
    <div class="flex gap-3 flex-wrap items-center">
      <UInput
        v-model="search"
        placeholder="Cari kode transaksi / barang..."
        icon="i-heroicons-magnifying-glass"
        class="max-w-sm"
      />
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
        <USelectMenu
          v-model="statusFilter"
          :items="[
            { label: 'Semua', value: null },
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
          ]"
          value-key="value"
          class="w-36"
        />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Rentang:</span>
        <UInput v-model="startDate" type="date" class="w-40" />
        <span class="text-gray-500">-</span>
        <UInput v-model="endDate" type="date" class="w-40" />
      </div>
    </div>

    <UAlert
      v-if="isAdmin() || isKepsek()"
      icon="i-heroicons-banknotes"
      color="primary"
      variant="soft"
      title="Ringkasan Anggaran"
      :description="`Total pengeluaran dari data yang ditampilkan: ${formatRupiah(grandTotal)}`"
    />

    <AppTable :data="data?.data || []" :columns="columns" v-model:sortBy="sortBy" v-model:sortOrder="sortOrder">
      <template #barang-cell="{ row }">{{
        row.original.masterBarang?.namaBarang
      }}</template>
      <template #pengeluaran-cell="{ row }">
        {{ formatRupiah(row.original.totalPesanan * (row.original.masterBarang?.hargaSatuan || 0)) }}
      </template>
      <template #tanggal-cell="{ row }">{{
        new Date(row.original.tanggalTransaksi).toLocaleDateString("id-ID")
      }}</template>
      <template #status-cell="{ row }"
        ><UBadge
          :color="statusColor(row.original.approvalStatus)"
          variant="subtle"
          >{{ row.original.approvalStatus }}</UBadge
        ></template
      >
      <template #user-cell="{ row }">{{ row.original.user?.name }}</template>
      <template #actions-cell="{ row }">
        <div
          class="flex gap-1"
          v-if="row.original.approvalStatus === 'pending' && canApprove()"
        >
          <UButton
            icon="i-heroicons-check"
            label="Setujui"
            color="success"
            variant="ghost"
            size="xs"
            class="btn-jelly btn-soft"
            @click="handleApprove(row.original.id)"
          />
          <UButton
            icon="i-heroicons-x-mark"
            label="Tolak"
            color="error"
            variant="ghost"
            size="xs"
            class="btn-jelly btn-soft"
            @click="handleReject(row.original.id)"
          />
        </div>
      </template>
    </AppTable>
    <div class="flex justify-center">
      <UPagination
        v-if="data"
        v-model:page="page"
        :total="data.total"
        :items-per-page="20"
      />
    </div>
  </div>
</template>
