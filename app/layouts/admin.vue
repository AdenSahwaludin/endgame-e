<script setup lang="ts">
const { user, clear } = useUserSession();
const { hasPermission, isAdmin, canApprove } = usePermission();
const route = useRoute();
const toast = useToast();
const colorMode = useColorMode();

const sidebarOpen = ref(true);

const isDarkMode = computed(() => colorMode.value === "dark");

function toggleColorMode(event: MouseEvent) {
  const x = event.clientX;
  const y = event.clientY;

  if (!document.startViewTransition) {
    colorMode.preference = isDarkMode.value ? "light" : "dark";
    return;
  }

  document.documentElement.style.setProperty("--x", `${x}px`);
  document.documentElement.style.setProperty("--y", `${y}px`);
  
  const targetTheme = isDarkMode.value ? "light" : "dark";
  document.documentElement.setAttribute("data-theme-transition", targetTheme);

  const transition = document.startViewTransition(() => {
    colorMode.preference = targetTheme;
  });

  transition.finished.finally(() => {
    document.documentElement.removeAttribute("data-theme-transition");
  });
}

async function handleLogout() {
  await $fetch("/api/auth/logout", { method: "POST" });
  await clear();
  navigateTo("/login");
}

const navigation = computed(() => {
  const dashboardGroup = {
    label: null as string | null,
    items: [{ label: "Dashboard", icon: "i-heroicons-home", to: "/" }],
  };
  const masterGroup = {
    label: "DATA MASTER",
    items: [] as Array<{ label: string; icon: string; to: string }>,
  };
  const transaksiGroup = {
    label: "TRANSAKSI",
    items: [] as Array<{ label: string; icon: string; to: string }>,
  };
  const pengaturanGroup = {
    label: "PENGATURAN",
    items: [] as Array<{ label: string; icon: string; to: string }>,
  };
  if (hasPermission("view_master_barangs"))
    masterGroup.items.push({
      label: "Master Barang",
      icon: "i-heroicons-archive-box",
      to: "/master-barang",
    });
  if (hasPermission("view_unit_barangs"))
    masterGroup.items.push({
      label: "Unit Barang",
      icon: "i-heroicons-cube",
      to: "/unit-barang",
    });
  if (hasPermission("view_kategoris"))
    masterGroup.items.push({
      label: "Kategori",
      icon: "i-heroicons-tag",
      to: "/kategori",
    });
  if (hasPermission("view_ruangs"))
    masterGroup.items.push({
      label: "Ruang",
      icon: "i-heroicons-building-office",
      to: "/ruang",
    });
  
  

  if (hasPermission("view_transaksi_barangs"))
    transaksiGroup.items.push({
      label: "Pengadaan Barang",
      icon: "i-heroicons-arrow-down-tray",
      to: "/transaksi-masuk",
    });
  if (hasPermission("view_transaksi_keluars"))
    transaksiGroup.items.push({
      label: "Pengelolaan Aset",
      icon: "i-heroicons-arrow-up-tray",
      to: "/transaksi-keluar",
    });
  if (hasPermission("view_barang_rusaks"))
    transaksiGroup.items.push({
      label: "Barang Rusak",
      icon: "i-heroicons-exclamation-triangle",
      to: "/barang-rusak",
    });
  if (hasPermission("view_mutasi_lokasis"))
    transaksiGroup.items.push({
      label: "Mutasi Lokasi",
      icon: "i-heroicons-arrows-right-left",
      to: "/mutasi-lokasi",
    });

  if (hasPermission("view_log_aktivitas"))
    pengaturanGroup.items.push({
      label: "Log Aktivitas",
      icon: "i-heroicons-clipboard-document-list",
      to: "/log-aktivitas",
    });
  if (isAdmin())
    pengaturanGroup.items.push({
      label: "Sistem",
      icon: "i-heroicons-cog-8-tooth",
      to: "/pengaturan/sistem",
    });
  if (hasPermission("view_users"))
    pengaturanGroup.items.push({
      label: "Users",
      icon: "i-heroicons-users",
      to: "/users",
    });
  pengaturanGroup.items.push({
    label: "Akun Saya",
    icon: "i-heroicons-user-circle",
    to: "/akun",
  });

  const laporanGroup = {
    label: "LAPORAN",
    items: [] as Array<{ label: string; icon: string; to: string }>,
  };
  if (hasPermission("generate_laporan"))
    laporanGroup.items.push({
      label: "Laporan",
      icon: "i-heroicons-document-chart-bar",
      to: "/laporan",
    });

  return [dashboardGroup, masterGroup, transaksiGroup, laporanGroup, pengaturanGroup].filter(
    (group) => group.items.length > 0,
  );
});
</script>

<template>
  <div
    class="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
  >
    <!-- Sidebar -->
    <aside
      class="flex flex-col border-r border-gray-200/80 dark:border-gray-800/80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300"
      :class="sidebarOpen ? 'w-64' : 'w-16'"
    >
      <!-- Logo -->
      <div
        class="flex items-center gap-3 px-4 py-5 border-b border-gray-200/80 dark:border-gray-800/80"
      >
        <div
          class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-sm shrink-0"
        >
          TK
        </div>
        <span v-if="sidebarOpen" class="font-bold text-lg truncate"
          >TKT Inventaris</span
        >
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-2 py-4">
        <div
          v-for="(group, groupIndex) in navigation"
          :key="`group-${groupIndex}`"
          class="space-y-1"
          :class="groupIndex > 0 ? 'mt-3' : ''"
        >
          <p
            v-if="group.label && sidebarOpen"
            class="px-3 pt-1 pb-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500"
          >
            {{ group.label }}
          </p>
          <NuxtLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            :class="
              route.path === item.to ||
              (item.to !== '/' && route.path.startsWith(item.to))
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            "
          >
            <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
            <span v-if="sidebarOpen" class="truncate">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </nav>

      <!-- Toggle & User -->
      <div class="border-t border-gray-200/80 dark:border-gray-800/80 p-3">
        <div
          class="rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-gray-50/80 dark:bg-gray-800/60 p-2 shadow-sm space-y-2"
        >
          <UButton
            :icon="
              sidebarOpen
                ? 'i-heroicons-chevron-left'
                : 'i-heroicons-chevron-right'
            "
            :class="sidebarOpen ? 'justify-start' : 'justify-center'"
            variant="soft"
            size="sm"
            color="primary"
            block
            @click="sidebarOpen = !sidebarOpen"
          >
            <span v-if="sidebarOpen">Sembunyikan sidebar</span>
          </UButton>
          <UButton
            icon="i-heroicons-arrow-right-on-rectangle"
            :class="sidebarOpen ? 'justify-start' : 'justify-center'"
            variant="soft"
            size="sm"
            color="error"
            block
            @click="handleLogout"
          >
            <span v-if="sidebarOpen">Keluar</span>
          </UButton>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header
        class="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl"
      >
        <div>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
            Sistem Inventaris TKT
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <ClientOnly>
            <UButton
              :icon="isDarkMode ? 'i-heroicons-sun' : 'i-heroicons-moon'"
              :title="isDarkMode ? 'Aktifkan light mode' : 'Aktifkan dark mode'"
              aria-label="Toggle dark mode"
              variant="soft"
              color="primary"
              size="sm"
              class="rounded-xl"
              @click="toggleColorMode"
            />
            <template #fallback>
              <div class="w-8 h-8"></div>
            </template>
          </ClientOnly>
          <div
            class="flex items-center gap-2 rounded-full border border-gray-200/80 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-800/60 px-3 py-1.5 shadow-sm"
          >
            <UBadge
              :color="
                (user as any)?.role === 'Admin'
                  ? 'error'
                  : (user as any)?.role === 'Kepala Sekolah'
                    ? 'info'
                    : 'success'
              "
              variant="subtle"
            >
              {{ (user as any)?.role }}
            </UBadge>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ (user as any)?.name }}
            </span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6 lg:p-8">
        <slot />
      </main>
    </div>
    <AppConfirm />
  </div>
</template>
