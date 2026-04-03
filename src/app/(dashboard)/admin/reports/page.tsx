'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { usePendingReports, useReviewReport } from '@/presentation/hooks/useModeration';
import { PropertyReport } from '@/core/domain/entities/Moderation';

export default function AdminReportsPage() {
  const { data, isLoading } = usePendingReports();
  const reviewMutation = useReviewReport();
  const [selectedReport, setSelectedReport] = useState<PropertyReport | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const handleApprove = async () => {
    if (!selectedReport) return;
    await reviewMutation.mutateAsync({
      reportId: selectedReport.id,
      approve: true,
      notes: reviewNotes,
    });
    setSelectedReport(null);
    setReviewNotes('');
  };

  const handleReject = async () => {
    if (!selectedReport) return;
    await reviewMutation.mutateAsync({
      reportId: selectedReport.id,
      approve: false,
      notes: reviewNotes,
    });
    setSelectedReport(null);
    setReviewNotes('');
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reportes Pendientes</h1>
          <p className="text-gray-600 mt-1">
            {data?.totalElements || 0} reportes esperando revisión
          </p>
        </div>

        {isLoading && <p>Cargando...</p>}

        {!isLoading && data && data.content.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-800">
              No hay reportes pendientes
            </h3>
          </div>
        )}

        {!isLoading && data && data.content.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Propiedad</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Reportado por</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.content.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{report.propertyTitle}</div>
                      <div className="text-sm text-gray-500">ID: {report.propertyId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        {report.reason}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.reporterName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {report.createdAt.toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Revisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de revisión */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">Revisar Reporte</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <strong>Propiedad:</strong> {selectedReport.propertyTitle}
                </div>
                <div>
                  <strong>Motivo:</strong> {selectedReport.reason}
                </div>
                <div>
                  <strong>Descripción:</strong> {selectedReport.description}
                </div>
                <div>
                  <strong>Reportado por:</strong> {selectedReport.reporterName}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Notas internas</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Razón de la decisión..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setReviewNotes('');
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={reviewMutation.isPending}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700"
                >
                  Rechazar
                </button>
                <button
                  onClick={handleApprove}
                  disabled={reviewMutation.isPending}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
                >
                  Aprobar y despublicar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
