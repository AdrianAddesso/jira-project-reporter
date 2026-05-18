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
        this.comunicacion = await sheet.getSheetData();
        },
        async fetchRiesgos() {
        const sheet = new SemaforoSheet("riesgos");
        this.riesgos = await sheet.getSheetData();
        },
    },
    getters: {
        getComunicacion: (state) => state.comunicacion,
        getRiesgos: (state) => state.riesgos,
    },
});
