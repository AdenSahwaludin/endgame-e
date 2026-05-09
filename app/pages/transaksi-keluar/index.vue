<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
const { canApprove, hasPermission } = usePermission();
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

interface TransaksiKeluarResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

const { data, refresh } = await useFetch<TransaksiKeluarResponse>("/api/transaksi-keluar", {
  query: computed(() => ({
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    search: search.value,
    page: page.value,
    limit: 20,
    status: statusFilter.value || undefined,
    startDate: startDate.value || undefined,
    endDate: endDate.value || undefined,
  })),
  watch: [search, page, statusFilter, sortBy, sortOrder, startDate, endDate],
});

const columns = [
  { id: "kode", accessorKey: "kodeTransaksi", header: "Kode", sortable: true },
  { id: "unit", accessorKey: "unitBarang.kodeUnit", header: "Unit" },
  { id: "tipe", accessorKey: "tipe", header: "Tipe", sortable: true },
  { id: "tanggal", accessorKey: "tanggalTransaksi", header: "Tanggal", sortable: true },
  { id: "status", accessorKey: "approvalStatus", header: "Status" },
  { id: "user", accessorKey: "user.name", header: "Dibuat Oleh" },
  { id: "actions", header: "Aksi" },
];

const statusColor = (s: string) =>
  (({ pending: "yellow", approved: "green", rejected: "red" })[s] ||
    "gray") as any;
const tipeColor = (t: string) =>
  (({
    pemindahan: "blue",
    peminjaman: "yellow",
    penggunaan: "purple",
    penghapusan: "red",
  })[t] || "gray") as any;

const { confirm } = useConfirm();

async function handleApprove(id: number) {
  confirm({
    title: "Setujui Transaksi",
    message: "Setujui pengelolaan aset ini?",
    color: "success",
    onConfirm: async () => {
      try {
        await $fetch(`/api/transaksi-keluar/${id}/approve`, { method: "POST" });
        toast.add({ title: "Disetujui", color: "success" });
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
        await $fetch(`/api/transaksi-keluar/${id}/reject`, {
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

async function handleReturn(id: number) {
  confirm({
    title: "Kembalikan Unit",
    message: "Tandai unit barang ini sudah kembali dan ubah status ke baik?",
    color: "primary",
    onConfirm: async () => {
      try {
        await $fetch(`/api/transaksi-keluar/${id}/kembalikan`, { method: "POST" });
        toast.add({
          title: "Berhasil",
          description: "Unit dikembalikan dan status menjadi baik",
          color: "success",
        });
        refresh();
      } catch (e: any) {
        toast.add({
          title: "Error",
          description: e.data?.statusMessage || "Gagal mengembalikan unit",
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
        Pengelolaan Aset
      </h2>
      <UButton
        v-if="hasPermission('create_transaksi_keluars')"
        icon="i-heroicons-plus"
        to="/transaksi-keluar/create"
        >Tambah</UButton
      >
    </div>
    <div class="flex gap-3 flex-wrap items-center">
      <UInput
        v-model="search"
        placeholder="Cari kode transaksi / unit..."
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

    <AppTable :data="data?.data || []" :columns="columns" v-model:sortBy="sortBy" v-model:sortOrder="sortOrder">
      <template #unit-cell="{ row }">{{
        row.original.unitBarang?.kodeUnit
      }}</template>
      <template #tipe-cell="{ row }"
        ><UBadge :color="tipeColor(row.original.tipe)" variant="subtle">{{
          row.original.tipe
        }}</UBadge></template
      >
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
        <div class="flex gap-1">
          <template
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
          </template>
          <UButton
            v-if="
              row.original.approvalStatus === 'approved' &&
              ['peminjaman', 'penggunaan'].includes(row.original.tipe) &&
              row.original.unitBarang?.status === 'dipinjam' &&
              hasPermission('create_transaksi_keluars')
            "
            icon="i-heroicons-arrow-uturn-left"
            label="Kembalikan"
            color="primary"
            variant="ghost"
            size="xs"
            class="btn-jelly btn-soft"
            @click="handleReturn(row.original.id)"
          />
        </div>
      </template>
    </AppTable>
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
