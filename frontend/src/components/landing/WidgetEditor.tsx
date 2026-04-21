"use client";

// WidgetEditor: A visual (WYSIWYG) editor for landing page widgets.
// Users click directly on text to edit it, click images to swap them,
// and use the toolbar to add or remove sections.
// No code is shown — everything is interactive.

import { useState } from "react";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Image as ImageIcon,
  Type,
  AlignLeft,
  Minus,
  Move,
  Layout,
  FileInput,
  X,
} from "lucide-react";
import { DEFAULT_LEAD_FORM_FIELDS, type LeadFormField, type LeadFormFieldType } from "@/types/widgets";

// ─── Type helpers ─────────────────────────────────────────────────────────────

type Widget = any; // Using any to match the dynamic widget system

type Props = {
  widgets: Widget[];
  // Called whenever the user makes any edit
  onChange: (widgets: Widget[]) => void;
};

// Makes a random short ID
function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

// Creates a fresh widget with sensible defaults
function makeWidget(type: string): Widget {
  const base = { id: uid(type), type, label: capitalize(type), data: {} };
  switch (type) {
    case "title":
      return { ...base, data: { text: "New Title", color: "#1a1a2e", alignment: "center", size: "lg" } };
    case "text":
      return { ...base, data: { text: "Add your text here.", color: "#4a5568", alignment: "left" } };
    case "image":
      return {
        ...base,
        data: {
          imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80",
          alt: "Property image",
          aspect: "wide",
        },
      };
    case "leadForm":
      return {
        ...base,
        label: "Lead Form",
        data: {
          title: "Request a Consultation",
          description: "Fill out the form and we'll be in touch shortly.",
          buttonLabel: "Get in Touch",
          disclaimer: "By submitting, you agree to be contacted.",
          backgroundColor: "#0f172a",
          textColor: "#ffffff",
          buttonColor: "#2f8fe5",
          buttonTextColor: "#ffffff",
          fields: DEFAULT_LEAD_FORM_FIELDS.map((f) => ({ ...f })),
        },
      };
    case "gallery":
      return {
        ...base,
        data: {
          images: [
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
          ],
        },
      };
    case "divider":
      return { ...base, data: { color: "#e2e8f0" } };
    case "spacer":
      return { ...base, data: { height: 40 } };
    case "map":
      return {
        ...base,
        data: {
          title: "Our Location",
          address: "123 Main Street, Your City",
          embedUrl: "https://www.google.com/maps?q=New+York&output=embed",
        },
      };
    default:
      return base;
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Widget types you can add from the toolbar
const ADD_WIDGETS = [
  { type: "title", icon: <Type className="h-4 w-4" />, label: "Title" },
  { type: "text", icon: <AlignLeft className="h-4 w-4" />, label: "Text" },
  { type: "image", icon: <ImageIcon className="h-4 w-4" />, label: "Image" },
  { type: "gallery", icon: <Layout className="h-4 w-4" />, label: "Gallery" },
  { type: "leadForm", icon: <FileInput className="h-4 w-4" />, label: "Form" },
  { type: "divider", icon: <Minus className="h-4 w-4" />, label: "Divider" },
  { type: "spacer", icon: <Move className="h-4 w-4" />, label: "Spacer" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WidgetEditor({ widgets, onChange }: Props) {
  // Tracks which widget the user is currently editing (shows edit panel)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // For image URL editing dialog
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");

  // ─── Widget manipulation helpers ─────────────────────────────────────────

  function updateWidget(id: string, newData: Partial<Widget["data"]>) {
    onChange(
      widgets.map((w) =>
        w.id === id ? { ...w, data: { ...w.data, ...newData } } : w,
      ),
    );
  }

  function removeWidget(id: string) {
    onChange(widgets.filter((w) => w.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function moveWidget(id: string, direction: "up" | "down") {
    const idx = widgets.findIndex((w) => w.id === id);
    if (idx === -1) return;
    const next = [...widgets];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= next.length) return;
    [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
    onChange(next);
  }

  function addWidget(type: string) {
    onChange([...widgets, makeWidget(type)]);
  }

  function confirmImageChange(id: string) {
    if (newImageUrl.trim()) {
      updateWidget(id, { imageUrl: newImageUrl.trim() });
    }
    setEditingImageId(null);
    setNewImageUrl("");
  }

  // ─── Render each widget with editing overlays ─────────────────────────────

  function renderEditable(widget: Widget, index: number) {
    const isSelected = selectedId === widget.id;
    const isFirst = index === 0;
    const isLast = index === widgets.length - 1;

    return (
      <div
        key={widget.id}
        onClick={() => setSelectedId(widget.id)}
        className={`relative group rounded-lg border-2 transition-all ${
          isSelected ? "border-sky-400 shadow-md" : "border-transparent hover:border-zinc-200"
        }`}
      >
        {/* ── Widget Controls (visible on hover or selection) ─────────── */}
        <div
          className={`absolute right-2 top-2 z-10 flex items-center gap-1 rounded-lg border border-zinc-200 bg-white shadow-sm transition-opacity ${
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => moveWidget(widget.id, "up")}
            disabled={isFirst}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30"
            title="Move up"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => moveWidget(widget.id, "down")}
            disabled={isLast}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30"
            title="Move down"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <div className="h-4 w-px bg-zinc-200" />
          <button
            onClick={() => removeWidget(widget.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Widget Content ───────────────────────────────────────────── */}
        <div className="p-4 sm:p-6">
          {widget.type === "title" && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Title text</p>
              <input
                value={widget.data.text}
                onChange={(e) => updateWidget(widget.id, { text: e.target.value })}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xl font-bold text-zinc-800 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30"
                placeholder="Enter title..."
                onClick={(e) => e.stopPropagation()}
              />
              <div className="mt-2 flex gap-2">
                {(["sm", "md", "lg"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={(e) => { e.stopPropagation(); updateWidget(widget.id, { size }); }}
                    className={`rounded px-2 py-1 text-xs font-medium transition ${
                      widget.data.size === size
                        ? "bg-sky-100 text-sky-700"
                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    }`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
                <input
                  type="color"
                  value={widget.data.color}
                  onChange={(e) => { updateWidget(widget.id, { color: e.target.value }); }}
                  onClick={(e) => e.stopPropagation()}
                  className="h-7 w-7 cursor-pointer rounded border border-zinc-200"
                  title="Text color"
                />
              </div>
            </div>
          )}

          {widget.type === "text" && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Body text</p>
              <textarea
                value={widget.data.text}
                onChange={(e) => updateWidget(widget.id, { text: e.target.value })}
                rows={4}
                className="w-full resize-y rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30"
                placeholder="Enter text..."
                onClick={(e) => e.stopPropagation()}
              />
              <div className="mt-2 flex gap-2">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={(e) => { e.stopPropagation(); updateWidget(widget.id, { alignment: align }); }}
                    className={`rounded px-2 py-1 text-xs font-medium capitalize transition ${
                      widget.data.alignment === align
                        ? "bg-sky-100 text-sky-700"
                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    }`}
                  >
                    {align}
                  </button>
                ))}
                <input
                  type="color"
                  value={widget.data.color}
                  onChange={(e) => updateWidget(widget.id, { color: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="h-7 w-7 cursor-pointer rounded border border-zinc-200"
                  title="Text color"
                />
              </div>
            </div>
          )}

          {widget.type === "image" && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Image</p>
              <div className="relative overflow-hidden rounded-md border border-zinc-200">
                <img
                  src={widget.data.imageUrl}
                  alt={widget.data.alt}
                  className="aspect-video w-full object-cover"
                />
                {/* Overlay button to change image */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingImageId(widget.id);
                    setNewImageUrl(widget.data.imageUrl);
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 transition hover:bg-black/40"
                >
                  <span className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-lg group-hover:inline-block hover:inline-block">
                    Change Image
                  </span>
                </button>
              </div>
              {/* Image URL change dialog */}
              {editingImageId === widget.id && (
                <div className="mt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    autoFocus
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") confirmImageChange(widget.id); }}
                    className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-xs outline-none focus:border-sky-400"
                    placeholder="Paste image URL..."
                  />
                  <button
                    onClick={() => confirmImageChange(widget.id)}
                    className="rounded-md bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => { setEditingImageId(null); setNewImageUrl(""); }}
                    className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="mt-2">
                <input
                  value={widget.data.alt}
                  onChange={(e) => updateWidget(widget.id, { alt: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-500 outline-none"
                  placeholder="Alt text for accessibility..."
                />
              </div>
            </div>
          )}

          {widget.type === "gallery" && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Gallery images</p>
              <div className="grid grid-cols-3 gap-2">
                {(widget.data.images as string[]).map((url: string, imgIdx: number) => (
                  <div key={imgIdx} className="relative group/img overflow-hidden rounded-md border border-zinc-200">
                    <img src={url} alt={`Gallery ${imgIdx + 1}`} className="aspect-square w-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newUrl = prompt("Enter new image URL:", url);
                        if (newUrl) {
                          const updated = [...widget.data.images];
                          updated[imgIdx] = newUrl;
                          updateWidget(widget.id, { images: updated });
                        }
                      }}
                      className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover/img:flex"
                    >
                      <span className="rounded bg-white px-2 py-1 text-[10px] font-semibold text-zinc-800">Change</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {widget.type === "leadForm" && (
            <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Lead Form</p>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-500">Form title</label>
                <input
                  value={widget.data.title}
                  onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold outline-none focus:border-sky-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-500">Description</label>
                <textarea
                  value={widget.data.description}
                  onChange={(e) => updateWidget(widget.id, { description: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  rows={2}
                  className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-sky-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-500">Button label</label>
                <input
                  value={widget.data.buttonLabel}
                  onChange={(e) => updateWidget(widget.id, { buttonLabel: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-sky-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-500">Disclaimer</label>
                <input
                  value={widget.data.disclaimer}
                  onChange={(e) => updateWidget(widget.id, { disclaimer: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-sky-400"
                />
              </div>

              {/* ── Form fields editor ───────────────────────────────── */}
              <div className="rounded-md border border-zinc-200 bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Form Fields</p>
                    <p className="text-[10px] text-zinc-400">Edit, add, or remove inputs shown to visitors</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const existing: LeadFormField[] = widget.data.fields ?? DEFAULT_LEAD_FORM_FIELDS;
                      const nextId = `field_${Date.now().toString(36)}`;
                      updateWidget(widget.id, {
                        fields: [
                          ...existing,
                          { id: nextId, label: "New Field", type: "text" as LeadFormFieldType, placeholder: "", required: false },
                        ],
                      });
                    }}
                    className="flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-medium text-zinc-600 hover:bg-zinc-100"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {(widget.data.fields ?? DEFAULT_LEAD_FORM_FIELDS).map((field: LeadFormField, idx: number) => {
                    const fields: LeadFormField[] = widget.data.fields ?? DEFAULT_LEAD_FORM_FIELDS;
                    const patchField = (patch: Partial<LeadFormField>) => {
                      const next = fields.map((f, i) => (i === idx ? { ...f, ...patch } : f));
                      updateWidget(widget.id, { fields: next });
                    };
                    const removeField = () => {
                      const next = fields.filter((_, i) => i !== idx);
                      updateWidget(widget.id, { fields: next });
                    };
                    return (
                      <div key={field.id} className="rounded-md border border-zinc-200 bg-zinc-50 p-2">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-1.5">
                            <input
                              value={field.label}
                              onChange={(e) => patchField({ label: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Label"
                              className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs outline-none focus:border-sky-400"
                            />
                            <input
                              value={field.placeholder ?? ""}
                              onChange={(e) => patchField({ placeholder: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Placeholder (optional)"
                              className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs outline-none focus:border-sky-400"
                            />
                            <div className="flex items-center gap-2">
                              <select
                                value={field.type}
                                onChange={(e) => patchField({ type: e.target.value as LeadFormFieldType })}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded border border-zinc-200 bg-white px-2 py-1 text-[11px] outline-none focus:border-sky-400"
                              >
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="tel">Phone</option>
                                <option value="textarea">Textarea</option>
                              </select>
                              <label className="flex items-center gap-1 text-[11px] text-zinc-500">
                                <input
                                  type="checkbox"
                                  checked={!!field.required}
                                  onChange={(e) => patchField({ required: e.target.checked })}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                Required
                              </label>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeField(); }}
                            className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-red-50 hover:text-red-500"
                            aria-label="Remove field"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-500">Background</label>
                  <input
                    type="color"
                    value={widget.data.backgroundColor}
                    onChange={(e) => updateWidget(widget.id, { backgroundColor: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-14 cursor-pointer rounded border border-zinc-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-500">Button color</label>
                  <input
                    type="color"
                    value={widget.data.buttonColor}
                    onChange={(e) => updateWidget(widget.id, { buttonColor: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-14 cursor-pointer rounded border border-zinc-200"
                  />
                </div>
              </div>
            </div>
          )}

          {widget.type === "divider" && (
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 rounded" style={{ backgroundColor: widget.data.color }} />
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-zinc-400">Color:</label>
                <input
                  type="color"
                  value={widget.data.color}
                  onChange={(e) => updateWidget(widget.id, { color: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="h-7 w-10 cursor-pointer rounded border border-zinc-200"
                />
              </div>
            </div>
          )}

          {widget.type === "spacer" && (
            <div className="flex items-center gap-3 rounded-md border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3">
              <span className="text-xs text-zinc-400">Spacer height:</span>
              <input
                type="range"
                min={8}
                max={200}
                value={widget.data.height}
                onChange={(e) => updateWidget(widget.id, { height: Number(e.target.value) })}
                onClick={(e) => e.stopPropagation()}
                className="flex-1"
              />
              <span className="w-12 text-right text-xs font-medium text-zinc-500">{widget.data.height}px</span>
            </div>
          )}

          {widget.type === "map" && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Map</p>
              <input
                value={widget.data.title}
                onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-semibold outline-none focus:border-sky-400"
                placeholder="Map title..."
              />
              <input
                value={widget.data.address}
                onChange={(e) => updateWidget(widget.id, { address: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs outline-none focus:border-sky-400"
                placeholder="Address..."
              />
            </div>
          )}

          {/* ── HERO editor ────────────────────────────────────────── */}
          {widget.type === "hero" && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Hero Section</p>
              {/* Background image preview + change */}
              <div className="relative overflow-hidden rounded-md border border-zinc-200">
                <img
                  src={widget.data.backgroundImage}
                  alt="Hero background"
                  className="aspect-video w-full object-cover"
                />
                <div className="absolute inset-0 bg-black" style={{ opacity: widget.data.overlayOpacity ?? 0.5 }} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingImageId(widget.id);
                    setNewImageUrl(widget.data.backgroundImage);
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-lg opacity-0 group-hover:opacity-100 hover:opacity-100">
                    Change Background
                  </span>
                </button>
              </div>
              {editingImageId === widget.id && (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    autoFocus
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateWidget(widget.id, { backgroundImage: newImageUrl.trim() });
                        setEditingImageId(null);
                        setNewImageUrl("");
                      }
                    }}
                    className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-xs outline-none focus:border-sky-400"
                    placeholder="Paste image URL..."
                  />
                  <button
                    onClick={() => {
                      updateWidget(widget.id, { backgroundImage: newImageUrl.trim() });
                      setEditingImageId(null);
                      setNewImageUrl("");
                    }}
                    className="rounded-md bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => { setEditingImageId(null); setNewImageUrl(""); }}
                    className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-500">Tagline (small text above headline)</label>
                <input
                  value={widget.data.tagline}
                  onChange={(e) => updateWidget(widget.id, { tagline: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs outline-none focus:border-sky-400"
                  placeholder="e.g. TOP VANCOUVER REALTOR®"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-500">Headline</label>
                <input
                  value={widget.data.title}
                  onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-bold outline-none focus:border-sky-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-500">Subtitle</label>
                <input
                  value={widget.data.subtitle}
                  onChange={(e) => updateWidget(widget.id, { subtitle: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs outline-none focus:border-sky-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-500">Button text</label>
                <input
                  value={widget.data.ctaText}
                  onChange={(e) => updateWidget(widget.id, { ctaText: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs outline-none focus:border-sky-400"
                />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-500">Overlay darkness</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((widget.data.overlayOpacity ?? 0.5) * 100)}
                    onChange={(e) => updateWidget(widget.id, { overlayOpacity: Number(e.target.value) / 100 })}
                    onClick={(e) => e.stopPropagation()}
                    className="w-32"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-500">Button color</label>
                  <input
                    type="color"
                    value={widget.data.ctaColor}
                    onChange={(e) => updateWidget(widget.id, { ctaColor: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-14 cursor-pointer rounded border border-zinc-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-500">Text align</label>
                  <div className="flex gap-1">
                    {(["left", "center"] as const).map((a) => (
                      <button
                        key={a}
                        onClick={(e) => { e.stopPropagation(); updateWidget(widget.id, { textAlign: a }); }}
                        className={`rounded px-2 py-1 text-[10px] font-medium capitalize transition ${
                          widget.data.textAlign === a ? "bg-sky-100 text-sky-700" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── AGENT BIO editor ───────────────────────────────────── */}
          {widget.type === "agentBio" && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Agent Bio</p>
              <div className="flex gap-3 items-start">
                <img
                  src={widget.data.imageUrl}
                  alt={widget.data.name}
                  className="h-20 w-20 flex-shrink-0 rounded-md object-cover object-top"
                />
                <div className="flex-1 space-y-2">
                  <input
                    value={widget.data.name}
                    onChange={(e) => updateWidget(widget.id, { name: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-bold outline-none focus:border-sky-400"
                    placeholder="Agent name..."
                  />
                  <input
                    value={widget.data.title}
                    onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs outline-none focus:border-sky-400"
                    placeholder="Designation / title..."
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-500">Bio text</label>
                <textarea
                  value={widget.data.bio}
                  onChange={(e) => updateWidget(widget.id, { bio: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  rows={3}
                  className="w-full resize-y rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs outline-none focus:border-sky-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-500">CTA button text</label>
                <input
                  value={widget.data.ctaText}
                  onChange={(e) => updateWidget(widget.id, { ctaText: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs outline-none focus:border-sky-400"
                />
              </div>
              <div className="flex gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-500">Background</label>
                  <input type="color" value={widget.data.backgroundColor}
                    onChange={(e) => updateWidget(widget.id, { backgroundColor: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-14 cursor-pointer rounded border border-zinc-200" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-500">Button color</label>
                  <input type="color" value={widget.data.ctaColor}
                    onChange={(e) => updateWidget(widget.id, { ctaColor: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-14 cursor-pointer rounded border border-zinc-200" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-500">Photo side</label>
                  <div className="flex gap-1">
                    {(["left", "right"] as const).map((pos) => (
                      <button key={pos}
                        onClick={(e) => { e.stopPropagation(); updateWidget(widget.id, { imagePosition: pos }); }}
                        className={`rounded px-2 py-1 text-[10px] font-medium capitalize transition ${
                          widget.data.imagePosition === pos ? "bg-sky-100 text-sky-700" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STATS editor ───────────────────────────────────────── */}
          {widget.type === "stats" && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Stats Row</p>
              <div className="flex gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-500">Background</label>
                  <input type="color" value={widget.data.backgroundColor}
                    onChange={(e) => updateWidget(widget.id, { backgroundColor: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-14 cursor-pointer rounded border border-zinc-200" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-500">Number color</label>
                  <input type="color" value={widget.data.accentColor}
                    onChange={(e) => updateWidget(widget.id, { accentColor: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-14 cursor-pointer rounded border border-zinc-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(widget.data.items as { value: string; label: string }[]).map((stat, i) => (
                  <div key={i} className="space-y-1 rounded-md border border-zinc-200 bg-zinc-50 p-2">
                    <input
                      value={stat.value}
                      onChange={(e) => {
                        const updated = [...widget.data.items];
                        updated[i] = { ...updated[i], value: e.target.value };
                        updateWidget(widget.id, { items: updated });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-sm font-bold outline-none focus:border-sky-400"
                      placeholder="500+"
                    />
                    <input
                      value={stat.label}
                      onChange={(e) => {
                        const updated = [...widget.data.items];
                        updated[i] = { ...updated[i], label: e.target.value };
                        updateWidget(widget.id, { items: updated });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-[10px] outline-none focus:border-sky-400"
                      placeholder="Homes Sold"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TESTIMONIALS editor ────────────────────────────────── */}
          {widget.type === "testimonials" && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Testimonials</p>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-500">Section title</label>
                <input
                  value={widget.data.title}
                  onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-bold outline-none focus:border-sky-400"
                />
              </div>
              <div className="flex gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-500">Background</label>
                  <input type="color" value={widget.data.backgroundColor}
                    onChange={(e) => updateWidget(widget.id, { backgroundColor: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-14 cursor-pointer rounded border border-zinc-200" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-500">Text color</label>
                  <input type="color" value={widget.data.textColor}
                    onChange={(e) => updateWidget(widget.id, { textColor: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-14 cursor-pointer rounded border border-zinc-200" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-500">Accent color</label>
                  <input type="color" value={widget.data.accentColor}
                    onChange={(e) => updateWidget(widget.id, { accentColor: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-14 cursor-pointer rounded border border-zinc-200" />
                </div>
              </div>
              <div className="space-y-2">
                {(widget.data.items as { text: string; author: string; location?: string }[]).map((item, i) => (
                  <div key={i} className="rounded-md border border-zinc-200 bg-zinc-50 p-3 space-y-1.5">
                    <textarea
                      value={item.text}
                      onChange={(e) => {
                        const updated = [...widget.data.items];
                        updated[i] = { ...updated[i], text: e.target.value };
                        updateWidget(widget.id, { items: updated });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      rows={2}
                      className="w-full resize-none rounded border border-zinc-200 bg-white px-2 py-1 text-xs outline-none focus:border-sky-400"
                      placeholder="Quote text..."
                    />
                    <div className="flex gap-2">
                      <input
                        value={item.author}
                        onChange={(e) => {
                          const updated = [...widget.data.items];
                          updated[i] = { ...updated[i], author: e.target.value };
                          updateWidget(widget.id, { items: updated });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 rounded border border-zinc-200 bg-white px-2 py-1 text-[10px] font-semibold outline-none focus:border-sky-400"
                        placeholder="Author name"
                      />
                      <input
                        value={item.location || ""}
                        onChange={(e) => {
                          const updated = [...widget.data.items];
                          updated[i] = { ...updated[i], location: e.target.value };
                          updateWidget(widget.id, { items: updated });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 rounded border border-zinc-200 bg-white px-2 py-1 text-[10px] outline-none focus:border-sky-400"
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback for unrecognized widget types */}
          {!["title","text","image","gallery","leadForm","divider","spacer","map","hero","agentBio","stats","testimonials"].includes(widget.type) && (
            <div className="rounded-md bg-zinc-100 px-4 py-3 text-sm text-zinc-500">
              <span className="font-medium">{widget.label}</span> — use the AI tab to modify this widget
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div onClick={() => setSelectedId(null)}>
      {/* Widget list */}
      <div className="space-y-3">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 py-16 text-center">
            <p className="text-sm font-medium text-zinc-400">No widgets yet</p>
            <p className="mt-1 text-xs text-zinc-300">Use the toolbar below to add sections</p>
          </div>
        ) : (
          widgets.map((widget, index) => renderEditable(widget, index))
        )}
      </div>

      {/* Add widget toolbar */}
      <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Add section
        </p>
        <div className="flex flex-wrap gap-2">
          {ADD_WIDGETS.map((item) => (
            <button
              key={item.type}
              onClick={() => addWidget(item.type)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
