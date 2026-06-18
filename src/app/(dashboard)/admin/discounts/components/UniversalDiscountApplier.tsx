/**
 * Universal Discount Applier Component
 * Reutiliza componentes existentes de agentes e inmobiliarias.
 * No duplica logica - hereda de las pantallas originales.
 * Todos los datos vienen del backend real.
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import DiscountTypeCard from './DiscountTypeCard';
import {
  useAgentList,
  useCreateDiscountCode,
  useCreateAgentDiscount,
  useAssignDiscountToAgent,
  useDiscountCodes,
  useCreateAgentPlanDiscount,
} from '@/presentation/hooks/useAdmin';
import {
  useDevelopers,
  useCreateDeveloperDiscountCode,
  useApplyDirectDiscount,
} from '@/presentation/hooks/admin/useDevelopers';
import { AgentListItem, InmobiliariaWithStats, CreateInmobiliariaDiscountRequest, ApplyDirectDiscountRequest } from '@/core/domain/entities/Admin';
import { CreateAgentDiscountRequest, AssignDiscountToAgentRequest } from '@/core/domain/entities/AgentDiscount';

// Reutilizar componentes existentes de agentes
import AssignDiscountModal from '@/app/(dashboard)/admin/agents/discounts/components/AssignDiscountModal';
import CreateDiscountModal from '@/app/(dashboard)/admin/agents/discounts/components/CreateDiscountModal';
import PlanDiscountModal from '@/app/(dashboard)/admin/agents/discounts/components/PlanDiscountModal';

// Reutilizar componentes existentes de inmobiliarias
import ApplyDirectDiscountModal from '@/app/(dashboard)/admin/agencies/components/ApplyDirectDiscountModal';
import CreateAgencyDiscountModal from '@/app/(dashboard)/admin/agencies/components/CreateAgencyDiscountModal';
import { ChevronRight } from 'lucide-react';

// ==================== Types ====================

type DiscountType = 'GLOBAL' | 'USER' | 'AGENT' | 'AGENCY' | 'PLAN' | 'REUSABLE';

interface DiscountOption {
  type: DiscountType;
  label: string;
  description: string;
  gradient: string;
  bullets: string[];
}

const DISCOUNT_OPTIONS: DiscountOption[] = [
  { type: 'GLOBAL', label: 'Global', description: 'Codigo valido para todos los usuarios', gradient: 'from-indigo-500 to-blue-600', bullets: ['Aplica a cualquier usuario', 'Sin restriccion de agente', 'Activacion inmediata'] },
  { type: 'USER', label: 'Usuario', description: 'Descuento asignado a un usuario especifico', gradient: 'from-blue-500 to-cyan-600', bullets: ['Asignado a un usuario', 'Un solo uso', 'Control individual'] },
  { type: 'AGENT', label: 'Agente', description: 'Descuento asignado a un agente inmobiliario', gradient: 'from-teal-500 to-emerald-600', bullets: ['Asignado a un agente', 'Suscripcion personalizada', 'Gestion directa'] },
  { type: 'AGENCY', label: 'Inmobiliaria', description: 'Descuento para toda una inmobiliaria', gradient: 'from-violet-500 to-purple-600', bullets: ['Aplica a toda la agencia', 'Descuento masivo', 'Configuracion flexible'] },
  { type: 'PLAN', label: 'Plan', description: 'Descuento en un plan especifico para un agente', gradient: 'from-orange-500 to-amber-600', bullets: ['Descuento por plan', 'Precio personalizado', 'Suscripcion con descuento'] },
  { type: 'REUSABLE', label: 'Reutilizable', description: 'Codigo con multiples usos permitidos', gradient: 'from-rose-500 to-pink-600', bullets: ['Multiples usos', 'Alta capacidad', 'Codigo compartible'] },
];

// ==================== Global Discount Modal ====================

interface GlobalDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function GlobalDiscountModal({ isOpen, onClose }: GlobalDiscountModalProps) {
  const [code, setCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [usageLimit, setUsageLimit] = useState(100);
  const [singleUse, setSingleUse] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const createMutation = useCreateDiscountCode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        code,
        discountPercentage,
        applicability: 'GLOBAL',
        usageLimit,
        singleUse,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date('2099-12-31'),
      });
      setCode('');
      setDiscountPercentage(10);
      setUsageLimit(100);
      setSingleUse(false);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      onClose();
    } catch (error) {
      console.error('Error creating global discount:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Descuento Global</h3>
        <p className="text-sm text-gray-500 mb-6">Codigo valido para todos los usuarios</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Codigo de Descuento"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ej: BIENVENIDO20"
            required
          />
          <Input
            label="Porcentaje de Descuento (%)"
            type="number"
            min="1"
            max="100"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(Number(e.target.value))}
            required
          />
          <Input
            label="Limite de Usos"
            type="number"
            min="1"
            value={usageLimit}
            onChange={(e) => setUsageLimit(Number(e.target.value))}
            required
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="globalSingleUse"
              checked={singleUse}
              onChange={(e) => setSingleUse(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="globalSingleUse" className="text-sm text-gray-700">Un solo uso por usuario</label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fecha Inicio"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Fecha Fin"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createMutation.isPending} className="flex-1">
              {createMutation.isPending ? 'Creando...' : 'Crear Descuento Global'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// ==================== Agent Discount Content (sin Modal propio) ====================

interface AgentDiscountContentProps {
  onClose: () => void;
}

const PLANS = [
  { code: 'ENTERPRISE', name: 'Plan Empresarial', price: 'S/399', color: 'bg-teal-600' },
  { code: 'ENTERPRISE_TRIAL', name: 'Prueba Empresarial', price: 'S/299', color: 'bg-teal-500' },
  { code: 'PREMIUM', name: 'Plan Pro', price: 'S/99', color: 'bg-blue-600' },
  { code: 'BASIC', name: 'Plan Basico', price: 'S/29', color: 'bg-orange-500' },
  { code: 'FREE', name: 'Plan Gratis', price: 'S/0', color: 'bg-gray-500' }
];

function AgentDiscountContent({ onClose }: AgentDiscountContentProps) {
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AgentListItem | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mode, setMode] = useState<'select' | 'create' | 'assign' | 'plan' | 'plan-select'>('select');
  const [newDiscount, setNewDiscount] = useState({ code: '', discountPercentage: '', startDate: '', endDate: '', usageLimit: '' });
  const [planDiscount, setPlanDiscount] = useState({ discountPercentage: '', customPrice: '', startDate: '', endDate: '' });
  const [selectedPlan, setSelectedPlan] = useState<{ code: string; name: string; price: string; color: string } | null>(null);

  const { data: agentsData } = useAgentList({ page: 0, size: 100 });
  const allAgents = agentsData?.content || [];
  const { data: discountsData } = useDiscountCodes({ page: 0, size: 100 });
  const availableDiscounts = discountsData?.content || [];

  const createDiscountMutation = useCreateAgentDiscount();
  const assignDiscountMutation = useAssignDiscountToAgent();
  const createPlanDiscountMutation = useCreateAgentPlanDiscount();

  const filteredAgents = useMemo(() => {
    if (!agentSearchQuery.trim()) return [];
    const q = agentSearchQuery.toLowerCase();
    return allAgents.filter((a: AgentListItem) =>
      (a.firstName?.toLowerCase() || '').includes(q) ||
      (a.lastName?.toLowerCase() || '').includes(q) ||
      (a.email || '').toLowerCase().includes(q)
    ).slice(0, 5);
  }, [allAgents, agentSearchQuery]);

  const handleCreateDiscount = async () => {
    if (!selectedAgent) return;
    try {
      const request: CreateAgentDiscountRequest = {
        agentId: selectedAgent.id,
        discountCode: {
          code: newDiscount.code,
          discountPercentage: Number(newDiscount.discountPercentage),
          applicability: 'USER_SPECIFIC',
          status: 'ACTIVE',
          singleUse: true,
          startDate: new Date(newDiscount.startDate).toISOString(),
          endDate: new Date(newDiscount.endDate).toISOString(),
          applicableUserId: selectedAgent.id,
          usageLimit: newDiscount.usageLimit ? Number(newDiscount.usageLimit) : undefined,
        },
      };
      await createDiscountMutation.mutateAsync(request);
      resetAndClose();
    } catch (error) {
      console.error('Error creating agent discount:', error);
    }
  };

  const handleAssignDiscount = async (discountId: number) => {
    if (!selectedAgent) return;
    try {
      const request: AssignDiscountToAgentRequest = {
        userId: selectedAgent.id,
        discountCodeId: discountId,
      };
      await assignDiscountMutation.mutateAsync(request);
      resetAndClose();
    } catch (error) {
      console.error('Error assigning discount:', error);
    }
  };

  const handleCreatePlanDiscount = async () => {
    if (!selectedAgent || !selectedPlan) return;
    try {
      await createPlanDiscountMutation.mutateAsync({
        agentId: selectedAgent.id,
        data: {
          planCode: selectedPlan.code,
          discountPercentage: Number(planDiscount.discountPercentage),
          customPrice: planDiscount.customPrice ? Number(planDiscount.customPrice) : undefined,
          startDate: new Date(planDiscount.startDate).toISOString(),
          endDate: new Date(planDiscount.endDate).toISOString(),
        },
      });
      resetAndClose();
    } catch (error) {
      console.error('Error creating plan discount:', error);
    }
  };

  const resetAndClose = () => {
    setSelectedAgent(null);
    setAgentSearchQuery('');
    setMode('select');
    setNewDiscount({ code: '', discountPercentage: '', startDate: '', endDate: '', usageLimit: '' });
    setPlanDiscount({ discountPercentage: '', customPrice: '', startDate: '', endDate: '' });
    setSelectedPlan(null);
    onClose();
  };

  return (
    <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Descuento para Agente</h3>
      <p className="text-sm text-gray-500 mb-6">Asigna un descuento a un agente especifico</p>

      {mode === 'select' && (
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Buscar agente por nombre o email..."
              value={agentSearchQuery}
              onChange={(e) => { setAgentSearchQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && filteredAgents.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredAgents.map((agent: AgentListItem) => (
                  <button
                    key={agent.id}
                    onClick={() => { setSelectedAgent(agent); setShowDropdown(false); setAgentSearchQuery(`${agent.firstName || ''} ${agent.lastName || ''}`); }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <div className="font-medium text-gray-900">{agent.firstName} {agent.lastName}</div>
                    <div className="text-sm text-gray-500">{agent.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedAgent && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
              <p className="text-sm font-medium text-teal-800">Agente seleccionado:</p>
              <p className="text-sm text-teal-700">{selectedAgent.firstName} {selectedAgent.lastName} ({selectedAgent.email})</p>
            </div>
          )}

          {selectedAgent && (
            <div className="flex flex-col gap-2">
              <Button onClick={() => setMode('create')} className="w-full">Crear Nuevo Descuento</Button>
              <Button onClick={() => setMode('assign')} variant="outline" className="w-full">Asignar Codigo Existente</Button>
              <Button onClick={() => setMode('plan')} variant="outline" className="w-full">Descuento por Plan</Button>
            </div>
          )}
        </div>
      )}

      {mode === 'create' && selectedAgent && (
        <CreateDiscountModal
          isOpen={true}
          onClose={() => setMode('select')}
          selectedAgent={selectedAgent}
          newDiscount={newDiscount}
          setNewDiscount={setNewDiscount}
          onCreate={handleCreateDiscount}
          isPending={createDiscountMutation.isPending}
        />
      )}

      {mode === 'assign' && selectedAgent && (
        <AssignDiscountModal
          isOpen={true}
          onClose={() => setMode('select')}
          selectedAgent={selectedAgent}
          availableDiscounts={availableDiscounts}
          onAssign={handleAssignDiscount}
          isPending={assignDiscountMutation.isPending}
        />
      )}

      {mode === 'plan' && selectedAgent && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setMode('select')} className="text-sm text-teal-600 hover:text-teal-700">
              &larr; Volver
            </button>
            <span className="text-sm text-gray-400">|</span>
            <p className="text-sm text-gray-600">
              Agente: <span className="font-semibold text-teal-600">{selectedAgent.firstName} {selectedAgent.lastName}</span>
            </p>
          </div>
          <h4 className="font-semibold text-gray-900 mb-3">Selecciona un plan para aplicar descuento:</h4>
          <div className="grid grid-cols-1 gap-3">
            {PLANS.map((plan) => (
              <button
                key={plan.code}
                onClick={() => { setSelectedPlan(plan); setMode('plan-select'); }}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-teal-300 transition-all text-left"
              >
                <div className={`w-12 h-12 ${plan.color} rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0`}>
                  {plan.code[0]}
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{plan.name}</h5>
                  <p className="text-lg font-bold text-gray-900">{plan.price}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'plan-select' && selectedAgent && selectedPlan && (
        <PlanDiscountModal
          isOpen={true}
          onClose={() => setMode('plan')}
          selectedAgent={selectedAgent}
          selectedPlan={selectedPlan}
          planDiscount={planDiscount}
          setPlanDiscount={setPlanDiscount}
          onCreate={handleCreatePlanDiscount}
          isPending={createPlanDiscountMutation.isPending}
        />
      )}
    </div>
  );
}

// ==================== Agency Discount Content (sin Modal propio) ====================

interface AgencyDiscountContentProps {
  onClose: () => void;
}

function AgencyDiscountContent({ onClose }: AgencyDiscountContentProps) {
  const [agencySearchQuery, setAgencySearchQuery] = useState('');
  const [selectedAgency, setSelectedAgency] = useState<InmobiliariaWithStats | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mode, setMode] = useState<'select' | 'create' | 'direct'>('select');
  const [newDiscount, setNewDiscount] = useState({ code: '', discountPercentage: '', startDate: '', endDate: '', usageLimit: '' });
  const [directDiscount, setDirectDiscount] = useState({
    discountPercentage: '',
    reason: '',
    notifyAgency: false,
    applyToAllAgents: false,
    maxAgents: '',
    expiresAt: '',
  });

  const { data: agenciesData } = useDevelopers();
  const allAgencies: InmobiliariaWithStats[] = agenciesData?.content || [];

  const createDiscountMutation = useCreateDeveloperDiscountCode();
  const applyDirectMutation = useApplyDirectDiscount();

  const filteredAgencies = useMemo(() => {
    if (!agencySearchQuery.trim()) return [];
    const q = agencySearchQuery.toLowerCase();
    return allAgencies.filter((a: InmobiliariaWithStats) =>
      (a.name || '').toLowerCase().includes(q) ||
      (a.ruc || '').toLowerCase().includes(q)
    ).slice(0, 5);
  }, [allAgencies, agencySearchQuery]);

  const handleCreateDiscount = async () => {
    if (!selectedAgency) return;
    try {
      const data: CreateInmobiliariaDiscountRequest = {
        inmobiliariaId: selectedAgency.id,
        code: newDiscount.code,
        discountPercentage: Number(newDiscount.discountPercentage),
        validFrom: newDiscount.startDate ? new Date(newDiscount.startDate) : undefined,
        validUntil: newDiscount.endDate ? new Date(newDiscount.endDate) : undefined,
        maxUses: newDiscount.usageLimit ? Number(newDiscount.usageLimit) : undefined,
      };
      await createDiscountMutation.mutateAsync({ developerId: selectedAgency.id, data });
      resetAndClose();
    } catch (error) {
      console.error('Error creating agency discount:', error);
    }
  };

  const handleApplyDirectDiscount = async () => {
    if (!selectedAgency) return;
    try {
      const data: ApplyDirectDiscountRequest = {
        discountPercentage: Number(directDiscount.discountPercentage),
        reason: directDiscount.reason,
        applyToAllAgents: directDiscount.applyToAllAgents,
        maxAgents: directDiscount.maxAgents ? Number(directDiscount.maxAgents) : undefined,
        expiresAt: directDiscount.expiresAt ? new Date(directDiscount.expiresAt) : undefined,
      };
      await applyDirectMutation.mutateAsync({ developerId: selectedAgency.id, data });
      resetAndClose();
    } catch (error) {
      console.error('Error applying direct discount:', error);
    }
  };

  const resetAndClose = () => {
    setSelectedAgency(null);
    setAgencySearchQuery('');
    setMode('select');
    setNewDiscount({ code: '', discountPercentage: '', startDate: '', endDate: '', usageLimit: '' });
    setDirectDiscount({ discountPercentage: '', reason: '', notifyAgency: false, applyToAllAgents: false, maxAgents: '', expiresAt: '' });
    onClose();
  };

  return (
    <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Descuento para Inmobiliaria</h3>
      <p className="text-sm text-gray-500 mb-6">Asigna un descuento a una inmobiliaria</p>

      {mode === 'select' && (
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Buscar inmobiliaria por nombre o RUC..."
              value={agencySearchQuery}
              onChange={(e) => { setAgencySearchQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && filteredAgencies.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredAgencies.map((agency: InmobiliariaWithStats) => (
                  <button
                    key={agency.id}
                    onClick={() => { setSelectedAgency(agency); setShowDropdown(false); setAgencySearchQuery(`${agency.name} (${agency.ruc})`); }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <div className="font-medium text-gray-900">{agency.name}</div>
                    <div className="text-sm text-gray-500">RUC: {agency.ruc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedAgency && (
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
              <p className="text-sm font-medium text-violet-800">Inmobiliaria seleccionada:</p>
              <p className="text-sm text-violet-700">{selectedAgency.name} (RUC: {selectedAgency.ruc})</p>
            </div>
          )}

          {selectedAgency && (
            <div className="flex flex-col gap-2">
              <Button onClick={() => setMode('create')} className="w-full">Crear Codigo de Descuento</Button>
              <Button onClick={() => setMode('direct')} variant="outline" className="w-full">Aplicar Descuento Directo</Button>
            </div>
          )}
        </div>
      )}

      {mode === 'create' && selectedAgency && (
        <CreateAgencyDiscountModal
          isOpen={true}
          onClose={() => setMode('select')}
          selectedAgency={selectedAgency}
          newDiscount={newDiscount}
          setNewDiscount={setNewDiscount}
          onCreate={handleCreateDiscount}
          isPending={createDiscountMutation.isPending}
        />
      )}

      {mode === 'direct' && selectedAgency && (
        <ApplyDirectDiscountModal
          isOpen={true}
          onClose={() => setMode('select')}
          selectedAgency={selectedAgency}
          directDiscount={directDiscount}
          setDirectDiscount={setDirectDiscount}
          onApply={handleApplyDirectDiscount}
          isPending={applyDirectMutation.isPending}
        />
      )}
    </div>
  );
}

// ==================== Reusable Discount Modal ====================

interface ReusableDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ReusableDiscountModal({ isOpen, onClose }: ReusableDiscountModalProps) {
  const [code, setCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [usageLimit, setUsageLimit] = useState(1000);
  const [singleUse, setSingleUse] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const createMutation = useCreateDiscountCode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        code,
        discountPercentage,
        applicability: 'GLOBAL',
        usageLimit,
        singleUse,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date('2099-12-31'),
      });
      setCode('');
      setDiscountPercentage(10);
      setUsageLimit(1000);
      setSingleUse(false);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      onClose();
    } catch (error) {
      console.error('Error creating reusable discount:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Codigo Reutilizable</h3>
        <p className="text-sm text-gray-500 mb-6">Codigo con multiples usos permitidos</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Codigo de Descuento"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ej: REUTILIZABLE20"
            required
          />
          <Input
            label="Porcentaje de Descuento (%)"
            type="number"
            min="1"
            max="100"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(Number(e.target.value))}
            required
          />
          <Input
            label="Limite de Usos"
            type="number"
            min="1"
            value={usageLimit}
            onChange={(e) => setUsageLimit(Number(e.target.value))}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha Inicio" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            <Input label="Fecha Fin" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createMutation.isPending} className="flex-1">
              {createMutation.isPending ? 'Creando...' : 'Crear Codigo Reutilizable'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// ==================== User Discount Modal ====================

interface UserDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function UserDiscountModal({ isOpen, onClose }: UserDiscountModalProps) {
  const [code, setCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [usageLimit, setUsageLimit] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const createMutation = useCreateDiscountCode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        code,
        discountPercentage,
        applicability: 'USER_SPECIFIC',
        usageLimit,
        singleUse: true,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date('2099-12-31'),
      });
      setCode('');
      setDiscountPercentage(10);
      setUsageLimit(1);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      onClose();
    } catch (error) {
      console.error('Error creating user discount:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Descuento para Usuario</h3>
        <p className="text-sm text-gray-500 mb-6">Crea un codigo de descuento para un usuario especifico</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Codigo de Descuento"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ej: USUARIO20"
            required
          />
          <Input
            label="Porcentaje de Descuento (%)"
            type="number"
            min="1"
            max="100"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(Number(e.target.value))}
            required
          />
          <Input
            label="Limite de Usos"
            type="number"
            min="1"
            value={usageLimit}
            onChange={(e) => setUsageLimit(Number(e.target.value))}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha Inicio" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            <Input label="Fecha Fin" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createMutation.isPending} className="flex-1">
              {createMutation.isPending ? 'Creando...' : 'Crear Descuento para Usuario'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// ==================== Main Component ====================

interface UniversalDiscountApplierProps {
  onDiscountApplied?: () => void;
}

export default function UniversalDiscountApplier({ onDiscountApplied }: UniversalDiscountApplierProps) {
  const [activeModal, setActiveModal] = useState<DiscountType | null>(null);

  const handleClose = useCallback(() => {
    setActiveModal(null);
    if (onDiscountApplied) onDiscountApplied();
  }, [onDiscountApplied]);

  const isAgentModalOpen = activeModal === 'AGENT' || activeModal === 'PLAN';
  const isAgencyModalOpen = activeModal === 'AGENCY';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Aplicador Universal de Descuentos</h3>
        <p className="text-sm text-gray-500">Selecciona el tipo de descuento que deseas aplicar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DISCOUNT_OPTIONS.map((option) => (
          <DiscountTypeCard
            key={option.type}
            option={option}
            onClick={() => setActiveModal(option.type)}
          />
        ))}
      </div>

      <GlobalDiscountModal
        isOpen={activeModal === 'GLOBAL'}
        onClose={handleClose}
      />

      <UserDiscountModal
        isOpen={activeModal === 'USER'}
        onClose={handleClose}
      />

      <Modal isOpen={isAgentModalOpen} onClose={handleClose}>
        <AgentDiscountContent onClose={handleClose} />
      </Modal>

      <Modal isOpen={isAgencyModalOpen} onClose={handleClose}>
        <AgencyDiscountContent onClose={handleClose} />
      </Modal>

      <ReusableDiscountModal
        isOpen={activeModal === 'REUSABLE'}
        onClose={handleClose}
      />
    </div>
  );
}
