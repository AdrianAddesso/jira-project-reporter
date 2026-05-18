<template>
    <div class="card">
        <div class="card-header bg-light">
            <b>{{ title }}</b>
        </div>

        <div class="card-body p-0">
            <div v-if="loading" class="loader p-3">
                <p>Cargando...</p>
            </div>

            <div v-else-if="errorData" class="p-3 text-danger">
                <p>Error: {{ errorData }}</p>
            </div>

            <div v-else class="table-responsive">
                <table class="table table-striped mb-0">
                    <thead>
                        <tr>
                            <th class="punto-col">Punto del plan</th>
                            <th class="estado-col">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in items" :key="index">
                            <td class="punto-label">{{ item.punto }}</td>
                            <td class="estado-cell">
                                <span
                                    class="semaforo-badge"
                                    :class="estadoClass(item.estado)"
                                >
                                    <span class="semaforo-dot"></span>
                                    {{ item.estado }}
                                </span>
                            </td>
                        </tr>
                        <tr v-if="items.length === 0">
                            <td colspan="2" class="text-center text-muted py-3">
                                Sin datos disponibles.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true,
    },
    items: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    errorData: {
        type: String,
        default: null,
    },
});

// Mapea el texto del estado a una clase CSS
const estadoClass = (estado) => {
    const map = {
        green:  "estado-green",
        yellow: "estado-yellow",
        red:    "estado-red",
    };
    return map[(estado || "").toLowerCase()] ?? "estado-unknown";
};
</script>

<style scoped>
table {
    width: 100%;
    font-family: Arial, sans-serif;
    font-size: 14px;
    border-collapse: collapse;
}

th,
td {
    padding: 10px 14px;
    border: 1px solid #ddd;
}

th {
    font-weight: bold;
    background-color: #f8f9fa;
}

.punto-col  { width: 75%; text-align: left; }
.estado-col { width: 25%; text-align: center; }
.punto-label { text-align: left; }
.estado-cell { text-align: center; }

/* Badge con punto de color */
.semaforo-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
}

.semaforo-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

/* Estados */
.estado-green  { background: #d4edda; color: #155724; }
.estado-green  .semaforo-dot { background: #28a745; }

.estado-yellow { background: #fff3cd; color: #856404; }
.estado-yellow .semaforo-dot { background: #ffc107; }

.estado-red    { background: #f8d7da; color: #721c24; }
.estado-red    .semaforo-dot { background: #dc3545; }

.estado-unknown { background: #e2e3e5; color: #383d41; }
.estado-unknown .semaforo-dot { background: #6c757d; }
</style>