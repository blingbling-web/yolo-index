/**
 * Exchanges LinkedIn OAuth authorization code for tokens and returns OpenID profile.
 * Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in Vercel (or .env.local for vercel dev).
 */
async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(503).json({
      ok: false,
      error: "LinkedIn OAuth is not configured (missing LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET).",
    });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }
  if (!body || typeof body !== "object") body = {};

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const redirectUri = typeof body.redirect_uri === "string" ? body.redirect_uri.trim() : "";

  if (!code || !redirectUri) {
    res.status(400).json({ ok: false, error: "Missing code or redirect_uri" });
    return;
  }

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  let tokenRes;
  try {
    tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
  } catch (err) {
    res.status(502).json({ ok: false, error: "Token request failed", details: String(err?.message || err) });
    return;
  }

  const tokenJson = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok) {
    res.status(401).json({
      ok: false,
      error: "Token exchange failed",
      details: tokenJson,
    });
    return;
  }

  const accessToken = tokenJson.access_token;
  if (!accessToken) {
    res.status(401).json({ ok: false, error: "No access token in response", details: tokenJson });
    return;
  }

  let userinfoRes;
  try {
    userinfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (err) {
    res.status(502).json({ ok: false, error: "Profile request failed", details: String(err?.message || err) });
    return;
  }

  const profile = await userinfoRes.json().catch(() => ({}));
  if (!userinfoRes.ok) {
    res.status(502).json({ ok: false, error: "Failed to load LinkedIn profile", details: profile });
    return;
  }

  res.status(200).json({
    ok: true,
    sub: profile.sub,
    name: profile.name,
    email: profile.email,
    picture: profile.picture,
  });
}

module.exports = handler;
