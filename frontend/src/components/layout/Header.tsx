'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { Setting06Icon } from 'hugeicons-react';
import { useTheme } from '@/lib/ThemeProvider';
import { useAuthStore } from '@/lib/authStore';

const Header = () => {
  const router = useRouter();
  const { user, hasPro } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateToSettings = () => {
    router.push('/settings');
  };

  if (!hasPro) {
    return (
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#141416] border-b border-[#2A2A2E] z-40">
        <div className="h-full px-4 flex items-center justify-between max-w-8xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/realty_crm.webp"
              alt="Site Logo"
              width={30}
              height={30}
              className="rounded-lg shadow-inner"
            />
          </Link>
          <span className="text-sm text-[#A1A1AA]">CRM-authenticated Pro access</span>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#141416] border-b border-[#2A2A2E] z-40">
        <div className="h-full px-5 flex items-center justify-between max-w-8xl mx-auto">
          <button
            className="lg:hidden p-2 -ml-2 text-[#A1A1AA] hover:text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img
              src="/realty_crm.webp"
              alt="Site Logo"
              width={30}
              height={30}
              className="rounded-lg shadow-inner"
            />
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={navigateToSettings}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[#A1A1AA] hover:text-white hover:bg-[#1C1C1F] transition-colors"
            >
              <span className="hidden md:inline">
                <Setting06Icon className="w-4 h-4" />
              </span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#1C1C1F] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <span className="hidden sm:block text-sm text-[#A1A1AA]">
              {user?.email || user?.name || 'CRM User'}
            </span>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-56 bg-[#141416] border-r border-[#2A2A2E] animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-[#2A2A2E]">
              <span className="text-lg font-semibold text-white">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-[#A1A1AA] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#1C1C1F]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Website Builder
              </Link>
              <Link
                href="/dashboard?tab=landing-page-generator"
                className="block px-3 py-2 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#1C1C1F]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Landing Page Generator
              </Link>
              <Link
                href="/settings"
                className="block px-3 py-2 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#1C1C1F]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#2A2A2E]">
              <div className="px-3 py-2 text-sm text-[#A1A1AA]">
                {user?.email || user?.name || 'CRM User'}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
