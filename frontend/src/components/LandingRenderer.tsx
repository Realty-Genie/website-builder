"use client";

import React, { useState, type ChangeEvent, type FormEvent } from "react";

// ─── Lead Form ───────────────────────────────────────────────────────────────
// Handles name/email/phone capture and sends to the CRM API.

type LeadFormProps = {
  title: string;
  description: string;
  disclaimer: string;
  buttonLabel: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  realtorId: string;
};

function LeadForm({
  title,
  description,
  disclaimer,
  buttonLabel,
  backgroundColor,
  textColor,
  buttonColor,
  buttonTextColor,
  realtorId,
}: LeadFormProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const CRM_URL = process.env.NEXT_PUBLIC_CRM_URL || "https://realty-crm-web.vercel.app";

  const update = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`${CRM_URL}/api/v1/add/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realtorUserId: realtorId,
          leadType: "contact",
          sourceTemplate: "landing-v2",
          sourcePage: typeof window !== "undefined" ? window.location.pathname : "/",
          lead: { name: form.name, email: form.email, phone: form.phone },
          context: {
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
            referrer: typeof document !== "undefined" ? document.referrer : "",
          },
        }),
      });
      if (!res.ok) throw new Error("Submission failed. Please try again.");
      setStatus("success");
      setMessage("Thanks! We'll be in touch shortly.");
      setForm({ name: "", email: "", phone: "" });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section id="contact" style={{ backgroundColor }}>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2" style={{ color: textColor }}>
          {/* Left: copy */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-50">Get Started</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">{title}</h2>
            <p className="mt-5 text-base leading-8 opacity-75">{description}</p>
          </div>
          {/* Right: form */}
          <div className="rounded-xl bg-white p-8 text-slate-900 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  required
                  value={form.name}
                  onChange={update("name")}
                  placeholder="Your Name"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@email.com"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</label>
                  <input
                    required
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-2 w-full rounded-lg px-6 py-4 text-sm font-bold uppercase tracking-wider shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: buttonColor, color: buttonTextColor }}
              >
                {status === "loading" ? "Sending..." : buttonLabel}
              </button>
              {status === "success" && <p className="text-center text-sm font-semibold text-emerald-500">{message}</p>}
              {status === "error" && <p className="text-center text-sm font-semibold text-rose-500">{message}</p>}
              <p className="text-center text-[11px] text-slate-400">{disclaimer}</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Helper functions ─────────────────────────────────────────────────────────

function align(a: string) {
  if (a === "left") return "text-left";
  if (a === "right") return "text-right";
  return "text-center";
}

function titleSize(s: string) {
  if (s === "sm") return "text-2xl sm:text-3xl";
  if (s === "md") return "text-3xl sm:text-4xl";
  return "text-4xl sm:text-5xl";
}

function aspectClass(a: string) {
  if (a === "square") return "aspect-square";
  if (a === "portrait") return "aspect-[4/5]";
  if (a === "fullwidth") return "aspect-[21/9]";
  return "aspect-[16/9]";
}

// ─── Main Renderer ────────────────────────────────────────────────────────────

export function LandingRenderer({ widgets, realtorId }: { widgets: any[]; realtorId: string }) {
  function renderWidget(widget: any): React.ReactNode {
    switch (widget.type) {

      // ── Basic text/title widgets ──────────────────────────────
      case "title":
        return (
          <section key={widget.id} style={{ backgroundColor: widget.data.sectionBg || "transparent" }}>
            <div className="mx-auto max-w-6xl px-6 py-8">
              <h1
                className={`${align(widget.data.alignment)} ${titleSize(widget.data.size)} font-bold leading-tight`}
                style={{ color: widget.data.color }}
              >
                {widget.data.text}
              </h1>
            </div>
          </section>
        );

      case "text":
        return (
          <section key={widget.id} style={{ backgroundColor: widget.data.sectionBg || "transparent" }}>
            <div className="mx-auto max-w-6xl px-6 py-4">
              <p
                className={`${align(widget.data.alignment)} text-base leading-8 sm:text-lg`}
                style={{ color: widget.data.color }}
              >
                {widget.data.text}
              </p>
            </div>
          </section>
        );

      // ── Image — full-width when aspect is "fullwidth", contained otherwise ──
      case "image":
        return (
          <section key={widget.id}>
            {widget.data.aspect === "fullwidth" ? (
              <div className="aspect-[21/9] w-full overflow-hidden">
                <img
                  src={widget.data.imageUrl}
                  alt={widget.data.alt}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="mx-auto max-w-6xl px-6 py-4">
                <div className={`${aspectClass(widget.data.aspect)} overflow-hidden`}>
                  <img
                    src={widget.data.imageUrl}
                    alt={widget.data.alt}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </section>
        );

      // ── Gallery ───────────────────────────────────────────────
      case "gallery":
        return (
          <section key={widget.id} style={{ backgroundColor: widget.data.sectionBg || "transparent" }}>
            <div className="mx-auto max-w-6xl px-6 py-8">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {widget.data.images?.map((url: string, i: number) => (
                  <div key={i} className="aspect-[4/3] overflow-hidden">
                    <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      // ── Slideshow ─────────────────────────────────────────────
      case "slideshow":
        return (
          <section key={widget.id} className="bg-white">
            <div className="mx-auto max-w-6xl px-6 py-8">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-slate-500">{widget.data.title}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {widget.data.images?.map((url: string, i: number) => (
                  <div key={i} className="aspect-[16/10] overflow-hidden">
                    <img src={url} alt={`Slide ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      // ── Map ───────────────────────────────────────────────────
      case "map":
        return (
          <section key={widget.id} className="bg-white">
            <div className="mx-auto max-w-6xl px-6 py-16">
              <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-slate-900">{widget.data.title}</h3>
                  <p className="mt-3 text-slate-500">{widget.data.address}</p>
                </div>
                <div className="overflow-hidden rounded-lg" style={{ minHeight: 300 }}>
                  <iframe
                    src={widget.data.embedUrl}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>
        );

      // ── Lead Form ─────────────────────────────────────────────
      case "leadForm":
        return (
          <LeadForm
            key={widget.id}
            title={widget.data.title}
            description={widget.data.description}
            disclaimer={widget.data.disclaimer}
            buttonLabel={widget.data.buttonLabel}
            backgroundColor={widget.data.backgroundColor}
            textColor={widget.data.textColor}
            buttonColor={widget.data.buttonColor}
            buttonTextColor={widget.data.buttonTextColor}
            realtorId={realtorId}
          />
        );

      // ── Divider / Spacer ──────────────────────────────────────
      case "divider":
        return (
          <div key={widget.id} className="mx-auto max-w-6xl px-6">
            <div className="h-px w-full" style={{ backgroundColor: widget.data.color }} />
          </div>
        );

      case "spacer":
        return <div key={widget.id} style={{ height: widget.data.height }} />;

      // ── Embed ─────────────────────────────────────────────────
      case "embed":
        return (
          <section key={widget.id} className="bg-white">
            <div className="mx-auto max-w-6xl px-6 py-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{widget.data.title}</p>
              <div dangerouslySetInnerHTML={{ __html: widget.data.html }} />
            </div>
          </section>
        );

      // ── Columns layout ────────────────────────────────────────
      case "columns":
        return (
          <section
            key={widget.id}
            style={{ backgroundColor: widget.data.backgroundColor || "transparent" }}
          >
            <div className="mx-auto max-w-6xl px-6 py-8">
              <div className={`grid gap-6 ${widget.data.colCount > 1 ? "lg:grid-cols-12" : ""}`}>
                {widget.data.items?.map((col: any[], idx: number) => {
                  const span = (widget.data.spans?.[idx]) || Math.floor(12 / widget.data.colCount);
                  const spanClass: Record<number, string> = {
                    1: "lg:col-span-1", 2: "lg:col-span-2", 3: "lg:col-span-3",
                    4: "lg:col-span-4", 5: "lg:col-span-5", 6: "lg:col-span-6",
                    7: "lg:col-span-7", 8: "lg:col-span-8", 9: "lg:col-span-9",
                    10: "lg:col-span-10", 11: "lg:col-span-11", 12: "lg:col-span-12",
                  };
                  return (
                    <div key={idx} className={`flex flex-col gap-4 ${spanClass[span] || "lg:col-span-6"}`}>
                      {col.map((inner) => renderWidget(inner))}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      // ── HERO — full-width image with overlay, headline, and CTA ──
      case "hero":
        return (
          <section
            key={widget.id}
            className="relative flex min-h-[80vh] items-end overflow-hidden"
          >
            {/* Background image */}
            <img
              src={widget.data.backgroundImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Dark overlay */}
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: widget.data.overlayOpacity ?? 0.5 }}
            />
            {/* Content */}
            <div
              className={`relative z-10 w-full px-6 pb-20 pt-32 ${widget.data.textAlign === "center" ? "text-center" : ""}`}
            >
              <div className={`mx-auto max-w-6xl ${widget.data.textAlign === "center" ? "flex flex-col items-center" : ""}`}>
                {widget.data.tagline && (
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/60">
                    {widget.data.tagline}
                  </p>
                )}
                <h1 className="text-5xl font-bold leading-none text-white sm:text-7xl md:text-8xl">
                  {widget.data.title}
                </h1>
                {widget.data.subtitle && (
                  <p className="mt-6 max-w-xl text-lg text-white/75 sm:text-xl">
                    {widget.data.subtitle}
                  </p>
                )}
                <a
                  href="#contact"
                  className="mt-8 inline-block px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: widget.data.ctaColor || "#c9a84c", color: widget.data.ctaTextColor || "#000" }}
                >
                  {widget.data.ctaText || "Get in Touch"}
                </a>
              </div>
            </div>
          </section>
        );

      // ── AGENT BIO — photo + name + bio side by side ──────────
      case "agentBio":
        return (
          <section
            key={widget.id}
            style={{ backgroundColor: widget.data.backgroundColor || "#fff", color: widget.data.textColor || "#1a1a1a" }}
          >
            <div className="mx-auto max-w-6xl px-6 py-20">
              <div className={`flex flex-col gap-12 md:flex-row md:items-center ${widget.data.imagePosition === "right" ? "md:flex-row-reverse" : ""}`}>
                {/* Photo */}
                <div className="w-full flex-shrink-0 md:w-80">
                  <img
                    src={widget.data.imageUrl}
                    alt={widget.data.name}
                    className="h-96 w-full object-cover object-top md:h-[480px]"
                  />
                </div>
                {/* Bio text */}
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-50">
                    {widget.data.title}
                  </p>
                  <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
                    {widget.data.name}
                  </h2>
                  <p className="mt-6 text-base leading-8 opacity-75 sm:text-lg">
                    {widget.data.bio}
                  </p>
                  <a
                    href="#contact"
                    className="mt-8 inline-block border-b-2 border-current pb-1 text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-60"
                  >
                    {widget.data.ctaText || "Work With Me →"}
                  </a>
                </div>
              </div>
            </div>
          </section>
        );

      // ── STATS — row of big numbers ────────────────────────────
      case "stats":
        return (
          <section
            key={widget.id}
            style={{ backgroundColor: widget.data.backgroundColor || "#0f172a", color: widget.data.textColor || "#fff" }}
          >
            <div className="mx-auto max-w-6xl px-6 py-16">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {widget.data.items?.map((stat: { value: string; label: string }, i: number) => (
                  <div key={i} className="text-center">
                    <p
                      className="text-5xl font-bold sm:text-6xl"
                      style={{ color: widget.data.accentColor || "#c9a84c" }}
                    >
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-widest opacity-60">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      // ── TESTIMONIALS — quote cards grid ──────────────────────
      case "testimonials":
        return (
          <section
            key={widget.id}
            style={{ backgroundColor: widget.data.backgroundColor || "#1e293b", color: widget.data.textColor || "#fff" }}
          >
            <div className="mx-auto max-w-6xl px-6 py-20">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-50">What Clients Say</p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{widget.data.title}</h2>
                <div className="mx-auto mt-4 h-0.5 w-12" style={{ backgroundColor: widget.data.accentColor || "#c9a84c" }} />
              </div>
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {widget.data.items?.map((t: { text: string; author: string; location?: string }, i: number) => (
                  <div key={i} className="rounded-sm border border-white/10 bg-white/5 p-6">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: widget.data.accentColor || "#c9a84c" }}
                    >
                      "
                    </p>
                    <p className="mt-2 text-sm leading-7 opacity-80">{t.text}</p>
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <p className="text-sm font-semibold">{t.author}</p>
                      {t.location && <p className="text-xs opacity-50">{t.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {widgets.map((w) => renderWidget(w))}
    </main>
  );
}
