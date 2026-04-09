"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Loader2, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { LandingRenderer } from "@/components/LandingRenderer";
import { generateCodeString } from "@/lib/landing/codeGeneration";
import { useAuthStore } from "@/lib/authStore";
import { api } from "@/lib/api";
import type { PromptHistoryItem } from "@/types/domain";

// Quick-start prompts shown when the page has no history yet
const STARTER_PROMPTS = [
  "Create a luxury condo listing page in downtown Manhattan",
  "Build a lead capture page for first-time home buyers",
  "Make a listing page for a 4-bedroom family home in the suburbs",
  "Design a page for a beachfront property with stunning views",
];

type Props = {
  pageId: string;
  // Called when the user clicks "Back" to return to the list
  onBack: () => void;
};

export default function LandingPageEditor({ pageId, onBack }: Props) {
  const { user } = useAuthStore();

  // Page data
  const [pageName, setPageName] = useState("Untitled Landing Page");
  const [widgets, setWidgets] = useState<any[]>([]);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [subdomain, setSubdomain] = useState("");

  // UI state
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");

  // Deploy modal state
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deploySubdomain, setDeploySubdomain] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState("");
  const [deploySuccess, setDeploySuccess] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  // Load page data when the component first renders
  useEffect(() => {
    loadPage();
  }, [pageId]);

  // Scroll to the bottom of the chat when new messages appear
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

  // Saves the page name on blur (after the user finishes typing it)
  async function savePageName() {
    await api.landingPages.update(pageId, { name: pageName }).catch(console.error);
  }

  // Sends the current prompt to the AI and updates the preview
  async function handleSendPrompt() {
    const trimmedPrompt = currentPrompt.trim();
    if (!trimmedPrompt || isGenerating) return;

    setIsGenerating(true);
    setGenerationError(null);
    setCurrentPrompt("");

    // Optimistically add the prompt to the history so the user sees it immediately
    const newEntry: PromptHistoryItem = {
      prompt: trimmedPrompt,
      timestamp: new Date().toISOString(),
    };
    const newHistory = [...promptHistory, newEntry];
    setPromptHistory(newHistory);

    try {
      const data = await api.landingPages.generate(trimmedPrompt, widgets);
      const newWidgets = data.widgets;

      // Update the live preview
      setWidgets(newWidgets);

      // Persist the new widgets and prompt history to the database
      await api.landingPages.update(pageId, {
        widgets: newWidgets,
        promptHistory: newHistory,
      });
    } catch (error) {
      // Revert the optimistic history update if something went wrong
      setPromptHistory(promptHistory);
      setGenerationError(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsGenerating(false);
      promptInputRef.current?.focus();
    }
  }

  // Handles the Enter key in the prompt box (Shift+Enter adds a new line)
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  }

  // Deploys the page by saving the subdomain and generated code to the database
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
      // Generate the standalone React code string for this page
      const realtorId = user?.id || "anonymous";
      const code = generateCodeString(widgets, realtorId);

      await api.landingPages.update(pageId, {
        subdomain: trimmedSubdomain,
        code,
        widgets,
      });

      setSubdomain(trimmedSubdomain);
      setDeploySuccess(true);

      // Auto-close the modal after a short delay on success
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

  return (
    // Break out of AppLayout's padding to go full-width and full-height
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 flex flex-col" style={{ height: "calc(100vh - 56px)" }}>

      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Editable page name */}
          <input
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            onBlur={savePageName}
            className="w-48 bg-transparent text-sm font-medium text-white outline-none placeholder:text-zinc-500 sm:w-64"
            placeholder="Page name"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Link to live page if it has a subdomain */}
          {subdomain && (
            <a
              href={`/landing/${subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Live
            </a>
          )}

          <button
            onClick={openDeployModal}
            className="rounded-md bg-sky-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Deploy
          </button>
        </div>
      </div>

      {/* ── Main Layout: Chat Panel | Preview Panel ──────────── */}
      <div className="flex min-h-0 flex-1">

        {/* Left Panel: Prompt History + Input */}
        <div className="flex w-[360px] flex-shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 xl:w-[400px]">

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {promptHistory.length === 0 && !isGenerating ? (
              // Empty state with suggested prompts
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-6 w-6 text-zinc-400"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-zinc-300">Describe your landing page</p>
                <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-zinc-500">
                  Tell the AI what kind of page you want. Keep prompting to refine it.
                </p>

                {/* Starter prompt suggestions */}
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
              // Prompt history messages
              <div className="space-y-2">
                {promptHistory.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5"
                  >
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

            {/* Generating indicator */}
            {isGenerating && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
                <p className="text-xs text-sky-400">Generating your page...</p>
              </div>
            )}

            {/* Error message */}
            {generationError && !isGenerating && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                <p className="text-xs text-red-400">{generationError}</p>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Prompt Input Box */}
          <div className="flex-shrink-0 border-t border-zinc-800 p-3">
            <div className="flex items-end gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 focus-within:border-sky-500/50 transition-colors">
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
        </div>

        {/* Right Panel: Live Preview */}
        <div className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
          {isLoadingPage ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
            </div>
          ) : widgets.length === 0 ? (
            // Empty preview state
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
                Type a prompt on the left to generate your landing page
              </p>
            </div>
          ) : (
            // Render the actual landing page
            <div className="flex-1 overflow-y-auto bg-white">
              <LandingRenderer widgets={widgets} realtorId={user?.id || "anonymous"} />
            </div>
          )}
        </div>
      </div>

      {/* ── Deploy Modal ─────────────────────────────────────── */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Deploy Landing Page</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Choose a subdomain to make this page live.
            </p>

            <div className="mt-5">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Subdomain
              </label>
              {/* Subdomain input with path prefix */}
              <div className="flex items-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
                <span className="border-r border-zinc-700 px-3 py-2.5 text-sm text-zinc-500">
                  /landing/
                </span>
                <input
                  autoFocus
                  value={deploySubdomain}
                  onChange={(e) => {
                    // Only allow URL-safe characters: lowercase letters, numbers, hyphens
                    const safe = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                    setDeploySubdomain(safe);
                    setDeployError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleDeploy();
                  }}
                  placeholder="my-listing-page"
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
                />
              </div>

              {deployError && (
                <p className="mt-1.5 text-xs text-red-400">{deployError}</p>
              )}

              {deploySuccess && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Deployed! Your page is now live.
                </div>
              )}

              {deploySubdomain && !deployError && !deploySuccess && (
                <p className="mt-1.5 text-xs text-zinc-600">
                  Will be live at:{" "}
                  <span className="text-sky-400">/landing/{deploySubdomain}</span>
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeployModal(false);
                  setDeployError("");
                  setDeploySuccess(false);
                }}
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
