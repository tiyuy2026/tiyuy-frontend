'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp, MapPin, Home, ChevronRight, RefreshCw, BarChart3, Shield, Building2,
  DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Clock, Layers, LandPlot, FolderGit, X, ChevronDown, Search
} from 'lucide-react';
import { publicApiClient } from '@/infrastructure/api/axios-client';

interface ViviendaIndex { metadata: any; kpis: any; variation: any; districts: any[]; trend: any[]; }
interface LoteIndex { totalCount: number; avgM2Terreno: number; avgTotalPrice: number; avgTotalArea: number; districts: any[]; trend: any[]; variation: any; }
interface ProyectoIndex { totalProjects: number; avgPriceFrom: number; totalAvailable: number; avgAreaFrom: number; projects: any[]; phaseBreakdown: any[]; districtBreakdown: any[]; }
type Vertical = 'viviendas' | 'departamentos' | 'lotes' | 'proyectos';

const formatPrice = (p: number) => !p ? 'S/ 0' : 'S/ ' + Math.round(p).toLocaleString('es-PE');
const formatM2 = (v: number) => !v ? 'S/ 0' : 'S/ ' + Math.round(v).toLocaleString('es-PE');
const formatCompact = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n >= 1_000 ? (n / 1_000).toFixed(1) + 'K' : n.toLocaleString('es-PE');
const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Set','Oct','Nov','Dic'];

export default function PricePerM2Page() {
  const [vertical, setVertical] = useState<Vertical>('viviendas');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [txType, setTxType] = useState('SALE');
  const [propType, setPropType] = useState('');
  const [regionId, setRegionId] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [projPhase, setProjPhase] = useState('');

  const [viviendaData, setViviendaData] = useState<ViviendaIndex | null>(null);
  const [loteData, setLoteData] = useState<LoteIndex | null>(null);
  const [proyectoData, setProyectoData] = useState<ProyectoIndex | null>(null);
  const [tooltipPt, setTooltipPt] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Dynamic location data
  const [regions, setRegions] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [regionSearch, setRegionSearch] = useState('');
  const [provinceSearch, setProvinceSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  const regionRef = useRef<HTMLDivElement>(null);
  const provinceRef = useRef<HTMLDivElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);

  const filteredRegions = useMemo(() => {
    if (!regionSearch) return regions;
    return regions.filter(r => r.toLowerCase().includes(regionSearch.toLowerCase()));
  }, [regions, regionSearch]);

  const filteredProvinces = useMemo(() => {
    if (!provinceSearch) return provinces;
    return provinces.filter(p => p.toLowerCase().includes(provinceSearch.toLowerCase()));
  }, [provinces, provinceSearch]);

  const filteredDistricts = useMemo(() => {
    if (!districtSearch) return districts;
    return districts.filter(d => d.toLowerCase().includes(districtSearch.toLowerCase()));
  }, [districts, districtSearch]);

  // Fetch locations on mount
  useEffect(() => {
    publicApiClient.get<string[]>('/analytics/locations/regions')
      .then(res => setRegions(res.data))
      .catch(() => {});
  }, []);

  // Fetch provinces when region changes
  useEffect(() => {
    if (!regionId) { setProvinces([]); setProvinceId(''); setProvinceSearch(''); return; }
    publicApiClient.get<string[]>('/analytics/locations/provinces', { params: { region: regionId } })
      .then(res => setProvinces(res.data))
      .catch(() => setProvinces([]));
  }, [regionId]);

  // Fetch districts when province changes
  useEffect(() => {
    if (!provinceId) { setDistricts([]); setDistrictId(''); setDistrictSearch(''); return; }
    publicApiClient.get<string[]>('/analytics/locations/districts', { params: { province: provinceId } })
      .then(res => setDistricts(res.data))
      .catch(() => setDistricts([]));
  }, [provinceId]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) setShowRegionDropdown(false);
      if (provinceRef.current && !provinceRef.current.contains(e.target as Node)) setShowProvinceDropdown(false);
      if (districtRef.current && !districtRef.current.contains(e.target as Node)) setShowDistrictDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch data on filter change
  useEffect(() => { fetchData(); }, [vertical, txType, propType, districtId, projPhase]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (vertical === 'viviendas') {
        const params = new URLSearchParams({ transactionType: txType });
        if (propType) params.set('propertyType', propType);
        if (districtId) params.set('district', districtId);
        const res = await publicApiClient.get<ViviendaIndex>(`/analytics/index/viviendas?${params}`);
        setViviendaData(res.data);
      } else if (vertical === 'departamentos') {
        const params = new URLSearchParams({ transactionType: txType, propertyType: 'APARTMENT' });
        if (districtId) params.set('district', districtId);
        const res = await publicApiClient.get<ViviendaIndex>(`/analytics/index/viviendas?${params}`);
        setViviendaData(res.data);
      } else if (vertical === 'lotes') {
        const res = await publicApiClient.get<LoteIndex>(`/analytics/index/lotes?transactionType=${txType}`);
        setLoteData(res.data);
      } else {
        const params = new URLSearchParams();
        if (districtId) params.set('district', districtId);
        if (projPhase) params.set('phase', projPhase);
        const res = await publicApiClient.get<ProyectoIndex>(`/analytics/index/proyectos?${params}`);
        setProyectoData(res.data);
      }
      setLastUpdated(new Date().toLocaleString('es-PE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }));
    } catch { console.error('Error fetching index'); }
    finally { setLoading(false); }
  }, [vertical, txType, propType, districtId, projPhase]);

  const chartTrend = useMemo(() => {
    if ((vertical === 'viviendas' || vertical === 'departamentos') && viviendaData) return viviendaData.trend.filter((p: any) => p.medianM2 !== null);
    if (vertical === 'lotes' && loteData) return loteData.trend.filter((p: any) => p.medianM2 !== null);
    return [];
  }, [vertical, viviendaData, loteData]);

  const chartW = 700, chartH = 200, pad = { top: 15, right: 15, bottom: 30, left: 55 };
  const chartMax = useMemo(() => chartTrend.length > 0 ? Math.max(...chartTrend.map((p: any) => p.medianM2 as number)) * 1.15 : 1000, [chartTrend]);
  const chartMin = useMemo(() => chartTrend.length > 0 ? Math.min(...chartTrend.map((p: any) => p.medianM2 as number)) * 0.85 : 0, [chartTrend]);
  const xS = (i: number) => pad.left + (i / Math.max(chartTrend.length - 1, 1)) * (chartW - pad.left - pad.right);
  const yS = (v: number) => pad.top + chartH - pad.top - pad.bottom - ((v - chartMin) / (chartMax - chartMin)) * (chartH - pad.top - pad.bottom);

  if (loading && !viviendaData && !loteData && !proyectoData) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-center space-y-4"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" /><p className="text-gray-400 text-sm">Cargando indice...</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-400 hover:text-gray-600">Inicio</Link>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-800 font-medium">Indice Tiyuy</span>
          </nav>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full tracking-wide uppercase"><BarChart3 className="w-3 h-3" />Datos del Portal</div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Indice Tiyuy</h1>
              <p className="text-gray-500 text-base max-w-2xl">Precio por metro cuadrado, lotes y proyectos. Datos agregados del inventario de Tiyuy.</p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{lastUpdated}</span>}
              <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 shadow-sm"><RefreshCw className="w-4 h-4" />Actualizar</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { k: 'viviendas' as Vertical, l: 'Casas y Dptos', i: <Home className="w-4 h-4" /> },
            { k: 'departamentos' as Vertical, l: 'Departamentos', i: <Building2 className="w-4 h-4" /> },
            { k: 'lotes' as Vertical, l: 'Lotes y Terrenos', i: <LandPlot className="w-4 h-4" /> },
            { k: 'proyectos' as Vertical, l: 'Proyectos', i: <FolderGit className="w-4 h-4" /> },
          ].map(v => (
            <button key={v.k} onClick={() => setVertical(v.k)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex-shrink-0 cursor-pointer ${vertical === v.k ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>{v.i}{v.l}</button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex flex-wrap items-end gap-4">
            {/* Operacion */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1.5">Operacion</label>
              <div className="flex gap-1.5">
                {['SALE','RENT'].map(op => (
                  <button key={op} onClick={() => setTxType(op)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${txType === op ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{op === 'SALE' ? 'Venta' : 'Alquiler'}</button>
                ))}
              </div>
            </div>

            {/* Tipo */}
            {vertical === 'viviendas' && (
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1.5">Tipo</label>
                <div className="flex gap-1.5">
                  {[{v:'',l:'Todos'},{v:'APARTMENT',l:'Dptos'},{v:'HOUSE',l:'Casas'}].map(t => (
                    <button key={t.v} onClick={() => setPropType(t.v)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${propType === t.v ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.l}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Region - Searchable dropdown */}
            <div className="relative min-w-[180px]" ref={regionRef}>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1.5">Region</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input type="text" value={regionSearch || regionId || ''} placeholder="Buscar region..."
                  onChange={e => { setRegionSearch(e.target.value); setShowRegionDropdown(true); }}
                  onFocus={() => setShowRegionDropdown(true)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              {showRegionDropdown && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                  <button onClick={() => { setRegionId(''); setRegionSearch(''); setShowRegionDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${!regionId ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600'}`}>Todas</button>
                  {filteredRegions.map(r => (
                    <button key={r} onClick={() => { setRegionId(r); setRegionSearch(r); setShowRegionDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${regionId === r ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600'}`}>{r}</button>
                  ))}
                  {filteredRegions.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>}
                </div>
              )}
            </div>

            {/* Provincia - Searchable dropdown */}
            {regionId && (
              <div className="relative min-w-[180px]" ref={provinceRef}>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1.5">Provincia</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input type="text" value={provinceSearch || provinceId || ''} placeholder="Buscar provincia..."
                    onChange={e => { setProvinceSearch(e.target.value); setShowProvinceDropdown(true); }}
                    onFocus={() => setShowProvinceDropdown(true)}
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                {showProvinceDropdown && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                    <button onClick={() => { setProvinceId(''); setProvinceSearch(''); setShowProvinceDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${!provinceId ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600'}`}>Todas</button>
                    {filteredProvinces.map(p => (
                      <button key={p} onClick={() => { setProvinceId(p); setProvinceSearch(p); setShowProvinceDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${provinceId === p ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600'}`}>{p}</button>
                    ))}
                    {filteredProvinces.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>}
                  </div>
                )}
              </div>
            )}

            {/* Distrito - Searchable dropdown */}
            {provinceId && (
              <div className="relative min-w-[180px]" ref={districtRef}>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1.5">Distrito</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input type="text" value={districtSearch || districtId || ''} placeholder="Buscar distrito..."
                    onChange={e => { setDistrictSearch(e.target.value); setShowDistrictDropdown(true); }}
                    onFocus={() => setShowDistrictDropdown(true)}
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                {showDistrictDropdown && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                    <button onClick={() => { setDistrictId(''); setDistrictSearch(''); setShowDistrictDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${!districtId ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600'}`}>Todos</button>
                    {filteredDistricts.map(d => (
                      <button key={d} onClick={() => { setDistrictId(d); setDistrictSearch(d); setShowDistrictDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${districtId === d ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600'}`}>{d}</button>
                    ))}
                    {filteredDistricts.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>}
                  </div>
                )}
              </div>
            )}

            {/* Etapa (solo proyectos) */}
            {vertical === 'proyectos' && (
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1.5">Etapa</label>
                <div className="flex gap-1.5">
                  {[{v:'',l:'Todas'},{v:'PRE_SALE',l:'Preventa'},{v:'CONSTRUCTION',l:'Construccion'},{v:'DELIVERY',l:'Entrega'},{v:'COMPLETED',l:'Entregado'}].map(t => (
                    <button key={t.v} onClick={() => setProjPhase(t.v)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${projPhase === t.v ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.l}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Views */}
        {(vertical === 'viviendas' || vertical === 'departamentos') && viviendaData && <ViviendaView data={viviendaData} trend={chartTrend} chartMax={chartMax} chartMin={chartMin} xS={xS} yS={yS} tooltipPt={tooltipPt} setTooltipPt={setTooltipPt} tooltipPos={tooltipPos} setTooltipPos={setTooltipPos} />}
        {vertical === 'lotes' && loteData && <LoteView data={loteData} trend={chartTrend} chartMax={chartMax} chartMin={chartMin} xS={xS} yS={yS} tooltipPt={tooltipPt} setTooltipPt={setTooltipPt} tooltipPos={tooltipPos} setTooltipPos={setTooltipPos} />}
        {vertical === 'proyectos' && proyectoData && <ProyectoView data={proyectoData} />}

        <div className="text-center py-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">Datos calculados con informacion agregada del inventario de Tiyuy. Los valores se actualizan en cada consulta.</p>
        </div>
      </div>
    </div>
  );
}

// ─── VIVIENDA VIEW ───
function ViviendaView({ data, trend, chartMax, chartMin, xS, yS, tooltipPt, setTooltipPt, tooltipPos, setTooltipPos }: any) {
  const { kpis, variation, districts } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Mediana m2" value={formatM2(kpis.medianPriceM2)} icon={<TrendingUp className="w-4 h-4" />}
          subtitle={variation.monthlyChangePct !== null ? (
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${variation.monthlyChangePct > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {variation.monthlyChangePct > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(variation.monthlyChangePct).toFixed(1)}% vs mes ant.
            </span>
          ) : <span className="text-xs text-gray-400">Sin variacion</span>} />
        <KpiCard label="Promedio m2" value={formatM2(kpis.avgPriceM2)} icon={<Building2 className="w-4 h-4" />} subtitle={<span className="text-xs text-gray-400">Media aritmetica</span>} />
        <KpiCard label="Variacion anual" value={variation.yearlyChangePct !== null ? (
          <span className={`inline-flex items-center gap-1 ${variation.yearlyChangePct > 0 ? 'text-emerald-600' : variation.yearlyChangePct < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {variation.yearlyChangePct > 0 ? '+' : ''}{variation.yearlyChangePct?.toFixed(1)}%
          </span>
        ) : <span className="text-gray-400 text-base">--</span>} icon={<Calendar className="w-4 h-4" />} subtitle={<span className="text-xs text-gray-400">vs mismo mes ano anterior</span>} />
        <KpiCard label="Muestra" value={formatCompact(kpis.sampleCount)} icon={<BarChart3 className="w-4 h-4" />} subtitle={<span className="text-xs text-gray-400">Rango: {formatM2(kpis.minPriceM2)} - {formatM2(kpis.maxPriceM2)}</span>} />
      </div>
      <ChartSection title="Tendencia mensual" subtitle="Precio mediano por m2" data={trend} chartMax={chartMax} chartMin={chartMin} xS={xS} yS={yS} tooltipPt={tooltipPt} setTooltipPt={setTooltipPt} tooltipPos={tooltipPos} setTooltipPos={setTooltipPos} />
      <RankingTable title="Ranking de distritos" subtitle="Ordenado de mayor a menor precio mediano por m2"
        headers={['#','Distrito','Mediana m2','Promedio m2','Muestras','Precio prom.','Area prom.']}
        rows={districts.map((d: any, idx: number) => [idx + 1, d.district, formatM2(d.medianM2), formatM2(d.avgM2), d.sampleCount, formatPrice(d.avgTotalPrice), Math.round(d.avgBuiltArea) + ' m2'])} />
    </div>
  );
}

function LoteView({ data, trend, chartMax, chartMin, xS, yS, tooltipPt, setTooltipPt, tooltipPos, setTooltipPos }: any) {
  const { totalCount, avgM2Terreno, avgTotalPrice, avgTotalArea, districts, variation } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Precio m2 terr." value={formatM2(avgM2Terreno)} icon={<LandPlot className="w-4 h-4" />}
          subtitle={variation.monthlyChangePct !== null ? (
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${variation.monthlyChangePct > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {variation.monthlyChangePct > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(variation.monthlyChangePct).toFixed(1)}% vs mes ant.
            </span>
          ) : <span className="text-xs text-gray-400">Sin variacion</span>} />
        <KpiCard label="Ticket prom." value={formatPrice(avgTotalPrice)} icon={<DollarSign className="w-4 h-4" />} subtitle={<span className="text-xs text-gray-400">Precio total promedio</span>} />
        <KpiCard label="Area prom." value={Math.round(avgTotalArea) + ' m2'} icon={<Layers className="w-4 h-4" />} subtitle={<span className="text-xs text-gray-400">Area de terreno promedio</span>} />
        <KpiCard label="Total" value={formatCompact(totalCount)} icon={<BarChart3 className="w-4 h-4" />} subtitle={<span className="text-xs text-gray-400">{districts.length} distritos</span>} />
      </div>
      <ChartSection title="Tendencia mensual" subtitle="Precio mediano por m2 de terreno" data={trend} chartMax={chartMax} chartMin={chartMin} xS={xS} yS={yS} tooltipPt={tooltipPt} setTooltipPt={setTooltipPt} tooltipPos={tooltipPos} setTooltipPos={setTooltipPos} />
      <RankingTable title="Ranking de distritos" subtitle="Precio por m2 de terreno"
        headers={['#','Distrito','Mediana m2 terr.','Promedio m2 terr.','Muestras','Precio prom.','Area prom.']}
        rows={districts.map((d: any, idx: number) => [idx + 1, d.district, formatM2(d.medianM2Terreno), formatM2(d.avgM2Terreno), d.sampleCount, formatPrice(d.avgTotalPrice), Math.round(d.avgTotalArea) + ' m2'])} />
    </div>
  );
}

function ProyectoView({ data }: any) {
  const { totalProjects, avgPriceFrom, totalAvailable, avgAreaFrom, projects, phaseBreakdown, districtBreakdown } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Proyectos" value={totalProjects.toString()} icon={<FolderGit className="w-4 h-4" />} subtitle={<span className="text-xs text-gray-400">Total publicados</span>} />
        <KpiCard label="Precio desde" value={formatPrice(avgPriceFrom)} icon={<DollarSign className="w-4 h-4" />} subtitle={<span className="text-xs text-gray-400">Precio promedio minimo</span>} />
        <KpiCard label="Unidades" value={formatCompact(totalAvailable)} icon={<Home className="w-4 h-4" />} subtitle={<span className="text-xs text-gray-400">Stock disponible</span>} />
        <KpiCard label="Area desde" value={Math.round(avgAreaFrom) + ' m2'} icon={<Layers className="w-4 h-4" />} subtitle={<span className="text-xs text-gray-400">Area promedio minima</span>} />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-3">Desglose por etapa</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {phaseBreakdown.map((p: any) => (
            <div key={p.phase} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{p.phase === 'PRE_SALE' ? 'Preventa' : p.phase === 'CONSTRUCTION' ? 'Construccion' : p.phase || p.phase}</p>
              <p className="text-xl font-bold text-gray-900">{p.count}</p>
              <p className="text-xs text-gray-400">{formatCompact(p.totalUnits)} uds</p>
            </div>
          ))}
        </div>
      </div>
      <RankingTable title="Proyectos por distrito" subtitle="Distritos con mayor oferta"
        headers={['#','Distrito','Proyectos','Precio desde','Unidades disponibles']}
        rows={districtBreakdown.map((d: any, idx: number) => [idx + 1, d.district, d.count, formatPrice(d.avgPrice), formatCompact(d.totalAvailable)])} />
    </div>
  );
}

function KpiCard({ label, value, icon, subtitle }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
      <div className="flex items-center gap-2 text-gray-400 mb-3">{icon}<span className="text-xs font-medium uppercase tracking-wider">{label}</span></div>
      <div className="text-2xl font-bold text-gray-900 tracking-tight mb-1">{value}</div>
      {subtitle && <div>{subtitle}</div>}
    </div>
  );
}

function ChartSection({ title, subtitle, data, chartMax, chartMin, xS, yS, tooltipPt, setTooltipPt, tooltipPos, setTooltipPos }: any) {
  const chartW = 700, chartH = 200, pad = { top: 15, right: 15, bottom: 30, left: 55 };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-bold text-gray-900">{title}</h3><p className="text-sm text-gray-400">{subtitle}</p></div>
        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-teal-600" /></div>
      </div>
      {data.length === 0 ? (
        <div className="text-center py-8"><BarChart3 className="w-8 h-8 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">No hay datos suficientes</p></div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <svg width={chartW} height={chartH} className="min-w-[700px]">
            {[0,0.25,0.5,0.75,1].map((frac) => {
              const y = yS(chartMin + (chartMax - chartMin) * frac);
              const val = chartMin + (chartMax - chartMin) * frac;
              return (<g key={frac}><line x1={pad.left} y1={y} x2={chartW-pad.right} y2={y} stroke="#f0f0f0" strokeWidth={1} /><text x={pad.left-8} y={y+4} textAnchor="end" className="text-xs" fill="#9ca3af">{formatM2(val)}</text></g>);
            })}
            <polyline fill="none" stroke="#0d9488" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" points={data.map((p: any,i: number)=>`${xS(i)},${yS(p.medianM2)}`).join(' ')} />
            <path d={data.map((p: any,i: number)=>(`${i===0?'M':'L'}${xS(i)},${yS(p.medianM2)}`)).join(' ')+` L${xS(data.length-1)},${chartH-pad.bottom} L${xS(0)},${chartH-pad.bottom} Z`} fill="url(#grad)" opacity={0.15} />
            <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d9488"/><stop offset="100%" stopColor="#0d9488" stopOpacity={0}/></linearGradient></defs>
            {data.map((p: any,i: number)=>(
              <circle key={i} cx={xS(i)} cy={yS(p.medianM2)} r={4} fill="#0d9488" stroke="white" strokeWidth={2}
                className="cursor-pointer" onMouseEnter={(e: any)=>{setTooltipPt(p); const r=e.target.getBoundingClientRect(); setTooltipPos({x:r.left,y:r.top-8});}}
                onMouseLeave={()=>setTooltipPt(null)} />
            ))}
            {data.filter((_:any,i:number)=>i%Math.max(1,Math.floor(data.length/8))===0).map((p:any,i:number)=>{
              const idx=data.indexOf(p);
              return <text key={i} x={xS(idx)} y={chartH-6} textAnchor="middle" className="text-[10px]" fill="#9ca3af">{monthNames[p.month-1]} {p.year.toString().slice(-2)}</text>;
            })}
          </svg>
          {tooltipPt && (
            <div className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none"
              style={{left:tooltipPos.x,top:tooltipPos.y-60,transform:'translateX(-50%)'}}>
              <p className="font-semibold">{monthNames[tooltipPt.month-1]} {tooltipPt.year}</p>
              <p>Mediana: {formatM2(tooltipPt.medianM2??0)}</p>
              <p className="text-white/60">{tooltipPt.count} muestras</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RankingTable({ title, subtitle, headers, rows }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="mb-4"><h3 className="font-bold text-gray-900">{title}</h3><p className="text-sm text-gray-400">{subtitle}</p></div>
      {rows.length === 0 ? (
        <div className="text-center py-8"><BarChart3 className="w-8 h-8 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">No hay datos suficientes</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">{headers.map((h: any,i: number)=><th key={i} className={`py-3 px-3 font-semibold text-gray-900 text-xs uppercase tracking-wider ${i===0||i===1?'text-left':'text-right'}`}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((row: any,idx: number)=>{
                const intensity = 1-(idx/Math.max(rows.length-1,1));
                return (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    style={{backgroundColor:`rgb(${Math.round(220-intensity*100)},${Math.round(240-intensity*60)},${Math.round(220-intensity*80)})`}}>
                    {row.map((cell: any,i: number)=><td key={i} className={`py-3 px-3 ${i===0?'text-gray-400 font-medium':i===1?'font-semibold text-gray-900':i===2?'font-bold text-gray-900 text-right':'text-gray-700 text-right'}`}>{cell}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}