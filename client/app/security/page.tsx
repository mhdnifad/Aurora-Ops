'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Shield, Lock, Eye, AlertTriangle } from 'lucide-react';

export default function SecurityPage() {
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
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Your data security is our top priority
        </p>
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
            <Card key={index} className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-16 space-y-8">
        <Card className="p-8 border-0 shadow-lg space-y-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Data Protection</h2>
            <p className="text-gray-700 leading-relaxed">
              Aurora Ops employs multiple layers of security to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>256-bit AES encryption for data at rest</li>
              <li>TLS 1.3 for data in transit</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Secure password hashing with bcrypt</li>
              <li>Multi-factor authentication (MFA) support</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Access Controls</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement strict access controls to ensure that only authorized personnel can access your data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Role-based access control (RBAC)</li>
              <li>Principle of least privilege</li>
              <li>Automatic session timeouts</li>
              <li>Audit logging for all data access</li>
              <li>Two-factor authentication for administrative access</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Compliance Standards</h2>
            <p className="text-gray-700 leading-relaxed">
              Aurora Ops maintains compliance with industry-leading standards:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>GDPR - General Data Protection Regulation</li>
              <li>CCPA - California Consumer Privacy Act</li>
              <li>SOC 2 Type II - Service Organization Control</li>
              <li>ISO/IEC 27001 - Information Security Management</li>
              <li>HIPAA - Health Insurance Portability and Accountability Act (for healthcare plans)</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Incident Response</h2>
            <p className="text-gray-700 leading-relaxed">
              We have a comprehensive incident response plan that includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>24/7 security monitoring and threat detection</li>
              <li>Rapid incident response team</li>
              <li>Automatic backups and disaster recovery</li>
              <li>Regular security update patches</li>
              <li>Customer notification within 24 hours for any incident</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Data Backup & Recovery</h2>
            <p className="text-gray-700 leading-relaxed">
              We maintain redundant, geographically distributed backups:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Continuous backup with real-time replication</li>
              <li>Multiple geographic locations</li>
              <li>Regular backup restoration tests</li>
              <li>Recovery Time Objective (RTO) less than 1 hour</li>
              <li>Recovery Point Objective (RPO) less than 15 minutes</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Vulnerability Management</h2>
            <p className="text-gray-700 leading-relaxed">
              We maintain a proactive approach to security:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Regular security testing and code reviews</li>
              <li>Bug bounty program for external researchers</li>
              <li>Timely patching of vulnerabilities</li>
              <li>Security training for all employees</li>
              <li>Third-party penetration testing</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Report a Security Vulnerability</h2>
            <p className="text-gray-700 leading-relaxed">
              If you discover a security vulnerability in Aurora Ops, please report it responsibly to security@auroraops.com. We take all security reports seriously and will respond within 24 hours.
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
