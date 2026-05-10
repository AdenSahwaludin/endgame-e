<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
import { computed } from 'vue';
import { useCurrency } from '~/composables/useCurrency';
const { formatRupiah } = useCurrency();
const { hasPermission, isAdmin, isKepsek } = usePermission();
const page = ref(1);
const sortBy = ref("createdAt");
const sortOrder = ref("desc");
const search = ref("");
const showCreate = ref(false);
const loading = ref(false);
const startDate = ref("");
const endDate = ref("");

watch([search, startDate, endDate], () => {
  page.value = 1;
});

const { data: units } = await useFetch("/api/unit-barang", {
  query: { limit: 500, activeOnly: "true", status: "baik" },
});
interface BarangRusakResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

const { data, refresh } = await useAsyncData(
  'barang-rusak-list',
  () => $fetch<BarangRusakResponse>('/api/barang-rusak', {
    query: {
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      search: search.value,
      page: page.value,
      limit: 20,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
    }
  }),
  { watch: [page, search, sortBy, sortOrder, startDate, endDate] }
);

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

const columns = computed(() => {
  const cols: any[] = [
    { id: "unit", accessorKey: "unitBarangId", header: "Unit" },
    {
      id: "barang",
      accessorKey: "unitBarang.masterBarang.namaBarang",
      header: "Barang",
    },
    { id: "ruang", accessorKey: "ruang.namaRuang", header: "Ruang" },
  ];
  if (isAdmin() || isKepsek()) {
    cols.push({ id: "kerugian", header: "Estimasi Kerugian" });
  }
  cols.push(
    { id: "tanggal", accessorKey: "tanggalKejadian", header: "Tanggal", sortable: true },
    { id: "keterangan", accessorKey: "keterangan", header: "Keterangan" },
    { id: "user", accessorKey: "user.name", header: "Pelapor" }
  );
  return cols;
});

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
    <div class="flex gap-3 flex-wrap items-center">
      <UInput
        v-model="search"
        placeholder="Cari unit / barang / keterangan..."
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
      <template #barang-cell="{ row }">{{
        row.original.unitBarang?.masterBarang?.namaBarang
      }}</template>
      <template #ruang-cell="{ row }">{{
        row.original.ruang?.namaRuang
      }}</template>
      <template #kerugian-cell="{ row }">
        {{ formatRupiah(row.original.unitBarang?.masterBarang?.hargaSatuan || 0) }}
      </template>
      <template #tanggal-cell="{ row }">{{
        row.original.tanggalKejadian
          ? new Date(row.original.tanggalKejadian).toLocaleDateString("id-ID")
          : "-"
      }}</template>
      <template #user-cell="{ row }">{{ row.original.user?.name }}</template>
    </AppTable>
    <div class="flex justify-center">
      <UPagination
        v-if="data"
        v-model:page="page"
        :total="data.total"
        :items-per-page="20"
      />
    </div>

    <UModal v-model:open="showCreate">
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
              <UButton type="submit" :loading="loading" color="error"
                >Laporkan</UButton
              >
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
