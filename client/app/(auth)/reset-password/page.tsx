'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui/back-button';
import { toast } from 'sonner';
import { ArrowRight, Loader } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { ColorBendsSurface } from '@/components/ui/color-bends-surface';
import { FloatingLinesSurface } from '@/components/ui/floating-lines-surface';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordConfirmTouched, setPasswordConfirmTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');
  const inputClass =
    'h-12 bg-white/70 dark:bg-slate-900/70 border-white/30 dark:border-white/10 focus-visible:ring-emerald-500/40';

  useEffect(() => {
    if (!token || !userId) {
      setError('Invalid reset link');
      setIsValidating(false);
    } else {
      setIsValidating(false);
    }
  }, [token, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!token || !userId) {
      setError('Invalid reset link');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.resetPassword(userId, token, password, password);
      toast.success('Password reset successfully');
      router.push('/login');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to reset password';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
        <ColorBendsSurface className="opacity-45" />
        <FloatingLinesSurface className="opacity-25" />

        <Card className="w-full max-w-md p-8 backdrop-blur-xl bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 shadow-lg">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 px-4">
        <ColorBendsSurface className="opacity-45" />
        <FloatingLinesSurface className="opacity-25" />

        <Card className="w-full max-w-md p-8 backdrop-blur-xl bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 shadow-lg animate-fadeIn">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Invalid link</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link href="/forgot-password">
              <Button className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-lg hover:-translate-y-0.5 text-white">
                Request new link
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 px-4">
      <ColorBendsSurface className="opacity-50" />
      <FloatingLinesSurface className="opacity-25" />

      <Card className="w-full max-w-md p-8 backdrop-blur-xl bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 shadow-lg animate-fadeIn">
        <div className="mb-8">
          <BackButton href="/login" label="Back to Login" className="mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Create new password</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Enter your new password below
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Live secure reset
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              placeholder="••••••••"
              disabled={isLoading}
              required
              autoComplete="new-password"
              className={`${inputClass} ${passwordTouched && password.length < 8 ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">At least 8 characters</p>
            {passwordTouched && password.length < 8 && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <span>Password must be at least 8 characters</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
            <Input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              onBlur={() => setPasswordConfirmTouched(true)}
              placeholder="••••••••"
              disabled={isLoading}
              required
              autoComplete="new-password"
              className={`${inputClass} ${passwordConfirmTouched && password !== passwordConfirm ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {passwordConfirmTouched && password !== passwordConfirm && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <span>Passwords do not match</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || password.length < 8 || password !== passwordConfirm}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-lg hover:-translate-y-0.5 text-white"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                Reset password
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
