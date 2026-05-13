<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
const { hasPermission } = usePermission();
const search = ref("");
const page = ref(1);
const sortBy = ref("id");
const sortOrder = ref("asc");
const showModal = ref(false);
const editMode = ref(false);
const editId = ref(0);
const form = ref({ namaRuang: "" });
const loading = ref(false);

watch(search, () => {
  page.value = 1;
});

interface RuangResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

const { data, refresh } = await useFetch<RuangResponse>('/api/ruang', {
  query: computed(() => ({
    search: search.value,
    page: page.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    limit: 20,
  })),
  key: 'ruang-list',
  watch: [page, search, sortBy, sortOrder]
});

const columns = [
  { id: "id", accessorKey: "id", header: "ID" },
  { id: "namaRuang", accessorKey: "namaRuang", header: "Nama Ruang" },
  { id: "actions", header: "Aksi" },
];

function openCreate() {
  editMode.value = false;
  form.value = { namaRuang: "" };
  showModal.value = true;
}
function openEdit(item: any) {
  editMode.value = true;
  editId.value = item.id;
  form.value = { namaRuang: item.namaRuang };
  showModal.value = true;
}

async function handleSubmit() {
  loading.value = true;
  try {
    if (editMode.value) {
      await $fetch(`/api/ruang/${editId.value}`, {
        method: "PUT",
        body: form.value,
      });
    } else {
      await $fetch("/api/ruang", { method: "POST", body: form.value });
    }
    toast.add({ title: "Berhasil", color: "success" });
    showModal.value = false;
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

const { confirm } = useConfirm();

async function handleDelete(id: number) {
  confirm({
    title: "Hapus Ruang",
    message: "Apakah Anda yakin ingin menghapus ruang ini? Tindakan ini tidak dapat dibatalkan.",
    color: "error",
    onConfirm: async () => {
      await $fetch(`/api/ruang/${id}`, { method: "DELETE" });
      toast.add({ title: "Berhasil dihapus", color: "success" });
      refresh();
    }
  });
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Ruang</h2>
      <UButton
        v-if="hasPermission('create_ruangs')"
        icon="i-heroicons-plus"
        @click="openCreate"
        >Tambah</UButton
      >
    </div>
    <div class="flex gap-3 flex-wrap">
      <UInput
        v-model="search"
        placeholder="Cari ruang..."
        icon="i-heroicons-magnifying-glass"
        class="max-w-sm"
      />
    </div>
    <AppTable :data="data?.data || []" :columns="columns" v-model:sortBy="sortBy" v-model:sortOrder="sortOrder">
      <template #actions-cell="{ row }">
        <div class="flex gap-1">
          <UButton
            v-if="hasPermission('edit_ruangs')"
            icon="i-heroicons-pencil-square"
            variant="ghost"
            size="xs"
            class="btn-jelly btn-soft"
            @click="openEdit(row.original)"
          />
          <UButton
            v-if="hasPermission('delete_ruangs')"
            icon="i-heroicons-trash"
            variant="ghost"
            size="xs"
            class="btn-jelly btn-soft"
            color="error"
            @click="handleDelete(row.original.id)"
          />
        </div>
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

    <UModal v-model:open="showModal">
      <template #content>
        <UCard>
          <template #header
            ><h3 class="text-lg font-semibold">
              {{ editMode ? "Edit" : "Tambah" }} Ruang
            </h3></template
          >
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <UFormField label="Nama Ruang"
              ><UInput v-model="form.namaRuang" required class="w-full"
            /></UFormField>
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
