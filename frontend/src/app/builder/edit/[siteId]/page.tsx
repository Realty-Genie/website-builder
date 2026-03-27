'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import AppLayout from '@/components/layout/AppLayout';
import DetailsForm from '@/components/builder/DetailsForm';
import { templates } from '@/data/templates';
import { api } from '@/lib/api';
import { Site } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [template, setTemplate] = useState<any>(null);
  const [siteData, setSiteData] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const siteId = params.siteId as string;
        const siteResponse = await api.sites.get(siteId);
        const site = siteResponse.site;
        
        const found = templates.find(t => t.id === site.templateId);
        setTemplate(found);
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
  }, [isAuthenticated, params.siteId, router]);

  if (!isAuthenticated || loading || !template) {
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
