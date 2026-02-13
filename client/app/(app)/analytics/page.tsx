'use client';

import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useOrganization } from '@/lib/organization-context';
import { useSocket } from '@/lib/socket-context';
import { apiClient } from '@/lib/api-client';

interface DashboardAnalytics {
  overview: {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
  };
  charts: {
    priorityDistribution: Record<string, number>;
    statusDistribution: Record<string, number>;
    activityTrend: Array<{ date: string; count: number }>;
    projectProgress: Array<{
      name: string;
      totalTasks: number;
      completedTasks: number;
      progress: number;
    }>;
  };
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

const PRIORITY_COLORS = {
  low: COLORS.success,
  medium: COLORS.warning,
  high: COLORS.danger,
  critical: COLORS.purple,
};

const STATUS_COLORS = {
  'not-started': '#94a3b8',
  'in-progress': COLORS.primary,
  review: COLORS.info,
  completed: COLORS.success,
  blocked: COLORS.danger,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
    },
  },
};

export default function AnalyticsDashboard() {
  const { currentOrganization } = useOrganization();
  const { isConnected } = useSocket();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization) {
      fetchAnalytics();
      fetchInsights();
    }
  }, [currentOrganization]);

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get('/api/analytics/dashboard');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await apiClient.get('/api/analytics/insights');
      setInsights(response.data.insights);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="h-7 w-64 rounded bg-gray-100/80 dark:bg-gray-800/60 animate-pulse" />
            <div className="mt-3 h-4 w-80 rounded bg-gray-100/80 dark:bg-gray-800/60 animate-pulse" />
          </div>
          <div className="h-8 w-28 rounded-full bg-gray-100/80 dark:bg-gray-800/60 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="rounded-2xl p-6 shadow-lg bg-white/70 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl animate-pulse">
              <div className="h-3 w-24 rounded bg-gray-100/80 dark:bg-gray-800/60" />
              <div className="mt-3 h-6 w-20 rounded bg-gray-100/80 dark:bg-gray-800/60" />
              <div className="mt-3 h-3 w-28 rounded bg-gray-100/80 dark:bg-gray-800/60" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="rounded-2xl p-6 shadow-lg bg-white/70 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl animate-pulse">
              <div className="h-4 w-40 rounded bg-gray-100/80 dark:bg-gray-800/60" />
              <div className="mt-6 h-[280px] rounded bg-gray-100/80 dark:bg-gray-800/60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { overview, charts } = analytics;

  // Format data for charts
  const priorityData = Object.entries(charts.priorityDistribution).map(([key, value]) => ({
    name: key,
    value,
    color: PRIORITY_COLORS[key as keyof typeof PRIORITY_COLORS] || COLORS.info,
  }));

  const statusData = Object.entries(charts.statusDistribution).map(([key, value]) => ({
    name: key.replace('-', ' '),
    value,
    color: STATUS_COLORS[key as keyof typeof STATUS_COLORS] || COLORS.info,
  }));

  return (
    <motion.div
      className="space-y-6 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time insights and performance metrics for {currentOrganization?.name}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]' : 'bg-amber-500 animate-pulse'
            }`}
          />
          {isConnected ? 'Live updates' : currentOrganization ? 'Connecting' : 'Paused'}
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <StatsCard
          title="Total Projects"
          value={overview.totalProjects}
          subtitle={`${overview.activeProjects} active`}
          icon="📊"
          color="blue"
        />
        <StatsCard
          title="Total Tasks"
          value={overview.totalTasks}
          subtitle={`${overview.completedTasks} completed`}
          icon="✓"
          color="green"
        />
        <StatsCard
          title="Completion Rate"
          value={`${overview.completionRate}%`}
          subtitle="Overall progress"
          icon="📈"
          color="purple"
        />
        <StatsCard
          title="Overdue Tasks"
          value={overview.overdueTasks}
          subtitle="Needs attention"
          icon="⚠️"
          color="red"
        />
      </motion.div>

      {/* AI Insights */}
      {insights && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/60 dark:border-blue-800/60 backdrop-blur-xl"
        >
          <div className="flex items-start space-x-3">
            <div className="text-3xl">🤖</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI Business Insights
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{insights}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trend */}
        <motion.div variants={itemVariants} className="bg-white/70 dark:bg-white/5 rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activity Trend (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={charts.activityTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="count" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div variants={itemVariants} className="bg-white/70 dark:bg-white/5 rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tasks by Priority
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <motion.div variants={itemVariants} className="bg-white/70 dark:bg-white/5 rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tasks by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="value" fill={COLORS.primary}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Project Progress */}
        <motion.div variants={itemVariants} className="bg-white/70 dark:bg-white/5 rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Project Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.projectProgress} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number | undefined) => [
                  `${(value ?? 0).toFixed(1)}%`,
                  'Progress',
                ]}
              />
              <Bar dataKey="progress" fill={COLORS.success} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'red';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <motion.div
      className="bg-white/70 dark:bg-white/5 rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10 backdrop-blur-xl"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`text-4xl bg-gradient-to-br ${colorClasses[color]} p-3 rounded-lg shadow-lg`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
