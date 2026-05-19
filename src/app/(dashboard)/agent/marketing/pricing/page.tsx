/**
 * Agent Marketing Pricing Page
 * Agents can view campaign pricing
 */

'use client';

import { useAgentPricingList } from '@/presentation/hooks/useAgent';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';

export default function AgentMarketingPricingPage() {
  const { data: pricingList, isLoading, error, refetch } = useAgentPricingList();

  if (isLoading) return <LoadingState message="Cargando precios..." />;
  if (error) return <ErrorState message="Error al cargar precios." retry={refetch} />;

  const pricingData = pricingList || [];

  if (pricingData.length === 0) {
    return (
      <EmptyState
        title="Sin precios disponibles"
        description="No hay configuraciones de precios disponibles."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Precios de Campanas</h2>
        <p className="text-gray-600">Consulta los precios por ubicacion</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricingData.map((pricing: any) => (
          <Card key={pricing.id} className="border-t-4 border-t-blue-500">
            <CardHeader>
              <CardTitle className="text-lg">{pricing.name}</CardTitle>
              {pricing.description && <p className="text-sm text-gray-600">{pricing.description}</p>}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ubicacion:</span>
                  <span className="text-sm font-medium">{pricing.placementLocation || pricing.promotionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio PEN:</span>
                  <span className="text-sm font-semibold text-green-600">
                    S/ {pricing.pricePen?.toLocaleString() || pricing.pricePerDay?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio USD:</span>
                  <span className="text-sm font-semibold text-green-600">
                    $ {pricing.priceUsd?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="pt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pricing.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {pricing.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
