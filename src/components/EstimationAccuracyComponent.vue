<template>
    <div class="card shadow-sm border-0 bg-light">
        <div class="card-body text-center">
        <h6 class="text-uppercase small text-muted title">Estimation Accuracy</h6>
        <h3 class="display-6 fw-bold" 
            :class="parseFloat(store.estimationAccuracy) < 70 ? 'text-warning' : 'text-primary'">
            {{ store.estimationAccuracy }}
        </h3>
        <p class="small mb-0 subtitle">Delta entre Est. vs Spent</p>
        </div>
    </div>
</template>

<script setup>
import { useProjectsStore } from '@/stores/projectsStore'
const store = useProjectsStore()
</script>