<template>
    <div class="card border-success mb-3">
        <div class="card-body text-center">
        <h6 class="text-success uppercase title">Listas para Prod</h6>
        <h2 class="display-4 fw-bold">{{ store.readyForProdCount }}</h2>
        <p class="text-muted mb-0 subtitle">Esperando despliegue</p>
        </div>
    </div>
</template>

<script setup>
import { useProjectsStore } from '@/stores/projectsStore'
const store = useProjectsStore()
</script>