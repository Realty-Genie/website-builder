'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { LayoutDashboard, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const sidebarItems = [
  { href: '/dashboard', label: 'Website Builder', icon: LayoutDashboard, tab: 'website-builder' },
  {
    href: '/dashboard?tab=landing-page-generator',
    label: 'Landing Page Generator',
    icon: FileText,
    tab: 'landing-page-generator',
  },
];

const Sidebar = ({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hasPro } = useAuthStore();
  const activeTab =
    searchParams.get('tab') === 'landing-page-generator'
      ? 'landing-page-generator'
      : 'website-builder';

  if (!hasPro) return null;

  return (
    <aside
      className={`
        fixed left-0 top-14 bottom-0 hidden border-r border-[#2A2A2E] bg-[#111214]/95 backdrop-blur-sm lg:block
        transition-all duration-200 z-30
        ${collapsed ? 'w-14' : 'w-64'}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-1 px-2 py-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === '/dashboard' && activeTab === item.tab;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2.5 rounded-xl px-3 py-2.5
                  transition-all duration-150 group
                  ${
                    isActive
                      ? 'bg-[#1C1F24] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]'
                      : 'text-[#8B8B95] hover:bg-[#17191D] hover:text-white'
                  }
                `}
              >
                <Icon className={`w-4 h-4 shrink-0`} />
                {!collapsed && (
                  <span className="whitespace-nowrap text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        <button
          onClick={onToggle}
          className="absolute -right-2.5 top-20 flex h-5 w-5 items-center justify-center rounded-full border border-[#2A2A2E] bg-[#141416] text-[#8B8B95] transition-colors hover:border-[#3A3A40] hover:text-white"
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
