'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from '@/presentation/store/toastStore';

// Helper function for API calls - usando axiosClient centralizado
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

// Avatar component (copied from the contacts page)
function Avatar({
  name, role, size = 'md', src,
}: {
  name: string; role?: string; size?: 'xs' | 'sm' | 'md' | 'lg'; src?: string;
}) {
  const sizes = { xs: 'w-7 h-7 text-[10px]', sm: 'w-9 h-9 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  
  const ROLE_COLOR: Record<string, string> = {
    USER: 'from-blue-500 to-blue-700',
    AGENT: 'from-teal-500 to-teal-700',
    DEVELOPER: 'from-purple-500 to-purple-700',
    ADMIN: 'from-slate-500 to-slate-700',
  };
  
  const color = ROLE_COLOR[role ?? 'USER'] ?? 'from-slate-500 to-slate-700';
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-semibold flex-shrink-0 select-none`}>
      {(name ?? '?').charAt(0).toUpperCase()}
    </div>
  );
}

interface Property {
  id: number;
  title: string;
  price: number;
  city: string;
  district: string;
  owner: {
    id: number;
    name: string;
    role: string;
    phone: string;
    avatar?: string;
  };
}

interface PropertySearchAndContactProps {
  onChatCreated?: (chatId: number) => void;
}

// Mock data - replace with actual API call
const mockProperties: Property[] = [
  {
    id: 1,
    title: "Departamento en Catalina",
    price: 1200,
    city: "Catalina",
    district: "Norte",
    owner: {
      id: 101,
      name: "Carlos Rodríguez",
      role: "USER",
      phone: "+51 987 654 321"
    }
  },
  {
    id: 2,
    title: "Casa en Miraflores",
    price: 2500,
    city: "Miraflores",
    district: "Central",
    owner: {
      id: 102,
      name: "María García",
      role: "AGENT",
      phone: "+51 912 345 678"
    }
  }
];

export { Avatar };

export default function PropertySearchAndContact({ onChatCreated }: PropertySearchAndContactProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'city' | 'district' | 'name' | 'price' | 'phone'>('all');

  // Fetch properties from API
  const { data: apiProperties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['search-properties', searchTerm, searchType],
    queryFn: async () => {
      if (!searchTerm) return mockProperties; // Return mock if no search
      
      const params = new URLSearchParams();
      
      // Build search parameters based on search type
      switch (searchType) {
        case 'city':
          params.append('city', searchTerm);
          break;
        case 'district':
          params.append('district', searchTerm);
          break;
        case 'name':
          params.append('keyword', searchTerm);
          break;
        case 'price':
          params.append('maxPrice', searchTerm);
          break;
        case 'phone':
          params.append('keyword', searchTerm);
          break;
        default:
          params.append('keyword', searchTerm);
      }
      
      params.append('sortBy', 'createdAt');
      params.append('sortOrder', 'desc');
      
      try {
        const response = await apiCall(`/api/contacts/extended/search/properties?${params}`);
        return response.map((prop: any) => ({
          id: prop.id,
          title: prop.title,
          price: Number(prop.price),
          city: prop.city,
          district: prop.district,
          owner: {
            id: prop.owner.id,
            name: prop.owner.name,
            role: prop.owner.role,
            phone: prop.owner.phone,
            avatar: prop.owner.avatar
          }
        }));
      } catch (error) {
        console.error('Error fetching properties:', error);
        return mockProperties; // Fallback to mock
      }
    },
    enabled: true
  });

  // Mutation to create chat from property interaction
  const createChatFromProperty = useMutation({
    mutationFn: async ({ ownerId, propertyId, initialMessage }: {
      ownerId: number;
      propertyId: number;
      initialMessage: string;
    }) => {
      return apiCall('/contacts/extended/chats', {
        method: 'POST',
        body: JSON.stringify({
          targetUserId: ownerId,
          propertyId,
          initialMessage,
          interactionType: 'contact'
        })
      });
    },
    onSuccess: (response) => {
      toast.success('¡Chat creado! Ahora puedes conversar con el propietario.');
      onChatCreated?.(response.id);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear chat');
    }
  });

  const handleLike = (property: Property) => {
    createChatFromProperty.mutate({
      ownerId: property.owner.id,
      propertyId: property.id,
      initialMessage: `👍 Me interesa tu propiedad: ${property.title}`
    });
  };

  const handleRequestInfo = (property: Property) => {
    createChatFromProperty.mutate({
      ownerId: property.owner.id,
      propertyId: property.id,
      initialMessage: `📋 Me gustaría más información sobre: ${property.title}`
    });
  };

  const handleContact = (property: Property) => {
    createChatFromProperty.mutate({
      ownerId: property.owner.id,
      propertyId: property.id,
      initialMessage: `💬 Hola, estoy interesado en tu propiedad: ${property.title}`
    });
  };

  const filteredProperties = apiProperties.filter((property: Property) => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    switch (searchType) {
      case 'city':
        return property.city.toLowerCase().includes(term);
      case 'district':
        return property.district.toLowerCase().includes(term);
      case 'name':
        return property.title.toLowerCase().includes(term);
      case 'price':
        return property.price.toString().includes(term);
      case 'phone':
        return property.owner.phone.includes(term);
      default:
        return property.title.toLowerCase().includes(term) ||
               property.city.toLowerCase().includes(term) ||
               property.district.toLowerCase().includes(term) ||
               property.owner.name.toLowerCase().includes(term);
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Buscar Propiedades y Contactar</h2>
      
      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Buscar propiedades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los campos</option>
            <option value="city">Ciudad</option>
            <option value="district">Distrito</option>
            <option value="name">Nombre de propiedad</option>
            <option value="price">Precio</option>
            <option value="phone">Teléfono</option>
          </select>
        </div>
      </div>

      {/* Properties List */}
      <div className="space-y-4">
        {filteredProperties.map((property: Property) => (
          <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>📍 {property.city}, {property.district}</span>
                  <span>💰 ${property.price}/mes</span>
                </div>
                
                {/* Property Owner Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar name={property.owner.name} role={property.owner.role} size="sm" />
                  <div className="flex-1">
                    <div className="font-medium">{property.owner.name}</div>
                    <div className="text-sm text-gray-600">{property.owner.phone}</div>
                    <div className="text-xs text-gray-500">
                      {property.owner.role === 'USER' ? 'Propietario' : 
                       property.owner.role === 'AGENT' ? 'Agente' : 'Desarrollador'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleLike(property)}
                disabled={createChatFromProperty.isPending}
                className="flex-1 py-2 px-4 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors font-medium disabled:opacity-50"
              >
                ❤️ Like
              </button>
              <button
                onClick={() => handleRequestInfo(property)}
                disabled={createChatFromProperty.isPending}
                className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium disabled:opacity-50"
              >
                📋 Solicitar Info
              </button>
              <button
                onClick={() => handleContact(property)}
                disabled={createChatFromProperty.isPending}
                className="flex-1 py-2 px-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium disabled:opacity-50"
              >
                💬 Contactar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No se encontraron propiedades que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
}
