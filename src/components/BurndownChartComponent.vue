<template>
    <div class="card shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 class="mb-0"><b>Burndown Chart</b></h6>
            <small class="text-muted">{{ store.burndownData?.sprintName }}</small>
        </div>
        <div class="card-body">
            <div v-if="!store.burndownData" class="text-center py-5 text-muted">
                Sin datos de sprint activo.
            </div>
            <div v-else style="height: 300px;">
                <Line :data="chartData" :options="chartOptions" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProjectsStore } from '@/stores/projectsStore'
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS, Title, Tooltip, Legend,
    LineElement, PointElement, CategoryScale, LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const store = useProjectsStore()

const chartData = computed(() => ({
    labels: store.burndownData?.labels ?? [],
    datasets: [
        {
            label: 'Ideal',
            data: store.burndownData?.idealLine ?? [],
            borderColor: '#adb5bd',
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 0,
            tension: 0,
        },
        {
            label: 'Real',
            data: store.burndownData?.actualLine ?? [],
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13,110,253,0.08)',
            borderWidth: 2,
            pointRadius: 3,
            fill: true,
            tension: 0.3,
            spanGaps: false,
        },
    ],
}))

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
            title: { display: true, text: 'Horas restantes' },
        },
    },
    plugins: {
        legend: { position: 'top' },
        tooltip: {
            callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}hs`,
            },
        },
    },
}
</script>