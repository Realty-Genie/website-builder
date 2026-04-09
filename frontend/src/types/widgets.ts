// All widget type definitions for landing pages.
// Used by the editor, renderer, and code generation utilities.

export type WidgetType =
  | "title"
  | "text"
  | "image"
  | "gallery"
  | "slideshow"
  | "map"
  | "leadForm"
  | "divider"
  | "spacer"
  | "embed"
  | "columns"
  | "hero"
  | "agentBio"
  | "stats"
  | "testimonials";

export type Alignment = "left" | "center" | "right";

export type TitleWidgetData = {
  text: string;
  color: string;
  alignment: Alignment;
  size: "sm" | "md" | "lg";
  sectionBg?: string; // optional background color for the whole section
};

export type TextWidgetData = {
  text: string;
  color: string;
  alignment: Alignment;
  sectionBg?: string;
};

export type ImageWidgetData = {
  imageUrl: string;
  alt: string;
  aspect: "wide" | "square" | "portrait" | "fullwidth";
};

export type GalleryWidgetData = {
  images: string[];
  sectionBg?: string;
};

export type SlideshowWidgetData = {
  images: string[];
  title: string;
};

export type MapWidgetData = {
  title: string;
  address: string;
  embedUrl: string;
};

export type LeadFormWidgetData = {
  title: string;
  description: string;
  buttonLabel: string;
  disclaimer: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
};

export type DividerWidgetData = {
  color: string;
};

export type SpacerWidgetData = {
  height: number;
};

export type EmbedWidgetData = {
  title: string;
  html: string;
};

export type ColumnsWidgetData = {
  colCount: 1 | 2 | 3 | 4;
  spans: number[];
  items: CanvasWidget[][];
  backgroundType?: "none" | "color" | "image";
  backgroundColor?: string;
  backgroundImage?: string;
};

// Full-width hero section with background image, title, subtitle, and CTA button
export type HeroWidgetData = {
  backgroundImage: string;
  overlayOpacity: number;      // 0 to 1, how dark the image overlay is
  tagline: string;             // small text above the title (e.g. "TOP VANCOUVER REALTOR®")
  title: string;               // big headline
  subtitle: string;            // supporting text below the headline
  ctaText: string;             // button label (e.g. "Get in Touch")
  ctaColor: string;            // button background color
  ctaTextColor: string;        // button text color
  textAlign: "left" | "center";
};

// Agent profile section — photo on one side, bio text on the other
export type AgentBioWidgetData = {
  imageUrl: string;
  name: string;
  title: string;               // e.g. "Personal Real Estate Corporation"
  bio: string;
  ctaText: string;             // e.g. "Schedule a Free Consultation"
  ctaColor: string;
  ctaTextColor: string;
  backgroundColor: string;
  textColor: string;
  imagePosition: "left" | "right";
};

// Row of achievement numbers (e.g. "500+ Homes Sold", "15 Years Experience")
export type StatsWidgetData = {
  backgroundColor: string;
  textColor: string;
  accentColor: string;         // color for the stat numbers
  items: {
    value: string;             // e.g. "500+"
    label: string;             // e.g. "Homes Sold"
  }[];
};

// Client testimonials grid
export type TestimonialsWidgetData = {
  title: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;         // color for quote marks / decorative elements
  items: {
    text: string;
    author: string;
    location?: string;
  }[];
};

// Maps each widget type name to its data shape
export type WidgetDataMap = {
  title: TitleWidgetData;
  text: TextWidgetData;
  image: ImageWidgetData;
  gallery: GalleryWidgetData;
  slideshow: SlideshowWidgetData;
  map: MapWidgetData;
  leadForm: LeadFormWidgetData;
  divider: DividerWidgetData;
  spacer: SpacerWidgetData;
  embed: EmbedWidgetData;
  columns: ColumnsWidgetData;
  hero: HeroWidgetData;
  agentBio: AgentBioWidgetData;
  stats: StatsWidgetData;
  testimonials: TestimonialsWidgetData;
};

// A widget with a specific type and its corresponding data
type CanvasWidgetBase<T extends WidgetType> = {
  id: string;
  type: T;
  label: string;
  data: WidgetDataMap[T];
};

// The union type covering all possible widgets
export type CanvasWidget =
  | CanvasWidgetBase<"title">
  | CanvasWidgetBase<"text">
  | CanvasWidgetBase<"image">
  | CanvasWidgetBase<"gallery">
  | CanvasWidgetBase<"slideshow">
  | CanvasWidgetBase<"map">
  | CanvasWidgetBase<"leadForm">
  | CanvasWidgetBase<"divider">
  | CanvasWidgetBase<"spacer">
  | CanvasWidgetBase<"embed">
  | CanvasWidgetBase<"columns">
  | CanvasWidgetBase<"hero">
  | CanvasWidgetBase<"agentBio">
  | CanvasWidgetBase<"stats">
  | CanvasWidgetBase<"testimonials">;
