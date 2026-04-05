import { NextRequest, NextResponse } from 'next/server';

interface LeadSubmissionBody {
  realtorUserId: string;
  leadType: 'contact' | string;
  sourceTemplate: string;
  sourcePage: string;
  lead: {
    name: string;
    email: string;
    phone: string;
  };
  context?: {
    userAgent?: string;
    referrer?: string;
    preview?: string;
    submittedAt?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const CRM_URL = process.env.CRM_URL || 'https://realty-crm-web.vercel.app';
    const payload: LeadSubmissionBody = await request.json();

    const response = await fetch(`${CRM_URL}/api/v1/add/lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Lead proxy submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
