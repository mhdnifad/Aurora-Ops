import { Loader } from 'lucide-react';

export default function Loading() {
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
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
          <Loader className="h-7 w-7 animate-spin text-blue-600" />
        </div>
        <p className="text-sm font-semibold text-blue-700">Live sync in progress</p>
        <p className="text-gray-600 mt-2">Loading your workspace...</p>
      </div>
    </div>
  );
}
