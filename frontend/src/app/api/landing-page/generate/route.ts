import { NextRequest, NextResponse } from "next/server";
import { getCrmAuth } from "@/lib/server/auth";

// System prompt that tells the AI exactly what format to return
const SYSTEM_PROMPT = `You are a professional landing page designer for real estate agents.
Your job is to generate landing page widget arrays based on user prompts.

Return ONLY a valid JSON object in this exact format:
{
  "widgets": [ ...array of widget objects... ]
}

Each widget object must have these fields:
{
  "id": "unique-id-string",
  "type": "widget_type",
  "label": "Human Label",
  "data": { ...type-specific fields... }
}

Available widget types and their data fields:

title: { text: string, color: "#hex", alignment: "left"|"center"|"right", size: "sm"|"md"|"lg" }
text: { text: string, color: "#hex", alignment: "left"|"center"|"right" }
image: { imageUrl: "https://images.unsplash.com/...", alt: string, aspect: "wide"|"square"|"portrait" }
gallery: { images: ["url1", "url2", "url3"] }
slideshow: { images: ["url1", "url2", "url3"], title: string }
map: { title: string, address: string, embedUrl: "https://www.google.com/maps?q=City+Name&output=embed" }
leadForm: { title: string, description: string, buttonLabel: string, disclaimer: string, backgroundColor: "#hex", textColor: "#hex", buttonColor: "#hex", buttonTextColor: "#hex" }
divider: { color: "#hex" }
spacer: { height: 48 }
embed: { title: string, html: string }

Generation rules:
- Generate 5-8 widgets for a complete landing page
- Always start with a title widget
- Always include at least one text widget and one leadForm widget
- Use realistic Unsplash image URLs: https://images.unsplash.com/photo-XXXXXXXX?auto=format&fit=crop&w=1400&q=80
- For real estate images, use IDs like: 1560518883-ce09059eeffa, 1512917774080-9991f1c4c750, 1600585154526-990dced4db0d
- Make widget IDs unique using this format: "type-xxxxxx" (6 random chars)
- For leadForm: use dark background (#0f172a), white text (#ffffff), sky blue button (#2f8fe5), white button text (#ffffff)
- Make all text content specific and relevant to the user's prompt
- Title color: #28323b, Text color: #5e6973
- Add dividers or spacers between sections for visual breathing room`;

// POST /api/landing-page/generate
// Calls OpenAI to generate or update landing page widgets based on a user prompt
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  // If there are existing widgets, ask AI to modify the page; otherwise generate from scratch
  const hasExistingPage = Array.isArray(currentWidgets) && currentWidgets.length > 0;
  const userMessage = hasExistingPage
    ? `Current landing page widgets:\n${JSON.stringify(currentWidgets, null, 2)}\n\nUser request: ${prompt.trim()}\n\nModify the existing page based on the request. Keep sections that don't need to change. Return the complete updated widgets array.`
    : `Create a landing page for: ${prompt.trim()}`;

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    // Parse the JSON response from OpenAI
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse OpenAI JSON:", content);
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    // Extract the widgets array from the response
    // OpenAI might return { widgets: [...] } or just an object with a widgets key
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("widgets" in parsed) ||
      !Array.isArray((parsed as { widgets: unknown }).widgets)
    ) {
      console.error("Unexpected AI response structure:", parsed);
      return NextResponse.json({ error: "AI returned unexpected format" }, { status: 500 });
    }

    const widgets = (parsed as { widgets: unknown[] }).widgets;
    return NextResponse.json({ widgets });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
