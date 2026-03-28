'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
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
import Link from 'next/link';

interface Site {
  id: string;
  templateName: string;
  siteName: string;
  status: 'draft' | 'building' | 'deployed' | 'failed';
  liveUrl?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { hasPro } = useAuthStore();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasPro) {
      return;
    }
    fetchSites();
  }, [hasPro]);

  useEffect(() => {
    const hasBuilding = sites.some(s => s.status === 'building');
    if (!hasBuilding) return;

    const interval = setInterval(() => {
      fetchSites();
    }, 5000);

    return () => clearInterval(interval);
  }, [sites]);

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
      <div className="space-y-6 sm:space-y-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              Your Sites
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Manage and monitor your deployments
            </p>
          </div>

          <Link href="/builder/templates">
            <Button className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white">
              New Site
            </Button>
          </Link>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex items-center justify-center py-16 sm:py-24">
            <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
          </div>
        ) : sites.length === 0 ? (

          /* EMPTY */
          <Card className="p-8 sm:p-12 border-dashed bg-zinc-900/40 shadow-inner border-white/20 text-center max-w-lg rounded-lg mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <FolderOpen className="w-5 sm:w-6 h-5 sm:h-6 text-zinc-500" />
              </div>

              <h3 className="text-base sm:text-lg font-medium text-white">
                No sites yet
              </h3>

              <p className="text-sm text-zinc-500 mt-1 max-w-sm">
                Start by creating your first site from a template.
              </p>

              <Link href="/builder/templates" className="mt-5">
                <Button className="bg-zinc-800 hover:bg-zinc-700 shadow-inner text-white border border-zinc-700">
                  Browse Templates
                </Button>
              </Link>
            </div>
          </Card>

        ) : (

          /* GRID */
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sites.map((site) => {
              const status = statusConfig[site.status];
              const StatusIcon = status.icon;

              return (
                <Card
                  key={site.id}
                  className="group flex flex-col justify-between p-5 border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-all"
                >

                  {/* TOP */}
                  <div className="space-y-4">

                    {/* ICON + STATUS */}
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-zinc-400" />
                      </div>

                      <Badge variant={status.variant} className="gap-1 text-xs">
                        <StatusIcon
                          className={`w-3 h-3 ${
                            site.status === 'building' ? 'animate-spin' : ''
                          }`}
                        />
                        {status.label}
                      </Badge>
                    </div>

                    {/* TEXT */}
                    <div>
                      <h3 className="text-sm font-semibold text-white truncate">
                        {site.siteName}
                      </h3>

                      <p className="text-xs text-zinc-500 mt-0.5">
                        {site.templateName}
                      </p>
                    </div>

                    {/* META */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {new Date(site.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2 mt-5">
                    {site.status === 'deployed' && site.liveUrl && (
                      <>
                        <a
                          href={site.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm text-white border border-zinc-700 transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View
                        </a>

                        <button
                          onClick={() => handleRedeploy(site.id)}
                          className="flex items-center justify-center px-3 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <Link
                      href={`/builder/edit/${site.id}`}
                      className="flex items-center justify-center px-3 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(site.id)}
                      className="flex items-center justify-center px-3 rounded-md bg-zinc-800 hover:bg-red-900/50 border border-zinc-700 text-zinc-300 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
