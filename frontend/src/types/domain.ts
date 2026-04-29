// Types for the landing page domain system

// Used by the /landing/[subdomain] page to look up and render a deployed page
export type LandingPageDomain = {
  realtorId: string;
  subdomain: string;
  name?: string;
  code: string;
  widgets?: any[];
};

// A single prompt entry in the chat history
export type PromptHistoryItem = {
  prompt: string;
  timestamp: string;
};

// A user's landing page in the new multi-page system
export type LandingPage = {
  id: string;
  realtorId: string;
  name: string;
  subdomain: string;
  widgets: any[];
  code: string;
  promptHistory: PromptHistoryItem[];
  createdAt: string;
  updatedAt: string;
};

// Summary info shown in the landing page list (no widgets/code for performance)
export type LandingPageSummary = {
  id: string;
  name: string;
  subdomain: string;
  createdAt: string;
  updatedAt: string;
  promptCount: number;
};
