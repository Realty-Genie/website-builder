import { NextRequest, NextResponse } from "next/server";
import { getLandingDomainsCollection } from "@/lib/server/mongodb";
import { getCrmAuth } from "@/lib/server/auth";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/landing-page/[id]
// Returns the full landing page data including widgets and prompt history
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await getCrmAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const collection = await getLandingDomainsCollection();

  const page = await collection.findOne({ id, realtorId: auth.user.id });
  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ page });
}

// PUT /api/landing-page/[id]
// Updates a landing page. Only the fields included in the body are updated.
// Used for: saving widgets after AI generation, setting subdomain when deploying, renaming.
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await getCrmAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  // Build the update object from only the fields that were sent
  const updateFields: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (body.name !== undefined) updateFields.name = body.name;
  if (body.widgets !== undefined) updateFields.widgets = body.widgets;
  if (body.code !== undefined) updateFields.code = body.code;
  if (body.subdomain !== undefined) updateFields.subdomain = body.subdomain;
  if (body.promptHistory !== undefined) updateFields.promptHistory = body.promptHistory;

  const collection = await getLandingDomainsCollection();
  const result = await collection.updateOne(
    { id, realtorId: auth.user.id },
    { $set: updateFields },
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/landing-page/[id]
// Permanently deletes a landing page
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await getCrmAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const collection = await getLandingDomainsCollection();

  const result = await collection.deleteOne({ id, realtorId: auth.user.id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
