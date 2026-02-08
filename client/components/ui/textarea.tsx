'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex w-full min-h-[120px] rounded-xl backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-gray-900 dark:text-white px-4 py-3 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:bg-white/20 dark:focus-visible:bg-white/10 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white/15 dark:hover:bg-white/8 resize-none',
      className
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';

export default Textarea;
