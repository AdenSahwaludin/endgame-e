<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
const { hasPermission } = usePermission();
const page = ref(1);
const showCreate = ref(false);
const loading = ref(false);

const { data: units } = await useFetch("/api/unit-barang", {
  query: { limit: 500, activeOnly: "true", status: "baik" },
});
const { data, refresh } = await useFetch("/api/barang-rusak", {
  query: computed(() => ({ page: page.value })),
  watch: [page],
});

const form = ref({
  unitBarangId: "",
  tanggalKejadian: new Date().toISOString().split("T")[0],
  keterangan: "",
  penanggungJawab: "",
});
const unitOptions = computed(
  () =>
    (units.value as any)?.data?.map((u: any) => ({
      label: `${u.kodeUnit} - ${u.masterBarang?.namaBarang}`,
      value: u.kodeUnit,
    })) || [],
);

const columns = [
  { id: "unit", accessorKey: "unitBarangId", header: "Unit" },
  {
    id: "barang",
    accessorKey: "unitBarang.masterBarang.namaBarang",
    header: "Barang",
  },
  { id: "ruang", accessorKey: "ruang.namaRuang", header: "Ruang" },
  { id: "tanggal", accessorKey: "tanggalKejadian", header: "Tanggal" },
  { id: "keterangan", accessorKey: "keterangan", header: "Keterangan" },
  { id: "user", accessorKey: "user.name", header: "Pelapor" },
];

async function handleSubmit() {
  loading.value = true;
  try {
    await $fetch("/api/barang-rusak", { method: "POST", body: form.value });
    toast.add({
      title: "Berhasil",
      description: "Laporan dibuat, unit dinonaktifkan",
      color: "success",
    });
    showCreate.value = false;
    refresh();
  } catch (e: any) {
    toast.add({
      title: "Error",
      description: e.data?.statusMessage,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Barang Rusak
      </h2>
      <UButton
        v-if="hasPermission('create_barang_rusaks')"
        icon="i-heroicons-plus"
        @click="showCreate = true"
        >Lapor</UButton
      >
    </div>
    <UTable :data="data?.data || []" :columns="columns">
      <template #barang-cell="{ row }">{{
        row.original.unitBarang?.masterBarang?.namaBarang
      }}</template>
      <template #ruang-cell="{ row }">{{
        row.original.ruang?.namaRuang
      }}</template>
      <template #tanggal-cell="{ row }">{{
        row.original.tanggalKejadian
          ? new Date(row.original.tanggalKejadian).toLocaleDateString("id-ID")
          : "-"
      }}</template>
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

    <UModal
      v-model:open="showCreate"
      :ui="{ overlay: 'backdrop-blur-sm bg-black/40 dark:bg-black/50' }"
    >
      <template #content>
        <UCard>
          <template #header
            ><h3 class="text-lg font-semibold">Lapor Barang Rusak</h3></template
          >
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <UFormField label="Unit Barang"
              ><USelectMenu
                v-model="form.unitBarangId"
                :items="unitOptions"
                value-key="value"
                searchable
                class="w-full"
            /></UFormField>
            <UFormField label="Tanggal Kejadian"
              ><UInput
                v-model="form.tanggalKejadian"
                type="date"
                class="w-full"
            /></UFormField>
            <UFormField label="Keterangan"
              ><UTextarea v-model="form.keterangan" class="w-full"
            /></UFormField>
            <UFormField label="Penanggung Jawab"
              ><UInput v-model="form.penanggungJawab" class="w-full"
            /></UFormField>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="showCreate = false"
                >Batal</UButton
              >
              <UButton type="submit" :loading="loading" color="red"
                >Laporkan</UButton
              >
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
