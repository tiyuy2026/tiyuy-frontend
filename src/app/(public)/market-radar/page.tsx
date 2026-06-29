'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  TrendingUp, MapPin, Home, Eye, Heart, Phone, BarChart3,
  Activity, Zap, ChevronRight, RefreshCw, ArrowUpRight,
  ArrowDownRight, Building2, LandPlot, FolderGit, Shield,
  Clock, Layers, DollarSign, Search, Users, Info, Filter,
  X, ChevronDown, Loader
} from 'lucide-react';
import { publicApiClient } from '@/infrastructure/api/axios-client';

interface HotDistrict { district: string; totalViews: number; totalFavorites: number; totalContacts: number; listingCount: number; heatScore: number; }
interface DistrictTrend { district: string; avgPrice: number; changePct: number; }
interface NewPropertyInsight { label: string; count: number; }
interface GeneralRadar { totalPublished: number; avgPrice: number; totalViews: number; totalFavorites: number; totalContacts: number; totalProjects: number; hotDistricts: HotDistrict[]; topRisers: DistrictTrend[]; newByType: NewPropertyInsight[]; }
interface NewInventoryDistrict { district: string; newListings: number; avgPrice: number; totalViews: number; }
interface OpportunityDistrict { district: string; belowMedianCount: number; medianPrice: number; }
interface HighlightProperty { id: number; price: number; district: string; bedrooms: number; type: string; title: string; }
interface ViviendaRadar { totalPublished: number; totalViews: number; totalFavorites: number; totalContacts: number; avgViewsPerListing: number; avgFavsPerListing: number; avgContactsPerListing: number; topRisers: DistrictTrend[]; newListings: NewInventoryDistrict[]; hotDistricts: HotDistrict[]; opportunities: OpportunityDistrict[]; weeklyHighlights: HighlightProperty[]; }
interface PhaseRadarData { phase: string; count: number; totalAvailable: number; totalViews: number; }
interface ProyectoHotDistrict { district: string; totalViews: number; totalContacts: number; projectCount: number; totalAvailable: number; heatScore: number; }
interface RecentProyecto { id: number; name: string; district: string; priceFrom: number; availableUnits: number; totalUnits: number; phase: string; viewsCount: number; contactsCount: number; }
interface ProyectoRadar { totalProjects: number; newProjects: number; totalAvailable: number; avgPriceFrom: number; phases: PhaseRadarData[]; hotDistricts: ProyectoHotDistrict[]; recent: RecentProyecto[]; }
interface NewLandDistrict { district: string; newListings: number; avgM2Terreno: number; totalViews: number; }
interface LandHotDistrict { district: string; totalViews: number; totalFavorites: number; totalContacts: number; listingCount: number; heatScore: number; }
interface LoteRadar { totalLotes: number; avgM2Terreno: number; avgTotalPrice: number; avgTotalArea: number; newListings: NewLandDistrict[]; hotDistricts: LandHotDistrict[]; }

type Vertical = 'general' | 'viviendas' | 'proyectos' | 'lotes';
type MetricKey = 'precio' | 'nuevos' | 'vistas' | 'favoritos' | 'contactos' | 'heat';

const formatPrice = (p: number) => !p ? 'S/ 0' : 'S/ ' + Math.round(p).toLocaleString('es-PE');
const formatCompact = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n >= 1_000 ? (n / 1_000).toFixed(1) + 'K' : n.toLocaleString('es-PE');
const propertyLabel = (t: string) => ({ APARTMENT: 'Departamento', HOUSE: 'Casa', LAND: 'Terreno', OFFICE: 'Oficina', COMMERCIAL: 'Local', ROOM: 'Habitacion' }[t] || t);
const phaseLabel = (p: string) => ({ PRE_SALE: 'Preventa', CONSTRUCTION: 'Construccion', DELIVERY: 'Entrega inmediata', COMPLETED: 'Entregado' }[p] || p);

const chartW = 720; const chartH = 240;
const padding = { top: 20, right: 20, bottom: 30, left: 55 };
const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Set','Oct','Nov','Dic'];

const METRICS_BY_VERTICAL: Record<Vertical, MetricKey[]> = {
  general: ['precio', 'nuevos', 'vistas', 'favoritos', 'contactos'],
  viviendas: ['precio', 'nuevos', 'vistas', 'favoritos', 'contactos', 'heat'],
  proyectos: ['nuevos', 'vistas', 'contactos'],
  lotes: ['precio', 'nuevos', 'vistas', 'favoritos', 'contactos', 'heat'],
};
const METRIC_LABELS: Record<MetricKey, string> = {
  precio: 'Precio mediano', nuevos: 'Nuevos avisos', vistas: 'Vistas totales',
  favoritos: 'Favoritos', contactos: 'Contactos', heat: 'Heat score',
};
const METRIC_ICONS: Record<MetricKey, React.ReactNode> = {
  precio: <TrendingUp className="w-4 h-4" />, nuevos: <Activity className="w-4 h-4" />,
  vistas: <Eye className="w-4 h-4" />, favoritos: <Heart className="w-4 h-4" />,
  contactos: <Phone className="w-4 h-4" />, heat: <Zap className="w-4 h-4" />,
};

export default function MarketRadarPage() {
  const [vertical, setVertical] = useState<Vertical>('general');
  const [metric, setMetric] = useState<MetricKey>('precio');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [showMethodology, setShowMethodology] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [operation, setOperation] = useState('SALE');
  const [topN, setTopN] = useState(10);
  const [region, setRegion] = useState('');
  const [regionLabel, setRegionLabel] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  const [province, setProvince] = useState('');
  const [provinceLabel, setProvinceLabel] = useState('');
  const [provinceSearch, setProvinceSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [districtLabel, setDistrictLabel] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [regions, setRegions] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const regionRef = useRef<HTMLDivElement>(null);
  const provinceRef = useRef<HTMLDivElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);
  const [general, setGeneral] = useState<GeneralRadar | null>(null);
  const [viviendas, setViviendas] = useState<ViviendaRadar | null>(null);
  const [proyectos, setProyectos] = useState<ProyectoRadar | null>(null);
  const [lotes, setLotes] = useState<LoteRadar | null>(null);
  const [tooltip, setTooltip] = useState<{ label: string; value: string; x: number; y: number } | null>(null);

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

  useEffect(() => { fetchRadar(); fetchRegions(); }, []);
  useEffect(() => { if (!loading) { setChartLoading(true); fetchRadar().finally(() => setChartLoading(false)); } }, [operation]);

  const fetchRegions = async () => {
    try { const res = await publicApiClient.get<string[]>('/analytics/locations/regions'); setRegions(res.data); } catch {}
  };

  const fetchRadar = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { transactionType: operation, topN };
      if (region) params.region = region;
      if (province) params.province = province;
      if (district) params.district = district;
      const [g, v, p, l] = await Promise.all([
        publicApiClient.get<GeneralRadar>('/analytics/market-radar/general', { params }),
        publicApiClient.get<ViviendaRadar>('/analytics/market-radar/viviendas', { params }),
        publicApiClient.get<ProyectoRadar>('/analytics/market-radar/proyectos', { params: { region, province, district } }),
        publicApiClient.get<LoteRadar>('/analytics/market-radar/lotes', { params }),
      ]);
      setGeneral(g.data); setViviendas(v.data); setProyectos(p.data); setLotes(l.data);
      setLastUpdated(new Date().toLocaleString('es-PE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }));
    } catch { console.error('Error fetching market radar'); }
    finally { setLoading(false); }
  }, [operation, region, province, district, topN]);

  useEffect(() => {
    const available = METRICS_BY_VERTICAL[vertical];
    if (!available.includes(metric)) setMetric(available[0]);
  }, [vertical]);

  const trendData = useMemo(() => {
    if (vertical === 'general' && general) {
      return general.hotDistricts.slice(0, Math.min(topN, general.hotDistricts.length)).map((d, i) => ({
        label: d.district, value: Number(metric === 'vistas' ? (d.totalViews || 0) : metric === 'favoritos' ? (d.totalFavorites || 0) : metric === 'contactos' ? (d.totalContacts || 0) : (d.listingCount || 0)), x: i
      }));
    }
    if (vertical === 'viviendas' && viviendas) {
      const items = metric === 'nuevos' ? viviendas.newListings : metric === 'heat' ? viviendas.hotDistricts : metric === 'favoritos' ? viviendas.hotDistricts : metric === 'contactos' ? viviendas.hotDistricts : viviendas.topRisers;
      return items.slice(0, Math.min(topN, items.length)).map((d: any, i: number) => ({
        label: d.district || '', value: Number(d.avgPrice || d.heatScore || d.totalViews || d.totalFavorites || d.totalContacts || d.newListings || 0), x: i
      }));
    }
    if (vertical === 'proyectos' && proyectos) {
      if (metric === 'nuevos') {
        return proyectos.phases.map((d: any, i: number) => ({
          label: d.phase, value: Number(d.count || 0), x: i
        }));
      }
      return proyectos.hotDistricts.slice(0, Math.min(topN, proyectos.hotDistricts.length)).map((d: any, i: number) => ({
        label: d.district, value: Number(d.heatScore || d.totalViews || d.totalContacts || 0), x: i
      }));
    }
    if (vertical === 'lotes' && lotes) {
      const items = metric === 'nuevos' ? lotes.newListings : lotes.hotDistricts;
      return items.slice(0, Math.min(topN, items.length)).map((d: any, i: number) => ({
        label: d.district, value: Number(d.avgM2Terreno || d.heatScore || d.totalViews || d.newListings || 0), x: i
      }));
    }
    return [];
  }, [vertical, metric, general, viviendas, proyectos, lotes, topN]);

  const chartMax = useMemo(() => {
    if (trendData.length === 0) return 100;
    const max = Math.max(...trendData.map(d => d.value));
    return max > 0 ? max * 1.15 : 100;
  }, [trendData]);
  const xScale = (i: number) => padding.left + (i / Math.max(trendData.length - 1, 1)) * (chartW - padding.left - padding.right);
  const yScale = (v: number) => {
    if (chartMax <= 0 || v <= 0) return chartH - padding.bottom;
    return padding.top + chartH - padding.top - padding.bottom - (v / chartMax) * (chartH - padding.top - padding.bottom);
  };

  if (loading && !general) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-medium">Cargando radar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full tracking-wide uppercase">
                <BarChart3 className="w-3.5 h-3.5" />
                Inteligencia de Mercado
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Radar del Mercado</h1>
              <p className="text-gray-500 text-base max-w-2xl leading-relaxed">
                Indicadores de precio, oferta, demanda y actividad. Datos agregados del inventario de Tiyuy.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{lastUpdated}</span>}
              <button onClick={fetchRadar} className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all shadow-sm"><RefreshCw className="w-4 h-4" />Actualizar</button>
              <button onClick={() => setShowMethodology(!showMethodology)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition-all border border-gray-200"><Info className="w-4 h-4" />Metodologia</button>
            </div>
          </div>
        </div>
      </div>

      {showMethodology && (
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-3">Metodologia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                <div><h4 className="font-semibold text-gray-800 mb-1">Fuente de datos</h4><p className="text-gray-500">Indicadores calculados de anuncios y proyectos publicados en Tiyuy. Precios de oferta, no de cierre.</p></div>
                <div><h4 className="font-semibold text-gray-800 mb-1">Demanda</h4><p className="text-gray-500">Metricas basadas en vistas, favoritos y contactos agregados del portal.</p></div>
                <div><h4 className="font-semibold text-gray-800 mb-1">Muestra minima</h4><p className="text-gray-500">Se requiere muestra minima (5+ registros) para asegurar consistencia estadistica.</p></div>
                <div><h4 className="font-semibold text-gray-800 mb-1">Actualizacion</h4><p className="text-gray-500">Datos actualizados automaticamente en cada consulta. Cobertura nacional.</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VERTICAL TABS */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { key: 'general' as Vertical, label: 'General', icon: <BarChart3 className="w-4 h-4" /> },
            { key: 'viviendas' as Vertical, label: 'Viviendas', icon: <Home className="w-4 h-4" /> },
            { key: 'proyectos' as Vertical, label: 'Proyectos', icon: <FolderGit className="w-4 h-4" /> },
            { key: 'lotes' as Vertical, label: 'Lotes', icon: <LandPlot className="w-4 h-4" /> },
          ].map(v => (
            <button key={v.key} onClick={() => setVertical(v.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex-shrink-0 cursor-pointer ${vertical === v.key ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {v.icon}{v.label}
            </button>
          ))}
          <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-white text-gray-600 border border-gray-200 ml-auto"><Filter className="w-4 h-4" />Filtros</button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT: Chart */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Metric Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {METRICS_BY_VERTICAL[vertical].map(m => (
                <button key={m} onClick={() => setMetric(m)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex-shrink-0 cursor-pointer ${metric === m ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}>
                  {METRIC_ICONS[m]}{METRIC_LABELS[m]}
                </button>
              ))}
            </div>

            {/* CHART */}
            <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${chartLoading ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{METRIC_LABELS[metric]}</h3>
                  <p className="text-sm text-gray-400">Distribucion por distrito - Top {topN}</p>
                </div>
                <div className="flex items-center gap-3">
                  {chartLoading && <Loader className="w-4 h-4 animate-spin text-teal-600" />}
                  <select value={topN} onChange={e => setTopN(Number(e.target.value))}
                    className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 cursor-pointer outline-none">
                    <option value={5}>Top 5</option><option value={10}>Top 10</option><option value={20}>Top 20</option>
                  </select>
                </div>
              </div>

              {trendData.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No hay datos suficientes para esta metrica</p>
                </div>
              ) : (
                <div className="overflow-x-auto pb-2">
                  <svg width={chartW} height={chartH} className="min-w-[700px]">
                    {[0, 0.25, 0.5, 0.75, 1].map(frac => {
                      const y = yScale(chartMax * frac);
                      const val = chartMax * frac;
                      return (
                        <g key={frac}>
                          <line x1={padding.left} y1={y} x2={chartW - padding.right} y2={y} stroke="#f0f0f0" strokeWidth={1} />
                          <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-xs" fill="#9ca3af">
                            {val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(0) + 'K' : Math.round(val).toString()}
                          </text>
                        </g>
                      );
                    })}
                    {trendData.map((d, i) => {
                      const barW = Math.max(12, Math.min(40, (chartW - padding.left - padding.right) / trendData.length * 0.5));
                      const x = xScale(d.x) - barW / 2;
                      const y = yScale(d.value);
                      const h = chartH - padding.bottom - y;
                      const intensity = 1 - (i / Math.max(trendData.length - 1, 1));
                      const tooltipValue = metric === 'precio' ? formatPrice(d.value) : metric === 'heat' ? `${d.value} pts` : formatCompact(d.value);
                      return (
                        <g key={i}>
                          <rect x={x} y={y} width={barW} height={h} rx={3}
                            fill={`rgba(13, 148, 136, ${0.3 + intensity * 0.5})`}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onMouseEnter={(e) => {
                              const rect = (e.target as SVGRectElement).getBoundingClientRect();
                              setTooltip({ label: d.label, value: tooltipValue, x: rect.left + rect.width / 2, y: rect.top - 8 });
                            }}
                            onMouseLeave={() => setTooltip(null)} />
                          {trendData.length <= 10 && (
                            <text x={x + barW / 2} y={chartH - 8} textAnchor="end" className="text-[8px]" fill="#9ca3af"
                              transform={`rotate(-45, ${x + barW / 2}, ${chartH - 8})`}>{d.label}</text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                  {tooltip && (
                    <div className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none"
                      style={{ left: tooltip.x, top: tooltip.y - 50, transform: 'translateX(-50%)' }}>
                      <p className="font-semibold">{tooltip.label}</p>
                      <p>{tooltip.value}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* INSIGHTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vertical === 'viviendas' && viviendas && (
                <>
                  <InsightCard title="Subieron mas" badge="Precio" color="bg-emerald-50 text-emerald-700" items={viviendas.topRisers.slice(0, 4).map(d => ({ label: d.district, value: `+${d.changePct}%` }))} />
                  <InsightCard title="Mas nuevos" badge="Oferta" color="bg-blue-50 text-blue-700" items={viviendas.newListings.slice(0, 4).map(d => ({ label: d.district, value: `${d.newListings} nuevos` }))} />
                  <InsightCard title="Mas buscados" badge="Demanda" color="bg-teal-50 text-teal-700" items={viviendas.hotDistricts.slice(0, 4).map(d => ({ label: d.district, value: `${d.heatScore} pts` }))} />
                </>
              )}
              {vertical === 'general' && general && (
                <>
                  <InsightCard title="Nuevos en periodo" badge="Oferta" color="bg-blue-50 text-blue-700" items={general.newByType.map(d => ({ label: d.label, value: `${d.count}` }))} />
                  <InsightCard title="Subieron mas" badge="Precio" color="bg-emerald-50 text-emerald-700" items={general.topRisers.slice(0, 4).map(d => ({ label: d.district, value: `+${d.changePct}%` }))} />
                  <InsightCard title="Mas buscados" badge="Demanda" color="bg-teal-50 text-teal-700" items={general.hotDistricts.slice(0, 4).map(d => ({ label: d.district, value: `${d.heatScore} pts` }))} />
                </>
              )}
              {vertical === 'proyectos' && proyectos && (
                <>
                  <InsightCard title="Proyectos activos" badge="Oferta" color="bg-indigo-50 text-indigo-700" items={proyectos.phases.map(d => ({ label: phaseLabel(d.phase), value: `${d.count}` }))} />
                  <InsightCard title="Por distrito" badge="Demanda" color="bg-teal-50 text-teal-700" items={proyectos.hotDistricts.slice(0, 4).map(d => ({ label: d.district, value: `${d.heatScore} pts` }))} />
                  <InsightCard title="Nuevos proyectos" badge="Actividad" color="bg-amber-50 text-amber-700" items={[{ label: 'Nuevos este periodo', value: `${proyectos.newProjects}` }, { label: 'Unidades disponibles', value: formatCompact(proyectos.totalAvailable) }]} />
                </>
              )}
              {vertical === 'lotes' && lotes && (
                <>
                  <InsightCard title="Nuevos lotes" badge="Oferta" color="bg-blue-50 text-blue-700" items={lotes.newListings.slice(0, 4).map(d => ({ label: d.district, value: `${d.newListings} lotes` }))} />
                  <InsightCard title="Precio m2 terr." badge="Precio" color="bg-emerald-50 text-emerald-700" items={[{ label: 'Promedio nacional', value: formatPrice(lotes.avgM2Terreno) }, { label: 'Ticket promedio', value: formatPrice(lotes.avgTotalPrice) }]} />
                  <InsightCard title="Mas buscados" badge="Demanda" color="bg-teal-50 text-teal-700" items={lotes.hotDistricts.slice(0, 4).map(d => ({ label: d.district, value: `${d.heatScore} pts` }))} />
                </>
              )}
            </div>

            {/* RANKING */}
            {vertical === 'viviendas' && viviendas && viviendas.hotDistricts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-1">Ranking de distritos</h3>
                <p className="text-sm text-gray-400 mb-4">Ordenado por heat score</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 text-xs uppercase">#</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 text-xs uppercase">Distrito</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs uppercase">Vistas</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs uppercase">Favs</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs uppercase">Contactos</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs uppercase">Heat</th>
                    </tr></thead>
                    <tbody>
                      {viviendas.hotDistricts.map((d, idx) => (
                        <tr key={d.district} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-3 text-gray-400 font-medium">{idx + 1}</td>
                          <td className="py-3 px-3 font-semibold text-gray-900">{d.district}</td>
                          <td className="py-3 px-3 text-right text-gray-700">{formatCompact(d.totalViews)}</td>
                          <td className="py-3 px-3 text-right text-gray-700">{formatCompact(d.totalFavorites)}</td>
                          <td className="py-3 px-3 text-right text-gray-700">{formatCompact(d.totalContacts)}</td>
                          <td className="py-3 px-3 text-right">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${d.heatScore >= 70 ? 'bg-red-50 text-red-700' : d.heatScore >= 40 ? 'bg-orange-50 text-orange-700' : 'bg-yellow-50 text-yellow-700'}`}>{d.heatScore}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* WEEKLY HIGHLIGHTS */}
            {vertical === 'viviendas' && viviendas && viviendas.weeklyHighlights.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div><h3 className="font-bold text-gray-900">Destacados de la semana</h3><p className="text-sm text-gray-400">Propiedades mas vistas en los ultimos 7 dias</p></div>
                  <Activity className="w-5 h-5 text-teal-600" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {viviendas.weeklyHighlights.map((item, idx) => (
                    <Link key={item.id} href={`/property/${item.id}`}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-600">{idx + 1}</div>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase">{propertyLabel(item.type)}</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{item.title || `${propertyLabel(item.type)} en ${item.district}`}</p>
                      <p className="text-xs text-gray-400 mb-2">{item.district} · {item.bedrooms} dorm.</p>
                      <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Filters */}
          <div className={`lg:w-72 flex-shrink-0 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Filtros</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>

              {/* Operacion */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Operacion</label>
                <div className="flex gap-2">
                  {['SALE', 'RENT'].map(op => (
                    <button key={op} onClick={() => setOperation(op)}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                        operation === op
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {op === 'SALE' ? 'Venta' : 'Alquiler'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Region - Searchable */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Region</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input type="text" value={regionSearch || regionLabel || ''} placeholder="Buscar region..."
                    onChange={e => { setRegionSearch(e.target.value); setShowRegionDropdown(true); }}
                    onFocus={() => setShowRegionDropdown(true)}
                    className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                {showRegionDropdown && (
                  <div className="mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto" ref={regionRef}>
                    <button onClick={() => { setRegionLabel(''); setRegion(''); setRegionSearch(''); setShowRegionDropdown(false); setProvince(''); setDistrict(''); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${!region ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600'}`}>Todo el pais</button>
                    {filteredRegions.map(r => (
                      <button key={r} onClick={() => { setRegionLabel(r); setRegion(r); setRegionSearch(r); setShowRegionDropdown(false); setProvince(''); setDistrict(''); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${region === r ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600'}`}>{r}</button>
                    ))}
                    {filteredRegions.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>}
                  </div>
                )}
              </div>

              {/* Provincia - Searchable */}
              {region && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Provincia</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <input type="text" value={provinceSearch || provinceLabel || ''} placeholder="Buscar provincia..."
                      onChange={e => { setProvinceSearch(e.target.value); setShowProvinceDropdown(true); }}
                      onFocus={() => setShowProvinceDropdown(true)}
                      className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  {showProvinceDropdown && (
                    <div className="mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto" ref={provinceRef}>
                      <button onClick={() => { setProvinceLabel(''); setProvince(''); setProvinceSearch(''); setShowProvinceDropdown(false); setDistrict(''); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${!province ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600'}`}>Todas</button>
                      {filteredProvinces.map(p => (
                        <button key={p} onClick={() => { setProvinceLabel(p); setProvince(p); setProvinceSearch(p); setShowProvinceDropdown(false); setDistrict(''); }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${province === p ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600'}`}>{p}</button>
                      ))}
                      {filteredProvinces.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Distrito - Searchable */}
              {province && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Distrito</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <input type="text" value={districtSearch || districtLabel || ''} placeholder="Buscar distrito..."
                      onChange={e => { setDistrictSearch(e.target.value); setShowDistrictDropdown(true); }}
                      onFocus={() => setShowDistrictDropdown(true)}
                      className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  {showDistrictDropdown && (
                    <div className="mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto" ref={districtRef}>
                      <button onClick={() => { setDistrictLabel(''); setDistrict(''); setDistrictSearch(''); setShowDistrictDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${!district ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600'}`}>Todos</button>
                      {filteredDistricts.map(d => (
                        <button key={d} onClick={() => { setDistrictLabel(d); setDistrict(d); setDistrictSearch(d); setShowDistrictDropdown(false); }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${district === d ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600'}`}>{d}</button>
                      ))}
                      {filteredDistricts.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Top */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Top distritos</label>
                <div className="flex gap-2">
                  {[5, 10, 20, 50].map(n => (
                    <button key={n} onClick={() => setTopN(n)}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                        topN === n
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aplicar */}
              <button onClick={() => { setChartLoading(true); fetchRadar().finally(() => setChartLoading(false)); }}
                className="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center justify-center gap-2">
                <Loader className={`w-4 h-4 ${chartLoading ? 'animate-spin' : 'hidden'}`} />
                Aplicar filtros
              </button>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 leading-relaxed">Datos actualizados en cada consulta. Valores basados en anuncios publicados en Tiyuy.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-8 border-t border-gray-100 mt-8">
          <p className="text-xs text-gray-400 max-w-xl mx-auto">Indicadores calculados de anuncios y proyectos en Tiyuy. Precios de oferta, no de cierre. Metricas de demanda basadas en vistas, favoritos y contactos agregados.</p>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ title, badge, color, items }: { title: string; badge: string; color: string; items: { label: string; value: string }[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${color}`}>{badge}</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-700">{item.label}</span>
            <span className="text-sm font-semibold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}