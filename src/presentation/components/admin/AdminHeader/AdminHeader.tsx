/**
 * Admin Header Component
 * GitHub-style header for admin module
 */

'use client';

import { useState, useEffect } from 'react';
import { useAdminProfile } from '@/presentation/hooks/useAdminProfile';
import { useAuthStore } from '@/presentation/store/authStore';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Button } from '@/presentation/components/ui/Button';
import { UserAvatar } from '@/presentation/components/shared/UserAvatar';
import { Bell, Building2, Camera, ChevronDown, HelpCircle, LogOut, Megaphone, Menu, Plus, PlusCircle, Search, Settings, Tag, User } from 'lucide-react';;
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const { adminProfile } = useAdminProfile();
  const { logout, user } = useAuthStore();
  const { isSuperAdmin, isRegularAdmin, isSupport } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu || showCreateMenu) {
        setShowProfileMenu(false);
        setShowCreateMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu, showCreateMenu]);

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.photoUrl) {
      router.push('/admin/profile');
    } else {
      setShowProfileMenu(!showProfileMenu);
      setShowCreateMenu(false);
    }
  };

  const handleCreateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCreateMenu(!showCreateMenu);
    setShowProfileMenu(false);
  };

  const handleCreateAction = (action: string) => {
    setShowCreateMenu(false);
    switch (action) {
      case 'user':
        router.push('/admin/users?action=create');
        break;
      case 'property':
        router.push('/admin/properties?action=create');
        break;
      case 'campaign':
        router.push('/admin/campaigns?action=create');
        break;
      case 'discount':
        router.push('/admin/discounts?action=create');
        break;
      case 'admin':
        if (isSuperAdmin) {
          router.push('/admin/admins?action=create');
        }
        break;
      default:
        break;
    }
  };

  const hasProfilePhoto = user?.photoUrl;
  const profileUser = {
    photoUrl: user?.photoUrl,
    firstName: adminProfile?.firstName || user?.firstName,
    lastName: adminProfile?.lastName || user?.lastName
  };

  return (
    <header className="px-4 py-2 flex items-center justify-between sticky top-0 z-50 border-b shadow-lg" style={{ backgroundColor: '#1693a5', borderColor: '#7cb490', color: 'white' }}>
      {/* Left side - Hamburger, Logo and Search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Hamburger Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-white/20 transition"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Tiyuy Logo */}
        <Link href="/admin" className="flex items-center hover:opacity-80 transition">
          <img 
            src="/assets/images/logo.png" 
            alt="Tiyuy Logo" 
            className="w-10 h-10 rounded-lg object-contain scale-150"
          />
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar o saltar a..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 bg-white border border-gray-300 text-gray-900"
              onKeyDown={(e) => {
                if (e.key === '/' && e.currentTarget !== document.activeElement) {
                  e.preventDefault();
                  e.currentTarget.focus();
                }
              }}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs rounded bg-gray-200 text-gray-500">/</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Actions and Profile */}
      <div className="flex items-center gap-3">
        {/* Create Button with Dropdown */}
        <div className="relative">
          <Button 
            size="sm" 
            className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
            onClick={handleCreateClick}
          >
            <PlusCircle className="w-4 h-4" />
            Create
            <ChevronDown className="w-3 h-3" />
          </Button>
          
          {showCreateMenu && (
            <div className="absolute right-0 top-full mt-1 w-64 rounded-lg shadow-xl z-50" style={{ backgroundColor: '#1693a5', borderColor: '#7cb490' }}>
              <div className="py-1">
                <button
                  onClick={() => handleCreateAction('user')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-3 transition-colors duration-200"
                  style={{ color: 'white' }}
                >
                  <User className="w-4 h-4" />
                  Nuevo usuario
                </button>
                <button
                  onClick={() => handleCreateAction('property')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-3 transition-colors duration-200"
                  style={{ color: 'white' }}
                >
                  <Building2 className="w-4 h-4" />
                  Nueva propiedad
                </button>
                <button
                  onClick={() => handleCreateAction('campaign')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-3 transition-colors duration-200"
                  style={{ color: 'white' }}
                >
                  <Megaphone className="w-4 h-4" />
                  Nueva campania
                </button>
                <button
                  onClick={() => handleCreateAction('discount')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-3 transition-colors duration-200"
                  style={{ color: 'white' }}
                >
                  <Tag className="w-4 h-4" />
                  Nuevo descuento
                </button>
                {isSuperAdmin && (
                  <button
                    onClick={() => handleCreateAction('admin')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-3 pt-2 transition-colors duration-200"
                    style={{ color: 'white', borderTop: `1px solid #7cb490` }}
                  >
                    <Settings className="w-4 h-4" />
                    Nuevo admin
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <Link href="/admin/notifications" className="relative p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition">
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {notifications}
            </span>
          )}
        </Link>

        {/* Help - Configuración */}
        <Link href="/admin/settings" className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition">
          <HelpCircle className="w-5 h-5" />
        </Link>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/20">
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {adminProfile?.firstName} {adminProfile?.lastName}
            </p>
            <p className="text-xs text-teal-100">{adminProfile?.email}</p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isSuperAdmin ? 'bg-purple-600 text-white' :
            isRegularAdmin ? 'bg-blue-600 text-white' :
            'bg-gray-600 text-white'
          }`}>
            {adminProfile?.role?.replace('_', ' ')}
          </div>
          
          {/* Avatar */}
          <div className="relative">
            <button
              onClick={handleProfileClick}
              className="relative group"
              title={hasProfilePhoto ? "Ver perfil" : "Agregar foto de perfil (click aqui)"}
            >
              <UserAvatar user={profileUser} size="sm" />
              {!hasProfilePhoto && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Camera className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
            
            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 rounded-lg shadow-xl border border-gray-700 z-50">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={profileUser} size="md" />
                    <div>
                      <p className="font-medium text-white">
                        {adminProfile?.firstName} {adminProfile?.lastName}
                      </p>
                      <p className="text-sm text-gray-400">{adminProfile?.email}</p>
                      <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium inline-block ${
                        isSuperAdmin ? 'bg-purple-600 text-white' :
                        isRegularAdmin ? 'bg-blue-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {adminProfile?.role?.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <Link
                    href="/admin/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition"
                  >
                    <User className="w-4 h-4" />
                    Ver perfil
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition"
                  >
                    <Settings className="w-4 h-4" />
                    Configuración
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/50 hover:text-red-300 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
