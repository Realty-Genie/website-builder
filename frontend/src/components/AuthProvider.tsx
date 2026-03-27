'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { checkAuth } from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation';

const publicPaths = ['/login', '/register', '/'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, setLoading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      try {
        const publicPath = publicPaths.includes(pathname);
        
        if (publicPath && isAuthenticated) {
          router.push('/dashboard');
          return;
        }

        if (!publicPath && !isAuthenticated) {
          const success = await checkAuth();
          if (!success) {
            if (pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
              router.push('/login');
            }
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
      </div>
    );
  }

  return <>{children}</>;
}
