import { NextRequest, NextResponse } from 'next/server';
import { getCrmAuth } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action !== 'me') {
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  }

  const auth = await getCrmAuth(request);

  if (!auth.ok) {
    return NextResponse.json(
      {
        success: false,
        error: auth.error,
        isAuthenticated: auth.isAuthenticated,
        hasPro: auth.hasPro,
      },
      { status: auth.status }
    );
  }

  return NextResponse.json({
    success: true,
    user: auth.user,
    hasPro: true,
  });
}
