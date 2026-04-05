import { useAuthStore } from './authStore';

async function parseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getNestedRecord(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return isRecord(value) ? value : null;
}

function normalizeAuthUser(data: unknown) {
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

  const subscription = isRecord(rawUser.subscription) ? rawUser.subscription : null;
  const planNameSource = subscription?.planName ?? rawUser.planName ?? data.planName;
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

function getAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  const keys = ['accessToken', 'access_token', 'token'];

  for (const key of keys) {
    const value = searchParams.get(key)?.trim() || hashParams.get(key)?.trim();
    if (value) {
      window.localStorage.setItem('accessToken', value);
      return value;
    }
  }

  const storedToken = window.localStorage.getItem('accessToken')?.trim();
  if (storedToken) {
    return storedToken;
  }

  return null;
}

function clearStoredAccessToken() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem('accessToken');
}

function getBackendUrl() {
  return process.env.BACKEND_URL?.replace(/\/$/, '') || '';
}

function getAuthorizationHeaders(headers?: HeadersInit) {
  const authHeaders = new Headers(headers);
  const accessToken = getAccessToken();

  if (accessToken) {
    authHeaders.set('authorization', `Bearer ${accessToken}`);
  }

  return authHeaders;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = getAuthorizationHeaders(options.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`/api${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await parseJson(response);

  if (response.status === 401) {
    clearStoredAccessToken();
    useAuthStore.getState().clearSession(data?.error || 'Sign in from the CRM to continue.');
    throw new Error(data?.error || 'Unauthorized');
  }

  if (response.status === 403) {
    useAuthStore.getState().setForbidden(
      data?.error || 'A Pro subscription is required to use this app.'
    );
    throw new Error(data?.error || 'Forbidden');
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  auth: {
    me: () => fetchWithAuth('/auth?action=me'),
  },

  leads: {
    submitPublic: async (payload: {
      realtorUserId: string;
      leadType: string;
      sourceTemplate: string;
      sourcePage: string;
      lead: Record<string, string>;
      context?: Record<string, string>;
    }) => {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to submit lead');
      }

      return data;
    },
  },

  templates: {
    list: () => fetchWithAuth('/templates'),
    get: (id: string) => fetchWithAuth(`/templates?id=${id}`),
  },

  sites: {
    list: () => fetchWithAuth('/sites'),
    get: (id: string) => fetchWithAuth(`/sites?id=${id}`),
    create: async (
      templateId: string,
      siteName: string,
      details: Record<string, string>,
      imageFile?: File
    ) => {
      const formData = new FormData();
      formData.append('templateId', templateId);
      formData.append('siteName', siteName);
      formData.append('details', JSON.stringify(details));
      if (imageFile) {
        formData.append('agentPhoto', imageFile);
      }

      const response = await fetch('/api/sites', {
        method: 'POST',
        body: formData,
        headers: getAuthorizationHeaders(),
        credentials: 'include',
      });

      const data = await parseJson(response);

      if (response.status === 401) {
        clearStoredAccessToken();
        useAuthStore.getState().clearSession(data?.error || 'Sign in from the CRM to continue.');
      }

      if (response.status === 403) {
        useAuthStore.getState().setForbidden(
          data?.error || 'A Pro subscription is required to use this app.'
        );
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create site');
      }

      return data;
    },
    getBuildLogs: (id: string) => fetchWithAuth(`/sites?id=${id}&buildLogs=true`),
    redeploy: (id: string) => fetchWithAuth(`/sites?id=${id}&redeploy=true`, { method: 'POST' }),
    update: async (siteId: string, details: Record<string, string>, imageFile?: File) => {
      const formData = new FormData();
      formData.append('details', JSON.stringify(details));
      if (imageFile) {
        formData.append('agentPhoto', imageFile);
      }

      const response = await fetch(`/api/sites?id=${siteId}`, {
        method: 'PUT',
        body: formData,
        headers: getAuthorizationHeaders(),
        credentials: 'include',
      });

      const data = await parseJson(response);

      if (response.status === 401) {
        clearStoredAccessToken();
        useAuthStore.getState().clearSession(data?.error || 'Sign in from the CRM to continue.');
      }

      if (response.status === 403) {
        useAuthStore.getState().setForbidden(
          data?.error || 'A Pro subscription is required to use this app.'
        );
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update site');
      }

      return data;
    },
    delete: (id: string) => fetchWithAuth(`/sites?id=${id}`, { method: 'DELETE' }),
  },
};

export async function checkAuth() {
  try {
    const headers = getAuthorizationHeaders({
      Accept: 'application/json',
    });

    const response = await fetch(`${getBackendUrl()}/user/me/pro`, {
      headers,
      credentials: 'include',
      cache: 'no-store',
    });
    const data = await parseJson(response);

    if (response.status === 401) {
      clearStoredAccessToken();
      useAuthStore.getState().clearSession();
      return false;
    }

    if (response.status === 403) {
      useAuthStore.getState().setForbidden(
        data?.error || 'A Pro subscription is required to use this app.'
      );
      return false;
    }

    if (!response.ok) {
      clearStoredAccessToken();
      useAuthStore.getState().clearSession(data?.error || 'Unable to verify CRM access.');
      return false;
    }

    const user = normalizeAuthUser(data);

    if (!user) {
      clearStoredAccessToken();
      useAuthStore.getState().clearSession('CRM user data is missing from /user/me/pro response.');
      return false;
    }

    useAuthStore.getState().setAuthenticatedUser(user);
    return true;
  } catch {
    clearStoredAccessToken();
    useAuthStore.getState().clearSession('Unable to reach the CRM authentication service.');
    return false;
  }
}
