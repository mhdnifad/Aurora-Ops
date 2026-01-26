'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import {
  Check,
  ArrowRight,
  Zap,
  Users,
  BarChart3,
  Shield,
  Headphones,
  Rocket,
  X,
  Calendar,
  Mail,
  User,
  Building2,
  Phone,
} from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [trialForm, setTrialForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
  });

  const [demoForm, setDemoForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    preferredDate: '',
  });

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to registration with pre-filled data
    const params = new URLSearchParams({
      email: trialForm.email,
      firstName: trialForm.firstName,
      lastName: trialForm.lastName,
      trial: 'true'
    });
    
    router.push(`/register?${params.toString()}`);
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Thank you! Our team will contact you shortly to schedule your demo.');
      setShowDemoModal(false);
      setDemoForm({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        phone: '',
        message: '',
        preferredDate: '',
      });
    } catch (error) {
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanClick = (plan: string) => {
    if (plan === 'Contact Sales') {
      setShowDemoModal(true);
    } else {
      setShowTrialModal(true);
    }
  };
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 5 team members',
        '10 projects',
        'Basic task management',
        'Email support',
        '5GB storage',
        'Basic reporting',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'For growing teams and businesses',
      features: [
        'Up to 25 team members',
        'Unlimited projects',
        'Advanced task management',
        'Priority support',
        '100GB storage',
        'Advanced analytics',
        'Custom workflows',
        'API access',
      ],
      cta: 'Get Started',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large organizations',
      features: [
        'Unlimited team members',
        'Unlimited projects',
        'White-label options',
        '24/7 phone support',
        'Unlimited storage',
        'Custom integrations',
        'Advanced security',
        'Dedicated account manager',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: 'Can I change plans anytime?',
      answer:
        'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
    },
    {
      question: 'Is there a setup fee?',
      answer:
        'No, there are no setup fees. You only pay the monthly subscription amount.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards, PayPal, and wire transfers for enterprise plans.',
    },
    {
      question: 'Do you offer annual billing discounts?',
      answer:
        'Yes! Save 20% when you pay annually. Contact our sales team for details.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="backdrop-blur-xl bg-white/10 dark:bg-white/5 border-b border-white/20 dark:border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Aurora Ops
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              className="backdrop-blur-sm"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-16 text-center space-y-6 animate-fadeIn">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Choose the perfect plan for your team. All plans include a 14-day free
          trial.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`relative overflow-hidden transition-all duration-300 backdrop-blur-xl ${
              plan.highlighted
                ? 'bg-gradient-to-br from-blue-400/30 to-purple-400/30 dark:from-blue-400/20 dark:to-purple-400/20 border-white/40 dark:border-white/30 shadow-2xl scale-105 hover:-translate-y-1'
                : 'bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 hover:bg-white/15 dark:hover:bg-white/10 hover:-translate-y-1'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg shadow-lg">
                Most Popular
              </div>
            )}

            <div className="p-8 space-y-6">
              {/* Plan Header */}
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{plan.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  {plan.period !== 'pricing' && (
                    <span className="text-gray-600 dark:text-gray-300">{plan.period}</span>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handlePlanClick(plan.cta)}
                className={`w-full py-3 ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-lg hover:-translate-y-0.5 text-white shadow-lg'
                    : 'bg-white/10 hover:bg-white/15 text-gray-900 dark:text-white border border-white/20 hover:border-white/40'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {/* Features */}
              <div className="space-y-4 pt-8 border-t border-white/20 dark:border-white/10">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Why Choose Aurora Ops?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Zap,
              title: 'Lightning Fast',
              description: 'Real-time updates and instant notifications',
            },
            {
              icon: Users,
              title: 'Team Collaboration',
              description: 'Work together seamlessly with your team',
            },
            {
              icon: BarChart3,
              title: 'Powerful Analytics',
              description: 'Gain insights with advanced reporting',
            },
            {
              icon: Shield,
              title: 'Enterprise Security',
              description: 'Bank-level security for your data',
            },
            {
              icon: Headphones,
              title: '24/7 Support',
              description: 'Always here when you need us',
            },
            {
              icon: Rocket,
              title: 'Easy Integration',
              description: 'Connect with your favorite tools',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-8 border-0 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
              <details className="group cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-gray-900">
                  {faq.question}
                  <span className="text-blue-600 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-gray-600">{faq.answer}</p>
              </details>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <Card className="p-12 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of teams using Aurora Ops
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowTrialModal(true)}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
            >
              Start Free Trial
            </Button>
            <Button
              onClick={() => setShowDemoModal(true)}
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-3"
            >
              Schedule Demo
            </Button>
          </div>
        </Card>
      </div>

      {/* Trial Modal */}
      <Modal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        title="Start Your 14-Day Free Trial"
      >
        <form onSubmit={handleTrialSubmit} className="space-y-4">
          <p className="text-gray-600 mb-4">
            No credit card required. Get full access to all features for 14 days.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={trialForm.firstName}
                  onChange={(e) => setTrialForm({ ...trialForm, firstName: e.target.value })}
                  className="pl-10"
                  placeholder="John"
                  autoComplete="given-name"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={trialForm.lastName}
                  onChange={(e) => setTrialForm({ ...trialForm, lastName: e.target.value })}
                  className="pl-10"
                  placeholder="Doe"
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                value={trialForm.email}
                onChange={(e) => setTrialForm({ ...trialForm, email: e.target.value })}
                className="pl-10"
                autoComplete="email"
                placeholder="john@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                value={trialForm.company}
                onChange={(e) => setTrialForm({ ...trialForm, company: e.target.value })}
                autoComplete="off"
                className="pl-10"
                placeholder="Your Company"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTrialModal(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Start Free Trial'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Demo Modal */}
      <Modal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        title="Schedule a Demo"
      >
        <form onSubmit={handleDemoSubmit} className="space-y-4">
          <p className="text-gray-600 mb-4">
            Let us show you how Aurora Ops can transform your team's workflow.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={demoForm.firstName}
                  onChange={(e) => setDemoForm({ ...demoForm, firstName: e.target.value })}
                  className="pl-10"
                  placeholder="John"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={demoForm.lastName}
                  onChange={(e) => setDemoForm({ ...demoForm, lastName: e.target.value })}
                  className="pl-10"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                value={demoForm.email}
                onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                className="pl-10"
                placeholder="john@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                value={demoForm.company}
                onChange={(e) => setDemoForm({ ...demoForm, company: e.target.value })}
                className="pl-10"
                placeholder="Your Company"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="tel"
                value={demoForm.phone}
                onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                className="pl-10"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="date"
                value={demoForm.preferredDate}
                onChange={(e) => setDemoForm({ ...demoForm, preferredDate: e.target.value })}
                className="pl-10"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <Textarea
              value={demoForm.message}
              onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })}
              placeholder="Tell us about your team and what you'd like to see in the demo..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDemoModal(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Schedule Demo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-gray-600">
          <p>&copy; 2024 Aurora Ops. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
