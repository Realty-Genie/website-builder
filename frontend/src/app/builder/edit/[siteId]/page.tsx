'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import AppLayout from '@/components/layout/AppLayout';
import DetailsForm from '@/components/builder/DetailsForm';
import { templates } from '@/data/templates';
import { api } from '@/lib/api';
import type { Site, Template } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const { hasPro } = useAuthStore();
  const [template, setTemplate] = useState<Template | null>(null);
  const [siteData, setSiteData] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasPro) {
      return;
    }

    const fetchData = async () => {
      try {
        const siteId = params.siteId as string;
        const siteResponse = await api.sites.get(siteId);
        const site = siteResponse.site;
        
        const found = templates.find(t => t.id === site.templateId);
        setTemplate(found ?? null); // this can be an issue !!!!!!!!!!!!!!!!!!!!!!!!
        setSiteData({
          id: site.siteId,
          templateId: site.templateId,
          templateName: site.templateName,
          siteName: site.siteName,
          details: site.details || {},
          status: site.status,
          liveUrl: site.liveUrl,
          createdAt: site.createdAt,
          updatedAt: site.updatedAt,
        });
      } catch (err) {
        console.error('Failed to fetch site:', err);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasPro, params.siteId, router]);

  if (!hasPro || loading || !template) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout>
      <DetailsForm template={template} editMode siteData={siteData!} />
    </AppLayout>
  );
}
