// ==== PÁGINA REFACTORIZADA - VERSIÓN LIMPIA ====
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, CheckCircle, PauseCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/presentation/components/ui/Card';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { Modal } from '@/presentation/components/ui/Modal/Modal';
import { axiosClient } from '@/infrastructure/api/axios-client';
import { usePermissions } from '@/presentation/hooks/usePermissions';

// Tipos
import { Group, Channel, ViewType, ViewMode, StatusFilter, SortBy, SuspendedFilter } from './types';

// Componentes
import { StatsCards, NewGroupButton } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { ViewTabs } from './components/ViewTabs';
import { SuspendedFilter as SuspendedFilterComponent } from './components/SuspendedFilter';
import { ItemGrid } from './components/ItemGrid';
import { ItemList } from './components/ItemList';
import { EmptyState } from './components/EmptyState';
import { Input } from '@/presentation/components/ui/Input/Input';

// Modales
import { ViewDetailsModal } from './components/modals/ViewDetailsModal';
import { SuspendModal } from './components/modals/SuspendModal';
import { ViolationModal } from './components/modals/ViolationModal';
import { ReactivateModal } from './components/modals/ReactivateModal';
import CreateGroupModal from './components/CreateGroupModal';

// Funciones de API
const fetchGroups = async (): Promise<Group[]> => {
  const response = await axiosClient.get('/contacts/extended/groups');
  return response.data.content || [];
};

const fetchChannels = async (): Promise<Channel[]> => {
  const response = await axiosClient.get('/contacts/extended/channels');
  return response.data.content || [];
};

const fetchChannelsForAdmin = async (): Promise<Channel[]> => {
  const response = await axiosClient.get('/admin/groups/channels/all');
  return response.data.channels || [];
};

const fetchGroupViolations = async (): Promise<Group[]> => {
  const response = await axiosClient.get('/admin/groups/violations');
  return response.data.groups || [];
};

const fetchChannelViolations = async (): Promise<Channel[]> => {
  const response = await axiosClient.get('/admin/groups/channels/violations');
  return response.data.channels || [];
};

const createGroup = async (groupData: {
  name: string;
  description: string;
  adminName: string;
  adminEmail: string;
  city?: string;
  isActive: boolean;
}) => {
  const response = await axiosClient.post('/admin/groups', groupData);
  return response.data;
};

const fetchSuspendedGroups = async (): Promise<(Group | Channel)[]> => {
  const [allGroupsRes, groupViolationsRes, allChannelsRes, channelViolationsRes] = await Promise.all([
    axiosClient.get('/admin/groups/all'),
    axiosClient.get('/admin/groups/violations'),
    axiosClient.get('/admin/groups/channels/all'),
    axiosClient.get('/admin/groups/channels/violations')
  ]);
  
  const allGroups = allGroupsRes.data.groups || [];
  const violationGroups = groupViolationsRes.data.groups || [];
  const allChannels = allChannelsRes.data.channels || [];
  const violationChannels = channelViolationsRes.data.channels || [];
  
  const suspendedGroups = allGroups.filter((g: Group) => !g.isActive);
  const suspendedChannels = allChannels.filter((c: Channel) => !c.isActive);
  
  const combinedMap = new Map<number, Group | Channel>();
  
  suspendedGroups.forEach((g: Group) => combinedMap.set(g.id, { ...g, suspensionType: 'disabled' }));
  suspendedChannels.forEach((c: Channel) => combinedMap.set(c.id, { ...c, suspensionType: 'disabled' }));
  
  violationGroups.forEach((g: Group) => {
    if (combinedMap.has(g.id)) {
      const existing = combinedMap.get(g.id)!;
      combinedMap.set(g.id, { ...existing, suspensionType: 'violation' });
    } else {
      combinedMap.set(g.id, { ...g, suspensionType: 'violation' });
    }
  });
  
  violationChannels.forEach((c: Channel) => {
    if (combinedMap.has(c.id)) {
      const existing = combinedMap.get(c.id)!;
      combinedMap.set(c.id, { ...existing, suspensionType: 'violation' });
    } else {
      combinedMap.set(c.id, { ...c, suspensionType: 'violation' });
    }
  });
  
  return Array.from(combinedMap.values());
};

// Management API functions
const toggleGroupStatus = async (groupId: number, isActive: boolean): Promise<void> => {
  await axiosClient.patch(`/admin/groups/${groupId}/status`, { isActive });
};

const suspendGroup = async (groupId: number, reason: string): Promise<void> => {
  await axiosClient.post(`/admin/groups/${groupId}/suspend`, { reason });
};

const sendViolationEmail = async (groupId: number, violationType: string, message: string): Promise<void> => {
  await axiosClient.post(`/admin/groups/${groupId}/violation-email`, { violationType, message });
};

const toggleChannelStatus = async (channelId: number, isActive: boolean): Promise<void> => {
  await axiosClient.patch(`/admin/groups/channels/${channelId}/status`, { isActive });
};

const suspendChannel = async (channelId: number, reason: string): Promise<void> => {
  await axiosClient.post(`/admin/groups/channels/${channelId}/suspend`, { reason });
};

const sendChannelViolationEmail = async (channelId: number, violationType: string, message: string): Promise<void> => {
  await axiosClient.post(`/admin/groups/channels/${channelId}/violation-email`, { violationType, message });
};

const reactivateGroup = async (groupId: number, reason: string): Promise<void> => {
  await axiosClient.patch(`/admin/groups/${groupId}/status`, { isActive: true });
};

const reactivateChannel = async (channelId: number, reason: string): Promise<void> => {
  await axiosClient.patch(`/admin/groups/channels/${channelId}/status`, { isActive: true });
};

// Componente Principal de Gestión de Grupos y Canales
export default function GroupsAndChannelsPage() {
  // Gestión de estado para componentes de UI
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'groups' | 'channels' | 'suspended'>('groups');
  const [suspendedFilter, setSuspendedFilter] = useState<'all' | 'groups' | 'channels'>('all');
  
  // Estados de filtros y ordenamiento
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended' | 'violations'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az' | 'za' | 'most_members' | 'least_members'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cityFilter, setCityFilter] = useState<string>('');
  
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [violationType, setViolationType] = useState('CONTENT_VIOLATION');
  const [violationMessage, setViolationMessage] = useState('');
  const [reactivateReason, setReactivateReason] = useState('');
  const [selectedItemType, setSelectedItemType] = useState<'group' | 'channel'>('group');

  // Hooks de permisos y cliente de consultas
  const { hasPermission } = usePermissions();
  const canManageGroups = hasPermission('MANAGE_GROUPS');
  const queryClient = useQueryClient();

  // Hooks de obtención de datos
  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['admin-groups'],
    queryFn: fetchGroups,
  });

  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ['admin-channels'],
    queryFn: fetchChannelsForAdmin,
  });

  const { data: suspendedGroups, isLoading: isLoadingSuspended } = useQuery({
    queryKey: ['admin-suspended-groups'],
    queryFn: fetchSuspendedGroups,
  });

  // Obtener violaciones directamente desde endpoints del backend
  const { data: groupViolations } = useQuery({
    queryKey: ['admin-group-violations'],
    queryFn: fetchGroupViolations,
  });

  const { data: channelViolations } = useQuery({
    queryKey: ['admin-channel-violations'],
    queryFn: fetchChannelViolations,
  });

  // Hooks de mutación para operaciones de gestión (usando nuevos endpoints de admin)
  const toggleGroupStatusMutation = useMutation({
    mutationFn: ({ groupId, isActive }: { groupId: number; isActive: boolean }) => toggleGroupStatus(groupId, isActive),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      // Mostrar notificación de éxito
      alert(variables.isActive ? '✅ Grupo activado exitosamente' : '✅ Grupo desactivado exitosamente');
    },
    onError: (error) => {
      alert('❌ Error al cambiar estado del grupo: ' + error.message);
    },
  });

  const suspendGroupMutation = useMutation({
    mutationFn: ({ groupId, reason }: { groupId: number; reason: string }) => suspendGroup(groupId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-suspended-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-group-violations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-channel-violations'] });
      setIsSuspendModalOpen(false);
      setSuspendReason('');
      // Mostrar notificación de éxito
      alert('✅ Grupo suspendido exitosamente');
    },
    onError: (error) => {
      alert('❌ Error al suspender grupo: ' + error.message);
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-suspended-groups'] });
      // Mostrar notificación de éxito
      alert('✅ Grupo creado exitosamente');
    },
    onError: (error) => {
      alert('❌ Error al crear grupo: ' + error.message);
    },
  });

  const sendGroupViolationEmailMutation = useMutation({
    mutationFn: ({ groupId, violationType, message }: { groupId: number; violationType: string; message: string }) => 
      sendViolationEmail(groupId, violationType, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      setIsViolationModalOpen(false);
      setViolationType('CONTENT_VIOLATION');
      setViolationMessage('');
      // Mostrar notificación de éxito
      alert('✅ Email de violación enviado exitosamente');
    },
    onError: (error) => {
      alert('❌ Error al enviar email de violación: ' + error.message);
    },
  });

  const toggleChannelStatusMutation = useMutation({
    mutationFn: ({ channelId, isActive }: { channelId: number; isActive: boolean }) => toggleChannelStatus(channelId, isActive),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-channels'] });
      queryClient.invalidateQueries({ queryKey: ['admin-suspended-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-group-violations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-channel-violations'] });
      // Mostrar notificación de éxito
      alert(variables.isActive ? '✅ Canal activado exitosamente' : '✅ Canal desactivado exitosamente');
    },
    onError: (error) => {
      alert('❌ Error al cambiar estado del canal: ' + error.message);
    },
  });

  const suspendChannelMutation = useMutation({
    mutationFn: ({ channelId, reason }: { channelId: number; reason: string }) => suspendChannel(channelId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-channels'] });
      queryClient.invalidateQueries({ queryKey: ['admin-suspended-groups'] });
      setIsSuspendModalOpen(false);
      setSuspendReason('');
      // Mostrar notificación de éxito
      alert('✅ Canal suspendido exitosamente');
    },
    onError: (error) => {
      alert('❌ Error al suspender canal: ' + error.message);
    },
  });

  const sendChannelViolationEmailMutation = useMutation({
    mutationFn: ({ channelId, violationType, message }: { channelId: number; violationType: string; message: string }) => 
      sendChannelViolationEmail(channelId, violationType, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-channels'] });
      queryClient.invalidateQueries({ queryKey: ['admin-suspended-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-group-violations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-channel-violations'] });
      setIsViolationModalOpen(false);
      setViolationType('CONTENT_VIOLATION');
      setViolationMessage('');
      // Mostrar notificación de éxito
      alert('✅ Correo de violación enviado exitosamente');
    },
    onError: (error) => {
      alert('❌ Error al enviar correo de violación: ' + error.message);
    },
  });

  const reactivateGroupMutation = useMutation({
    mutationFn: ({ groupId, reason }: { groupId: number; reason: string }) => reactivateGroup(groupId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-suspended-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-group-violations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-channel-violations'] });
      setIsReactivateModalOpen(false);
      setReactivateReason('');
      // Mostrar notificación de éxito
      alert('✅ Grupo reactivado exitosamente');
    },
    onError: (error) => {
      alert('❌ Error al reactivar grupo: ' + error.message);
    },
  });

  const reactivateChannelMutation = useMutation({
    mutationFn: ({ channelId, reason }: { channelId: number; reason: string }) => reactivateChannel(channelId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-channels'] });
      queryClient.invalidateQueries({ queryKey: ['admin-suspended-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-group-violations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-channel-violations'] });
      setIsReactivateModalOpen(false);
      setReactivateReason('');
      // Mostrar notificación de éxito
      alert('✅ Canal reactivado exitosamente');
    },
    onError: (error) => {
      alert('❌ Error al reactivar canal: ' + error.message);
    },
  });

  // Event handlers for user interactions
  const handleToggleGroupStatus = (groupId: number, isActive: boolean) => {
    toggleGroupStatusMutation.mutate({ groupId, isActive });
  };

  const handleSuspendGroup = () => {
    if (!selectedGroup || !suspendReason) return;
    suspendGroupMutation.mutate({ groupId: selectedGroup.id, reason: suspendReason });
  };

  const handleSendGroupViolationEmail = () => {
    if (!selectedGroup || !violationMessage) return;
    sendGroupViolationEmailMutation.mutate({ 
      groupId: selectedGroup.id, 
      violationType, 
      message: violationMessage 
    });
  };

  const handleToggleChannelStatus = (channelId: number, isActive: boolean) => {
    toggleChannelStatusMutation.mutate({ channelId, isActive });
  };

  const handleSuspendChannel = () => {
    if (!selectedChannel || !suspendReason) return;
    suspendChannelMutation.mutate({ channelId: selectedChannel.id, reason: suspendReason });
  };

  const handleSendChannelViolationEmail = () => {
    if (!selectedChannel || !violationMessage) return;
    sendChannelViolationEmailMutation.mutate({ 
      channelId: selectedChannel.id, 
      violationType, 
      message: violationMessage 
    });
  };

  const handleReactivate = () => {
    if (selectedItemType === 'group' && selectedGroup) {
      if (!reactivateReason) return;
      reactivateGroupMutation.mutate({ groupId: selectedGroup.id, reason: reactivateReason });
    } else if (selectedItemType === 'channel' && selectedChannel) {
      if (!reactivateReason) return;
      reactivateChannelMutation.mutate({ channelId: selectedChannel.id, reason: reactivateReason });
    }
  };

  // Modal management functions
  const openGroupViewModal = (group: Group) => {
    setSelectedGroup(group);
    setIsViewModalOpen(true);
  };

  const openChannelViewModal = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsViewModalOpen(true);
  };

  const openSuspendModal = (item: Group | Channel) => {
    if ('memberCount' in item) {
      setSelectedGroup(item);
    } else {
      setSelectedChannel(item);
    }
    setIsSuspendModalOpen(true);
  };

  const openViolationModal = (item: Group | Channel) => {
    if ('memberCount' in item) {
      setSelectedGroup(item);
    } else {
      setSelectedChannel(item);
    }
    setIsViolationModalOpen(true);
  };

  const openReactivateModal = (item: Group | Channel) => {
    const isChannelItem = 'city' in item;
    setSelectedItemType(isChannelItem ? 'channel' : 'group');
    if (isChannelItem) {
      setSelectedChannel(item as Channel);
      setSelectedGroup(null);
    } else {
      setSelectedGroup(item as Group);
      setSelectedChannel(null);
    }
    setIsReactivateModalOpen(true);
  };

  // Filter data based on view type
  // For groups/channels view, only show active items (isActive = true)
  // For suspended view, show only inactive/blocked items (isActive = false)
  const getCurrentData = () => {
    if (viewType === 'groups') return groups?.filter((g: Group) => g.isActive === true);
    if (viewType === 'channels') return channels?.filter((c: Channel) => c.isActive === true);
    return suspendedGroups;
  };
  
  const currentData = getCurrentData();
  const isLoading = viewType === 'groups' ? isLoadingGroups : viewType === 'channels' ? isLoadingChannels : isLoadingSuspended;
  
  // Apply all filters: search, status, suspended type
  const filteredData = currentData?.filter((item) => {
    const name = item.name.toLowerCase();
    const description = item.description.toLowerCase();
    const city = 'city' in item ? item.city.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    
    // Apply search filter
    const matchesSearch = name.includes(query) || description.includes(query) || city.includes(query);
    if (!matchesSearch) return false;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const isGroup = !('city' in item);
      const isActive = isGroup ? (item as Group).isActive : (item as Channel).isActive;
      const hasViolation = item.suspensionType === 'violation' || (isGroup && (item as Group).hasViolation);
      
      switch (statusFilter) {
        case 'active':
          if (!isActive) return false;
          break;
        case 'inactive':
        case 'suspended':
          if (isActive) return false;
          break;
        case 'violations':
          if (!hasViolation) return false;
          break;
      }
    }
    
    // Apply suspended filter for suspended view
    if (viewType === 'suspended' && suspendedFilter !== 'all') {
      const isChannel = 'city' in item;
      if (suspendedFilter === 'groups' && isChannel) return false;
      if (suspendedFilter === 'channels' && !isChannel) return false;
    }
    
    return true;
  });
  
  // Apply sorting
  const sortedData = filteredData?.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'az':
        return a.name.localeCompare(b.name);
      case 'za':
        return b.name.localeCompare(a.name);
      case 'most_members':
        const aMembers = 'city' in a ? (a as Channel).subscriberCount : (a as Group).memberCount;
        const bMembers = 'city' in b ? (b as Channel).subscriberCount : (b as Group).memberCount;
        return bMembers - aMembers;
      case 'least_members':
        const aMembersLeast = 'city' in a ? (a as Channel).subscriberCount : (a as Group).memberCount;
        const bMembersLeast = 'city' in b ? (b as Channel).subscriberCount : (b as Group).memberCount;
        return aMembersLeast - bMembersLeast;
      default:
        return 0;
    }
  });

  // Calculate statistics for groups and channels
  const totalGroups = groups?.length || 0;
  const totalChannels = channels?.length || 0;
  const totalItems = totalGroups + totalChannels;
  
  // Active items (from groups and channels data)
  const activeGroups = groups?.filter((g: Group) => g.isActive).length || 0;
  const activeChannels = channels?.filter((c: Channel) => c.isActive).length || 0;
  const activeItems = activeGroups + activeChannels;
  
  // Suspended items (from suspendedGroups which includes both groups and channels)
  const suspendedItems = suspendedGroups?.length || 0;
  const suspendedGroupsCount = suspendedGroups?.filter((item: Group | Channel) => !('city' in item)).length || 0;
  const suspendedChannelsCount = suspendedGroups?.filter((item: Group | Channel) => 'city' in item).length || 0;
  
  // Violaciones - DESDE ENDPOINTS DEL BACKEND (no calculado localmente)
  const groupsWithViolationsCount = groupViolations?.length || 0;
  const channelsWithViolationsCount = channelViolations?.length || 0;
  const itemsWithViolations = groupsWithViolationsCount + channelsWithViolationsCount;

  const activePercentage = totalItems > 0 ? Math.round((activeItems / totalItems) * 100) : 0;
  const suspendedPercentage = totalItems > 0 ? ((suspendedItems / totalItems) * 100).toFixed(1) : 0;
  const violationsPercentage = totalItems > 0 ? ((itemsWithViolations / totalItems) * 100).toFixed(1) : 0;

  return (
    <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-8">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Gestión de Grupos y Canales</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Administra grupos de la red social y canales por ciudad</p>
        </div>
        <button
          onClick={() => setIsCreateGroupModalOpen(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg hover:from-blue-600 hover:to-teal-500 transition-all font-medium shadow-lg hover:shadow-xl text-xs sm:text-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Crear Grupo
        </button>
      </div>

      <StatsCards
        totalItems={totalItems}
        totalGroups={groups?.length || 0}
        totalChannels={channels?.length || 0}
        activeItems={activeItems}
        activePercentage={activePercentage}
        suspendedItems={suspendedItems}
        suspendedGroupsCount={suspendedGroupsCount}
        suspendedChannelsCount={suspendedChannelsCount}
        itemsWithViolations={itemsWithViolations}
        groupsWithViolationsCount={groupsWithViolationsCount}
        channelsWithViolationsCount={channelsWithViolationsCount}
      />

      {/* Filter tabs */}
      <ViewTabs viewType={viewType} setViewType={setViewType} />

      {/* Suspended Filter - Only show for suspended view */}
      {viewType === 'suspended' && (
        <SuspendedFilterComponent 
          suspendedFilter={suspendedFilter} 
          setSuspendedFilter={setSuspendedFilter} 
        />
      )}

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        viewType={viewType}
      />

      {/* Main content card with list */}
      <Card>
        <CardContent className="p-3 sm:p-6">

          {/* Results counter for suspended view */}
          {viewType === 'suspended' && filteredData && (
            <div className="mb-4 flex gap-4 text-sm text-gray-600">
              <span>
                👥 Grupos: {filteredData.filter((item: Group | Channel) => !('city' in item)).length}
              </span>
              <span>
                📡 Canales: {filteredData.filter((item: Group | Channel) => 'city' in item).length}
              </span>
              <span className="font-medium">
                Total: {filteredData.length}
              </span>
            </div>
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : viewMode === 'grid' ? (
            <ItemGrid
              items={sortedData || []}
              viewType={viewType}
              onReactivate={(item) => openReactivateModal(item)}
              onViewDetails={(item) => {
                if ('city' in item) {
                  openChannelViewModal(item as Channel);
                } else {
                  openGroupViewModal(item as Group);
                }
              }}
              onToggleStatus={(item) => {
                if ('city' in item) {
                  handleToggleChannelStatus(item.id, !(item as Channel).isActive);
                } else {
                  handleToggleGroupStatus(item.id, !(item as Group).isActive);
                }
              }}
              onSuspend={(item) => openSuspendModal(item)}
              onViolation={(item) => openViolationModal(item)}
            />
          ) : (
            <ItemList
              items={sortedData || []}
              viewType={viewType}
              onReactivate={(item) => openReactivateModal(item)}
              onViewDetails={(item) => {
                if ('city' in item) {
                  openChannelViewModal(item as Channel);
                } else {
                  openGroupViewModal(item as Group);
                }
              }}
              onToggleStatus={(item) => {
                if ('city' in item) {
                  handleToggleChannelStatus(item.id, !(item as Channel).isActive);
                } else {
                  handleToggleGroupStatus(item.id, !(item as Group).isActive);
                }
              }}
              onSuspend={(item) => openSuspendModal(item)}
              onViolation={(item) => openViolationModal(item)}
            />
          )}

          {/* Empty state */}
          {!isLoading && (!sortedData || sortedData.length === 0) && (
            <EmptyState viewType={viewType} />
          )}
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        item={selectedGroup || selectedChannel}
        viewType={viewType}
      />

      {/* Suspend Modal */}
      <SuspendModal
        isOpen={isSuspendModalOpen}
        onClose={() => {
          setIsSuspendModalOpen(false);
          setSuspendReason('');
        }}
        item={selectedGroup || selectedChannel}
        reason={suspendReason}
        setReason={setSuspendReason}
        onConfirm={viewType === 'groups' ? handleSuspendGroup : handleSuspendChannel}
        isPending={viewType === 'groups' ? suspendGroupMutation.isPending : suspendChannelMutation.isPending}
      />

      {/* Violation Email Modal */}
      <ViolationModal
        isOpen={isViolationModalOpen}
        onClose={() => {
          setIsViolationModalOpen(false);
          setViolationType('CONTENT_VIOLATION');
          setViolationMessage('');
        }}
        item={selectedGroup || selectedChannel}
        violationType={violationType}
        setViolationType={setViolationType}
        message={violationMessage}
        setMessage={setViolationMessage}
        onConfirm={viewType === 'groups' ? handleSendGroupViolationEmail : handleSendChannelViolationEmail}
        isPending={viewType === 'groups' ? sendGroupViolationEmailMutation.isPending : sendChannelViolationEmailMutation.isPending}
      />
      {/* Reactivate Modal */}
      <ReactivateModal
        isOpen={isReactivateModalOpen}
        onClose={() => {
          setIsReactivateModalOpen(false);
          setReactivateReason('');
        }}
        item={selectedItemType === 'group' ? selectedGroup : selectedChannel}
        itemType={selectedItemType}
        reason={reactivateReason}
        setReason={setReactivateReason}
        onConfirm={handleReactivate}
        isPending={reactivateGroupMutation.isPending || reactivateChannelMutation.isPending}
      />
      
      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreateGroup={createGroupMutation.mutateAsync}
      />
    </div>
  );
}
