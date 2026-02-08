'use client';

import { useState, useEffect } from 'react';
import { validateEmail, getEmailError } from '@/lib/validations';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui/back-button';
import { toast } from 'sonner';
import { ArrowRight, Loader, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { ColorBendsSurface } from '@/components/ui/color-bends-surface';
import { FloatingLinesSurface } from '@/components/ui/floating-lines-surface';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const inputClass = 'pl-11 h-12 backdrop-blur-sm bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400';
  const canSubmit = validateEmail(email) && password.length >= 8 && !isLoading;

  // Detect session expired redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('session') === 'expired') {
        setSessionExpired(true);
      }
    }
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = getEmailError(email);
    }
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call login from auth context
      await login(email, password);
      toast.success('Login successful!');
      
      // Don't set isLoading to false - let the redirect happen
      // Immediate redirect
      router.replace('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      const message = err.response?.data?.message || 'Invalid email or password';
      toast.error(message);
      setErrors({ password: message });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 px-4 py-12">
      <ColorBendsSurface className="opacity-50" />
      <FloatingLinesSurface className="opacity-30" />

      <Card className="w-full max-w-md p-8 backdrop-blur-xl bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 shadow-2xl animate-fadeIn">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton href="/" label="Back Home" />
        </div>

        {/* Logo and Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg mb-4 transform hover:scale-105 hover:-translate-y-1 transition-all">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Sign in to continue to Aurora Ops</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live secure login
          </div>
        </div>

        {sessionExpired && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-2 items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 dark:text-yellow-200">Your session has expired. Please log in again.</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                onBlur={() => setEmailTouched(true)}
                placeholder="you@example.com"
                disabled={isLoading}
                className={`${inputClass} ${emailTouched && !validateEmail(email) ? 'border-red-500 focus:ring-red-500' : ''}`}
                autoComplete="email"
                aria-invalid={emailTouched && !validateEmail(email)}
              />
              {emailTouched && !validateEmail(email) && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <span>{getEmailError(email)}</span>
                </div>
              )}
            </div>
            {errors.email && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link 
                href="/forgot-password" 
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                onBlur={() => setPasswordTouched(true)}
                placeholder="••••••••"
                disabled={isLoading}
                className={`${inputClass} pr-11 ${passwordTouched && (password.length < 8 || !password) ? 'border-red-500 focus:ring-red-500' : ''}`}
                autoComplete="current-password"
                aria-invalid={passwordTouched && (password.length < 8 || !password)}
              />
              {passwordTouched && (password.length < 8 || !password) && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <span>Password must be at least 8 characters</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200/70 dark:border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/80 dark:bg-gray-900/80 text-gray-500">New to Aurora Ops?</span>
          </div>
        </div>

        {/* Sign Up Link */}
        <Link href="/register">
          <Button
            variant="outline"
            className="w-full h-12 border-2 border-gray-200/70 dark:border-white/10 hover:border-blue-600 hover:text-blue-600 font-semibold transition-all duration-200"
          >
            Create an account
          </Button>
        </Link>
      </Card>
    </div>
  );
}
