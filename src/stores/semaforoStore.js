import { defineStore } from "pinia";
import { SemaforoSheet } from "../models/SemaforoSheet";

export const useSemaforoStore = defineStore("semaforo", {
    state: () => ({
        comunicacion: [],
        riesgos: [],
    }),
    actions: {
        async fetchComunicacion() {
        const url = import.meta.env.VITE_COMUNICACION_SHEET_URL;
        const sheet = new SemaforoSheet(url);
        this.comunicacion = await sheet.getSheetData();
        },
        async fetchRiesgos() {
        const url = import.meta.env.VITE_RIESGOS_SHEET_URL;
        const sheet = new SemaforoSheet(url);
        this.riesgos = await sheet.getSheetData();
        },
    },
    getters: {
        getComunicacion: (state) => state.comunicacion,
        getRiesgos: (state) => state.riesgos,
    },
});
