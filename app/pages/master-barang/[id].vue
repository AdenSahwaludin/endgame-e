<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const route = useRoute();
const id = route.params.id as string;
const { data: master } = await useFetch(`/api/master-barang/${id}`);

const unitColumns = [
  { id: "kodeUnit", accessorKey: "kodeUnit", header: "Kode Unit" },
  { id: "ruang", accessorKey: "ruang.namaRuang", header: "Ruang" },
  { id: "status", accessorKey: "status", header: "Status" },
  { id: "isActive", accessorKey: "isActive", header: "Aktif" },
];

const statusColor = (s: string) =>
  (({
    baik: "green",
    dipinjam: "yellow",
    rusak: "red",
    dihapus: "gray",
    maintenance: "blue",
  })[s] || "gray") as any;
</script>

<template>
  <div class="space-y-6" v-if="master">
    <div class="flex items-center gap-3">
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        to="/master-barang"
      />
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ master.namaBarang }}
      </h2>
      <UBadge variant="subtle">{{ master.kodeMaster }}</UBadge>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UCard
        ><p class="text-sm text-gray-500">Kategori</p>
        <p class="font-semibold">{{ master.kategori?.namaKategori }}</p></UCard
      >
      <UCard
        ><p class="text-sm text-gray-500">Merk</p>
        <p class="font-semibold">{{ master.merk || "-" }}</p></UCard
      >
      <UCard
        ><p class="text-sm text-gray-500">Satuan</p>
        <p class="font-semibold">{{ master.satuan }}</p></UCard
      >
      <UCard
        ><p class="text-sm text-gray-500">Total Unit</p>
        <p class="font-semibold">{{ master.unitBarang?.length || 0 }}</p></UCard
      >
    </div>

    <UCard>
      <template #header><h3 class="font-semibold">Daftar Unit</h3></template>
      <UTable :data="master.unitBarang || []" :columns="unitColumns">
        <template #ruang-cell="{ row }">{{
          row.original.ruang?.namaRuang
        }}</template>
        <template #status-cell="{ row }"
          ><UBadge :color="statusColor(row.original.status)" variant="subtle">{{
            row.original.status
          }}</UBadge></template
        >
        <template #isActive-cell="{ row }"
          ><UBadge
            :color="row.original.isActive ? 'green' : 'red'"
            variant="subtle"
            >{{ row.original.isActive ? "Aktif" : "Non-aktif" }}</UBadge
          ></template
        >
      </UTable>
    </UCard>
  </div>
</template>
