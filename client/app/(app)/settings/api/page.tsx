'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Key, Copy, RotateCw, Trash2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ApiPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; label: string; maskedToken?: string; createdAt: string; lastUsedAt?: string }>>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputClass = 'h-11 bg-white/80 dark:bg-white/5 border-gray-200/60 dark:border-white/10';

  const fetchKeys = async () => {
    try {
      const keys = await apiClient.listApiKeys();
      setApiKeys(
        (keys || []).map((k: any) => ({
          id: k.id,
          label: k.label,
          maskedToken: k.maskedToken,
          createdAt: new Date(k.createdAt).toLocaleDateString(),
          lastUsedAt: k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never',
        }))
      );
    } catch {
      // Ignore for now
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast.error('Key name is required');
      return;
    }

    setIsLoading(true);
    try {
      const created = await apiClient.createApiKey(newKeyName.trim());
      toast.success('API key created successfully');
      // Show full token once
      if (created?.token) {
        await navigator.clipboard.writeText(created.token);
        toast.info('Full API token copied to clipboard');
      }
      setNewKeyName('');
      // Refresh list
      await fetchKeys();
    } catch {
      toast.error('Failed to create API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = async (masked?: string) => {
    if (!masked) return;
    await navigator.clipboard.writeText(masked);
    toast.success('API key copied (masked)');
  };

  const handleRotateKey = (id: string) => {
    toast.info('Rotation not implemented; revoke and create a new key');
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await apiClient.revokeApiKey(id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success('API key deleted');
    } catch {
      toast.error('Failed to delete API key');
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your API keys for programmatic access</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Secure access
        </div>
      </div>

      {/* Create New Key */}
      <Card className="p-6 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Create New API Key
        </h3>
        <form onSubmit={handleCreateKey} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Name</label>
            <Input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., Production, Development"
              disabled={isLoading}
              className={inputClass}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
            {isLoading ? 'Creating...' : 'Create API Key'}
          </Button>
        </form>
      </Card>

      {/* Existing Keys */}
      <Card className="p-6 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Your API Keys</h3>
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/30 dark:border-white/10 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No API keys yet. Create one to start integrating Aurora Ops.
            </div>
          ) : apiKeys.map((key) => (
            <div key={key.id} className="border border-white/20 dark:border-white/10 rounded-xl p-4 space-y-3 bg-white/90 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">{key.label}</h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">Created: {key.createdAt}</div>
              </div>

              <div className="bg-gray-50/80 dark:bg-white/5 p-3 rounded-lg flex items-center justify-between">
                <code className="text-sm text-gray-600 dark:text-gray-300">{key.maskedToken || '••••••••'}</code>
                <button
                  onClick={() => handleCopyKey(key.maskedToken)}
                  className="text-blue-600 hover:text-blue-700 ml-2"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200/70 dark:border-white/10">
                <span>Last used: {key.lastUsedAt || 'Never'}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRotateKey(key.id)}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    <RotateCw className="w-4 h-4 mr-1" />
                    Rotate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteKey(key.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Documentation */}
      <Card className="p-6 bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">API Documentation</h3>
        <p className="text-blue-800 dark:text-blue-300 text-sm mb-3">Learn how to use Aurora Ops API in your application.</p>
        <Button 
          variant="outline" 
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          onClick={() => router.push('/settings/api-docs')}
        >
          View Documentation
          <ExternalLink className="w-4 h-4" />
        </Button>
      </Card>
    </div>
  );
}
