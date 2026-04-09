import { NextRequest, NextResponse } from "next/server";
import { getLandingDomainsCollection } from "@/lib/server/mongodb";
import { getCrmAuth } from "@/lib/server/auth";

// Makes a unique landing page ID
function makeLandingPageId(): string {
  return `lp_${Math.random().toString(36).slice(2, 9)}`;
}

// GET /api/landing-page
// Returns all landing pages for the logged-in user (summary info only)
export async function GET(request: NextRequest) {
  const auth = await getCrmAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const collection = await getLandingDomainsCollection();

  // Only return pages that have an `id` field (new format)
  // Old drag-and-drop pages used realtorId as primary key and have no `id` field
  const pages = await collection
    .find({ realtorId: auth.user.id, id: { $exists: true } })
    .sort({ updatedAt: -1 })
    .toArray();

  return NextResponse.json({
    pages: pages.map((p) => ({
      id: p.id,
      name: p.name || "Untitled",
      subdomain: p.subdomain || "",
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      promptCount: (p.promptHistory || []).length,
    })),
  });
}

// POST /api/landing-page
// Creates a new empty landing page and returns its ID
export async function POST(request: NextRequest) {
  const auth = await getCrmAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "Untitled Landing Page";

  const collection = await getLandingDomainsCollection();
  const id = makeLandingPageId();
  const now = new Date().toISOString();

  await collection.insertOne({
    id,
    realtorId: auth.user.id,
    name,
    subdomain: "",
    widgets: [],
    code: "",
    promptHistory: [],
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ id });
}
