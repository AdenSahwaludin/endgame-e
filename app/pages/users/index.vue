<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });

const toast = useToast();
const { hasPermission, isAdmin } = usePermission();
const { confirm } = useConfirm();

const page = ref(1);
const search = ref("");
const sortBy = ref("createdAt");
const sortOrder = ref("desc");
const showModal = ref(false);
const isEditing = ref(false);
const loading = ref(false);

const { data: roles } = await useFetch("/api/roles");
interface UsersResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

const { data, refresh } = await useFetch<UsersResponse>('/api/users', {
  query: computed(() => ({
    search: search.value,
    page: page.value,
    limit: 20,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  })),
  key: 'users-list',
  watch: [page, search, sortBy, sortOrder]
});

const form = ref({
  id: null as number | null,
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
  { id: "email", accessorKey: "email", header: "Email", sortable: true },
  { id: "role", accessorKey: "role.name", header: "Role" },
  { id: "isActive", accessorKey: "isActive", header: "Aktif" },
  { id: "actions", header: "Aksi" },
];

function openCreate() {
  isEditing.value = false;
  form.value = { id: null, name: "", email: "", password: "", roleId: (roleOptions.value[0]?.value || 0), isActive: true };
  showModal.value = true;
}

function openEdit(user: any) {
  isEditing.value = true;
  form.value = { 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    password: "", 
    roleId: user.roleId, 
    isActive: user.isActive 
  };
  showModal.value = true;
}

async function handleSubmit() {
  loading.value = true;
  try {
    const method = isEditing.value ? "PUT" : "POST";
    const url = isEditing.value ? `/api/users/${form.value.id}` : "/api/users";
    
    await $fetch(url as any, { method, body: form.value });
    
    toast.add({
      title: "Berhasil",
      description: `User berhasil ${isEditing.value ? 'diperbarui' : 'dibuat'}`,
      color: "success",
    });
    showModal.value = false;
    refresh();
  } catch (e: any) {
    toast.add({
      title: "Error",
      description: e.data?.statusMessage || "Terjadi kesalahan",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

async function handleDelete(user: any) {
  confirm({
    title: "Hapus User",
    message: `Apakah Anda yakin ingin menghapus user ${user.name}? Tindakan ini akan menonaktifkan akun tersebut.`,
    confirmLabel: "Ya, Hapus",
    color: "error",
    onConfirm: async () => {
      try {
        await $fetch(`/api/users/${user.id}`, { method: "DELETE" });
        toast.add({ title: "Berhasil", description: "User telah dihapus", color: "success" });
        refresh();
      } catch (e: any) {
        toast.add({ title: "Error", description: e.data?.statusMessage, color: "error" });
      }
    }
  });
}

async function handleResetPassword(user: any) {
  confirm({
    title: "Reset Password",
    message: `Reset password untuk ${user.name}? Password akan diubah menjadi default: 'Password123!'`,
    confirmLabel: "Reset Sekarang",
    onConfirm: async () => {
      try {
        await $fetch(`/api/users/${user.id}/reset-password`, { method: "POST" });
        toast.add({ title: "Berhasil", description: "Password berhasil direset", color: "success" });
      } catch (e: any) {
        toast.add({ title: "Error", description: e.data?.statusMessage, color: "error" });
      }
    }
  });
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Users</h2>
      <UButton
        v-if="hasPermission('create_users')"
        icon="i-heroicons-plus"
        class="btn-jelly"
        @click="openCreate"
        >Tambah User</UButton
      >
    </div>

    <div class="flex gap-3 items-center">
      <UInput v-model="search" placeholder="Cari nama atau email..." icon="i-heroicons-magnifying-glass" class="max-w-sm w-full" />
    </div>

    <AppTable :data="data?.data || []" :columns="columns" v-model:sortBy="sortBy" v-model:sortOrder="sortOrder">
      <template #role-cell="{ row }">
        <UBadge variant="subtle">{{ row.original.role?.name }}</UBadge>
      </template>
      <template #isActive-cell="{ row }">
        <UBadge :color="row.original.isActive ? 'success' : 'error'" variant="subtle">
          {{ row.original.isActive ? "Aktif" : "Non-aktif" }}
        </UBadge>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex gap-1">
          <UButton icon="i-heroicons-pencil-square" size="xs" color="primary" variant="ghost" @click="openEdit(row.original)" />
          <UButton icon="i-heroicons-key" size="xs" color="warning" variant="ghost" title="Reset Password" @click="handleResetPassword(row.original)" />
          <UButton icon="i-heroicons-trash" size="xs" color="error" variant="ghost" @click="handleDelete(row.original)" />
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
          <template #header>
            <h3 class="text-lg font-semibold">{{ isEditing ? 'Edit User' : 'Tambah User' }}</h3>
          </template>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <UFormField label="Nama" required>
              <UInput v-model="form.name" required class="w-full" />
            </UFormField>
            <UFormField label="Email" required>
              <UInput v-model="form.email" type="email" required class="w-full" />
            </UFormField>
            <UFormField v-if="!isEditing" label="Password" required>
              <UInput v-model="form.password" type="password" required class="w-full" />
            </UFormField>
            <UFormField label="Role" required>
              <USelectMenu v-model="form.roleId" :items="roleOptions" value-key="value" class="w-full" />
            </UFormField>
            <UFormField label="Status" v-if="isEditing">
              <UCheckbox v-model="form.isActive" label="User Aktif" />
            </UFormField>
            
            <div class="flex justify-end gap-2 pt-4">
              <UButton variant="ghost" color="neutral" @click="showModal = false">Batal</UButton>
              <UButton type="submit" :loading="loading" class="btn-jelly">{{ isEditing ? 'Simpan Perubahan' : 'Tambah' }}</UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
