<template>
    <div class="card shadow-sm">
        <div class="card-header bg-white">
        <h6 class="mb-0"><b>Velocity (Time Spent per Sprint)</b></h6>
        </div>
        <div class="card-body">
        <div style="height: 300px;">
            <Bar v-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
            <div v-else class="text-center py-5 text-muted">No sprint data available.</div>
        </div>
        </div>
    </div>
    </template>

    <script setup>
    import { computed } from 'vue'
    import { useProjectsStore } from '@/stores/projectsStore'
    import { Bar } from 'vue-chartjs'
    import { 
    Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale 
    } from 'chart.js'

    ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

    const store = useProjectsStore()

    const chartData = computed(() => {
    const dataMap = store.velocityPerSprint
    return {
        labels: Object.keys(dataMap),
        datasets: [
        {
            label: 'Horas Invertidas',
            backgroundColor: '#0d6efd',
            data: Object.values(dataMap)
        }
        ]
    }
    })

    const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
        beginAtZero: true,
        title: { display: true, text: 'Horas (hs)' }
        }
    },
    plugins: {
        legend: { display: false }
    }
}
</script>