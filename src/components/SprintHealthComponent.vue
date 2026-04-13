<template>
    <div class="card shadow-sm h-100">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 class="mb-0"><b>Sprint Health</b></h6>
            <small class="text-muted">{{ health.sprintName }}</small>
        </div>
        <div class="card-body">
            <div class="row g-2 mb-3">
                <div class="col-6">
                    <div class="p-3 rounded-3 text-center" style="background:#f8f9fa">
                        <div class="fs-4 fw-bold text-secondary">{{ health.todo }}</div>
                        <div class="small text-muted">Por hacer</div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="p-3 rounded-3 text-center" style="background:#e7f1ff">
                        <div class="fs-4 fw-bold text-primary">{{ health.inProgress }}</div>
                        <div class="small text-muted">En progreso</div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="p-3 rounded-3 text-center" style="background:#e9f9ef">
                        <div class="fs-4 fw-bold text-success">{{ health.done }}</div>
                        <div class="small text-muted">Completadas</div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="p-3 rounded-3 text-center" style="background:#fff3cd">
                        <div class="fs-4 fw-bold text-warning">{{ health.blocked }}</div>
                        <div class="small text-muted">Bloqueadas</div>
                    </div>
                </div>
            </div>

            <!-- Barra de progreso -->
            <div class="mb-1 d-flex justify-content-between">
                <small class="text-muted">Progreso del sprint</small>
                <small class="fw-semibold">{{ progressPct }}%</small>
            </div>
            <div class="progress" style="height: 10px; border-radius: 8px;">
                <div
                    class="progress-bar bg-success"
                    :style="{ width: progressPct + '%' }"
                ></div>
            </div>
            <div class="d-flex justify-content-between mt-1">
                <small class="text-muted">{{ health.done }} / {{ health.total }} issues</small>
                <small class="text-muted">{{ daysLeft }} días restantes</small>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProjectsStore } from '@/stores/projectsStore'

const store = useProjectsStore()
const health = computed(() => store.sprintHealth)

const progressPct = computed(() => {
    if (!health.value.total) return 0
    return Math.round((health.value.done / health.value.total) * 100)
})

const daysLeft = computed(() => {
    if (!health.value.endDate) return '–'
    const diff = new Date(health.value.endDate) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})
</script>