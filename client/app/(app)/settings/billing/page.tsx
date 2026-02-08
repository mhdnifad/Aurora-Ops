'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CreditCard, Check, Zap, Crown, Building2, Loader2, TrendingUp, Users, Folder, CheckCircle2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { motion } from 'framer-motion';
import ContactSalesModal from '@/components/ui/contact-sales-modal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number | null;
  currency: string;
  billingPeriod: string;
  features: PlanFeature[];
  popular: boolean;
}

interface Subscription {
  planId: string;
  planName: string;
  status: string;
  startDate: Date;
  renewalDate: Date | null;
  usage: any;
  limits: any;
}

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<'month' | 'year'>('month');
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        apiClient.request('GET', 'billing/plans'),
        apiClient.request('GET', 'billing/subscription'),
      ]);

      if (plansResponse && (plansResponse as any).data) {
        setPlans((plansResponse as any).data);
      }
      if (subscriptionResponse && (subscriptionResponse as any).data) {
        setSubscription((subscriptionResponse as any).data);
      }
    } catch (error) {
      // Error loading billing data
      toast.error('Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Zap className="w-8 h-8" />;
      case 'pro':
        return <Crown className="w-8 h-8" />;
      case 'business':
        return <Building2 className="w-8 h-8" />;
      case 'enterprise':
        return <Building2 className="w-8 h-8" />;
      default:
        return <CreditCard className="w-8 h-8" />;
    }
  };

  const getPlanGradient = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'from-gray-500 to-gray-600';
      case 'pro':
        return 'from-blue-500 to-purple-600';
      case 'business':
        return 'from-purple-500 to-pink-600';
      case 'enterprise':
        return 'from-pink-500 to-rose-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const handleUpgrade = (planId: string) => {
    if (planId === 'enterprise') {
      setShowContactModal(true);
      return;
    }
    (async () => {
      try {
        const resp = await apiClient.request('POST', 'billing/checkout', { planId });
        const url = (resp as any)?.checkoutUrl;
        if (url) {
          window.location.href = url;
        } else {
          toast.error('Failed to start checkout');
        }
      } catch (e) {
        toast.error('Failed to start checkout');
      }
    })();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-24 rounded bg-gray-100/80 dark:bg-gray-800/60 animate-pulse" />
          <div>
            <div className="h-6 w-48 rounded bg-gray-100/80 dark:bg-gray-800/60 animate-pulse" />
            <div className="mt-2 h-4 w-64 rounded bg-gray-100/80 dark:bg-gray-800/60 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, idx) => (
            <Card key={idx} className="p-6 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-gray-100/80 dark:bg-gray-800/60" />
              <div className="mt-6 h-4 w-32 rounded bg-gray-100/80 dark:bg-gray-800/60" />
              <div className="mt-3 h-6 w-20 rounded bg-gray-100/80 dark:bg-gray-800/60" />
              <div className="mt-6 h-10 rounded bg-gray-100/80 dark:bg-gray-800/60" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Billing & Plans
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Choose the perfect plan for your team
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Secure billing
        </div>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/60 dark:border-blue-800/60 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Current Plan: {subscription.planName}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  subscription.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {subscription.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Started: {new Date(subscription.startDate).toLocaleDateString()}
              </p>
              {subscription.renewalDate && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Renews: {new Date(subscription.renewalDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {subscription.planId === 'free' ? 'Free' : '$0'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">per month</div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200/70 dark:border-white/10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {subscription.usage.teamMembers}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                of {subscription.limits.teamMembers || '∞'} members
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Folder className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {subscription.usage.projects}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                of {subscription.limits.projects || '∞'} projects
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-pink-600" />
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {subscription.usage.storage}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                of {subscription.limits.storage} used
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setSelectedBillingPeriod('month')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
            selectedBillingPeriod === 'month'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setSelectedBillingPeriod('year')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
            selectedBillingPeriod === 'year'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Annually
          <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
            Save 20%
          </span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`relative p-6 backdrop-blur-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                plan.popular
                  ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-500 shadow-xl scale-105'
                  : 'bg-white/80 dark:bg-white/5 border-gray-200/60 dark:border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getPlanGradient(plan.id)} flex items-center justify-center text-white mb-4 mx-auto`}>
                {getPlanIcon(plan.id)}
              </div>

              <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
                {plan.name}
              </h3>

              <div className="text-center mb-4">
                {plan.price !== null ? (
                  <>
                    <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                      ${selectedBillingPeriod === 'year' ? Math.floor(plan.price * 0.8) : plan.price}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      per {selectedBillingPeriod}
                    </div>
                  </>
                ) : (
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Contact Sales
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6 min-h-[3rem]">
                {plan.description}
              </p>

              <Button
                onClick={() => handleUpgrade(plan.id)}
                disabled={subscription?.planId === plan.id}
                className={`w-full mb-6 font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                } text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed`}
              >
                {subscription?.planId === plan.id ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Current Plan
                  </>
                ) : plan.price === null ? (
                  'Contact Sales'
                ) : (
                  'Upgrade Now'
                )}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 text-sm ${
                      feature.included
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? '' : 'line-through'}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* FAQ or Additional Info */}
      <Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Need help choosing a plan?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Contact our sales team to discuss your specific needs and find the perfect plan for your organization.
        </p>
        <Button onClick={() => setShowContactModal(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg">
          Contact Sales
        </Button>
      </Card>

      <ContactSalesModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
    </div>
  );
}
