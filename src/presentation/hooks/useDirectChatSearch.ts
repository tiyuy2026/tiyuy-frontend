import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from '@/presentation/store/toastStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  let token = null;
  if (typeof window !== 'undefined') {
    try {
      const { useAuthStore } = require('@/presentation/store/authStore');
      const authStore = useAuthStore.getState();
      token = authStore.token;

      if (!token) {
        token = localStorage.getItem('tiyuy-auth-token') ||
               localStorage.getItem('token') ||
               localStorage.getItem('auth-token');
      }
    } catch {
      token = localStorage.getItem('tiyuy-auth-token') ||
             localStorage.getItem('token') ||
             localStorage.getItem('auth-token');
    }
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
  }

  return response.json();
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
        const response = await apiCall(`/api/contacts/extended/search/users?${params}`);
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
      const response = await fetch(`${API_BASE_URL}/api/contacts/extended/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiyuy-auth-token') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ participantId: userId, initialMessage })
      });
      if (!response.ok) throw new Error('Error al crear chat');
      return response.json();
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
