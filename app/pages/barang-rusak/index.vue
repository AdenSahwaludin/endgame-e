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
const showDetail = ref(false);
const selectedItem = ref<any>(null);
const loading = ref(false);
const loadingUpdate = ref(false);
const startDate = ref("");
const endDate = ref("");

const statusOptions = [
  { label: 'Dilaporkan', value: 'dilaporkan' },
  { label: 'Sedang Diperbaiki', value: 'sedang_diperbaiki' },
  { label: 'Selesai Diperbaiki', value: 'selesai_diperbaiki' },
  { label: 'Tidak Bisa Diperbaiki', value: 'tidak_bisa_diperbaiki' }
];

const statusColorMap: Record<string, "success" | "info" | "error" | "warning" | "primary" | "secondary" | "neutral"> = {
  dilaporkan: 'warning',
  sedang_diperbaiki: 'info',
  selesai_diperbaiki: 'success',
  tidak_bisa_diperbaiki: 'error'
};

const getStatusLabel = (val: string) => statusOptions.find(o => o.value === val)?.label || val;

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

const { data, refresh } = await useFetch<BarangRusakResponse>('/api/barang-rusak', {
  query: computed(() => ({
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    search: search.value,
    page: page.value,
    limit: 20,
    startDate: startDate.value || undefined,
    endDate: endDate.value || undefined,
  })),
  key: 'barang-rusak-list',
  watch: [page, search, sortBy, sortOrder, startDate, endDate]
});

const form = ref({
  unitBarangId: "",
  tanggalKejadian: new Date().toISOString().split("T")[0],
  keterangan: "",
  penanggungJawab: "",
});

const detailForm = ref({
  status: "",
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
    { id: "no", header: "No." },
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
    { id: "status", accessorKey: "status", header: "Status" },
    { id: "user", accessorKey: "user.name", header: "Pelapor" },
    { id: "aksi", header: "Aksi" }
  );
  return cols;
});

function openDetail(item: any) {
  selectedItem.value = item;
  detailForm.value = {
    status: item.status || 'dilaporkan',
    keterangan: item.keterangan || '',
    penanggungJawab: item.penanggungJawab || ''
  };
  showDetail.value = true;
}

async function handleUpdateDetail() {
  if (!selectedItem.value) return;
  loadingUpdate.value = true;
  try {
    await $fetch(`/api/barang-rusak/${selectedItem.value.id}`, { method: "PUT", body: detailForm.value });
    toast.add({
      title: "Berhasil",
      description: "Data barang rusak berhasil diperbarui",
      color: "success",
    });
    showDetail.value = false;
    refresh();
  } catch (e: any) {
    toast.add({
      title: "Error",
      description: e.data?.statusMessage || 'Gagal memperbarui',
      color: "error",
    });
  } finally {
    loadingUpdate.value = false;
  }
}

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
    <AppTable class="border border-gray-300 dark:border-gray-700 rounded-xl" :ui="{ base: 'min-w-[1000px]' }" :data="data?.data || []" :columns="columns" v-model:sortBy="sortBy" v-model:sortOrder="sortOrder">
      <template #no-cell="{ row }">
        <div class="whitespace-nowrap text-center">{{ (page - 1) * 20 + row.index + 1 }}</div>
      </template>
      <template #barang-cell="{ row }">
        <div class="whitespace-nowrap">{{ row.original.unitBarang?.masterBarang?.namaBarang }}</div>
      </template>
      <template #ruang-cell="{ row }">
        <div class="whitespace-nowrap">{{ row.original.ruang?.namaRuang }}</div>
      </template>
      <template #kerugian-cell="{ row }">
        <div class="whitespace-nowrap">{{ formatRupiah(row.original.unitBarang?.masterBarang?.hargaSatuan || 0) }}</div>
      </template>
      <template #tanggal-cell="{ row }">
        <div class="whitespace-nowrap">{{ row.original.tanggalKejadian ? new Date(row.original.tanggalKejadian).toLocaleDateString("id-ID") : "-" }}</div>
      </template>
      <template #status-cell="{ row }">
        <UBadge :color="statusColorMap[row.original.status || 'dilaporkan']" variant="subtle" class="whitespace-nowrap">
          {{ getStatusLabel(row.original.status || 'dilaporkan') }}
        </UBadge>
      </template>
      <template #user-cell="{ row }">
        <div class="whitespace-nowrap">{{ row.original.user?.name }}</div>
      </template>
      <template #aksi-cell="{ row }">
        <UButton size="xs" color="primary" variant="soft" @click="openDetail(row.original)">Detail</UButton>
      </template>
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
                placeholder="Pilih Unit Barang"
                class="w-full"
            /></UFormField>
            <UFormField label="Tanggal Kejadian"
              ><UInput
                v-model="form.tanggalKejadian"
                type="date"
                class="w-full"
            /></UFormField>
            <UFormField label="Keterangan"
              ><UTextarea v-model="form.keterangan" placeholder="Keterangan" class="w-full"
            /></UFormField>
            <UFormField label="Penanggung Jawab"
              ><UInput v-model="form.penanggungJawab" placeholder="Penanggung Jawab" class="w-full"
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

    <UModal v-model:open="showDetail">
      <template #content>
        <UCard v-if="selectedItem">
          <template #header>
            <h3 class="text-lg font-semibold">Detail Barang Rusak</h3>
          </template>
          <div class="space-y-4 mb-6">
             <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500 dark:text-gray-400 block">Unit</span>
                  <span class="font-medium">{{ selectedItem.unitBarangId }}</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400 block">Barang</span>
                  <span class="font-medium">{{ selectedItem.unitBarang?.masterBarang?.namaBarang }}</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400 block">Ruang</span>
                  <span class="font-medium">{{ selectedItem.ruang?.namaRuang || '-' }}</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400 block">Pelapor</span>
                  <span class="font-medium">{{ selectedItem.user?.name }}</span>
                </div>
             </div>
          </div>
          <form @submit.prevent="handleUpdateDetail" class="space-y-4">
            <UFormField label="Status">
              <USelectMenu
                v-model="detailForm.status"
                :items="statusOptions"
                value-key="value"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Keterangan">
              <UTextarea v-model="detailForm.keterangan" placeholder="Update keterangan (opsional)" class="w-full" />
            </UFormField>
            <UFormField label="Penanggung Jawab Perbaikan">
              <UInput v-model="detailForm.penanggungJawab" placeholder="Nama teknisi / penanggung jawab" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-2 mt-6">
              <UButton variant="ghost" @click="showDetail = false">Tutup</UButton>
              <UButton v-if="hasPermission('create_barang_rusaks')" type="submit" :loading="loadingUpdate" color="primary">Simpan</UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
