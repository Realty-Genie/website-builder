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
      setLoading(true);
      await checkAuth();

      if (!active) {
        return;
      }

      publicPaths.includes(pathname);

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
