async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  let body = req.body ?? {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }
  if (!body || typeof body !== "object") body = {};

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    res.status(400).json({ ok: false, error: "Email is required" });
    return;
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    res.status(200).json({
      ok: true,
      forwarded: false,
      note:
        "Missing GOOGLE_SHEETS_WEBHOOK_URL. Set it in your Vercel env vars to store leads in Google Sheets.",
    });
    return;
  }

  const secret = process.env.SHEETS_WEBHOOK_SECRET;
  const forwardPayload = { ...body };
  if (secret) forwardPayload._webhookSecret = secret;

  try {
    const fwd = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forwardPayload),
    });

    const text = await fwd.text().catch(() => "");
    let sheetResponse = {};
    try {
      sheetResponse = text ? JSON.parse(text) : {};
    } catch {
      sheetResponse = { _raw: text };
    }

    /** Google Apps Script Web Apps often return HTTP 200 even when the JSON body says ok: false. */
    if (!fwd.ok || sheetResponse.ok === false) {
      res.status(502).json({
        ok: false,
        error: "Google Sheets webhook rejected or failed the write",
        details: sheetResponse.error || sheetResponse._raw || text || `HTTP ${fwd.status}`,
        sheetResponse: sheetResponse.ok === false ? sheetResponse : undefined,
      });
      return;
    }

    res.status(200).json({ ok: true, forwarded: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Server error", details: String(err?.message || err) });
  }
}

module.exports = handler;
