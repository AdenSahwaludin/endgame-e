<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
const { hasPermission } = usePermission();
const page = ref(1);
const showModal = ref(false);
const loading = ref(false);

const { data: roles } = await useFetch("/api/roles");
const { data, refresh } = await useFetch("/api/users", {
  query: computed(() => ({ page: page.value })),
  watch: [page],
});

const form = ref({
  name: "",
  email: "",
  password: "",
  roleId: 0,
  isActive: true,
});

const roleOptions = computed(() => {
  const list = Array.isArray(roles.value)
    ? roles.value
    : (roles.value as any)?.data || [];
  return list.map((r: any) => ({ label: r.name, value: r.id }));
});

const columns = [
  { id: "name", accessorKey: "name", header: "Nama" },
  { id: "email", accessorKey: "email", header: "Email" },
  { id: "role", accessorKey: "role.name", header: "Role" },
  { id: "isActive", accessorKey: "isActive", header: "Aktif" },
];

async function handleCreate() {
  loading.value = true;
  try {
    await $fetch("/api/users", { method: "POST", body: form.value });
    toast.add({
      title: "Berhasil",
      description: "User dibuat",
      color: "success",
    });
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
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Users</h2>
      <UButton
        v-if="hasPermission('create_users')"
        icon="i-heroicons-plus"
        @click="showModal = true"
        >Tambah User</UButton
      >
    </div>
    <UTable :data="data?.data || []" :columns="columns">
      <template #role-cell="{ row }"
        ><UBadge variant="subtle">{{
          row.original.role?.name
        }}</UBadge></template
      >
      <template #isActive-cell="{ row }"
        ><UBadge
          :color="row.original.isActive ? 'green' : 'red'"
          variant="subtle"
          >{{ row.original.isActive ? "Aktif" : "Non-aktif" }}</UBadge
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

    <UModal
      v-model:open="showModal"
      :ui="{ overlay: 'backdrop-blur-sm bg-black/40 dark:bg-black/50' }"
    >
      <template #content>
        <UCard>
          <template #header
            ><h3 class="text-lg font-semibold">Tambah User</h3></template
          >
          <form @submit.prevent="handleCreate" class="space-y-4">
            <UFormField label="Nama"
              ><UInput v-model="form.name" required class="w-full"
            /></UFormField>
            <UFormField label="Email"
              ><UInput
                v-model="form.email"
                type="email"
                required
                class="w-full"
            /></UFormField>
            <UFormField label="Password"
              ><UInput
                v-model="form.password"
                type="password"
                required
                class="w-full"
            /></UFormField>
            <UFormField label="Role"
              ><USelectMenu
                v-model="form.roleId"
                :items="roleOptions"
                value-key="value"
                class="w-full"
            /></UFormField>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="showModal = false"
                >Batal</UButton
              >
              <UButton type="submit" :loading="loading">Tambah</UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
