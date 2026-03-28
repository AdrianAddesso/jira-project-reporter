<script setup>
import { useProjectsStore } from '@/stores/projectsStore'
import { onMounted } from 'vue'

const store = useProjectsStore()

onMounted(() => {
  store.fetchProjectData('KAN')
})

function formatTime(seconds) {
  if (!seconds) return '-'
  const hours = Math.floor(seconds / 3600)
  return `${hours}h`
}
</script>

<template>
  <div class="container mt-4">
    <h3>Gestión de Proyecto</h3>

    <div v-if="store.loading" class="spinner-border text-primary"></div>

    <div v-else-if="store.error" class="alert alert-danger">
      {{ store.error }}
    </div>

    <div v-else-if="store.projectDetails" class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">{{ store.projectDetails.name }}</h5>
        <p class="card-text">Clave: {{ store.projectDetails.key }}</p>
        <p>Líder: {{ store.projectDetails.lead.displayName }}</p>
      </div>
    </div>

    <button
      class="btn btn-danger mb-3"
      @click="store.fetchBlockedIssues('KAN')"
      :disabled="store.loadingIssues"
    >
      {{ store.loadingIssues ? 'Cargando...' : 'Ver issues bloqueadas' }}
    </button>

    <table v-if="store.blockedIssues.length" class="table table-bordered">
      <thead class="table-dark">
        <tr>
          <th>Key</th>
          <th>Descripción</th>
          <th>Asignado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="issue in store.blockedIssues" :key="issue.id">
          <td>{{ issue.key }}</td>
          <td>{{ issue.fields.summary }}</td>
          <td>{{ issue.fields.assignee?.displayName ?? 'Sin asignar' }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else-if="!store.loadingIssues && store.blockedIssues.length === 0 && store.projectDetails">
      No hay issues bloqueadas.
    </p>
  </div>
</template>