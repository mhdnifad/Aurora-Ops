'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Orb from '@/components/Orb';
import { ArrowRight, Shield, Lock, Eye, AlertTriangle } from 'lucide-react';

export default function SecurityPage() {
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
          Security & Compliance
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live security status
          </span>
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1">
            Last updated: {updatedAt}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1">
            SOC 2 Type II
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Live security surface
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Visualize risk signals and threat posture in real time, tuned for enterprise compliance.
            </p>
          </div>
          <div className="relative h-[320px] rounded-3xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10" />
            <div className="relative h-full">
              <Orb hoverIntensity={1.1} rotateOnHover hue={210} backgroundColor="#0b1020" />
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8 pb-12">
        {[
          {
            icon: Lock,
            title: 'End-to-End Encryption',
            description: 'All data transmitted between your device and our servers is encrypted using TLS 1.3',
          },
          {
            icon: Shield,
            title: 'SOC 2 Type II Certified',
            description: 'We maintain strict security standards and undergo regular third-party audits',
          },
          {
            icon: Eye,
            title: '99.9% Uptime SLA',
            description: 'Guaranteed service availability with redundant systems and failover mechanisms',
          },
          {
            icon: AlertTriangle,
            title: 'DDoS Protection',
            description: 'Advanced protection against distributed denial of service attacks',
          },
        ].map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="p-8 border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100/80 to-indigo-100/80 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-16 space-y-8">
        <Card className="p-8 border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-lg space-y-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Protection</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Aurora Ops employs multiple layers of security to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>256-bit AES encryption for data at rest</li>
              <li>TLS 1.3 for data in transit</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Secure password hashing with bcrypt</li>
              <li>Multi-factor authentication (MFA) support</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Controls</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We implement strict access controls to ensure that only authorized personnel can access your data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Role-based access control (RBAC)</li>
              <li>Principle of least privilege</li>
              <li>Automatic session timeouts</li>
              <li>Audit logging for all data access</li>
              <li>Two-factor authentication for administrative access</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Compliance Standards</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Aurora Ops maintains compliance with industry-leading standards:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>GDPR - General Data Protection Regulation</li>
              <li>CCPA - California Consumer Privacy Act</li>
              <li>SOC 2 Type II - Service Organization Control</li>
              <li>ISO/IEC 27001 - Information Security Management</li>
              <li>HIPAA - Health Insurance Portability and Accountability Act (for healthcare plans)</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Incident Response</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We have a comprehensive incident response plan that includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>24/7 security monitoring and threat detection</li>
              <li>Rapid incident response team</li>
              <li>Automatic backups and disaster recovery</li>
              <li>Regular security update patches</li>
              <li>Customer notification within 24 hours for any incident</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Backup & Recovery</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We maintain redundant, geographically distributed backups:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Continuous backup with real-time replication</li>
              <li>Multiple geographic locations</li>
              <li>Regular backup restoration tests</li>
              <li>Recovery Time Objective (RTO) less than 1 hour</li>
              <li>Recovery Point Objective (RPO) less than 15 minutes</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vulnerability Management</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We maintain a proactive approach to security:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Regular security testing and code reviews</li>
              <li>Bug bounty program for external researchers</li>
              <li>Timely patching of vulnerabilities</li>
              <li>Security training for all employees</li>
              <li>Third-party penetration testing</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Report a Security Vulnerability</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you discover a security vulnerability in Aurora Ops, please report it responsibly to security@auroraops.com. We take all security reports seriously and will respond within 24 hours.
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
