import { useMemo } from 'react';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useTimezone } from '@/lib/timezone-context';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useFormatDate() {
  const { timezone } = useTimezone();

  return useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    });

    return (value: string | Date) => {
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return formatter.format(date);
    };
  }, [timezone]);
}
