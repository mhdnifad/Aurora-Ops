'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Activity,
  MessageSquare,
  Users,
  FileText,
  BarChart3,
  Sparkles
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { motion } from 'framer-motion';

interface AIModel {
  id: string;
  name: string;
  description: string;
  status: string;
  capabilities: string[];
  tokensUsed: number;
  tokensLimit: number;
}

interface AIFeature {
  enabled: boolean;
  description: string;
}

interface AIStatus {
  enabled: boolean;
  models: AIModel[];
  features: Record<string, AIFeature>;
  usage: {
    requestsToday: number;
    requestsThisMonth: number;
    tokensUsedToday: number;
    tokensUsedThisMonth: number;
  };
  limits: {
    requestsPerDay: number;
    requestsPerMonth: number;
    tokensPerDay: number;
    tokensPerMonth: number;
  };
}

export default function AISettingsPage() {
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAIStatus();
  }, []);

  const loadAIStatus = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.request<AIStatus>('GET', 'ai/status');
      if (response) {
        setAiStatus(response);
      }
    } catch (error) {
      // Error loading AI status
      toast.error('Failed to load AI settings');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeature = async (featureKey: string, enabled: boolean) => {
    setIsSaving(true);
    try {
      // Simulate API call to toggle feature
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAiStatus(prev => {
        if (!prev) return null;
        return {
          ...prev,
          features: {
            ...prev.features,
            [featureKey]: {
              ...prev.features[featureKey],
              enabled,
            },
          },
        };
      });
      
      toast.success(`Feature ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to update feature');
    } finally {
      setIsSaving(false);
    }
  };

  const getFeatureIcon = (key: string) => {
    switch (key) {
      case 'taskSuggestions':
        return <Sparkles className="w-5 h-5" />;
      case 'smartAssignments':
        return <Users className="w-5 h-5" />;
      case 'contentGeneration':
        return <FileText className="w-5 h-5" />;
      case 'sentimentAnalysis':
        return <MessageSquare className="w-5 h-5" />;
      case 'predictiveAnalytics':
        return <BarChart3 className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getFeatureName = (key: string) => {
    const names: Record<string, string> = {
      taskSuggestions: 'Task Suggestions',
      smartAssignments: 'Smart Assignments',
      contentGeneration: 'Content Generation',
      sentimentAnalysis: 'Sentiment Analysis',
      predictiveAnalytics: 'Predictive Analytics',
    };
    return names[key] || key;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!aiStatus) {
    return (
      <Card className="p-6 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl">
        <p className="text-gray-600 dark:text-gray-400">Failed to load AI settings</p>
      </Card>
    );
  }

  const requestsPercentage = Math.round((aiStatus.usage.requestsToday / aiStatus.limits.requestsPerDay) * 100);
  const tokensPercentage = Math.round((aiStatus.usage.tokensUsedToday / aiStatus.limits.tokensPerDay) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Assistant
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure AI-powered features and monitor usage
        </p>
      </div>

      {/* Overall Status */}
      <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/60 dark:border-blue-800/60 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                AI Assistant Status
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {aiStatus.enabled ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">Active & Running</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-semibold text-red-600">Disabled</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {aiStatus.models.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Models Available</div>
          </div>
        </div>
      </Card>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Daily Requests</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">API calls today</p>
            </div>
          </div>
          <div className="mb-2">
            <div className="flex justify-between items-end mb-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {aiStatus.usage.requestsToday.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                of {aiStatus.limits.requestsPerDay.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(requestsPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {requestsPercentage}% used
            </p>
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Token Usage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tokens consumed today</p>
            </div>
          </div>
          <div className="mb-2">
            <div className="flex justify-between items-end mb-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {aiStatus.usage.tokensUsedToday.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                of {aiStatus.limits.tokensPerDay.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(tokensPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {tokensPercentage}% used
            </p>
          </div>
        </Card>
      </div>

      {/* Available Models */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Available AI Models
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiStatus.models.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {model.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      model.status === 'available'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {model.status}
                    </span>
                  </div>
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {model.description}
                </p>
                <div className="space-y-2">
                  <div className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Tokens Used</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {Math.round((model.tokensUsed / model.tokensLimit) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        style={{ width: `${Math.min((model.tokensUsed / model.tokensLimit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {model.capabilities.map((cap, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-md"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Features */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          AI-Powered Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(aiStatus.features).map(([key, feature], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      feature.enabled
                        ? 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {getFeatureIcon(key)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {getFeatureName(key)}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFeature(key, !feature.enabled)}
                    disabled={isSaving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      feature.enabled
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        feature.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Monthly Overview */}
      <Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          Monthly Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {aiStatus.usage.requestsThisMonth.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {aiStatus.usage.tokensUsedThisMonth.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tokens Used</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round((aiStatus.usage.requestsThisMonth / aiStatus.limits.requestsPerMonth) * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Request Quota</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round((aiStatus.usage.tokensUsedThisMonth / aiStatus.limits.tokensPerMonth) * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Token Quota</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
