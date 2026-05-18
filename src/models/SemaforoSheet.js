export class SemaforoSheet {
    constructor(baseUrl, sheetName) {
        // Agrega el parámetro de tab a la URL base
        this.url = sheetName
        ? `${baseUrl}&sheet=${encodeURIComponent(sheetName)}`
        : baseUrl;
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

        return lines.slice(1).map((line) => {
        const cols = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        return {
            punto: (cols[0] || "").replace(/^"|"$/g, "").trim(),
            estado: (cols[1] || "").replace(/^"|"$/g, "").trim(),
        };
        });
    }
}
