'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import AppLayout from '@/components/layout/AppLayout';
import DetailsForm from '@/components/builder/DetailsForm';
import { templates } from '@/data/templates';
import { Loader2 } from 'lucide-react';
import type { Template } from '@/types';

export default function DetailsPage() {
  const params = useParams();
  const { hasPro } = useAuthStore();
  const [template, setTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (!hasPro) {
      return;
    }

    const templateId = params.templateId as string;
    const found = templates.find(t => t.id === templateId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTemplate(found);
  }, [hasPro, params.templateId]);

  if (!hasPro || !template) {
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
