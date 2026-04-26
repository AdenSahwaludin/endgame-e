<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
const { hasPermission } = usePermission();
const search = ref("");
const page = ref(1);
const statusFilter = ref("");

watch(search, () => {
  page.value = 1;
});

watch(statusFilter, () => {
  page.value = 1;
});

const { data, refresh } = await useFetch("/api/unit-barang", {
  query: computed(() => ({
    search: search.value,
    page: page.value,
    limit: 20,
    status: statusFilter.value,
    activeOnly: "false",
  })),
  watch: [search, page, statusFilter],
});

const columns = [
  { id: "kode", accessorKey: "kodeUnit", header: "Kode Unit" },
  {
    id: "barang",
    accessorKey: "masterBarang.namaBarang",
    header: "Nama Barang",
  },
  { id: "ruang", accessorKey: "ruang.namaRuang", header: "Ruang" },
  { id: "status", accessorKey: "status", header: "Status" },
  { id: "aktif", accessorKey: "isActive", header: "Aktif" },
  { id: "actions", header: "Aksi" },
];

const statusColor = (s: string) =>
  (({ baik: "green", dipinjam: "yellow", rusak: "red", dihapus: "gray" })[s] ||
    "gray") as any;

async function toggleUnit(unit: any) {
  const action = unit.isActive ? "nonaktifkan" : "aktifkan";
  if (!confirm(`Yakin ingin ${action} unit ${unit.kodeUnit}?`)) return;
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
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
      Unit Barang
    </h2>
    <div class="flex gap-3 flex-wrap">
      <UInput
        v-model="search"
        placeholder="Cari unit..."
        icon="i-heroicons-magnifying-glass"
        class="max-w-sm"
      />
      <USelectMenu
        v-model="statusFilter"
        :items="[
          { label: 'Semua', value: '' },
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
    <UTable :data="data?.data || []" :columns="columns">
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
          :color="row.original.isActive ? 'green' : 'red'"
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
          variant="ghost"
          size="xs"
          :color="row.original.isActive ? 'red' : 'green'"
          @click="toggleUnit(row.original)"
        />
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
