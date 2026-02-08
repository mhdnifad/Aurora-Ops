'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/lib/socket-context';
import { RefreshCw, ShieldCheck } from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalOrganizations: number;
  activeOrganizations: number;
  totalProjects: number;
  totalTasks: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    try {
      const [statsRes, usersRes, orgRes, logsRes] = await Promise.all([
        apiClient.getSystemStats(),
        apiClient.getAllUsers(1, 20),
        apiClient.getAllOrganizations(1, 20),
        apiClient.getAuditLogs(1, 20),
      ]);
      setStats(statsRes);
      setUsers(usersRes || []);
      setOrganizations(orgRes || []);
      setLogs(logsRes || []);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.systemRole === 'admin') {
      load();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user?.systemRole !== 'admin') {
    return (
      <Card className="p-8 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-rose-100 p-3">
            <ShieldCheck className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Admin</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">You do not have access to this area.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Control Center</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">System-wide stats, users, organizations, and audit activity.</p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">Last updated {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-500 animate-pulse'}`} />
            {isConnected ? 'Realtime live' : 'Syncing'}
          </span>
          <Button
            variant="outline"
            onClick={() => {
              setIsRefreshing(true);
              load();
            }}
            disabled={isRefreshing}
            className="self-start"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, idx) => (
            <Card key={idx} className="p-4 animate-pulse border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
              <div className="h-3 w-24 rounded bg-gray-100/80 dark:bg-gray-800/60" />
              <div className="mt-3 h-6 w-20 rounded bg-gray-100/80 dark:bg-gray-800/60" />
              <div className="mt-3 h-2 w-28 rounded bg-gray-100/80 dark:bg-gray-800/60" />
            </Card>
          ))}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
            <div className="text-sm text-gray-500">Users</div>
            <div className="text-2xl font-semibold">{stats.totalUsers}</div>
            <div className="text-xs text-gray-400">Active: {stats.activeUsers}</div>
          </Card>
          <Card className="p-4 border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
            <div className="text-sm text-gray-500">Organizations</div>
            <div className="text-2xl font-semibold">{stats.totalOrganizations}</div>
            <div className="text-xs text-gray-400">Active: {stats.activeOrganizations}</div>
          </Card>
          <Card className="p-4 border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
            <div className="text-sm text-gray-500">Work</div>
            <div className="text-2xl font-semibold">{stats.totalProjects} Projects</div>
            <div className="text-xs text-gray-400">{stats.totalTasks} Tasks</div>
          </Card>
        </div>
      )}

      <Card className="p-6 border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        <div className="space-y-3">
          {loading ? (
            [...Array(5)].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-white/10 pb-2 animate-pulse">
                <div>
                  <div className="h-3 w-32 rounded bg-gray-100/80 dark:bg-gray-800/60" />
                  <div className="mt-2 h-2 w-40 rounded bg-gray-100/80 dark:bg-gray-800/60" />
                </div>
                <div className="h-2 w-16 rounded bg-gray-100/80 dark:bg-gray-800/60" />
              </div>
            ))
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No users found.</p>
          ) : (
            users.map((user) => (
              <div key={user._id} className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{user.systemRole || 'user'}</div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6 border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
        <h2 className="text-lg font-semibold mb-4">Organizations</h2>
        <div className="space-y-3">
          {loading ? (
            [...Array(5)].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-white/10 pb-2 animate-pulse">
                <div>
                  <div className="h-3 w-32 rounded bg-gray-100/80 dark:bg-gray-800/60" />
                  <div className="mt-2 h-2 w-28 rounded bg-gray-100/80 dark:bg-gray-800/60" />
                </div>
                <div className="h-2 w-16 rounded bg-gray-100/80 dark:bg-gray-800/60" />
              </div>
            ))
          ) : organizations.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No organizations found.</p>
          ) : (
            organizations.map((org) => (
              <div key={org._id} className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{org.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{org.slug}</div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{org.plan}</div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6 border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
        <h2 className="text-lg font-semibold mb-4">Audit Logs</h2>
        <div className="space-y-3">
          {loading ? (
            [...Array(5)].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-white/10 pb-2 animate-pulse">
                <div>
                  <div className="h-3 w-32 rounded bg-gray-100/80 dark:bg-gray-800/60" />
                  <div className="mt-2 h-2 w-24 rounded bg-gray-100/80 dark:bg-gray-800/60" />
                </div>
                <div className="h-2 w-24 rounded bg-gray-100/80 dark:bg-gray-800/60" />
              </div>
            ))
          ) : logs.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No audit logs found.</p>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{log.action}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{log.entityType}</div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
