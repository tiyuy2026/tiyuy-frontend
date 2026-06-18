'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/presentation/store/authStore';
import Link from 'next/link';
import { UserAvatar } from '@/presentation/components/shared/UserAvatar';
import { Building, ChevronDown, Home, LogOut, MessageCircle, User, Users } from 'lucide-react';

export function ProfileMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors shadow-sm"
      >
        <UserAvatar size="md" />
        <div className="text-left">
          <div className="font-medium text-gray-900">
            {user?.firstName || 'Usuario'}
          </div>
          <div className="text-sm text-gray-500">
            {user?.role === 'USER' && 'Usuario'}
            {user?.role === 'AGENT' && 'Agente'}
            {user?.role === 'DEVELOPER' && 'Desarrollador'}
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'SUPPORT') && 'Administrador'}
          </div>
        </div>
        <ChevronDown className="" />
      </button>

      {/* Dropdown del perfil */}
      {showMenu && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-56">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {user?.email}
            </div>
          </div>

          <Link
            href="/dashboard/profile"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setShowMenu(false)}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Mi Perfil
            </div>
          </Link>
          
          {user?.role === 'DEVELOPER' ? (
            <Link
              href="/my-projects"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Mis Proyectos
              </div>
            </Link>
          ) : (
            <Link
              href="/my-properties"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Mis Propiedades
              </div>
            </Link>
          )}

          <Link
            href="/messages"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setShowMenu(false)}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Mensajes
            </div>
          </Link>

          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'SUPPORT') && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Administración
              </div>
            </Link>
          )}
          
          <hr className="my-2 border-gray-200" />
          
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
