<template>
    <div class="container-fluid mt-4 px-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div v-if="store.projectDetails">
                <h2 class="mb-0">
                    {{ store.projectDetails.name }}
                    <small class="text-muted fs-6">({{ store.projectDetails.key }})</small>
                </h2>
            </div>

            <div class="d-flex gap-2">
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
            <div class="d-flex gap-2">
                <button
                    class="btn btn-outline-success d-flex align-items-center gap-2"
                    @click="exportToPDF"
                    :disabled="isExporting || store.loading"
                >
                    <span v-if="isExporting" class="spinner-border spinner-border-sm"></span>
                    <span v-else>📄</span>
                    {{ isExporting ? 'Generando PDF...' : 'Exportar PDF' }}
                </button>
            </div>
        </div>

        <hr />

        <div v-if="store.error" class="alert alert-danger">
            {{ store.error }}
        </div>

        <!-- Wrap the dashboard content in a ref so we can target it for PDF export -->
        <div ref="reportContent" v-if="!store.loading && store.projectDetails" class="row g-3">

            <div class="col-md-3"><QATasksComponent /></div>
            <div class="col-md-3"><ReadyForProdComponent /></div>
            <div class="col-md-3"><BugRateComponent /></div>
            <div class="col-md-3"><EstimationAccuracyComponent /></div>

            <div class="col-lg-7"><VelocityChartComponent /></div>
            <div class="col-lg-5"><UserTimeStatsComponent /></div>

            <div class="col-md-4"><DefectEscapeRateComponent /></div>
            <div class="col-md-4"><QAPassRateComponent /></div>
            <div class="col-md-4"><ProjectDeviationComponent /></div>
            <div class="col-md-12"><SprintSheet /></div>

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

const store = useProjectsStore()
const reportContent = ref(null)
const isExporting = ref(false)

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

const exportToPDF = async () => {
    if (!reportContent.value) return

    isExporting.value = true

    try {
        // Dynamically import html2pdf to avoid SSR issues
        const html2pdf = (await import('html2pdf.js')).default

        const projectName = store.projectDetails?.name ?? 'Reporte'
        const projectKey = store.projectDetails?.key ?? ''
        const filename = `${projectName}_${projectKey}_${new Date().toISOString().slice(0, 10)}.pdf`

        const options = {
            margin:       [10, 10, 10, 10], // top, left, bottom, right (mm)
            filename,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
        }

        await html2pdf().set(options).from(reportContent.value).save()
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