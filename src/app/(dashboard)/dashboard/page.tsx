'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { useAuthStore } from '@/presentation/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/presentation/store/toastStore';
import { axiosClient } from '@/infrastructure/api/axios-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sun, Moon, Type, Globe, Lock, User, Camera, CheckCircle, Palette, MessageSquare, Users, Diamond, Home, Flame, Building, FolderGit, PlusCircle } from 'lucide-react';
import { UserAvatar } from '@/presentation/components/shared/UserAvatar';
import MyAgencySection from '@/presentation/components/profile/MyAgencySection';

// Hooks para API
function useCurrentUser() {
  const { user: authUser, setUser } = useAuthStore();
  
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await axiosClient.get('/auth/me');
      const userData = response.data;
      if (userData) {
        setUser(userData);
      }
      return userData;
    },
    initialData: authUser,
    enabled: !!authUser,
  });
}
function useUserPreferences() {
  return useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const response = await axiosClient.get('/auth/preferences');
      return response.data;
    },
  });
}

function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosClient.patch('/auth/preferences', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
}

function useUploadProfilePhoto() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosClient.post('/auth/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (user && data?.avatar) {
        setUser({ ...user, photoUrl: data.avatar });
      }
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      console.error('Error uploading photo:', error);
    },
  });
}

function useVerifyIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { documentType: 'DNI' | 'RUC'; documentNumber: string }) => {
      const endpoint = data.documentType === 'DNI' 
        ? '/identity/complete-kyc'
        : '/identity/upgrade-to-developer';
      
      const payload = data.documentType === 'DNI' 
        ? { dni: data.documentNumber }
        : { ruc: data.documentNumber };
      
      const response = await axiosClient.post(endpoint, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      console.error('Identity verification error:', error);
    },
  });
}

function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await axiosClient.post('/auth/change-password', data);
      return response.data;
    },
  });
}

function useUpdateEmail() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  
  return useMutation({
    mutationFn: async (newEmail: string) => {
      const response = await axiosClient.patch('/auth/me', { email: newEmail });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
    onError: (error: any) => {
      console.error('Email update error:', error);
    },
  });
}

export default function DashboardPage() {
  const { user: authUser } = useAuthStore();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdatePreferences();
  const uploadPhoto = useUploadProfilePhoto();
  const verifyIdentity = useVerifyIdentity();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const user = currentUser || authUser;

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [crmBackground, setCrmBackground] = useState('#ffffff');
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal');
  const [language, setLanguage] = useState<'es' | 'en' | 'pt' | 'fr'>('es');
  const [timezone, setTimezone] = useState('America/Lima');
  const [country, setCountry] = useState('Peru');
  const [city, setCity] = useState('Lima');
  const [documentType, setDocumentType] = useState<'DNI' | 'RUC'>('DNI');
  const [documentNumber, setDocumentNumber] = useState('');

  useEffect(() => {
    if (preferences) {
      setTheme(preferences.theme || 'light');
      setCrmBackground(preferences.crmBackground || '#ffffff');
      setFontSize(preferences.fontSize || 'normal');
      
      const savedLang = localStorage.getItem('tiyuy-language');
      const validLangs: ('es' | 'en' | 'pt' | 'fr')[] = ['es', 'en', 'pt', 'fr'];
      
      if (savedLang && validLangs.includes(savedLang as any)) {
        setLanguage(savedLang as 'es' | 'en' | 'pt' | 'fr');
      } else {
        const backendLang = preferences.language || 'es';
        setLanguage(backendLang);
        localStorage.setItem('tiyuy-language', backendLang);
      }
      
      setTimezone(preferences.timezone || 'America/Lima');
      setCountry(preferences.country || 'Peru');
      setCity(preferences.city || 'Lima');
    }
  }, [preferences]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  const userRole = (user?.role || 'USER').toString().toUpperCase().trim();
  const canViewCRM = ['AGENT', 'DEVELOPER', 'ADMIN', 'INMOBILIARIA'].includes(userRole);
  const isDeveloper = userRole === 'DEVELOPER';
  const isAgent = userRole === 'AGENT';

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      uploadPhoto.mutate(file, {
        onSuccess: () => {
          setPreviewPhoto(null);
        },
        onError: () => {
          setPreviewPhoto(null);
        }
      });
    }
  };

  const themeClasses = theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const fontSizeClass = fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base';
  const mainContentStyle = { backgroundColor: crmBackground };

  const changePassword = useChangePassword();
  const updateEmail = useUpdateEmail();

  const handleUpdateEmail = () => {
    if (!email || email === user?.email) {
      toast.error('Ingresa un email diferente al actual');
      return;
    }
    if (!email.includes('@')) {
      toast.error('Ingresa un email valido');
      return;
    }
    updateEmail.mutate(email, {
      onSuccess: () => {
        setIsEditingEmail(false);
      }
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Completa todos los campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contrasenas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La contrasena debe tener al menos 6 caracteres');
      return;
    }
    changePassword.mutate({ currentPassword, newPassword }, {
      onSuccess: () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    });
  };

  const handleVerifyIdentity = () => {
    if (!documentNumber) {
      toast.error('Ingresa tu numero de documento');
      return;
    }
    verifyIdentity.mutate({ documentType, documentNumber });
  };

  const handleSavePreferences = () => {
    updatePreferences.mutate({
      theme, crmBackground, fontSize, language, timezone, country, city,
    });
  };

  const timezones = [
    { value: 'America/Lima', label: 'Lima (GMT-5)' },
    { value: 'America/Bogota', label: 'Bogota (GMT-5)' },
    { value: 'America/Mexico_City', label: 'Mexico City (GMT-6)' },
    { value: 'America/Santiago', label: 'Santiago (GMT-4/-3)' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1/+2)' },
    { value: 'America/New_York', label: 'New York (GMT-5/-4)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8/-7)' },
  ];

  const crmColors = [
    { name: 'Blanco', value: '#ffffff', class: 'bg-white' },
    { name: 'Gris Claro', value: '#f8fafc', class: 'bg-slate-50' },
    { name: 'Verde Menta', value: '#ecfdf5', class: 'bg-emerald-50' },
    { name: 'Azul Cielo', value: '#eff6ff', class: 'bg-blue-50' },
    { name: 'Calido', value: '#fff7ed', class: 'bg-orange-50' },
    { name: 'Personalizado', value: 'custom', class: 'bg-gradient-to-br from-teal-400 to-emerald-500' },
  ];

  return (
    <ProtectedRoute>
      <div className={`${themeClasses} ${fontSizeClass} min-h-full transition-colors duration-300`} style={mainContentStyle}>
        {isLoadingUser && (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Cargando...</span>
            </div>
          </div>
        )}
        
        {!isLoadingUser && (
          <div className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Profile Photo and Identity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><User className="w-5 h-5" /> Identidad</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    {previewPhoto ? (
                      <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
                        <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <UserAvatar size="xl" />
                    )}
                    {uploadPhoto.isPending && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadPhoto.isPending}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-teal-600 hover:bg-teal-50 transition-colors border border-gray-200 disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload}/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Foto de Perfil</h3>
                    <p className="text-sm text-gray-500 mb-3">JPG, PNG. Maximo 2MB.</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadPhoto.isPending}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {uploadPhoto.isPending ? 'Subiendo...' : 'Cambiar Foto'}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Verificacion
                    {user?.isVerified && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Verificado</span>
                    )}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                      <label className="block text-xs text-gray-500 mb-1">Numero de Documento</label>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded">DNI</span>
                        <span className="font-semibold text-gray-900">{user?.dni || 'No disponible'}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Tu DNI esta vinculado a tu cuenta</p>
                    </div>
                    
                    <p className="text-xs text-gray-500">La verificacion de identidad mejora la confianza en tu cuenta.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mi Inmobiliaria - SOLO para AGENT */}
            {isAgent && !isDeveloper && (
              <MyAgencySection />
            )}

            {/* Proyectos y Desarrollos - SOLO para DEVELOPER */}
            {isDeveloper && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><FolderGit className="w-5 h-5" /> Proyectos y Desarrollos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/my-projects" className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FolderGit className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Projects</h3>
                    <p className="text-sm text-gray-600">Active developments</p>
                  </div>
                  <span className="ml-auto text-green-600">→</span>
                </Link>

                <Link href="/dashboard/projects/new" className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <PlusCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">New Project</h3>
                    <p className="text-sm text-gray-600">Create development</p>
                  </div>
                  <span className="ml-auto text-purple-600">→</span>
                </Link>
              </div>
            </div>
            )}

            {/* Personalizacion Visual */}
            {canViewCRM && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Palette className="w-5 h-5" /> Personalizacion Visual</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Tema</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        theme === 'light' ? 'bg-teal-50 border-2 border-teal-500' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <Sun className="w-6 h-6 text-orange-500" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Claro</p>
                        <p className="text-xs text-gray-500">Interfaz clara y luminosa</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        theme === 'dark' ? 'bg-teal-50 border-2 border-teal-500' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <Moon className="w-6 h-6 text-indigo-500" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Oscuro</p>
                        <p className="text-xs text-gray-500">Interfaz oscura para reducir fatiga visual</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Color de Fondo CRM</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {crmColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setCrmBackground(color.value)}
                        className={`aspect-square rounded-xl ${color.class} border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                          crmBackground === color.value ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {crmBackground === color.value && <span className="text-teal-600 text-lg">✓</span>}
                        <span className="text-xs text-gray-600 text-center leading-tight">{color.name}</span>
                      </button>
                    ))}
                  </div>
                  <input
                    type="color"
                    value={crmBackground}
                    onChange={(e) => setCrmBackground(e.target.value)}
                    className="w-full mt-3 h-10 rounded-xl cursor-pointer"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Tamaño de Fuente</h3>
                  <div className="space-y-2">
                    {(['small', 'normal', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          fontSize === size ? 'bg-teal-50 border-2 border-teal-500' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <span className={`${size === 'small' ? 'text-sm' : size === 'normal' ? 'text-base' : 'text-lg'} font-bold text-gray-700`}>Aa</span>
                      <span className="font-medium text-gray-900 capitalize flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        {size === 'small' ? 'Pequeno' : size === 'normal' ? 'Normal' : 'Grande'}
                      </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Ajusta el tamaño del texto para mayor comodidad.</p>
                </div>
              </div>
            </div>
            )}

            {/* Localizacion */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Globe className="w-5 h-5" /> Ubicacion</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Zona Horaria</h3>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                  >
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">Se usara para mostrar fechas y horas correctamente.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Ubicacion</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Pais</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Ej: Peru"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Ciudad</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ej: Lima"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Tu ubicacion ayuda a personalizar la experiencia.</p>
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Lock className="w-5 h-5" /> Seguridad</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Datos de la Cuenta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Nombre</label>
                      <input type="text" value={user?.firstName || ''} readOnly className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600"/>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Apellido</label>
                      <input type="text" value={user?.lastName || ''} readOnly className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600"/>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Email</label>
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        readOnly={!isEditingEmail}
                        className={`flex-1 px-4 py-3 rounded-xl border outline-none transition-all ${
                          isEditingEmail 
                            ? 'border-teal-500 ring-2 ring-teal-200 bg-white' 
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                      />
                      {isEditingEmail ? (
                        <button
                          onClick={handleUpdateEmail}
                          disabled={updateEmail.isPending}
                          className="px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
                        >
                          {updateEmail.isPending ? '...' : 'Guardar'}
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsEditingEmail(true)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                          Cambiar
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">El email es tu identificador unico en Tiyuy.</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Rol</label>
                    <input type="text" value={user?.role || ''} readOnly className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 capitalize"/>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Cambiar Contrasena</h3>
                  
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Contrasena Actual</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Ingresa tu contrasena actual"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Nueva Contrasena</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimo 6 caracteres"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Confirmar Contrasena</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contrasena"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={changePassword.isPending}
                    className="w-full py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
                  >
                    {changePassword.isPending ? 'Cargando...' : <><Lock className="w-4 h-4 inline mr-1" /> Cambiar Contrasena</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
