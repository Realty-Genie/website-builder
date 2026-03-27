'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { Layout, FolderOpen, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

const sidebarItems = [
  { href: '/builder/templates', label: 'Templates', icon: Layout },
  { href: '/dashboard', label: 'My Sites', icon: FolderOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <aside 
      className={`
        fixed left-0 top-14 bottom-0 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800
        transition-all duration-200 z-30
        ${collapsed ? 'w-14' : 'w-56'}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 py-3 px-2 space-y-0.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/builder/templates' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2.5 px-2.5 py-2 rounded-md
                  transition-all duration-150 group
                  ${isActive 
                    ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white' 
                    : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                  }
                `}
              >
                <Icon className={`w-4 h-4 shrink-0`} />
                {!collapsed && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="py-3 px-2 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-md w-full text-gray-500 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">
                Logout
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-2.5 top-20 w-5 h-5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
