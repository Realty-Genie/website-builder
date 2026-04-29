import { NextRequest, NextResponse } from "next/server";

const RESERVED_LEAD_IDS = new Set(["name", "email", "phone", "city"]);

// When the client uses the Cloudflare-documented dev sitekey, pair it with the
// matching always-pass secret so /api/proxy/lead actually accepts the submission
// during local development. https://developers.cloudflare.com/turnstile/troubleshooting/testing/
const TURNSTILE_DEV_SECRET = "1x0000000000000000000000000000000AA";

async function verifyTurnstile(token: string, ip: string | null, host: string | null): Promise<boolean> {
  const isLocalhost = !!host && (host === "localhost" || host.startsWith("localhost:") || host.endsWith(".localhost") || host.includes(".localhost:") || host.startsWith("127.0.0.1"));
  const secret = isLocalhost ? TURNSTILE_DEV_SECRET : process.env.TURNSTILE_SECRET_KEY;

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    }),
  });
  const data = await res.json();
  return data.success === true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { turnstileToken, realtorId, lead, extra_fields, sourcePage } = body;

    if (!turnstileToken || typeof turnstileToken !== "string") {
      return NextResponse.json({ success: false, error: "Missing bot protection token" }, { status: 400 });
    }

    if (!realtorId || !lead) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const ip =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      null;
    const host = request.headers.get("host");

    const valid = await verifyTurnstile(turnstileToken, ip, host);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Bot protection failed" }, { status: 403 });
    }

    const leadPayload = {
      realtorId,
      sourcePage: sourcePage ?? "/",
      sourceTemplate: "landing-v2",
      lead: {
        name: lead.name ?? "",
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        city: lead.city ?? "",
      },
      extra_fields: extra_fields ?? {},
      submittedAt: new Date().toISOString(),
    };

    // TODO: forward to CRM backend when ready
    console.log("[proxy/lead] New lead submission:", JSON.stringify(leadPayload, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[proxy/lead] Error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
