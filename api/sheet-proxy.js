export default async function handler(req, res) {
    const { sheet } = req.query;
    const baseUrl = process.env.VITE_SPRINT_SHEET_URL;

    const url = sheet ? `${baseUrl}?sheet=${encodeURIComponent(sheet)}` : baseUrl;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Script respondió ${response.status}`);
        const data = await response.json();

        // Si el Apps Script devuelve formato sprint pero pedimos una tab de semáforo,
        // avisamos con un error claro en lugar de mandar datos incorrectos
        const semaforoTabs = ["Comunicacion", "Riesgos"];
        if (sheet && semaforoTabs.includes(sheet) && data?.sprints) {
        return res.status(200).json({
            error: "El Apps Script ignoró el parámetro sheet. Actualizá el doGet.",
        });
        }

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
