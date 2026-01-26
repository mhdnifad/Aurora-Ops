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

export default function ApiPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; label: string; maskedToken?: string; createdAt: string; lastUsedAt?: string }>>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (e) {
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
    } catch (error) {
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
    } catch (e) {
      toast.error('Failed to delete API key');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">API Keys</h2>
        <p className="text-gray-600 mt-1">Manage your API keys for programmatic access</p>
      </div>

      {/* Create New Key */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Create New API Key
        </h3>
        <form onSubmit={handleCreateKey} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Name</label>
            <Input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., Production, Development"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? 'Creating...' : 'Create API Key'}
          </Button>
        </form>
      </Card>

      {/* Existing Keys */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your API Keys</h3>
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div key={key.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{key.label}</h4>
                <div className="text-sm text-gray-500">Created: {key.createdAt}</div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                <code className="text-sm text-gray-600">{key.maskedToken || '••••••••'}</code>
                <button
                  onClick={() => handleCopyKey(key.maskedToken)}
                  className="text-blue-600 hover:text-blue-700 ml-2"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-200">
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
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">API Documentation</h3>
        <p className="text-blue-800 text-sm mb-3">Learn how to use Aurora Ops API in your application.</p>
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
