'use client';

import Header from './Header';
import Sidebar from './Sidebar';
import { ReactNode, useState } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useSearchParams } from 'next/navigation';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { hasPro } = useAuthStore();
  const searchParams = useSearchParams();
  const isLandingPageGenerator = searchParams.get('tab') === 'landing-page-generator';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isLandingPageGenerator);

  const contentPl = sidebarCollapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-[18.5rem]';

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <Header />
      <main className="pt-14 min-h-screen">
        {hasPro ? <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} /> : null}
        <div className={`mx-auto p-4 sm:p-6 lg:p-8 transition-all duration-200 ${isLandingPageGenerator ? contentPl : `max-w-8xl ${contentPl}`}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
