// Pre-built starter templates users can pick from when creating a new landing page.
// Each template is a ready-made widget array. Users can then refine with AI or edit manually.

import type { CanvasWidget } from "@/types/widgets";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Template 1: Luxury Property Listing ─────────────────────────────────────
// Hero image → stats row → gallery → agent bio → lead form
const luxuryListing: CanvasWidget[] = [
  {
    id: uid("hero"),
    type: "hero",
    label: "Hero",
    data: {
      backgroundImage:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
      overlayOpacity: 0.45,
      tagline: "EXCLUSIVE LISTING",
      title: "Luxury Residence in the Heart of the City",
      subtitle:
        "4 bed · 5 bath · 4,200 sq ft · Panoramic skyline views",
      ctaText: "Request a Private Tour",
      ctaColor: "#c9a84c",
      ctaTextColor: "#1a1a2e",
      textAlign: "center",
    },
  },
  {
    id: uid("stats"),
    type: "stats",
    label: "Stats",
    data: {
      backgroundColor: "#1a1a2e",
      textColor: "#ffffff",
      accentColor: "#c9a84c",
      items: [
        { value: "$4.2M", label: "Asking Price" },
        { value: "4,200", label: "Square Feet" },
        { value: "4 / 5", label: "Bed / Bath" },
        { value: "2024", label: "Year Built" },
      ],
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
        "https://images.unsplash.com/photo-1560185127-6a25f8d3cd8b?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80",
      ],
      sectionBg: "#f8f5f0",
    },
  },
  {
    id: uid("agentBio"),
    type: "agentBio",
    label: "Agent Bio",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
      name: "Alexandra Reid",
      title: "Luxury Real Estate Specialist",
      bio: "With over 15 years specializing in luxury properties, I bring white-glove service to every transaction. My clients trust me to navigate high-stakes negotiations with discretion, expertise, and results. I've closed over $200M in sales across the city's most sought-after neighborhoods.",
      ctaText: "Schedule a Private Consultation",
      ctaColor: "#c9a84c",
      ctaTextColor: "#1a1a2e",
      backgroundColor: "#ffffff",
      textColor: "#1a1a2e",
      imagePosition: "right",
    },
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

// ─── Template 2: First-Time Buyer ────────────────────────────────────────────
// Hero → stats → text + image → testimonials → lead form
const firstTimeBuyer: CanvasWidget[] = [
  {
    id: uid("hero"),
    type: "hero",
    label: "Hero",
    data: {
      backgroundImage:
        "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1600&q=80",
      overlayOpacity: 0.5,
      tagline: "FIRST-TIME HOMEBUYERS",
      title: "Your Journey to Homeownership Starts Here",
      subtitle:
        "We guide you every step of the way — from pre-approval to closing day.",
      ctaText: "Get Your Free Buyer Guide",
      ctaColor: "#f6e05e",
      ctaTextColor: "#1a202c",
      textAlign: "left",
    },
  },
  {
    id: uid("stats"),
    type: "stats",
    label: "Stats",
    data: {
      backgroundColor: "#2b6cb0",
      textColor: "#ffffff",
      accentColor: "#f6e05e",
      items: [
        { value: "500+", label: "Families Helped" },
        { value: "15 Yrs", label: "Market Experience" },
        { value: "98%", label: "Client Satisfaction" },
        { value: "$0", label: "Buyer Agent Fee" },
      ],
    },
  },
  {
    id: uid("text"),
    type: "text",
    label: "Text",
    data: {
      text: "Buying your first home can feel overwhelming — but it doesn't have to be. Here's our simple 3-step process:\n\n① Get Pre-Approved — Know exactly what you can afford before you start looking.\n\n② Find Your Perfect Home — We search hundreds of listings and show you only the best matches.\n\n③ Close with Confidence — We handle negotiations, inspections, and all the paperwork.",
      color: "#2d3748",
      alignment: "left",
      sectionBg: "#f7fafc",
    },
  },
  {
    id: uid("image"),
    type: "image",
    label: "Image",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80",
      alt: "Happy family in front of new home",
      aspect: "fullwidth",
    },
  },
  {
    id: uid("testimonials"),
    type: "testimonials",
    label: "Testimonials",
    data: {
      title: "What First-Time Buyers Say",
      backgroundColor: "#ffffff",
      textColor: "#1a202c",
      accentColor: "#2b6cb0",
      items: [
        {
          text: "We had no idea where to start, but they made the entire process feel simple and stress-free. We closed in 45 days!",
          author: "Jordan & Sam L.",
          location: "Austin, TX",
        },
        {
          text: "As a first-time buyer, I was terrified about making a mistake. They answered every question and found us the perfect home under budget.",
          author: "Priya M.",
          location: "Denver, CO",
        },
        {
          text: "The free buyer guide alone was worth it. By the time we started looking, we felt like experts. Couldn't recommend them more.",
          author: "Marcus T.",
          location: "Atlanta, GA",
        },
      ],
    },
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

// ─── Template 3: Top Agent Showcase ──────────────────────────────────────────
// Hero → agent bio → stats → testimonials → gallery → lead form
const topAgent: CanvasWidget[] = [
  {
    id: uid("hero"),
    type: "hero",
    label: "Hero",
    data: {
      backgroundImage:
        "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80",
      overlayOpacity: 0.6,
      tagline: "TOP VANCOUVER REALTOR®",
      title: "Helping Families Find Home Since 2008",
      subtitle:
        "Trusted by over 800 clients across Metro Vancouver. Let's find your perfect home.",
      ctaText: "Book a Free Consultation",
      ctaColor: "#48bb78",
      ctaTextColor: "#ffffff",
      textAlign: "center",
    },
  },
  {
    id: uid("agentBio"),
    type: "agentBio",
    label: "Agent Bio",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      name: "Sarah Chen",
      title: "Personal Real Estate Corporation",
      bio: "I started in real estate because I believe everyone deserves a smooth, stress-free homebuying experience. Over 16 years, I've built a reputation for honest advice, relentless advocacy, and results that speak for themselves. My team handles everything — so you can focus on the excitement of your next chapter.",
      ctaText: "Schedule a Free Consultation",
      ctaColor: "#48bb78",
      ctaTextColor: "#ffffff",
      backgroundColor: "#f0fff4",
      textColor: "#1a202c",
      imagePosition: "left",
    },
  },
  {
    id: uid("stats"),
    type: "stats",
    label: "Stats",
    data: {
      backgroundColor: "#1a202c",
      textColor: "#ffffff",
      accentColor: "#48bb78",
      items: [
        { value: "800+", label: "Homes Sold" },
        { value: "16 Yrs", label: "Experience" },
        { value: "$1.2B", label: "in Sales Volume" },
        { value: "#1", label: "In the Region" },
      ],
    },
  },
  {
    id: uid("testimonials"),
    type: "testimonials",
    label: "Testimonials",
    data: {
      title: "Client Stories",
      backgroundColor: "#f7fafc",
      textColor: "#1a202c",
      accentColor: "#48bb78",
      items: [
        {
          text: "Sarah sold our home in 8 days — $42,000 over asking. She knew exactly how to price and market it. We couldn't believe how fast it moved.",
          author: "The Robertson Family",
          location: "Burnaby, BC",
        },
        {
          text: "We were relocating from Toronto with 3 kids and a tight timeline. Sarah found us the perfect home in 2 weeks. Absolute lifesaver.",
          author: "David & Mei W.",
          location: "Coquitlam, BC",
        },
        {
          text: "This was our third home purchase and by far the smoothest. Sarah's market knowledge is unmatched. She saved us from a bad deal twice.",
          author: "Elena K.",
          location: "North Vancouver, BC",
        },
      ],
    },
  },
  {
    id: uid("gallery"),
    type: "gallery",
    label: "Gallery",
    data: {
      images: [
        "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
      ],
      sectionBg: "#ffffff",
    },
  },
  {
    id: uid("leadForm"),
    type: "leadForm",
    label: "Lead Form",
    data: {
      title: "Ready to Make Your Move?",
      description:
        "Whether you're buying or selling, let's talk. I offer a free, no-obligation market analysis for every client.",
      buttonLabel: "Book a Free Consultation",
      disclaimer: "No obligation. No pressure. Just an honest conversation.",
      backgroundColor: "#1a202c",
      textColor: "#ffffff",
      buttonColor: "#48bb78",
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
    description: "Start with an empty canvas — describe what you want to the AI",
    emoji: "✨",
    widgets: blank,
  },
  {
    id: "luxury-listing",
    name: "Luxury Listing",
    description: "High-end property with hero image, stats, gallery, and private tour CTA",
    emoji: "🏛️",
    widgets: luxuryListing,
  },
  {
    id: "first-time-buyer",
    name: "First-Time Buyer",
    description: "Educational page guiding buyers through the process with testimonials",
    emoji: "🏡",
    widgets: firstTimeBuyer,
  },
  {
    id: "top-agent",
    name: "Top Agent",
    description: "Personal brand page showcasing your story, stats, and client reviews",
    emoji: "⭐",
    widgets: topAgent,
  },
];
