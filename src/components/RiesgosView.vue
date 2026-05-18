<template>
    <div class="card">
        <div class="card-header bg-light">
            <b>Riesgos</b>
        </div>

        <div class="card-body p-0">
            <div v-if="loading" class="p-3">
                <p>Cargando...</p>
            </div>

            <div v-else-if="errorData" class="p-3 text-danger">
                <p>Error: {{ errorData }}</p>
            </div>

            <div v-else class="table-responsive">
                <table class="table table-striped mb-0">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Descripción</th>
                            <th>Probabilidad</th>
                            <th>Impacto</th>
                            <th>Prioridad</th>
                            <th>Plan de Mitigación</th>
                            <th>Responsable</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(riesgo, index) in items" :key="index">
                            <td class="text-nowrap fw-semibold">{{ riesgo["Id"] }}</td>
                            <td class="descripcion-col">{{ riesgo["Descripción del Riesgo"] }}</td>
                            <td>
                                <span class="badge-nivel" :class="nivelClass(riesgo['Probabilidad'])">
                                    {{ riesgo["Probabilidad"] }}
                                </span>
                            </td>
                            <td>
                                <span class="badge-nivel" :class="nivelClass(riesgo['Impacto'])">
                                    {{ riesgo["Impacto"] }}
                                </span>
                            </td>
                            <td>
                                <span class="badge-nivel" :class="prioridadClass(riesgo['Prioridad'])">
                                    {{ riesgo["Prioridad"] }}
                                </span>
                            </td>
                            <td class="mitigacion-col">{{ riesgo["Plan de Mitigación / Acción"] }}</td>
                            <td class="text-nowrap">{{ riesgo["Responsable"] }}</td>
                            <td>
                                <span class="badge-estado" :class="estadoClass(riesgo['Estado'])">
                                    {{ riesgo["Estado"] }}
                                </span>
                            </td>
                        </tr>
                        <tr v-if="items.length === 0">
                            <td colspan="8" class="text-center text-muted py-3">
                                Sin riesgos registrados.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useSemaforoStore } from "../stores/semaforoStore";

const store = useSemaforoStore();
const items = ref([]);
const loading = ref(false);
const errorData = ref(null);

// Probabilidad / Impacto: Alta/Alto → rojo, Media/Medio → amarillo, Baja/Bajo → verde
const nivelClass = (valor) => {
    const v = (valor || "").toLowerCase();
    if (v === "alta" || v === "alto")   return "nivel-alto";
    if (v === "media" || v === "medio") return "nivel-medio";
    if (v === "baja" || v === "bajo")   return "nivel-bajo";
    return "nivel-unknown";
};

// Prioridad: Crítico → rojo oscuro, Alto → rojo, Medio → amarillo, Bajo → verde
const prioridadClass = (valor) => {
    const v = (valor || "").toLowerCase();
    if (v === "crítico") return "prioridad-critico";
    if (v === "alto")    return "nivel-alto";
    if (v === "medio")   return "nivel-medio";
    if (v === "bajo")    return "nivel-bajo";
    return "nivel-unknown";
};

// Estado: Activo → azul, Resuelto → verde, otros → gris
const estadoClass = (valor) => {
    const v = (valor || "").toLowerCase();
    if (v === "activo")   return "estado-activo";
    if (v === "resuelto") return "estado-resuelto";
    return "estado-unknown";
};

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

<style scoped>
table {
    width: 100%;
    font-family: Arial, sans-serif;
    font-size: 13px;
    border-collapse: collapse;
}

th, td {
    padding: 10px 12px;
    border: 1px solid #ddd;
    vertical-align: top;
}

th {
    font-weight: bold;
    background-color: #f8f9fa;
    text-align: center;
    white-space: nowrap;
}

.descripcion-col { min-width: 220px; }
.mitigacion-col  { min-width: 260px; }

/* Badges compartidos */
.badge-nivel,
.badge-estado {
    display: inline-block;
    padding: 3px 9px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
}

/* Niveles */
.nivel-alto      { background: #f8d7da; color: #721c24; }
.nivel-medio     { background: #fff3cd; color: #856404; }
.nivel-bajo      { background: #d4edda; color: #155724; }
.nivel-unknown   { background: #e2e3e5; color: #383d41; }
.prioridad-critico { background: #c0392b; color: #fff; }

/* Estados */
.estado-activo   { background: #cce5ff; color: #004085; }
.estado-resuelto { background: #d4edda; color: #155724; }
.estado-unknown  { background: #e2e3e5; color: #383d41; }
</style>