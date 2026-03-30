export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'portfolio' | 'business' | 'blog' | 'ecommerce' | 'landing';
  thumbnail: string;
  features: string[];
  formSchema: FormField[];
  deployType?: 'vercel' | 'github';
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'email' | 'url' | 'select' | 'image' | 'color' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  step?: number;
  accept?: string;
}

export interface Site {
  id: string;
  userId?: string;
  templateId: string;
  templateName: string;
  siteName: string;
  details: Record<string, string>;
  status: 'draft' | 'building' | 'deployed' | 'failed';
  previewUrl?: string;
  liveUrl?: string;
  deployError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BuildLog {
  id: string;
  siteId: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: string;
}

export interface User {
  _id: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface CreateSiteRequest {
  templateId: string;
  siteName: string;
  details: Record<string, string>;
}

export interface CreateSiteResponse {
  success: boolean;
  siteId: string;
  status: 'draft' | 'building' | 'deployed' | 'failed';
  previewUrl?: string;
  liveUrl?: string;
  error?: string;
  deployError?: string | null;
}

export interface SiteDocument extends Site {
  _id: string;
}
