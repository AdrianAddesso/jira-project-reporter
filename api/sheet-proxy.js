export default async function handler(req, res) {
  const { sheet } = req.query;
  const baseUrl = process.env.VITE_SPRINT_SHEET_URL;

  const url = sheet ? `${baseUrl}?sheet=${encodeURIComponent(sheet)}` : baseUrl;

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
