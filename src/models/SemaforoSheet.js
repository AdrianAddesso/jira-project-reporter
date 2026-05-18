export class SemaforoSheet {
    constructor(sheetName) {
        this.url = sheetName
        ? `/api/sheet-proxy?sheet=${encodeURIComponent(sheetName)}`
        : `/api/sheet-proxy`;
    }

    async getSheetData() {
        try {
        const response = await fetch(this.url);
        if (!response.ok) throw new Error(`Error ${response.status}`);

        const data = await response.json();

        // Log para ver qué está llegando exactamente
        console.log("Sheet raw response:", JSON.stringify(data));

        // Normalizar: el script puede devolver array directo u objeto wrapper
        let rows = null;

        if (Array.isArray(data)) {
            rows = data;
        } else if (data?.data && Array.isArray(data.data)) {
            rows = data.data;
        } else if (data?.values && Array.isArray(data.values)) {
            rows = data.values;
        } else {
            console.error("Formato inesperado:", data);
            return [];
        }

        return rows.map((row) => ({
            punto: row["Punto del plan"] ?? row[Object.keys(row)[0]] ?? "",
            estado: row["Estado (Semáforo)"] ?? row[Object.keys(row)[1]] ?? "",
        }));
        } catch (error) {
        console.error("Error fetching sheet data:", error);
        throw error;
        }
    }
}
