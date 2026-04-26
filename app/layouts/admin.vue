<script setup lang="ts">
const { user, clear } = useUserSession()
const { hasPermission, isAdmin, canApprove } = usePermission()
const route = useRoute()
const toast = useToast()

const sidebarOpen = ref(true)

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  navigateTo('/login')
}

const navigation = computed(() => {
  const items: any[] = [
    { label: 'Dashboard', icon: 'i-heroicons-home', to: '/' },
  ]

  if (hasPermission('view_kategoris')) items.push({ label: 'Kategori', icon: 'i-heroicons-tag', to: '/kategori' })
  if (hasPermission('view_ruangs')) items.push({ label: 'Ruang', icon: 'i-heroicons-building-office', to: '/ruang' })
  if (hasPermission('view_master_barangs')) items.push({ label: 'Master Barang', icon: 'i-heroicons-archive-box', to: '/master-barang' })
  if (hasPermission('view_unit_barangs')) items.push({ label: 'Unit Barang', icon: 'i-heroicons-cube', to: '/unit-barang' })
  if (hasPermission('view_transaksi_barangs')) items.push({ label: 'Transaksi Masuk', icon: 'i-heroicons-arrow-down-tray', to: '/transaksi-masuk' })
  if (hasPermission('view_transaksi_keluars')) items.push({ label: 'Transaksi Keluar', icon: 'i-heroicons-arrow-up-tray', to: '/transaksi-keluar' })
  if (hasPermission('view_barang_rusaks')) items.push({ label: 'Barang Rusak', icon: 'i-heroicons-exclamation-triangle', to: '/barang-rusak' })
  if (hasPermission('view_mutasi_lokasis')) items.push({ label: 'Mutasi Lokasi', icon: 'i-heroicons-arrows-right-left', to: '/mutasi-lokasi' })
  if (hasPermission('view_log_aktivitas')) items.push({ label: 'Log Aktivitas', icon: 'i-heroicons-clipboard-document-list', to: '/log-aktivitas' })
  if (hasPermission('view_users')) items.push({ label: 'Users', icon: 'i-heroicons-users', to: '/users' })

  return items
})
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Sidebar -->
    <aside
      class="flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300"
      :class="sidebarOpen ? 'w-64' : 'w-16'"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-gray-800">
        <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          TK
        </div>
        <span v-if="sidebarOpen" class="font-bold text-lg truncate">TKT Inventaris</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to))
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
        >
          <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
          <span v-if="sidebarOpen" class="truncate">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Toggle & User -->
      <div class="border-t border-gray-200 dark:border-gray-800 p-3 space-y-2">
        <UButton
          :icon="sidebarOpen ? 'i-heroicons-chevron-left' : 'i-heroicons-chevron-right'"
          variant="ghost"
          size="sm"
          block
          @click="sidebarOpen = !sidebarOpen"
        />
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
            Sistem Inventaris Warehouse TKT
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <UBadge :color="(user as any)?.role === 'Admin' ? 'red' : (user as any)?.role === 'Kepala Sekolah' ? 'blue' : 'green'" variant="subtle">
            {{ (user as any)?.role }}
          </UBadge>
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ (user as any)?.name }}</span>
          <UButton icon="i-heroicons-arrow-right-on-rectangle" variant="ghost" color="red" size="sm" @click="handleLogout" />
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
