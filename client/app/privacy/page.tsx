'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function PrivacyPage() {
  const updatedAt = 'February 7, 2026';

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
      <div className="max-w-4xl mx-auto px-6 py-20 animate-fadeIn">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live policy updates
          </span>
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1">
            Last updated: {updatedAt}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-6">
        <Card className="p-8 space-y-8 backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10">
          <section className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Applies to', value: 'Aurora Ops platform' },
              { label: 'Data processing', value: 'Privacy-first defaults' },
              { label: 'Support', value: 'privacy@auroraops.com' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/20 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</p>
              </div>
            ))}
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">1. Information We Collect</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Aurora Ops collects information you provide directly to us, such as when you create an account, update your profile, or contact us for support. This may include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Name and email address</li>
              <li>Account credentials and password</li>
              <li>Profile information and preferences</li>
              <li>Project and task data</li>
              <li>Communication history</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">2. How We Use Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your experience</li>
              <li>Send transactional and promotional communications</li>
              <li>Detect and prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">3. Data Security</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Information Sharing</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to outside parties. We may share information when required by law or to protect our rights.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">5. Cookies and Tracking</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Aurora Ops uses cookies and similar tracking technologies to enhance your experience. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">6. Your Rights</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request data portability</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7. Policy Updates</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">8. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at privacy@auroraops.com
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">9. GDPR Compliance</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Aurora Ops complies with the General Data Protection Regulation (GDPR). Users in the EU have additional rights regarding their personal data and can exercise their rights by contacting us directly.
            </p>
          </section>
        </Card>

        {/* CTA */}
        <div className="flex gap-4 justify-center pt-8">
          <Link href="/">
            <Button variant="outline" className="border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10">
              Back Home
            </Button>
          </Link>
          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl">
              View Pricing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2026 Aurora Ops. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
