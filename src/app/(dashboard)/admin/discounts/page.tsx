/**
 * Admin Discount Codes Page
 * Complete discount code management with RBAC
 */

'use client';

import { useState } from 'react';
import { useDiscountCodes, useCreateDiscountCode, useUpdateDiscountCode, useDeleteDiscountCode } from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { DiscountCode, CreateDiscountCodeRequest, UpdateDiscountCodeRequest, DiscountApplicability, DiscountCodeStatus } from '@/core/domain/entities/Admin';

export default function DiscountsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { hasPermission } = usePermissions();
  const canManageDiscounts = hasPermission('DISCOUNTS_MANAGE');
  const canCreateDiscounts = hasPermission('DISCOUNTS_CREATE');

  const { data: discountsData, isLoading, error, refetch } = useDiscountCodes({ page: 0, size: 50 });
  const createMutation = useCreateDiscountCode();
  const updateMutation = useUpdateDiscountCode();
  const deleteMutation = useDeleteDiscountCode();

  // Filter discounts based on search and status
  const filteredDiscounts = discountsData?.content?.filter(discount => {
    const matchesSearch = discount.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || discount.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreateDiscount = async (formData: CreateDiscountCodeRequest) => {
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create discount:', error);
    }
  };

  const handleEditDiscount = (discount: DiscountCode) => {
    setSelectedDiscount(discount);
    setIsEditModalOpen(true);
  };

  const handleUpdateDiscount = async (formData: UpdateDiscountCodeRequest) => {
    if (!selectedDiscount) return;
    
    try {
      await updateMutation.mutateAsync({
        codeId: selectedDiscount.id,
        request: formData
      });
      setIsEditModalOpen(false);
      setSelectedDiscount(null);
      refetch();
    } catch (error) {
      console.error('Failed to update discount:', error);
    }
  };

  const handleDeleteDiscount = async (discountId: number) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;
    
    try {
      await deleteMutation.mutateAsync(discountId);
      refetch();
    } catch (error) {
      console.error('Failed to delete discount:', error);
    }
  };

  const handleToggleStatus = async (discount: DiscountCode) => {
    const newStatus = discount.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await handleUpdateDiscount({ status: newStatus });
  };

  if (isLoading) {
    return <LoadingState message="Loading discount codes..." />;
  }

  if (error) {
    return <ErrorState 
      message="Failed to load discount codes. Please try again." 
      retry={refetch}
    />;
  }

  if (filteredDiscounts.length === 0) {
    return (
      <EmptyState
        title="No discount codes found"
        description={searchQuery || statusFilter !== 'all' 
          ? "Try adjusting your search or filter criteria." 
          : "Get started by creating your first discount code."
        }
        action={canCreateDiscounts ? {
          label: "Create Discount Code",
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
          <h2 className="text-2xl font-bold text-gray-900">Discount Codes</h2>
          <p className="text-gray-600">Manage promotional discount codes and campaigns</p>
        </div>
        {canCreateDiscounts && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create Discount Code
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search discount codes..."
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
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="EXPIRED">Expired</option>
              <option value="DEPLETED">Depleted</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Discount Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDiscounts.map((discount) => (
          <Card key={discount.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{discount.code}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  discount.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  discount.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                  discount.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {discount.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold text-green-600">{discount.discountPercentage}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Usage:</span>
                  <span className="text-sm">
                    {discount.currentUsage} / {discount.usageLimit}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Applicability:</span>
                  <span className="text-sm">{discount.applicability.replace('_', ' ')}</span>
                </div>

                {discount.endDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className="text-sm">
                      {new Date(discount.endDate).toLocaleDateString()}
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
                        onClick={() => handleEditDiscount(discount)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(discount)}
                      >
                        {discount.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDiscount(discount.id)}
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
      <DiscountCodeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDiscount}
        title="Create Discount Code"
      />

      {selectedDiscount && (
        <DiscountCodeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedDiscount(null);
          }}
          onSubmit={handleUpdateDiscount}
          title="Edit Discount Code"
          discount={selectedDiscount}
        />
      )}
    </div>
  );
}

// Discount Code Modal Component
interface DiscountCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  discount?: DiscountCode;
}

function DiscountCodeModal({ isOpen, onClose, onSubmit, title, discount }: DiscountCodeModalProps) {
  const [formData, setFormData] = useState({
    code: discount?.code || '',
    discountPercentage: discount?.discountPercentage || 10,
    applicability: discount?.applicability || 'GLOBAL' as DiscountApplicability,
    usageLimit: discount?.usageLimit || 100,
    singleUse: discount?.singleUse || false,
    startDate: discount?.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '',
    endDate: discount?.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
    applicablePlan: discount?.applicablePlan || undefined,
    minimumAmount: discount?.minimumAmount || undefined,
    maximumDiscount: discount?.maximumDiscount || undefined,
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
            label="Discount Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
            disabled={!!discount} // Don't allow editing code after creation
          />
          
          <Input
            label="Discount Percentage"
            type="number"
            min="1"
            max="100"
            value={formData.discountPercentage}
            onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Applicability</label>
            <select
              value={formData.applicability}
              onChange={(e) => setFormData({ ...formData, applicability: e.target.value as DiscountApplicability })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="GLOBAL">Global</option>
              <option value="USER_SPECIFIC">User Specific</option>
              <option value="AGENCY_SPECIFIC">Agency Specific</option>
              <option value="PLAN_SPECIFIC">Plan Specific</option>
              <option value="PROJECT_SPECIFIC">Project Specific</option>
            </select>
          </div>

          <Input
            label="Usage Limit"
            type="number"
            min="1"
            value={formData.usageLimit}
            onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
            required
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="singleUse"
              checked={formData.singleUse}
              onChange={(e) => setFormData({ ...formData, singleUse: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="singleUse" className="text-sm text-gray-700">Single use only</label>
          </div>

          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />

          <Input
            label="End Date (optional)"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {discount ? 'Update' : 'Create'} Discount Code
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
