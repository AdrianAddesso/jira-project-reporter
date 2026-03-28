export default async function handler(req, res) {
    const path = req.query.path;
    const auth = Buffer.from(
        `${process.env.VITE_JIRA_EMAIL}:${process.env.VITE_JIRA_API_TOKEN}`,
    ).toString("base64");

    const url = `https://${process.env.VITE_JIRA_DOMAIN}${path}${
        req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""
    }`;

    const response = await fetch(url, {
        headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        },
    });

    const data = await response.json();
    res.status(response.status).json(data);
}
