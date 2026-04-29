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

    case "hero":
      return `
      <section className="relative flex min-h-[80vh] items-end overflow-hidden">
        <img src="${escapeTemplateLiteral(widget.data.backgroundImage)}" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black" style={{ opacity: ${widget.data.overlayOpacity ?? 0.5} }} />
        <div className="relative z-10 w-full px-6 pb-20 pt-32 ${widget.data.textAlign === "center" ? "text-center" : ""}">
          <div className="mx-auto max-w-6xl ${widget.data.textAlign === "center" ? "flex flex-col items-center" : ""}">
            ${widget.data.tagline ? `<p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/60">${escapeTemplateLiteral(widget.data.tagline)}</p>` : ""}
            <h1 className="text-5xl font-bold leading-none text-white sm:text-7xl">${escapeTemplateLiteral(widget.data.title)}</h1>
            ${widget.data.subtitle ? `<p className="mt-6 max-w-xl text-lg text-white/75 sm:text-xl">${escapeTemplateLiteral(widget.data.subtitle)}</p>` : ""}
            <a href="#contact" className="mt-8 inline-block px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95" style={{ backgroundColor: '${escapeTemplateLiteral(widget.data.ctaColor)}', color: '${escapeTemplateLiteral(widget.data.ctaTextColor)}' }}>
              ${escapeTemplateLiteral(widget.data.ctaText)}
            </a>
          </div>
        </div>
      </section>`;

    case "agentBio":
      return `
      <section style={{ backgroundColor: '${escapeTemplateLiteral(widget.data.backgroundColor)}', color: '${escapeTemplateLiteral(widget.data.textColor)}' }}>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col gap-12 md:flex-row md:items-center ${widget.data.imagePosition === "right" ? "md:flex-row-reverse" : ""}">
            <div className="w-full flex-shrink-0 md:w-80">
              <img src="${escapeTemplateLiteral(widget.data.imageUrl)}" alt="${escapeTemplateLiteral(widget.data.name)}" className="h-96 w-full object-cover object-top md:h-[480px]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-50">${escapeTemplateLiteral(widget.data.title)}</p>
              <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">${escapeTemplateLiteral(widget.data.name)}</h2>
              <p className="mt-6 text-base leading-8 opacity-75 sm:text-lg">${escapeTemplateLiteral(widget.data.bio)}</p>
              <a href="#contact" className="mt-8 inline-block border-b-2 border-current pb-1 text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-60">
                ${escapeTemplateLiteral(widget.data.ctaText)}
              </a>
            </div>
          </div>
        </div>
      </section>`;

    case "stats": {
      const statItems = widget.data.items
        .map(
          (item) => `
              <div className="text-center">
                <p className="text-5xl font-bold sm:text-6xl" style={{ color: '${escapeTemplateLiteral(widget.data.accentColor)}' }}>${escapeTemplateLiteral(item.value)}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest opacity-60">${escapeTemplateLiteral(item.label)}</p>
              </div>`,
        )
        .join("\n");
      return `
      <section style={{ backgroundColor: '${escapeTemplateLiteral(widget.data.backgroundColor)}', color: '${escapeTemplateLiteral(widget.data.textColor)}' }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            ${statItems}
          </div>
        </div>
      </section>`;
    }

    case "testimonials": {
      const testimonialItems = widget.data.items
        .map(
          (item) => `
              <div className="rounded-sm border border-white/10 bg-white/5 p-6">
                <p className="text-2xl font-bold" style={{ color: '${escapeTemplateLiteral(widget.data.accentColor)}' }}>"</p>
                <p className="mt-2 text-sm leading-7 opacity-80">${escapeTemplateLiteral(item.text)}</p>
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold">${escapeTemplateLiteral(item.author)}</p>
                  ${item.location ? `<p className="text-xs opacity-50">${escapeTemplateLiteral(item.location)}</p>` : ""}
                </div>
              </div>`,
        )
        .join("\n");
      return `
      <section style={{ backgroundColor: '${escapeTemplateLiteral(widget.data.backgroundColor)}', color: '${escapeTemplateLiteral(widget.data.textColor)}' }}>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-50">What Clients Say</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">${escapeTemplateLiteral(widget.data.title)}</h2>
            <div className="mx-auto mt-4 h-0.5 w-12" style={{ backgroundColor: '${escapeTemplateLiteral(widget.data.accentColor)}' }} />
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            ${testimonialItems}
          </div>
        </div>
      </section>`;
    }

    default:
      return "";
  }
}

// Builds the full standalone React component code string from an array of widgets.
// The realtorId gets baked in so lead forms know where to send leads.
export function generateCodeString(widgets: CanvasWidget[], realtorId: string): string {
  const sections = widgets.map((w) => widgetMarkup(w)).join("\n");
  const REALTOR_ID = realtorId || "anonymous";
  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return `import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';

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
  const [fields, setFields] = useState({ name: '', email: '', phone_country_code: '', phone: '', city: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).__onTurnstileVerify = (token: string) => setTurnstileToken(token);
    (window as any).__onTurnstileExpire = () => setTurnstileToken(null);
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const set = (field: keyof typeof fields) => (e: ChangeEvent<HTMLInputElement>) =>
    setFields(cur => ({ ...cur, [field]: e.target.value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!turnstileToken) return;
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      const phone = \`\${fields.phone_country_code} \${fields.phone}\`.trim();
      const response = await fetch('/api/proxy/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turnstileToken,
          realtorId: '${REALTOR_ID}',
          lead: { name: fields.name, email: fields.email, phone, city: fields.city },
          extra_fields: {},
          sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/',
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed to submit. Please try again.');
      }
      setSubmitStatus('success');
      setSubmitMessage('Thanks! Your consultation request has been received.');
      setFields({ name: '', email: '', phone_country_code: '', phone: '', city: '' });
      setTurnstileToken(null);
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const input = "w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-sky-500 text-slate-900";

  return (
    <section className={\`\${isNested ? 'py-2' : 'px-6 py-16 sm:px-12 md:py-24'}\`}>
      <div
        className={\`grid gap-12 rounded-2xl border border-slate-100 p-10 shadow-xl \${isNested ? 'grid-cols-1' : 'lg:grid-cols-[0.9fr_1.1fr]'}\`}
        style={{ backgroundColor, color: textColor }}
      >
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] opacity-60">Get Started</p>
            <h2 className={\`mt-4 \${isNested ? 'text-2xl' : 'text-4xl'} font-bold tracking-tight leading-tight\`}>{title}</h2>
          </div>
          <p className="text-lg leading-relaxed opacity-80">{description}</p>
        </div>
        <div className="rounded-xl bg-white p-8 text-slate-900 shadow-inner">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
              <input className={input} placeholder="Your Name" required value={fields.name} onChange={set('name')} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email</label>
              <input type="email" className={input} placeholder="you@email.com" required value={fields.email} onChange={set('email')} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Phone Number</label>
              <div className="flex gap-2">
                <input
                  className="w-20 shrink-0 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3.5 text-center text-sm outline-none focus:border-sky-500 text-slate-900"
                  placeholder="+1" maxLength={6} required
                  value={fields.phone_country_code} onChange={set('phone_country_code')}
                />
                <input className={input} type="tel" placeholder="555 000-0000" required value={fields.phone} onChange={set('phone')} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">City</label>
              <input className={input} placeholder="Your City" value={fields.city} onChange={set('city')} />
            </div>
            <div
              ref={turnstileRef}
              className="cf-turnstile mt-2"
              data-sitekey="${TURNSTILE_SITE_KEY}"
              data-callback="__onTurnstileVerify"
              data-expired-callback="__onTurnstileExpire"
            />
            <button
              type="submit"
              disabled={isSubmitting || !turnstileToken}
              className="mt-2 flex w-full items-center justify-center rounded-lg px-6 py-4 text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: buttonColor, color: buttonTextColor }}
            >
              {isSubmitting ? 'Sending...' : buttonLabel}
            </button>
            {submitStatus === 'success' && <p className="text-xs font-semibold text-emerald-500 text-center">{submitMessage}</p>}
            {submitStatus === 'error' && <p className="text-xs font-semibold text-rose-500 text-center">{submitMessage}</p>}
            <p className="mt-4 text-[11px] leading-relaxed text-slate-400 text-center">{disclaimer}</p>
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
