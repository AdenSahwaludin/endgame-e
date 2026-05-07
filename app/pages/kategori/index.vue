<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
const { hasPermission } = usePermission();

const search = ref("");
const page = ref(1);
const sortBy = ref("createdAt");
const sortOrder = ref("desc");
const showModal = ref(false);
const editMode = ref(false);
const form = ref({ kodeKategori: "", namaKategori: "", deskripsi: "" });
const loading = ref(false);

watch(search, () => {
  page.value = 1;
});

interface KategoriResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

const { data, refresh } = await useFetch<KategoriResponse>("/api/kategori", {
  query: computed(() => ({
    search: search.value,
    page: page.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    limit: 20,
  })),
  watch: [search, page, sortBy, sortOrder],
});

const columns = [
  { id: "kode", accessorKey: "kodeKategori", header: "Kode", sortable: true },
  { id: "nama", accessorKey: "namaKategori", header: "Nama Kategori", sortable: true },
  { id: "deskripsi", accessorKey: "deskripsi", header: "Deskripsi" },
  { id: "actions", header: "Aksi" },
];

function openCreate() {
  editMode.value = false;
  form.value = { kodeKategori: "", namaKategori: "", deskripsi: "" };
  showModal.value = true;
}

function openEdit(item: any) {
  editMode.value = true;
  form.value = {
    kodeKategori: item.kodeKategori,
    namaKategori: item.namaKategori,
    deskripsi: item.deskripsi || "",
  };
  showModal.value = true;
}

async function handleSubmit() {
  loading.value = true;
  try {
    if (editMode.value) {
      await $fetch(`/api/kategori/${form.value.kodeKategori}`, {
        method: "PUT",
        body: form.value,
      });
      toast.add({
        title: "Berhasil",
        description: "Kategori diperbarui",
        color: "success",
      });
    } else {
      await $fetch("/api/kategori", { method: "POST", body: form.value });
      toast.add({
        title: "Berhasil",
        description: "Kategori dibuat",
        color: "success",
      });
    }
    showModal.value = false;
    refresh();
  } catch (e: any) {
    toast.add({
      title: "Error",
      description: e.data?.statusMessage || "Gagal",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

const { confirm } = useConfirm();

async function handleDelete(id: string) {
  confirm({
    title: "Hapus Kategori",
    message: "Apakah Anda yakin ingin menghapus kategori ini?",
    color: "error",
    onConfirm: async () => {
      try {
        await $fetch(`/api/kategori/${id}`, { method: "DELETE" });
        toast.add({
          title: "Berhasil",
          description: "Kategori dihapus",
          color: "success",
        });
        refresh();
      } catch (e: any) {
        toast.add({
          title: "Error",
          description: e.data?.statusMessage,
          color: "error",
        });
      }
    }
  });
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Kategori</h2>
      <UButton
        v-if="hasPermission('create_kategoris')"
        icon="i-heroicons-plus"
        @click="openCreate"
        >Tambah</UButton
      >
    </div>

    <div class="flex gap-3 flex-wrap">
      <UInput
        v-model="search"
        placeholder="Cari kategori..."
        icon="i-heroicons-magnifying-glass"
        class="max-w-sm"
      />
    </div>

    <AppTable :data="data?.data || []" :columns="columns" v-model:sortBy="sortBy" v-model:sortOrder="sortOrder">
      <template #actions-cell="{ row }">
        <div class="flex gap-1">
          <UButton
            v-if="hasPermission('edit_kategoris')"
            icon="i-heroicons-pencil-square"
            variant="ghost"
            size="xs"
            @click="openEdit(row.original)"
          />
          <UButton
            v-if="hasPermission('delete_kategoris')"
            icon="i-heroicons-trash"
            variant="ghost"
            size="xs"
            color="error"
            @click="handleDelete(row.original.kodeKategori)"
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

    <!-- Modal Create/Edit -->
    <UModal v-model:open="showModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">
              {{ editMode ? "Edit Kategori" : "Tambah Kategori" }}
            </h3>
          </template>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <UFormField label="Nama Kategori">
              <UInput
                v-model="form.namaKategori"
                required
                placeholder="Nama kategori"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Deskripsi">
              <UTextarea
                v-model="form.deskripsi"
                placeholder="Deskripsi (opsional)"
                class="w-full"
              />
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="showModal = false"
                >Batal</UButton
              >
              <UButton type="submit" :loading="loading">{{
                editMode ? "Simpan" : "Tambah"
              }}</UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
