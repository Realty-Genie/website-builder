import { NextRequest, NextResponse } from 'next/server';
import { templates, getTemplateById } from '@/lib/server/templates';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const template = getTemplateById(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, template });
  }

  return NextResponse.json({
    success: true,
    templates: templates.map(({ formSchema, ...template }) => template),
  });
}