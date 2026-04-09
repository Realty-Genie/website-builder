// Converts the widget array into a deployable standalone React component (as a string).
// This string is stored in the database and can be used to render the page independently.
// The widgetMarkup function converts each widget to JSX, and generateCodeString wraps it all.

import type {
  CanvasWidget,
  Alignment,
  ImageWidgetData,
  TitleWidgetData,
} from "@/types/widgets";

// Escapes special characters so the value can be safely embedded inside a template literal
function escapeTemplateLiteral(value?: string): string {
  if (!value) return "";
  return value
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

function alignmentClass(alignment: Alignment): string {
  if (alignment === "left") return "text-left";
  if (alignment === "right") return "text-right";
  return "text-center";
}

function aspectClass(aspect: ImageWidgetData["aspect"]): string {
  if (aspect === "square") return "aspect-square";
  if (aspect === "portrait") return "aspect-[4/5]";
  return "aspect-[16/9]";
}

function titleSizeClass(size: TitleWidgetData["size"]): string {
  if (size === "sm") return "text-2xl sm:text-3xl";
  if (size === "md") return "text-3xl sm:text-4xl";
  return "text-4xl sm:text-5xl";
}

// Turns a string array into a JS array literal safe for embedding in a template literal
function imageArrayLiteral(values: string[]): string {
  return `[${values.map((v) => `\`${escapeTemplateLiteral(v)}\``).join(", ")}]`;
}

// Converts a single widget into a JSX string for the generated standalone component
export function widgetMarkup(widget: CanvasWidget, isNested?: boolean): string {
  switch (widget.type) {
    case "title":
      return `
      <section className="px-4 sm:px-6">
        <h1 className="${alignmentClass(widget.data.alignment)} ${titleSizeClass(widget.data.size)} font-semibold tracking-tight" style={{ color: '${escapeTemplateLiteral(widget.data.color)}' }}>
          ${escapeTemplateLiteral(widget.data.text)}
        </h1>
      </section>`;

    case "text":
      return `
      <section className="px-4 sm:px-6">
        <p className="${alignmentClass(widget.data.alignment)} text-base leading-8 sm:text-lg" style={{ color: '${escapeTemplateLiteral(widget.data.color)}' }}>
          ${escapeTemplateLiteral(widget.data.text)}
        </p>
      </section>`;

    case "image":
      return `
      <section className="px-4 sm:px-6">
        <div className="${aspectClass(widget.data.aspect)} overflow-hidden rounded-sm border border-slate-200 bg-slate-100">
          <img src="${escapeTemplateLiteral(widget.data.imageUrl)}" alt="${escapeTemplateLiteral(widget.data.alt)}" className="h-full w-full object-cover" />
        </div>
      </section>`;

    case "gallery":
      return `
      <section className="px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {${imageArrayLiteral(widget.data.images)}.map((image, index) => (
            <div key={\`\${image}-\${index}\`} className="aspect-[4/3] overflow-hidden rounded-sm border border-slate-200 bg-slate-100">
              <img src={image} alt={\`Gallery image \${index + 1}\`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </section>`;

    case "slideshow":
      return `
      <section className="px-4 sm:px-6">
        <div className="overflow-hidden rounded-sm border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">${escapeTemplateLiteral(widget.data.title)}</p>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            {${imageArrayLiteral(widget.data.images)}.map((image, index) => (
              <div key={\`\${image}-\${index}\`} className="aspect-[16/10] overflow-hidden rounded-sm bg-slate-100">
                <img src={image} alt={\`Slide \${index + 1}\`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>`;

    case "map":
      return `
      <section className={\`\${isNested ? 'py-2' : 'px-6 py-16 sm:px-12 md:py-24'}\`}>
        <div className={\`grid gap-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-md \${isNested ? 'grid-cols-1' : 'lg:grid-cols-[0.4fr_0.6fr]'}\`}>
          <div className="flex flex-col justify-center space-y-4">
            <h3 className="text-2xl font-bold text-slate-900">${escapeTemplateLiteral(widget.data.title)}</h3>
            <p className="text-base leading-relaxed text-slate-500">${escapeTemplateLiteral(widget.data.address)}</p>
          </div>
          <div className="min-h-[320px] overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-inner">
            <iframe
              src="${escapeTemplateLiteral(widget.data.embedUrl)}"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>`;

    case "leadForm":
      return `
      <LeadForm
        title="${escapeTemplateLiteral(widget.data.title)}"
        description="${escapeTemplateLiteral(widget.data.description)}"
        disclaimer="${escapeTemplateLiteral(widget.data.disclaimer)}"
        buttonLabel="${escapeTemplateLiteral(widget.data.buttonLabel)}"
        backgroundColor="${escapeTemplateLiteral(widget.data.backgroundColor)}"
        textColor="${escapeTemplateLiteral(widget.data.textColor)}"
        buttonColor="${escapeTemplateLiteral(widget.data.buttonColor)}"
        buttonTextColor="${escapeTemplateLiteral(widget.data.buttonTextColor)}"
        isNested={${isNested}}
      />`;

    case "divider":
      return `
      <section className="px-4 sm:px-6">
        <div className="h-px w-full" style={{ backgroundColor: '${escapeTemplateLiteral(widget.data.color)}' }} />
      </section>`;

    case "spacer":
      return `
      <section className="px-4 sm:px-6">
        <div style={{ height: '${widget.data.height}px' }} />
      </section>`;

    case "embed":
      return `
      <section className="px-4 sm:px-6">
        <div className="overflow-hidden rounded-sm border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">${escapeTemplateLiteral(widget.data.title)}</div>
          <div dangerouslySetInnerHTML={{ __html: \`${escapeTemplateLiteral(widget.data.html)}\` }} />
        </div>
      </section>`;

    case "columns": {
      const colCount = widget.data.colCount;
      const gridClass = colCount === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12";
      return `
      <section className="px-4 sm:px-6">
        <div className="grid gap-4 md:gap-6 ${gridClass}">
${widget.data.items
  .map((colItems, idx) => {
    const span =
      (widget.data.spans?.[idx]) || Math.floor(12 / colCount);
    const spanClass = `lg:col-span-${span}`;
    return `          <div className="flex flex-col gap-4 ${spanClass}">
${colItems.map((inner) => widgetMarkup(inner, true)).join("\n")}
          </div>`;
  })
  .join("\n")}
        </div>
      </section>`;
    }
  }
}

// Builds the full standalone React component code string from an array of widgets.
// The realtorId gets baked in so lead forms know where to send leads.
export function generateCodeString(widgets: CanvasWidget[], realtorId: string): string {
  const sections = widgets.map((w) => widgetMarkup(w)).join("\n");
  const REALTOR_ID = realtorId || "anonymous";
  const CRM_API_URL =
    process.env.NEXT_PUBLIC_CRM_URL || "https://realty-crm-web.vercel.app";

  return `import { useState, type ChangeEvent, type FormEvent } from 'react';

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
};

function LeadForm({
  title, description, disclaimer, buttonLabel,
  backgroundColor, textColor, buttonColor, buttonTextColor, isNested
}: LeadFormProps) {
  const [formState, setFormState] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (field: keyof typeof formState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('${CRM_API_URL}/api/v1/add/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          realtorUserId: '${REALTOR_ID}',
          leadType: 'contact',
          sourceTemplate: 'flagship-v1',
          sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/',
          lead: { name: formState.name, email: formState.email, phone: formState.phone },
          context: {
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            referrer: typeof document !== 'undefined' ? document.referrer : ''
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to submit. Please try again.');
      setSubmitStatus('success');
      setSubmitMessage('Thanks! Your consultation request has been received.');
      setFormState({ name: '', email: '', phone: '' });
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={\`\${isNested ? 'py-2' : 'px-6 py-16 sm:px-12 md:py-24'}\`}>
      <div
        className={\`grid gap-12 rounded-2xl border border-slate-100 p-10 shadow-xl \${isNested ? 'grid-cols-1' : 'lg:grid-cols-[0.9fr_1.1fr]'}\`}
        style={{ backgroundColor, color: textColor }}
      >
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] opacity-60">Lead capture</p>
            <h2 className={\`mt-4 \${isNested ? 'text-2xl' : 'text-4xl'} font-bold tracking-tight leading-tight\`}>{title}</h2>
          </div>
          <p className="text-lg leading-relaxed opacity-80">{description}</p>
          <div className="pt-4 border-t border-current/10">
            <p className="text-xs font-medium opacity-50 uppercase tracking-widest">Powered by RealtyGenie CRM</p>
          </div>
        </div>
        <div className="rounded-xl bg-white p-8 text-slate-900 shadow-inner">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className={\`grid gap-5 \${isNested ? 'grid-cols-1' : 'sm:grid-cols-2'}\`}>
              <div className={\`\${isNested ? '' : 'sm:col-span-2'}\`}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
                <input className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-sky-500 text-slate-900" placeholder="Your Name" required value={formState.name} onChange={handleChange('name')} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email</label>
                <input type="email" className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-sky-500 text-slate-900" placeholder="email@example.com" required value={formState.email} onChange={handleChange('email')} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Phone</label>
                <input className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-sky-500 text-slate-900" placeholder="+1 (555) 000-0000" required value={formState.phone} onChange={handleChange('phone')} />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="mt-4 flex w-full items-center justify-center rounded-lg px-6 py-4 text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-50" style={{ backgroundColor: buttonColor, color: buttonTextColor }}>
              {isSubmitting ? 'Sending...' : buttonLabel}
            </button>
            {submitStatus === 'success' && <p className="text-xs font-semibold text-emerald-500 text-center">{submitMessage}</p>}
            {submitStatus === 'error' && <p className="text-xs font-semibold text-rose-500 text-center">{submitMessage}</p>}
            <p className="mt-6 text-[11px] leading-relaxed text-slate-400 text-center">{disclaimer}</p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function StandaloneLandingPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="mx-auto max-w-5xl bg-white shadow-2xl shadow-slate-200/50">
${sections}
      </div>
    </main>
  );
}
`;
}
