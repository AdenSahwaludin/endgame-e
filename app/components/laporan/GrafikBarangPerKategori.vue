<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const { palette } = useChartColors()
const { data, pending } = await useFetch<any[]>('/api/laporan/grafik/barang-per-kategori', {
  key: 'grafik-barang-per-kategori'
})

const chartData = computed(() => {
  if (!data.value) return { labels: [], datasets: [] }
  
  return {
    labels: data.value.map(d => d.label),
    datasets: [{
      label: 'Jumlah Unit',
      data: data.value.map(d => d.count),
      backgroundColor: palette,
      borderRadius: 6
    }]
  }
})

const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: { beginAtZero: true, grid: { display: false } },
    y: { grid: { display: false } }
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-2">
      <UIcon name="i-heroicons-tag" class="w-4 h-4 text-primary-500" />
      Jumlah Barang per Kategori
    </h3>
    <div class="h-64">
      <USkeleton v-if="pending" class="h-full w-full rounded-lg" />
      <div v-else-if="!data?.length" class="h-full flex items-center justify-center text-sm text-gray-500 italic">Tidak ada data</div>
      <ClientOnly v-else>
        <Bar :data="chartData" :options="chartOptions" />
      </ClientOnly>
    </div>
  </div>
</template>
