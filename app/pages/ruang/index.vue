<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
const { hasPermission } = usePermission();
const search = ref("");
const page = ref(1);
const showModal = ref(false);
const editMode = ref(false);
const editId = ref(0);
const form = ref({ namaRuang: "" });
const loading = ref(false);

watch(search, () => {
  page.value = 1;
});

const { data, refresh } = await useFetch("/api/ruang", {
  query: computed(() => ({
    search: search.value,
    page: page.value,
    limit: 20,
  })),
  watch: [search, page],
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

async function handleDelete(id: number) {
  if (!confirm("Yakin?")) return;
  await $fetch(`/api/ruang/${id}`, { method: "DELETE" });
  toast.add({ title: "Berhasil dihapus", color: "success" });
  refresh();
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
    <UInput
      v-model="search"
      placeholder="Cari ruang..."
      icon="i-heroicons-magnifying-glass"
      class="max-w-sm"
    />
    <UTable :data="data?.data || []" :columns="columns">
      <template #actions-cell="{ row }">
        <div class="flex gap-1">
          <UButton
            v-if="hasPermission('edit_ruangs')"
            icon="i-heroicons-pencil-square"
            variant="ghost"
            size="xs"
            @click="openEdit(row.original)"
          />
          <UButton
            v-if="hasPermission('delete_ruangs')"
            icon="i-heroicons-trash"
            variant="ghost"
            size="xs"
            color="red"
            @click="handleDelete(row.original.id)"
          />
        </div>
      </template>
    </UTable>
    <div class="flex justify-center">
      <UPagination
        v-if="data"
        v-model="page"
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
