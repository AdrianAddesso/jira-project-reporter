import axios from "axios";

export class SprintSheet {

    sprintData = [];
    #sheetUrl = ""

    constructor (url) {
        this.#sheetUrl = url;
    }

    getSheetData = async () => {
        try {
            const response = await axios.get(this.#sheetUrl);
            if (response.status === 200) {
                this.sprintData = response.data;
            }
        }
        catch (error) {
            throw new Error(`Error fetching sprint sheet data: ${error.message}`);
        }
        return this.sprintData;
    }

}