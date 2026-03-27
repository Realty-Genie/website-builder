'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.auth.login(email, password);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#141416] border-b border-[#2A2A2E] z-40">
        <div className="h-full px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/realty_crm.webp"
              alt="Site Logo"
              width={30}
              height={30}
              className='rounded-lg shadow-inner'
            />
          </Link>

          <div className="flex items-center gap-5">
            <span className="text-sm text-[#A1A1AA]">Don&apos;t have an account?</span>
            <Link
              href="/register"
              className="px-3 py-1.5 rounded-md text-sm bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <div className="pt-14 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 sm:p-8 bg-[#141416] border border-[#2A2A2E] rounded-lg">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-sm sm:text-base text-[#A1A1AA]">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#1C1C1F] border border-[#2A2A2E] rounded-lg text-white placeholder-[#71717A] focus:outline-none focus:border-[#6366F1]"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#1C1C1F] border border-[#2A2A2E] rounded-lg text-white placeholder-[#71717A] focus:outline-none focus:border-[#6366F1]"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 px-4 bg-linear-to-r from-[#6366F1] to-[#8B5CF6] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 sm:mt-6 text-center text-sm sm:text-base text-[#A1A1AA]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#6366F1] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
