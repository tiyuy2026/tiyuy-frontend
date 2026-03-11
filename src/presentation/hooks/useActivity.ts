'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityRepository } from '@/infrastructure/repositories/ActivityRepository';
import { ActivityLog, ActivityStats, ActivityFilters } from '@/core/domain/entities/Activity';
import { toast } from 'sonner';

const activityRepo = new ActivityRepository();

export function useUserActivities(filters?: ActivityFilters) {
  return useQuery({
    queryKey: ['activities', 'user', filters],
    queryFn: () => activityRepo.getUserActivities(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      // Si el backend no está listo, no reintentar infinitamente
      if (error?.response?.status === 500 || error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useActivityStats(filters?: Omit<ActivityFilters, 'limit' | 'offset'>) {
  return useQuery({
    queryKey: ['activities', 'stats', filters],
    queryFn: () => activityRepo.getActivityStats(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error: any) => {
      // Si el backend no está listo, no reintentar infinitamente
      if (error?.response?.status === 500 || error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useTrackActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (activity: Omit<ActivityLog, 'id' | 'createdAt' | 'updatedAt'>) => 
      activityRepo.trackActivity(activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'stats'] });
    },
    onError: (error: any) => {
      console.error('Error tracking activity:', error);
      toast.error('Error al registrar actividad');
    },
  });
}

export function useCompleteActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => activityRepo.markActivityAsCompleted(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'stats'] });
      toast.success('Actividad completada');
    },
    onError: (error: any) => {
      console.error('Error completing activity:', error);
      toast.error('Error al completar actividad');
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => activityRepo.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'stats'] });
      toast.success('Actividad eliminada');
    },
    onError: (error: any) => {
      console.error('Error deleting activity:', error);
      toast.error('Error al eliminar actividad');
    },
  });
}

export function useExportActivities() {
  return useMutation({
    mutationFn: (filters?: ActivityFilters) => activityRepo.exportActivities(filters),
    onSuccess: (blob: Blob) => {
      // Create download link for PDF
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historial-actividades-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Historial exportado correctamente en PDF');
    },
    onError: (error: any) => {
      console.error('Error exporting activities:', error);
      toast.error('Error al exportar historial en PDF');
    },
  });
}
