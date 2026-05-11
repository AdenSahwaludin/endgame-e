<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { useCurrency } from '~/composables/useCurrency'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const { formatRupiah } = useCurrency()
const tahun = ref(new Date().getFullYear())

const { data, pending, refresh } = await useFetch<any[]>('/api/laporan/grafik/pengeluaran-bulanan', {
  query: { tahun },
  key: 'grafik-pengeluaran-bulanan'
})

const chartData = computed(() => {
  if (!data.value) return { labels: [], datasets: [] }
  
  return {
    labels: data.value.map(d => d.label),
    datasets: [{
      label: 'Pengeluaran',
      data: data.value.map(d => d.total),
      backgroundColor: '#3b82f6',
      borderRadius: 4
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => `Total: ${formatRupiah(context.raw)}`
      }
    }
  },
  scales: {
    y: { 
      beginAtZero: true,
      ticks: {
        callback: (value: any) => {
          if (value >= 1000000) return (value / 1000000).toFixed(1) + ' jt'
          if (value >= 1000) return (value / 1000).toFixed(0) + ' rb'
          return value
        }
      }
    }
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <UIcon name="i-heroicons-banknotes" class="w-4 h-4 text-primary-500" />
        Pengeluaran Pengadaan Bulanan
      </h3>
      <div class="flex items-center gap-2">
        <USelect v-model="tahun" :options="[2024, 2025, 2026]" size="xs" class="w-20" @change="refresh" />
      </div>
    </div>
    <div class="h-64">
      <USkeleton v-if="pending" class="h-full w-full rounded-lg" />
      <div v-else-if="!data?.length" class="h-full flex items-center justify-center text-sm text-gray-500 italic">Tidak ada data</div>
      <ClientOnly v-else>
        <Bar :data="chartData" :options="chartOptions" />
      </ClientOnly>
    </div>
  </div>
</template>
