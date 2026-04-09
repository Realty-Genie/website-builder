"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, FileText, Trash2, ExternalLink, Clock, Sparkles, X } from "lucide-react";
import { api } from "@/lib/api";
import { LANDING_TEMPLATES } from "./landingTemplates";
import type { LandingPageSummary } from "@/types/domain";

type Props = {
  onSelectPage: (id: string) => void;
};

export default function LandingPageList({ onSelectPage }: Props) {
  const [pages, setPages] = useState<LandingPageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Template picker modal state
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);

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

  // Creates a new landing page from a chosen template and opens it in the editor
  async function createFromTemplate(templateId: string) {
    setCreatingTemplateId(templateId);
    try {
      const template = LANDING_TEMPLATES.find((t) => t.id === templateId);
      const name = template ? `${template.name} Landing Page` : "Untitled Landing Page";
      const widgets = template?.widgets || [];

      const data = await api.landingPages.create(name, widgets);
      setShowTemplatePicker(false);
      onSelectPage(data.id);
    } catch (error) {
      console.error("Failed to create page:", error);
    } finally {
      setCreatingTemplateId(null);
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
          onClick={() => setShowTemplatePicker(true)}
          className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 sm:w-auto w-full justify-center"
        >
          <Plus className="h-4 w-4" />
          New Landing Page
        </button>
      </div>

      {/* Page list */}
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
            Create your first AI-powered landing page. Pick a template and refine it with the AI.
          </p>
          <button
            onClick={() => setShowTemplatePicker(true)}
            className="mt-6 flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            <Plus className="h-4 w-4" />
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
                    <p className="mt-0.5 text-xs text-zinc-600">Not deployed yet</p>
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

      {/* ── Template Picker Modal ──────────────────────────────── */}
      {showTemplatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-white">Choose a Starting Template</h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Pick a template, then customize it with AI or the visual editor.
                </p>
              </div>
              <button
                onClick={() => setShowTemplatePicker(false)}
                className="rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Template grid */}
            <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
              {LANDING_TEMPLATES.map((template) => {
                const isCreating = creatingTemplateId === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => createFromTemplate(template.id)}
                    disabled={creatingTemplateId !== null}
                    className="flex items-start gap-3 rounded-lg border border-zinc-700 bg-zinc-800/60 p-4 text-left transition hover:border-zinc-600 hover:bg-zinc-800 disabled:opacity-60"
                  >
                    {/* Emoji icon */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-700 text-xl">
                      {template.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{template.name}</p>
                        {isCreating && <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />}
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-500">{template.description}</p>
                      {template.widgets.length > 0 && (
                        <p className="mt-1.5 text-[10px] text-zinc-600">
                          {template.widgets.length} widgets included
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
