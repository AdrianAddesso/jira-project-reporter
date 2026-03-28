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
            </div>
    </div>
    </template>

    <script setup>
    import { useProjectsStore } from '@/stores/projectsStore'
    import { onMounted } from 'vue'

    const store = useProjectsStore()

    // Encapsulate the fetching logic
    const loadDashboard = async () => {
    const projectKey = 'KAN' // You can make this dynamic later
    await Promise.all([
        store.fetchProjectData(projectKey),
        store.fetchReportData(projectKey)
    ])
    }

    onMounted(loadDashboard)

    const handleRefresh = () => {
    loadDashboard()
}
</script>