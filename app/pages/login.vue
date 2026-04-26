<script setup lang="ts">
definePageMeta({ layout: false });

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const toast = useToast();

async function handleLogin() {
  loading.value = true;
  error.value = "";
  try {
    const res = await $fetch("/api/auth/login", {
      method: "POST",
      body: { email: email.value, password: password.value },
    });
    // Refresh session
    await useUserSession().fetch();
    toast.add({
      title: "Login berhasil",
      description: `Selamat datang, ${res.user.name}!`,
      color: "success",
    });
    navigateTo("/");
  } catch (e: any) {
    error.value = e.data?.message || e.data?.statusMessage || "Login gagal";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-linear-to-br from-primary-50 via-white to-primary-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 flex flex-col items-center justify-center"
  >
    <div class="mx-auto w-full max-w-5xl">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div class="text-center lg:text-left">
          <div
            class="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-bold text-2xl mx-auto lg:mx-0 mb-4 shadow-lg"
          >
            TK
          </div>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
            TKT Inventaris
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-3 text-lg">
            Sistem Manajemen Inventaris Warehouse
          </p>
        </div>

        <UCard class="shadow-xl w-full">
          <form @submit.prevent="handleLogin" class="space-y-5">
            <UAlert
              v-if="error"
              :title="error"
              color="error"
              icon="i-heroicons-exclamation-circle"
            />

            <UFormField label="Email">
              <UInput
                v-model="email"
                type="email"
                placeholder="admin@gmail.com"
                icon="i-heroicons-envelope"
                size="lg"
                class="w-full"
                required
              />
            </UFormField>

            <UFormField label="Password">
              <UInput
                v-model="password"
                type="password"
                placeholder="••••••••"
                icon="i-heroicons-lock-closed"
                size="lg"
                class="w-full"
                required
              />
            </UFormField>

            <UButton
              type="submit"
              block
              size="lg"
              :loading="loading"
              icon="i-heroicons-arrow-right-on-rectangle"
            >
              Login
            </UButton>
          </form>
        </UCard>
      </div>

      <p class="text-center text-xs text-gray-400 mt-6">
        © 2026 TKT Warehouse Inventory System
      </p>
    </div>
  </div>
</template>
