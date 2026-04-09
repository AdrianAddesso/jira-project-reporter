import { createApp } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";

const app = createApp(App);
app.use(createPinia());
app.use(VueApexCharts);
app.mount("#app");
