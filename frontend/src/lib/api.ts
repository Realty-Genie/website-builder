import { useAuthStore } from './authStore';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`/api${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      fetchWithAuth('/auth?action=register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    login: (email: string, password: string) =>
      fetchWithAuth('/auth?action=login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    logout: () =>
      fetchWithAuth('/auth?action=logout', {
        method: 'POST',
      }),

    me: () => fetchWithAuth('/auth?action=me'),

    refresh: () =>
      fetchWithAuth('/auth?action=refresh', {
        method: 'POST',
      }),
  },

  templates: {
    list: () => fetchWithAuth('/templates'),
    get: (id: string) => fetchWithAuth(`/templates?id=${id}`),
  },

  sites: {
    list: () => fetchWithAuth('/sites'),
    get: (id: string) => fetchWithAuth(`/sites?id=${id}`),
    create: async (templateId: string, siteName: string, details: Record<string, string>, imageFile?: File) => {
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
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create site');
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
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update site');
      }

      return data;
    },
    delete: (id: string) => fetchWithAuth(`/sites?id=${id}`, { method: 'DELETE' }),
  },
};

export async function checkAuth() {
  try {
    const response = await fetch('/api/auth?action=me', { credentials: 'include' });
    if (!response.ok) {
      useAuthStore.getState().logout();
      return false;
    }
    const data = await response.json();
    if (data.success && data.user) {
      useAuthStore.getState().setUser(data.user);
      return true;
    }
    useAuthStore.getState().logout();
    return false;
  } catch (error) {
    useAuthStore.getState().logout();
    return false;
  }
}