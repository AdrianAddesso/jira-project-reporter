<template>
    <div class="container-fluid mt-4 px-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
        <div v-if="store.projectDetails">
            <h2 class="mb-0">
            {{ store.projectDetails.name }} 
            <small class="text-muted fs-6">({{ store.projectDetails.key }})</small>
            </h2>
        </div>
        
        <button 
            class="btn btn-outline-primary d-flex align-items-center gap-2" 
            @click="handleRefresh"
            :disabled="store.loading"
        >
            <span v-if="store.loading" class="spinner-border spinner-border-sm"></span>
            <span v-else>🔄</span> 
            {{ store.loading ? 'Actualizando...' : 'Refrescar Datos' }}
        </button>
        </div>

        <hr />

        <div v-if="store.error" class="alert alert-danger">
        {{ store.error }}
        </div>

        <div v-if="!store.loading && store.projectDetails" class="row g-3">
        
        <div class="col-md-3"><QATasksComponent /></div>
        <div class="col-md-3"><ReadyForProdComponent /></div>
        <div class="col-md-3"><BugRateComponent /></div>
        <div class="col-md-3"><EstimationAccuracyComponent /></div>

        <div class="col-lg-7"><VelocityChartComponent /></div>
        <div class="col-lg-5"><UserTimeStatsComponent /></div>

        <div class="col-md-4"><DefectEscapeRateComponent /></div>
        <div class="col-md-4"><QAPassRateComponent /></div>
        <div class="col-md-4"><ProjectDeviationComponent /></div>

        </div>
    </div>
    </template>

    <script setup>
    import { onMounted } from 'vue'
    import { useProjectsStore } from '@/stores/projectsStore'

    /** * CORRECCIÓN DE RUTAS: 
     * Si estos archivos están en la misma carpeta que Report.vue, usamos './Nombre.vue'
     * Si están en una subcarpeta src/components/dashboard, usa './dashboard/Nombre.vue'
     */
    import UserTimeStatsComponent from './UserTimeStatsComponent.vue'
    import QATasksComponent from './QATasksComponent.vue' 
    import ReadyForProdComponent from './ReadyForProdComponent.vue'
    import BugRateComponent from './BugRateComponent.vue'
    import DefectEscapeRateComponent from './DefectEscapeRateComponent.vue'
    import QAPassRateComponent from './QAPassRateComponent.vue'
    import VelocityChartComponent from './VelocityChartComponent.vue'
    import EstimationAccuracyComponent from './EstimationAccuracyComponent.vue'
    import ProjectDeviationComponent from './ProjectDeviationComponent.vue'

    const store = useProjectsStore()

    const loadDashboard = async () => {
    const projectKey = 'KAN' 
    await Promise.all([
        store.fetchProjectData(projectKey),
        store.fetchReportData(projectKey)
    ])
    }

    onMounted(loadDashboard)

    const handleRefresh = () => {
    loadDashboard()
    }

    function formatTime(seconds) {
    if (!seconds) return '0h'
    const hours = Math.floor(seconds / 3600)
    return `${hours}h`
}
</script>