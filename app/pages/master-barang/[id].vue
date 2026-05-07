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
      <UCard>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <UIcon name="i-heroicons-tag" class="w-4 h-4" />
          <p>Kategori</p>
        </div>
        <p class="font-semibold mt-1">{{ master.kategori?.namaKategori }}</p>
      </UCard>
      <UCard>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <UIcon name="i-heroicons-swatch" class="w-4 h-4" />
          <p>Merk</p>
        </div>
        <p class="font-semibold mt-1">{{ master.merk || "-" }}</p>
      </UCard>
      <UCard>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <UIcon name="i-heroicons-scale" class="w-4 h-4" />
          <p>Satuan</p>
        </div>
        <p class="font-semibold mt-1">{{ master.satuan }}</p>
      </UCard>
      <UCard>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <UIcon name="i-heroicons-cube" class="w-4 h-4" />
          <p>Total Unit</p>
        </div>
        <p class="font-semibold mt-1">{{ master.unitBarang?.length || 0 }}</p>
      </UCard>
    </div>

    <UCard>
      <template #header><h3 class="font-semibold">Daftar Unit</h3></template>
      <AppTable :data="master.unitBarang || []" :columns="unitColumns">
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
            :color="row.original.isActive ? 'success' : 'error'"
            variant="subtle"
            >{{ row.original.isActive ? "Aktif" : "Non-aktif" }}</UBadge
          ></template
        >
      </AppTable>
    </UCard>
  </div>
</template>
