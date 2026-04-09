"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, FileText, Trash2, ExternalLink, Clock, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import type { LandingPageSummary } from "@/types/domain";

type Props = {
  // Called when the user opens a landing page to edit it
  onSelectPage: (id: string) => void;
};

export default function LandingPageList({ onSelectPage }: Props) {
  const [pages, setPages] = useState<LandingPageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    setLoading(true);
    try {
      const data = await api.landingPages.list();
      setPages(data.pages || []);
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createNewPage() {
    setCreating(true);
    try {
      const data = await api.landingPages.create("Untitled Landing Page");
      // Open the new page directly in the editor
      onSelectPage(data.id);
    } catch (error) {
      console.error("Failed to create page:", error);
    } finally {
      setCreating(false);
    }
  }

  async function deletePage(pageId: string, pageName: string) {
    const confirmed = confirm(`Delete "${pageName}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(pageId);
    try {
      await api.landingPages.delete(pageId);
      setPages((current) => current.filter((p) => p.id !== pageId));
    } catch (error) {
      console.error("Failed to delete page:", error);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Landing Pages
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            AI-generated landing pages for your real estate listings
          </p>
        </div>

        <button
          onClick={createNewPage}
          disabled={creating}
          className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50 sm:w-auto w-full justify-center"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          New Landing Page
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : pages.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
            <Sparkles className="h-6 w-6 text-zinc-400" />
          </div>
          <h3 className="text-base font-medium text-white">No landing pages yet</h3>
          <p className="mt-1.5 max-w-sm text-sm text-zinc-500">
            Create your first AI-powered landing page. Just describe what you want and the AI
            builds it for you.
          </p>
          <button
            onClick={createNewPage}
            disabled={creating}
            className="mt-6 flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create Landing Page
          </button>
        </div>
      ) : (
        // Grid of page cards
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all hover:border-zinc-700"
            >
              {/* Card header */}
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <FileText className="h-5 w-5 text-zinc-400" />
                </div>

                <div>
                  <h3 className="truncate text-sm font-semibold text-white">{page.name}</h3>
                  {page.subdomain ? (
                    <p className="mt-0.5 text-xs text-sky-400">/landing/{page.subdomain}</p>
                  ) : (
                    <p className="mt-0.5 text-xs text-zinc-600">No subdomain set</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock className="h-3 w-3" />
                  {new Date(page.updatedAt).toLocaleDateString()}
                  {page.promptCount > 0 && (
                    <span className="ml-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                      {page.promptCount} {page.promptCount === 1 ? "prompt" : "prompts"}
                    </span>
                  )}
                </div>
              </div>

              {/* Card actions */}
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => onSelectPage(page.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 py-2 text-sm text-white transition hover:bg-zinc-700"
                >
                  Open Editor
                </button>

                {page.subdomain && (
                  <a
                    href={`/landing/${page.subdomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 px-3 text-zinc-300 transition hover:bg-zinc-700"
                    title="View live page"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}

                <button
                  onClick={() => deletePage(page.id, page.name)}
                  disabled={deletingId === page.id}
                  className="flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 px-3 text-zinc-300 transition hover:bg-red-900/50 hover:text-red-400 disabled:opacity-40"
                  title="Delete page"
                >
                  {deletingId === page.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
