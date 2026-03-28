<template>
    <div class="card">
        <div class="card-header bg-light"><b>Estimadas vs Invertidas (Última Semana)</b></div>
        <table class="table mb-0">
        <thead>
            <tr>
            <th>Usuario</th>
            <th>Estimado (hs)</th>
            <th>Invertido (hs)</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(data, user) in store.userTimeStats" :key="user">
            <td>{{ user }}</td>
            <td>{{ data.estimated }}h</td>
            <td :class="data.spent > data.estimated ? 'text-danger' : 'text-success'">
                {{ data.spent }}h
            </td>
            </tr>
        </tbody>
        </table>
    </div>
</template>

<script setup>
import { useProjectsStore } from '@/stores/projectsStore'
const store = useProjectsStore()
</script>