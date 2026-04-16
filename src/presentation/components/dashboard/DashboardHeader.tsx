'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/presentation/store/authStore';
import { UserAvatar } from '@/presentation/components/shared/UserAvatar';
import {
  Search,
  User,
  Settings,
  Building,
  MessageSquare,
  LogOut,
  ChevronDown,
  FolderGit,
  Bell,
} from 'lucide-react';

export function DashboardHeader() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Redirigir a la página de búsqueda con el query
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setShowSearchResults(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as any);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  // Sugerencias de búsqueda
  const searchSuggestions = [
    { type: 'propiedades', label: 'Buscar propiedades', icon: Building, action: () => router.push('/search?type=properties') },
    { type: 'agentes', label: 'Buscar agentes', icon: User, action: () => router.push('/search?type=agents') },
    { type: 'usuarios', label: 'Buscar usuarios', icon: User, action: () => router.push('/search?type=users') },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-16 max-w-[1600px] mx-auto">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center flex-shrink-0">
            <span className="text-teal-600 font-bold text-xl">tiyuy</span>
            <span className="text-gray-900 font-bold text-xl">.com</span>
          </Link>

          {/* Buscador */}
          <div className="flex-1 max-w-2xl mx-8" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios, propiedades, agentes"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.length > 0);
                }}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-teal-500 transition-all"
              />

              {/* Dropdown de sugerencias */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {searchQuery && (
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Presiona Enter para buscar</p>
                      <p className="text-sm font-medium text-gray-900">&quot;{searchQuery}&quot;</p>
                    </div>
                  )}
                  <div className="py-1">
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.type}
                        type="button"
                        onClick={() => {
                          suggestion.action();
                          setShowSearchResults(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <suggestion.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{suggestion.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right side - Notifications y Perfil */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-teal-700 transition-colors"
              >
                <UserAvatar size="sm" />
                <span className="hidden sm:inline">{user?.firstName || 'Mi cuenta'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>

                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">Ver perfil</span>
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Configuración</span>
                  </Link>

                  {user?.role === 'DEVELOPER' ? (
                    <Link
                      href="/my-projects"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FolderGit className="w-4 h-4" />
                      <span className="text-sm">Mis Proyectos</span>
                    </Link>
                  ) : (
                    <Link
                      href="/my-properties"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Building className="w-4 h-4" />
                      <span className="text-sm">Mis Propiedades</span>
                    </Link>
                  )}

                  <Link
                    href="/dashboard/my-contacts"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">Mensajes</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
