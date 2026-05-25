<template>
    <div class="card">
        <div class="card-header bg-light"><b>Horas Invertidas (Sprint Activo)</b></div>
        <table class="table mb-0">
        <thead>
            <tr>
            <th>Usuario</th>
            <th>Invertido (hs)</th>
            </tr>
        </thead>
        <tbody>
            <!-- Iterate over the sorted computed array -->
            <tr v-for="user in sortedUserStats" :key="user.name">
            <td>{{ user.name }}</td>
            <td>{{ user.spent }}h</td>
            </tr>
        </tbody>
        </table>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProjectsStore } from '@/stores/projectsStore'

const store = useProjectsStore()

// Create a sorted array from the object
const sortedUserStats = computed(() => {
  return Object.entries(store.userTimeStats)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => a.name.localeCompare(b.name))
})
</script>
