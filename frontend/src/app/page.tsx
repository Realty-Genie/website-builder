'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';

export default function Home() {
  const { isLoading, isAuthenticated, hasPro, authError, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]" />
      </div>
    );
  }

  const headline = isAuthenticated
    ? hasPro
      ? `Welcome${user?.firstName ? `, ${user.firstName}` : ''}`
      : 'Pro Subscription Required'
    : 'CRM Authentication Required';

  const description = isAuthenticated
    ? hasPro
      ? 'Your CRM session is active and your Pro access is verified.'
      : authError || 'Your CRM account is signed in, but this app requires an active Pro subscription.'
    : authError || 'Sign in through your CRM first, then open this app from that session.';

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
        <div className="w-full rounded-2xl border border-[#2A2A2E] bg-[#141416] p-8 shadow-2xl shadow-black/30">
          <div className="mb-6 flex items-center gap-3">
            <img
              src="/realty_crm.webp"
              alt="RealtyBuilder"
              width={40}
              height={40}
              className="rounded-xl shadow-inner"
            />
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#71717A]">RealtyBuilder</p>
              <h1 className="text-2xl font-semibold">{headline}</h1>
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-[#A1A1AA]">{description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {isAuthenticated && hasPro ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-[#6366F1] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Open Dashboard
              </Link>
            ) : (
              <span className="rounded-lg border border-[#2A2A2E] px-4 py-2.5 text-sm text-[#A1A1AA]">
                Access is managed by your CRM session
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
