import { NextRequest, NextResponse } from 'next/server';

type LeadPayload = {
  realtorUserId: string;
  leadType: string;
  sourceTemplate: string;
  sourcePage: string;
  lead: Record<string, string>;
  context?: Record<string, string>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getCrmLeadUrl() {
  const explicitLeadUrl = process.env.CRM_LEADS_URL?.trim();
  if (explicitLeadUrl) {
    return explicitLeadUrl;
  }

  const backendUrl = process.env.BACKEND_URL?.trim();
  if (!backendUrl) {
    throw new Error('CRM lead endpoint is not configured');
  }

  return `${backendUrl.replace(/\/$/, '')}/leads`;
}

function normalizeStringMap(value: unknown) {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, rawValue]) =>
      typeof rawValue === 'string' && rawValue.trim() ? [[key, rawValue.trim()]] : []
    )
  );
}

function normalizeLeadPayload(body: unknown): LeadPayload | null {
  if (!isRecord(body)) {
    return null;
  }

  const realtorUserId =
    typeof body.realtorUserId === 'string' ? body.realtorUserId.trim() : '';
  const leadType = typeof body.leadType === 'string' ? body.leadType.trim() : '';
  const sourceTemplate =
    typeof body.sourceTemplate === 'string' ? body.sourceTemplate.trim() : '';
  const sourcePage = typeof body.sourcePage === 'string' ? body.sourcePage.trim() : '';

  if (!realtorUserId || !leadType || !sourceTemplate || !sourcePage) {
    return null;
  }

  return {
    realtorUserId,
    leadType,
    sourceTemplate,
    sourcePage,
    lead: normalizeStringMap(body.lead),
    context: normalizeStringMap(body.context),
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = normalizeLeadPayload(await request.json());

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid lead payload' },
        { status: 400 }
      );
    }

    const response = await fetch(getCrmLeadUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        userId: payload.realtorUserId,
        leadType: payload.leadType,
        sourceTemplate: payload.sourceTemplate,
        sourcePage: payload.sourcePage,
        lead: payload.lead,
        context: payload.context ?? {},
        submittedAt: new Date().toISOString(),
      }),
      cache: 'no-store',
    });

    let responseBody: unknown = null;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = null;
    }

    if (!response.ok) {
      const message =
        isRecord(responseBody) && typeof responseBody.error === 'string'
          ? responseBody.error
          : 'Failed to submit lead to CRM';

      return NextResponse.json({ success: false, error: message }, { status: response.status });
    }

    return NextResponse.json({ success: true, data: responseBody });
  } catch (error) {
    console.error('Lead forwarding error:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to forward lead to CRM' },
      { status: 500 }
    );
  }
}
