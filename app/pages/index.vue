<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })

const { data: stats, refresh } = await useFetch('/api/dashboard/stats')

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    { label: 'Total Jenis Barang', value: stats.value.totalMaster, icon: 'i-heroicons-archive-box', color: 'primary' as const },
    { label: 'Unit Aktif', value: stats.value.totalUnitAktif, icon: 'i-heroicons-cube', color: 'success' as const },
    { label: 'Unit Dipinjam', value: stats.value.totalUnitDipinjam, icon: 'i-heroicons-arrow-up-tray', color: 'warning' as const },
    { label: 'Unit Rusak', value: stats.value.totalUnitRusak, icon: 'i-heroicons-exclamation-triangle', color: 'error' as const },
    { label: 'Pengadaan Barang Pending', value: stats.value.transaksiMasukPending, icon: 'i-heroicons-clock', color: stats.value.transaksiMasukPending > 0 ? 'warning' as const : 'success' as const },
    { label: 'Pengelolaan Aset Pending', value: stats.value.transaksiKeluarPending, icon: 'i-heroicons-clock', color: stats.value.transaksiKeluarPending > 0 ? 'warning' as const : 'success' as const },
  ]
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
      <UButton icon="i-heroicons-arrow-path" variant="ghost" size="sm" @click="refresh()">
        Refresh
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="stat in statCards" :key="stat.label" class="hover:shadow-md transition-shadow">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            :class="{
              'bg-primary-100 dark:bg-primary-900/30': stat.color === 'primary',
              'bg-green-100 dark:bg-green-900/30': stat.color === 'success',
              'bg-yellow-100 dark:bg-yellow-900/30': stat.color === 'warning',
              'bg-red-100 dark:bg-red-900/30': stat.color === 'error',
            }"
          >
            <UIcon
              :name="stat.icon"
              class="w-6 h-6"
              :class="{
                'text-primary-500': stat.color === 'primary',
                'text-green-500': stat.color === 'success',
                'text-yellow-500': stat.color === 'warning',
                'text-red-500': stat.color === 'error',
              }"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
