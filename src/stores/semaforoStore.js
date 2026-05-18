import { defineStore } from "pinia";
import { SemaforoSheet } from "../models/SemaforoSheet";

const BASE_URL = import.meta.env.VITE_SPRINT_SHEET_URL;

export const useSemaforoStore = defineStore("semaforo", {
    state: () => ({
        comunicacion: [],
        riesgos: [],
    }),
    actions: {
        async fetchComunicacion() {
        const sheet = new SemaforoSheet(BASE_URL, "Comunicacion");
        this.comunicacion = await sheet.getSheetData();
        },
        async fetchRiesgos() {
        const sheet = new SemaforoSheet(BASE_URL, "Riesgos");
        this.riesgos = await sheet.getSheetData();
        },
    },
    getters: {
        getComunicacion: (state) => state.comunicacion,
        getRiesgos: (state) => state.riesgos,
    },
});
