<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)

const tahun = ref(new Date().getFullYear())

const { data, pending, refresh } = await useFetch<any[]>('/api/laporan/grafik/tren-kerusakan', {
  query: { tahun },
  key: 'grafik-tren-kerusakan'
})

const chartData = computed(() => {
  if (!data.value) return { labels: [], datasets: [] }
  
  return {
    labels: data.value.map(d => d.label),
    datasets: [{
      label: 'Laporan Kerusakan/Kehilangan',
      data: data.value.map(d => d.count),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1 } }
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 text-error-500" />
        Tren Laporan Barang Rusak/Hilang
      </h3>
    </div>
    <div class="h-64">
      <USkeleton v-if="pending" class="h-full w-full rounded-lg" />
      <div v-else-if="!data?.length" class="h-full flex items-center justify-center text-sm text-gray-500 italic">Tidak ada data</div>
      <ClientOnly v-else>
        <Line :data="chartData" :options="chartOptions" />
      </ClientOnly>
    </div>
  </div>
</template>
