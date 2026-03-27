'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { checkAuth } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated) {
        const success = await checkAuth();
        if (success) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } else {
        router.push('/dashboard');
      }
    };
    init();
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
      </div>
    );
  }

  return null;
}
