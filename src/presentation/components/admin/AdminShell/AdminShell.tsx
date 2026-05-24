/**
 * Tiyuy Admin Shell Component
 * Sidebar colapsable con iconos, header con buscador y perfil
 * Diseño: dark navy sidebar + header blanco + contenido gris claro
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAdminProfile } from '@/presentation/hooks/useAdminProfile';
import { useAuthStore } from '@/presentation/store/authStore';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { Card } from '@/presentation/components/ui/Card';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader/AdminHeader';
import {
  LayoutDashboard,
  Users,
  Building,
  Package,
  UserCircle,
  Building2,
  Tag,
  Megaphone,
  MessageSquare,
  Bell,
  Layers,
  BarChart3,
  ShieldCheck,
  Activity,
  FileText,
  Menu,
  X,
  Search,
  ChevronDown,
  ChevronRight,
  DollarSign,
  ImageIcon,
  Gift,
  ChevronLeft,
} from 'lucide-react';

interface GitHubShellProps {
  children: ReactNode;
}

// ─── Tipos de navegación ────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// ─── Submenú de Campañas ─────────────────────────────────────────────────────
const CAMPAIGN_SUBITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin/campaigns', icon: LayoutDashboard },
  { label: 'Lista de Campañas', href: '/admin/campaigns/list', icon: Megaphone },
  { label: 'Banners', href: '/admin/campaigns/banners', icon: ImageIcon },
  { label: 'Campañas Festivas', href: '/admin/campaigns/festive', icon: Gift },
  { label: 'Precios', href: '/admin/campaigns/pricing', icon: DollarSign },
];

// ─── Configuración del menú ─────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'USUARIOS',
    items: [
      { label: 'Usuarios', href: '/admin/users', icon: Users },
    ],
  },
  {
    title: 'PROPIEDADES',
    items: [
      { label: 'Propiedades', href: '/admin/properties', icon: Building },
      { label: 'Proyectos', href: '/admin/projects', icon: Package },
    ],
  },
  {
    title: 'ACTORES',
    items: [
      { label: 'Agentes Independientes', href: '/admin/agents', icon: UserCircle },
      { label: 'Inmobiliarias', href: '/admin/agencies', icon: Building2 },
      { label: 'Grupos', href: '/admin/groups', icon: Users },
    ],
  },
  {
    title: 'MONETIZACION',
    items: [
      { label: 'Planes', href: '/admin/plans', icon: Layers },
      { label: 'Descuentos', href: '/admin/discounts', icon: Tag },
      { label: 'Campañas', href: '/admin/campaigns', icon: Megaphone },
      { label: 'Finanzas', href: '/admin/finance', icon: DollarSign },
    ],
  },
  {
    title: 'COMUNICACION',
    items: [
      { label: 'Comunicaciones', href: '/admin/communications', icon: MessageSquare },
      { label: 'Notificaciones', href: '/admin/notifications', icon: Bell },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { label: 'Administradores', href: '/admin/admins', icon: Users },
      { label: 'Auditoria', href: '/admin/audit', icon: ShieldCheck },
      { label: 'Actividad', href: '/admin/events', icon: Activity },
      { label: 'Reportes', href: '/admin/reports', icon: FileText },
    ],
  },
  {
    title: 'CUENTA',
    items: [
      { label: 'Mi perfil', href: '/admin/profile', icon: UserCircle },
    ],
  },
];

// ─── Sidebar Item ────────────────────────────────────────────────────────────

function SidebarItem({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150
        ${active
          ? 'bg-white/15 text-white font-medium'
          : 'text-gray-400 hover:text-white hover:bg-white/10'
        }
        ${collapsed ? 'justify-center px-2' : ''}
      `}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      {!collapsed && (
        <span className="truncate">{item.label}</span>
      )}
    </Link>
  );
}

// ─── Sidebar Item con Submenú Expandible ─────────────────────────────────────

function SidebarItemWithSubmenu({
  item,
  subitems,
  collapsed,
  pathname,
}: {
  item: NavItem;
  subitems: NavItem[];
  collapsed: boolean;
  pathname: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const Icon = item.icon;

  // Check if any subitem is active
  const isActive = subitems.some((si) => pathname.startsWith(si.href));

  if (collapsed) {
    // When collapsed, just show the parent icon
    return (
      <div>
        <div
          className={`flex items-center justify-center px-2 py-2 rounded-md text-sm transition-all duration-150 ${
            isActive
              ? 'bg-white/15 text-white font-medium'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          title={item.label}
        >
          <Icon className="w-[18px] h-[18px] shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Parent button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
          isActive
            ? 'bg-white/15 text-white font-medium'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
      >
        <Icon className="w-[18px] h-[18px] shrink-0" />
        <span className="flex-1 text-left truncate">{item.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            expanded ? 'rotate-0' : '-rotate-90'
          }`}
        />
      </button>

      {/* Subitems */}
      {expanded && (
        <div className="ml-2 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
          {subitems.map((subitem) => {
            const SubIcon = subitem.icon;
            const isSubActive = pathname.startsWith(subitem.href);
            return (
              <Link
                key={subitem.href}
                href={subitem.href}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-all duration-150 ${
                  isSubActive
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <SubIcon className="w-[15px] h-[15px] shrink-0" />
                <span className="truncate">{subitem.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar completo ────────────────────────────────────────────────────────

function Sidebar({
  collapsed,
  isSuperAdmin,
  isSupport,
}: {
  collapsed: boolean;
  isSuperAdmin: boolean;
  isSupport: boolean;
}) {
  const pathname = usePathname();

  // Filtra items según rol
  const filteredSections = NAV_SECTIONS.map((section) => {
    let items = section.items;

    // Monetizacion oculta para soporte
    if (section.title === 'MONETIZACION' && isSupport) {
      items = [];
    }

    // Sistema: admins y auditoria solo para super admin
    if (section.title === 'SISTEMA') {
      items = items.filter((item) => {
        if ((item.href === '/admin/admins' || item.href === '/admin/audit') && !isSuperAdmin) {
          return false;
        }
        return true;
      });
    }

    return { ...section, items };
  }).filter((s) => s.items.length > 0);

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
      {filteredSections.map((section, si) => (
        <div key={si} className={si > 0 ? 'pt-3' : ''}>
          {/* Label de sección */}
          {section.title && !collapsed && (
            <div className="px-3 pb-1">
              <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
                {section.title}
              </span>
            </div>
          )}
          {section.title && collapsed && (
            <div className="border-t border-white/10 my-2" />
          )}

          {/* Items */}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              // Check if this item has a submenu (Campañas)
              if (item.href === '/admin/campaigns') {
                return (
                  <SidebarItemWithSubmenu
                    key={item.href}
                    item={item}
                    subitems={CAMPAIGN_SUBITEMS}
                    collapsed={collapsed}
                    pathname={pathname}
                  />
                );
              }
              return (
                <SidebarItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  active={
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href)
                  }
                />
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

// ─── Shell Principal ─────────────────────────────────────────────────────────

export function GitHubShell({ children }: GitHubShellProps) {
  const { adminProfile, isLoading, error } = useAdminProfile();
  const { setAdminProfile } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  // Sincroniza auth store
  useEffect(() => {
    if (adminProfile) {
      setAdminProfile(
        adminProfile.role,
        adminProfile.departments,
        adminProfile.permissions,
        adminProfile.isActive,
      );
    }
  }, [adminProfile, setAdminProfile]);

  const isSuperAdmin = adminProfile?.role === 'SUPER_ADMIN';
  const isRegularAdmin = adminProfile?.role === 'ADMIN';
  const isSupport = adminProfile?.role === 'SUPPORT';

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 text-sm">Cargando perfil de administrador...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error de Perfil Admin</h2>
            <p className="text-gray-600 mb-4 text-sm">
              No se pudo cargar el perfil de administrador. Por favor recarga la pagina.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Recargar Pagina
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Sin perfil ──
  if (!adminProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
            <p className="text-gray-600 mb-4 text-sm">
              No tienes privilegios de administrador o tu cuenta no esta activa.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
            >
              Volver al Dashboard
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ── Layout principal ──
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header fijo */}
      <AdminHeader onToggleSidebar={() => setCollapsed((v) => !v)} />

      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        {/* Sidebar - full height, dark background */}
        <aside
          className={`
            h-full bg-[#1a2030] shrink-0 transition-all duration-200 ease-in-out overflow-y-auto
            ${collapsed ? 'w-[60px]' : 'w-[240px]'}
          `}
        >
          <Sidebar
            collapsed={collapsed}
            isSuperAdmin={isSuperAdmin}
            isSupport={isSupport}
          />
        </aside>

        {/* Contenido principal - scrollable */}
        <main className="flex-1 h-full overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}