<template>
    <div class="card">
        <div class="card-header bg-light">
            <b>Sprints Sheet</b>
        </div>

        <div class="card-body p-0">
            <div v-if="loading" class="loader p-3">
                <p>Loading...</p>
            </div>
            <div v-if="errorData" class="p-3">
                <p>Error: {{ errorData }}</p>
            </div>
            <div v-if="!loading" class="table-responsive">
                <table class="table table-striped mb-0">
                    <thead>
                        <tr>
                            <th>Sprint</th>
                            <th v-for="sprint in sprintData.sprints" :key="sprint">
                                {{ sprint }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(sprintIndicator, nombre) in sprintData.indicadores" :key="nombre">
                            <td class="indicador-label"><strong>{{ nombre }}</strong></td>
                            <td v-for="(value, index) in sprintIndicator" :key="index">
                                {{ value }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card-body border-top">
            <Chart :sprintData="sprintData" />
        </div>
    </div>
</template>

<script setup>
import { useSprintSheetStore } from '../stores/sprintSheetStore';
import { onMounted, ref } from 'vue'
import Chart from './Chart.vue';

const sheetStore = useSprintSheetStore();
const sprintData = ref([]);
const errorData = ref(null);
const loading = ref(false);

const getSprintData = async () => {
    try {
        loading.value = true;
        await sheetStore.fetchSprintsData();
        sprintData.value = sheetStore.getSprintsData;
    } catch (error) {
        errorData.value = error.message;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    getSprintData();
});
</script>

<style scoped>
table {
    border-collapse: collapse;
    width: 100%;
    font-family: Arial, sans-serif;
    font-size: 14px;
}

th,
td {
    padding: 8px 12px;
    text-align: center;
    border: 1px solid #ddd;
}

th {
    font-weight: bold;
}

.indicador-label {
    text-align: left;
    min-width: 150px;
}
</style>