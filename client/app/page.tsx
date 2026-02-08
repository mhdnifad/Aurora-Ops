"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  FileText,
  BookOpen,
  Heart,
  Cloud,
  Edit3,
  BarChart2,
  Home as HomeIcon,
  Layers,
  Sparkles
} from 'lucide-react';
import { ColorBendsSurface } from '@/components/ui/color-bends-surface';
import { FloatingLinesSurface } from '@/components/ui/floating-lines-surface';
import { FluidGlassSurface } from '@/components/ui/fluid-glass-surface';
import ElectricBorder from '@/components/ElectricBorder';
import BlurText from '@/components/BlurText';
import GlassIcons from '@/components/GlassIcons';
import ShapeBlur from '@/components/ShapeBlur';
import CardNav from '@/components/CardNav';
import ProfileCard from '@/components/ProfileCard';
import Dock from '@/components/Dock';
import Carousel from '@/components/Carousel';
import CardSwap, { Card as SwapCard } from '@/components/CardSwap';
import InfiniteMenu from '@/components/InfiniteMenu';
import Orb from '@/components/Orb';

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const router = useRouter();
  const showFluidGlass = process.env.NEXT_PUBLIC_ENABLE_FLUID_GLASS === '1';

  const scrollToSection = (id: string) => {
    if (typeof document === 'undefined') return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  const glassItems = [
    { icon: <FileText />, color: 'blue', label: 'Docs' },
    { icon: <BookOpen />, color: 'purple', label: 'Guides' },
    { icon: <Heart />, color: 'red', label: 'Wellness' },
    { icon: <Cloud />, color: 'indigo', label: 'Cloud' },
    { icon: <Edit3 />, color: 'orange', label: 'Notes' },
    { icon: <BarChart2 />, color: 'green', label: 'Stats' },
  ];

  const cardNavItems = [
    {
      label: 'Platform',
      bgColor: '#0b1020',
      textColor: '#ffffff',
      links: [
        { label: 'Overview', href: '#overview', ariaLabel: 'Platform overview' },
        { label: 'Security', href: '#security', ariaLabel: 'Security details' },
      ],
    },
    {
      label: 'Teams',
      bgColor: '#130b24',
      textColor: '#ffffff',
      links: [
        { label: 'Collaboration', href: '#collaboration', ariaLabel: 'Team collaboration' },
        { label: 'Analytics', href: '#analytics', ariaLabel: 'Analytics and reporting' },
      ],
    },
    {
      label: 'Scale',
      bgColor: '#1a0f2e',
      textColor: '#ffffff',
      links: [
        { label: 'Analytics', href: '#analytics', ariaLabel: 'Analytics and reporting' },
        { label: 'Integrations', href: '#integrations', ariaLabel: 'Integrations' },
      ],
    },
  ];

  const carouselItems = [
    {
      id: 1,
      title: 'Realtime Layers',
      description: 'Streaming updates across tasks, teams, and clients.',
      icon: <Zap className="h-4 w-4 text-white" />
    },
    {
      id: 2,
      title: 'Secure by Default',
      description: 'RBAC, audit trails, and end-to-end encryption.',
      icon: <Shield className="h-4 w-4 text-white" />
    },
    {
      id: 3,
      title: 'Ops Intelligence',
      description: 'Live dashboards with actionable insights.',
      icon: <BarChart3 className="h-4 w-4 text-white" />
    },
    {
      id: 4,
      title: 'Automation',
      description: 'Trigger workflows with flexible orchestration.',
      icon: <Sparkles className="h-4 w-4 text-white" />
    }
  ];

  const orbitItems = [
    {
      image: '/assets/flow/mojave.svg',
      link: '/pricing',
      title: 'Ops Core',
      description: 'Command every workflow.'
    },
    {
      image: '/assets/flow/sonoma.svg',
      link: '/security',
      title: 'Shield Grid',
      description: 'Enterprise-grade defense.'
    },
    {
      image: '/assets/flow/monterey.svg',
      link: '/projects',
      title: 'Project Pulse',
      description: 'Keep teams aligned.'
    },
    {
      image: '/assets/flow/sequoia.svg',
      link: '/analytics',
      title: 'Signal Lab',
      description: 'See the story in the data.'
    }
  ];

  const dockItems = [
    {
      icon: <HomeIcon className="h-4 w-4 text-white" />,
      label: 'Top',
      onClick: () => scrollToSection('top')
    },
    {
      icon: <Sparkles className="h-4 w-4 text-white" />,
      label: 'Motion Lab',
      onClick: () => scrollToSection('motion-lab')
    },
    {
      icon: <Layers className="h-4 w-4 text-white" />,
      label: 'Workflows',
      onClick: () => scrollToSection('workflows')
    },
    {
      icon: <BarChart3 className="h-4 w-4 text-white" />,
      label: 'Insights',
      onClick: () => scrollToSection('analytics')
    },
    {
      icon: <Shield className="h-4 w-4 text-white" />,
      label: 'Security',
      onClick: () => scrollToSection('security')
    },
    {
      icon: <ArrowRight className="h-4 w-4 text-white" />,
      label: 'Pricing',
      onClick: () => router.push('/pricing')
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <ColorBendsSurface className="opacity-40" />
      <FloatingLinesSurface className="opacity-25" />

      <div id="top" className="container mx-auto px-4 py-16 relative z-10">
        <nav className="flex justify-between items-center mb-20">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AURORA OPS
          </div>
          <div className="space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 rounded-full border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/10 transition-all"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl hover:opacity-95 transition-all"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-5xl mx-auto relative">
          <div className="absolute inset-x-0 -top-10 h-[320px] opacity-30 pointer-events-none">
            <ShapeBlur variation={2} shapeSize={1} roundness={0.5} borderSize={0.06} circleSize={0.25} circleEdge={1} />
          </div>
          <BlurText
            text="Real-Time Business Operations Platform"
            delay={120}
            animateBy="words"
            direction="top"
            className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          />
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Production-ready SaaS platform for managing projects, tasks, teams, and clients
            with real-time updates and enterprise-grade security.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10 text-sm text-gray-600 dark:text-gray-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live socket sync
            </span>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/70 px-3 py-1 dark:bg-white/10">
              SOC 2 Type II
            </span>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/70 px-3 py-1 dark:bg-white/10">
              99.9% uptime
            </span>
          </div>

          <div className="flex justify-center gap-4 mb-20">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-white/80 dark:bg-white/10 text-blue-700 dark:text-blue-300 text-lg font-semibold rounded-full border border-white/40 dark:border-white/15 hover:bg-white/95 dark:hover:bg-white/15 transition-all"
            >
              View Pricing
            </Link>
          </div>

          <div className="relative h-[260px] mb-24">
            <CardNav
              logo="/favicon.svg"
              logoAlt="Aurora Ops"
              items={cardNavItems}
              baseColor="#ffffff"
              menuColor="#111111"
              buttonBgColor="#111111"
              buttonTextColor="#ffffff"
              className="top-[2rem]"
            />
          </div>

          {/* Enhanced Features Section with Glass Morphism */}
          <div id="overview" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 px-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isHovered = hoveredCard === index;
              
              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  id={feature.title === 'Enterprise Security' ? 'security' : undefined}
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

          <div id="collaboration" className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
              Everything You Need in One Place
            </h2>
            <GlassIcons items={glassItems} className="mx-auto" />
          </div>

          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Built for Modern Ops Teams
            </h2>
            <div className="flex justify-center">
              <ProfileCard
                name="Aurora Ops"
                title="Operations Platform"
                handle="auroraops"
                status="Live"
                contactText="Contact"
                avatarUrl="/assets/avatars/lead.svg"
                miniAvatarUrl="/assets/avatars/lead.svg"
                showUserInfo={true}
                enableTilt={true}
                enableMobileTilt={false}
                behindGlowEnabled={true}
                behindGlowColor="rgba(125, 190, 255, 0.67)"
                innerGradient="linear-gradient(145deg,#1e293b88 0%,#0ea5e944 100%)"
              />
            </div>
          </div>

          <div id="motion-lab" className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                Motion Lab
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Mix cinematic motion with live data. Aurora Ops keeps the signal clear while the UI stays in motion.
              </p>
              <div className="flex justify-center lg:justify-start">
                <Carousel
                  items={carouselItems}
                  baseWidth={360}
                  autoplay
                  autoplayDelay={4200}
                  pauseOnHover
                  loop
                  round={false}
                />
              </div>
            </div>
            <div className="relative h-[420px] rounded-3xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-emerald-500/10" />
              <div className="relative h-full">
                <Orb hoverIntensity={1.4} rotateOnHover hue={210} backgroundColor="#0b1020" />
              </div>
            </div>
          </div>

          <div id="workflows" className="mt-24">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                Workflow Shuffle
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Rotate through ops playbooks with elastic motion and instant clarity.
              </p>
            </div>
            <div className="relative h-[520px]">
              <CardSwap cardDistance={60} verticalDistance={70} delay={5000} pauseOnHover>
                <SwapCard className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6">
                  <h3 className="text-2xl font-semibold mb-2">Incident Response</h3>
                  <p className="text-sm text-white/80">Auto-assign, notify, and resolve with precision.</p>
                </SwapCard>
                <SwapCard className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6">
                  <h3 className="text-2xl font-semibold mb-2">Client Onboarding</h3>
                  <p className="text-sm text-white/80">Track every milestone with zero lag.</p>
                </SwapCard>
                <SwapCard className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-6">
                  <h3 className="text-2xl font-semibold mb-2">Release Control</h3>
                  <p className="text-sm text-white/80">Ship faster with approvals and audits in sync.</p>
                </SwapCard>
              </CardSwap>
            </div>
          </div>

          <div id="ops-universe" className="mt-24">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Ops Universe</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Spin through core modules and discover where your next efficiency win lives.
              </p>
            </div>
            <div className="relative h-[520px] rounded-3xl overflow-hidden border border-white/20 dark:border-white/10 bg-[#060010]">
              <InfiniteMenu items={orbitItems} scale={1} />
            </div>
          </div>

          <div id="analytics" className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
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

          {showFluidGlass && (
            <div className="mt-20">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Fluid Glass UI</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    A subtle 3D lens for showcasing product motion and depth.
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  WebGL
                </div>
              </div>
              <FluidGlassSurface className="bg-gradient-to-br from-blue-600/10 via-transparent to-emerald-500/10 border border-white/30 shadow-2xl" />
            </div>
          )}

          <div id="integrations" className="mt-20">
            <ElectricBorder
              color="#7df9ff"
              speed={1}
              chaos={0.12}
              thickness={2}
              className="rounded-2xl"
              style={{ borderRadius: 16 }}
            >
              <div className="p-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
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
            </ElectricBorder>
          </div>
        </div>

        <div className="relative mt-20 h-[120px]">
          <Dock items={dockItems} panelHeight={64} baseItemSize={48} magnification={70} />
        </div>

        <footer className="mt-20 pt-12 border-t border-white/20 dark:border-white/10 text-center text-gray-600 dark:text-gray-400">
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

