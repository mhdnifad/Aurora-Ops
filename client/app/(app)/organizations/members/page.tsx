"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useOrganization } from "@/lib/organization-context";
import { useGetOrganizationMembers } from "@/lib/hooks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, Users, ArrowLeft } from "lucide-react";
import { useT } from '@/lib/useT';

export default function MembersPage() {
  const { currentOrganization, loadOrganizations } = useOrganization();
  const orgId = currentOrganization?._id || "";
  const { data: members, isLoading, refetch, isError } = useGetOrganizationMembers(orgId, 1, 200);
  const t = useT();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('nav.dashboard')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('nav.organizations')}</h1>
          <p className="text-gray-600">{t('settings.preferences')}</p>
        </div>
      </div>

      {!hasOrg && (
        <Card className="p-6 border-dashed">
          <p className="text-gray-600">{t('nav.organizations')}</p>
          <div className="mt-4 flex gap-3">
            <Link href="/organizations/new">
              <Button>{t('projects.create')}</Button>
            </Link>
            <Link href="/settings/members">
              <Button variant="outline">{t('settings.preferences')}</Button>
            </Link>
          </div>
        </Card>
      )}

      {hasOrg && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <h2 className="text-lg font-semibold">{t('nav.organizations')} ({memberList.length})</h2>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : t('common.edit')}
              </Button>
              <Link href="/settings/members">
                <Button size="sm">{t('settings.preferences')}</Button>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : isError ? (
            <p className="text-red-600">{t('common.error')}</p>
          ) : memberList.length > 0 ? (
            <div className="divide-y">
              {memberList.map((member: any) => (
                <div key={member._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                      {member.userId?.firstName?.[0] || member.userId?.email?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.userId?.firstName} {member.userId?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{member.userId?.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm capitalize border">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">{t('tasks.empty')}</div>
          )}
        </Card>
      )}
    </div>
  );
}
