<script setup lang="ts">
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const { tipe } = useChartColors()
const { data, pending } = await useFetch<any[]>('/api/laporan/grafik/tipe-transaksi-keluar', {
  key: 'grafik-tipe-transaksi-keluar'
})

const chartData = computed(() => {
  if (!data.value) return { labels: [], datasets: [] }
  
  const labels = data.value.map(d => d.label.charAt(0).toUpperCase() + d.label.slice(1))
  const counts = data.value.map(d => d.count)
  const bgColors = data.value.map(d => (tipe as any)[d.label] || '#9ca3af')

  return {
    labels,
    datasets: [{
      data: counts,
      backgroundColor: bgColors,
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const }
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-2">
      <UIcon name="i-heroicons-arrows-right-left" class="w-4 h-4 text-primary-500" />
      Komposisi Tipe Pengelolaan Aset
    </h3>
    <div class="h-64 flex items-center justify-center">
      <USkeleton v-if="pending" class="h-48 w-48 rounded-full" />
      <div v-else-if="!data?.length" class="text-sm text-gray-500 italic">Tidak ada data</div>
      <ClientOnly v-else>
        <Pie :data="chartData" :options="chartOptions" />
      </ClientOnly>
    </div>
  </div>
</template>
