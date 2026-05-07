<script setup lang="ts">
import { computed } from 'vue'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  data: Array<{ kategori: string, total: number }>
}>()

const chartData = computed(() => ({
  labels: props.data.map(d => d.kategori),
  datasets: [
    {
      label: 'Jumlah Unit',
      backgroundColor: '#10b981',
      hoverBackgroundColor: '#34d399',
      borderRadius: 6,
      maxBarThickness: 40,
      borderSkipped: false,
      data: props.data.map(d => d.total)
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1f2937',
      titleFont: { family: "'Inter', sans-serif" },
      bodyFont: { family: "'Inter', sans-serif" },
      padding: 12,
      cornerRadius: 8,
      displayColors: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false
      },
      ticks: {
        color: '#9ca3af',
        stepSize: 1,
        font: { family: "'Inter', sans-serif" }
      },
      border: { display: false }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#9ca3af',
        font: { family: "'Inter', sans-serif" }
      },
      border: { display: false }
    }
  }
}
</script>

<template>
  <div class="h-64 relative">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
