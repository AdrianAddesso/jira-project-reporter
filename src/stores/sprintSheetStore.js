import { defineStore } from "pinia";
import { SprintSheet } from "../models/SprintSheet";

export const useSprintSheetStore = defineStore("sprintSheet", {
    state: () => ({
        sprintData: [],
    }),
    actions: {
        async fetchSprintsData() {
            const url = import.meta.env.VITE_SPRINT_SHEET_URL;
            const sprintSheet = new SprintSheet(url);
            const sheetData = await sprintSheet.getSheetData();
            if (sheetData) this.sprintData = sheetData        
        }
    },
    getters: {
        getSprintsData: (state) => state.sprintData || [],
    }
});