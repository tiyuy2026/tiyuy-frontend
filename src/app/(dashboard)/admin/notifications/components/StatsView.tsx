'use client';

import { NotificationsChart } from '@/presentation/components/admin/NotificationsChart/NotificationsChart';
import { Bell, TrendingUp, Users } from 'lucide-react';

interface StatsViewProps {
  notificationHistoryAll: { content: any[]; totalElements: number } | null;
  isLoadingHistoryAll: boolean;
  chartData: { date: string; count: number }[];
}

export function StatsView({ notificationHistoryAll, isLoadingHistoryAll, chartData }: StatsViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Enviadas</p>
              <p className="text-3xl font-bold text-blue-700">{notificationHistoryAll?.totalElements || 0}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl">
              <Bell className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Últimos 7 días</p>
              <p className="text-3xl font-bold text-green-700">
                {notificationHistoryAll?.content?.filter((n: any) => new Date(n.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0}
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Destinatarios</p>
              <p className="text-3xl font-bold text-purple-700">
                {notificationHistoryAll?.content?.reduce((acc: number, n: any) => acc + (n.recipientCount || 1), 0) || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <NotificationsChart data={chartData} isLoading={isLoadingHistoryAll} />
    </div>
  );
}
