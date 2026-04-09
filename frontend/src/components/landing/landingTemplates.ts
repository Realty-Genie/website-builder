// Pre-built starter templates users can pick from when creating a new landing page.
// Each template is a ready-made widget array. Users can then refine with AI or edit manually.

import type { CanvasWidget } from "@/types/widgets";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Template 1: Luxury Property Listing ─────────────────────────────────────
const luxuryListing: CanvasWidget[] = [
  {
    id: uid("title"),
    type: "title",
    label: "Title",
    data: {
      text: "Exclusive Luxury Residence in the Heart of the City",
      color: "#1a1a2e",
      alignment: "center",
      size: "lg",
    },
  },
  {
    id: uid("text"),
    type: "text",
    label: "Text",
    data: {
      text: "Experience unparalleled elegance in this stunning 4-bedroom, 5-bath masterpiece. Floor-to-ceiling windows frame breathtaking skyline views, while the chef's kitchen and spa-like primary suite redefine modern luxury living.",
      color: "#4a5568",
      alignment: "center",
    },
  },
  {
    id: uid("image"),
    type: "image",
    label: "Image",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
      alt: "Luxury residence exterior",
      aspect: "wide",
    },
  },
  {
    id: uid("divider"),
    type: "divider",
    label: "Divider",
    data: { color: "#e2e8f0" },
  },
  {
    id: uid("title"),
    type: "title",
    label: "Title",
    data: {
      text: "Gallery",
      color: "#1a1a2e",
      alignment: "left",
      size: "md",
    },
  },
  {
    id: uid("gallery"),
    type: "gallery",
    label: "Gallery",
    data: {
      images: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=900&q=80",
      ],
    },
  },
  {
    id: uid("spacer"),
    type: "spacer",
    label: "Spacer",
    data: { height: 40 },
  },
  {
    id: uid("leadForm"),
    type: "leadForm",
    label: "Lead Form",
    data: {
      title: "Schedule Your Private Showing",
      description:
        "This exclusive property won't last. Connect with our luxury real estate specialists today.",
      buttonLabel: "Request Private Tour",
      disclaimer:
        "By submitting, you consent to be contacted regarding this property.",
      backgroundColor: "#1a1a2e",
      textColor: "#ffffff",
      buttonColor: "#c9a84c",
      buttonTextColor: "#1a1a2e",
    },
  },
];

// ─── Template 2: First-Time Buyer Guide ──────────────────────────────────────
const firstTimeBuyer: CanvasWidget[] = [
  {
    id: uid("title"),
    type: "title",
    label: "Title",
    data: {
      text: "Your Journey to Homeownership Starts Here",
      color: "#2d3748",
      alignment: "center",
      size: "lg",
    },
  },
  {
    id: uid("text"),
    type: "text",
    label: "Text",
    data: {
      text: "Buying your first home can feel overwhelming — but it doesn't have to be. We guide first-time buyers through every step of the process, from pre-approval to closing day, so you always know what comes next.",
      color: "#4a5568",
      alignment: "center",
    },
  },
  {
    id: uid("image"),
    type: "image",
    label: "Image",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1400&q=80",
      alt: "Happy family in front of new home",
      aspect: "wide",
    },
  },
  {
    id: uid("divider"),
    type: "divider",
    label: "Divider",
    data: { color: "#e2e8f0" },
  },
  {
    id: uid("title"),
    type: "title",
    label: "Title",
    data: {
      text: "The Simple 3-Step Process",
      color: "#2d3748",
      alignment: "center",
      size: "md",
    },
  },
  {
    id: uid("text"),
    type: "text",
    label: "Text",
    data: {
      text: "Step 1 — Get Pre-Approved: Know your budget before you start looking.\nStep 2 — Find Your Home: We search hundreds of listings to match your needs.\nStep 3 — Close with Confidence: We handle negotiations and paperwork so you don't have to.",
      color: "#4a5568",
      alignment: "left",
    },
  },
  {
    id: uid("spacer"),
    type: "spacer",
    label: "Spacer",
    data: { height: 32 },
  },
  {
    id: uid("leadForm"),
    type: "leadForm",
    label: "Lead Form",
    data: {
      title: "Get Your Free First-Time Buyer Guide",
      description:
        "Enter your details and we'll send you our complete step-by-step homebuying roadmap — totally free.",
      buttonLabel: "Send Me the Free Guide",
      disclaimer:
        "We respect your privacy. No spam, ever. Unsubscribe anytime.",
      backgroundColor: "#2b6cb0",
      textColor: "#ffffff",
      buttonColor: "#f6e05e",
      buttonTextColor: "#1a202c",
    },
  },
];

// ─── Template 3: Agent Bio Page ───────────────────────────────────────────────
const agentBio: CanvasWidget[] = [
  {
    id: uid("title"),
    type: "title",
    label: "Title",
    data: {
      text: "Meet Your Local Real Estate Expert",
      color: "#1a202c",
      alignment: "center",
      size: "lg",
    },
  },
  {
    id: uid("image"),
    type: "image",
    label: "Image",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1400&q=80",
      alt: "Real estate agent",
      aspect: "portrait",
    },
  },
  {
    id: uid("text"),
    type: "text",
    label: "Text",
    data: {
      text: "With over 15 years in the local market, I've helped more than 500 families find their perfect home. My approach is simple: listen first, advise second. Whether you're buying, selling, or investing, I'm here to make the process smooth and successful.",
      color: "#4a5568",
      alignment: "center",
    },
  },
  {
    id: uid("divider"),
    type: "divider",
    label: "Divider",
    data: { color: "#e2e8f0" },
  },
  {
    id: uid("title"),
    type: "title",
    label: "Title",
    data: {
      text: "Areas I Serve",
      color: "#1a202c",
      alignment: "center",
      size: "md",
    },
  },
  {
    id: uid("map"),
    type: "map",
    label: "Map",
    data: {
      title: "Serving the Greater Metro Area",
      address: "Downtown, Midtown, and all surrounding neighborhoods",
      embedUrl: "https://www.google.com/maps?q=New+York+City&output=embed",
    },
  },
  {
    id: uid("spacer"),
    type: "spacer",
    label: "Spacer",
    data: { height: 32 },
  },
  {
    id: uid("leadForm"),
    type: "leadForm",
    label: "Lead Form",
    data: {
      title: "Let's Talk About Your Goals",
      description:
        "Whether you're ready to list or just exploring options, I'd love to connect and share what the market looks like right now.",
      buttonLabel: "Schedule a Free Consultation",
      disclaimer: "No obligation. No pressure. Just a conversation.",
      backgroundColor: "#0f172a",
      textColor: "#ffffff",
      buttonColor: "#2f8fe5",
      buttonTextColor: "#ffffff",
    },
  },
];

// ─── Template 4: Blank ────────────────────────────────────────────────────────
const blank: CanvasWidget[] = [];

// ─── Exported template list ───────────────────────────────────────────────────
export type LandingTemplate = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  widgets: CanvasWidget[];
};

export const LANDING_TEMPLATES: LandingTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start with an empty canvas",
    emoji: "✨",
    widgets: blank,
  },
  {
    id: "luxury-listing",
    name: "Luxury Listing",
    description: "High-end property with gallery and private tour CTA",
    emoji: "🏛️",
    widgets: luxuryListing,
  },
  {
    id: "first-time-buyer",
    name: "First-Time Buyer",
    description: "Educational page for first-time homebuyers",
    emoji: "🏡",
    widgets: firstTimeBuyer,
  },
  {
    id: "agent-bio",
    name: "Agent Bio",
    description: "Personal page to showcase your experience and services",
    emoji: "👤",
    widgets: agentBio,
  },
];
