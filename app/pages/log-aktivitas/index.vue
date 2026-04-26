<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const page = ref(1);
const { data } = await useFetch("/api/log-aktivitas", {
  query: computed(() => ({ page: page.value })),
  watch: [page],
});

const columns = [
  { id: "waktu", accessorKey: "createdAt", header: "Waktu" },
  { id: "user", accessorKey: "user.name", header: "User" },
  { id: "jenis", accessorKey: "jenisAktivitas", header: "Jenis" },
  { id: "tabel", accessorKey: "namaTabel", header: "Tabel" },
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
    <UTable :data="data?.data || []" :columns="columns">
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
