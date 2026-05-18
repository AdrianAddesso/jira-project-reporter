export class SemaforoSheet {
    constructor(key) {
        // key = "comunicacion" | "riesgos"
        this.key = key;
        this.url = `/api/sheet-proxy`;
    }

    async getSheetData() {
        try {
        const response = await fetch(this.url);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();

        const rows = data[this.key];

        if (!Array.isArray(rows)) {
            console.error(`Key "${this.key}" no encontrada o no es array`, data);
            return [];
        }

        return rows;
        } catch (error) {
        console.error("Error fetching sheet data:", error);
        throw error;
        }
    }
}
