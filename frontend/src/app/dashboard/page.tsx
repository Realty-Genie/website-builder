'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import LandingPageGenerator from '@/components/landing/LandingPageGenerator';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';
import {
  FolderOpen,
  ExternalLink,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Pencil,
  Trash2,
} from 'lucide-react';

interface Site {
  id: string;
  templateName: string;
  siteName: string;
  status: 'draft' | 'building' | 'deployed' | 'failed';
  liveUrl?: string;
  deployError?: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const { hasPro } = useAuthStore();
  const searchParams = useSearchParams();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const activeTab =
    searchParams.get('tab') === 'landing-page-generator'
      ? 'landing-page-generator'
      : 'website-builder';

  useEffect(() => {
    if (!hasPro || activeTab !== 'website-builder') {
      return;
    }
    fetchSites();
  }, [hasPro, activeTab]);

  useEffect(() => {
    if (activeTab !== 'website-builder') {
      return;
    }

    const hasBuilding = sites.some((site) => site.status === 'building');
    if (!hasBuilding) return;

    const interval = setInterval(() => {
      fetchSites();
    }, 5000);

    return () => clearInterval(interval);
  }, [sites, activeTab]);

  const fetchSites = async () => {
    try {
      const data = await api.sites.list();
      setSites(data.sites || []);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeploy = async (siteId: string) => {
    try {
      await api.sites.redeploy(siteId);
      fetchSites();
    } catch (error) {
      console.error('Failed to redeploy:', error);
    }
  };

  const handleDelete = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this site? This action cannot be undone.')) {
      return;
    }
    try {
      await api.sites.delete(siteId);
      fetchSites();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const statusConfig = {
    draft: { variant: 'default' as const, icon: FolderOpen, label: 'Draft' },
    building: { variant: 'warning' as const, icon: Loader2, label: 'Building' },
    deployed: { variant: 'success' as const, icon: CheckCircle, label: 'Live' },
    failed: { variant: 'error' as const, icon: XCircle, label: 'Failed' },
  };

  return (
    <AppLayout>
      {activeTab === 'landing-page-generator' ? (
        <LandingPageGenerator />
      ) : (
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                Your Sites
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Manage and monitor your deployments
              </p>
            </div>

            <Link href="/builder/templates">
              <Button className="w-full bg-indigo-500 text-white hover:bg-indigo-600 sm:w-auto">
                New Site
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 sm:py-24">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          ) : sites.length === 0 ? (
            <Card className="mx-auto max-w-lg rounded-lg border-dashed border-white/20 bg-zinc-900/40 p-8 text-center shadow-inner sm:p-12">
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 sm:h-14 sm:w-14">
                  <FolderOpen className="h-5 w-5 text-zinc-500 sm:h-6 sm:w-6" />
                </div>

                <h3 className="text-base font-medium text-white sm:text-lg">
                  No sites yet
                </h3>

                <p className="mt-1 max-w-sm text-sm text-zinc-500">
                  Start by creating your first site from a template.
                </p>

                <Link href="/builder/templates" className="mt-5">
                  <Button className="border border-zinc-700 bg-zinc-800 text-white shadow-inner hover:bg-zinc-700">
                    Browse Templates
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sites.map((site) => {
                const status = statusConfig[site.status];
                const StatusIcon = status.icon;

                return (
                  <Card
                    key={site.id}
                    className="group flex flex-col justify-between border border-zinc-800 bg-zinc-900/60 p-5 transition-all hover:border-zinc-700"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                          <FolderOpen className="h-5 w-5 text-zinc-400" />
                        </div>

                        <Badge variant={status.variant} className="gap-1 text-xs">
                          <StatusIcon
                            className={`h-3 w-3 ${site.status === 'building' ? 'animate-spin' : ''}`}
                          />
                          {status.label}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="truncate text-sm font-semibold text-white">
                          {site.siteName}
                        </h3>

                        <p className="mt-0.5 text-xs text-zinc-500">
                          {site.templateName}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Clock className="h-3 w-3" />
                        {new Date(site.createdAt).toLocaleDateString()}
                      </div>

                      {site.status === 'failed' && site.deployError ? (
                        <p className="text-xs leading-5 text-red-400/90">
                          {site.deployError}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-5 flex gap-2">
                      {site.status === 'deployed' && site.liveUrl && (
                        <>
                          <a
                            href={site.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 py-2 text-sm text-white transition hover:bg-zinc-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View
                          </a>

                          <button
                            onClick={() => handleRedeploy(site.id)}
                            className="flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 px-3 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      <Link
                        href={`/builder/edit/${site.id}`}
                        className="flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 px-3 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                      <button
                        onClick={() => handleDelete(site.id)}
                        className="flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 px-3 text-zinc-300 transition hover:bg-red-900/50 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
