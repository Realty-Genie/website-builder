/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Template, FormField, Site } from '@/types';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, ArrowRight, Loader2, Check, Upload, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DetailsFormProps {
  template: Template;
  editMode?: boolean;
  siteData?: Site;
}

export default function DetailsForm({ template, editMode = false, siteData }: DetailsFormProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<Record<string, File>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const [existingImages, setExistingImages] = useState<Record<string, string>>({});
  const [fileInputRefs, setFileInputRefs] = useState<Record<string, (el: HTMLInputElement | null) => void>>({});
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isBuilding, setIsBuilding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [customFields, setCustomFields] = useState<Array<{ id: string; label: string; value: string }>>([]);

  const fileInputElements = useRef<Record<string, HTMLInputElement>>({});

  useEffect(() => {
    const callbacks: Record<string, (el: HTMLInputElement | null) => void> = {};
    template.formSchema.forEach(f => {
      if (f.type === 'file') {
        callbacks[f.id] = (el: HTMLInputElement | null) => {
          if (el) fileInputElements.current[f.id] = el;
        };
      }
    });
    setFileInputRefs(callbacks);
  }, [template]);

  useEffect(() => {
    if (editMode && siteData?.details) {
      setFormData(siteData.details);
      setPreviewData(siteData.details);
      if (siteData.details.agentPhoto) {
        setExistingImages({ agentPhoto: siteData.details.agentPhoto });
      }
      const extras: Array<{ id: string; label: string; value: string }> = [];
      Object.entries(siteData.details).forEach(([k, v]) => {
        if (k.startsWith('custom_')) {
          extras.push({
            id: k,
            label: k.replace(/^custom_/, '').replace(/_/g, ' '),
            value: v,
          });
        }
      });
      if (extras.length) setCustomFields(extras);
    }
  }, [editMode, siteData]);

  /* ---------------- FIELD GROUPING (AUTO) ---------------- */
  const steps = useMemo(() => {
    if (editMode) {
      return [
        { label: 'All Fields', fields: template.formSchema },
      ];
    }
    const required = template.formSchema.filter(f => f.required);
    const optional = template.formSchema.filter(f => !f.required);

    return [
      { label: 'Required', fields: required },
      { label: 'Optional Details', fields: optional },
    ];
  }, [template, editMode]);

  const currentFields = steps[step]?.fields || [];

  /* ---------------- INPUT ---------------- */
  const handleChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));

    if (errors[id]) {
      const copy = { ...errors };
      delete copy[id];
      setErrors(copy);
    }
  };

  /* ---------------- FILE UPLOAD ---------------- */
  const handleFileChange = (id: string, file: File | null) => {
    if (file) {
      setImageFiles(prev => ({ ...prev, [id]: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => ({ ...prev, [id]: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      const newFiles = { ...imageFiles };
      delete newFiles[id];
      setImageFiles(newFiles);
      
      const newPreviews = { ...imagePreviews };
      delete newPreviews[id];
      setImagePreviews(newPreviews);
    }
  };

  const removeImage = (id: string) => {
    handleFileChange(id, null);
    if (editMode) {
      setExistingImages(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
    const el = fileInputElements.current[id];
    if (el) {
      el.value = '';
    }
  };

  /* ---------------- LIVE PREVIEW ---------------- */
  useEffect(() => {
    const t = setTimeout(() => setPreviewData(formData), 150);
    return () => clearTimeout(t);
  }, [formData]);

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    if (editMode) {
      return true;
    }

    const newErrors: Record<string, string> = {};

    currentFields.forEach(f => {
      if (f.type === 'file') {
        if (f.required && !imageFiles[f.id] && !existingImages[f.id]) {
          newErrors[f.id] = 'Please upload ' + f.label.toLowerCase();
        }
      } else if (f.required && !formData[f.id]?.trim()) {
        newErrors[f.id] = 'Please fill in ' + f.label.toLowerCase();
      }
    });

    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- CUSTOM FIELDS ---------------- */
  const slugify = (s: string) =>
    s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

  const addCustomField = () => {
    setCustomFields(prev => [
      ...prev,
      { id: `cf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, label: '', value: '' },
    ]);
  };

  const updateCustomField = (id: string, patch: Partial<{ label: string; value: string }>) => {
    setCustomFields(prev => prev.map(f => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  const buildPayload = (): Record<string, string> => {
    const payload: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (key.startsWith('custom_')) return;
      if (value && value.trim()) payload[key] = value;
    });
    customFields.forEach(({ label, value }) => {
      const slug = slugify(label);
      if (slug && value.trim()) {
        payload[`custom_${slug}`] = value;
      }
    });
    return payload;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    setIsBuilding(true);

    try {
      if (editMode && siteData) {
        const filteredData = buildPayload();
        await api.sites.update(siteData.id, filteredData, imageFiles.agentPhoto);
        addToast({
          type: 'success',
          message: 'Site updated! Changes will appear on your live site in a few minutes.',
        });
        router.push('/dashboard');
      } else {
        const filteredData = buildPayload();

        await api.sites.create(template.id, template.name, filteredData, imageFiles.agentPhoto);

        addToast({
          type: 'success',
          message: 'Site created! It will be live in a few minutes.',
        });

        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Build error:', err);
      setIsBuilding(false);
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong',
      });
    }
  };

  /* ---------------- BUTTON LABEL ---------------- */

  /* ---------------- FIELD RENDER ---------------- */
  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];

    if (field.type === 'textarea') {
      return (
        <Textarea
          key={field.id}
          label={field.label}
          value={value}
          onChange={(e) => handleChange(field.id, e.target.value)}
          error={error}
        />
      );
    }

    if (field.type === 'select') {
      return (
        <Select
          key={field.id}
          label={field.label}
          options={field.options || []}
          value={value}
          onChange={(e) => handleChange(field.id, e.target.value)}
          error={error}
        />
      );
    }

    if (field.type === 'file') {
      const preview = imagePreviews[field.id];
      const existingImage = existingImages[field.id];
      const callbackRef = fileInputRefs[field.id];
      
      return (
        <div key={field.id} className="col-span-full">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            {field.label}
          </label>
          {preview || existingImage ? (
            <div className="relative inline-block">
              <img 
                src={preview || existingImage} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded-lg border border-zinc-700"
              />
              <button
                type="button"
                onClick={() => removeImage(field.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputElements.current[field.id]?.click()}
              className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center cursor-pointer hover:border-zinc-500 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto text-zinc-500 mb-2" />
              <p className="text-sm text-zinc-400">Click to upload photo</p>
              <p className="text-xs text-zinc-600 mt-1">PNG, JPG, WebP up to 5MB</p>
            </div>
          )}
          <input
            ref={callbackRef}
            type="file"
            accept={field.accept || 'image/*'}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              handleFileChange(field.id, file);
            }}
          />
        </div>
      );
    }

    return (
      <Input
        key={field.id}
        label={field.label}
        value={value}
        onChange={(e) => handleChange(field.id, e.target.value)}
        error={error}
      />
    );
  };

  /* ---------------- BUILD STATE ---------------- */
  if (isBuilding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <div className="text-center">
          <h3 className="text-white font-medium text-lg">Creating your site...</h3>
          <p className="text-zinc-500 text-sm mt-2">You will be redirected to your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">

      {/* HEADER */}
      <div className="mb-4 sm:mb-6">
        <Link 
          href={editMode ? "/dashboard" : "/builder/templates"} 
          className="text-sm text-zinc-500 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{editMode ? 'My Sites' : 'Templates'}</span>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">

        {/* LEFT */}
        <div className="md:col-span-2 space-y-4 sm:space-y-6">

            <div>
            <h1 className="text-lg sm:text-xl font-semibold text-white">
              {editMode ? `Edit ${template.name}` : template.name}
            </h1>
            <p className="text-sm text-zinc-500">{editMode ? 'Update your site details' : 'Quick setup'}</p>
          </div>

          <Card className="p-4 sm:p-6 border border-zinc-800 bg-zinc-900/60">

            {/* STEP SWITCH */}
            <div className="flex gap-2 mb-4 sm:mb-6">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={`px-3 py-1 text-xs rounded-md ${
                    i === step ? 'bg-zinc-800 text-white' : 'text-zinc-500'
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>

            {/* FIELDS */}
            <div className="grid sm:grid-cols-2 gap-4">
              {currentFields.map(renderField)}
            </div>

            {/* CUSTOM FIELDS */}
            {step === steps.length - 1 && (
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-white">Custom Fields</h3>
                    <p className="text-xs text-zinc-500">Add any extra details you want shown</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={addCustomField}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    <Plus className="w-4 h-4" />
                    Add Field
                  </Button>
                </div>

                {customFields.length > 0 && (
                  <div className="space-y-2">
                    {customFields.map(f => (
                      <div key={f.id} className="grid sm:grid-cols-[1fr_1fr_auto] gap-2 items-start">
                        <Input
                          placeholder="Field name (e.g. Award)"
                          value={f.label}
                          onChange={e => updateCustomField(f.id, { label: e.target.value })}
                        />
                        <Input
                          placeholder="Value"
                          value={f.value}
                          onChange={e => updateCustomField(f.id, { value: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomField(f.id)}
                          className="h-10 w-10 flex items-center justify-center text-zinc-500 hover:text-red-400 border border-zinc-700 rounded-md"
                          aria-label="Remove field"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ACTION */}
            <div className="flex justify-between mt-4 sm:mt-6 pt-4 border-t border-zinc-800 gap-3">
              <Button
                variant="ghost"
                disabled={step === 0}
                onClick={() => setStep(s => s - 1)}
                className="text-zinc-400"
              >
                Back
              </Button>

              <Button
                onClick={() => {
                  if (!validate()) return;
                  step === steps.length - 1 ? handleSubmit() : setStep(s => s + 1);
                }}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                {step === steps.length - 1 ? (editMode ? 'Save & Rebuild' : 'Build Site') : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

          </Card>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="space-y-4 order-first md:order-last">

          <Card className="overflow-hidden border border-zinc-800 bg-zinc-900/60">
            <div className="aspect-4/3 relative">

              <img
                src={template.thumbnail}
                className="w-full h-full object-cover opacity-40"
              />

              {/* LIVE OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20 p-3 sm:p-4 flex flex-col justify-end">
                {imagePreviews.agentPhoto ? (
                  <img 
                    src={imagePreviews.agentPhoto} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded-full border-2 border-white/30 mb-2"
                  />
                ) : null}
                <h2 className="text-white text-base sm:text-lg font-semibold">
                  {previewData.companyName || 'Your Company'}
                </h2>
              </div>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
}