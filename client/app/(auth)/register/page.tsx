'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui/back-button';
import { toast } from 'sonner';
import { ArrowRight, Loader, Eye, EyeOff, Mail, Lock, User, AlertCircle, Check, X } from 'lucide-react';
import { ColorBendsSurface } from '@/components/ui/color-bends-surface';
import { FloatingLinesSurface } from '@/components/ui/floating-lines-surface';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { register } = useAuth();
  const inputClass = 'pl-11 h-12 backdrop-blur-sm bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400';

  const validatePassword = (password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(formData.password);
  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!allRequirementsMet) {
      newErrors.password = 'Password does not meet all requirements';
    }

    // Password confirmation validation
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Please confirm your password';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user types
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      await register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.passwordConfirm
      );

      toast.success('Account created successfully!');
      // Send user to organization creation step
      router.push('/onboarding');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Registration failed';
      setErrors({ email: message });
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 px-4 py-12">
      <ColorBendsSurface className="opacity-50" />
      <FloatingLinesSurface className="opacity-30" />

      <Card className="w-full max-w-lg p-8 backdrop-blur-xl bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 shadow-2xl animate-fadeIn">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton href="/login" label="Back to Login" />
        </div>

        {/* Logo and Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg mb-4 transform hover:scale-105 hover:-translate-y-1 transition-all">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create your account
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Join Aurora Ops and start managing projects</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live account protection
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                First name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('firstName')}
                  placeholder="John"
                  disabled={isLoading}
                  className={`${inputClass} ${errors.firstName && touched.firstName ? 'border-red-500' : ''}`}
                  aria-invalid={Boolean(errors.firstName && touched.firstName)}
                />
              </div>
              {errors.firstName && touched.firstName && (
                <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.firstName}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Last name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('lastName')}
                  placeholder="Doe"
                  disabled={isLoading}
                  className={`${inputClass} ${errors.lastName && touched.lastName ? 'border-red-500' : ''}`}
                  aria-invalid={Boolean(errors.lastName && touched.lastName)}
                />
              </div>
              {errors.lastName && touched.lastName && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.lastName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                disabled={isLoading}
                className={`${inputClass} ${errors.email && touched.email ? 'border-red-500' : ''}`}
                aria-invalid={Boolean(errors.email && touched.email)}
              />
            </div>
            {errors.email && touched.email && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                disabled={isLoading}
                className={`${inputClass} pr-11 ${errors.password && touched.password ? 'border-red-500' : ''}`}
                aria-invalid={Boolean(errors.password && touched.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Requirements */}
            {formData.password && (
              <div className="mt-3 p-3 bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-lg space-y-2 backdrop-blur-sm">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Password must contain:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center gap-1 text-xs ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordRequirements.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordRequirements.hasUpperCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordRequirements.hasLowerCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordRequirements.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Number</span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs col-span-2 ${passwordRequirements.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordRequirements.hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Special character (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="passwordConfirm"
                name="passwordConfirm"
                type={showPasswordConfirm ? 'text' : 'password'}
                value={formData.passwordConfirm}
                onChange={handleChange}
                onBlur={() => handleBlur('passwordConfirm')}
                placeholder="••••••••"
                disabled={isLoading}
                className={`${inputClass} pr-11 ${errors.passwordConfirm && touched.passwordConfirm ? 'border-red-500' : ''}`}
                aria-invalid={Boolean(errors.passwordConfirm && touched.passwordConfirm)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.passwordConfirm && touched.passwordConfirm && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.passwordConfirm}</span>
              </div>
            )}
            {formData.passwordConfirm && formData.password === formData.passwordConfirm && (
              <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                <Check className="w-4 h-4" />
                <span>Passwords match</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !allRequirementsMet}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline dark:text-blue-400">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline dark:text-blue-400">Privacy Policy</a>
          </p>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200/70 dark:border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/80 dark:bg-gray-900/80 text-gray-500">Already have an account?</span>
          </div>
        </div>

        {/* Sign In Link */}
        <Link href="/login">
          <Button
            variant="outline"
            className="w-full h-12 border-2 border-gray-200/70 dark:border-white/10 hover:border-blue-600 hover:text-blue-600 font-semibold transition-all duration-200"
          >
            Sign in instead
          </Button>
        </Link>
      </Card>
    </div>
  );
}
