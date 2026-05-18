export default async function handler(req, res) {
    const baseUrl = process.env.VITE_SPRINT_SHEET_URL;

    try {
        const response = await fetch(baseUrl);
        if (!response.ok) throw new Error(`Script respondió ${response.status}`);
        const data = await response.json();

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
