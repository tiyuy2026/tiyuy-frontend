'use client';

import { useState, useEffect, useCallback } from 'react';
import { axiosClient } from '@/infrastructure/api/axios-client';
import { Search, Filter, Eye, X, Loader2, AlertCircle, CheckCircle, Clock, MessageSquare, ChevronDown, ChevronLeft, ChevronRight, FileSpreadsheet, FileText } from 'lucide-react';




interface Complaint {
  id: number;
  codigoReclamo: string;
  fechaRegistro: string;
  horaRegistro: string;
  nombre: string;
  domicilio: string;
  dniCe: string;
  telefono: string;
  correo: string;
  tipoBien: string;
  montoReclamado: number | null;
  descripcionBien: string;
  tipoReclamo: string;
  detalleReclamacion: string;
  pedidoConsumidor: string;
  estado: string;
  respuesta: string | null;
  fechaRespuesta: string | null;
  respondidoPorNombre: string | null;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  EN_REVISION: { label: 'En Revisión', color: 'bg-blue-100 text-blue-800', icon: Search },
  RESPONDIDO: { label: 'Respondido', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CERRADO: { label: 'Cerrado', color: 'bg-gray-100 text-gray-800', icon: X },
};

export default function AdminReclamosPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [responderMode, setResponderMode] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [updating, setUpdating] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [showEstadoDropdown, setShowEstadoDropdown] = useState(false);


  const fetchComplaints = useCallback(async () => {

    setLoading(true);
    try {
      const params: any = { page, size: 10 };

      if (search) params.search = search;
      if (estadoFilter) params.estado = estadoFilter;

      const response = await axiosClient.get('/v1/admin/complaints', { params });
      setComplaints(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  }, [search, estadoFilter, page]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selected) return;
    setUpdating(true);
    try {
      const body: any = { estado: newStatus };
      if (newStatus === 'RESPONDIDO') {
        if (!respuesta.trim()) return;
        body.respuesta = respuesta;
      }
      await axiosClient.put(`/v1/admin/complaints/${selected.id}/status`, body);
      setResponderMode(false);
      setRespuesta('');
      setSelected(null);
      fetchComplaints();
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const StatusBadge = ({ estado }: { estado: string }) => {
    const config = STATUS_MAP[estado] || STATUS_MAP.PENDIENTE;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header centrado */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Libro de Reclamaciones</h1>
        <p className="text-sm text-gray-500 mt-1">Gestión de reclamos y quejas según formato Indecopi</p>
      </div>

      {/* Filters - buscador + filtro responsive */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código, DNI, correo o nombre..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="relative w-full sm:min-w-[180px] sm:w-auto">
          <button
            onClick={() => setShowEstadoDropdown(!showEstadoDropdown)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 hover:border-gray-400 transition-colors"
          >
            <span>{estadoFilter ? STATUS_MAP[estadoFilter]?.label || estadoFilter : 'Todos los estados'}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showEstadoDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showEstadoDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowEstadoDropdown(false)} />
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={() => { setEstadoFilter(''); setPage(0); setShowEstadoDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${!estadoFilter ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-700'}`}
                >
                  Todos los estados
                </button>
                {Object.entries(STATUS_MAP).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => { setEstadoFilter(key); setPage(0); setShowEstadoDropdown(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${estadoFilter === key ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-700'}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>


      </div>




      {/* Reportes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          Descargar Reportes
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex flex-col sm:flex-row gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Desde</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hasta</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  const params = new URLSearchParams();
                  if (fechaDesde) params.set('fechaDesde', fechaDesde);
                  if (fechaHasta) params.set('fechaHasta', fechaHasta);
                  const response = await axiosClient.get(`/v1/admin/complaints/reporte/excel?${params.toString()}`, {
                    responseType: 'blob',
                  });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'libro-reclamaciones.xlsx');
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Error descargando Excel:', err);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={async () => {
                try {
                  const params = new URLSearchParams();
                  if (fechaDesde) params.set('fechaDesde', fechaDesde);
                  if (fechaHasta) params.set('fechaHasta', fechaHasta);
                  const response = await axiosClient.get(`/v1/admin/complaints/reporte/pdf?${params.toString()}`, {
                    responseType: 'blob',
                  });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'libro-reclamaciones.pdf');
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Error descargando PDF:', err);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>

          </div>
        </div>
      </div>


      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No se encontraron reclamos
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-blue-600">{c.codigoReclamo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{c.nombre}</div>
                      <div className="text-xs text-gray-500">{c.correo}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        c.tipoReclamo === 'RECLAMO' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                      }`}>
                        {c.tipoReclamo === 'RECLAMO' ? 'Reclamo' : 'Queja'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(c.fechaRegistro).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge estado={c.estado} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelected(c)}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal - Responsive */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 pt-12 sm:pt-12 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setSelected(null); setResponderMode(false); setRespuesta(''); }} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
              <div className="min-w-0 flex-1 mr-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Reclamo {selected.codigoReclamo}</h2>
                <StatusBadge estado={selected.estado} />
              </div>
              <button
                onClick={() => { setSelected(null); setResponderMode(false); setRespuesta(''); }}
                className="p-1 hover:bg-gray-100 rounded-lg shrink-0"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Datos del Consumidor */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Datos del Consumidor</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="break-words"><span className="text-gray-500">Nombre:</span> <span className="text-gray-900">{selected.nombre}</span></div>
                  <div className="break-words"><span className="text-gray-500">DNI/CE:</span> <span className="text-gray-900">{selected.dniCe}</span></div>
                  <div className="break-words"><span className="text-gray-500">Domicilio:</span> <span className="text-gray-900">{selected.domicilio}</span></div>
                  <div className="break-words"><span className="text-gray-500">Teléfono:</span> <span className="text-gray-900">{selected.telefono || '-'}</span></div>
                  <div className="col-span-1 sm:col-span-2 break-words"><span className="text-gray-500">Correo:</span> <span className="text-gray-900">{selected.correo}</span></div>
                </div>
              </div>

              {/* Datos del Bien */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Bien Contratado</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="break-words"><span className="text-gray-500">Tipo:</span> <span className="text-gray-900">{selected.tipoBien === 'PRODUCTO' ? 'Producto' : 'Servicio'}</span></div>
                  <div className="break-words"><span className="text-gray-500">Monto:</span> <span className="text-gray-900">{selected.montoReclamado ? `S/ ${selected.montoReclamado.toFixed(2)}` : '-'}</span></div>
                  <div className="col-span-1 sm:col-span-2 break-words"><span className="text-gray-500">Descripción:</span> <span className="text-gray-900">{selected.descripcionBien}</span></div>
                </div>
              </div>

              {/* Detalle */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Detalle del {selected.tipoReclamo === 'RECLAMO' ? 'Reclamo' : 'Queja'}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">Descripción:</span>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3 text-sm leading-relaxed">{selected.detalleReclamacion}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Pedido del Consumidor:</span>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3 text-sm leading-relaxed">{selected.pedidoConsumidor}</p>
                  </div>
                </div>
              </div>

              {/* Respuesta */}
              {selected.respuesta && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Respuesta</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-900">{selected.respuesta}</p>
                    {selected.respondidoPorNombre && (
                      <p className="text-xs text-gray-500 mt-2">
                        Respondido por: {selected.respondidoPorNombre}
                        {selected.fechaRespuesta && ` - ${new Date(selected.fechaRespuesta).toLocaleDateString('es-PE')}`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-gray-200 pt-4">
                {responderMode ? (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Escriba la respuesta al consumidor..."
                      value={respuesta}
                      onChange={(e) => setRespuesta(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex flex-col sm:flex-row gap-2 justify-end">
                      <button
                        onClick={() => { setResponderMode(false); setRespuesta(''); }}
                        className="w-full sm:w-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('RESPONDIDO')}
                        disabled={updating || !respuesta.trim()}
                        className="w-full sm:w-auto px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {updating ? 'Guardando...' : 'Responder y cerrar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    {selected.estado === 'PENDIENTE' && (
                      <button
                        onClick={() => handleUpdateStatus('EN_REVISION')}
                        disabled={updating}
                        className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Marcar en Revisión
                      </button>
                    )}
                    {selected.estado === 'EN_REVISION' && (
                      <button
                        onClick={() => setResponderMode(true)}
                        className="w-full sm:w-auto px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-1 justify-center"
                      >
                        <MessageSquare className="w-4 h-4" /> Responder
                      </button>
                    )}
                    {(selected.estado === 'RESPONDIDO' || selected.estado === 'EN_REVISION') && (
                      <button
                        onClick={() => handleUpdateStatus('CERRADO')}
                        disabled={updating}
                        className="w-full sm:w-auto px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Cerrar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
