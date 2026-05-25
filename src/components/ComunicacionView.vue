<template>
    <SemaforoTable
        title="Comunicación"
        :items="items"
        :loading="loading"
        :error-data="errorData"
    />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useSemaforoStore } from "../stores/semaforoStore";
import SemaforoTable from "./SemaforoTable.vue";

const store = useSemaforoStore();
const items = ref([]);
const loading = ref(false);
const errorData = ref(null);

onMounted(async () => {
    try {
        loading.value = true;
        await store.fetchComunicacion();
        items.value = store.getComunicacion.map(row => ({
            punto: row["Punto del plan"] ?? "",
            estado: row["Estado (Semáforo)"] ?? "",
        }));
    } catch (error) {
        errorData.value = error.message;
    } finally {
        loading.value = false;
    }
});
</script>