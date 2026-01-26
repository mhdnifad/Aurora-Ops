'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Last updated: January 16, 2026
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-6">
        <Card className="p-8 space-y-6 backdrop-blur-xl bg-white/10 dark:bg-white/5">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Aurora Ops, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">2. Use License</h2>
            <p className="text-gray-700 leading-relaxed">
              Permission is granted to temporarily download one copy of the materials (information or software) on Aurora Ops for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the site</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">3. Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed">
              The materials on Aurora Ops are provided on an 'as is' basis. Aurora Ops makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">4. Limitations</h2>
            <p className="text-gray-700 leading-relaxed">
              In no event shall Aurora Ops or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Aurora Ops.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">5. Accuracy of Materials</h2>
            <p className="text-gray-700 leading-relaxed">
              The materials appearing on Aurora Ops could include technical, typographical, or photographic errors. Aurora Ops does not warrant that any of the materials on its website are accurate, complete, or current. Aurora Ops may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">6. Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Aurora Ops has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Aurora Ops of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">7. Modifications</h2>
            <p className="text-gray-700 leading-relaxed">
              Aurora Ops may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">8. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of your jurisdiction, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at support@auroraops.com
            </p>
          </section>
        </Card>

        {/* CTA */}
        <div className="flex gap-4 justify-center pt-8">
          <Link href="/">
            <Button variant="outline" className="border-gray-300 hover:bg-gray-100">
              Back Home
            </Button>
          </Link>
          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
              View Pricing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-gray-600">
          <p>&copy; 2024 Aurora Ops. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
