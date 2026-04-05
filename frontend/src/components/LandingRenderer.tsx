"use client";

import React, { useState, type ChangeEvent, type FormEvent } from "react";

type LeadFormProps = {
  title: string;
  description: string;
  disclaimer: string;
  buttonLabel: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  isNested?: boolean;
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
  isNested,
  realtorId,
}: LeadFormProps) {
  const [formState, setFormState] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (field: keyof typeof formState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((current) => ({ ...current, [field]: event.target.value }));
  };

  const CRM_API_URL = process.env.NEXT_PUBLIC_CRM_URL || "https://realty-crm-web.vercel.app";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      const response = await fetch(`${CRM_API_URL}/api/v1/add/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realtorUserId: realtorId,
          leadType: "contact",
          sourceTemplate: "flagship-v1",
          sourcePage: typeof window !== "undefined" ? window.location.pathname : "/",
          lead: {
            name: formState.name,
            email: formState.email,
            phone: formState.phone,
          },
          context: {
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
            referrer: typeof document !== "undefined" ? document.referrer : "",
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to submit lead. Please try again.");

      setSubmitStatus("success");
      setSubmitMessage("Thanks! Your consultation request has been received.");
      setFormState({ name: "", email: "", phone: "" });
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`${isNested ? "py-2" : "px-6 py-16 sm:px-12 md:py-24"}`}>
      <div
        className={`grid gap-12 rounded-2xl border border-slate-100 p-10 shadow-xl ${isNested ? "grid-cols-1" : "lg:grid-cols-[0.9fr_1.1fr]"}`}
        style={{ backgroundColor, color: textColor }}
      >
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] opacity-60">Lead capture</p>
            <h2 className={`mt-4 ${isNested ? "text-2xl" : "text-4xl"} font-bold tracking-tight leading-tight`}>{title}</h2>
          </div>
          <p className="text-lg leading-relaxed opacity-80">{description}</p>
          <div className="pt-4 border-t border-current/10">
            <p className="text-xs font-medium opacity-50 uppercase tracking-widest">Powered by RealtyGenie CRM</p>
          </div>
        </div>
        <div className="rounded-xl bg-white p-8 text-slate-900 shadow-inner">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className={`grid gap-5 ${isNested ? "grid-cols-1" : "sm:grid-cols-2"}`}>
              <div className={`${isNested ? "" : "sm:col-span-2"}`}>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none transition-all focus:border-sky-500 text-slate-900"
                  placeholder="Your Name"
                  required
                  value={formState.name}
                  onChange={handleChange("name")}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none transition-all focus:border-sky-500 text-slate-900"
                  placeholder="email@example.com"
                  required
                  value={formState.email}
                  onChange={handleChange("email")}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</label>
                <input
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none transition-all focus:border-sky-500 text-slate-900"
                  placeholder="+1 (555) 000-0000"
                  required
                  value={formState.phone}
                  onChange={handleChange("phone")}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 flex w-full items-center justify-center rounded-lg px-6 py-4 text-sm font-bold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: buttonColor, color: buttonTextColor }}
            >
              {isSubmitting ? "Sending..." : buttonLabel}
            </button>
            {submitStatus === "success" && (
              <p className="text-center text-xs font-semibold text-emerald-500 opacity-100 transition-opacity">{submitMessage}</p>
            )}
            {submitStatus === "error" && (
              <p className="text-center text-xs font-semibold text-rose-500 opacity-100 transition-opacity">{submitMessage}</p>
            )}
            <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-400">{disclaimer}</p>
          </form>
        </div>
      </div>
    </section>
  );
}

function alignmentClass(alignment: string) {
  if (alignment === "left") return "text-left";
  if (alignment === "right") return "text-right";
  return "text-center";
}

function titleSizeClass(size: string) {
  if (size === "sm") return "text-2xl sm:text-3xl";
  if (size === "md") return "text-3xl sm:text-4xl";
  return "text-4xl sm:text-5xl";
}

function aspectClass(aspect: string) {
  if (aspect === "square") return "aspect-square";
  if (aspect === "portrait") return "aspect-[4/5]";
  return "aspect-[16/9]";
}

function getResponsiveGridClass(colCount: number) {
  if (colCount === 1) return "grid-cols-1";
  return "grid-cols-1 lg:grid-cols-12";
}

function getSpanClass(span: number) {
  const spans: Record<number, string> = {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
    7: "lg:col-span-7",
    8: "lg:col-span-8",
    9: "lg:col-span-9",
    10: "lg:col-span-10",
    11: "lg:col-span-11",
    12: "lg:col-span-12",
  };
  return spans[span] || "lg:col-span-6";
}

export function LandingRenderer({ widgets, realtorId }: { widgets: any[]; realtorId: string }) {
  const renderWidget = (widget: any, isNested = false) => {
    switch (widget.type) {
      case "title":
        return (
          <section className="px-4 sm:px-6" key={widget.id}>
            <h1
              className={`${alignmentClass(widget.data.alignment)} ${titleSizeClass(widget.data.size)} font-semibold tracking-tight`}
              style={{ color: widget.data.color }}
            >
              {widget.data.text}
            </h1>
          </section>
        );
      case "text":
        return (
          <section className="px-4 sm:px-6" key={widget.id}>
            <p
              className={`${alignmentClass(widget.data.alignment)} text-base leading-8 sm:text-lg`}
              style={{ color: widget.data.color }}
            >
              {widget.data.text}
            </p>
          </section>
        );
      case "image":
        return (
          <section className="px-4 sm:px-6" key={widget.id}>
            <div className={`${aspectClass(widget.data.aspect)} overflow-hidden rounded-sm border border-slate-200 bg-slate-100`}>
              <img src={widget.data.imageUrl} alt={widget.data.alt} className="h-full w-full object-cover" />
            </div>
          </section>
        );
      case "gallery":
        return (
          <section className="px-4 sm:px-6" key={widget.id}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {widget.data.images?.map((image: string, index: number) => (
                <div key={`${image}-${index}`} className="aspect-[4/3] overflow-hidden rounded-sm border border-slate-200 bg-slate-100">
                  <img src={image} alt={`Gallery image ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        );
      case "slideshow":
        return (
          <section className="px-4 sm:px-6" key={widget.id}>
            <div className="overflow-hidden rounded-sm border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{widget.data.title}</p>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-3">
                {widget.data.images?.map((image: string, index: number) => (
                  <div key={`${image}-${index}`} className="aspect-[16/10] overflow-hidden rounded-sm bg-slate-100">
                    <img src={image} alt={`Slide ${index + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case "map":
        return (
          <section className={`${isNested ? "py-2" : "px-6 py-16 sm:px-12 md:py-24"}`} key={widget.id}>
            <div className={`grid gap-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-md ${isNested ? "grid-cols-1" : "lg:grid-cols-[0.4fr_0.6fr]"}`}>
              <div className="flex flex-col justify-center space-y-4">
                <h3 className="text-2xl font-bold text-slate-900">{widget.data.title}</h3>
                <p className="text-base leading-relaxed text-slate-500">{widget.data.address}</p>
              </div>
              <div className="min-h-[320px] overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-inner">
                <iframe
                  src={widget.data.embedUrl}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </section>
        );
      case "leadForm":
        return (
          <div key={widget.id}>
            <LeadForm
              title={widget.data.title}
              description={widget.data.description}
              disclaimer={widget.data.disclaimer}
              buttonLabel={widget.data.buttonLabel}
              backgroundColor={widget.data.backgroundColor}
              textColor={widget.data.textColor}
              buttonColor={widget.data.buttonColor}
              buttonTextColor={widget.data.buttonTextColor}
              isNested={isNested}
              realtorId={realtorId}
            />
          </div>
        );
      case "divider":
        return (
          <section className="px-4 sm:px-6" key={widget.id}>
            <div className="h-px w-full" style={{ backgroundColor: widget.data.color }} />
          </section>
        );
      case "spacer":
        return (
          <section className="px-4 sm:px-6" key={widget.id}>
            <div style={{ height: `${widget.data.height}px` }} />
          </section>
        );
      case "embed":
        return (
          <section className="px-4 sm:px-6" key={widget.id}>
            <div className="overflow-hidden rounded-sm border border-slate-200 bg-white p-4">
              <div className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{widget.data.title}</div>
              <div dangerouslySetInnerHTML={{ __html: widget.data.html }} />
            </div>
          </section>
        );
      case "columns":
        return (
          <section className="px-4 sm:px-6" key={widget.id}>
            <div className={`grid gap-4 md:gap-6 ${getResponsiveGridClass(widget.data.colCount)}`}>
              {widget.data.items?.map((colItems: any[], idx: number) => {
                const span = (widget.data.spans && widget.data.spans[idx]) || Math.floor(12 / widget.data.colCount);
                return (
                  <div key={idx} className={`flex flex-col gap-4 ${getSpanClass(span)}`}>
                    {colItems.map((innerWidget) => renderWidget(innerWidget, true))}
                  </div>
                );
              })}
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="mx-auto max-w-5xl bg-white shadow-2xl shadow-slate-200/50">
        {widgets.map((w) => renderWidget(w))}
      </div>
    </main>
  );
}
