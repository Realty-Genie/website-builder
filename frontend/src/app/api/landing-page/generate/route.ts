import { NextRequest, NextResponse } from "next/server";
import { Agent, run } from "@openai/agents";
import { getCrmAuth } from "@/lib/server/auth";

// ── Agent 1: Planner ───────────────────────────────────────
// The Planner reads the user's request and writes a clear content plan.
// It tells the Builder exactly what sections, tone, and content to include.
const plannerAgent = new Agent({
  name: "Landing Page Planner",
  model: "gpt-4o",
  instructions: `You are a real estate marketing strategist.

Given a user's request for a landing page, write a short structured plan that covers:
1. Page purpose and target audience
2. Sections needed (e.g. hero headline, property highlights, gallery, lead form)
3. Tone and style (e.g. luxury, friendly, professional, urgent)
4. Key content points for each section (headlines, bullet points, CTA text)

Write the plan in plain text. Be specific. The Builder agent will use your plan to generate the page.`,
});

// ── Agent 2: Builder ───────────────────────────────────────
// The Builder receives the Planner's output and generates the widget JSON.
const builderAgent = new Agent({
  name: "Landing Page Builder",
  model: "gpt-4o",
  instructions: `You are a landing page builder for real estate agents.

You receive a content plan and generate landing page widgets as JSON.

Return ONLY a valid JSON object in this exact format:
{
  "widgets": [ ...array of widget objects... ]
}

Each widget object must have:
{
  "id": "unique-id-string",
  "type": "widget_type",
  "label": "Human Label",
  "data": { ...type-specific fields... }
}

Available widget types and their exact data fields:

hero: {
  backgroundImage: "https://images.unsplash.com/...",
  overlayOpacity: 0.45,          // 0 = transparent, 1 = fully dark
  tagline: "SMALL CAPS TEXT",    // e.g. "TOP VANCOUVER REALTOR®"
  title: "Big Headline",
  subtitle: "Supporting text below the headline",
  ctaText: "Button Label",
  ctaColor: "#hex",
  ctaTextColor: "#hex",
  textAlign: "left" | "center"
}

agentBio: {
  imageUrl: "https://images.unsplash.com/...",
  name: "Agent Full Name",
  title: "Job Title or Designation",
  bio: "2-4 sentence bio paragraph",
  ctaText: "Button Label",
  ctaColor: "#hex",
  ctaTextColor: "#hex",
  backgroundColor: "#hex",
  textColor: "#hex",
  imagePosition: "left" | "right"
}

stats: {
  backgroundColor: "#hex",
  textColor: "#hex",
  accentColor: "#hex",           // color for the number values
  items: [
    { value: "500+", label: "Homes Sold" },
    { value: "15 Yrs", label: "Experience" }
  ]
}

testimonials: {
  title: "Section Heading",
  backgroundColor: "#hex",
  textColor: "#hex",
  accentColor: "#hex",
  items: [
    { text: "Quote text here.", author: "Name", location: "City, State" }
  ]
}

title: { text: string, color: "#hex", alignment: "left"|"center"|"right", size: "sm"|"md"|"lg", sectionBg?: "#hex" }
text: { text: string, color: "#hex", alignment: "left"|"center"|"right", sectionBg?: "#hex" }
image: { imageUrl: "https://images.unsplash.com/...", alt: string, aspect: "wide"|"square"|"portrait"|"fullwidth" }
gallery: { images: ["url1", "url2", "url3"], sectionBg?: "#hex" }
slideshow: { images: ["url1", "url2", "url3"], title: string }
map: { title: string, address: string, embedUrl: "https://www.google.com/maps?q=City+Name&output=embed" }
leadForm: {
  title: string,
  description: string,
  buttonLabel: string,
  disclaimer: string,
  backgroundColor: "#hex",
  textColor: "#hex",
  buttonColor: "#hex",
  buttonTextColor: "#hex",
  // ALWAYS include this exact fields array on every leadForm — name / email / phone / city
  fields: [
    { id: "name", label: "Full Name", type: "text", placeholder: "Your Name", required: true },
    { id: "email", label: "Email", type: "email", placeholder: "you@email.com", required: true },
    { id: "phone_country_code", label: "Country Code", type: "text", placeholder: "+1", required: true },
    { id: "phone", label: "Phone Number", type: "tel", placeholder: "555 000-0000", required: true },
    { id: "city", label: "City", type: "text", placeholder: "Your City", required: false }
  ]
}
divider: { color: "#hex" }
spacer: { height: 48 }
embed: { title: string, html: string }

Rules:
- Generate 5-8 widgets for a complete page
- ALWAYS start with a "hero" widget — full-width image with headline and CTA button
- ALWAYS include a "stats" widget to show credibility numbers
- ALWAYS end with a "leadForm" widget
- Include "agentBio" for agent-focused pages
- Include "testimonials" for social proof
- Use real Unsplash real estate photo URLs: https://images.unsplash.com/photo-XXXXXXXX?auto=format&fit=crop&w=1600&q=80
  Good property photo IDs: 1600596542815-ffad4c1539a9, 1512917774080-9991f1c4c750, 1568605114967-8130f3a36994,
  1486325212027-8081e485255e, 1560184897-ae75f418493e, 1605276374104-dee2a0ed3cd6
  Good agent/person photo IDs: 1560250097-0b93528c311a, 1573496359142-b8d87734a5a2, 1472099645785-5658abf4ff4e
- Widget IDs must be unique: format "type-xxxxxx" (6 random lowercase alphanumeric chars)
- leadForm: use a dark background (#0f172a or #1a1a2e), white text, and a colored accent button
- Make all text content specific to the user's request — no generic placeholder text
- Alternate section background colors between white (#ffffff) and light tones (#f7fafc, #f8f5f0, #f0fff4) for visual rhythm`,
});

// POST /api/landing-page/generate
// Uses a two-agent pipeline: Planner → Builder
export async function POST(request: NextRequest) {
  const auth = await getCrmAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => ({}));
  const { prompt, currentWidgets } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return NextResponse.json({ error: "A prompt is required" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  // The OpenAI Agents SDK reads OPENAI_API_KEY from the environment automatically
  const hasExistingPage = Array.isArray(currentWidgets) && currentWidgets.length > 0;

  try {
    let widgets: unknown[];

    if (hasExistingPage) {
      // For modifications, skip the planner and go straight to the builder.
      // The user is already looking at a page and wants specific changes.
      const modifyMessage = `
Current landing page widgets (JSON):
${JSON.stringify(currentWidgets, null, 2)}

User's modification request: ${prompt.trim()}

Modify the existing page based on the request. Keep sections that don't need changing.
Return the complete updated widgets array as JSON.`.trim();

      const buildResult = await run(builderAgent, modifyMessage);
      const jsonString = buildResult.finalOutput as string;
      widgets = extractWidgets(jsonString);
    } else {
      // For new pages, use the full Planner → Builder pipeline.

      // Step 1: Planner writes a content plan
      const planResult = await run(plannerAgent, `Create a landing page for: ${prompt.trim()}`);
      const plan = planResult.finalOutput as string;

      // Step 2: Builder generates widget JSON from the plan
      const buildMessage = `
Content plan for the landing page:
${plan}

Generate the widget JSON for this landing page.`.trim();

      const buildResult = await run(builderAgent, buildMessage);
      const jsonString = buildResult.finalOutput as string;
      widgets = extractWidgets(jsonString);
    }

    return NextResponse.json({ widgets });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Something went wrong generating the page. Please try again." },
      { status: 500 },
    );
  }
}

// Extracts the widgets array from a JSON string.
// Handles cases where the model wraps the JSON in markdown code fences.
function extractWidgets(text: string): unknown[] {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Try to find a JSON object inside the text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error("Could not parse JSON from AI response");
    }
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("widgets" in parsed) ||
    !Array.isArray((parsed as { widgets: unknown }).widgets)
  ) {
    throw new Error("AI returned unexpected format — missing widgets array");
  }

  return (parsed as { widgets: unknown[] }).widgets;
}
