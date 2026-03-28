<template>
    <div class="card shadow-sm">
        <div class="card-body">
        <h6 class="card-title text-muted">Defect Escape Rate (KPI)</h6>
        <h3 class="fw-bold">{{ store.defectEscapeRate }}</h3>
        <div class="progress" style="height: 8px;">
            <div class="progress-bar bg-danger" 
                :style="{ width: store.defectEscapeRate }"></div>
        </div>
        <small class="d-block mt-2">Bugs en Prod vs Bugs Totales</small>
        </div>
    </div>
</template>

<script setup>
import { useProjectsStore } from '@/stores/projectsStore'
const store = useProjectsStore()
</script>