/**
 * Admin Pricing Preview Page
 * Real-time discount calculation and preview
 */

'use client';

import { useState } from 'react';
import { useDiscountCodes } from '@/presentation/hooks/useAdmin';
import { useSubscriptionPlans } from '@/presentation/hooks/useAdmin';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { 
  DiscountCode, 
  DiscountCalculationResult,
  SubscriptionPlan 
} from '@/core/domain/entities/Admin';

export default function PricingPreviewPage() {
  const [discountCode, setDiscountCode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [originalAmount, setOriginalAmount] = useState<number>(0);
  const [calculationResult, setCalculationResult] = useState<DiscountCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { data: discountsData } = useDiscountCodes({ page: 0, size: 100 });
  const { data: plans } = useSubscriptionPlans();

  // Get available discount codes (only active ones)
  const availableDiscounts = discountsData?.content?.filter(
    discount => discount.status === 'ACTIVE'
  ) || [];

  // Handle discount validation and calculation
  const handleCalculateDiscount = async () => {
    if (!discountCode || !selectedPlan) {
      setError('Please enter a discount code and select a plan');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Find the plan to get its price
      const plan = plans?.find(p => p.name === selectedPlan);
      const amount = originalAmount || plan?.priceInPen || 0;

      if (amount <= 0) {
        setError('Please enter a valid amount or select a plan with a price');
        setIsLoading(false);
        return;
      }

      // Call the backend validation endpoint
      const response = await fetch(`/admin/discounts/validate?code=${encodeURIComponent(discountCode)}&tier=${selectedPlan}&userId=${selectedUserId || ''}&originalAmount=${amount}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to validate discount code');
      }

      const result: DiscountCalculationResult = await response.json();
      setCalculationResult(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate discount');
      setCalculationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick calculation for a plan
  const handleQuickCalculate = (planName: string, code: string) => {
    setSelectedPlan(planName);
    setDiscountCode(code);
    setOriginalAmount(0); // Use plan price instead
  };

  // Reset form
  const handleReset = () => {
    setDiscountCode('');
    setSelectedPlan('');
    setSelectedUserId('');
    setOriginalAmount(0);
    setCalculationResult(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pricing Preview</h2>
          <p className="text-gray-600">Real-time discount calculation and pricing preview</p>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Discount Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Enter discount code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <Button 
                  onClick={() => setDiscountCode('')}
                  variant="outline"
                  disabled={!discountCode}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a plan...</option>
                {plans?.map((plan) => (
                  <option key={plan.id} value={plan.name}>
                    {plan.displayName} - S/ {plan.priceInPen.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* User ID (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID (Optional)</label>
              <input
                type="number"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                placeholder="Enter user ID for user-specific discounts"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Amount (PEN)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(Number(e.target.value))}
                placeholder="Leave empty to use plan price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                If specified, this amount will be used instead of the plan price
              </p>
            </div>

            {/* Calculate Button */}
            <Button 
              onClick={handleCalculateDiscount}
              disabled={isLoading || !discountCode || !selectedPlan}
              className="w-full"
            >
              {isLoading ? 'Calculating...' : 'Calculate Discount'}
            </Button>

            {/* Reset Button */}
            <Button 
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              Reset
            </Button>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Display */}
        <Card>
          <CardHeader>
            <CardTitle>Calculation Result</CardTitle>
          </CardHeader>
          <CardContent>
            {calculationResult ? (
              <div className="space-y-4">
                {/* Validity Status */}
                <div className={`p-3 rounded-lg ${
                  calculationResult.valid 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      calculationResult.valid ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className={`font-medium ${
                      calculationResult.valid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {calculationResult.valid ? 'Valid Discount Code' : 'Invalid Discount Code'}
                    </span>
                  </div>
                  {calculationResult.message && (
                    <p className={`text-sm mt-1 ${
                      calculationResult.valid ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {calculationResult.message}
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                {calculationResult.valid && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Original Price:</span>
                      <span className="font-medium">S/ {calculationResult.originalPrice.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Discount ({calculationResult.discountPercentage}%):</span>
                      <span className="font-medium text-green-600">
                        -S/ {calculationResult.discountAmount.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-lg font-semibold">Final Price:</span>
                      <span className="text-lg font-bold text-blue-600">
                        S/ {calculationResult.finalPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Savings Highlight */}
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <p className="text-sm text-green-800">You save</p>
                      <p className="text-2xl font-bold text-green-600">
                        S/ {calculationResult.discountAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-700">
                        {Math.round((calculationResult.discountAmount / calculationResult.originalPrice) * 100)}% off
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p>Enter a discount code and select a plan to see pricing</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Discounts */}
      <Card>
        <CardHeader>
          <CardTitle>Available Discount Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {availableDiscounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableDiscounts.map((discount) => (
                <div key={discount.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-lg bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {discount.code}
                    </span>
                    <span className="text-sm text-green-600 font-semibold">
                      {discount.discountPercentage}% OFF
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Usage: {discount.currentUsage} / {discount.usageLimit}</div>
                    <div>Type: {discount.applicability.replace('_', ' ')}</div>
                    {discount.endDate && (
                      <div>Expires: {new Date(discount.endDate).toLocaleDateString()}</div>
                    )}
                  </div>

                  {/* Quick Apply Buttons */}
                  <div className="mt-3 space-y-1">
                    {plans?.slice(0, 2).map((plan) => (
                      <Button
                        key={plan.id}
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickCalculate(plan.name || '', discount.code)}
                        className="w-full text-xs"
                      >
                        Apply to {plan.displayName}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No active discount codes available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Pricing Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Pricing Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans?.map((plan) => (
              <div key={plan.id} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900">{plan.displayName}</h4>
                <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600">
                    S/ {plan.priceInPen.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    ${plan.priceInUsd.toLocaleString()} USD
                  </div>
                  <div className="text-xs text-gray-500">
                    {plan.billingCycle}
                  </div>
                </div>
                
                {/* Quick Test Button */}
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedPlan(plan.name || '');
                      setOriginalAmount(plan.priceInPen);
                    }}
                    className="w-full"
                  >
                    Test Pricing
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
