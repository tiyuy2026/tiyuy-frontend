'use client';

import { Card, CardContent } from '@/presentation/components/ui/Card';
import { Users, CheckCircle, PauseCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface StatsCardsProps {
  totalItems: number;
  totalGroups: number;
  totalChannels: number;
  activeItems: number;
  activePercentage: number;
  suspendedItems: number;
  suspendedGroupsCount: number;
  suspendedChannelsCount: number;
  itemsWithViolations: number;
  groupsWithViolationsCount: number;
  channelsWithViolationsCount: number;
}

export function StatsCards({
  totalItems,
  totalGroups,
  totalChannels,
  activeItems,
  activePercentage,
  suspendedItems,
  suspendedGroupsCount,
  suspendedChannelsCount,
  itemsWithViolations,
  groupsWithViolationsCount,
  channelsWithViolationsCount,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Items */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            <p className="text-xs text-blue-600 font-medium">{totalGroups} grupos &middot; {totalChannels} canales</p>
          </div>
        </CardContent>
      </Card>

      {/* Active Items */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Activos</p>
            <p className="text-2xl font-bold text-gray-900">{activeItems}</p>
            <p className="text-xs text-green-600 font-medium">{activePercentage}% del total</p>
          </div>
        </CardContent>
      </Card>

      {/* Suspended */}
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <PauseCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Suspendidos</p>
            <p className="text-2xl font-bold text-gray-900">{suspendedItems}</p>
            <p className="text-xs text-orange-600 font-medium">{suspendedGroupsCount} grp &middot; {suspendedChannelsCount} chn</p>
          </div>
        </CardContent>
      </Card>

      {/* With Violations */}
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Con Violaciones</p>
            <p className="text-2xl font-bold text-gray-900">{itemsWithViolations}</p>
            <p className="text-xs text-red-600 font-medium">{groupsWithViolationsCount} grp &middot; {channelsWithViolationsCount} chn</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function NewGroupButton() {
  return (
    <Link
      href="/admin/groups/new"
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
    >
      <Plus className="w-5 h-5" />
      Nuevo Grupo
    </Link>
  );
}
