<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)

const tahun = ref(new Date().getFullYear())

const { data, pending, refresh } = await useFetch<any[]>('/api/laporan/grafik/tren-pengadaan', {
  query: { tahun },
  key: 'grafik-tren-pengadaan'
})

const chartData = computed(() => {
  if (!data.value) return { labels: [], datasets: [] }
  
  return {
    labels: data.value.map(d => d.label),
    datasets: [{
      label: 'Unit Diadakan',
      data: data.value.map(d => d.count),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
        <UIcon name="i-heroicons-arrow-trending-up" class="w-4 h-4 text-primary-500" />
        Tren Pengadaan Barang (Unit)
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
