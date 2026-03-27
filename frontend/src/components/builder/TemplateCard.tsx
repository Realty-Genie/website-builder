'use client'

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Template } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

interface TemplateCardProps {
  template: Template
}

export default function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="group h-full flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40">

      {/* IMAGE */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={template.thumbnail}
          alt={template.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-5">

        {/* TEXT BLOCK */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-indigo-400 transition">
            {template.name}
          </h3>

          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* FEATURES */}
        <div className="flex flex-wrap gap-2 mt-3">
          {template.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="text-xs px-2.5 py-1 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 backdrop-blur"
            >
              {feature}
            </span>
          ))}

          {template.features.length > 3 && (
            <span className="text-xs px-2.5 py-1 rounded-md bg-zinc-800/60 text-zinc-500 border border-zinc-700/50">
              +{template.features.length - 3}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-4">
          <Link href={`/builder/details/${template.id}`}>
            <Button className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-all">
              Use Template
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

      </div>
    </Card>
  )
}