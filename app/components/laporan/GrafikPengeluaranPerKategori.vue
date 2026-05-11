<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useCurrency } from '~/composables/useCurrency'

ChartJS.register(ArcElement, Tooltip, Legend)

const { formatRupiah } = useCurrency()
const { palette } = useChartColors()
const tahun = ref(new Date().getFullYear())

const { data, pending, refresh } = await useFetch<any[]>('/api/laporan/grafik/pengeluaran-per-kategori', {
  query: { tahun },
  key: 'grafik-pengeluaran-per-kategori'
})

const chartData = computed(() => {
  if (!data.value) return { labels: [], datasets: [] }
  
  return {
    labels: data.value.map(d => d.label),
    datasets: [{
      data: data.value.map(d => d.total),
      backgroundColor: palette,
      hoverOffset: 4
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const },
    tooltip: {
      callbacks: {
        label: (context: any) => `Total: ${formatRupiah(context.raw)}`
      }
    }
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <UIcon name="i-heroicons-chart-pie" class="w-4 h-4 text-primary-500" />
        Proporsi Pengeluaran per Kategori
      </h3>
    </div>
    <div class="h-64 flex items-center justify-center">
      <USkeleton v-if="pending" class="h-48 w-48 rounded-full" />
      <div v-else-if="!data?.length" class="text-sm text-gray-500 italic">Tidak ada data</div>
      <ClientOnly v-else>
        <Doughnut :data="chartData" :options="chartOptions" />
      </ClientOnly>
    </div>
  </div>
</template>
