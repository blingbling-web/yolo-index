/* global window */
window.ASSESSMENT_CONFIG = {
  brand: {
    name: "Take a quiz: Whose Life Are You Living?",
    tagline: "by BlingBling Coaching",
    /** Shorter label for the footer (full `name` is shown in the header). */
    footerName: "Whose Life Are You Living?",
  },

  assessment: {
    slug: "yolo-index",
    title: "Take a quiz: Whose Life Are You Living?",
    introKicker: "Take a 3-minute private check-in to see how aligned your life really feels",
    introTitle: "Whose Life Are You Living?",
    introBody: "",
    introParagraphs: [
      "Something in you might already be wondering. Not loudly—just a quiet feeling that something is… off.",
      "Take a 3–5 minute private reflection to see how aligned your life really feels—not by looking externally, but by turning inward with yourself.",
      "Are you intentional with the life you're living right now?",
    ],
    introBullets: [
      { strong: "3–5 minutes · 100% private", text: "Confidential—a safe space for you." },
      { strong: "No right answers", text: "This is truly a reflection of where you are—not a test." },
      { strong: "Take your time", text: "Try to be as honest as you can. There's no rush, and no wrong answers." },
    ],
  },

  scaleValues: [25, 50, 75, 100],

  dimensions: [
    { id: "clarity", name: "Clarity", section: "Clarity" },
    { id: "alignment", name: "Alignment", section: "Alignment" },
    { id: "action", name: "Action", section: "Action" },
    { id: "constraint", name: "Constraint", section: "What holds you back" },
    { id: "identity", name: "Identity", section: "Identity" },
  ],

  questions: [
    { id: "q1", type: "scale", dimensionId: "clarity", sectionLabel: "Clarity", title: "If nothing changes, how do you feel about your life in 5 years?", scalePreset: "q1" },
    { id: "q2", type: "scale", dimensionId: "clarity", sectionLabel: "Clarity", title: "How clear are you about the life you actually want?", scalePreset: "q2" },
    { id: "q3", type: "scale", dimensionId: "clarity", sectionLabel: "Clarity", title: "If there were no consequences, what would you do differently?", scalePreset: "q3" },
    { id: "q4", type: "scale", dimensionId: "alignment", sectionLabel: "Alignment", title: "How aligned does your life feel right now?", scalePreset: "q4" },
    { id: "q5", type: "scale", dimensionId: "alignment", sectionLabel: "Alignment", title: "Which best describes your current state?", scalePreset: "q5" },
    { id: "q6", type: "scale", dimensionId: "alignment", sectionLabel: "Alignment", title: "How often do you feel like you're on autopilot?", scalePreset: "q6" },
    { id: "q7", type: "scale", dimensionId: "action", sectionLabel: "Action", title: "How much action have you taken toward the life you want?", scalePreset: "q7" },
    { id: "q8", type: "scale", dimensionId: "action", sectionLabel: "Action", title: "What usually happens when you think about change?", scalePreset: "q8" },
    {
      id: "q9",
      type: "multi",
      dimensionId: "constraint",
      sectionLabel: "Constraint",
      title: "What tends to hold you back the most?",
      help: "Select up to 2.",
      maxSelect: 2,
      options: [
        { id: "q9_a", label: "Fear of failure / uncertainty", constraintTag: "fear" },
        { id: "q9_b", label: "Financial security concerns", constraintTag: "money" },
        { id: "q9_c", label: "Fear of disappointing others", constraintTag: "social" },
        { id: "q9_d", label: "Not knowing where to start", constraintTag: "fear" },
        { id: "q9_e", label: "I tend to overthink and delay", constraintTag: "fear" },
        { id: "q9_f", label: "I'm waiting for the “right time”", constraintTag: "fear" },
        { id: "q9_g", label: "It's hard to explain, but something feels off", constraintTag: "identity" },
      ],
    },
    {
      id: "q10",
      type: "single",
      dimensionId: "constraint",
      sectionLabel: "Constraint",
      title: "What influences your decisions the most?",
      options: [
        { id: "q10_a", label: "My own values", constraintTag: "values" },
        { id: "q10_b", label: "Family expectations", constraintTag: "social" },
        { id: "q10_c", label: "Social / cultural norms", constraintTag: "social" },
        { id: "q10_d", label: "Career / company expectations", constraintTag: "social" },
        { id: "q10_e", label: "A mix — hard to separate", constraintTag: "identity" },
      ],
    },
    { id: "q11", type: "scale", dimensionId: "identity", sectionLabel: "Identity", title: "Does your current life reflect who you are today?", scalePreset: "q11" },
  ],

  scalePresets: {
    q1: { 25: "Honestly, it makes me uneasy", 50: "I try not to think about it too much", 75: "It’s mostly fine, but something feels off", 100: "I feel confident about where I’m headed" },
    q2: { 25: "I don’t really know", 50: "I have ideas, but not clear", 75: "I have a general direction", 100: "Very clear" },
    q3: { 25: "I’m not sure", 50: "I’ve thought about it vaguely", 75: "I have a few ideas", 100: "I know exactly what I would change" },
    q4: { 25: "Feels off or stuck", 50: "Increasingly disconnected", 75: "Mostly good, but something missing", 100: "Fully aligned, this feels like my life" },
    q5: { 25: "Stuck but unclear why", 50: "Growing disconnect", 75: "Doing well but something missing", 100: "Fulfilled and aligned" },
    q6: { 25: "Almost always", 50: "Often", 75: "Sometimes", 100: "Rarely" },
    q7: { 25: "I haven’t explored it", 50: "I’ve thought about it but haven’t acted", 75: "I’ve taken small steps", 100: "I’ve made meaningful changes" },
    q8: { 25: "I avoid it", 50: "I overthink", 75: "I plan but delay", 100: "I act quickly" },
    q11: { 25: "More like my past self", 50: "A mix", 75: "Mostly me", 100: "Fully me" },
  },

  scoring: { highThreshold: 70 },

  resultTypes: {
    fullyLit: {
      id: "fullyLit",
      emoji: "🟢",
      title: "Fully Lit",
      description:
        "You are living a life that feels like yours—clear enough, aligned enough, and you’re backing it with action. The invitation now is less about fixing, and more about deepening: what wants to expand next?",
      insight:
        "Your inner voice and your outer life are mostly in conversation. Sustain that honesty—especially when success tempts you to go on autopilot.",
      reflection: "Where are you still choosing ‘impressive’ over ‘true’—and what would it cost to choose differently?",
      ctaLabel: "Explore coaching to go deeper",
    },
    dimmedLight: {
      id: "dimmedLight",
      emoji: "⚡",
      title: "Dimmed Light",
      description:
        "You know your light—but you’re not fully letting it shine. Often this shows up as clarity without follow-through: you see the life, but the steps feel heavy, risky, or easy to postpone.",
      insight:
        "This isn’t a discipline problem. It’s usually protection: your system is steering you away from the vulnerability of real change.",
      reflection: "If you gave yourself permission to disappoint someone (briefly), what’s the smallest honest step you’d take this week?",
      ctaLabel: "Explore coaching to turn clarity into motion",
    },
    livingInSomeoneElsesLight: {
      id: "livingInSomeoneElsesLight",
      emoji: "🧠",
      title: "Living in Someone Else’s Light",
      description:
        "You are doing well, but the life you’re living may not be the one you chose. You can execute and deliver—while a quieter part of you wonders whose script you’re performing.",
      insight:
        "High performance can hide misalignment for years. Naming the gap is not ingratitude—it’s integrity.",
      reflection: "If no one’s opinion counted, what would you stop pretending is ‘fine’?",
      ctaLabel: "Explore coaching to reclaim authorship",
    },
    searchingForYourLight: {
      id: "searchingForYourLight",
      emoji: "🌫️",
      title: "Searching for Your Light",
      description:
        "You feel something is off—but you haven’t fully seen your light yet. That fog isn’t failure; it’s often the edge where a life built on achievement meets a life that wants meaning.",
      insight:
        "You don’t need a perfect map. You need a kind light on the next right question—without forcing an answer.",
      reflection: "What part of your life would you grieve if it stayed exactly the same for five more years?",
      ctaLabel: "Explore coaching to find your thread",
    },
  },

  constraintCopy: {
    fear: "A recurring theme for you is fear, overthinking, or waiting for certainty before you move.",
    money: "Financial security shows up as a real weight in how you imagine change.",
    social: "Other people’s expectations—family, culture, or career—may be louder than your inner yes.",
    identity: "Something underneath is hard to name: a drift, a mismatch, or a story about who you’re allowed to be.",
    values: "You’re led by your own values—which is a strength—and the work may be protecting that voice when pressure rises.",
  },

  identityLowNote:
    "And: if your days don’t quite feel like you yet—that gap is information, not a verdict on your character.",

  funnel: {
    calendlyUrl: "https://calendly.com/blingblingcoaching/coffee-chat-session",
    leadTitle: "Want a short written reflection + an invite-only coaching link?",
    leadBody:
      "Leave your email and I’ll send a concise take on your pattern (no spam) and a gentle invite to connect if it feels right.",
    leadFineprint:
      "BlingBling Coaching / Whose Life Are You Living?: we’ll email your notes and may follow up once about coaching. Unsubscribe anytime.",
    bookingLabel: "Open scheduling in a new tab",
    schedulingTitle: "Coffee chat",
    schedulingIntro: "Curious to learn more? Schedule time with a coach here!",
    coffeeChatImageUrl:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=160&h=160&q=80",
    coachDisplayName: "BlingBling Coaching",
    coachByline: "",
  },

  /**
   * Sign in with LinkedIn (OpenID Connect).
   * 1) Create a LinkedIn app → Auth → add OAuth 2.0 redirect URL (must match the page URL exactly).
   * 2) Enable "Sign In with LinkedIn using OpenID Connect" and request openid, profile, email.
   * 3) Put clientId below (public) and set LINKEDIN_CLIENT_ID + LINKEDIN_CLIENT_SECRET on Vercel.
   */
  linkedin: {
    enabledSignIn: true,
    clientId: "",
  },

  endpoints: { lead: "/api/lead", linkedinToken: "/api/linkedin-token" },
};
