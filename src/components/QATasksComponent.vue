<template>
    <div class="card border-info mb-3">
        <div class="card-body text-center">
        <h6 class="text-info uppercase title">Tareas en QA</h6>
        <h2 class="display-4 fw-bold">{{ store.qaCount }}</h2>
        <p class="text-muted mb-0 subtitle">Pendientes de revisión</p>
        </div>
    </div>
</template>

<script setup>
import { useProjectsStore } from '@/stores/projectsStore'
const store = useProjectsStore()
</script>