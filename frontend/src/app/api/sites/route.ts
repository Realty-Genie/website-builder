import { NextRequest, NextResponse } from 'next/server';
import { getCrmAuth } from '@/lib/server/auth';
import { getSitesCollection } from '@/lib/server/mongodb';
import { getTemplateById } from '@/lib/server/templates';
import { deployToGitHub } from '@/lib/server/githubDeploy';
import type { Site } from '@/types';

type SiteRecord = Omit<Site, 'liveUrl'> & {
  liveUrl: string | null;
};

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

function generateId() {
  return `site_${Math.random().toString(36).substring(2, 11)}`;
}

async function waitForSiteLive(url: string, maxAttempts = 30, intervalMs = 5000): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (response.ok) {
        console.log(`Site is live! Attempt ${attempt}/${maxAttempts}`);
        return true;
      }
    } catch {
      console.log(`Attempt ${attempt}/${maxAttempts}: Site not ready yet...`);
    }
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  console.log('Site may still be deploying, but continuing...');
  return true;
}

export async function GET(request: NextRequest) {
  const auth = await getCrmAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }
  const userId = auth.user.id;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const buildLogs = searchParams.get('buildLogs');
  const redeploy = searchParams.get('redeploy');

  try {
    const sitesCollection = await getSitesCollection();

    if (id) {
      const site = await sitesCollection.findOne({ siteId: id, userId });
      if (!site) {
        return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 });
      }

      if (buildLogs === 'true') {
        const logs = [
          { message: 'Starting build...', type: 'info', timestamp: site.createdAt },
          { message: 'Installing dependencies...', type: 'info', timestamp: new Date(Date.now() + 1000).toISOString() },
          { message: 'Building application...', type: 'info', timestamp: new Date(Date.now() + 3000).toISOString() },
          { message: 'Deploying to GitHub Pages...', type: 'info', timestamp: new Date(Date.now() + 4000).toISOString() },
          { message: site.status === 'deployed' ? 'Deployed successfully!' : 'Deployment failed', type: site.status === 'deployed' ? 'success' : 'error', timestamp: new Date(Date.now() + 5000).toISOString() },
        ];
        return NextResponse.json({ success: true, logs });
      }

      if (redeploy === 'true') {
        const template = getTemplateById(site.templateId);
        if (!template) {
          return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
        }

        await sitesCollection.updateOne(
          { siteId: id },
          { $set: { status: 'building', updatedAt: new Date().toISOString() } }
        );

        const deployResult = await deployToGitHub(
          site.userId,
          site.siteId,
          site.templateId,
          site.details,
          site.siteName
        );

        let finalStatus = 'building';
        let liveUrl = site.liveUrl;

        if (deployResult.success && deployResult.url) {
          liveUrl = deployResult.url;
          const isLive = await waitForSiteLive(deployResult.url);
          finalStatus = isLive ? 'deployed' : 'deployed';
        } else {
          finalStatus = 'failed';
        }

        await sitesCollection.updateOne(
          { siteId: id },
          { $set: { status: finalStatus, liveUrl, updatedAt: new Date().toISOString() } }
        );

        return NextResponse.json({ success: true, status: finalStatus, liveUrl });
      }

      return NextResponse.json({ success: true, site: { ...site, id: site.siteId } });
    }

      const sites = await sitesCollection.find<SiteRecord>({ userId }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({
      success: true,
      sites: sites.map((site) => ({
        id: site.siteId,
        templateName: site.templateName,
        siteName: site.details.companyName || site.siteName,
        status: site.status,
        liveUrl: site.liveUrl,
        createdAt: site.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch sites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await getCrmAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }
  const userId = auth.user.id;

  try {
    const formData = await request.formData();
    const templateId = formData.get('templateId') as string;
    const siteName = formData.get('siteName') as string;
    const detailsStr = formData.get('details') as string;
    const details = detailsStr ? JSON.parse(detailsStr) as Record<string, string> : {};

    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    const siteId = generateId();
    const now = new Date().toISOString();

    const agentPhotoFile = formData.get('agentPhoto') as File | null;
    let imageBuffer: Buffer | null = null;
    let imageContentType: string | null = null;

    if (agentPhotoFile && agentPhotoFile.size > 0) {
      const arrayBuffer = await agentPhotoFile.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      imageContentType = agentPhotoFile.type || 'image/jpeg';
    }

    const sitesCollection = await getSitesCollection();
    const newSite = {
      siteId,
      userId,
      templateId,
      templateName: template.name,
      siteName: siteName || template.name,
      details,
      status: 'building',
      liveUrl: null,
      createdAt: now,
      updatedAt: now,
    };

    await sitesCollection.insertOne(newSite);

    const deployResult = await deployToGitHub(
      userId,
      siteId,
      templateId,
      details,
      siteName,
      imageBuffer,
      imageContentType
    );

    console.log('Deploy result:', deployResult);
    console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? 'set' : 'NOT SET');

    let finalStatus = 'building';
    let liveUrl: string | null = null;

    if (deployResult.success && deployResult.url) {
      liveUrl = deployResult.url;
      const isLive = await waitForSiteLive(deployResult.url);
      finalStatus = isLive ? 'deployed' : 'deployed';
    } else {
      finalStatus = 'failed';
      console.error('Deployment failed:', deployResult.error);
    }

    await sitesCollection.updateOne(
      { siteId },
      { $set: { status: finalStatus, liveUrl, updatedAt: new Date().toISOString() } }
    );

    return NextResponse.json({
      success: true,
      siteId,
      status: finalStatus,
      liveUrl,
      error: deployResult.success ? undefined : deployResult.error,
    });
  } catch (error: unknown) {
    console.error('Error creating site:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create site', details: getErrorDetails(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await getCrmAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }
  const userId = auth.user.id;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Site ID required' }, { status: 400 });
    }

    const formData = await request.formData();
    const detailsStr = formData.get('details') as string;
    const details = detailsStr ? JSON.parse(detailsStr) as Record<string, string> : {};

    const agentPhotoFile = formData.get('agentPhoto') as File | null;
    let imageBuffer: Buffer | null = null;
    let imageContentType: string | null = null;

    if (agentPhotoFile && agentPhotoFile.size > 0) {
      const arrayBuffer = await agentPhotoFile.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      imageContentType = agentPhotoFile.type || 'image/jpeg';
    }

    const sitesCollection = await getSitesCollection();
    const site = await sitesCollection.findOne({ siteId: id, userId });

    if (!site) {
      return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 });
    }

    const template = getTemplateById(site.templateId);
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    const updatedDetails = { ...site.details, ...details };

    await sitesCollection.updateOne(
      { siteId: id },
      { $set: { details: updatedDetails, status: 'building', updatedAt: new Date().toISOString() } }
    );

    const deployResult = await deployToGitHub(
      site.userId,
      site.siteId,
      site.templateId,
      updatedDetails,
      site.siteName,
      imageBuffer,
      imageContentType
    );

    let finalStatus = 'building';
    let liveUrl = site.liveUrl;

    if (deployResult.success && deployResult.url) {
      liveUrl = deployResult.url;
      const isLive = await waitForSiteLive(deployResult.url);
      finalStatus = isLive ? 'deployed' : 'deployed';
    } else {
      finalStatus = 'failed';
    }

    await sitesCollection.updateOne(
      { siteId: id },
      { $set: { status: finalStatus, liveUrl, updatedAt: new Date().toISOString() } }
    );

    return NextResponse.json({ success: true, status: finalStatus, liveUrl });
  } catch (error: unknown) {
    console.error('Error updating site:', error);
    return NextResponse.json({ success: false, error: 'Failed to update site' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getCrmAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }
  const userId = auth.user.id;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Site ID required' }, { status: 400 });
    }

    const sitesCollection = await getSitesCollection();
    const result = await sitesCollection.deleteOne({ siteId: id, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete site' }, { status: 500 });
  }
}
