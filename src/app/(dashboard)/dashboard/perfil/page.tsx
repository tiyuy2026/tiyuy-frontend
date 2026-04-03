'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { useAuthStore } from '@/presentation/store/authStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from '@/presentation/store/toastStore';
import { axiosClient } from '@/infrastructure/api/axios-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sun, Moon, Type, Globe, Lock, User, Camera, CheckCircle, Palette, MessageSquare, Users, Diamond, LayoutDashboard, Home, Flame, ChevronDown, LogOut, Building } from 'lucide-react';

// Sidebar Navigation Component
function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  
  // Determinar si el usuario puede ver opciones de agente/inmobiliaria
  const userRole = (user?.role || '').toString().toUpperCase();
  const isAgent = userRole === 'AGENT' || userRole === 'DEVELOPER' || userRole === 'ADMIN' || userRole === 'INMOBILIARIA';
  const isDeveloper = userRole === 'DEVELOPER';
  
  // Menú para agentes (sin Dashboard porque estamos en perfil)
  const fullMenuItems = [
    { href: '/dashboard/crm-leads', icon: Flame, label: 'CRM Leads' },
    { href: '/dashboard/mis-propiedades', icon: Home, label: 'Mis Propiedades' },
    { href: '/dashboard/mensajes', icon: MessageSquare, label: 'Mensajes' },
    { href: '/dashboard/clientes', icon: Users, label: 'Clientes' },
    { href: '/dashboard/planes', icon: Diamond, label: 'Planes' },
    { href: '/dashboard/perfil', icon: User, label: 'Perfil' },
  ];

  // Menú para DEVELOPER (con Dashboard)
  const developerMenuItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/crm-leads', icon: Flame, label: 'CRM Leads' },
    { href: '/dashboard/mis-propiedades', icon: Home, label: 'Mis Propiedades' },
    { href: '/dashboard/mensajes', icon: MessageSquare, label: 'Mensajes' },
    { href: '/dashboard/clientes', icon: Users, label: 'Clientes' },
    { href: '/dashboard/planes', icon: Diamond, label: 'Planes' },
    { href: '/dashboard/perfil', icon: User, label: 'Perfil' },
  ];
  
  // Menú reducido para usuarios comunes (sin CRM, sin Dashboard)
  const userMenuItems = [
    { href: '/dashboard/mis-propiedades', icon: Home, label: 'Mis Propiedades' },
    { href: '/dashboard/favoritos', icon: Diamond, label: 'Favoritos' },
    { href: '/dashboard/mensajes', icon: MessageSquare, label: 'Mensajes' },
    { href: '/dashboard/planes', icon: Diamond, label: 'Planes' },
    { href: '/dashboard/perfil', icon: User, label: 'Perfil' },
  ];
  
  let menuItems;
  if (isDeveloper) {
    menuItems = developerMenuItems;
  } else if (isAgent) {
    menuItems = fullMenuItems;
  } else {
    menuItems = userMenuItems;
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            T
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">TIYUY</h1>
            <p className="text-xs text-gray-500">CRM Inmobiliario</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-teal-50 text-teal-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && <span className="ml-auto w-2 h-2 bg-teal-500 rounded-full"></span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

// Hooks para API
function useCurrentUser() {
  const { user: authUser, setUser } = useAuthStore();
  
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await axiosClient.get('/auth/me');
      const userData = response.data;
      // Actualizar el authStore con los datos frescos
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
      toast.success('Preferencias guardadas exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al guardar preferencias';
      toast.error(message);
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
      // Actualizar el authStore con la nueva URL de foto
      if (user && data?.avatar) {
        setUser({ ...user, photoUrl: data.avatar });
      }
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Foto de perfil actualizada');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al subir foto';
      toast.error(message);
    },
  });
}

function useVerifyIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { documentType: 'DNI' | 'RUC'; documentNumber: string }) => {
      // Usar el endpoint correcto del backend para verificación KYC
      const endpoint = data.documentType === 'DNI' 
        ? '/identity/complete-kyc'  // Para DNI
        : '/identity/upgrade-to-developer';  // Para RUC (empresas)
      
      const payload = data.documentType === 'DNI' 
        ? { dni: data.documentNumber }
        : { ruc: data.documentNumber };
      
      const response = await axiosClient.post(endpoint, payload);
      return response.data;
    },
    onSuccess: () => {
      // Refrescar datos del usuario para obtener estado de verificación actualizado
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Identidad verificada exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error en la verificación de identidad';
      toast.error(message);
    },
  });
}

function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await axiosClient.post('/auth/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Contraseña actualizada exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al cambiar la contraseña';
      toast.error(message);
    },
  });
}

export default function ProfilePage() {
  const { user: authUser } = useAuthStore();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdatePreferences();
  const uploadPhoto = useUploadProfilePhoto();
  const verifyIdentity = useVerifyIdentity();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Usar el usuario actualizado del backend si está disponible
  const user = currentUser || authUser;

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [crmBackground, setCrmBackground] = useState('#ffffff');
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal');
  const [language, setLanguage] = useState<'es' | 'en' | 'pt'>('es');
  const [timezone, setTimezone] = useState('America/Lima');
  const [country, setCountry] = useState('Perú');
  const [city, setCity] = useState('Lima');
  const [documentType, setDocumentType] = useState<'DNI' | 'RUC'>('DNI');
  const [documentNumber, setDocumentNumber] = useState('');

  useEffect(() => {
    if (preferences) {
      setTheme(preferences.theme || 'light');
      setCrmBackground(preferences.crmBackground || '#ffffff');
      setFontSize(preferences.fontSize || 'normal');
      setLanguage(preferences.language || 'es');
      setTimezone(preferences.timezone || 'America/Lima');
      setCountry(preferences.country || 'Perú');
      setCity(preferences.city || 'Lima');
    }
  }, [preferences]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Verificar si el usuario puede ver el CRM (solo AGENT, DEVELOPER/INMOBILIARIA o ADMIN)
  const userRole = (user?.role || 'USER').toString().toUpperCase().trim();
  const canViewCRM = ['AGENT', 'DEVELOPER', 'ADMIN', 'INMOBILIARIA'].includes(userRole);
  
  // Debug: ver qué rol está llegando
  console.log('DEBUG - User role raw:', user?.role, '| normalized:', userRole, '| canViewCRM:', canViewCRM);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPhoto.mutate(file);
  };

  const changePassword = useChangePassword();

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Completa todos los campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
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
      toast.error('Ingresa tu número de documento');
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
    { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
    { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
    { value: 'America/Santiago', label: 'Santiago (GMT-4/-3)' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1/+2)' },
    { value: 'America/New_York', label: 'Nueva York (GMT-5/-4)' },
    { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8/-7)' },
  ];

  const crmColors = [
    { name: 'Blanco', value: '#ffffff', class: 'bg-white' },
    { name: 'Gris Claro', value: '#f8fafc', class: 'bg-slate-50' },
    { name: 'Verde Menta', value: '#ecfdf5', class: 'bg-emerald-50' },
    { name: 'Azul Cielo', value: '#eff6ff', class: 'bg-blue-50' },
    { name: 'Cálido', value: '#fff7ed', class: 'bg-orange-50' },
    { name: 'Personalizado', value: 'custom', class: 'bg-gradient-to-br from-teal-400 to-emerald-500' },
  ];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar user={user} />
        
        <main className="flex-1 overflow-auto">
          {/* Loading State */}
          {isLoadingUser && (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Cargando perfil...</span>
              </div>
            </div>
          )}
          
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
                  <p className="text-gray-500 text-sm mt-1">Gestiona tu cuenta y personaliza tu experiencia</p>
                </div>
                <button
                  onClick={handleSavePreferences}
                  disabled={updatePreferences.isPending}
                  className="px-6 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {updatePreferences.isPending ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
              </div>
            </div>
          </header>

          <div className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Foto de Perfil e Identidad */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><User className="w-5 h-5" /> Perfil e Identidad</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Foto de Perfil */}
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                      {user?.photoUrl ? (
                        <img src={user.photoUrl} alt="Perfil" className="w-full h-full object-cover"/>
                      ) : ((user?.firstName || 'U').charAt(0).toUpperCase())}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadPhoto.isPending}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-teal-600 hover:bg-teal-50 transition-colors border border-gray-200"
                    >📷</button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload}/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Foto de Perfil</h3>
                    <p className="text-sm text-gray-500 mb-3">Sube una foto para personalizar tu cuenta</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >Cambiar foto</button>
                  </div>
                </div>

                {/* Verificación de Identidad */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Verificación de Identidad
                    {user?.isVerified && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Verificado</span>
                    )}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDocumentType('DNI')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          documentType === 'DNI' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >DNI</button>
                      <button
                        onClick={() => setDocumentType('RUC')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          documentType === 'RUC' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >RUC</button>
                    </div>
                    
                    <input
                      type="text"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder={`Número de ${documentType}`}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                    />
                    
                    <button
                      onClick={handleVerifyIdentity}
                      disabled={verifyIdentity.isPending || !documentNumber}
                      className="w-full py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
                    >{verifyIdentity.isPending ? 'Verificando...' : 'Verificar Identidad'}</button>
                    
                    <p className="text-xs text-gray-500">La verificación aumenta la confianza en tus publicaciones</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personalización Visual - SOLO para AGENT/DEVELOPER/ADMIN */}
            {canViewCRM && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Palette className="w-5 h-5" /> Personalización Visual</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Tema */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Modo de Visualización</h3>
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
                        <p className="text-xs text-gray-500">Mejor para el día</p>
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
                        <p className="text-xs text-gray-500">Reduce fatiga visual</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Color de Fondo CRM */}
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

                {/* Tamaño de Fuente */}
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
                        {size === 'small' ? 'Pequeño' : size === 'normal' ? 'Normal' : 'Grande'}
                      </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Mejora la accesibilidad según tus necesidades</p>
                </div>
              </div>
            </div>
            )}

            {/* Localización e Idioma */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Globe className="w-5 h-5" /> Localización e Idioma</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Idioma */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Idioma</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'es', label: 'Español', flag: 'ES' },
                      { code: 'en', label: 'English', flag: 'EN' },
                      { code: 'pt', label: 'Português', flag: 'PT' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code as 'es' | 'en' | 'pt')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                          language === lang.code ? 'bg-teal-50 border-2 border-teal-500' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-lg font-bold text-gray-600">{lang.flag}</span>
                        <span className="text-sm font-medium text-gray-900">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zona Horaria */}
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
                  <p className="text-xs text-gray-500 mt-2">Importante para notificaciones de citas y publicaciones</p>
                </div>

                {/* País y Ciudad */}
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-4">Ubicación Preferida</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">País de Residencia</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Ej: Perú"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Ciudad Preferida</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ej: Lima"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Usamos esta información para mostrarte propiedades relevantes primero</p>
                </div>
              </div>
            </div>

            {/* Información de la Cuenta y Cambio de Contraseña */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Lock className="w-5 h-5" /> Información de la Cuenta y Seguridad</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Información de la Cuenta */}
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
                    <label className="text-sm text-gray-600 mb-1 block">Correo Electrónico</label>
                    <input type="email" value={user?.email || ''} readOnly className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600"/>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Rol</label>
                    <input type="text" value={user?.role || ''} readOnly className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 capitalize"/>
                  </div>
                </div>

                {/* Cambio de Contraseña */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Cambiar Contraseña</h3>
                  
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Contraseña Actual</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña actual"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Nueva Contraseña</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={changePassword.isPending}
                    className="w-full py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
                  >
                    {changePassword.isPending ? 'Actualizando...' : <><Lock className="w-4 h-4 inline mr-1" /> Cambiar Contraseña</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
