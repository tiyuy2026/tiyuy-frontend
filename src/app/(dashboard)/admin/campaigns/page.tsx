/**
 * Admin Campaigns Page
 * Complete campaign management with RBAC
 */

'use client';

import { useState } from 'react';
import { useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign } from '@/presentation/hooks/useAdmin';
import { useDiscountCodes } from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { Campaign, CreateCampaignRequest, UpdateCampaignRequest, CampaignStatus, DiscountCode } from '@/core/domain/entities/Admin';

export default function CampaignsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { hasPermission } = usePermissions();
  const canManageDiscounts = hasPermission('DISCOUNTS_MANAGE');
  const canCreateDiscounts = hasPermission('DISCOUNTS_CREATE');

  const { data: campaignsData, isLoading, error, refetch } = useCampaigns({ page: 0, size: 50 });
  const { data: discountsData } = useDiscountCodes({ page: 0, size: 100 });
  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();
  const deleteMutation = useDeleteCampaign();

  // Filter campaigns based on search and status
  const filteredCampaigns = campaignsData?.content?.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreateCampaign = async (formData: CreateCampaignRequest) => {
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsEditModalOpen(true);
  };

  const handleUpdateCampaign = async (formData: UpdateCampaignRequest) => {
    if (!selectedCampaign) return;
    
    try {
      await updateMutation.mutateAsync({
        campaignId: selectedCampaign.id,
        request: formData
      });
      setIsEditModalOpen(false);
      setSelectedCampaign(null);
      refetch();
    } catch (error) {
      console.error('Failed to update campaign:', error);
    }
  };

  const handleDeleteCampaign = async (campaignId: number) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await deleteMutation.mutateAsync(campaignId);
      refetch();
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const handleToggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await handleUpdateCampaign({ status: newStatus });
  };

  if (isLoading) {
    return <LoadingState message="Loading campaigns..." />;
  }

  if (error) {
    return <ErrorState 
      message="Failed to load campaigns. Please try again." 
      retry={refetch}
    />;
  }

  if (filteredCampaigns.length === 0) {
    return (
      <EmptyState
        title="No campaigns found"
        description={searchQuery || statusFilter !== 'all' 
          ? "Try adjusting your search or filter criteria." 
          : "Get started by creating your first promotional campaign."
        }
        action={canCreateDiscounts ? {
          label: "Create Campaign",
          onClick: () => setIsCreateModalOpen(true)
        } : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
          <p className="text-gray-600">Manage promotional campaigns and marketing initiatives</p>
        </div>
        {canCreateDiscounts && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create Campaign
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{campaign.title}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                  campaign.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                  campaign.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status}
                </span>
              </div>
              {campaign.description && (
                <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Discount Code:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {campaign.discountCodeCode || 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Target Audience:</span>
                  <span className="text-sm">{campaign.targetAudience?.replace('_', ' ') || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Usage:</span>
                  <span className="text-sm">{campaign.usageCount || 0} uses</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="text-sm font-semibold text-green-600">
                    ${(campaign.revenueGenerated || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Auto Apply:</span>
                  <span className="text-sm">{campaign.autoApply ? 'Yes' : 'No'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="text-sm">
                    {new Date(campaign.startDate).toLocaleDateString()}
                  </span>
                </div>

                {campaign.endDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="text-sm">
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  {canManageDiscounts && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCampaign(campaign)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(campaign)}
                      >
                        {campaign.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modals */}
      <CampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCampaign}
        title="Create Campaign"
        availableDiscounts={discountsData?.content || []}
      />

      {selectedCampaign && (
        <CampaignModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCampaign(null);
          }}
          onSubmit={handleUpdateCampaign}
          title="Edit Campaign"
          campaign={selectedCampaign}
          availableDiscounts={discountsData?.content || []}
        />
      )}
    </div>
  );
}

// Campaign Modal Component
interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  campaign?: Campaign;
  availableDiscounts: DiscountCode[];
}

function CampaignModal({ isOpen, onClose, onSubmit, title, campaign, availableDiscounts }: CampaignModalProps) {
  const [formData, setFormData] = useState({
    title: campaign?.title || campaign?.name || '',
    description: campaign?.description || '',
    discountCodeId: campaign?.discountCodeId || 0,
    startDate: campaign?.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
    endDate: campaign?.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
    targetAudience: campaign?.targetAudience || 'ALL' as any,
    autoApply: campaign?.autoApply ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Campaign Name"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
            <select
              value={formData.discountCodeId}
              onChange={(e) => setFormData({ ...formData, discountCodeId: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a discount code</option>
              {availableDiscounts
                .filter(discount => discount.status === 'ACTIVE')
                .map(discount => (
                  <option key={discount.id} value={discount.id}>
                    {discount.code} - {discount.discountPercentage}% OFF
                  </option>
                ))
              }
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Users</option>
              <option value="NEW_USERS">New Users</option>
              <option value="EXISTING_USERS">Existing Users</option>
              <option value="SUBSCRIBERS">Subscribers</option>
            </select>
          </div>

          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />

          <Input
            label="End Date (optional)"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoApply"
              checked={formData.autoApply}
              onChange={(e) => setFormData({ ...formData, autoApply: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="autoApply" className="text-sm text-gray-700">Auto-apply discount</label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {campaign ? 'Update' : 'Create'} Campaign
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
