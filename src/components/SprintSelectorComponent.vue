<template>
    <div class="d-flex align-items-center gap-2">
        <label class="text-muted small fw-semibold mb-0 text-nowrap">Sprint:</label>

        <select
            class="form-select form-select-sm"
            style="max-width: 280px;"
            :disabled="store.loadingSprintSelector || !filteredSprints.length"
            :value="store.selectedSprint?.id"
            @change="onSelect"
        >
            <option v-if="!filteredSprints.length" disabled value="">
                Cargando sprints...
            </option>
            <option
                v-for="sprint in filteredSprints"
                :key="sprint.id"
                :value="sprint.id"
            >
                {{ sprint.name }}
                <template v-if="sprint.state === 'active'"> ✦</template>
            </option>
        </select>

        <span v-if="store.loadingSprintSelector" class="spinner-border spinner-border-sm text-secondary"></span>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProjectsStore } from '@/stores/projectsStore'

const store = useProjectsStore()

const filteredSprints = computed(() =>
    store.allSprints.filter(sprint =>
        /sprint\s+[0-4]/i.test(sprint.name) && !/KAN/i.test(sprint.name)
    )
)

const onSelect = async (e) => {
    const sprintId = Number(e.target.value)
    const sprint = filteredSprints.value.find(s => s.id === sprintId)
    if (sprint) await store.selectSprint(sprint)
}
</script>