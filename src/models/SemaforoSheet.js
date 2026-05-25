export class SemaforoSheet {
    constructor(key) {
        this.key = key;
        this.url = `/api/sheet-proxy`;
    }

    async getSheetData() {
        try {
        const response = await fetch(this.url);

        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();

        console.log("Proxy response keys:", Object.keys(data));
        console.log("Buscando key " + this.key + ":", data[this.key]);

        const rows = data[this.key];

        if (!Array.isArray(rows)) {
            console.error("Key no es array:", rows);
            return [];
        }

        return rows;
        } catch (error) {
        console.error("Error fetching sheet data:", error);
        throw error;
        }
    }
    }
