'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Loader2, Sun, Moon, Monitor, Globe, Clock, Bell, Mail, ArrowLeft } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useTheme } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/language-context';
import { useTimezone } from '@/lib/timezone-context';
import { motion } from 'framer-motion';

// Comprehensive list of world languages
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbek' },
];

// Comprehensive list of world timezones
const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
  // Americas
  { value: 'America/New_York', label: 'New York (Eastern Time)', offset: '-05:00' },
  { value: 'America/Chicago', label: 'Chicago (Central Time)', offset: '-06:00' },
  { value: 'America/Denver', label: 'Denver (Mountain Time)', offset: '-07:00' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (Pacific Time)', offset: '-08:00' },
  { value: 'America/Anchorage', label: 'Anchorage (Alaska Time)', offset: '-09:00' },
  { value: 'Pacific/Honolulu', label: 'Honolulu (Hawaii Time)', offset: '-10:00' },
  { value: 'America/Toronto', label: 'Toronto', offset: '-05:00' },
  { value: 'America/Vancouver', label: 'Vancouver', offset: '-08:00' },
  { value: 'America/Mexico_City', label: 'Mexico City', offset: '-06:00' },
  { value: 'America/Sao_Paulo', label: 'São Paulo', offset: '-03:00' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires', offset: '-03:00' },
  { value: 'America/Santiago', label: 'Santiago', offset: '-03:00' },
  { value: 'America/Lima', label: 'Lima', offset: '-05:00' },
  { value: 'America/Bogota', label: 'Bogotá', offset: '-05:00' },
  // Europe
  { value: 'Europe/London', label: 'London (GMT)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: '+01:00' },
  { value: 'Europe/Berlin', label: 'Berlin', offset: '+01:00' },
  { value: 'Europe/Rome', label: 'Rome', offset: '+01:00' },
  { value: 'Europe/Madrid', label: 'Madrid', offset: '+01:00' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam', offset: '+01:00' },
  { value: 'Europe/Brussels', label: 'Brussels', offset: '+01:00' },
  { value: 'Europe/Vienna', label: 'Vienna', offset: '+01:00' },
  { value: 'Europe/Stockholm', label: 'Stockholm', offset: '+01:00' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen', offset: '+01:00' },
  { value: 'Europe/Oslo', label: 'Oslo', offset: '+01:00' },
  { value: 'Europe/Helsinki', label: 'Helsinki', offset: '+02:00' },
  { value: 'Europe/Athens', label: 'Athens', offset: '+02:00' },
  { value: 'Europe/Istanbul', label: 'Istanbul', offset: '+03:00' },
  { value: 'Europe/Moscow', label: 'Moscow', offset: '+03:00' },
  { value: 'Europe/Warsaw', label: 'Warsaw', offset: '+01:00' },
  { value: 'Europe/Prague', label: 'Prague', offset: '+01:00' },
  { value: 'Europe/Budapest', label: 'Budapest', offset: '+01:00' },
  { value: 'Europe/Bucharest', label: 'Bucharest', offset: '+02:00' },
  { value: 'Europe/Lisbon', label: 'Lisbon', offset: '+00:00' },
  { value: 'Europe/Dublin', label: 'Dublin', offset: '+00:00' },
  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: '+04:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: '+09:00' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: '+08:00' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong', offset: '+08:00' },
  { value: 'Asia/Singapore', label: 'Singapore', offset: '+08:00' },
  { value: 'Asia/Seoul', label: 'Seoul', offset: '+09:00' },
  { value: 'Asia/Kolkata', label: 'Mumbai/Kolkata (IST)', offset: '+05:30' },
  { value: 'Asia/Bangkok', label: 'Bangkok', offset: '+07:00' },
  { value: 'Asia/Jakarta', label: 'Jakarta', offset: '+07:00' },
  { value: 'Asia/Manila', label: 'Manila', offset: '+08:00' },
  { value: 'Asia/Karachi', label: 'Karachi', offset: '+05:00' },
  { value: 'Asia/Dhaka', label: 'Dhaka', offset: '+06:00' },
  { value: 'Asia/Tehran', label: 'Tehran', offset: '+03:30' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem', offset: '+02:00' },
  { value: 'Asia/Riyadh', label: 'Riyadh', offset: '+03:00' },
  { value: 'Asia/Kuwait', label: 'Kuwait', offset: '+03:00' },
  { value: 'Asia/Bahrain', label: 'Bahrain', offset: '+03:00' },
  { value: 'Asia/Qatar', label: 'Qatar', offset: '+03:00' },
  { value: 'Asia/Muscat', label: 'Muscat', offset: '+04:00' },
  { value: 'Asia/Baku', label: 'Baku', offset: '+04:00' },
  { value: 'Asia/Tashkent', label: 'Tashkent', offset: '+05:00' },
  { value: 'Asia/Almaty', label: 'Almaty', offset: '+06:00' },
  { value: 'Asia/Yerevan', label: 'Yerevan', offset: '+04:00' },
  { value: 'Asia/Tbilisi', label: 'Tbilisi', offset: '+04:00' },
  { value: 'Asia/Kathmandu', label: 'Kathmandu', offset: '+05:45' },
  { value: 'Asia/Colombo', label: 'Colombo', offset: '+05:30' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City', offset: '+07:00' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur', offset: '+08:00' },
  { value: 'Asia/Taipei', label: 'Taipei', offset: '+08:00' },
  { value: 'Asia/Ulaanbaatar', label: 'Ulaanbaatar', offset: '+08:00' },
  // Australia & Pacific
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', offset: '+10:00' },
  { value: 'Australia/Melbourne', label: 'Melbourne', offset: '+10:00' },
  { value: 'Australia/Brisbane', label: 'Brisbane', offset: '+10:00' },
  { value: 'Australia/Perth', label: 'Perth', offset: '+08:00' },
  { value: 'Australia/Adelaide', label: 'Adelaide', offset: '+09:30' },
  { value: 'Pacific/Auckland', label: 'Auckland', offset: '+12:00' },
  { value: 'Pacific/Fiji', label: 'Fiji', offset: '+12:00' },
  { value: 'Pacific/Guam', label: 'Guam', offset: '+10:00' },
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo', offset: '+02:00' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg', offset: '+02:00' },
  { value: 'Africa/Lagos', label: 'Lagos', offset: '+01:00' },
  { value: 'Africa/Nairobi', label: 'Nairobi', offset: '+03:00' },
  { value: 'Africa/Algiers', label: 'Algiers', offset: '+01:00' },
  { value: 'Africa/Casablanca', label: 'Casablanca', offset: '+01:00' },
  { value: 'Africa/Tunis', label: 'Tunis', offset: '+01:00' },
  { value: 'Africa/Addis_Ababa', label: 'Addis Ababa', offset: '+03:00' },
  { value: 'Africa/Dar_es_Salaam', label: 'Dar es Salaam', offset: '+03:00' },
  { value: 'Africa/Khartoum', label: 'Khartoum', offset: '+02:00' },
];

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme();
  const { language: currentLanguage, setLanguage } = useLanguage();
  const { timezone: currentTimezone, setTimezone } = useTimezone();
  const queryClient = useQueryClient();
  const [prefs, setPrefs] = useState({
    language: 'en',
    timezone: 'UTC',
    notifications: true,
    emailDigest: 'daily',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.request('GET', '/api/user/preferences');
      if (response && typeof response === 'object') {
        const data = (response as any).data || response;
        const loadedLanguage = data.language || 'en';
        const loadedTimezone = data.timezone || 'UTC';
        setPrefs({
          language: loadedLanguage,
          timezone: loadedTimezone,
          notifications: data.notifications?.inApp !== false,
          emailDigest: data.emailDigest || 'daily',
        });
        // Sync language and timezone context with saved preference
        setLanguage(loadedLanguage);
        setTimezone(loadedTimezone);
      }
    } catch (error) {
      // Using default preferences
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setPrefs((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme} mode`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.request('PUT', '/api/user/preferences', {
        theme: theme,
        language: prefs.language,
        timezone: prefs.timezone,
        notifications: {
          email: true,
          push: true,
          inApp: prefs.notifications,
        },
        emailDigest: prefs.emailDigest,
      });

      const selectedLanguage = LANGUAGES.find(l => l.code === prefs.language);
      const selectedTimezone = TIMEZONES.find(t => t.value === prefs.timezone);

      // Update language and timezone context to apply changes immediately
      if (prefs.language !== currentLanguage) {
        setLanguage(prefs.language);
      }
      if (prefs.timezone !== currentTimezone) {
        setTimezone(prefs.timezone);
      }

      // Invalidate queries to refresh preferences
      await queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      toast.success(
        `Preferences saved successfully! Language: ${selectedLanguage?.name}, Timezone: ${selectedTimezone?.label}`
      );
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-24 rounded bg-gray-100 dark:bg-gray-800/80 animate-pulse" />
          <div>
            <div className="h-6 w-40 rounded bg-gray-100 dark:bg-gray-800/80 animate-pulse" />
            <div className="mt-2 h-4 w-64 rounded bg-gray-100 dark:bg-gray-800/80 animate-pulse" />
          </div>
        </div>
        <Card className="p-8 border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 shadow-md animate-pulse">
          <div className="h-5 w-32 rounded bg-gray-100 dark:bg-gray-800/80" />
          <div className="mt-6 h-24 rounded bg-gray-100 dark:bg-gray-800/80" />
          <div className="mt-6 h-24 rounded bg-gray-100 dark:bg-gray-800/80" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Preferences
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Customize your workspace preferences</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 dark:border-emerald-500/30 bg-white/70 dark:bg-slate-900/70 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          Live preferences
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      <Card className="p-8 backdrop-blur-xl bg-white/80 dark:bg-slate-900/70 border border-white/20 dark:border-white/10 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-5 h-5 text-blue-600" />
              <label className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Appearance
              </label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`group relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 ${
                  mounted && theme === 'light'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 shadow-lg'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <Sun className={`w-8 h-8 transition-all duration-300 ${mounted && theme === 'light' ? 'text-blue-600 scale-110' : 'text-gray-600 dark:text-gray-400 group-hover:scale-105'}`} />
                <span className={`text-sm font-semibold transition-colors ${mounted && theme === 'light' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  Light
                </span>
                {mounted && theme === 'light' && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`group relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 ${
                  mounted && theme === 'dark'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 shadow-lg'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:shadow-md'
                }`}
              >
                <Moon className={`w-8 h-8 transition-all duration-300 ${mounted && theme === 'dark' ? 'text-purple-600 scale-110' : 'text-gray-600 dark:text-gray-400 group-hover:scale-105'}`} />
                <span className={`text-sm font-semibold transition-colors ${mounted && theme === 'dark' ? 'text-purple-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  Dark
                </span>
                {mounted && theme === 'dark' && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => handleThemeChange('system')}
                className={`group relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 ${
                  mounted && theme === 'system'
                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-pink-900/30 dark:to-blue-900/30 shadow-lg'
                    : 'border-gray-300 dark:border-gray-600 hover:border-pink-400 hover:shadow-md'
                }`}
              >
                <Monitor className={`w-8 h-8 transition-all duration-300 ${mounted && theme === 'system' ? 'text-pink-600 scale-110' : 'text-gray-600 dark:text-gray-400 group-hover:scale-105'}`} />
                <span className={`text-sm font-semibold transition-colors ${mounted && theme === 'system' ? 'text-pink-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  System
                </span>
                {mounted && theme === 'system' && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-pink-600 rounded-full animate-pulse"></div>
                )}
              </button>
            </div>
          </motion.div>

          {/* Language */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-purple-600" />
              <label htmlFor="language" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Language
              </label>
            </div>
            <select
              id="language"
              name="language"
              value={prefs.language}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white/70 dark:bg-slate-900/70 disabled:bg-gray-100/70 dark:disabled:bg-gray-800/60 disabled:cursor-not-allowed transition-all duration-300 hover:border-purple-400/70"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Select your preferred language. The interface will update after saving.
            </p>
          </motion.div>

          {/* Timezone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-pink-600" />
              <label htmlFor="timezone" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Timezone
              </label>
            </div>
            <select
              id="timezone"
              name="timezone"
              value={prefs.timezone}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white/70 dark:bg-slate-900/70 disabled:bg-gray-100/70 dark:disabled:bg-gray-800/60 disabled:cursor-not-allowed transition-all duration-300 hover:border-pink-400/70"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} (UTC{tz.offset})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              All dates and times will be displayed in your selected timezone.
            </p>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/60 dark:border-blue-500/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-blue-600" />
              <label className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </label>
            </div>
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                name="notifications"
                checked={prefs.notifications}
                onChange={handleChange}
                disabled={isSaving}
                className="w-6 h-6 text-blue-600 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 disabled:cursor-not-allowed mt-0.5"
              />
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100 block text-base">
                  Enable real-time notifications
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 mt-1 block">
                  Receive instant updates about your projects, tasks, and team activities
                </span>
              </div>
            </label>
          </motion.div>

          {/* Email Digest */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-indigo-600" />
              <label htmlFor="emailDigest" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Email Digest
              </label>
            </div>
            <select
              id="emailDigest"
              name="emailDigest"
              value={prefs.emailDigest}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white/70 dark:bg-slate-900/70 disabled:bg-gray-100/70 dark:disabled:bg-gray-800/60 disabled:cursor-not-allowed transition-all duration-300 hover:border-indigo-400/70"
            >
              <option value="never">Never</option>
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Summary</option>
              <option value="monthly">Monthly Summary</option>
            </select>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Get a summary of your activity delivered to your inbox
            </p>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-6 border-t border-white/30 dark:border-white/10"
          >
            <Button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Preferences...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Preferences
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </Card>
    </div>
  );
}
