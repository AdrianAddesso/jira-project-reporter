export class SemaforoSheet {
    constructor(url) {
        this.url = url;
    }

    async getSheetData() {
        try {
        const response = await fetch(this.url);
        const text = await response.text();
        return this.parseCSV(text);
        } catch (error) {
        console.error("Error fetching sheet data:", error);
        throw error;
        }
    }

    parseCSV(csvText) {
        const lines = csvText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

        if (lines.length < 2) return [];

        // La primera fila son los headers: "Punto del plan", "Estado (Semáforo)"
        const headers = lines[0].split(",").map((h) => h.trim());
        const puntoKey = headers[0];
        const estadoKey = headers[1];

        return lines.slice(1).map((line) => {
        // Split respetando comas dentro de comillas
        const cols = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        return {
            punto: (cols[0] || "").replace(/^"|"$/g, "").trim(),
            estado: (cols[1] || "").replace(/^"|"$/g, "").trim(),
        };
        });
    }
}
