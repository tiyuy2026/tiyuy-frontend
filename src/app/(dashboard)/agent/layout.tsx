'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/presentation/store/authStore';
import {
  Flame, Home, MessageSquare, Users, Building,
  Megaphone, Diamond, User, ChevronDown, LogOut, PanelLeftClose, PanelLeft
} from 'lucide-react';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userRole = (user?.role || '').toString().toUpperCase();
  const isAgent = ['AGENT', 'DEVELOPER', 'ADMIN', 'INMOBILIARIA'].includes(userRole);

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  const NavItem = ({ href, icon, label, show = true }: { href: string; icon: React.ReactNode; label: string; show?: boolean }) => {
    if (!show) return null;
    return (
      <Link
        href={href}
        className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
          isActive(href)
            ? 'bg-teal-50 text-teal-700 font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
        title={collapsed ? label : undefined}
      >
        <span className="flex-shrink-0">{icon}</span>
        <span className={`transition-all duration-200 overflow-hidden ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
          {label}
        </span>
        {isActive(href) && !collapsed && (
          <span className="ml-auto w-2 h-2 bg-teal-500 rounded-full flex-shrink-0"></span>
        )}
        {collapsed && (
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
            {label}
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 min-h-screen flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Header */}
        <div className="px-3 pt-2 pb-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-300 w-full"
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? <PanelLeft className="w-5 h-5 flex-shrink-0" /> : <PanelLeftClose className="w-5 h-5 flex-shrink-0" />}
            <span className={`text-sm font-medium transition-all duration-200 overflow-hidden ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              Menú
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {/* CRM Leads - solo AGENT */}
          <NavItem
            href="/dashboard/crm-leads"
            icon={<Flame className="w-5 h-5 flex-shrink-0" />}
            label="CRM Leads"
            show={userRole === 'AGENT'}
          />

          <NavItem
            href="/my-properties"
            icon={<Home className="w-5 h-5 flex-shrink-0" />}
            label="Mis Propiedades"
          />

          <NavItem
            href="/dashboard/clients"
            icon={<Users className="w-5 h-5 flex-shrink-0" />}
            label="Clientes"
            show={userRole === 'AGENT'}
          />

          {/* Marketing */}
          <NavItem
            href="/agent/marketing"
            icon={<Megaphone className="w-5 h-5 flex-shrink-0" />}
            label="Marketing"
            show={userRole === 'AGENT'}
          />

          <NavItem
            href="/plans"
            icon={<Diamond className="w-5 h-5 flex-shrink-0" />}
            label="Planes"
          />

          <div className="mt-6 pt-6 border-t border-gray-200">
            {!collapsed && (
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Configuración</p>
            )}
            <NavItem
              href="/dashboard"
              icon={<User className="w-5 h-5 flex-shrink-0" />}
              label="Mi Perfil"
            />
          </div>
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-gray-200" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all"
            title={collapsed ? user?.email || 'Usuario' : undefined}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className={`flex-1 text-left min-w-0 transition-all duration-200 overflow-hidden ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              <p className="text-sm font-medium text-gray-900 truncate">{user?.email || 'Usuario'}</p>
              <p className="text-xs text-gray-400 truncate">{userRole}</p>
            </div>
            {!collapsed && (
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            )}
          </button>
          {isDropdownOpen && (
            <div className="absolute bottom-16 left-3 right-3 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <button
                onClick={() => { logout(); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
