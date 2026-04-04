'use client';

import { useConversionPipeline } from '@/presentation/hooks/useAgentCRM';
import { Filter, ArrowRight, TrendingDown } from 'lucide-react';

export function ConversionPipeline() {
  const { data: pipeline, isLoading } = useConversionPipeline();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Filter className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Embudo de Conversión</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!pipeline?.stages?.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Filter className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Embudo de Conversión</h3>
        </div>
        <p className="text-gray-500 text-center py-4">No hay datos de pipeline</p>
      </div>
    );
  }

  const maxCount = Math.max(...pipeline.stages.map(s => s.count));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Filter className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Embudo de Conversión</h3>
            <p className="text-sm text-gray-500">{pipeline.totalDeals} deals totales</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {pipeline.stages.map((stage, index) => {
          const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
          const isLast = index === pipeline.stages.length - 1;
          
          return (
            <div key={stage.stage} className="relative">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{stage.stageLabel}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{stage.count}</span>
                      {stage.conversionRateToNext > 0 && !isLast && (
                        <span className="text-xs text-green-600">
                          {stage.conversionRateToNext.toFixed(1)}% →
                        </span>
                      )}
                      {stage.dropOffRate > 0 && !isLast && (
                        <span className="text-xs text-red-500 flex items-center gap-0.5">
                          <TrendingDown className="w-3 h-3" />
                          {stage.dropOffRate.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-500 ${
                        stage.stage === 'CLOSED_WON' ? 'bg-green-500' :
                        stage.stage === 'CLOSED_LOST' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {!isLast && (
                <div className="flex justify-center my-1">
                  <ArrowRight className="w-4 h-4 text-gray-300 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
