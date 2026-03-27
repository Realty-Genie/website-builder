'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import AppLayout from '@/components/layout/AppLayout';
import DetailsForm from '@/components/builder/DetailsForm';
import { templates } from '@/data/templates';
import { Loader2 } from 'lucide-react';

export default function DetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [template, setTemplate] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    const templateId = params.templateId as string;
    const found = templates.find(t => t.id === templateId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTemplate(found);
  }, [isAuthenticated, params.templateId, router]);

  if (!isAuthenticated || !template) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout>
      <DetailsForm template={template} />
    </AppLayout>
  );
}
