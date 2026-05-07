<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
const { hasPermission } = usePermission();
const search = ref("");
const page = ref(1);
const sortBy = ref("createdAt");
const sortOrder = ref("desc");
const statusFilter = ref<string | null>(null);

watch(search, () => {
  page.value = 1;
});

watch(statusFilter, () => {
  page.value = 1;
});

interface UnitBarangResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

const { data, refresh } = await useFetch<UnitBarangResponse>("/api/unit-barang", {
  key: "unit-barang-list",
  query: computed(() => ({
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    search: search.value,
    page: page.value,
    limit: 20,
    status: statusFilter.value || undefined,
    activeOnly: "false",
  })),
  watch: [search, page, statusFilter, sortBy, sortOrder],
});

// Scroll to top on page change
watch(page, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const columns = [
  { id: "kode", accessorKey: "kodeUnit", header: "Kode Unit", sortable: true },
  {
    id: "barang",
    accessorKey: "masterBarang.namaBarang",
    header: "Nama Barang",
  },
  { id: "ruang", accessorKey: "ruang.namaRuang", header: "Ruang", sortable: true },
  { id: "status", accessorKey: "status", header: "Status", sortable: true },
  { id: "aktif", accessorKey: "isActive", header: "Aktif" },
  { id: "actions", header: "Aksi" },
];

const statusColor = (s: string) =>
  (({ baik: "green", dipinjam: "yellow", rusak: "red", dihapus: "gray" })[s] ||
    "gray") as any;

const { confirm } = useConfirm();

async function toggleUnit(unit: any) {
  const action = unit.isActive ? "nonaktifkan" : "aktifkan";
  confirm({
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} Unit`,
    message: `Yakin ingin ${action} unit ${unit.kodeUnit}?`,
    color: unit.isActive ? 'error' : 'success',
    onConfirm: async () => {
      try {
        await $fetch(`/api/unit-barang/${unit.kodeUnit}/${action}`, {
          method: "POST",
        });
        toast.add({ title: "Berhasil", color: "success" });
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
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
      Unit Barang
    </h2>
    <div class="flex gap-3 flex-wrap items-center">
      <UInput
        v-model="search"
        placeholder="Cari unit..."
        icon="i-heroicons-magnifying-glass"
        class="max-w-sm"
      />
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
        <USelectMenu
          v-model="statusFilter"
          :items="[
            { label: 'Semua', value: null },
            { label: 'Baik', value: 'baik' },
            { label: 'Dipinjam', value: 'dipinjam' },
            { label: 'Rusak', value: 'rusak' },
            { label: 'Dihapus', value: 'dihapus' },
          ]"
          value-key="value"
          placeholder="Filter status"
          class="w-40"
        />
      </div>
    </div>
    <AppTable :data="data?.data || []" :columns="columns" v-model:sortBy="sortBy" v-model:sortOrder="sortOrder">
      <template #barang-cell="{ row }">{{
        row.original.masterBarang?.namaBarang
      }}</template>
      <template #ruang-cell="{ row }">{{
        row.original.ruang?.namaRuang
      }}</template>
      <template #status-cell="{ row }"
        ><UBadge :color="statusColor(row.original.status)" variant="subtle">{{
          row.original.status
        }}</UBadge></template
      >
      <template #aktif-cell="{ row }"
        ><UBadge
          :color="row.original.isActive ? 'success' : 'error'"
          variant="subtle"
          >{{ row.original.isActive ? "Ya" : "Tidak" }}</UBadge
        ></template
      >
      <template #actions-cell="{ row }">
        <UButton
          v-if="hasPermission('nonaktifkan_unit_barangs')"
          :icon="
            row.original.isActive
              ? 'i-heroicons-no-symbol'
              : 'i-heroicons-check-circle'
          "
          :label="row.original.isActive ? 'Nonaktifkan' : 'Aktifkan'"
          variant="ghost"
          size="xs"
          class="btn-jelly btn-soft"
          :color="row.original.isActive ? 'error' : 'success'"
          @click="toggleUnit(row.original)"
        />
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
