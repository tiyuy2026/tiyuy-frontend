'use client';

import { useState } from 'react';
import { useDeveloperAssociationRequests, useDeveloperAgentAssociations } from '@/presentation/hooks/admin/useDeveloperAssociations';
import { DeveloperAgentAssociation } from '@/core/domain/entities/Admin';
import AssociationRequestCard from '@/presentation/components/admin/AssociationRequestCard';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { Users, Clock, CheckCircle } from 'lucide-react';

export default function AssociationRequestsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'all'>('pending');
  
  // TODO: Obtener el developerId del usuario actual o permitir selección
  // Por ahora, esto requiere que el backend implemente el endpoint
  const developerId = 0; 
  
  const { data: requests, isLoading: isLoadingRequests, refetch } = useDeveloperAssociationRequests(developerId);
  const { data: activeAssociations, isLoading: isLoadingActive } = useDeveloperAgentAssociations(developerId);

  const pendingRequests = requests?.filter(r => r.status === 'PENDING') || [];
  const activeAgents = activeAssociations?.filter(a => a.status === 'ACTIVE') || [];
  const allAssociations = requests || [];

  const filteredAssociations = activeTab === 'pending' 
    ? pendingRequests 
    : activeTab === 'active' 
    ? activeAgents 
    : allAssociations;

  if (!developerId) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium mb-2">Selecciona una inmobiliaria</p>
          <p className="text-sm">Esta página requiere que selecciones una inmobiliaria (DEVELOPER)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Solicitudes de Asociación</h1>
        <p className="text-gray-600">Gestiona las solicitudes de agentes que quieren asociarse a tu inmobiliaria</p>
      </div>

      {/* Tabs simples sin componente Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'pending'
              ? 'border-teal-500 text-teal-700'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Pendientes ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'active'
              ? 'border-teal-500 text-teal-700'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <CheckCircle className="w-4 h-4 inline mr-2" />
          Activos ({activeAgents.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'all'
              ? 'border-teal-500 text-teal-700'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Todas ({allAssociations.length})
        </button>
      </div>

      <div className="mt-6">
        {isLoadingRequests || isLoadingActive ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredAssociations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium mb-2">
                {activeTab === 'pending' ? 'No hay solicitudes pendientes' : 
                 activeTab === 'active' ? 'No hay agentes activos' : 
                 'No hay asociaciones'}
              </p>
              <p className="text-sm">
                {activeTab === 'pending' 
                  ? 'Las solicitudes de agentes aparecerán aquí cuando envíen una solicitud de asociación'
                  : activeTab === 'active'
                  ? 'Aproba solicitudes para empezar a tener agentes activos'
                  : 'No hay actividad de asociaciones aún'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssociations.map((association) => (
              <AssociationRequestCard
                key={association.id}
                association={association}
                onRefresh={refetch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
