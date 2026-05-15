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
          <img
            src="/Logo Tk Teratai.png"
            alt="Logo TK Teratai"
            class="w-24 h-24 mx-auto lg:mx-0 mb-6 drop-shadow-md"
          />
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
            Sistem Inventaris
          </h1>
          <h2 class="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-1">
            TK Teratai
          </h2>
          <p class="text-gray-500 dark:text-gray-400 mt-3 text-lg max-w-md mx-auto lg:mx-0">
            Kelola data barang, pengadaan, dan aset sekolah dengan mudah dan terstruktur.
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
        © 2026 TK Teratai Kota Cirebon. All rights reserved.
      </p>
    </div>
  </div>
</template>
