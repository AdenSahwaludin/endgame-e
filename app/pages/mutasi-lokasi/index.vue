<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const page = ref(1);
const { data } = await useFetch("/api/mutasi-lokasi", {
  query: computed(() => ({ page: page.value })),
  watch: [page],
});

const columns = [
  { id: "unit", accessorKey: "unitBarangId", header: "Unit" },
  {
    id: "barang",
    accessorKey: "unitBarang.masterBarang.namaBarang",
    header: "Barang",
  },
  { id: "dari", accessorKey: "ruangAsal.namaRuang", header: "Dari" },
  { id: "ke", accessorKey: "ruangTujuan.namaRuang", header: "Ke" },
  { id: "tipe", accessorKey: "tipeMutasi", header: "Tipe" },
  { id: "tanggal", accessorKey: "tanggalMutasi", header: "Tanggal" },
  { id: "user", accessorKey: "user.name", header: "User" },
];
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
      Mutasi Lokasi
    </h2>
    <UTable :data="data?.data || []" :columns="columns">
      <template #barang-cell="{ row }">{{
        row.original.unitBarang?.masterBarang?.namaBarang
      }}</template>
      <template #dari-cell="{ row }">{{
        row.original.ruangAsal?.namaRuang || "-"
      }}</template>
      <template #ke-cell="{ row }">{{
        row.original.ruangTujuan?.namaRuang
      }}</template>
      <template #tanggal-cell="{ row }">{{
        new Date(row.original.tanggalMutasi).toLocaleDateString("id-ID")
      }}</template>
      <template #tipe-cell="{ row }"
        ><UBadge variant="subtle">{{
          row.original.tipeMutasi
        }}</UBadge></template
      >
      <template #user-cell="{ row }">{{ row.original.user?.name }}</template>
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
