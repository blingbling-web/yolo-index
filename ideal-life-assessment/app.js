/* global window, document, navigator */

const CONFIG = window.ASSESSMENT_CONFIG;
const $ = (id) => document.getElementById(id);

const screens = {
  intro: $("screenIntro"),
  quiz: $("screenQuiz"),
  results: $("screenResults"),
};

const ui = {
  brandName: $("brandName"),
  brandTagline: $("brandTagline"),
  restartBtn: $("restartBtn"),
  introKicker: $("introKicker"),
  introTitle: $("introTitle"),
  introContent: $("introContent"),
  introBullets: $("introBullets"),
  startBtn: $("startBtn"),
  liSignInBtn: $("liSignInBtn"),
  progressBar: $("progressBar"),
  progressText: $("progressText"),
  dimensionPill: $("dimensionPill"),
  questionTitle: $("questionTitle"),
  questionHelp: $("questionHelp"),
  answers: $("answers"),
  backBtn: $("backBtn"),
  nextBtn: $("nextBtn"),
  resultsKicker: $("resultsKicker"),
  resultsTitle: $("resultsTitle"),
  resultsSummary: $("resultsSummary"),
  insightCallout: $("insightCallout"),
  reflectionQuote: $("reflectionQuote"),
  schedulingBlock: $("schedulingBlock"),
  schedulingIntro: $("schedulingIntro"),
  schedulingTitle: $("schedulingTitle"),
  schedulingByline: $("schedulingByline"),
  coffeeChatPhoto: $("coffeeChatPhoto"),
  calendlyEmbed: $("calendlyEmbed"),
  shareLinkedInBtn: $("shareLinkedInBtn"),
  copyLinkBtn: $("copyLinkBtn"),
  shareFineprint: $("shareFineprint"),
  leadForm: $("leadForm"),
  leadTitle: $("leadTitle"),
  leadBody: $("leadBody"),
  leadName: $("leadName"),
  leadEmail: $("leadEmail"),
  leadSubmitBtn: $("leadSubmitBtn"),
  leadFineprint: $("leadFineprint"),
  bookingRow: $("bookingRow"),
  calendlyBtn: $("calendlyBtn"),
  restartFromResultsBtn: $("restartFromResultsBtn"),
  footerBrand: $("footerBrand"),
  footerPrivacy: $("footerPrivacy"),
  privacyLink: $("privacyLink"),
  privacyModal: $("privacyModal"),
  closePrivacyBtn: $("closePrivacyBtn"),
  oauthFlash: $("oauthFlash"),
};

const STORAGE_KEY = `assessment:${CONFIG.assessment.slug}:v2`;
const LINKEDIN_PROFILE_KEY = `assessment:${CONFIG.assessment.slug}:linkedin`;

function setScreen(name) {
  for (const key of Object.keys(screens)) {
    screens[key].hidden = key !== name;
  }
  ui.restartBtn.hidden = name === "intro";
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function loadState() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const state = safeJsonParse(raw);
  if (!state || typeof state !== "object") return null;
  return state;
}

function saveState(state) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearState() {
  window.localStorage.removeItem(STORAGE_KEY);
}

function initState() {
  return {
    startedAt: new Date().toISOString(),
    currentIndex: 0,
    answers: {},
    utm: readUtmParams(),
  };
}

function readUtmParams() {
  const url = new URL(window.location.href);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "li_fat_id"];
  const out = {};
  for (const k of keys) {
    const v = url.searchParams.get(k);
    if (v) out[k] = v;
  }
  return out;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applyBrandCopy() {
  ui.brandName.textContent = CONFIG.brand.name;
  ui.brandTagline.textContent = CONFIG.brand.tagline;
  ui.footerBrand.textContent = CONFIG.brand.footerName || CONFIG.brand.name;
  document.title = CONFIG.assessment.title;

  ui.introKicker.textContent = CONFIG.assessment.introKicker;
  ui.introTitle.textContent = CONFIG.assessment.introTitle;

  if (ui.introContent) {
    ui.introContent.innerHTML = "";
    const paras =
      Array.isArray(CONFIG.assessment.introParagraphs) && CONFIG.assessment.introParagraphs.length > 0
        ? CONFIG.assessment.introParagraphs
        : [CONFIG.assessment.introBody].filter(Boolean);
    for (const text of paras) {
      const p = document.createElement("p");
      p.className = "p";
      p.textContent = text;
      ui.introContent.appendChild(p);
    }
  }

  ui.introBullets.innerHTML = "";
  for (const bullet of CONFIG.assessment.introBullets) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${escapeHtml(bullet.strong)}</strong> ${escapeHtml(bullet.text)}`;
    ui.introBullets.appendChild(li);
  }

  ui.calendlyBtn.href = CONFIG.funnel.calendlyUrl || "#";
  ui.calendlyBtn.textContent = CONFIG.funnel.bookingLabel;
  ui.schedulingTitle.textContent = CONFIG.funnel.schedulingTitle || "Coffee chat";
  if (ui.schedulingIntro) {
    ui.schedulingIntro.textContent = CONFIG.funnel.schedulingIntro || "";
  }
  if (ui.coffeeChatPhoto && CONFIG.funnel.coffeeChatImageUrl) {
    ui.coffeeChatPhoto.src = CONFIG.funnel.coffeeChatImageUrl;
    ui.coffeeChatPhoto.alt = "Coffee";
  }
  ui.leadFineprint.textContent = CONFIG.funnel.leadFineprint;
  ui.leadTitle.textContent = CONFIG.funnel.leadTitle;
  ui.leadBody.textContent = CONFIG.funnel.leadBody;

  const li = CONFIG.linkedin || {};
  const showLinkedIn = Boolean(li.enabledSignIn && String(li.clientId || "").trim());
  ui.liSignInBtn.hidden = !showLinkedIn;
  syncLinkedInIntroButton();
}

function getLinkedInRedirectUri() {
  return `${window.location.origin}${window.location.pathname}`;
}

function randomOAuthState() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return Array.from(a, (x) => x.toString(16).padStart(2, "0")).join("");
}

function loadLinkedInProfile() {
  const raw = window.localStorage.getItem(LINKEDIN_PROFILE_KEY);
  const p = safeJsonParse(raw);
  return p && typeof p === "object" ? p : null;
}

function saveLinkedInProfile(profile) {
  window.localStorage.setItem(LINKEDIN_PROFILE_KEY, JSON.stringify(profile));
}

function clearLinkedInProfile() {
  window.localStorage.removeItem(LINKEDIN_PROFILE_KEY);
}

function stripOAuthQueryParams() {
  const url = new URL(window.location.href);
  ["code", "state", "error", "error_description", "scope"].forEach((k) => url.searchParams.delete(k));
  const qs = url.searchParams.toString();
  const next = qs ? `${url.pathname}?${qs}` : url.pathname;
  window.history.replaceState({}, "", next + url.hash);
}

function syncLinkedInIntroButton() {
  if (!ui.liSignInBtn || ui.liSignInBtn.hidden) return;
  const p = loadLinkedInProfile();
  if (p) {
    const label = p.name || p.email || "LinkedIn";
    ui.liSignInBtn.textContent = `Signed in (${label}) — tap to sign out`;
  } else {
    ui.liSignInBtn.textContent = "Sign in with LinkedIn";
  }
}

function startLinkedInOAuth() {
  const clientId = String(CONFIG.linkedin?.clientId || "").trim();
  if (!clientId) {
    window.alert("LinkedIn sign-in needs a client ID in config.js (linkedin.clientId).");
    return;
  }
  const state = randomOAuthState();
  window.sessionStorage.setItem("linkedin_oauth_state", state);
  const redirectUri = getLinkedInRedirectUri();
  const auth = new URL("https://www.linkedin.com/oauth/v2/authorization");
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("state", state);
  auth.searchParams.set("scope", "openid profile email");
  window.location.assign(auth.toString());
}

async function handleLinkedInOAuthReturn() {
  const url = new URL(window.location.href);
  const oauthErr = url.searchParams.get("error");
  const oauthDesc = url.searchParams.get("error_description");
  if (oauthErr) {
    window.sessionStorage.setItem(
      "linkedin_oauth_flash",
      oauthDesc || oauthErr || "LinkedIn sign-in was cancelled."
    );
    stripOAuthQueryParams();
    return;
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return;

  const stored = window.sessionStorage.getItem("linkedin_oauth_state");
  window.sessionStorage.removeItem("linkedin_oauth_state");
  if (state !== stored) {
    window.sessionStorage.setItem("linkedin_oauth_flash", "Sign-in session expired. Please try again.");
    stripOAuthQueryParams();
    return;
  }

  const tokenUrl = CONFIG.endpoints?.linkedinToken || "/api/linkedin-token";
  const redirectUri = getLinkedInRedirectUri();

  let res;
  try {
    res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    });
  } catch (err) {
    window.sessionStorage.setItem("linkedin_oauth_flash", "Could not reach the server to finish sign-in.");
    stripOAuthQueryParams();
    return;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    const msg =
      (data && data.error) ||
      (data && data.details && data.details.error_description) ||
      "Could not complete LinkedIn sign-in.";
    window.sessionStorage.setItem("linkedin_oauth_flash", typeof msg === "string" ? msg : "Sign-in failed.");
    stripOAuthQueryParams();
    return;
  }

  saveLinkedInProfile({
    sub: data.sub,
    name: data.name,
    email: data.email,
    picture: data.picture,
  });
  window.sessionStorage.setItem("linkedin_oauth_flash", "Signed in with LinkedIn.");
  stripOAuthQueryParams();
}

function showOAuthFlashIfAny() {
  const msg = window.sessionStorage.getItem("linkedin_oauth_flash");
  if (!msg || !ui.oauthFlash) return;
  window.sessionStorage.removeItem("linkedin_oauth_flash");
  ui.oauthFlash.textContent = msg;
  ui.oauthFlash.hidden = false;
}

function applyLinkedInToLeadForm() {
  const p = loadLinkedInProfile();
  if (!p) return;
  if (p.name && ui.leadName) ui.leadName.value = p.name;
  if (p.email && ui.leadEmail) ui.leadEmail.value = p.email;
}

function applySchedulingHeader() {
  const funnel = CONFIG.funnel || {};
  const name = (funnel.coachDisplayName || "Coach").trim();
  ui.schedulingTitle.textContent = funnel.schedulingTitle || "Coffee chat";
  if (ui.schedulingIntro) {
    ui.schedulingIntro.textContent =
      funnel.schedulingIntro || "Curious to learn more? Schedule time with a coach here!";
  }
  const byline = (funnel.coachByline || "").trim();
  ui.schedulingByline.textContent = byline || `Schedule with ${name}`;
  const coffeeUrl = (funnel.coffeeChatImageUrl || "").trim();
  if (ui.coffeeChatPhoto && coffeeUrl) {
    ui.coffeeChatPhoto.src = coffeeUrl;
    ui.coffeeChatPhoto.alt = "Coffee";
  }
}

function mountCalendlyIframeFallback(parent, url) {
  parent.innerHTML = "";
  const ifr = document.createElement("iframe");
  ifr.src = url;
  ifr.width = "100%";
  ifr.height = "700";
  ifr.style.border = "0";
  ifr.style.minHeight = "680px";
  ifr.title = "Schedule a coffee chat";
  ifr.setAttribute("loading", "lazy");
  parent.appendChild(ifr);
}

function mountCalendlyEmbed() {
  const url = CONFIG.funnel?.calendlyUrl;
  const parent = ui.calendlyEmbed;
  if (!parent || !url) return;
  parent.innerHTML = "";

  const tryInit = () => {
    if (window.Calendly && typeof window.Calendly.initInlineWidget === "function") {
      try {
        window.Calendly.initInlineWidget({ url, parentElement: parent });
      } catch {
        mountCalendlyIframeFallback(parent, url);
      }
      return true;
    }
    return false;
  };

  if (tryInit()) return;

  let attempts = 0;
  const id = window.setInterval(() => {
    attempts += 1;
    if (tryInit()) {
      window.clearInterval(id);
      return;
    }
    if (attempts >= 50) {
      window.clearInterval(id);
      mountCalendlyIframeFallback(parent, url);
    }
  }, 100);
}

function syncSchedulingSection() {
  const hasCal = !!CONFIG.funnel?.calendlyUrl;
  if (ui.schedulingBlock) ui.schedulingBlock.hidden = !hasCal;
  if (ui.calendlyBtn) ui.calendlyBtn.href = CONFIG.funnel.calendlyUrl || "#";
  if (!hasCal) return;
  applySchedulingHeader();
  window.requestAnimationFrame(() => {
    mountCalendlyEmbed();
  });
}

function getQuestion(index) {
  return CONFIG.questions[index] || null;
}

function getDimensionMeta(question) {
  if (!question) return null;
  if (question.sectionLabel) return { name: question.sectionLabel };
  const d = CONFIG.dimensions.find((x) => x.id === question.dimensionId);
  return d || null;
}

function getOptionById(question, optionId) {
  return question.options?.find((o) => o.id === optionId) || null;
}

function scaleLabelsForQuestion(question) {
  const preset = CONFIG.scalePresets[question.scalePreset] || {};
  const values = [...CONFIG.scaleValues].sort((a, b) => b - a);
  return values.map((value) => ({
    value,
    label: `${value}% — ${preset[value] || ""}`.trim(),
  }));
}

function isQuestionComplete(q, answers) {
  if (!q) return false;
  if (q.type === "scale") return typeof answers[q.id] === "number";
  if (q.type === "multi") {
    const s = answers[q.id];
    return Array.isArray(s) && s.length >= 1 && s.length <= (q.maxSelect || 2);
  }
  if (q.type === "single") return typeof answers[q.id] === "string" && answers[q.id].length > 0;
  return false;
}

function validateQuizComplete(state) {
  return CONFIG.questions.every((q) => isQuestionComplete(q, state.answers));
}

function averageForQuestionIds(state, ids) {
  let sum = 0;
  let n = 0;
  for (const id of ids) {
    const v = state.answers[id];
    if (typeof v === "number") {
      sum += v;
      n += 1;
    }
  }
  if (n === 0) return 0;
  return sum / n;
}

function pickResultType(clarity, alignment, action) {
  const T = CONFIG.scoring?.highThreshold ?? 70;
  const cH = clarity >= T;
  const aH = alignment >= T;
  const acH = action >= T;

  if (cH && aH && acH) return CONFIG.resultTypes.fullyLit;
  if (cH && !acH) return CONFIG.resultTypes.dimmedLight;
  if (!cH && acH) return CONFIG.resultTypes.livingInSomeoneElsesLight;
  if (!cH && !acH) return CONFIG.resultTypes.searchingForYourLight;
  if (cH && acH && !aH) return CONFIG.resultTypes.dimmedLight;
  return CONFIG.resultTypes.searchingForYourLight;
}

function collectConstraintTags(state) {
  const q9 = CONFIG.questions.find((q) => q.id === "q9");
  const q10 = CONFIG.questions.find((q) => q.id === "q10");
  const tags = [];

  const sel9 = state.answers.q9;
  if (Array.isArray(sel9)) {
    for (const optionId of sel9) {
      const opt = q9 ? getOptionById(q9, optionId) : null;
      if (opt?.constraintTag) tags.push(opt.constraintTag);
    }
  }

  const sel10 = state.answers.q10;
  if (typeof sel10 === "string" && q10) {
    const opt = getOptionById(q10, sel10);
    if (opt?.constraintTag) tags.push(opt.constraintTag);
  }

  return tags;
}

function pickPrimaryConstraintTag(tags) {
  const weightOrder = ["identity", "fear", "social", "money", "values"];
  const counts = {};
  for (const t of tags) {
    counts[t] = (counts[t] || 0) + 1;
  }

  const candidates = ["fear", "money", "social", "identity"];
  let best = null;
  let bestCount = 0;
  for (const c of candidates) {
    const ct = counts[c] || 0;
    if (ct > bestCount) {
      best = c;
      bestCount = ct;
    } else if (ct === bestCount && ct > 0) {
      const prevIdx = best ? weightOrder.indexOf(best) : 999;
      const curIdx = weightOrder.indexOf(c);
      if (curIdx < prevIdx) best = c;
    }
  }

  if (best) return best;
  if ((counts.values || 0) > 0) return "values";
  return null;
}

function buildFinalInsight(resultType, primaryTag, q11Value) {
  let text = resultType.insight;
  if (primaryTag && CONFIG.constraintCopy[primaryTag]) {
    text += " " + CONFIG.constraintCopy[primaryTag];
  }
  if (typeof q11Value === "number" && q11Value < (CONFIG.scoring?.highThreshold ?? 70) && CONFIG.identityLowNote) {
    text += " " + CONFIG.identityLowNote;
  }
  return text;
}

function computeYoloResult(state) {
  const clarity = averageForQuestionIds(state, ["q1", "q2", "q3"]);
  const alignment = averageForQuestionIds(state, ["q4", "q5", "q6"]);
  const action = averageForQuestionIds(state, ["q7", "q8"]);
  const q11 = state.answers.q11;

  const resultType = pickResultType(clarity, alignment, action);
  const constraintTags = collectConstraintTags(state);
  const primaryTag = pickPrimaryConstraintTag(constraintTags);

  return {
    resultType,
    clarity,
    alignment,
    action,
    q11: typeof q11 === "number" ? q11 : null,
    constraintTags,
    primaryConstraintTag: primaryTag,
    insight: buildFinalInsight(resultType, primaryTag, typeof q11 === "number" ? q11 : null),
  };
}

function renderQuestion(state) {
  const q = getQuestion(state.currentIndex);
  if (!q) return;

  const total = CONFIG.questions.length;
  const pos = state.currentIndex + 1;
  ui.progressText.textContent = `Question ${pos} of ${total}`;
  ui.progressBar.style.width = `${Math.round((pos / total) * 100)}%`;

  const dim = getDimensionMeta(q);
  ui.dimensionPill.textContent = dim?.name || "Reflection";

  ui.questionTitle.textContent = q.title;
  const answers = state.answers;

  if (q.help) {
    ui.questionHelp.hidden = false;
    let helpText = q.help;
    if (q.type === "multi") {
      const n = Array.isArray(answers[q.id]) ? answers[q.id].length : 0;
      const maxSel = q.maxSelect || 2;
      helpText = `${q.help} (${n}/${maxSel} selected)`;
    }
    ui.questionHelp.textContent = helpText;
  } else {
    ui.questionHelp.hidden = true;
    ui.questionHelp.textContent = "";
  }

  ui.answers.innerHTML = "";

  if (q.type === "scale") {
    for (const opt of scaleLabelsForQuestion(q)) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "answerBtn" + (answers[q.id] === opt.value ? " selected" : "");
      btn.innerHTML = `<div class="answerTop"><div class="answerLabel">${escapeHtml(opt.label)}</div></div>`;
      btn.addEventListener("click", () => {
        state.answers[q.id] = opt.value;
        saveState(state);
        renderQuestion(state);
        ui.nextBtn.disabled = false;
      });
      ui.answers.appendChild(btn);
    }
  } else if (q.type === "multi") {
    const selected = Array.isArray(answers[q.id]) ? [...answers[q.id]] : [];
    const maxSel = q.maxSelect || 2;

    for (const opt of q.options) {
      const btn = document.createElement("button");
      btn.type = "button";
      const isOn = selected.includes(opt.id);
      btn.className = "answerBtn" + (isOn ? " selected" : "");
      btn.innerHTML = `<div class="answerTop"><div class="answerLabel">${escapeHtml(opt.label)}</div><div class="answerValue">${isOn ? "✓" : ""}</div></div>`;
      btn.addEventListener("click", () => {
        let next = [...selected];
        const idx = next.indexOf(opt.id);
        if (idx >= 0) next.splice(idx, 1);
        else if (next.length < maxSel) next.push(opt.id);
        state.answers[q.id] = next;
        saveState(state);
        renderQuestion(state);
        ui.nextBtn.disabled = !isQuestionComplete(q, state.answers);
      });
      ui.answers.appendChild(btn);
    }
  } else if (q.type === "single") {
    for (const opt of q.options) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "answerBtn" + (answers[q.id] === opt.id ? " selected" : "");
      btn.innerHTML = `<div class="answerTop"><div class="answerLabel">${escapeHtml(opt.label)}</div></div>`;
      btn.addEventListener("click", () => {
        state.answers[q.id] = opt.id;
        saveState(state);
        renderQuestion(state);
        ui.nextBtn.disabled = false;
      });
      ui.answers.appendChild(btn);
    }
  }

  ui.backBtn.disabled = state.currentIndex === 0;
  ui.nextBtn.disabled = !isQuestionComplete(q, answers);
  ui.nextBtn.textContent = state.currentIndex === total - 1 ? "See my pattern" : "Next";
}

function renderResults(state) {
  const yolo = computeYoloResult(state);
  const rt = yolo.resultType;

  ui.resultsKicker.textContent = "Your check-in";
  ui.resultsTitle.textContent = `${rt.emoji} ${rt.title}`;
  ui.resultsSummary.textContent = rt.description;
  ui.insightCallout.textContent = yolo.insight;
  ui.reflectionQuote.textContent = rt.reflection;

  syncSchedulingSection();
  ui.shareFineprint.hidden = true;

  const shareLink = buildShareLink(yolo);
  ui.shareLinkedInBtn.onclick = () => shareOnLinkedIn(rt, shareLink);
  ui.copyLinkBtn.onclick = () => copyToClipboard(shareLink);
  applyLinkedInToLeadForm();
}

function buildShareLink(yolo) {
  const url = new URL(window.location.href);
  url.searchParams.set("result", "1");
  url.searchParams.set("type", yolo.resultType.id);
  url.searchParams.delete("score");
  url.searchParams.delete("focus");
  return url.toString();
}

function shareOnLinkedIn(resultType, shareLink) {
  const shortName = (CONFIG.brand.footerName || "Whose Life Are You Living?").replace(/"/g, "");
  const text = `I just took “${shortName}.” My pattern: ${resultType.emoji} ${resultType.title}.`;
  const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
    `${text}\n\nTry it: ${shareLink}`
  )}`;
  window.open(shareUrl, "_blank", "noopener,noreferrer");
  ui.shareFineprint.hidden = false;
  ui.shareFineprint.textContent =
    "If LinkedIn doesn’t prefill text, copy your link and add your own words—no score is required.";
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    ui.shareFineprint.hidden = false;
    ui.shareFineprint.textContent = "Link copied.";
  } catch {
    ui.shareFineprint.hidden = false;
    ui.shareFineprint.textContent = "Copy from the address bar if needed.";
  }
}

async function submitLead(payload) {
  const res = await fetch(CONFIG.endpoints.lead, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const raw = await res.text().catch(() => "");
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    const detail = data.details || data.error || raw || "unknown error";
    const msg = typeof detail === "string" ? detail : JSON.stringify(detail);
    throw new Error(`Lead submit failed (${res.status}): ${msg}`);
  }

  /** Server returns 200 but skips Sheets when GOOGLE_SHEETS_WEBHOOK_URL is missing on Vercel. */
  if (data.forwarded === false) {
    throw new Error(
      data.note ||
        "Submission did not reach Google Sheets. Set GOOGLE_SHEETS_WEBHOOK_URL in Vercel and redeploy."
    );
  }

  return data;
}

function wirePrivacy() {
  const open = () => ui.privacyModal.showModal();
  const close = () => ui.privacyModal.close();

  ui.privacyLink.addEventListener("click", (e) => {
    e.preventDefault();
    open();
  });
  ui.footerPrivacy.addEventListener("click", (e) => {
    e.preventDefault();
    open();
  });
  ui.closePrivacyBtn.addEventListener("click", close);
  ui.privacyModal.addEventListener("click", (e) => {
    const rect = ui.privacyModal.getBoundingClientRect();
    const inDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!inDialog) close();
  });
}

function getResultTypeById(id) {
  const values = Object.values(CONFIG.resultTypes);
  return values.find((t) => t.id === id) || null;
}

async function boot() {
  await handleLinkedInOAuthReturn();
  applyBrandCopy();
  wirePrivacy();
  showOAuthFlashIfAny();

  ui.liSignInBtn.addEventListener("click", () => {
    if (loadLinkedInProfile()) {
      clearLinkedInProfile();
      syncLinkedInIntroButton();
      if (ui.oauthFlash) {
        ui.oauthFlash.textContent = "Signed out of LinkedIn.";
        ui.oauthFlash.hidden = false;
      }
    } else {
      if (ui.oauthFlash) ui.oauthFlash.hidden = true;
      startLinkedInOAuth();
    }
  });

  let state = loadState() || initState();

  ui.restartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    clearState();
    state = initState();
    setScreen("intro");
  });

  ui.startBtn.addEventListener("click", () => {
    saveState(state);
    setScreen("quiz");
    renderQuestion(state);
  });

  ui.backBtn.addEventListener("click", () => {
    state.currentIndex = clamp(state.currentIndex - 1, 0, CONFIG.questions.length - 1);
    saveState(state);
    renderQuestion(state);
  });

  ui.nextBtn.addEventListener("click", () => {
    const isLast = state.currentIndex === CONFIG.questions.length - 1;
    if (isLast) {
      if (!validateQuizComplete(state)) return;
      saveState(state);
      setScreen("results");
      renderResults(state);
      return;
    }
    state.currentIndex = clamp(state.currentIndex + 1, 0, CONFIG.questions.length - 1);
    saveState(state);
    renderQuestion(state);
  });

  ui.restartFromResultsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    clearState();
    state = initState();
    setScreen("intro");
  });

  ui.leadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = ui.leadEmail.value.trim();
    const name = ui.leadName.value.trim();
    if (!email) return;

    ui.leadSubmitBtn.disabled = true;
    ui.leadFineprint.textContent = "Sending…";

    try {
      const yolo = computeYoloResult(state);
      const payload = {
        name: name || null,
        email,
        assessmentSlug: CONFIG.assessment.slug,
        assessmentTitle: CONFIG.assessment.title,
        yoloType: yolo.resultType.id,
        yoloTypeTitle: yolo.resultType.title,
        dimensionAvgs: {
          clarity: yolo.clarity,
          alignment: yolo.alignment,
          action: yolo.action,
        },
        identityQ11: yolo.q11,
        constraintTags: yolo.constraintTags,
        primaryConstraintTag: yolo.primaryConstraintTag,
        answers: state.answers,
        utm: state.utm,
        submittedAt: new Date().toISOString(),
        pageUrl: window.location.href,
        linkedinSub: loadLinkedInProfile()?.sub ?? null,
      };
      await submitLead(payload);

      ui.leadFineprint.textContent =
        "Thank you — your answers were saved. This page does not send an automatic email; we may follow up at the address you provided.";
      ui.leadSubmitBtn.disabled = true;
      ui.leadEmail.disabled = true;
      ui.leadName.disabled = true;
    } catch (err) {
      ui.leadSubmitBtn.disabled = false;
      const hint = err && err.message ? String(err.message) : "Unknown error";
      ui.leadFineprint.textContent =
        hint.length > 220 ? `${hint.slice(0, 217)}…` : hint;
      console.error("Lead submit error:", err);
    }
  });

  const url = new URL(window.location.href);
  if (url.searchParams.get("result") === "1") {
    const typeId = url.searchParams.get("type") || "";
    const sharedType = getResultTypeById(typeId);

    if (validateQuizComplete(state)) {
      setScreen("results");
      renderResults(state);
      return;
    }

    if (sharedType) {
      setScreen("results");
      ui.resultsKicker.textContent = "Shared result";
      ui.resultsTitle.textContent = `${sharedType.emoji} ${sharedType.title}`;
      ui.resultsSummary.textContent =
        "Someone shared their check-in result. Take the assessment yourself to get insight tailored to your answers—without judgment.";
      ui.insightCallout.textContent = sharedType.insight;
      ui.reflectionQuote.textContent = sharedType.reflection;
      syncSchedulingSection();
      ui.shareFineprint.hidden = false;
      ui.shareFineprint.textContent = "This preview doesn’t include your personal constraint mix—take the quiz for that.";
      const previewLink = window.location.href;
      ui.shareLinkedInBtn.onclick = () => shareOnLinkedIn(sharedType, previewLink);
      ui.copyLinkBtn.onclick = () => copyToClipboard(previewLink);
      return;
    }
  }

  const hasAnyAnswer = Object.keys(state.answers || {}).length > 0;
  if (hasAnyAnswer) {
    setScreen("quiz");
    renderQuestion(state);
  } else {
    setScreen("intro");
  }
}

void boot().catch((err) => console.error(err));
