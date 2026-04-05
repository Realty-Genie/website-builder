'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { checkAuth } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';

const publicPaths = ['/'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      // If it's a localhost subdomain it's usually "subdomain.localhost"
      const isSubdomain = hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname.split('.').length > (isLocalhost ? 1 : 2) && !hostname.startsWith('www.');

      if (pathname.startsWith('/landing/') || isSubdomain) {
        setLoading(false);
        return;
      }

      setLoading(true);
      await checkAuth();

      if (!active) {
        return;
      }

      setLoading(false);
    };

    initAuth();

    return () => {
      active = false;
    };
  }, [pathname, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]" />
      </div>
    );
  }

  return <>{children}</>;
}
