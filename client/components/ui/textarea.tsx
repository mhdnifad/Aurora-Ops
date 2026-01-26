'use client';

import React from 'react';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`
      w-full px-3 py-2 border border-gray-300 rounded-md
      bg-white text-gray-900 placeholder-gray-500
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
      disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
      dark:disabled:bg-gray-700 dark:disabled:text-gray-400
      resize-none
      ${className}
    `}
    {...props}
  />
));

Textarea.displayName = 'Textarea';

export default Textarea;
