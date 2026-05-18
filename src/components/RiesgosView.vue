<!-- components/RiesgosView.vue -->
<template>
    <SemaforoTable
        title="Riesgos"
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
        await store.fetchRiesgos();
        items.value = store.getRiesgos;
    } catch (error) {
        errorData.value = error.message;
    } finally {
        loading.value = false;
    }
});
</script>