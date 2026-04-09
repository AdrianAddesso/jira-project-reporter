<template>
    <div class="chart-container">
        <div class="chart-wrapper">
            <apexchart v-if="series[0] && series[0].data.length > 0" width="100%" height="400" :options="chartOptions"
                :series="series"></apexchart>
            <div v-else class="loader">
                <p>Cargando datos del reporte...</p>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    props: {
        sprintData: {
            type: Object,
            required: true,
            default: () => ({ sprints: [], indicadores: {} })
        }
    },
    computed: {
        series() {
            const ind = this.sprintData.indicadores || {};  
            return Object.keys(ind).map(chartLabel => {
                const isLine = /acumulado|linea|base|disponibles|proyecto/i.test(chartLabel);
                return {
                    name: chartLabel,
                    type: isLine ? 'line' : 'column',
                    data: ind[chartLabel] || []
                };
            });
        },
        chartOptions() {
            return {
                chart: {
                    id: 'jira-sprint-chart',
                    stacked: false,
                    toolbar: { show: true }
                },
                colors: this.sprintData.sprints.map((_, i) => `hsl(${(i * (360 / this.series.length)) % 360}, 75%, 50%)`),
                stroke: {
                    width: this.series.map(s => s.type === 'line' ? 2 : 0),
                    curve: 'smooth',
                    dashArray: [0, 0, 0, 5]
                },
                xaxis: {
                    categories: this.sprintData.sprints || [],
                    title: { text: 'Sprints' }
                },
                yaxis: {
                    title: { text: "Horas" },
                },
                plotOptions: {
                    bar: { columnWidth: '70%' }
                },
                tooltip: {
                    shared: true,
                    intersect: false,
                    y: {
                        formatter: (val) => val !== undefined ? val + " hs" : val
                    }
                },
                legend: {
                    position: 'right',
                    horizontalAlign: 'center'
                }
            };
        }
    }
}
</script>

<style scoped>
.chart-container {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
}

.chart-wrapper {
    background: white;
    width: 100%;
    max-width: 1200px;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    min-height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-family: 'Roboto', sans-serif;
}
</style>