export class SemaforoSheet {
    constructor(sheetName) {
        // Llama al proxy de Vercel en vez de directo al script
        this.url = sheetName
        ? `/api/sheet-proxy?sheet=${encodeURIComponent(sheetName)}`
        : `/api/sheet-proxy`;
    }

    async getSheetData() {
        try {
        const response = await fetch(this.url);
        const data = await response.json();
        // El script devuelve objetos con las keys del header
        return data.map((row) => ({
            punto: row["Punto del plan"] ?? "",
            estado: row["Estado (Semáforo)"] ?? "",
        }));
        } catch (error) {
        console.error("Error fetching sheet data:", error);
        throw error;
        }
    }
}
