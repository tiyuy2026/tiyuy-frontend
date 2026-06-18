'use client';

import { useEffect, useState } from 'react';
import { useMyPayments, useTotalPaid } from '@/presentation/hooks/usePayments';
import { Minus } from 'lucide-react';

interface PaymentStats {
  totalPaid: number;
  currency: string;
}

export function PaymentHistoryClient() {
  const { data: payments, isLoading, error } = useMyPayments();
  const { data: totalData } = useTotalPaid();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Filtrar pagos
  const filteredPayments =
    payments?.content?.filter((payment) => {
      const matchesStatus =
        filterStatus === 'all' || payment.status === filterStatus;

      const matchesSearch =
        searchTerm === '' ||
        payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    }) || [];

  // Paginar
  const totalPages = Math.ceil(
    (filteredPayments?.length || 0) / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedPayments = filteredPayments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const stats: PaymentStats = {
    totalPaid: totalData?.totalPaid || 0,
    currency: totalData?.currency || 'PEN',
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error al cargar pagos
          </h3>
          <p className="text-red-600">{String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-8 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            {stats.currency}{' '}
            {stats.totalPaid.toLocaleString('es-PE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className="opacity-90">Total pagado en TIYUY</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Buscar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar por descripción o método..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="APPROVED">Aprobados</option>
              <option value="PENDING">Pendientes</option>
              <option value="FAILED">Fallidos</option>
            </select>
          </div>

          {/* Resultados */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resultados
            </label>
            <div className="text-lg font-semibold text-blue-600">
              {filteredPayments?.length || 0} pagos encontrados
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-lg">Cargando pagos...</p>
            </div>
          ) : paginatedPayments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Minus className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron pagos
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'No hay resultados para tu búsqueda.'
                  : 'No tienes pagos registrados.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {paginatedPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(payment.createdAt).toLocaleDateString(
                          'es-PE',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        {payment.description}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {payment.currency}{' '}
                        {payment.amount.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`
                            px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${
                              payment.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'FAILED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          `}
                        >
                          {payment.status === 'APPROVED'
                            ? 'Aprobado'
                            : payment.status === 'FAILED'
                            ? 'Fallido'
                            : 'Pendiente'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.paymentMethod}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() =>
                            window.open(
                              `/payments/confirmation/${payment.transactionId}`,
                              '_blank'
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                <span className="text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
