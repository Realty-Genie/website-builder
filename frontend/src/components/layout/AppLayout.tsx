'use client';

import Header from './Header';
import { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <Header />
      <main className="pt-14 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
