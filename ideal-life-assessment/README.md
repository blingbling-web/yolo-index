# Ideal Life Alignment Assessment (static)

A lightweight web-based quiz (sales funnel friendly) that:

- Runs as a static site (`index.html` + `app.js` + `config.js`)
- Shows instant results + breakdown + “next best step”
- Captures email at the end and forwards to a Google Sheet webhook
- Provides a LinkedIn share flow

## Customize the quiz (no-code edits)

Edit `config.js`:

- Brand name/tagline
- Questions + dimensions
- Results bands and “next step” mapping
- Calendly link

## Deploy on Vercel

1. Create a new Vercel project and point it at this folder.
2. (Optional) Add environment variable:

- `GOOGLE_SHEETS_WEBHOOK_URL` = your Apps Script Web App URL (see below)

Vercel will serve `index.html` and also deploy `api/lead.js` as a serverless function at `/api/lead`.

## Google Sheets (recommended via Apps Script)

Create a Google Sheet with a tab named `Leads`.

Then open **Extensions → Apps Script** and paste something like:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Leads");
  const payload = JSON.parse(e.postData.contents || "{}");

  const row = [
    new Date(),
    payload.email || "",
    payload.name || "",
    payload.overallPct ?? "",
    payload.lowestDimensionId || "",
    payload.assessmentSlug || "",
    payload.pageUrl || "",
    JSON.stringify(payload.utm || {}),
    JSON.stringify(payload.answers || {}),
  ];

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Deploy it as a **Web app**:

- Execute as: **Me**
- Who has access: **Anyone**

Copy the Web App URL and set it as `GOOGLE_SHEETS_WEBHOOK_URL` in Vercel.

## Local preview

Because this is a static site, you can open `index.html` directly in a browser.
For best results (and to test `/api/lead`), preview via Vercel or any static server.

