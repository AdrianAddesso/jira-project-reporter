<template>
    <div class="card">
        <div class="card-header bg-dark text-white"><b>Acumulado A vs B (Desvío)</b></div>
        <div class="card-body p-0">
        <table class="table mb-0">
            <tbody>
            <tr>
                <td>Total Estimado Proyecto</td>
                <td class="text-end">{{ store.projectDeviation.totalEst }}h</td>
            </tr>
            <tr>
                <td>Total Real Invertido</td>
                <td class="text-end">{{ store.projectDeviation.totalSpent }}h</td>
            </tr>
            <tr class="table-warning">
                <th>Desvío Total</th>
                <th class="text-end" :class="store.projectDeviation.deviation > 0 ? 'text-danger' : 'text-success'">
                {{ store.projectDeviation.deviation }}h
                </th>
            </tr>
            </tbody>
        </table>
        </div>
    </div>
</template>

<script setup>
import { useProjectsStore } from '@/stores/projectsStore'
const store = useProjectsStore()
</script>