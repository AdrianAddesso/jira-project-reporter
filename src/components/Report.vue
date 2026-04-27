<template>
    <div class="container-fluid mt-4 px-4">

        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div v-if="store.projectDetails">
                <h2 class="mb-0 fw-semibold">
                    {{ store.projectDetails.name }}
                    <small class="text-muted fs-6 fw-normal ms-1">({{ store.projectDetails.key }})</small>
                </h2>
                <p class="text-muted small mb-0 mt-1">Panel de métricas del proyecto</p>
            </div>

            <!-- Actions grouped together -->
            <div class="d-flex gap-2 align-items-center">
                <button
                    class="btn btn-outline-secondary d-flex align-items-center gap-2"
                    @click="handleRefresh"
                    :disabled="store.loading"
                >
                    <span v-if="store.loading" class="spinner-border spinner-border-sm"></span>
                    <span v-else>🔄</span>
                    {{ store.loading ? 'Actualizando...' : 'Refrescar' }}
                </button>

                <button
                    class="btn btn-success d-flex align-items-center gap-2"
                    @click="exportToPNG"
                    :disabled="isExporting || store.loading"
                >
                    <span v-if="isExporting" class="spinner-border spinner-border-sm"></span>
                    <span v-else>🖼️</span>
                    {{ isExporting ? 'Generando imagen...' : 'Exportar PNG' }}
                </button>
            </div>
        </div>

        <hr class="mb-4" />

        <div v-if="store.error" class="alert alert-danger">
            {{ store.error }}
        </div>

        <div ref="reportContent" v-if="!store.loading && store.projectDetails">

            <!-- Section 1: KPI Cards — 2 per row -->
            <p class="text-muted small text-uppercase fw-semibold letter-spacing-1 mb-2">Indicadores Clave</p>
            <div class="row g-3 mb-4">
                <div class="col-md-6"><QATasksComponent /></div>
                <div class="col-md-6"><ReadyForProdComponent /></div>
                <div class="col-md-6"><BugRateComponent /></div>
                <div class="col-md-6"><EstimationAccuracyComponent /></div>
            </div>
            <p class="text-muted small text-uppercase fw-semibold letter-spacing-1 mb-2">Sprint Activo</p>
            <div class="row g-3 mb-4">
                <div class="col-lg-8"><BurndownChartComponent /></div>
                <div class="col-lg-4"><SprintHealthComponent /></div>
            </div>

            <!-- Section 2: Charts — velocity wide, user stats narrow -->
            <p class="text-muted small text-uppercase fw-semibold letter-spacing-1 mb-2">Rendimiento</p>
            <div class="row g-3 mb-4">
                <div class="col-lg-7"><VelocityChartComponent /></div>
                <div class="col-lg-5"><UserTimeStatsComponent /></div>
            </div>

            <!-- Section 3: Quality metrics — 3 equal columns -->
            <p class="text-muted small text-uppercase fw-semibold letter-spacing-1 mb-2">Calidad</p>
            <div class="row g-3 mb-4">
                <div class="col-md-4"><DefectEscapeRateComponent /></div>
                <div class="col-md-4"><QAPassRateComponent /></div>
                <div class="col-md-4"><ProjectDeviationComponent /></div>
            </div>

            <!-- Section 4: Sprint sheet — full width, centered content -->
            <p class="text-muted small text-uppercase fw-semibold letter-spacing-1 mb-2">Sprint</p>
            <div class="row g-3">
                <div class="col-12 d-flex justify-content-center">
                    <div class="w-100"><SprintSheet /></div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useProjectsStore } from '@/stores/projectsStore'

import UserTimeStatsComponent from './UserTimeStatsComponent.vue'
import QATasksComponent from './QATasksComponent.vue'
import ReadyForProdComponent from './ReadyForProdComponent.vue'
import BugRateComponent from './BugRateComponent.vue'
import DefectEscapeRateComponent from './DefectEscapeRateComponent.vue'
import QAPassRateComponent from './QAPassRateComponent.vue'
import VelocityChartComponent from './VelocityChartComponent.vue'
import EstimationAccuracyComponent from './EstimationAccuracyComponent.vue'
import ProjectDeviationComponent from './ProjectDeviationComponent.vue'
import SprintSheet from './SprintSheet.vue'
import BurndownChartComponent from './BurndownChartComponent.vue'
import SprintHealthComponent from './SprintHealthComponent.vue'

const store = useProjectsStore()
const reportContent = ref(null)
const isExporting = ref(false)

const loadDashboard = async () => {
    const projectKey = 'KAN'
    await Promise.all([
        store.fetchProjectData(projectKey),
        store.fetchReportData(projectKey),
        store.fetchSprintData(2),
        store.fetchUserTimeStats(2),
    ])
}

onMounted(loadDashboard)

const handleRefresh = () => {
    loadDashboard()
}

const exportToPNG = async () => {
    if (!reportContent.value) return

    isExporting.value = true

    try {
        const html2canvas = (await import('html2canvas')).default

        const projectName = store.projectDetails?.name ?? 'Reporte'
        const projectKey = store.projectDetails?.key ?? ''
        const filename = `${projectName}_${projectKey}_${new Date().toISOString().slice(0, 10)}.png`

        const canvas = await html2canvas(reportContent.value, {
            scale: 2,
            useCORS: true,
            logging: false,
            scrollY: 0,
            width: reportContent.value.scrollWidth,
            height: reportContent.value.scrollHeight,
        })

        // Dispara la descarga directamente desde el canvas
        const link = document.createElement('a')
        link.download = filename
        link.href = canvas.toDataURL('image/png')
        link.click()
    } finally {
        isExporting.value = false
    }
}

function formatTime(seconds) {
    if (!seconds) return '0h'
    const hours = Math.floor(seconds / 3600)
    return `${hours}h`
}
</script>
