'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationPreferences } from '../../core/domain/entities/Notification';
import { NotificationRepository } from '../../infrastructure/repositories/NotificationRepository';

const repo = new NotificationRepository();

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const preferencesQuery = useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: () => repo.getPreferences(),
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) => repo.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
  });

  return {
    preferences: preferencesQuery.data,
    isLoading: preferencesQuery.isPending,
    error: preferencesQuery.error,
    
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
    updateError: updatePreferencesMutation.error,
  };
};
