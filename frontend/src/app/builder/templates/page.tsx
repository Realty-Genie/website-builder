'use client';

import { useAuthStore } from '@/lib/authStore';
import AppLayout from '@/components/layout/AppLayout';
import TemplateGallery from '@/components/builder/TemplateGallery';

export default function TemplatesPage() {
  const { hasPro } = useAuthStore();

  if (!hasPro) {
    return null;
  }

  return (
    <AppLayout>
      <TemplateGallery />
    </AppLayout>
  );
}
