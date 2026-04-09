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
  | "columns";

export type Alignment = "left" | "center" | "right";

export type TitleWidgetData = {
  text: string;
  color: string;
  alignment: Alignment;
  size: "sm" | "md" | "lg";
};

export type TextWidgetData = {
  text: string;
  color: string;
  alignment: Alignment;
};

export type ImageWidgetData = {
  imageUrl: string;
  alt: string;
  aspect: "wide" | "square" | "portrait";
};

export type GalleryWidgetData = {
  images: string[];
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
  | CanvasWidgetBase<"columns">;
