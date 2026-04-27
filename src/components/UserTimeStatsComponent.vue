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
            <tr v-for="(data, user) in store.userTimeStats" :key="user">
            <td>{{ user }}</td>
            <td>{{ data.spent }}h</td>
            </tr>
        </tbody>
        </table>
    </div>
</template>

<script setup>
import { useProjectsStore } from '@/stores/projectsStore'
const store = useProjectsStore()
</script>
