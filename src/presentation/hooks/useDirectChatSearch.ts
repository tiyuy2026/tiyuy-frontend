import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from '@/presentation/store/toastStore';
import { axiosClient } from '@/infrastructure/api/axios-client';

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const response = await axiosClient.request({
    method: options.method || 'GET',
    url,
    data: options.body,
  });
  
  return response.data;
}

export function useDirectChatSearch(
  searchTerm: string,
  searchType: 'all' | 'name' | 'role' | 'phone' | 'city',
  onChatCreated?: (chatId: number) => void
) {
  const { data: apiUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['search-users', searchTerm, searchType],
    queryFn: async () => {
      if (!searchTerm) return [];

      const params = new URLSearchParams();

      switch (searchType) {
        case 'name':
          params.append('keyword', searchTerm);
          break;
        case 'role':
          params.append('role', searchTerm.toUpperCase());
          break;
        case 'phone':
          params.append('keyword', searchTerm);
          break;
        case 'city':
          params.append('city', searchTerm);
          break;
        default:
          params.append('keyword', searchTerm);
      }

      params.append('sortBy', 'createdAt');
      params.append('sortOrder', 'desc');

      try {
        const response = await apiCall(`/contacts/extended/search/users?${params}`);
        return response.map((user: any) => ({
          id: user.id,
          name: user.name,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          properties: user.properties?.map((prop: any) => ({
            id: prop.id,
            title: prop.title,
            city: prop.city,
            price: prop.price
          })) || []
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
    enabled: true
  });

  const createDirectChat = useMutation({
    mutationFn: async ({ userId, initialMessage }: { userId: number; initialMessage: string }) => {
      const response = await axiosClient.post('/contacts/extended/chats', { participantId: userId, initialMessage });
      return response.data;
    },
    onSuccess: (response) => {
      toast.success('¡Chat creado! Ahora puedes conversar.');
      onChatCreated?.(response.id);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear chat');
    }
  });

  return { apiUsers, loadingUsers, createDirectChat };
}
