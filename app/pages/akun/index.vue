<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });

const toast = useToast();
const loading = ref(false);

const { data: me, refresh } = await useFetch("/api/auth/me");

const form = ref({
  name: "",
  email: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

watchEffect(() => {
  if (me.value) {
    form.value.name = (me.value as any).name || "";
    form.value.email = (me.value as any).email || "";
  }
});

async function handleSubmit() {
  if (
    form.value.newPassword &&
    form.value.newPassword !== form.value.confirmPassword
  ) {
    toast.add({
      title: "Error",
      description: "Konfirmasi password baru tidak sama",
      color: "error",
    });
    return;
  }

  loading.value = true;
  try {
    await $fetch("/api/auth/me", {
      method: "PUT",
      body: {
        name: form.value.name,
        email: form.value.email,
        currentPassword: form.value.currentPassword,
        newPassword: form.value.newPassword,
      },
    });

    form.value.currentPassword = "";
    form.value.newPassword = "";
    form.value.confirmPassword = "";

    await useUserSession().fetch();
    refresh();
    toast.add({
      title: "Berhasil",
      description: "Informasi akun diperbarui",
      color: "success",
    });
  } catch (e: any) {
    toast.add({
      title: "Error",
      description: e.data?.statusMessage || "Gagal memperbarui akun",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Akun Saya
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Kelola informasi profil dan password Anda.
      </p>
    </div>

    <UCard class="w-full max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Nama" required>
            <UInput v-model="form.name" class="w-full" required />
          </UFormField>
          <UFormField label="Email" required>
            <UInput v-model="form.email" type="email" class="w-full" required />
          </UFormField>
        </div>

        <USeparator label="Ubah Password (opsional)" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Password Saat Ini">
            <UInput
              v-model="form.currentPassword"
              type="password"
              class="w-full"
              placeholder="Wajib jika ganti password"
            />
          </UFormField>
          <UFormField label="Password Baru">
            <UInput
              v-model="form.newPassword"
              type="password"
              class="w-full"
              placeholder="Minimal 8 karakter"
            />
          </UFormField>
        </div>

        <UFormField label="Konfirmasi Password Baru">
          <UInput
            v-model="form.confirmPassword"
            type="password"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end">
          <UButton
            type="submit"
            :loading="loading"
            icon="i-heroicons-check-circle"
            >Simpan Perubahan</UButton
          >
        </div>
      </form>
    </UCard>
  </div>
</template>
