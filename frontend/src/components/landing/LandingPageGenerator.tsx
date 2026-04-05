'use client';

import { useMemo, useState, type CSSProperties, type DragEvent, type ReactNode } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button, { Plus, Sparkles, X } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/authStore';

type WidgetType =
  | 'title'
  | 'text'
  | 'image'
  | 'gallery'
  | 'slideshow'
  | 'map'
  | 'leadForm'
  | 'divider'
  | 'spacer'
  | 'embed'
  | 'columns';

type Alignment = 'left' | 'center' | 'right';

type TitleWidgetData = {
  text: string;
  color: string;
  alignment: Alignment;
  size: 'sm' | 'md' | 'lg';
};

type TextWidgetData = {
  text: string;
  color: string;
  alignment: Alignment;
};

type ImageWidgetData = {
  imageUrl: string;
  alt: string;
  aspect: 'wide' | 'square' | 'portrait';
};

type GalleryWidgetData = {
  images: string[];
};

type SlideshowWidgetData = {
  images: string[];
  title: string;
};

type MapWidgetData = {
  title: string;
  address: string;
  embedUrl: string;
};

type LeadFormWidgetData = {
  title: string;
  description: string;
  buttonLabel: string;
  disclaimer: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
};

type DividerWidgetData = {
  color: string;
};

type SpacerWidgetData = {
  height: number;
};

type EmbedWidgetData = {
  title: string;
  html: string;
};

type ColumnsWidgetData = {
  colCount: 1 | 2 | 3 | 4;
  spans: number[];
  items: CanvasWidget[][];
  backgroundType: 'none' | 'color' | 'image';
  backgroundColor?: string;
  backgroundImage?: string;
};

type WidgetDataMap = {
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

type CanvasWidgetBase<T extends WidgetType> = {
  id: string;
  type: T;
  label: string;
  data: WidgetDataMap[T];
};

type CanvasWidget =
  | CanvasWidgetBase<'title'>
  | CanvasWidgetBase<'text'>
  | CanvasWidgetBase<'image'>
  | CanvasWidgetBase<'gallery'>
  | CanvasWidgetBase<'slideshow'>
  | CanvasWidgetBase<'map'>
  | CanvasWidgetBase<'leadForm'>
  | CanvasWidgetBase<'divider'>
  | CanvasWidgetBase<'spacer'>
  | CanvasWidgetBase<'embed'>
  | CanvasWidgetBase<'columns'>;

type SidebarTab = 'build' | 'settings' | 'code';
type CanvasView = 'builder' | 'preview';
type PreviewDevice = 'desktop' | 'mobile';

type DropPosition = {
  parentId?: string;
  colIndex?: number;
  index: number;
};

type DragPayload =
  | { source: 'palette'; widgetType: WidgetType }
  | { source: 'canvas'; itemId: string };

const DEFAULT_REALTOR_ID = 'realtor_demo_001';

const widgetCatalog: Array<{
  type: WidgetType;
  label: string;
  group: 'basic' | 'structure';
  description: string;
  icon: ReactNode;
}> = [
  {
    type: 'title',
    label: 'Title',
    group: 'basic',
    description: 'Large heading text',
    icon: <span className="text-xl font-semibold">T</span>,
  },
  {
    type: 'text',
    label: 'Text',
    group: 'basic',
    description: 'Paragraph or sales copy',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    type: 'image',
    label: 'Image',
    group: 'basic',
    description: 'Single responsive image',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="m7 15 3-3 3 3 2-2 2 2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    type: 'gallery',
    label: 'Gallery',
    group: 'basic',
    description: 'Three-column image row',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="5" height="5" rx="1" />
        <rect x="10" y="5" width="5" height="5" rx="1" />
        <rect x="17" y="5" width="4" height="5" rx="1" />
        <rect x="3" y="13" width="5" height="6" rx="1" />
        <rect x="10" y="13" width="5" height="6" rx="1" />
        <rect x="17" y="13" width="4" height="6" rx="1" />
      </svg>
    ),
  },
  {
    type: 'slideshow',
    label: 'Slideshow',
    group: 'basic',
    description: 'Hero carousel placeholder',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    type: 'map',
    label: 'Map',
    group: 'basic',
    description: 'Location and map embed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
        <circle cx="12" cy="10" r="2.2" />
      </svg>
    ),
  },
  {
    type: 'leadForm',
    label: 'Lead Form',
    group: 'basic',
    description: 'CRM-connected inquiry form',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M8 9h8M8 13h8M8 17h5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    type: 'embed',
    label: 'Embed',
    group: 'basic',
    description: 'Custom embed HTML',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
        <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    type: 'divider',
    label: 'Divider',
    group: 'structure',
    description: 'Horizontal separator',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    type: 'spacer',
    label: 'Spacer',
    group: 'structure',
    description: 'Adjust vertical space',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    type: 'columns',
    label: 'Columns',
    group: 'structure',
    description: 'Side-by-side layout grid',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="8" height="14" rx="1" />
        <rect x="13" y="5" width="8" height="14" rx="1" />
      </svg>
    ),
  },
];

function createWidgetId(type: WidgetType) {
  return `${type}-${Math.random().toString(36).slice(2, 9)}`;
}

function getDefaultWidgetData<T extends WidgetType>(type: T): WidgetDataMap[T] {
  switch (type) {
    case 'title':
      return {
        text: 'Find your next buyer or seller faster.',
        color: '#28323b',
        alignment: 'center',
        size: 'lg',
      } as WidgetDataMap[T];
    case 'text':
      return {
        text: 'Add clear, editable body copy for your landing page. This keeps the canvas flexible like a website builder, not a locked template.',
        color: '#5e6973',
        alignment: 'center',
      } as WidgetDataMap[T];
    case 'image':
      return {
        imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80',
        alt: 'Property showcase',
        aspect: 'wide',
      } as WidgetDataMap[T];
    case 'gallery':
      return {
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
        ],
      } as WidgetDataMap[T];
    case 'slideshow':
      return {
        title: 'Featured listing gallery',
        images: [
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        ],
      } as WidgetDataMap[T];
    case 'map':
      return {
        title: 'Serving Downtown and surrounding neighborhoods',
        address: '123 Market Street, Your City',
        embedUrl: 'https://www.google.com/maps?q=New+York&output=embed',
      } as WidgetDataMap[T];
    case 'leadForm':
      return {
        title: 'Request a private consultation',
        description: 'Collect buyer and seller inquiries and send them directly into your CRM.',
        buttonLabel: 'Get My Free Consultation',
        disclaimer: 'By submitting, you agree to be contacted about real estate opportunities and listings.',
        backgroundColor: '#0f172a',
        textColor: '#ffffff',
        buttonColor: '#2f8fe5',
        buttonTextColor: '#ffffff',
      } as WidgetDataMap[T];
    case 'divider':
      return { color: '#d7dde3' } as WidgetDataMap[T];
    case 'spacer':
      return { height: 48 } as WidgetDataMap[T];
    case 'embed':
      return {
        title: 'Custom embed',
        html: '<div style="padding:24px;border:1px solid #d7dde3;border-radius:8px;text-align:center;color:#5e6973;">Paste your custom widget HTML here.</div>',
      } as WidgetDataMap[T];
    case 'columns':
      return {
        colCount: 2,
        spans: [6, 6],
        items: [[], []],
        backgroundType: 'none',
        backgroundColor: '',
        backgroundImage: '',
      } as unknown as WidgetDataMap[T];
    default:
      throw new Error(`Unknown widget type`);
  }
}

function createWidget<T extends WidgetType>(type: T): CanvasWidget {
  const catalogItem = widgetCatalog.find((item) => item.type === type);
  return {
    id: createWidgetId(type),
    type,
    label: catalogItem?.label ?? type,
    data: getDefaultWidgetData(type),
  } as CanvasWidget;
}

function escapeTemplateLiteral(value?: string) {
  if (!value) return '';
  return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function alignmentClass(alignment: Alignment) {
  if (alignment === 'left') return 'text-left';
  if (alignment === 'right') return 'text-right';
  return 'text-center';
}

function aspectClass(aspect: ImageWidgetData['aspect']) {
  if (aspect === 'square') return 'aspect-square';
  if (aspect === 'portrait') return 'aspect-[4/5]';
  return 'aspect-[16/9]';
}

function titleSizeClass(size: TitleWidgetData['size']) {
  if (size === 'sm') return 'text-2xl sm:text-3xl';
  if (size === 'md') return 'text-3xl sm:text-4xl';
  return 'text-4xl sm:text-5xl';
}

function imageArrayLiteral(values: string[]) {
  return `[${values.map((value) => `\`${escapeTemplateLiteral(value)}\``).join(', ')}]`;
}

function widgetMarkup(widget: CanvasWidget, isNested?: boolean): string {
  switch (widget.type) {
    case 'title':
      return `
      <section className="px-4 sm:px-6">
        <h1 className="${alignmentClass(widget.data.alignment)} ${titleSizeClass(widget.data.size)} font-semibold tracking-tight" style={{ color: '${escapeTemplateLiteral(widget.data.color)}' }}>
          ${escapeTemplateLiteral(widget.data.text)}
        </h1>
      </section>`;
    case 'text':
      return `
      <section className="px-4 sm:px-6">
        <p className="${alignmentClass(widget.data.alignment)} text-base leading-8 sm:text-lg" style={{ color: '${escapeTemplateLiteral(widget.data.color)}' }}>
          ${escapeTemplateLiteral(widget.data.text)}
        </p>
      </section>`;
    case 'image':
      return `
      <section className="px-4 sm:px-6">
        <div className="${aspectClass(widget.data.aspect)} overflow-hidden rounded-sm border border-slate-200 bg-slate-100">
          <img src="${escapeTemplateLiteral(widget.data.imageUrl)}" alt="${escapeTemplateLiteral(widget.data.alt)}" className="h-full w-full object-cover" />
        </div>
      </section>`;
    case 'gallery':
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
    case 'slideshow':
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
    case 'map':
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
    case 'leadForm':
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
    case 'divider':
      return `
      <section className="px-4 sm:px-6">
        <div className="h-px w-full" style={{ backgroundColor: '${escapeTemplateLiteral(widget.data.color)}' }} />
      </section>`;
    case 'spacer':
      return `
      <section className="px-4 sm:px-6">
        <div style={{ height: '${widget.data.height}px' }} />
      </section>`;
    case 'embed':
      return `
      <section className="px-4 sm:px-6">
        <div className="overflow-hidden rounded-sm border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">${escapeTemplateLiteral(widget.data.title)}</div>
          <div dangerouslySetInnerHTML={{ __html: \`${escapeTemplateLiteral(widget.data.html)}\` }} />
        </div>
      </section>`;
    case 'columns':
      return `
      <section className="px-4 sm:px-6">
        <div className={\`grid gap-4 md:gap-6 \${getResponsiveGridClass(widget.data.colCount)}\`}>
${widget.data.items.map((colItems, idx) => {
  const span = (widget.data.spans && widget.data.spans[idx]) || Math.floor(12 / widget.data.colCount);
  return `          <div className={\`flex flex-col gap-4 \${getSpanClass(span)}\`}>
${colItems.map(innerWidget => widgetMarkup(innerWidget, true)).join('\n')}
          </div>`;
}).join('\n')}
        </div>
      </section>`;
  }
}

function generateCodeString(widgets: CanvasWidget[], currentRealtorId: string) {
  const sections = widgets.map((widget) => widgetMarkup(widget)).join('\n');
  const REALTOR_ID = currentRealtorId || 'anonymous';
  const CRM_API_URL = process.env.NEXT_PUBLIC_CRM_URL || 'https://realty-crm-web.vercel.app';

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
  title, 
  description, 
  disclaimer, 
  buttonLabel, 
  backgroundColor, 
  textColor, 
  buttonColor, 
  buttonTextColor,
  isNested 
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
    setSubmitMessage('');

    try {
      const response = await fetch('${CRM_API_URL}/api/v1/add/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          realtorUserId: '${REALTOR_ID}',
          leadType: 'contact',
          sourceTemplate: 'flagship-v1',
          sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/',
          lead: {
            name: formState.name,
            email: formState.email,
            phone: formState.phone,
          },
          context: {
             userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
             referrer: typeof document !== 'undefined' ? document.referrer : ''
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to submit lead. Please try again.');

      setSubmitStatus('success');
      setSubmitMessage('Thanks! Your consultation request has been received.');
      setFormState({ name: '', email: '', phone: '' });
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={\`\${isNested ? 'py-2' : 'px-6 py-16 sm:px-12 md:py-24'}\`}>
      <div className={\`grid gap-12 rounded-2xl border border-slate-100 p-10 shadow-xl \${isNested ? 'grid-cols-1' : 'lg:grid-cols-[0.9fr_1.1fr]'}\`} style={{ backgroundColor, color: textColor }}>
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
                <input 
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-sky-500 text-slate-900 transition-all" 
                  placeholder="Your Name" 
                  required 
                  value={formState.name}
                  onChange={handleChange('name')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-sky-500 text-slate-900 transition-all" 
                  placeholder="email@example.com" 
                  required 
                  value={formState.email}
                  onChange={handleChange('email')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Phone</label>
                <input 
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-sky-500 text-slate-900 transition-all" 
                  placeholder="+1 (555) 000-0000" 
                  required 
                  value={formState.phone}
                  onChange={handleChange('phone')}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="mt-4 transition-all duration-300 flex w-full items-center justify-center rounded-lg px-6 py-4 text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
              style={{ backgroundColor: buttonColor, color: buttonTextColor }}
            >
              {isSubmitting ? 'Sending...' : buttonLabel}
            </button>
            {submitStatus === 'success' && (
              <p className="text-xs font-semibold text-emerald-500 text-center transition-opacity opacity-100">{submitMessage}</p>
            )}
            {submitStatus === 'error' && (
              <p className="text-xs font-semibold text-rose-500 text-center transition-opacity opacity-100">{submitMessage}</p>
            )}
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

function getResponsiveGridClass(colCount: number) {
  if (colCount === 1) return 'grid-cols-1';
  return 'grid-cols-1 lg:grid-cols-12';
}

function getSpanClass(span: number) {
  const spans: Record<number, string> = {
    1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4',
    5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 8: 'lg:col-span-8',
    9: 'lg:col-span-9', 10: 'lg:col-span-10', 11: 'lg:col-span-11', 12: 'lg:col-span-12',
  };
  return spans[span] || 'lg:col-span-6';
}

function widgetWrapper(children: ReactNode, isNested?: boolean, isMobileView?: boolean) {
  // If nested, we provide minimal vertical breathing room and no horizontal padding (as column has it).
  // Root level widgets get generous, airy spacing.
  return (
    <div className={isNested ? 'px-0 py-2' : (isMobileView ? 'px-4 py-8' : 'px-6 py-16 sm:px-12 md:py-20')}>
      {children}
    </div>
  );
}

function LeadFormFunctional({ 
  widget, 
  realtorId, 
  isNested, 
  isMobileView 
}: { 
  widget: CanvasWidget & { type: 'leadForm' }; 
  realtorId: string; 
  isNested?: boolean; 
  isMobileView?: boolean;
}) {
  const [formState, setFormState] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/v1/add/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          realtorUserId: realtorId,
          leadType: 'contact',
          sourceTemplate: 'flagship-v1-preview',
          sourcePage: typeof window !== 'undefined' ? window.location.href : 'preview',
          lead: {
            name: formState.name,
            email: formState.email,
            phone: formState.phone,
          },
          context: {
            preview: 'true',
            submittedAt: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) throw new Error('Submission failed. Please try again.');

      setSubmitStatus('success');
      setSubmitMessage('Successfully submitted! (Preview Mode)');
      setFormState({ name: '', email: '', phone: '' });
    } catch (err) {
      setSubmitStatus('error');
      setSubmitMessage(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-8 text-slate-900 shadow-inner">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className={`grid gap-5 ${isNested || isMobileView ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
          <div className={`${isNested || isMobileView ? '' : 'sm:col-span-2'}`}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
            <input 
              className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-sky-500 text-slate-900" 
              placeholder="Your Name" 
              required 
              value={formState.name}
              onChange={(e) => setFormState(s => ({ ...s, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-sky-500 text-slate-900" 
              placeholder="email@example.com" 
              required 
              value={formState.email}
              onChange={(e) => setFormState(s => ({ ...s, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Phone</label>
            <input 
              className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-sky-500 text-slate-900" 
              placeholder="+1 (555) 000-0000" 
              required 
              value={formState.phone}
              onChange={(e) => setFormState(s => ({ ...s, phone: e.target.value }))}
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="mt-4 transition-all duration-300 flex w-full items-center justify-center rounded-lg px-6 py-4 text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
          style={{ backgroundColor: widget.data.buttonColor, color: widget.data.buttonTextColor }}
        >
          {isSubmitting ? 'Sending...' : widget.data.buttonLabel}
        </button>
        {submitStatus === 'success' && (
          <p className="text-xs font-semibold text-emerald-500 text-center animate-in fade-in slide-in-from-top-1">{submitMessage}</p>
        )}
        {submitStatus === 'error' && (
          <p className="text-xs font-semibold text-rose-500 text-center animate-in fade-in slide-in-from-top-1">{submitMessage}</p>
        )}
        <p className="mt-6 text-[11px] leading-relaxed text-slate-400 text-center">{widget.data.disclaimer}</p>
      </form>
    </div>
  );
}

function renderWidget(
  widget: CanvasWidget,
  realtorId: string,
  onInlineUpdate?: (id: string, updater: (widget: CanvasWidget) => CanvasWidget) => void,
  isNested?: boolean,
  isMobileView?: boolean
) {
  switch (widget.type) {
    case 'title':
      return widgetWrapper(
        onInlineUpdate ? (
          <textarea
            value={widget.data.text}
            onChange={(event) =>
              onInlineUpdate(widget.id, (current) =>
                current.type !== 'title'
                  ? current
                  : { ...current, data: { ...current.data, text: event.target.value } }
              )
            }
            className={`${alignmentClass(widget.data.alignment)} ${isNested ? 'text-xl' : titleSizeClass(widget.data.size)} w-full resize-none overflow-hidden border-0 bg-transparent font-bold tracking-tight outline-none`}
            style={{ color: widget.data.color }}
            rows={2}
          />
        ) : (
          <h1
            className={`${alignmentClass(widget.data.alignment)} ${isNested ? 'text-xl' : titleSizeClass(widget.data.size)} font-bold tracking-tight leading-[1.15]`}
            style={{ color: widget.data.color }}
          >
            {widget.data.text}
          </h1>
        ),
        isNested,
        isMobileView
      );
    case 'text':
      return widgetWrapper(
        onInlineUpdate ? (
          <textarea
            value={widget.data.text}
            onChange={(event) =>
              onInlineUpdate(widget.id, (current) =>
                current.type !== 'text'
                  ? current
                  : { ...current, data: { ...current.data, text: event.target.value } }
              )
            }
            className={`${alignmentClass(widget.data.alignment)} min-h-[140px] w-full resize-y border-0 bg-transparent text-base leading-relaxed text-slate-600 outline-none sm:text-lg`}
            style={{ color: widget.data.color }}
          />
        ) : (
          <p
            className={`${alignmentClass(widget.data.alignment)} text-base leading-relaxed text-slate-600 sm:text-lg`}
            style={{ color: widget.data.color }}
          >
            {widget.data.text}
          </p>
        ),
        isNested,
        isMobileView
      );
    case 'image':
      return widgetWrapper(
        <div className={`${aspectClass(widget.data.aspect)} overflow-hidden rounded-xl shadow-md border border-slate-100 bg-slate-50 transition-transform duration-300 hover:scale-[1.01]`}>
          <img src={widget.data.imageUrl} alt={widget.data.alt} className="h-full w-full object-cover" />
        </div>,
        isNested,
        isMobileView
      );
    case 'gallery':
      return widgetWrapper(
        <div className={`grid gap-6 ${isMobileView ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {widget.data.images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="aspect-[4/3] overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <img src={image} alt={`Gallery image ${index + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>,
        isNested,
        isMobileView
      );
    case 'slideshow':
      return widgetWrapper(
        <div className="overflow-hidden rounded-sm border border-[#d8dde3] bg-white">
          <div className="border-b border-[#e2e6ea] px-5 py-3">
            {onInlineUpdate ? (
              <input
                value={widget.data.title}
                onChange={(e) => onInlineUpdate(widget.id, (c) => c.type === 'slideshow' ? { ...c, data: { ...c.data, title: e.target.value } } : c)}
                className="w-full bg-transparent text-sm font-semibold uppercase tracking-[0.24em] text-[#83919d] outline-none"
              />
            ) : (
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#83919d]">{widget.data.title}</p>
            )}
          </div>
          <div className={`grid gap-3 p-4 ${isMobileView ? 'grid-cols-1' : 'sm:grid-cols-3'}`}>
            {widget.data.images.map((image, index) => (
              <div key={`${image}-${index}`} className="aspect-[16/10] overflow-hidden rounded-sm bg-[#eef2f5]">
                <img src={image} alt={`Slide ${index + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>,
        isNested,
        isMobileView
      );
    case 'map':
      return widgetWrapper(
        <div className={`grid gap-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-md ${isMobileView || isNested ? 'grid-cols-1' : 'lg:grid-cols-[0.4fr_0.6fr]'}`}>
          <div className="flex flex-col justify-center space-y-4">
            {onInlineUpdate ? (
              <input
                value={widget.data.title}
                onChange={(e) => onInlineUpdate(widget.id, (c) => c.type === 'map' ? { ...c, data: { ...c.data, title: e.target.value } } : c)}
                className="w-full bg-transparent text-2xl font-bold text-slate-900 outline-none"
              />
            ) : (
              <h2 className="text-2xl font-bold text-slate-900">{widget.data.title}</h2>
            )}
            {onInlineUpdate ? (
              <textarea
                value={widget.data.address}
                onChange={(e) => onInlineUpdate(widget.id, (c) => c.type === 'map' ? { ...c, data: { ...c.data, address: e.target.value } } : c)}
                className="w-full resize-none bg-transparent text-base leading-relaxed text-slate-500 outline-none"
                rows={2}
              />
            ) : (
              <p className="text-base leading-relaxed text-slate-500">{widget.data.address}</p>
            )}
          </div>
          <div className="min-h-[320px] overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-inner">
            <iframe
              src={widget.data.embedUrl}
              loading="lazy"
              className="h-full min-h-[320px] w-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>,
        isNested,
        isMobileView
      );
    case 'leadForm':
      return widgetWrapper(
        <div className={`grid gap-12 rounded-2xl border border-slate-100 ${isMobileView ? 'p-6' : 'p-10 shadow-xl'} ${isMobileView || isNested ? 'grid-cols-1' : 'lg:grid-cols-[0.9fr_1.1fr]'}`} style={{ backgroundColor: widget.data.backgroundColor, color: widget.data.textColor }}>
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] opacity-60">Lead capture</p>
              {onInlineUpdate ? (
                <input
                  value={widget.data.title}
                  onChange={(e) => onInlineUpdate(widget.id, (c) => c.type === 'leadForm' ? { ...c, data: { ...c.data, title: e.target.value } } : c)}
                  className={`mt-4 w-full border-0 bg-transparent ${isNested || isMobileView ? 'text-2xl' : 'text-4xl'} font-bold tracking-tight outline-none`}
                  style={{ color: 'inherit' }}
                />
              ) : (
                <h2 className={`mt-4 ${isNested || isMobileView ? 'text-2xl' : 'text-4xl'} font-bold tracking-tight leading-tight`}>{widget.data.title}</h2>
              )}
            </div>
            {onInlineUpdate ? (
              <textarea
                value={widget.data.description}
                onChange={(e) => onInlineUpdate(widget.id, (c) => c.type === 'leadForm' ? { ...c, data: { ...c.data, description: e.target.value } } : c)}
                className="w-full border-0 bg-transparent text-lg leading-relaxed opacity-80 outline-none"
                style={{ color: 'inherit' }}
                rows={4}
              />
            ) : (
              <p className="text-lg leading-relaxed opacity-80">{widget.data.description}</p>
            )}
            <div className="pt-4 border-t border-current/10">
               <p className="text-xs font-medium opacity-50 uppercase tracking-widest">Powered by RealtyGenie CRM</p>
            </div>
          </div>
          {onInlineUpdate ? (
            <div className="rounded-xl bg-white p-8 text-slate-900 shadow-inner">
              <div className={`grid gap-5 ${isNested || isMobileView ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                <div className={`${isNested || isMobileView ? '' : 'sm:col-span-2'}`}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
                  <div className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm text-slate-400">Your Name</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email</label>
                  <div className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm text-slate-400">email@example.com</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Phone</label>
                  <div className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm text-slate-400">+1 (555) 000-0000</div>
                </div>
              </div>
              <button type="button" className="mt-8 transition-all duration-300 flex w-full items-center justify-center rounded-lg px-6 py-4 text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95" style={{ backgroundColor: widget.data.buttonColor, color: widget.data.buttonTextColor }}>
                {onInlineUpdate ? (
                  <input
                    value={widget.data.buttonLabel}
                    onChange={(e) => onInlineUpdate(widget.id, (c) => c.type === 'leadForm' ? { ...c, data: { ...c.data, buttonLabel: e.target.value } } : c)}
                    className="w-full bg-transparent text-center outline-none"
                    style={{ color: 'inherit' }}
                  />
                ) : (
                  widget.data.buttonLabel
                )}
              </button>
              {onInlineUpdate ? (
                <textarea
                  value={widget.data.disclaimer}
                  onChange={(e) => onInlineUpdate(widget.id, (c) => c.type === 'leadForm' ? { ...c, data: { ...c.data, disclaimer: e.target.value } } : c)}
                  className="mt-6 w-full resize-none border-0 bg-transparent text-[11px] leading-relaxed text-slate-400 outline-none"
                  rows={2}
                />
              ) : (
                <p className="mt-6 text-[11px] leading-relaxed text-slate-400 text-center">{widget.data.disclaimer}</p>
              )}
            </div>
          ) : (
             <LeadFormFunctional widget={widget as any} realtorId={realtorId} isNested={isNested} isMobileView={isMobileView} />
          )}
        </div>,
        isNested,
        isMobileView
      );
    case 'divider':
      return widgetWrapper(<div className="h-px w-full" style={{ backgroundColor: widget.data.color }} />);
    case 'spacer':
      return widgetWrapper(<div style={{ height: widget.data.height }} />);
    case 'embed':
      return widgetWrapper(
        <div className="overflow-hidden rounded-sm border border-[#d8dde3] bg-white p-4">
          {onInlineUpdate ? (
            <input
              value={widget.data.title}
              onChange={(e) => onInlineUpdate(widget.id, (c) => c.type === 'embed' ? { ...c, data: { ...c.data, title: e.target.value } } : c)}
              className="mb-3 w-full bg-transparent text-sm font-semibold uppercase tracking-[0.24em] text-[#83919d] outline-none"
            />
          ) : (
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#83919d]">{widget.data.title}</div>
          )}
          <div dangerouslySetInnerHTML={{ __html: widget.data.html }} />
        </div>
      );
  }
}

function LandingPagePreview({
  widgets,
  realtorId,
  isMobileView,
}: {
  widgets: CanvasWidget[];
  realtorId: string;
  isMobileView?: boolean;
}) {
  const renderPreviewWidget = (widget: CanvasWidget, isNested?: boolean) => {
    if (widget.type === 'columns') {
      const bgStyle: CSSProperties = {};
      const { backgroundType, backgroundColor, backgroundImage } = widget.data;

      if (backgroundType === 'image' && backgroundImage) {
        bgStyle.backgroundImage = `url(${backgroundImage})`;
        bgStyle.backgroundSize = 'cover';
        bgStyle.backgroundPosition = 'center';
      } else if (backgroundType === 'color' && backgroundColor) {
        bgStyle.backgroundColor = backgroundColor;
      }

      return (
        <div style={bgStyle} className={`${backgroundType !== 'none' ? 'rounded-xl overflow-hidden' : ''}`}>
          {widgetWrapper(
            <div className={`grid gap-6 md:gap-8 ${isMobileView ? 'grid-cols-1' : getResponsiveGridClass(widget.data.colCount)}`}>
              {widget.data.items.map((col, cIdx) => {
                const span = (widget.data.spans && widget.data.spans[cIdx]) || Math.floor(12 / widget.data.colCount);
                return (
                  <div key={cIdx} className={`flex flex-col gap-6 ${isMobileView ? 'col-span-1' : getSpanClass(span)}`}>
                    {col.map(inner => <div key={inner.id}>{renderPreviewWidget(inner, true)}</div>)}
                  </div>
                );
              })}
            </div>,
            isNested,
            isMobileView
          )}
        </div>
      );
    }
    return renderWidget(widget, realtorId, undefined, isNested, isMobileView);
  };

  return (
    <div className={`min-h-[600px] bg-white ${isMobileView ? '' : ''}`}>
      <div className="mx-auto w-full space-y-0">
        {widgets.map((widget) => (
          <div key={widget.id}>
            {renderPreviewWidget(widget, false)}
          </div>
        ))}
      </div>
    </div>
  );
}

function InputLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7a8791]">{children}</p>;
}

function SettingsPanel({
  widget,
  widgets,
  selectedWidgetId,
  onSelect,
  onUpdate,
}: {
  widget: CanvasWidget | null;
  widgets: CanvasWidget[];
  selectedWidgetId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updater: (widget: CanvasWidget) => CanvasWidget) => void;
}) {
  if (!widget) {
    return (
      <div className="rounded-md border border-[#ccd2d8] bg-white p-4 text-sm text-[#6b7680]">
        Select a widget on the canvas to edit text, colors, spacing, and other settings.
      </div>
    );
  }

  const renderSelector = (
    <div className="flex flex-wrap gap-2">
      {widgets.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            selectedWidgetId === item.id ? 'bg-[#2f8fe5] text-white' : 'bg-white text-[#59636c] hover:bg-[#f6f8fa]'
          }`}
        >
          {index + 1}. {item.label}
        </button>
      ))}
    </div>
  );

  if (widget.type === 'title') {
    return (
      <div className="space-y-4">
        {renderSelector}
        <div className="rounded-md border border-[#ccd2d8] bg-white p-4">
          <Input label="Heading" value={widget.data.text} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'title' ? current : { ...current, data: { ...current.data, text: event.target.value } })} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input type="color" label="Text color" value={widget.data.color || '#28323b'} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'title' ? current : { ...current, data: { ...current.data, color: event.target.value } })} className="h-10 cursor-pointer p-1" />
            <Input label="Size (`sm`, `md`, `lg`)" value={widget.data.size} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'title' ? current : { ...current, data: { ...current.data, size: (event.target.value || 'lg') as TitleWidgetData['size'] } })} />
          </div>
          <div className="mt-4">
            <InputLabel>Alignment</InputLabel>
            <div className="flex gap-2">
              {(['left', 'center', 'right'] as Alignment[]).map((alignment) => (
                <button
                  key={alignment}
                  type="button"
                  onClick={() => onUpdate(widget.id, (current) => current.type !== 'title' ? current : { ...current, data: { ...current.data, alignment } })}
                  className={`rounded-md px-3 py-2 text-sm ${widget.data.alignment === alignment ? 'bg-[#2f8fe5] text-white' : 'bg-[#eef2f5] text-[#55606a]'}`}
                >
                  {alignment}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (widget.type === 'text') {
    return (
      <div className="space-y-4">
        {renderSelector}
        <div className="rounded-md border border-[#ccd2d8] bg-white p-4">
          <Textarea label="Body copy" value={widget.data.text} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'text' ? current : { ...current, data: { ...current.data, text: event.target.value } })} className="min-h-[180px]" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input type="color" label="Text color" value={widget.data.color || '#5e6973'} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'text' ? current : { ...current, data: { ...current.data, color: event.target.value } })} className="h-10 cursor-pointer p-1" />
            <Input label="Alignment" value={widget.data.alignment} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'text' ? current : { ...current, data: { ...current.data, alignment: (event.target.value || 'center') as Alignment } })} />
          </div>
        </div>
      </div>
    );
  }

  if (widget.type === 'image') {
    return (
      <div className="space-y-4">
        {renderSelector}
        <div className="rounded-md border border-[#ccd2d8] bg-white p-4">
          <Input label="Image URL" value={widget.data.imageUrl} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'image' ? current : { ...current, data: { ...current.data, imageUrl: event.target.value } })} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Alt text" value={widget.data.alt} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'image' ? current : { ...current, data: { ...current.data, alt: event.target.value } })} />
            <Input label="Aspect (`wide`, `square`, `portrait`)" value={widget.data.aspect} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'image' ? current : { ...current, data: { ...current.data, aspect: (event.target.value || 'wide') as ImageWidgetData['aspect'] } })} />
          </div>
        </div>
      </div>
    );
  }

  if (widget.type === 'gallery' || widget.type === 'slideshow') {
    const titleField =
      widget.type === 'slideshow' ? (
        <Input
          label="Widget title"
          value={widget.data.title}
          onChange={(event) =>
            onUpdate(widget.id, (current) =>
              current.type !== 'slideshow'
                ? current
                : { ...current, data: { ...current.data, title: event.target.value } }
            )
          }
        />
      ) : null;

    return (
      <div className="space-y-4">
        {renderSelector}
        <div className="rounded-md border border-[#ccd2d8] bg-white p-4">
          {titleField}
          <Textarea
            label="Image URLs"
            value={widget.data.images.join('\n')}
            onChange={(event) =>
              onUpdate(widget.id, (current) =>
                current.type === 'gallery'
                  ? {
                      ...current,
                      data: {
                        ...current.data,
                        images: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean),
                      },
                    }
                  : current.type === 'slideshow'
                    ? {
                        ...current,
                        data: {
                          ...current.data,
                          images: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean),
                        },
                      }
                    : current
              )
            }
            className="min-h-[220px]"
          />
        </div>
      </div>
    );
  }

  if (widget.type === 'map') {
    return (
      <div className="space-y-4">
        {renderSelector}
        <div className="rounded-md border border-[#ccd2d8] bg-white p-4">
          <Input label="Title" value={widget.data.title} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'map' ? current : { ...current, data: { ...current.data, title: event.target.value } })} />
          <Textarea label="Address" value={widget.data.address} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'map' ? current : { ...current, data: { ...current.data, address: event.target.value } })} className="mt-4 min-h-[110px]" />
          <Input label="Embed URL" value={widget.data.embedUrl} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'map' ? current : { ...current, data: { ...current.data, embedUrl: event.target.value } })} className="mt-4" />
        </div>
      </div>
    );
  }

  if (widget.type === 'leadForm') {
    return (
      <div className="space-y-4">
        {renderSelector}
        <div className="rounded-md border border-[#ccd2d8] bg-white p-4">
          <Input label="Form title" value={widget.data.title} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'leadForm' ? current : { ...current, data: { ...current.data, title: event.target.value } })} />
          <Textarea label="Description" value={widget.data.description} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'leadForm' ? current : { ...current, data: { ...current.data, description: event.target.value } })} className="mt-4 min-h-[140px]" />
          <Input label="Button label" value={widget.data.buttonLabel} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'leadForm' ? current : { ...current, data: { ...current.data, buttonLabel: event.target.value } })} className="mt-4" />
          <Textarea label="Disclaimer" value={widget.data.disclaimer} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'leadForm' ? current : { ...current, data: { ...current.data, disclaimer: event.target.value } })} className="mt-4 min-h-[120px]" />
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Background Color</label>
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5 shadow-inner">
                  <input
                    type="color"
                    value={widget.data.backgroundColor || '#0f172a'}
                    onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'leadForm' ? current : { ...current, data: { ...current.data, backgroundColor: event.target.value } })}
                    className="absolute inset-0 h-[150%] w-[150%] -translate-x-[15%] -translate-y-[15%] cursor-pointer appearance-none border-0 p-0 bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  value={widget.data.backgroundColor || ''}
                  onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'leadForm' ? current : { ...current, data: { ...current.data, backgroundColor: event.target.value } })}
                  placeholder="#hex"
                  className="w-full bg-transparent text-sm font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Text Color</label>
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5 shadow-inner">
                  <input
                    type="color"
                    value={widget.data.textColor || '#ffffff'}
                    onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'leadForm' ? current : { ...current, data: { ...current.data, textColor: event.target.value } })}
                    className="absolute inset-0 h-[150%] w-[150%] -translate-x-[15%] -translate-y-[15%] cursor-pointer appearance-none border-0 p-0 bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  value={widget.data.textColor || ''}
                  onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'leadForm' ? current : { ...current, data: { ...current.data, textColor: event.target.value } })}
                  placeholder="#hex"
                  className="w-full bg-transparent text-sm font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Button Color</label>
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5 shadow-inner">
                  <input
                    type="color"
                    value={widget.data.buttonColor || '#2f8fe5'}
                    onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'leadForm' ? current : { ...current, data: { ...current.data, buttonColor: event.target.value } })}
                    className="absolute inset-0 h-[150%] w-[150%] -translate-x-[15%] -translate-y-[15%] cursor-pointer appearance-none border-0 p-0 bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  value={widget.data.buttonColor || ''}
                  onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'leadForm' ? current : { ...current, data: { ...current.data, buttonColor: event.target.value } })}
                  placeholder="#hex"
                  className="w-full bg-transparent text-sm font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Button Text Color</label>
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5 shadow-inner">
                  <input
                    type="color"
                    value={widget.data.buttonTextColor || '#ffffff'}
                    onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'leadForm' ? current : { ...current, data: { ...current.data, buttonTextColor: event.target.value } })}
                    className="absolute inset-0 h-[150%] w-[150%] -translate-x-[15%] -translate-y-[15%] cursor-pointer appearance-none border-0 p-0 bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  value={widget.data.buttonTextColor || ''}
                  onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'leadForm' ? current : { ...current, data: { ...current.data, buttonTextColor: event.target.value } })}
                  placeholder="#hex"
                  className="w-full bg-transparent text-sm font-medium outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (widget.type === 'divider') {
    return (
      <div className="space-y-4">
        {renderSelector}
        <div className="rounded-md border border-[#ccd2d8] bg-white p-4">
          <Input type="color" label="Divider color" value={widget.data.color || '#d7dde3'} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'divider' ? current : { ...current, data: { ...current.data, color: event.target.value } })} className="h-10 cursor-pointer p-1" />
        </div>
      </div>
    );
  }

  if (widget.type === 'spacer') {
    return (
      <div className="space-y-4">
        {renderSelector}
        <div className="rounded-md border border-[#ccd2d8] bg-white p-4">
          <Input label="Spacer height" type="number" value={String(widget.data.height)} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'spacer' ? current : { ...current, data: { ...current.data, height: Number(event.target.value) || 0 } })} />
        </div>
      </div>
    );
  }

  if (widget.type === 'columns') {
    return (
      <div className="space-y-4">
        {renderSelector}
        <div className="rounded-md border border-[#ccd2d8] bg-white p-4">
          <InputLabel>Columns count</InputLabel>
          <div className="mt-2 flex rounded-md border border-[#ccd2d8] bg-[#f8fafc] p-1">
            {[1, 2, 3, 4].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => {
                  onUpdate(widget.id, (current) => {
                    if (current.type !== 'columns') return current;
                    const numCount = count as 1 | 2 | 3 | 4;
                    const nextItems = [...current.data.items];
                    if (numCount > nextItems.length) {
                       while(nextItems.length < numCount) nextItems.push([]);
                    } else if (numCount < nextItems.length) {
                       const removed = nextItems.splice(numCount, nextItems.length - numCount);
                       removed.forEach(r => {
                          nextItems[numCount - 1] = [...nextItems[numCount - 1], ...r];
                       });
                    }
                    const equalSpan = Math.floor(12 / numCount);
                    const reminder = 12 % numCount;
                    const nextSpans = Array(numCount).fill(equalSpan);
                    if (reminder > 0) nextSpans[0] += reminder;
                    return { ...current, data: { ...current.data, colCount: numCount, items: nextItems, spans: nextSpans } };
                  });
                }}
                className={`flex-1 rounded-sm py-1.5 text-sm font-medium transition ${
                  widget.data.colCount === count
                    ? 'bg-white text-[#2f8fe5] shadow-sm'
                    : 'text-[#74808b] hover:text-[#434d56]'
                }`}
              >
                {count} col
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-[#f1f5f9] pt-6">
            <InputLabel>Column Widths</InputLabel>
            {widget.data.colCount === 2 ? (
              <div className="mt-4 px-2">
                <input
                  type="range"
                  min="1"
                  max="11"
                  step="1"
                  value={widget.data.spans ? widget.data.spans[0] : 6}
                  onChange={(e) => {
                    const span1 = parseInt(e.target.value, 10);
                    onUpdate(widget.id, (c) =>
                      c.type === 'columns' ? { ...c, data: { ...c.data, spans: [span1, 12 - span1] } } : c
                    );
                  }}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2f8fe5]"
                />
                <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>{widget.data.spans ? widget.data.spans[0] : 6}/12</span>
                  <span>{widget.data.spans ? widget.data.spans[1] : 6}/12</span>
                </div>
              </div>
            ) : widget.data.colCount > 1 ? (
              <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
                {(widget.data.spans || Array(widget.data.items.length).fill(Math.floor(12 / widget.data.items.length))).map((span, idx) => (
                  <div key={idx}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Col {idx + 1}</label>
                    <input
                      type="number"
                      min="1"
                      max={12 - (widget.data.colCount - 1)}
                      value={span}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                        onUpdate(widget.id, (c) => {
                          if (c.type !== 'columns') return c;
                          const nextSpans = [...c.data.spans];
                          nextSpans[idx] = val;
                          
                          // Recalculate others to fit in 12 if possible, or just clamp
                          let currentSum = nextSpans.reduce((a, b) => a + b, 0);
                          if (currentSum !== 12) {
                            // Simple logic: adjust the last one to fit if it's not the one we changed
                            const lastIdx = c.data.colCount - 1;
                            if (idx !== lastIdx) {
                               const otherSum = nextSpans.reduce((a, b, i) => i === lastIdx ? a : a + b, 0);
                               nextSpans[lastIdx] = Math.max(1, 12 - otherSum);
                            } else {
                               const otherSum = nextSpans.reduce((a, b, i) => i === 0 ? a : a + b, 0);
                               nextSpans[0] = Math.max(1, 12 - otherSum);
                            }
                          }
                          return { ...c, data: { ...c.data, spans: nextSpans } };
                        });
                      }}
                      className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-center font-semibold outline-none focus:border-[#2f8fe5]"
                    />
                  </div>
                ))}
              </div>
            ) : null}
            {widget.data.colCount > 1 && (
              <button
                type="button"
                onClick={() => {
                  const equalSpan = Math.floor(12 / widget.data.colCount);
                  const reminder = 12 % widget.data.colCount;
                  const nextSpans = Array(widget.data.colCount).fill(equalSpan);
                  if (reminder > 0) nextSpans[0] += reminder;
                  onUpdate(widget.id, (c) => c.type === 'columns' ? { ...c, data: { ...c.data, spans: nextSpans } } : c);
                }}
                className="mt-6 w-full text-[10px] font-bold uppercase tracking-widest text-[#2f8fe5] hover:underline"
              >
                Reset to Equal Widths
              </button>
            )}
          </div>

          <div className="mt-6 border-t border-[#f1f5f9] pt-6">
            <InputLabel>Section Background</InputLabel>
            <div className="mt-3 space-y-4">
              <div className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
                {(['none', 'color', 'image'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      onUpdate(widget.id, (c) =>
                        c.type === 'columns'
                          ? { ...c, data: { ...c.data, backgroundType: type } }
                          : c
                      );
                    }}
                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                      widget.data.backgroundType === type
                        ? 'bg-white text-sky-500 shadow-sm ring-1 ring-zinc-200/50'
                        : 'text-zinc-500 hover:text-zinc-700 hover:bg-white/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {widget.data.backgroundType === 'color' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Background Color</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-black/5 shadow-inner">
                      <input
                        type="color"
                        value={widget.data.backgroundColor || '#ffffff'}
                        onChange={(e) => onUpdate(widget.id, (c) => c.type === 'columns' ? { ...c, data: { ...c.data, backgroundColor: e.target.value } } : c)}
                        className="h-10 w-10 cursor-pointer appearance-none border-0 p-0 bg-transparent scale-150"
                      />
                    </div>
                    <input
                      type="text"
                      value={widget.data.backgroundColor || ''}
                      onChange={(e) => onUpdate(widget.id, (c) => c.type === 'columns' ? { ...c, data: { ...c.data, backgroundColor: e.target.value } } : c)}
                      placeholder="Hex code (e.g. #FFFFFF)"
                      className="w-full bg-transparent text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 placeholder:font-normal"
                    />
                  </div>
                </div>
              )}

              {widget.data.backgroundType === 'image' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Background Image URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={widget.data.backgroundImage || ''}
                      onChange={(e) => onUpdate(widget.id, (c) => c.type === 'columns' ? { ...c, data: { ...c.data, backgroundImage: e.target.value } } : c)}
                      placeholder="Image URL (e.g. https://...)"
                      className="w-full bg-transparent text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 placeholder:font-normal"
                    />
                  </div>
                  {widget.data.backgroundImage && (
                    <div className="mt-3 group relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                      <img src={widget.data.backgroundImage} alt="Background preview" className="h-24 w-full object-cover grayscale-[0.2] transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}
                </div>
              )}
              
              {widget.data.backgroundType === 'none' && (
                <div className="py-2 text-center text-[10px] font-medium text-zinc-400 italic">
                  No background currently selected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderSelector}
      <div className="rounded-md border border-[#ccd2d8] bg-white p-4">
        <Input label="Widget title" value={widget.data.title} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'embed' ? current : { ...current, data: { ...current.data, title: event.target.value } })} />
        <Textarea label="HTML" value={widget.data.html} onChange={(event) => onUpdate(widget.id, (current) => current.type !== 'embed' ? current : { ...current, data: { ...current.data, html: event.target.value } })} className="mt-4 min-h-[220px] font-mono text-xs" />
      </div>
    </div>
  );
}

function DropIndicator({ active, className = '' }: { active: boolean; className?: string }) {
  return (
    <div
      className={`rounded-full transition-all duration-200 ${className} ${
        active
          ? 'my-1 h-1 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
          : 'my-0.5 h-0.5 bg-transparent hover:bg-zinc-200'
      }`}
    />
  );
}

function ToolTile({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group flex h-auto w-full flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2.5 transition-all duration-200 lg:w-[60px] ${
        active
          ? 'border-sky-400/50 bg-sky-500/20 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
          : 'border-transparent bg-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center">{children}</span>
      <span className={`text-[9px] font-semibold uppercase tracking-[0.12em] transition-colors ${active ? 'text-sky-300' : 'text-zinc-500 group-hover:text-zinc-400'}`}>{label}</span>
    </button>
  );
}

function QuickWidgetControls({
  widget,
  onUpdate,
}: {
  widget: CanvasWidget;
  onUpdate: (id: string, updater: (widget: CanvasWidget) => CanvasWidget) => void;
}) {
  if (widget.type === 'image') {
    return (
      <div className="absolute left-4 top-4 z-10 w-[min(360px,calc(100%-2rem))] rounded-md border border-[#cfd5db] bg-white/96 p-3 shadow-lg backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a8791]">Quick Image Edit</p>
        <input
          value={widget.data.imageUrl}
          onChange={(event) =>
            onUpdate(widget.id, (current) =>
              current.type !== 'image'
                ? current
                : { ...current, data: { ...current.data, imageUrl: event.target.value } }
            )
          }
          placeholder="Paste image URL"
          className="mt-2 w-full rounded-md border border-[#d4dbe2] px-3 py-2 text-sm text-[#28323b] outline-none focus:border-[#6bb6ff]"
        />
      </div>
    );
  }

  if (widget.type === 'gallery' || widget.type === 'slideshow') {
    return (
      <div className="absolute left-4 top-4 z-10 w-[min(420px,calc(100%-2rem))] rounded-md border border-[#cfd5db] bg-white/96 p-3 shadow-lg backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a8791]">Quick Image URLs</p>
        <textarea
          value={widget.data.images.join('\n')}
          onChange={(event) =>
            onUpdate(widget.id, (current) =>
              current.type === 'gallery'
                ? {
                    ...current,
                    data: {
                      ...current.data,
                      images: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean),
                    },
                  }
                : current.type === 'slideshow'
                  ? {
                      ...current,
                      data: {
                        ...current.data,
                        images: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean),
                      },
                    }
                  : current
            )
          }
          placeholder="One image URL per line"
          className="mt-2 min-h-[112px] w-full rounded-md border border-[#d4dbe2] px-3 py-2 text-sm text-[#28323b] outline-none focus:border-[#6bb6ff]"
        />
      </div>
    );
  }

  if (widget.type === 'title') {
    return (
      <div className="absolute left-4 top-4 z-10 w-[min(360px,calc(100%-2rem))] rounded-md border border-[#cfd5db] bg-white/96 p-3 shadow-lg backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a8791]">Quick Title Edit</p>
        <input
          value={widget.data.text}
          onChange={(event) =>
            onUpdate(widget.id, (current) =>
              current.type !== 'title'
                ? current
                : { ...current, data: { ...current.data, text: event.target.value } }
            )
          }
          placeholder="Heading text"
          className="mt-2 w-full rounded-md border border-[#d4dbe2] px-3 py-2 text-sm text-[#28323b] outline-none focus:border-[#6bb6ff]"
        />
      </div>
    );
  }

  if (widget.type === 'text') {
    return (
      <div className="absolute left-4 top-4 z-10 w-[min(420px,calc(100%-2rem))] rounded-md border border-[#cfd5db] bg-white/96 p-3 shadow-lg backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a8791]">Quick Text Edit</p>
        <textarea
          value={widget.data.text}
          onChange={(event) =>
            onUpdate(widget.id, (current) =>
              current.type !== 'text'
                ? current
                : { ...current, data: { ...current.data, text: event.target.value } }
            )
          }
          placeholder="Body copy text"
          className="mt-2 min-h-[90px] w-full rounded-md border border-[#d4dbe2] px-3 py-2 text-sm text-[#28323b] outline-none focus:border-[#6bb6ff]"
        />
      </div>
    );
  }

  if (widget.type === 'leadForm') {
    return (
      <div className="absolute left-4 top-4 z-10 w-[min(420px,calc(100%-2rem))] rounded-md border border-[#cfd5db] bg-white/96 p-3 shadow-lg backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a8791]">Quick Form Edit</p>
        <input
          value={widget.data.title}
          onChange={(event) =>
            onUpdate(widget.id, (current) =>
              current.type !== 'leadForm'
                ? current
                : { ...current, data: { ...current.data, title: event.target.value } }
            )
          }
          placeholder="Form title"
          className="mt-2 w-full rounded-md border border-[#d4dbe2] px-3 py-2 text-sm text-[#28323b] outline-none focus:border-[#6bb6ff]"
        />
        <textarea
          value={widget.data.description}
          onChange={(event) =>
            onUpdate(widget.id, (current) =>
              current.type !== 'leadForm'
                ? current
                : { ...current, data: { ...current.data, description: event.target.value } }
            )
          }
          placeholder="Form description"
          className="mt-2 min-h-[72px] w-full rounded-md border border-[#d4dbe2] px-3 py-2 text-sm text-[#28323b] outline-none focus:border-[#6bb6ff]"
        />
        <input
          value={widget.data.buttonLabel}
          onChange={(event) =>
            onUpdate(widget.id, (current) =>
              current.type !== 'leadForm'
                ? current
                : { ...current, data: { ...current.data, buttonLabel: event.target.value } }
            )
          }
          placeholder="Button label"
          className="mt-2 w-full rounded-md border border-[#d4dbe2] px-3 py-2 text-sm text-[#28323b] outline-none focus:border-[#6bb6ff]"
        />
      </div>
    );
  }

  return null;
}

function DragHandleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className || "h-4 w-4"} stroke="currentColor" strokeWidth="1.8">
      <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className || "h-4 w-4"} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className || "h-4 w-4"} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 5v14M18 13l-6 6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DuplicateIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className || "h-4 w-4"} stroke="currentColor" strokeWidth="1.8">
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <path d="M5 15V7a2 2 0 0 1 2-2h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className || "h-4 w-4"} stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className || "h-4 w-4"} stroke="currentColor" strokeWidth="1.8">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeft({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className || "h-4 w-4"} stroke="currentColor" strokeWidth="2">
      <path d="m12 19-7-7 7-7M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className || "h-4 w-4"} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingPageGenerator() {
  const { user } = useAuthStore();
  const [realtorId, setRealtorId] = useState(user?.id ?? DEFAULT_REALTOR_ID);
  const [widgets, setWidgets] = useState<CanvasWidget[]>([
    {
      ...createWidget('columns'),
      data: {
        colCount: 1,
        items: [
          [
            createWidget('title'),
            createWidget('text'),
            createWidget('image'),
            createWidget('leadForm'),
          ]
        ]
      }
    } as any
  ]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('build');
  const [canvasView, setCanvasView] = useState<CanvasView>('builder');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);

  const generatedCode = useMemo(() => generateCodeString(widgets, realtorId), [widgets, realtorId]);
  const selectedWidget = widgets.find((widget) => widget.id === selectedWidgetId) ?? widgets[0] ?? null;

  const paletteGroups = useMemo(
    () => ({
      basic: widgetCatalog.filter((item) => item.group === 'basic'),
      structure: widgetCatalog.filter((item) => item.group === 'structure'),
    }),
    []
  );

  const addWidget = (type: WidgetType) => {
    let next = createWidget(type);
    if (type !== 'columns') {
       const wrapper = createWidget('columns');
       wrapper.data = {
         colCount: 1,
         items: [[next]]
       } as any;
       next = wrapper;
    }
    setWidgets((current) => [...current, next]);
    setSelectedWidgetId(next.id);
    setSidebarTab('settings');
  };

  const applyDrop = (payload: DragPayload, target: DropPosition) => {
    setWidgets((current) => {
      let droppedWidget: CanvasWidget;
      let removedFromRoot = false;
      let removedFromParentId: string | null = null;
      let removedFromColIndex = -1;
      let removedFromIndex = -1;

      if (payload.source === 'palette') {
        droppedWidget = createWidget(payload.widgetType);
      } else {
        const removedFromCurrent = [...current];
        const idx = removedFromCurrent.findIndex(w => w.id === payload.itemId);
        if (idx !== -1) {
           [droppedWidget] = removedFromCurrent.splice(idx, 1);
           current = removedFromCurrent; // update working root
           removedFromRoot = true;
           removedFromIndex = idx;
        } else {
           let found = false;
           current = current.map(widget => {
             if (!found && widget.type === 'columns') {
                const newItems = widget.data.items.map((col, cIdx) => {
                  const innerIdx = col.findIndex(c => c.id === payload.itemId);
                  if (innerIdx !== -1) {
                    const next = [...col];
                    [droppedWidget] = next.splice(innerIdx, 1);
                    removedFromParentId = widget.id;
                    removedFromColIndex = cIdx;
                    removedFromIndex = innerIdx;
                    found = true;
                    return next;
                  }
                  return col;
                });
                if (found) return { ...widget, data: { ...widget.data, items: newItems }} as CanvasWidget;
             }
             return widget;
           });
           if (!found) return current;
        }
      }

      const targetIsRoot = !target.parentId || target.parentId === 'root';
      const sameArray = payload.source === 'canvas' && (
        (targetIsRoot && removedFromRoot) || 
        (!targetIsRoot && target.parentId === removedFromParentId && target.colIndex === removedFromColIndex)
      );

      const finalIndex = sameArray && removedFromIndex < target.index ? target.index - 1 : target.index;

      if (targetIsRoot) {
         const next = [...current];
         next.splice(finalIndex, 0, droppedWidget!);
         return next;
      } else {
         return current.map(widget => {
            if (widget.id === target.parentId && widget.type === 'columns') {
               const newItems = [...widget.data.items];
               const colArr = [...newItems[target.colIndex || 0]];
               colArr.splice(finalIndex, 0, droppedWidget!);
               newItems[target.colIndex || 0] = colArr;
               return { ...widget, data: { ...widget.data, items: newItems }} as CanvasWidget;
            }
            return widget;
         });
      }
    });
  };

  const updateWidget = (id: string, updater: (widget: CanvasWidget) => CanvasWidget) => {
    setWidgets((current) =>
      current.map((widget) => {
        if (widget.id === id) return updater(widget);
        if (widget.type === 'columns') {
          let updated = false;
          const newItems = widget.data.items.map((col) =>
            col.map((child) => {
              if (child.id === id) {
                updated = true;
                return updater(child);
              }
              return child;
            })
          );
          if (updated) {
            return { ...widget, data: { ...widget.data, items: newItems } } as CanvasWidget;
          }
        }
        return widget;
      })
    );
  };

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    setWidgets((current) => {
      const moveInArray = (arr: CanvasWidget[]) => {
        const idx = arr.findIndex(w => w.id === id);
        if (idx === -1) return null;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= arr.length) return arr;
        const next = [...arr];
        const [moved] = next.splice(idx, 1);
        next.splice(targetIdx, 0, moved);
        return next;
      };

      const rootMoved = moveInArray(current);
      if (rootMoved) return rootMoved;

      return current.map(widget => {
        if (widget.type === 'columns') {
           const newItems = widget.data.items.map(col => {
             const colMoved = moveInArray(col);
             return colMoved ? colMoved : col;
           });
           return { ...widget, data: { ...widget.data, items: newItems }} as CanvasWidget;
        }
        return widget;
      });
    });
    setSelectedWidgetId(id);
  };

  const duplicateWidget = (id: string) => {
    let original: CanvasWidget | undefined;
    
    original = widgets.find(w => w.id === id);
    if (!original) {
      widgets.forEach(w => {
        if (w.type === 'columns') {
          w.data.items.forEach(col => {
            const found = col.find(c => c.id === id);
            if (found) original = found;
          });
        }
      });
    }

    if (!original) return;

    const clone = {
      ...original,
      id: createWidgetId(original.type),
      data: JSON.parse(JSON.stringify(original.data)) as typeof original.data,
    } as CanvasWidget;

    setWidgets((current) => {
      const rootIdx = current.findIndex((widget) => widget.id === id);
      if (rootIdx !== -1) {
        const next = [...current];
        next.splice(rootIdx + 1, 0, clone);
        return next;
      }
      return current.map(widget => {
        if (widget.type === 'columns') {
           const newItems = widget.data.items.map(col => {
              const idx = col.findIndex(c => c.id === id);
              if (idx !== -1) {
                 const next = [...col];
                 next.splice(idx + 1, 0, clone);
                 return next;
              }
              return col;
           });
           return { ...widget, data: { ...widget.data, items: newItems }} as CanvasWidget;
        }
        return widget;
      });
    });
    setSelectedWidgetId(clone.id);
  };

  const removeWidget = (id: string) => {
    setWidgets((current) => {
      const filtered = current.filter((widget) => widget.id !== id);
      if (filtered.length !== current.length) return filtered;
      
      return current.map(widget => {
        if (widget.type === 'columns') {
          const newItems = widget.data.items.map(col => col.filter(child => child.id !== id));
          return { ...widget, data: { ...widget.data, items: newItems }} as CanvasWidget;
        }
        return widget;
      });
    });
    setSelectedWidgetId((current) => (current === id ? null : current));
  };

  const handleDragStart = (payload: DragPayload) => (event: DragEvent<HTMLElement>) => {
    setDragPayload(payload);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
  };

  const handleDragEnd = () => {
    setDragPayload(null);
    setDropPosition(null);
  };
  const handleDragOver = (target: DropPosition) => (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    if (!dragPayload) return;

    // Restrict Root Drops: Only allow 'columns' widgets at the root level from the palette
    if (target.parentId === 'root' || !target.parentId) {
      if (dragPayload.source === 'palette' && dragPayload.widgetType !== 'columns') {
        event.dataTransfer.dropEffect = 'none';
        return;
      }
      // If moving from canvas, we only allow columns at root
      const draggedWidgetId = dragPayload.source === 'canvas' ? dragPayload.itemId : null;
      if (draggedWidgetId) {
        let draggedWidget: CanvasWidget | undefined;
        draggedWidget = widgets.find(w => w.id === draggedWidgetId);
        if (!draggedWidget) {
          widgets.forEach(w => {
            if (w.type === 'columns') {
              w.data.items.forEach(col => {
                const found = col.find(inner => inner.id === draggedWidgetId);
                if (found) draggedWidget = found;
              });
            }
          });
        }
        if (draggedWidget && draggedWidget.type !== 'columns' && (target.parentId === 'root' || !target.parentId)) {
           event.dataTransfer.dropEffect = 'none';
           return;
        }
      }
    }

    event.dataTransfer.dropEffect = 'move';
    setDropPosition(target);
  };

  const handleDrop = (target: DropPosition) => (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    let payload = dragPayload;
    if (!payload) {
      try {
        payload = JSON.parse(event.dataTransfer.getData('application/json')) as DragPayload;
      } catch {
        payload = null;
      }
    }
    if (!payload) return;
    applyDrop(payload, target);
    setDragPayload(null);
    setDropPosition(null);
  };

  const handleGenerate = () => {
    console.log('Generated!');
    console.log('Realtor ID:', realtorId);
    console.log(generatedCode);
  };

  const canvasStyle: CSSProperties = {
    backgroundImage:
      'linear-gradient(90deg, rgba(243,244,246,0.88), rgba(255,255,255,0.92)), radial-gradient(circle at top left, rgba(47,143,229,0.08), transparent 30%)',
  };

  const previewViewportClassName = previewDevice === 'mobile' ? 'max-w-[430px]' : 'max-w-5xl';

  const renderCanvasWidget = (widget: CanvasWidget, index: number, isLast: boolean, parentId: string | 'root', colIndex?: number) => {
    return (
      <div key={widget.id} className="space-y-3">
        <article
          onClick={(e) => {
            e.stopPropagation();
            setSelectedWidgetId(widget.id);
            setSidebarTab('settings');
          }}
          className={`relative group overflow-hidden rounded-lg border transition-all duration-200 ${
            selectedWidget?.id === widget.id
              ? 'border-sky-400 shadow-[0_0_0_1px_rgba(56,189,248,0.2),0_4px_12px_-2px_rgba(56,189,248,0.1)] ring-1 ring-sky-400/20'
              : 'border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
          } bg-white`}
        >
          {parentId === 'root' && (
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-3 py-2">
               <div className="flex items-center gap-2.5">
                 <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-200/60 text-[10px] font-bold text-zinc-500">
                   {index + 1}
                 </span>
                 <button
                   draggable
                   onDragStart={handleDragStart({ source: 'canvas', itemId: widget.id })}
                   onDragEnd={handleDragEnd}
                   type="button"
                   onClick={(event) => event.stopPropagation()}
                   className="cursor-grab text-zinc-400 transition hover:text-zinc-600 active:cursor-grabbing"
                   aria-label={`Drag handle for ${widget.label}`}
                 >
                   <DragHandleIcon className="h-3.5 w-3.5" />
                 </button>
                 <div>
                   <p className="text-[11px] font-semibold text-zinc-700">{widget.label}</p>
                 </div>
               </div>
               <div className="flex items-center gap-1">
                 <button
                   type="button"
                   onClick={(event) => {
                     event.stopPropagation();
                     moveWidget(widget.id, 'up');
                   }}
                   disabled={index === 0}
                   className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-30"
                 >
                   <ArrowUpIcon className="h-3.5 w-3.5" />
                 </button>
                 <button
                   type="button"
                   onClick={(event) => {
                     event.stopPropagation();
                     moveWidget(widget.id, 'down');
                   }}
                   disabled={isLast}
                   className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-30"
                 >
                   <ArrowDownIcon className="h-3.5 w-3.5" />
                 </button>
                 <button
                   type="button"
                   onClick={(event) => {
                     event.stopPropagation();
                     duplicateWidget(widget.id);
                   }}
                   className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                 >
                   <DuplicateIcon className="h-3.5 w-3.5" />
                 </button>
                 <button
                   type="button"
                   onClick={(event) => {
                     event.stopPropagation();
                     removeWidget(widget.id);
                   }}
                   className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                 >
                   <X className="h-3.5 w-3.5" />
                 </button>
               </div>
            </div>
          )}
          
          {parentId !== 'root' && (
            <div className="group/item absolute left-1.5 top-1.5 z-10 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
               <button
                 draggable
                 onDragStart={handleDragStart({ source: 'canvas', itemId: widget.id })}
                 onDragEnd={handleDragEnd}
                 type="button"
                 onClick={(event) => event.stopPropagation()}
                 className="flex h-6 w-6 cursor-grab items-center justify-center rounded-md bg-white text-zinc-400 shadow-sm ring-1 ring-zinc-200 transition hover:text-zinc-600 active:cursor-grabbing"
               >
                 <DragHandleIcon className="h-3 w-3" />
               </button>
               <button
                 type="button"
                 onClick={(event) => {
                   event.stopPropagation();
                   removeWidget(widget.id);
                 }}
                 className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-zinc-400 shadow-sm ring-1 ring-zinc-200 transition hover:bg-red-50 hover:text-red-500"
               >
                 <X className="h-3 w-3" />
               </button>
            </div>
          )}

          <div onClick={(event) => event.stopPropagation()} className={parentId !== 'root' ? 'p-1' : ''}>
            {widget.type === 'columns' ? (
              <div 
                 className={`grid gap-4 p-4 ${getResponsiveGridClass(widget.data.colCount)} ${widget.data.backgroundType === 'image' ? 'bg-cover bg-center min-h-[200px]' : ''}`} 
                 style={{
                   ...(widget.data.backgroundType === 'color' && widget.data.backgroundColor ? { backgroundColor: widget.data.backgroundColor } : {}),
                   ...(widget.data.backgroundType === 'image' && widget.data.backgroundImage ? { backgroundImage: `url(${widget.data.backgroundImage})` } : {}),
                 }}
              >
               {widget.data.items.map((colItems, cIdx) => {
                  const span = (widget.data.spans && widget.data.spans[cIdx]) || Math.floor(12 / widget.data.colCount);
                  return (
                    <div 
                      key={cIdx} 
                      className={`flex flex-col gap-3 min-h-[120px] rounded-sm border ${getSpanClass(span)} ${dropPosition?.parentId === widget.id && dropPosition?.colIndex === cIdx ? 'border-sky-300 bg-sky-50 outline-2 outline-sky-300' : 'border-dashed border-[#c8d0d8] bg-[#f8fafc]'} p-2 transition-all`}
                      onDragOver={handleDragOver({ parentId: widget.id, colIndex: cIdx, index: colItems.length })}
                      onDrop={(e) => {
                         e.preventDefault();
                         handleDrop({ parentId: widget.id, colIndex: cIdx, index: colItems.length })(e as any);
                      }}
                    >
                      {colItems.length === 0 ? (
                         <div className="flex-1 flex items-center justify-center text-xs text-[#92a0ab] pointer-events-none">
                            Drop widgets here
                         </div>
                      ) : null}

                      {colItems.map((innerWidget, iIdx) => (
                         <div key={innerWidget.id}>
                           <div 
                             onDragOver={(e) => { e.stopPropagation(); handleDragOver({ parentId: widget.id, colIndex: cIdx, index: iIdx })(e as any); }} 
                             onDrop={(e) => { e.stopPropagation(); handleDrop({ parentId: widget.id, colIndex: cIdx, index: iIdx })(e as any); }}
                           >
                             <DropIndicator active={dropPosition?.parentId === widget.id && dropPosition?.colIndex === cIdx && dropPosition?.index === iIdx} />
                           </div>
                           {renderCanvasWidget(innerWidget, iIdx, iIdx === colItems.length - 1, widget.id, cIdx)}
                         </div>
                      ))}
                      {colItems.length > 0 ? (
                           <div 
                             onDragOver={(e) => { e.stopPropagation(); handleDragOver({ parentId: widget.id, colIndex: cIdx, index: colItems.length })(e as any); }} 
                             onDrop={(e) => { e.stopPropagation(); handleDrop({ parentId: widget.id, colIndex: cIdx, index: colItems.length })(e as any); }}
                           >
                             <DropIndicator active={dropPosition?.parentId === widget.id && dropPosition?.colIndex === cIdx && dropPosition?.index === colItems.length} />
                           </div>
                      ) : null}
                    </div>
                 );
               })}
              </div>
            ) : (
              renderWidget(widget, realtorId || DEFAULT_REALTOR_ID, updateWidget, parentId !== 'root')
            )}
          </div>
        </article>

        {parentId === 'root' ? (
          <div onDragOver={handleDragOver({ parentId: 'root', index: index + 1 })} onDrop={handleDrop({ parentId: 'root', index: index + 1 })}>
            <DropIndicator active={dropPosition?.parentId === 'root' && dropPosition?.index === index + 1} />
          </div>
        ) : null}
      </div>
    );
  };

  return (
      <div className={`-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 ${canvasView === 'preview' ? '' : 'space-y-6 p-4 sm:p-6 lg:p-8'}`}>


      <div className={`overflow-hidden transition-all duration-500 ${canvasView === 'preview' ? 'rounded-none border-0' : 'rounded-2xl border border-zinc-200/80 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.25)]'} bg-zinc-50`}>
        <div className={`grid min-h-[calc(100vh-56px)] gap-0 transition-all duration-500 ${canvasView === 'preview' ? 'grid-cols-1' : 'lg:grid-cols-[72px_280px_minmax(0,1fr)] 2xl:grid-cols-[72px_300px_minmax(0,1fr)]'}`}>

          {canvasView !== 'preview' && (
            <aside className="border-b border-zinc-700/50 bg-zinc-800 px-2 py-3 lg:border-b-0 lg:border-r lg:border-zinc-700/40">
              <div className="grid grid-cols-3 gap-1 sm:grid-cols-6 lg:grid-cols-1 lg:gap-0.5">
                <ToolTile active={sidebarTab === 'build'} label="Build" onClick={() => setSidebarTab('build')}>{<Plus className="h-4 w-4" />}</ToolTile>
                <ToolTile active={sidebarTab === 'settings'} label="Settings" onClick={() => setSidebarTab('settings')}>{<EditIcon className="h-4 w-4" />}</ToolTile>
                <ToolTile active={sidebarTab === 'code'} label="Code" onClick={() => setSidebarTab('code')}>
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
                    <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </ToolTile>
                <div className="my-1 hidden h-px bg-zinc-700/40 lg:block" />
                <ToolTile active={false} label="Preview" onClick={() => setCanvasView('preview')}>{<EyeIcon />}</ToolTile>
                <ToolTile active={previewDevice === 'desktop'} label="Desktop" onClick={() => setPreviewDevice('desktop')}>{<MonitorIcon />}</ToolTile>
                <ToolTile active={previewDevice === 'mobile'} label="Mobile" onClick={() => setPreviewDevice('mobile')}>{<PhoneIcon />}</ToolTile>
              </div>
            </aside>
          )}

          {canvasView !== 'preview' && (
            <aside className="overflow-y-auto border-b border-zinc-200 bg-zinc-50 p-4 sm:p-5 lg:max-h-[calc(100vh-64px)] lg:border-b-0 lg:border-r">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold text-zinc-800">Page Builder</p>
                  <p className="text-[11px] text-zinc-400">Drag widgets to canvas</p>
                </div>
                <Button onClick={handleGenerate} className="bg-sky-500 text-white hover:bg-sky-600 shadow-sm" icon={<Sparkles className="h-3.5 w-3.5" />}>
                  Generate
                </Button>
              </div>
              <Input label="Realtor ID" value={realtorId} onChange={(event) => setRealtorId(event.target.value)} className="mb-5 border-zinc-200 bg-white text-sm" />

              {sidebarTab === 'build' ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Content</p>
                    <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
                      {paletteGroups.basic.map((item) => (
                        <button
                          key={item.type}
                          draggable
                          onDragStart={handleDragStart({ source: 'palette', widgetType: item.type })}
                          onDragEnd={handleDragEnd}
                          onClick={() => addWidget(item.type)}
                          type="button"
                          className="group/tile flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2 py-3.5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md active:scale-95"
                        >
                          <div className="flex h-8 w-8 items-center justify-center text-zinc-400 transition-colors group-hover/tile:text-sky-500">{item.icon}</div>
                          <p className="text-[10px] font-semibold text-zinc-500 transition-colors group-hover/tile:text-zinc-700">{item.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Layout</p>
                    <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
                      {paletteGroups.structure.map((item) => (
                        <button
                          key={item.type}
                          draggable
                          onDragStart={handleDragStart({ source: 'palette', widgetType: item.type })}
                          onDragEnd={handleDragEnd}
                          onClick={() => addWidget(item.type)}
                          type="button"
                          className="group/tile flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2 py-3.5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md active:scale-95"
                        >
                          <div className="flex h-8 w-8 items-center justify-center text-zinc-400 transition-colors group-hover/tile:text-sky-500">{item.icon}</div>
                          <p className="text-[10px] font-semibold text-zinc-500 transition-colors group-hover/tile:text-zinc-700">{item.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {sidebarTab === 'settings' ? (
                <SettingsPanel
                  widget={selectedWidget}
                  widgets={widgets}
                  selectedWidgetId={selectedWidget?.id ?? null}
                  onSelect={setSelectedWidgetId}
                  onUpdate={updateWidget}
                />
              ) : null}

              {sidebarTab === 'code' ? (
                <Textarea
                  readOnly
                  value={generatedCode}
                  className="min-h-[720px] border-[#ccd2d8] bg-white font-mono text-xs leading-6 text-[#22303c]"
                />
              ) : null}
            </aside>
          )}

          <main className="overflow-hidden bg-white">
            {canvasView === 'preview' ? (
              <div className="flex items-center justify-between border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 px-5 py-2.5 text-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCanvasView('builder')}
                    className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide transition-all hover:bg-white/20"
                  >
                    <ArrowLeft className="h-3 w-3" /> Exit
                  </button>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="flex items-center gap-0.5 rounded-lg bg-white/5 p-0.5">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${previewDevice === 'desktop' ? 'bg-sky-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                      aria-label="Desktop Preview"
                    >
                      <MonitorIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${previewDevice === 'mobile' ? 'bg-sky-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                      aria-label="Mobile Preview"
                    >
                      <PhoneIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="hidden text-[10px] font-medium text-zinc-500 sm:inline">
                    {previewDevice === 'mobile' ? '430px' : '1280px'}
                  </span>
                </div>
                <div className="hidden text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 sm:block">
                  Live Preview
                </div>
                <Button onClick={handleGenerate} className="bg-sky-500 text-[11px] font-bold shadow-sm hover:bg-sky-400">
                  Export Code
                </Button>
              </div>
            ) : (
              <div className="border-b border-zinc-200 bg-white px-4 py-2 sm:px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] font-medium">
                    <span className="rounded-md bg-sky-500 px-2 py-1 text-white">Build</span>
                    <span className="rounded-md px-2 py-1 text-zinc-400 hover:text-zinc-600 cursor-pointer transition">Design</span>
                    <span className="rounded-md px-2 py-1 text-zinc-400 hover:text-zinc-600 cursor-pointer transition">Pages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCanvasView('preview')}
                      className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-600 transition hover:bg-zinc-200"
                    >
                      <EyeIcon /> Preview
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className={`transition-all duration-700 ${canvasView === 'preview' ? 'bg-[#0f1115] min-h-[calc(100vh-140px)] flex items-center justify-center p-8' : 'bg-zinc-50 p-3 sm:p-5'}`}>
              <div
                className={`transition-all duration-700 ${
                  canvasView === 'preview'
                    ? 'w-full'
                    : 'min-h-full rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm'
                }`}
                style={canvasStyle}
              >
                <div className={`mx-auto transition-all duration-700 ease-in-out ${
                  previewDevice === 'mobile' && canvasView === 'preview'
                    ? 'relative max-w-[320px] sm:max-w-[360px] md:max-w-[400px]'
                    : previewViewportClassName
                }`}>
                  {previewDevice === 'mobile' && canvasView === 'preview' && (
                    <>
                      {/* Realistic 3D Side Buttons */}
                      <div className="absolute -left-[14px] top-24 h-8 w-[4px] rounded-l-md bg-gradient-to-r from-zinc-700 to-zinc-800 shadow-sm" />
                      <div className="absolute -left-[14px] top-40 h-14 w-[4px] rounded-l-md bg-gradient-to-r from-zinc-700 to-zinc-800 shadow-sm" />
                      <div className="absolute -left-[14px] top-60 h-14 w-[4px] rounded-l-md bg-gradient-to-r from-zinc-700 to-zinc-800 shadow-sm" />
                      <div className="absolute -right-[14px] top-44 h-20 w-[4px] rounded-r-md bg-gradient-to-l from-zinc-700 to-zinc-800 shadow-sm" />
                    </>
                  )}
                  
                  <div 
                    className={`relative mx-auto w-full transition-all duration-700 ${
                      previewDevice === 'mobile' && canvasView === 'preview'
                        ? 'aspect-[9/19.2] rounded-[3.8rem] border-[12px] border-zinc-900 bg-black shadow-[0_0_0_1px_#3f3f46,0_0_0_4px_#18181b,0_60px_120px_-20px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/10'
                        : 'overflow-hidden'
                    }`}
                  >
                    {previewDevice === 'mobile' && canvasView === 'preview' && (
                      <div className="absolute left-1/2 top-4 z-[60] h-6 w-24 -translate-x-1/2 rounded-full bg-black ring-1 ring-white/5 shadow-inner">
                        {/* Speaker Grill */}
                        <div className="absolute left-1/2 top-1/2 h-1 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-800/50" />
                        {/* Camera */}
                        <div className="absolute right-5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#0a0a0a] ring-1 ring-white/10">
                          <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20" />
                        </div>
                      </div>
                    )}

                    <div className={`${previewDevice === 'mobile' && canvasView === 'preview' ? 'relative h-full w-full overflow-y-auto overflow-x-hidden bg-white scroll-smooth custom-scrollbar' : ''}`}>
                      {previewDevice === 'mobile' && canvasView === 'preview' && (
                        /* Glass Reflection Overlay */
                        <div className="pointer-events-none absolute inset-0 z-[70] bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-30" />
                      )}
                      {previewDevice === 'mobile' && canvasView === 'preview' ? (
                        <div className="relative min-h-full">
                          {widgets.length === 0 ? (
                            <div className="flex h-full min-h-[600px] flex-col items-center justify-center p-10 text-center bg-zinc-50">
                              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white shadow-xl shadow-zinc-200/50 ring-1 ring-zinc-100">
                                <EyeIcon />
                              </div>
                              <h3 className="text-base font-bold text-zinc-800 uppercase tracking-wider">Canvas Empty</h3>
                              <p className="mt-2 text-xs leading-relaxed text-zinc-400 font-medium">Add widgets in the builder to see them appear on this device preview.</p>
                            </div>
                          ) : (
                            <LandingPagePreview widgets={widgets} realtorId={realtorId} isMobileView={true} />
                          )}
                        </div>
                      ) : canvasView === 'preview' ? (
                        widgets.length === 0 ? (
                          <div className="flex min-h-[520px] items-center justify-center px-6 text-center">
                            <div>
                              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                                <EyeIcon />
                              </div>
                              <p className="text-sm font-semibold text-zinc-700">Nothing to preview yet</p>
                              <p className="mt-1.5 text-xs text-zinc-400">Add widgets from the builder to see your site here.</p>
                            </div>
                          </div>
                        ) : (
                          <LandingPagePreview widgets={widgets} realtorId={realtorId} isMobileView={false} />
                        )
                      ) : (
                        <>
                          <div onDragOver={handleDragOver({ parentId: 'root', index: 0 })} onDrop={handleDrop({ parentId: 'root', index: 0 })}>
                            <DropIndicator active={dropPosition?.parentId === 'root' && dropPosition?.index === 0} />
                          </div>

                          <div className="mt-2 space-y-3">
                            {widgets.length === 0 ? (
                              <div
                                onDragOver={handleDragOver({ parentId: 'root', index: 0 })}
                                onDrop={handleDrop({ parentId: 'root', index: 0 })}
                                className="flex min-h-[480px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 px-6 text-center transition-colors hover:border-sky-200 hover:bg-sky-50/30"
                              >
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
                                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-zinc-400" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="5" width="8" height="14" rx="1" />
                                    <rect x="13" y="5" width="8" height="14" rx="1" />
                                  </svg>
                                </div>
                                <p className="text-sm font-semibold text-zinc-600">Drop a Columns layout to start</p>
                                <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-400">Drag a Columns widget from the sidebar, or click it to add one automatically.</p>
                              </div>
                            ) : (
                              widgets.map((widget, index) => renderCanvasWidget(widget, index, index === widgets.length - 1, 'root'))
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
