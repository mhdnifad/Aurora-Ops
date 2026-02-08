'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl animate-pulse" />
        <div
          className="absolute top-0 right-1/4 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute -bottom-8 left-1/2 h-72 w-72 rounded-full bg-pink-400/20 blur-3xl animate-pulse"
          style={{ animationDelay: '4s' }}
        />
      </div>

      <div className="text-center rounded-2xl border border-white/30 bg-white/70 backdrop-blur-xl shadow-2xl px-8 py-10">
        <p className="text-sm font-semibold text-blue-700">Live route lookup</p>
        <h1 className="text-8xl font-bold text-blue-600 mt-3">404</h1>
        <h2 className="text-3xl font-bold mt-4 mb-2 text-gray-900">Page not found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Button>
          </Link>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
