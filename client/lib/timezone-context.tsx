import React, { createContext, useContext, useState, useEffect } from 'react';

interface TimezoneContextType {
  timezone: string;
  setTimezone: (tz: string) => void;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [timezone, setTimezoneState] = useState('UTC');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTimezone = localStorage.getItem('app_timezone') || 'UTC';
    setTimezoneState(savedTimezone);
    setMounted(true);
  }, []);

  const setTimezone = (tz: string) => {
    setTimezoneState(tz);
    localStorage.setItem('app_timezone', tz);
    window.dispatchEvent(
      new CustomEvent('timezone-changed', { detail: { timezone: tz } })
    );
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
}
