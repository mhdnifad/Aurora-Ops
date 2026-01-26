"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Shield, BarChart3, ArrowRight } from 'lucide-react';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      icon: Zap,
      emoji: '⚡',
      title: 'Real-Time Updates',
      description: 'WebSocket-powered real-time updates for tasks, notifications, and activity feeds.',
      gradient: 'from-blue-500 to-cyan-500',
      glowColor: 'rgba(59, 130, 246, 0.5)',
    },
    {
      icon: Shield,
      emoji: '🔒',
      title: 'Enterprise Security',
      description: 'RBAC, JWT authentication, audit logs, and end-to-end encryption.',
      gradient: 'from-purple-500 to-pink-500',
      glowColor: 'rgba(168, 85, 247, 0.5)',
    },
    {
      icon: BarChart3,
      emoji: '📊',
      title: 'Analytics Dashboard',
      description: 'Real-time analytics and insights into your business operations.',
      gradient: 'from-orange-500 to-red-500',
      glowColor: 'rgba(249, 115, 22, 0.5)',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <nav className="flex justify-between items-center mb-20">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AURORA OPS
          </div>
          <div className="space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Real-Time Business Operations Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Production-ready SaaS platform for managing projects, tasks, teams, and clients
            with real-time updates and enterprise-grade security.
          </p>

          <div className="flex justify-center gap-4 mb-20">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 text-lg font-semibold rounded-lg border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all"
            >
              View Pricing
            </Link>
          </div>

          {/* Enhanced Features Section with Glass Morphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 px-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isHovered = hoveredCard === index;
              
              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group relative"
                  style={{
                    transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {/* Glow effect on hover */}
                  <div
                    className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${feature.glowColor}, transparent)`,
                    }}
                  ></div>

                  {/* Glass card */}
                  <div className="relative h-full backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
                    {/* Gradient overlay on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${feature.glowColor}, transparent)`,
                      }}
                    ></div>

                    {/* Shine effect */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      style={{
                        background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                        transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
                        transition: 'transform 0.7s ease-in-out',
                      }}
                    ></div>

                    <div className="relative p-8 h-full flex flex-col">
                      {/* Icon container with gradient */}
                      <div className="mb-6 relative">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}
                        >
                          <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        
                        {/* Emoji floating effect */}
                        <div
                          className="absolute -top-2 -right-2 text-3xl transform transition-all duration-500"
                          style={{
                            transform: isHovered ? 'scale(1.2) rotate(10deg)' : 'scale(1) rotate(0deg)',
                          }}
                        >
                          {feature.emoji}
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-grow">
                        {feature.description}
                      </p>

                      {/* Hover arrow */}
                      <div
                        className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300"
                      >
                        <span className="mr-2">Learn more</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>

                      {/* Bottom gradient line */}
                      <div
                        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                      ></div>
                    </div>

                    {/* Corner decoration */}
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-br ${feature.gradient} opacity-20 rounded-bl-3xl`}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-400">Uptime SLA</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">&lt;50ms</div>
              <div className="text-gray-600 dark:text-gray-400">API Response</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">SOC 2</div>
              <div className="text-gray-600 dark:text-gray-400">Compliant</div>
            </div>
          </div>

          <div className="mt-20 p-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of companies using Aurora Ops to streamline their operations
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Create Your Account
            </Link>
          </div>
        </div>

        <footer className="mt-20 pt-12 border-t border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2026 Aurora Ops. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400">
              Privacy
            </Link>
            <Link href="/security" className="hover:text-blue-600 dark:hover:text-blue-400">
              Security
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

