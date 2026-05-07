<script setup lang="ts">
import { computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  data: { baik: number, dipinjam: number, rusak: number }
}>()

const chartData = computed(() => ({
  labels: ['Baik', 'Dipinjam', 'Rusak'],
  datasets: [
    {
      backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
      borderWidth: 0,
      data: [props.data.baik, props.data.dipinjam, props.data.rusak]
    }
  ]
}))

const chartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#9ca3af',
        padding: 20,
        font: {
          family: "'Inter', sans-serif",
          weight: '500'
        }
      }
    },
    tooltip: {
      backgroundColor: '#1f2937',
      titleFont: { family: "'Inter', sans-serif" },
      bodyFont: { family: "'Inter', sans-serif" },
      padding: 12,
      cornerRadius: 8
    }
  },
  cutout: '75%'
}
</script>

<template>
  <div class="h-64 relative">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>
