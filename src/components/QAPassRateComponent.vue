<template>
    <div class="card shadow-sm">
        <div class="card-body">
        <h6 class="card-title text-muted">QA Pass Rate (1st Attempt)</h6>
        <h3 class="fw-bold">{{ store.qaPassRate }}</h3>
        <div class="progress" style="height: 8px;">
            <div class="progress-bar bg-success" 
                :style="{ width: store.qaPassRate }"></div>
        </div>
        <small class="d-block mt-2">Tasks/Stories que evitaron 'QA Failed'</small>
        </div>
    </div>
</template>

<script setup>
import { useProjectsStore } from '@/stores/projectsStore'
const store = useProjectsStore()
</script>