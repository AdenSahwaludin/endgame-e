<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
import { computed } from 'vue';
import { useCurrency } from '~/composables/useCurrency';
const { formatRupiah } = useCurrency();
const { hasPermission, isAdmin, isKepsek } = usePermission();
const search = ref("");
const page = ref(1);
const sortBy = ref('createdAt');
const sortOrder = ref('desc');
const kategoriFilter = ref("");

watch(search, () => {
  page.value = 1;
});

interface MasterBarangResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

const { data, refresh } = await useFetch<MasterBarangResponse>("/api/master-barang", {
  query: computed(() => ({
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    search: search.value,
    page: page.value,
    limit: 20,
    kategoriId: kategoriFilter.value || undefined,
  })),
  watch: [search, page, kategoriFilter, sortBy, sortOrder],
});

const columns = computed(() => {
  const cols: any[] = [
    { id: "kode", accessorKey: "kodeMaster", header: "Kode", sortable: true },
    { id: "nama", accessorKey: "namaBarang", header: "Nama Barang", sortable: true },
    { id: "kategori", accessorKey: "kategori.namaKategori", header: "Kategori", sortable: true },
    { id: "merk", accessorKey: "merk", header: "Merk", sortable: true },
    { id: "stok", accessorKey: "unitBarang._count", header: "Unit Aktif", sortable: true },
    { id: "min_stok", accessorKey: "reorderPoint", header: "Min. Stok", sortable: true },
  ];
  if (isAdmin() || isKepsek()) {
    cols.push({ id: "valuasi", header: "Total Valuasi", sortable: true });
  }
  cols.push({ id: "actions", header: "Aksi" });
  return cols;
});
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
      <template #valuasi-cell="{ row }">
        {{ formatRupiah((row.original._count?.unitBarang || 0) * (row.original.hargaSatuan || 0)) }}
      </template>
      <template #actions-cell="{ row }">
        <div class="flex gap-1">
          <UButton
            icon="i-heroicons-eye"
            color="neutral"
            variant="soft"
            size="xs"
            class="btn-jelly"
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
