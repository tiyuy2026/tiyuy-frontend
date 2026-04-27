/**
 * Admin Automation States Component
 * Visual representation of automated backend states
 * Based on real backend automation logic
 */

'use client';

import { useState, useEffect } from 'react';
import { useCampaigns, useDiscountCodes } from '@/presentation/hooks/useAdmin';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Campaign, DiscountCode } from '@/core/domain/entities/Admin';

interface AutomationState {
  id: string;
  type: 'campaign' | 'discount';
  title: string;
  status: 'scheduled' | 'active' | 'expired' | 'inactive';
  alerts: {
    lastWeek: boolean;
    lastDay: boolean;
    usageLimit: boolean;
  };
  dates: {
    startDate: string;
    endDate: string;
  };
  metrics?: {
    currentUsage?: number;
    usageLimit?: number;
    remainingUses?: number;
  };
}

export function AdminAutomationStates() {
  const [automationStates, setAutomationStates] = useState<AutomationState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get campaigns and discounts from backend
  const { data: campaignsData } = useCampaigns({ page: 0, size: 100 });
  const { data: discountsData } = useDiscountCodes({ page: 0, size: 100 });

  useEffect(() => {
    if (campaignsData && discountsData) {
      // Process campaigns
      const campaignStates: AutomationState[] = campaignsData.content.map(campaign => {
        const now = new Date();
        const endDate = new Date(campaign.endDate);
        const timeDiff = endDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return {
          id: `campaign-${campaign.id}`,
          type: 'campaign' as const,
          title: campaign.title,
          status: mapCampaignStatus(campaign.status),
          alerts: {
            lastWeek: daysDiff <= 7 && daysDiff > 0 && campaign.status === 'ACTIVE',
            lastDay: daysDiff <= 1 && daysDiff > 0 && campaign.status === 'ACTIVE',
            usageLimit: false // Campaigns don't have usage limits
          },
          dates: {
            startDate: campaign.startDate.toISOString(),
            endDate: campaign.endDate.toISOString()
          }
        };
      });

      // Process discounts
      const discountStates: AutomationState[] = discountsData.content.map(discount => {
        const usageLimitReached = discount.usageLimit && discount.currentUsage >= discount.usageLimit;
        const usageLimitWarning = discount.usageLimit && discount.currentUsage >= (discount.usageLimit * 0.8); // 80% threshold
        
        return {
          id: `discount-${discount.id}`,
          type: 'discount' as const,
          title: discount.code,
          status: mapDiscountStatus(discount.status),
          alerts: {
            lastWeek: false, // Discounts don't have week alerts
            lastDay: false, // Discounts don't have day alerts
            usageLimit: Boolean(usageLimitWarning || usageLimitReached)
          },
          dates: {
            startDate: discount.startDate?.toISOString() || '',
            endDate: discount.endDate?.toISOString() || ''
          },
          metrics: {
            currentUsage: discount.currentUsage,
            usageLimit: discount.usageLimit,
            remainingUses: discount.usageLimit ? discount.usageLimit - discount.currentUsage : undefined
          }
        };
      });

      setAutomationStates([...campaignStates, ...discountStates]);
      setIsLoading(false);
    }
  }, [campaignsData, discountsData]);

  // Map backend campaign status to automation state
  const mapCampaignStatus = (backendStatus: string): 'scheduled' | 'active' | 'expired' | 'inactive' => {
    switch (backendStatus) {
      case 'SCHEDULED': return 'scheduled';
      case 'ACTIVE': return 'active';
      case 'EXPIRED': return 'expired';
      case 'INACTIVE': return 'inactive';
      default: return 'inactive';
    }
  };

  // Map backend discount status to automation state
  const mapDiscountStatus = (backendStatus: string): 'scheduled' | 'active' | 'expired' | 'inactive' => {
    switch (backendStatus) {
      case 'ACTIVE': return 'active';
      case 'INACTIVE': return 'inactive';
      case 'EXPIRED': return 'expired';
      default: return 'inactive';
    }
  };

  // Get status color and icon
  const getStatusInfo = (status: 'scheduled' | 'active' | 'expired' | 'inactive') => {
    switch (status) {
      case 'scheduled':
        return { color: 'bg-blue-100 text-blue-800', icon: 'calendar' };
      case 'active':
        return { color: 'bg-green-100 text-green-800', icon: 'play' };
      case 'expired':
        return { color: 'bg-red-100 text-red-800', icon: 'stop' };
      case 'inactive':
        return { color: 'bg-gray-100 text-gray-800', icon: 'pause' };
    }
  };

  // Get alert color
  const getAlertColor = (alertType: 'lastWeek' | 'lastDay' | 'usageLimit') => {
    switch (alertType) {
      case 'lastWeek':
        return 'bg-orange-100 text-orange-800';
      case 'lastDay':
        return 'bg-red-100 text-red-800';
      case 'usageLimit':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Check if any alert is active
  const hasActiveAlerts = (alerts: { lastWeek: boolean; lastDay: boolean; usageLimit: boolean }) => {
    return alerts.lastWeek || alerts.lastDay || alerts.usageLimit;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading automation states...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Automation States</h3>
        <p className="text-sm text-gray-600">Real-time status of campaigns and discounts based on backend automation</p>
      </div>

      {/* Automation States Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {automationStates.map((state) => {
          const statusInfo = getStatusInfo(state.status);
          const hasAlerts = hasActiveAlerts(state.alerts);

          return (
            <Card key={state.id} className={`${hasAlerts ? 'ring-2 ring-orange-200' : ''}`}>
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {state.status.charAt(0).toUpperCase() + state.status.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        state.type === 'campaign' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {state.type === 'campaign' ? 'Campaign' : 'Discount'}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 truncate" title={state.title}>
                      {state.title}
                    </h4>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-sm text-gray-600 mb-3">
                  {state.dates.startDate && (
                    <div>Start: {new Date(state.dates.startDate).toLocaleDateString()}</div>
                  )}
                  {state.dates.endDate && (
                    <div>End: {new Date(state.dates.endDate).toLocaleDateString()}</div>
                  )}
                </div>

                {/* Metrics (for discounts) */}
                {state.metrics && state.metrics.usageLimit && (
                  <div className="text-sm text-gray-600 mb-3">
                    <div>Usage: {state.metrics.currentUsage}/{state.metrics.usageLimit}</div>
                    {state.metrics.remainingUses !== undefined && (
                      <div>Remaining: {state.metrics.remainingUses}</div>
                    )}
                  </div>
                )}

                {/* Alerts */}
                {hasAlerts && (
                  <div className="space-y-1">
                    {state.alerts.lastWeek && (
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getAlertColor('lastWeek')}`}>
                        Last Week Alert
                      </div>
                    )}
                    {state.alerts.lastDay && (
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getAlertColor('lastDay')}`}>
                        Last Day Alert
                      </div>
                    )}
                    {state.alerts.usageLimit && (
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getAlertColor('usageLimit')}`}>
                        Usage Limit Alert
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {automationStates.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {automationStates.filter(s => s.status === 'scheduled').length}
              </div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {automationStates.filter(s => s.status === 'expired').length}
              </div>
              <div className="text-sm text-gray-600">Expired</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {automationStates.filter(s => hasActiveAlerts(s.alerts)).length}
              </div>
              <div className="text-sm text-gray-600">With Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
