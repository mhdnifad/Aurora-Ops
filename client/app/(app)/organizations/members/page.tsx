"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useOrganization } from "@/lib/organization-context";
import { useSocket } from '@/lib/socket-context';
import { useGetOrganizationMembers } from "@/lib/hooks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, Users, ArrowLeft, Search, Sparkles, ShieldCheck } from "lucide-react";
import { useT } from '@/lib/useT';

export default function MembersPage() {
  const { currentOrganization, loadOrganizations } = useOrganization();
  const { isConnected } = useSocket();
  const orgId = currentOrganization?._id || "";
  const { data: members, isLoading, refetch, isError } = useGetOrganizationMembers(orgId, 1, 200);
  const t = useT();
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Ensure organizations are loaded if none is set (e.g., fresh session)
    if (!currentOrganization) {
      loadOrganizations().then(() => {
        // refetch members after org load
        refetch();
      }).catch(() => {});
    }
  }, [currentOrganization, loadOrganizations, refetch]);

  const hasOrg = !!orgId;
  const memberList = Array.isArray(members) ? members : [];
  const filteredMembers = useMemo(() => {
    if (!query.trim()) return memberList;
    const needle = query.toLowerCase();
    return memberList.filter((member: any) =>
      member.userId?.firstName?.toLowerCase().includes(needle) ||
      member.userId?.lastName?.toLowerCase().includes(needle) ||
      member.userId?.email?.toLowerCase().includes(needle) ||
      member.role?.toLowerCase().includes(needle)
    );
  }, [memberList, query]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-gradient-to-r from-white via-sky-50/60 to-emerald-50/50 dark:from-gray-900/80 dark:via-slate-900/60 dark:to-emerald-950/40 p-6 shadow-xl">
        <div className="absolute -top-20 -right-16 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-600/10 px-4 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
              <Sparkles className="h-4 w-4" />
              Organization members
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team directory</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Manage people, roles, and access in real time.</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 px-3 py-1">
                <Users className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                {memberList.length} members
              </span>
              {currentOrganization?.name && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 px-3 py-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                  {currentOrganization.name}
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300">
                <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]' : 'bg-amber-500 animate-pulse'}`} />
                {isConnected ? 'Realtime live' : 'Syncing'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('nav.dashboard')}
              </Button>
            </Link>
            <Link href="/settings/members">
              <Button size="sm" className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white">
                {t('settings.preferences')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {!hasOrg && (
        <Card className="p-6 border-dashed border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
          <p className="text-gray-600 dark:text-gray-300">{t('nav.organizations')}</p>
          <div className="mt-4 flex gap-3">
            <Link href="/organizations/new">
              <Button>{t('organizations.create')}</Button>
            </Link>
            <Link href="/settings/members">
              <Button variant="outline">{t('settings.preferences')}</Button>
            </Link>
          </div>
        </Card>
      )}

      {hasOrg && (
        <Card className="p-6 shadow-lg border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-600 dark:text-sky-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Members</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search members"
                  className="h-9 w-64 rounded-lg border border-gray-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5 pl-9 text-sm text-gray-700 dark:text-gray-200 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Refresh'}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="w-6 h-6 animate-spin text-sky-600" />
            </div>
          ) : isError ? (
            <p className="text-red-600 dark:text-red-300">{t('common.error')}</p>
          ) : filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredMembers.map((member: any) => (
                <div key={member._id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white flex items-center justify-center font-semibold">
                      {member.userId?.firstName?.[0] || member.userId?.email?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {member.userId?.firstName} {member.userId?.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{member.userId?.email}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 border border-sky-100 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30 capitalize">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">No members found</div>
          )}
        </Card>
      )}
    </div>
  );
}
