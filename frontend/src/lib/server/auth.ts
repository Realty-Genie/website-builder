import { NextRequest } from 'next/server';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  businessName?: string;
  avatarUrl?: string;
  onboardingComplete?: boolean;
  subscriptionPlan?: string;
  isSubscribed?: boolean;
}

type AuthSuccess = {
  ok: true;
  status: 200;
  user: AuthUser;
  hasPro: true;
};

type AuthFailure = {
  ok: false;
  status: number;
  error: string;
  isAuthenticated: boolean;
  hasPro: boolean;
};

export type AuthResult = AuthSuccess | AuthFailure;

function getMeProUrl() {
  const backendUrl = process.env.BACKEND_URL?.trim();

  if (!backendUrl) {
    throw new Error('BACKEND_URL is not configured');
  }

  return `${backendUrl.replace(/\/$/, '')}/user/me/pro`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getNestedRecord(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return isRecord(value) ? value : null;
}

function normalizeUser(data: unknown): AuthUser | null {
  if (!isRecord(data)) {
    return null;
  }

  const directUser = getNestedRecord(data, 'user');
  const nestedData = getNestedRecord(data, 'data');
  const nestedUser = nestedData ? getNestedRecord(nestedData, 'user') : null;
  const rawUser = directUser ?? nestedUser ?? data;

  const id = rawUser._id ?? rawUser.id ?? data.userId ?? data.id;
  if (typeof id !== 'string' || !id) {
    return null;
  }

  const firstName = typeof rawUser.firstName === 'string' ? rawUser.firstName : undefined;
  const lastName = typeof rawUser.lastName === 'string' ? rawUser.lastName : undefined;
  const fullName = typeof rawUser.name === 'string'
    ? rawUser.name
    : [firstName, lastName].filter(Boolean).join(' ') || undefined;

  const planNameSource = isRecord(rawUser.subscription)
    ? rawUser.subscription.planName
    : rawUser.planName ?? data.planName;
  const subscriptionPlan = typeof planNameSource === 'string' ? planNameSource : undefined;

  return {
    id,
    email: typeof rawUser.email === 'string' ? rawUser.email : undefined,
    name: fullName,
    firstName,
    lastName,
    role: typeof rawUser.role === 'string' ? rawUser.role : undefined,
    businessName: typeof rawUser.businessName === 'string' ? rawUser.businessName : undefined,
    avatarUrl: typeof rawUser.avatarUrl === 'string' ? rawUser.avatarUrl : undefined,
    onboardingComplete:
      typeof rawUser.onboardingComplete === 'boolean' ? rawUser.onboardingComplete : undefined,
    subscriptionPlan,
    isSubscribed:
      typeof rawUser.isSubscribed === 'boolean'
        ? rawUser.isSubscribed
        : subscriptionPlan
          ? subscriptionPlan.toLowerCase() !== 'free'
          : true,
  };
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(body: unknown, fallback: string) {
  if (!isRecord(body)) {
    return fallback;
  }

  const message = body.message ?? body.error;
  return typeof message === 'string' && message ? message : fallback;
}

export async function getCrmAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const headers = new Headers({
      Accept: 'application/json',
    });

    const cookie = request.headers.get('cookie');
    if (cookie) {
      headers.set('cookie', cookie);
    }

    const authorization = request.headers.get('authorization');
    if (authorization) {
      headers.set('authorization', authorization);
    }

    const response = await fetch(getMeProUrl(), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const body = await parseResponseBody(response);

    if (response.status === 401) {
      return {
        ok: false,
        status: 401,
        error: getErrorMessage(body, 'Sign in from the CRM to access this app.'),
        isAuthenticated: false,
        hasPro: false,
      };
    }

    if (response.status === 403) {
      return {
        ok: false,
        status: 403,
        error: getErrorMessage(body, 'A Pro subscription is required to use this app.'),
        isAuthenticated: true,
        hasPro: false,
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: getErrorMessage(body, 'Unable to verify CRM access.'),
        isAuthenticated: false,
        hasPro: false,
      };
    }

    const user = normalizeUser(body);
    if (!user) {
      return {
        ok: false,
        status: 500,
        error: 'CRM user data is missing from /user/me/pro response.',
        isAuthenticated: false,
        hasPro: false,
      };
    }

    return {
      ok: true,
      status: 200,
      user,
      hasPro: true,
    };
  } catch (error) {
    console.error('CRM auth error:', error);
    return {
      ok: false,
      status: 500,
      error: 'Unable to reach the CRM authentication service.',
      isAuthenticated: false,
      hasPro: false,
    };
  }
}
