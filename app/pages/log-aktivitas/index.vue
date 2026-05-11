<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const page = ref(1);
const sortBy = ref("createdAt");
const sortOrder = ref("desc");
const search = ref("");
const startDate = ref("");
const endDate = ref("");

watch([search, startDate, endDate], () => {
  page.value = 1;
});

interface LogAktivitasResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

const { data } = await useFetch<LogAktivitasResponse>('/api/log-aktivitas', {
  query: computed(() => ({
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    search: search.value,
    startDate: startDate.value || undefined,
    endDate: endDate.value || undefined,
    page: page.value,
    limit: 50,
  })),
  key: 'log-aktivitas-list',
  watch: [page, sortBy, sortOrder, search, startDate, endDate]
});

const columns: any[] = [
  { id: "waktu", accessorKey: "createdAt", header: "Waktu" },
  { id: "user", accessorKey: "user.name", header: "User" },
  { id: "jenis", accessorKey: "jenisAktivitas", header: "Jenis" },
  { id: "tabel", accessorKey: "namaTabel", header: "Tabel", sortable: true },
  { id: "deskripsi", accessorKey: "deskripsi", header: "Deskripsi" },
];

const jenisColor = (j: string) =>
  (({
    create: "green",
    update: "blue",
    delete: "red",
    login: "purple",
    logout: "gray",
  })[j] || "gray") as any;
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
      Log Aktivitas
    </h2>
    <div class="flex gap-3 flex-wrap items-center">
      <UInput
        v-model="search"
        placeholder="Cari deskripsi / aktivitas..."
        icon="i-heroicons-magnifying-glass"
        class="max-w-sm"
      />
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Rentang:</span>
        <UInput v-model="startDate" type="date" class="w-40" />
        <span class="text-gray-500">-</span>
        <UInput v-model="endDate" type="date" class="w-40" />
      </div>
    </div>
    <AppTable :data="data?.data || []" :columns="columns" v-model:sortBy="sortBy" v-model:sortOrder="sortOrder">
      <template #waktu-cell="{ row }">{{
        new Date(row.original.createdAt).toLocaleString("id-ID")
      }}</template>
      <template #user-cell="{ row }">{{ row.original.user?.name }}</template>
      <template #jenis-cell="{ row }"
        ><UBadge
          :color="jenisColor(row.original.jenisAktivitas)"
          variant="subtle"
          >{{ row.original.jenisAktivitas }}</UBadge
        ></template
      >
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
