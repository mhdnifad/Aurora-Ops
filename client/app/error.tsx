'use client';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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

      <div className="text-center max-w-md rounded-2xl border border-white/30 bg-white/70 backdrop-blur-xl shadow-2xl px-8 py-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
          <AlertCircle className="h-7 w-7 text-red-600" />
        </div>
        <span className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700">
          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          Live incident detected
        </span>
        <h2 className="text-3xl font-bold mb-2 text-gray-900">Something went wrong</h2>
        <p className="text-gray-600 mb-8">
          An error occurred while loading this page. Please try again.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh page
          </Button>
        </div>
      </div>
    </div>
  );
}
