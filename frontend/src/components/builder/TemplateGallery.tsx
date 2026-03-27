'use client';

import { useState, useMemo, useEffect } from 'react';
import { templates } from '@/data/templates';
import TemplateCard from './TemplateCard';
import Input from '@/components/ui/Input';
import { Search } from 'lucide-react';

const TemplateGallery = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return templates.filter((template) =>
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.features.some((f) => f.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Ctrl + K focus shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('template-search')?.focus();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Templates
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Start with a template and customize
          </p>
        </div>

        {/* MINIMAL SEARCH */}
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />

          <Input
            id="template-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 pr-16 bg-white border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:ring-0 focus:border-zinc-700 w-full"
          />

          {/* Ctrl + K hint - hide on mobile */}
          <div className="hidden sm:block absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 border border-zinc-700 px-1.5 py-0.5 rounded">
            Ctrl K
          </div>
        </div>

      </div>

      {/* GRID */}
      {filteredTemplates.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 text-sm">
          No templates found
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;