'use client';

import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { User, Bell } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#FAFAFA]">Settings</h1>
          <p className="text-sm sm:text-base text-[#71717A] mt-1">Manage your account preferences</p>
        </div>

        <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#2A2A2E]">
            <div className="w-10 h-10 rounded-lg bg-[#1C1C1F] flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-[#A1A1AA]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#FAFAFA]">Profile</h2>
              <p className="text-sm text-[#71717A]">Your personal information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              defaultValue={user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="hello@example.com"
              defaultValue={user?.email}
            />
          </div>

          <Button className="w-full sm:w-auto">Save Changes</Button>
        </Card>

        <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#2A2A2E]">
            <div className="w-10 h-10 rounded-lg bg-[#1C1C1F] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-[#A1A1AA]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#FAFAFA]">Notifications</h2>
              <p className="text-sm text-[#71717A]">Configure notification preferences</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-[#A1A1AA]">Email notifications</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[#2A2A2E] bg-[#1C1C1F]" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-[#A1A1AA]">Build status updates</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[#2A2A2E] bg-[#1C1C1F]" />
            </label>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
