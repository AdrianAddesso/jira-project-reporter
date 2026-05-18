import { defineStore } from "pinia";
import { SemaforoSheet } from "../models/SemaforoSheet";

export const useSemaforoStore = defineStore("semaforo", {
    state: () => ({
        comunicacion: [],
        riesgos: [],
    }),
    actions: {
        async fetchComunicacion() {
        const sheet = new SemaforoSheet("comunicacion");
        const result = await sheet.getSheetData();
        console.log("fetchComunicacion result:", result);
        this.comunicacion = result;
        },
        async fetchRiesgos() {
        const sheet = new SemaforoSheet("riesgos");
        const result = await sheet.getSheetData();
        console.log("fetchRiesgos result:", result);
        this.riesgos = result;
        },
    },
    getters: {
        getComunicacion: (state) => state.comunicacion,
        getRiesgos: (state) => state.riesgos,
    },
});
