'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ColorBendsSurface } from '@/components/ui/color-bends-surface';
import { FloatingLinesSurface } from '@/components/ui/floating-lines-surface';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const inputClass =
    'h-12 bg-white/70 dark:bg-slate-900/70 border-white/30 dark:border-white/10 focus-visible:ring-emerald-500/40';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Check your email for password reset instructions');
        setEmail('');
      } else {
        setMessage(data.message || 'Failed to process request');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 px-4">
      <ColorBendsSurface className="opacity-45" />
      <FloatingLinesSurface className="opacity-25" />
      <Card className="w-full max-w-md p-8 backdrop-blur-xl bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 shadow-2xl animate-fadeIn">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
          <p className="text-gray-600 dark:text-gray-400">Enter your email to receive password reset instructions</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Live secure recovery
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className={inputClass}
            />
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('Check your email')
                ? 'bg-green-50/80 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                : 'bg-red-50/80 text-red-800 dark:bg-red-900/40 dark:text-red-200'
            }`}>
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-center">
          <Link
            href="/login"
            className="block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to Login
          </Link>
          <Link
            href="/register"
            className="block text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Create new account
          </Link>
        </div>
      </Card>
    </div>
  );
}
