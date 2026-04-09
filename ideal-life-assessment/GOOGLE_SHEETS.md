# Connect quiz submissions to **Google Sheets**

You probably mean **Google Sheets** (a spreadsheet)—not “Google Tracks.” This project already sends each email submission (with full quiz results) to your backend at `/api/lead`, which can **forward** that data into a sheet.

## What gets saved

When someone submits the form on the results page, the app POSTs JSON that includes:

- Email, name (optional), timestamp  
- Result **pattern** title and id  
- Dimension averages (clarity, alignment, action), identity score, constraints  
- All **answers** (as JSON in the last column)  
- UTM params, page URL, LinkedIn id (if signed in)

The file `google-apps-script/WebApp.gs` turns each POST into **one new row** with clear column headers.

---

## Step 1 — Create the spreadsheet

1. Open [Google Sheets](https://sheets.google.com) and create a **new blank spreadsheet**.  
2. Name it (e.g. “Quiz leads”).  
3. Copy the **Spreadsheet ID** from the URL:

   `https://docs.google.com/spreadsheets/d/`**`THIS_PART_IS_THE_ID`**`/edit`

---

## Step 2 — Add the Apps Script

1. In that spreadsheet, go to **Extensions → Apps Script**.  
2. Delete any code in `Code.gs`, then paste the full contents of **`google-apps-script/WebApp.gs`** from this repo.  
3. In the script, set:

   ```javascript
   var SHEET_ID = "YOUR_SPREADSHEET_ID_FROM_STEP_1";
   ```

4. Click **Save** (disk icon).

---

## Step 3 — Deploy as a web app (this is your webhook URL)

1. In Apps Script, click **Deploy → New deployment**.  
2. Click the gear → **Web app**.  
3. Set:
   - **Execute as:** Me  
   - **Who has access:** **Anyone**  
     (Your Vercel server will POST here; it is not a browser login.)
4. Click **Deploy**.  
5. **Authorize** when prompted (review permissions for the script to edit your spreadsheet).  
6. **Copy the Web app URL** — it looks like:

   `https://script.google.com/macros/s/AKfycb.../exec`

   This URL is your **`GOOGLE_SHEETS_WEBHOOK_URL`**.

---

## Step 4 — Link Vercel to the webhook

1. In the [Vercel](https://vercel.com) project → **Settings → Environment Variables**.  
2. Add:

   | Name | Value |
   |------|--------|
   | `GOOGLE_SHEETS_WEBHOOK_URL` | The Web app URL from Step 3 |

3. (Optional, recommended) Add a shared secret so random people cannot POST fake rows if the URL leaks:

   | Name | Value |
   |------|--------|
   | `SHEETS_WEBHOOK_SECRET` | A long random string (same in Apps Script—see Step 5) |

4. **Redeploy** the project so the new env vars apply.

---

## Step 5 — (Optional) Webhook secret in Apps Script

1. Apps Script → **Project Settings** (gear) → **Script properties**.  
2. Add property: **`WEBHOOK_SECRET`** = the **same** value as `SHEETS_WEBHOOK_SECRET` on Vercel.  
3. **Deploy → Manage deployments** → **Edit** (pencil) → create a **New version** → **Deploy**  
   (Required after script changes.)

The server adds `_webhookSecret` only when forwarding; it is **not** stored in the sheet.

---

## Step 6 — Verify the link works

### A) Browser (GET)

Open the Web app URL in a browser. You should see:  
`Quiz → Sheets webhook is running.`

### B) Command line (POST — mimics Vercel)

Replace `YOUR_WEB_APP_URL`:

```bash
curl -sS -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","yoloTypeTitle":"Smoke test","yoloType":"test","submittedAt":"2026-01-01T00:00:00.000Z","answers":{},"dimensionAvgs":{},"constraintTags":[]}'
```

You should get `{"ok":true,"forwarded":true}` and a **new row** in the first sheet (headers appear on first real append).

### C) End-to-end through Vercel

After `GOOGLE_SHEETS_WEBHOOK_URL` is set and redeployed:

1. Open your **production** quiz URL.  
2. Complete the quiz and submit the email form.  
3. Confirm a new row appears in the sheet.

If `/api/lead` returns `forwarded: false`, the webhook URL is still missing on the server. Check env vars and redeploy.

---

## Debugging (nothing appears in the Sheet)

Do these **in order**:

1. **Push the latest code** (including the `api/lead.js` that checks the Google response) and **redeploy** Vercel.
2. Submit the quiz email form again. If something is wrong, the **fine print under the button** should now show a **specific error** (not only “Couldn’t send”).
3. **Vercel → Project → Deployments → latest → Functions / Logs** — open **Runtime Logs**, submit again, and look for `/api/lead` errors.
4. Confirm **Environment Variables** has **`GOOGLE_SHEETS_WEBHOOK_URL`** exactly matching your **Deploy** Web App URL (ends in `/exec`), then **Redeploy** after any change.
5. If you use a **webhook secret**: Vercel **`SHEETS_WEBHOOK_SECRET`** must **equal** Apps Script **Script properties → `WEBHOOK_SECRET`**. If one side has a secret and the other doesn’t, the script returns **Unauthorized** and no row is written.
6. **Test Google directly** (replace the URL):

   ```bash
   curl -sS -X POST "YOUR_WEB_APP_URL" \
     -H "Content-Type: application/json" \
     -d '{"email":"debug-test@example.com","yoloTypeTitle":"curl","yoloType":"t","submittedAt":"2026-01-01T00:00:00.000Z","answers":{},"dimensionAvgs":{},"constraintTags":[]}'
   ```

   You want `{"ok":true,...}` in the response body **and** a new row. If you see `ok:false`, read the `error` field.

7. **Subfolder sites:** The quiz calls **`/api/lead`** on the **same host** as the page. The site must be served at the domain root (e.g. `yoursite.vercel.app`), not only a path, unless you change `endpoints.lead` in `config.js` to include a base path.

---

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| No new rows | Web app **New version** deployed after edits; Vercel env set and **redeployed**; `SHEET_ID` in script matches the sheet. |
| 403 Unauthorized | `WEBHOOK_SECRET` in Script properties must match Vercel `SHEETS_WEBHOOK_SECRET`; redeploy web app. |
| CORS errors in **browser** to Google | Normal if testing from browser to Apps Script; the **quiz uses Vercel** to POST, so production is server → Google (no browser CORS to the script). |
| `forwarded: false` in API response | `GOOGLE_SHEETS_WEBHOOK_URL` not set in Vercel. |

---

## Alternative: Google Forms

Forms store rows in a sheet automatically, but they **do not** map well to this app’s custom JSON and 11-question flow. The **Apps Script webhook** above is the right fit for this quiz.
