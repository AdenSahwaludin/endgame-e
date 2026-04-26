<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
const { hasPermission, canApprove } = usePermission();
const search = ref("");
const page = ref(1);
const statusFilter = ref<string | null>(null);

watch(search, () => {
  page.value = 1;
});

watch(statusFilter, () => {
  page.value = 1;
});

const { data, refresh } = await useFetch("/api/transaksi-masuk", {
  query: computed(() => ({
    search: search.value,
    page: page.value,
    limit: 20,
    status: statusFilter.value || undefined,
  })),
  watch: [search, page, statusFilter],
});

const columns = [
  { id: "kode", accessorKey: "kodeTransaksi", header: "Kode Transaksi" },
  { id: "barang", accessorKey: "masterBarang.namaBarang", header: "Barang" },
  { id: "jumlah", accessorKey: "totalPesanan", header: "Jumlah" },
  { id: "tanggal", accessorKey: "tanggalTransaksi", header: "Tanggal" },
  { id: "status", accessorKey: "approvalStatus", header: "Status" },
  { id: "user", accessorKey: "user.name", header: "Dibuat Oleh" },
  { id: "actions", header: "Aksi" },
];

const statusColor = (s: string) =>
  (({ pending: "yellow", approved: "green", rejected: "red" })[s] ||
    "gray") as any;

async function handleApprove(id: number) {
  if (!confirm("Setujui transaksi ini? Unit barang akan otomatis dibuat."))
    return;
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

async function handleReject(id: number) {
  const notes = prompt("Alasan penolakan:");
  if (notes === null) return;
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
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Transaksi Masuk
      </h2>
      <UButton
        v-if="hasPermission('create_transaksi_barangs')"
        icon="i-heroicons-plus"
        to="/transaksi-masuk/create"
        >Tambah</UButton
      >
    </div>
    <div class="flex gap-3 flex-wrap">
      <UInput
        v-model="search"
        placeholder="Cari kode transaksi / barang..."
        icon="i-heroicons-magnifying-glass"
        class="max-w-sm"
      />
      <USelectMenu
        v-model="statusFilter"
        :items="[
          { label: 'Semua', value: null },
          { label: 'Pending', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
        ]"
        value-key="value"
        class="w-40"
      />
    </div>

    <UTable :data="data?.data || []" :columns="columns">
      <template #barang-cell="{ row }">{{
        row.original.masterBarang?.namaBarang
      }}</template>
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
            color="success"
            variant="ghost"
            size="xs"
            @click="handleApprove(row.original.id)"
          />
          <UButton
            icon="i-heroicons-x-mark"
            color="error"
            variant="ghost"
            size="xs"
            @click="handleReject(row.original.id)"
          />
        </div>
      </template>
    </UTable>
    <div class="flex justify-center">
      <UPagination
        v-if="data"
        v-model="page"
        :total="data.total"
        :items-per-page="20"
      />
    </div>
  </div>
</template>
