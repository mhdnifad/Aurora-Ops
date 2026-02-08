'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useOrganization } from '@/lib/organization-context';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowRight, Loader, Building2, Check, Sparkles, Users, Rocket } from 'lucide-react';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setCurrentOrganization } = useOrganization();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const inputClass = 'h-12 text-base backdrop-blur-sm bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400';
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    if (!isAuthenticated) return;
    e.preventDefault();
    setError('');

    if (!orgName.trim()) {
      setError('Organization name is required');
      toast.error('Please enter an organization name');
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiClient.createOrganization(orgName, orgDescription);
      toast.success('🎉 Organization created successfully!');
      
      // Store organization in context and localStorage
      setCurrentOrganization(data as any);
      
      // Move to completion step and then require fresh login
      setStep(2);
      setIsLoading(false);

      // Clear session so the user logs in before continuing
      await apiClient.logout();

      setTimeout(() => {
        router.replace('/login');
      }, 1500);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create organization';
      setError(message);
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 px-4 py-12">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Card className="w-full max-w-2xl p-10 backdrop-blur-xl bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 shadow-2xl animate-fadeIn">
        {/* Logo and Welcome */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg mb-6 transform hover:scale-105 hover:-translate-y-1 transition-all">
            <Sparkles className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Welcome to Aurora Ops
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Let's set up your workspace in just a few steps</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Realtime-ready setup
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= 1 
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg' 
                  : 'bg-white/10 dark:bg-white/5 border border-white/20 text-gray-500'
              }`}>
                {step > 1 ? <Check className="w-6 h-6" /> : '1'}
              </div>
              <span className={`text-sm mt-2 font-medium ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                Create Organization
              </span>
            </div>
            
            {/* Connector */}
            <div className={`flex-1 h-1 mx-4 rounded transition-all ${
              step >= 2 ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600' : 'bg-white/10 dark:bg-white/5'
            }`} />
            
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= 2 
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg' 
                  : 'bg-white/10 dark:bg-white/5 border border-white/20 text-gray-500'
              }`}>
                {step > 2 ? <Check className="w-6 h-6" /> : '2'}
              </div>
              <span className={`text-sm mt-2 font-medium ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                All Set!
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Create Organization */}
        {step === 1 && (
          <form onSubmit={handleCreateOrg} className="space-y-6 animate-fadeIn">
            <div className="space-y-6">
              <div>
                <label htmlFor="orgName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Organization Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="orgName"
                    type="text"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value);
                      setError('');
                    }}
                    placeholder="Acme Corporation"
                    disabled={isLoading}
                    autoComplete="off"
                    className={`pl-11 ${inputClass}`}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This will be your team's workspace name
                </p>
              </div>

              <div>
                <label htmlFor="orgDescription" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <div className="relative">
                  <Input
                    id="orgDescription"
                    type="text"
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    placeholder="What does your organization do?"
                    disabled={isLoading}
                    autoComplete="off"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/40 dark:bg-white/5 px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
              You can rename your workspace later. Realtime updates will start once you create your first project.
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !orgName.trim()}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-5 w-5 animate-spin" />
                  Creating your workspace...
                </>
              ) : (
                <>
                  Create Organization
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              You can invite team members and customize your workspace later
            </p>
          </form>
        )}

        {/* Step 2: Success & Redirect */}
        {step === 2 && (
          <div className="text-center space-y-8 animate-in fade-in duration-500 py-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-xl animate-in zoom-in duration-500">
              <Check className="text-white w-12 h-12" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                You're all set! 🎉
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Your organization <span className="font-semibold text-blue-600 dark:text-blue-400">{orgName}</span> has been created
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4">
              <div className="p-4 bg-blue-50/80 dark:bg-blue-500/10 rounded-lg">
                <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Create Projects</p>
              </div>
              <div className="p-4 bg-indigo-50/80 dark:bg-indigo-500/10 rounded-lg">
                <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Invite Team</p>
              </div>
              <div className="p-4 bg-purple-50/80 dark:bg-purple-500/10 rounded-lg">
                <Rocket className="w-8 h-8 text-purple-600 dark:text-purple-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Start Managing</p>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => router.replace('/login')}
                className="w-full max-w-md h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
              >
                Go to Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Redirecting to login in a moment...
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
