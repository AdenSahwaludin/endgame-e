<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
const { hasPermission } = usePermission();
const search = ref("");
const page = ref(1);
const sortBy = ref('createdAt');
const sortOrder = ref('desc');

watch(search, () => {
  page.value = 1;
});

const { data, refresh } = await useFetch("/api/master-barang", {
  query: computed(() => ({
    sortBy: sortBy.value,
    search: search.value,
    page: page.value,
    sortOrder: sortOrder.value,
    limit: 20,
  })),
  watch: [search, page, sortOrder],
});

const columns = [
  { id: "kode", accessorKey: "kodeMaster", header: "Kode" },
  { id: "nama", accessorKey: "namaBarang", header: "Nama Barang" },
  { id: "kategori", accessorKey: "kategori.namaKategori", header: "Kategori" },
  { id: "merk", accessorKey: "merk", header: "Merk" },
  { id: "stok", accessorKey: "_count.unitBarang", header: "Unit Aktif" },
  { id: "min_stok", accessorKey: "reorderPoint", header: "Min. Stok" },
  { id: "actions", header: "Aksi" },
];
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Master Barang
      </h2>
      <UButton
        v-if="hasPermission('create_master_barangs')"
        icon="i-heroicons-plus"
        to="/master-barang/create"
        >Tambah</UButton
      >
    </div>
    <div class="flex gap-3 flex-wrap items-center">
      <UInput
      v-model="search"
      placeholder="Cari barang..."
      icon="i-heroicons-magnifying-glass"
      class="max-w-sm"
    />
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Urutkan:</span>
        <USelectMenu v-model="sortOrder" :items="[{label: 'Terbaru (Desc)', value: 'desc'}, {label: 'Terlama (Asc)', value: 'asc'}]" value-key="value" class="w-40" />
      </div>
    </div>

    <AppTable :data="data?.data || []" :columns="columns" v-model:sortBy="sortBy" v-model:sortOrder="sortOrder">
      <template #kategori-cell="{ row }">
        <UBadge variant="subtle">{{
          row.original.kategori?.namaKategori
        }}</UBadge>
      </template>
      <template #stok-cell="{ row }">
        <UBadge
          :color="
            row.original._count?.unitBarang <= row.original.reorderPoint
              ? 'error'
              : 'success'
          "
        >
          {{ row.original._count?.unitBarang || 0 }}
        </UBadge>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex gap-1">
          <UButton
            icon="i-heroicons-eye"
            variant="ghost"
            size="xs"
            class="btn-jelly btn-soft"
            :to="`/master-barang/${row.original.kodeMaster}`"
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
