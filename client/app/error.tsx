'use client';

import { useEffect } from 'react';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-8">
          An error occurred while loading this page. Please try again.
        </p>
        <Button onClick={reset} className="bg-blue-600 hover:bg-blue-700">
          Try again
        </Button>
      </div>
    </div>
  );
}
