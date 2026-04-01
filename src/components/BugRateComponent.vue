<template>
    <div class="card text-white bg-primary">
        <div class="card-body text-center">
        <h6 class="card-title title">Bug Rate (KPI)</h6>
        <h2 class="display-6">{{ store.bugRate }}</h2>
        <small class="subtitle">Bugs por hora invertida en el Sprint</small>
        </div>
    </div>
</template>

<script setup>
import { useProjectsStore } from '@/stores/projectsStore'
const store = useProjectsStore()
</script>