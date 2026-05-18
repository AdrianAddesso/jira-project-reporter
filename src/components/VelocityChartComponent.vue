<template>
    <div class="card shadow-sm">
        <div class="card-header bg-white">
        <h6 class="mb-0 title"><b>Velocity ({{ averageHours }} hs/Sprint)</b></h6>
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

    // Nueva variable computada para el promedio
    const averageHours = computed(() => {
        const dataMap = store.velocityPerSprint
        const values = Object.values(dataMap)
        
        if (values.length === 0) return 0
        
        const total = values.reduce((sum, val) => sum + (Number(val) || 0), 0)
        // Retorna el promedio redondeado a un decimal (puedes ajustarlo si lo prefieres entero)
        return (total / values.length).toFixed(1)
    })

    const chartData = computed(() => {
        const dataMap = store.velocityPerSprint
  
        const sortedLabels = Object.keys(dataMap).sort((a, b) => {
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
        })

        return {
            labels: sortedLabels,
            datasets: [
                {
                    label: 'Horas Invertidas',
                    backgroundColor: '#0d6efd',
                    data: sortedLabels.map(label => dataMap[label])
                }
            ]
        }
    })
</script>