"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Send,
  Loader2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Edit3,
  Eye,
  X,
} from "lucide-react";
import { LandingRenderer } from "@/components/LandingRenderer";
import { generateCodeString } from "@/lib/landing/codeGeneration";
import { useAuthStore } from "@/lib/authStore";
import { api } from "@/lib/api";
import WidgetEditor from "./WidgetEditor";
import type { PromptHistoryItem } from "@/types/domain";
import type { CanvasWidget } from "@/types/widgets";
import { rootDomain } from "@/lib/utils";

const STARTER_PROMPTS = [
  "Create a luxury condo listing page in downtown Manhattan",
  "Build a lead capture page for first-time home buyers",
  "Make a listing page for a 4-bedroom family home in the suburbs",
  "Design a page for a beachfront property with stunning ocean views",
];

type MobileTab = "ai" | "edit" | "preview";
type DesktopLeftMode = "ai" | "edit";

type Props = {
  pageId: string;
  onBack: () => void;
};

export default function LandingPageEditor({ pageId, onBack }: Props) {
  const { user } = useAuthStore();

  const [pageName, setPageName] = useState("Untitled Landing Page");
  const [widgets, setWidgets] = useState<CanvasWidget[]>([]);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [subdomain, setSubdomain] = useState("");

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [mobileTab, setMobileTab] = useState<MobileTab>("ai");
  const [desktopLeftMode, setDesktopLeftMode] = useState<DesktopLeftMode>("ai");

  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deploySubdomain, setDeploySubdomain] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState("");
  const [deploySuccess, setDeploySuccess] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadPage();
  }, [pageId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [promptHistory, isGenerating]);

  async function loadPage() {
    setIsLoadingPage(true);
    try {
      const data = await api.landingPages.get(pageId);
      const page = data.page;
      setPageName(page.name || "Untitled Landing Page");
      setWidgets(page.widgets || []);
      setPromptHistory(page.promptHistory || []);
      setSubdomain(page.subdomain || "");
      setDeploySubdomain(page.subdomain || "");
    } catch (error) {
      console.error("Failed to load page:", error);
    } finally {
      setIsLoadingPage(false);
    }
  }

  async function savePageName() {
    await api.landingPages.update(pageId, { name: pageName }).catch(console.error);
  }

  async function handleSendPrompt() {
    const trimmedPrompt = currentPrompt.trim();
    if (!trimmedPrompt || isGenerating) return;

    setIsGenerating(true);
    setGenerationError(null);
    setCurrentPrompt("");

    const newEntry: PromptHistoryItem = {
      prompt: trimmedPrompt,
      timestamp: new Date().toISOString(),
    };
    const newHistory = [...promptHistory, newEntry];
    setPromptHistory(newHistory);

    try {
      const data = await api.landingPages.generate(trimmedPrompt, widgets);
      const newWidgets = data.widgets as CanvasWidget[];
      setWidgets(newWidgets);
      setMobileTab("preview");
      await api.landingPages.update(pageId, { widgets: newWidgets, promptHistory: newHistory });
    } catch (error) {
      setPromptHistory(promptHistory);
      setGenerationError(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsGenerating(false);
      promptInputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  }

  async function handleWidgetsChange(newWidgets: CanvasWidget[]) {
    setWidgets(newWidgets);
    await api.landingPages.update(pageId, { widgets: newWidgets }).catch(console.error);
  }

  async function handleDeploy() {
    const trimmedSubdomain = deploySubdomain.trim();
    if (!trimmedSubdomain) {
      setDeployError("Please enter a subdomain");
      return;
    }
    if (widgets.length === 0) {
      setDeployError("Generate some content first before deploying");
      return;
    }

    setIsDeploying(true);
    setDeployError("");
    setDeploySuccess(false);

    try {
      const code = generateCodeString(widgets, user?.id || "anonymous");
      await api.landingPages.update(pageId, { subdomain: trimmedSubdomain, code, widgets });
      setSubdomain(trimmedSubdomain);
      setDeploySuccess(true);
      setTimeout(() => {
        setShowDeployModal(false);
        setDeploySuccess(false);
      }, 2000);
    } catch (error) {
      setDeployError(
        error instanceof Error ? error.message : "Deploy failed. Please try again.",
      );
    } finally {
      setIsDeploying(false);
    }
  }

  function openDeployModal() {
    setDeploySubdomain(subdomain);
    setDeployError("");
    setDeploySuccess(false);
    setShowDeployModal(true);
  }

  // ── Shared JSX blocks (NOT components — just variables to avoid duplication) ──

  // The prompt input bar at the bottom of the chat panel
  const promptInputBar = (
    <div className="flex-shrink-0 border-t border-zinc-800 p-3">
      <div className="flex items-end gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 transition-colors focus-within:border-sky-500/50">
        <textarea
          ref={promptInputRef}
          value={currentPrompt}
          onChange={(e) => setCurrentPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you want to change..."
          rows={3}
          disabled={isGenerating}
          className="flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
        />
        <button
          onClick={handleSendPrompt}
          disabled={!currentPrompt.trim() || isGenerating}
          className="mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white transition hover:bg-sky-600 disabled:opacity-40"
          title="Send (Enter)"
        >
          {isGenerating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-zinc-700">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );

  // The full AI chat panel (history + input)
  const aiChatPanel = (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {promptHistory.length === 0 && !isGenerating ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
              <Sparkles className="h-5 w-5 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-300">Describe your landing page</p>
            <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-zinc-500">
              Tell the AI what kind of page you want. Keep prompting to refine it.
            </p>
            <div className="mt-5 w-full space-y-2">
              {STARTER_PROMPTS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setCurrentPrompt(suggestion)}
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-left text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {promptHistory.map((item, i) => (
              <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5">
                <p className="text-xs leading-relaxed text-zinc-300">{item.prompt}</p>
                <p className="mt-1.5 text-[10px] text-zinc-600">
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}

        {isGenerating && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
            <p className="text-xs text-sky-400">Building your page...</p>
          </div>
        )}

        {generationError && !isGenerating && (
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
            <p className="text-xs text-red-400">{generationError}</p>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {promptInputBar}
    </div>
  );

  // The live preview panel
  const previewPanel = isLoadingPage ? (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
    </div>
  ) : widgets.length === 0 ? (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-8 w-8 text-zinc-700"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18M10 15h4" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm font-medium text-zinc-500">Your preview will appear here</p>
      <p className="mt-1 text-xs text-zinc-700">
        Use the AI tab to generate a page, or the Edit tab to build manually
      </p>
    </div>
  ) : (
    <div className="h-full overflow-y-auto bg-white">
      <LandingRenderer widgets={widgets} realtorId={user?.id || "anonymous"} />
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100vh - 50px)" }}
    >
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-3 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            onClick={onBack}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="hidden h-4 w-px flex-shrink-0 bg-zinc-800 sm:block" />

          <input
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            onBlur={savePageName}
            className="min-w-0 flex-1 truncate bg-transparent text-sm font-medium text-white outline-none placeholder:text-zinc-500"
            placeholder="Page name"
          />
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          {subdomain && (
            <a
              href={`/landing/${subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 sm:flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Live
            </a>
          )}
          <button
            onClick={openDeployModal}
            className="rounded-md bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-600 sm:px-4 sm:text-sm"
          >
            Deploy
          </button>
        </div>
      </div>

      {/* ── Mobile Tab Bar ───────────────────────────────────── */}
      <div className="flex flex-shrink-0 border-b border-zinc-800 bg-zinc-950 lg:hidden">
        <button
          onClick={() => setMobileTab("ai")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-semibold transition ${
            mobileTab === "ai" ? "border-b-2 border-sky-500 text-sky-400" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI
        </button>
        <button
          onClick={() => setMobileTab("edit")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-semibold transition ${
            mobileTab === "edit" ? "border-b-2 border-sky-500 text-sky-400" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-semibold transition ${
            mobileTab === "preview" ? "border-b-2 border-sky-500 text-sky-400" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
      </div>

      {/* ── Mobile Content ────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 lg:hidden">
        {mobileTab === "ai" && (
          <div className="flex h-full w-full flex-col bg-zinc-950">
            {aiChatPanel}
          </div>
        )}
        {mobileTab === "edit" && (
          <div className="h-full w-full overflow-y-auto bg-zinc-950 p-3">
            <WidgetEditor widgets={widgets} onChange={handleWidgetsChange} />
          </div>
        )}
        {mobileTab === "preview" && (
          <div className="h-full w-full">{previewPanel}</div>
        )}
      </div>

      {/* ── Desktop Layout ────────────────────────────────────── */}
      <div className="hidden min-h-0 flex-1 lg:flex">
        {/* Left panel */}
        <div className="flex w-[360px] flex-shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 xl:w-[400px]">
          {/* Mode switcher */}
          <div className="flex flex-shrink-0 border-b border-zinc-800">
            <button
              onClick={() => setDesktopLeftMode("ai")}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition ${
                desktopLeftMode === "ai" ? "border-b-2 border-sky-500 text-sky-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI
            </button>
            <button
              onClick={() => setDesktopLeftMode("edit")}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition ${
                desktopLeftMode === "edit" ? "border-b-2 border-sky-500 text-sky-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>

          {/* Panel content */}
          <div className="min-h-0 flex-1">
            {desktopLeftMode === "ai" ? (
              aiChatPanel
            ) : (
              <div className="h-full overflow-y-auto p-3">
                <WidgetEditor widgets={widgets} onChange={handleWidgetsChange} />
              </div>
            )}
          </div>
        </div>

        {/* Right panel: preview */}
        <div className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
          {previewPanel}
        </div>
      </div>

      {/* ── Deploy Modal ──────────────────────────────────────── */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Deploy Landing Page</h2>
                <p className="mt-1 text-sm text-zinc-400">Choose a subdomain to make this page live.</p>
              </div>
              <button
                onClick={() => setShowDeployModal(false)}
                className="rounded-md p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Subdomain
              </label>
              <div className="flex items-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
                <input
                  autoFocus
                  value={deploySubdomain}
                  onChange={(e) => {
                    const safe = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                    setDeploySubdomain(safe);
                    setDeployError("");
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleDeploy(); }}
                  placeholder="my-listing-page"
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
                />
                <span className="border-l border-zinc-700 px-3 py-2.5 text-sm text-zinc-500">
                  .{rootDomain}
                </span>
              </div>

              {deployError && <p className="mt-1.5 text-xs text-red-400">{deployError}</p>}

              {deploySuccess && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Page is live!
                </div>
              )}

              {deploySubdomain && !deployError && !deploySuccess && (
                <p className="mt-1.5 text-xs text-zinc-600">
                  Will be live at: <span className="text-sky-400">{deploySubdomain}.{rootDomain}</span>
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => { setShowDeployModal(false); setDeployError(""); setDeploySuccess(false); }}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeploy}
                disabled={isDeploying || deploySuccess}
                className="flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
              >
                {isDeploying && <Loader2 className="h-4 w-4 animate-spin" />}
                {isDeploying ? "Deploying..." : deploySuccess ? "Deployed!" : "Deploy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
