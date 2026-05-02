<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
const { hasPermission } = usePermission();
const page = ref(1);
const sortBy = ref("createdAt");
const sortOrder = ref("desc");
const showCreate = ref(false);
const loading = ref(false);

const { data, refresh } = await useFetch("/api/mutasi-lokasi", {
  query: computed(() => ({
    sortBy: sortBy.value,
    sortOrder: sortOrder.value, page: page.value })),
  watch: [page, sortBy, sortOrder],
});

const { data: units } = await useFetch("/api/unit-barang", {
  query: { limit: 500, activeOnly: "true" },
});
const { data: ruangs } = await useFetch("/api/ruang", {
  query: { all: "true" },
});

const form = ref({
  unitBarangId: "",
  ruangTujuanId: 0,
  tanggalMutasi: new Date().toISOString().split("T")[0],
  tipeMutasi: "manual",
  keterangan: "",
});

const tipeMutasiOptions = [
  { label: "Manual", value: "manual" },
  { label: "Pengembalian", value: "pengembalian" },
  { label: "Penyesuaian", value: "penyesuaian" },
];

const unitOptions = computed(
  () =>
    (units.value as any)?.data?.map((u: any) => ({
      label: `${u.kodeUnit} - ${u.masterBarang?.namaBarang || "-"} (${u.ruang?.namaRuang || "-"})`,
      value: u.kodeUnit,
    })) || [],
);

const ruangOptions = computed(() => {
  const list = Array.isArray(ruangs.value)
    ? ruangs.value
    : (ruangs.value as any)?.data || [];
  return list.map((r: any) => ({ label: r.namaRuang, value: r.id }));
});

async function handleCreateMutasi() {
  loading.value = true;
  try {
    await $fetch("/api/mutasi-lokasi", {
      method: "POST",
      body: form.value,
    });
    toast.add({
      title: "Berhasil",
      description: "Mutasi lokasi berhasil dibuat",
      color: "success",
    });
    showCreate.value = false;
    form.value = {
      unitBarangId: "",
      ruangTujuanId: 0,
      tanggalMutasi: new Date().toISOString().split("T")[0],
      tipeMutasi: "manual",
      keterangan: "",
    };
    refresh();
  } catch (e: any) {
    toast.add({
      title: "Error",
      description: e.data?.statusMessage || "Gagal membuat mutasi",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

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
  { id: "tanggal", accessorKey: "tanggalMutasi", header: "Tanggal", sortable: true },
  { id: "user", accessorKey: "user.name", header: "User" },
];
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Mutasi Lokasi
      </h2>
      <UButton
        v-if="hasPermission('create_mutasi_lokasis')"
        icon="i-heroicons-plus"
        @click="showCreate = true"
      >
        Mutasi Baru
      </UButton>
    </div>

    <AppTable :data="data?.data || []" :columns="columns" v-model:sortBy="sortBy" v-model:sortOrder="sortOrder">
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
    </AppTable>
    <div class="flex justify-center">
      <UPagination
        v-if="data"
        v-model="page"
        :total="data.total"
        :items-per-page="20"
      />
    </div>

    <UModal v-model:open="showCreate">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Buat Mutasi Lokasi</h3>
          </template>
          <form @submit.prevent="handleCreateMutasi" class="space-y-4">
            <UFormField label="Unit Barang" required>
              <USelectMenu
                v-model="form.unitBarangId"
                :items="unitOptions"
                value-key="value"
                searchable
                class="w-full"
              />
            </UFormField>
            <UFormField label="Ruang Tujuan" required>
              <USelectMenu
                v-model="form.ruangTujuanId"
                :items="ruangOptions"
                value-key="value"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Tipe Mutasi" required>
              <USelectMenu
                v-model="form.tipeMutasi"
                :items="tipeMutasiOptions"
                value-key="value"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Tanggal Mutasi">
              <UInput v-model="form.tanggalMutasi" type="date" class="w-full" />
            </UFormField>
            <UFormField label="Keterangan">
              <UTextarea v-model="form.keterangan" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="showCreate = false"
                >Batal</UButton
              >
              <UButton type="submit" :loading="loading">Simpan</UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
