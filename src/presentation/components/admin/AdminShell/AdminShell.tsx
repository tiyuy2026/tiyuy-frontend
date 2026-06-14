/**
 * Tiyuy Admin Shell Component
 * Sidebar colapsable con iconos, header con buscador y perfil
 * Diseño: dark navy sidebar + header blanco + contenido gris claro
 */

'use client';

import { ReactNode, useEffect, useState, useMemo } from 'react';
import { useAdminProfile } from '@/presentation/hooks/useAdminProfile';
import { useAuthStore } from '@/presentation/store/authStore';
import { usePermissions } from '@/presentation/hooks/usePermissions';
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

// ─── Configuración del menú con permisos requeridos ─────────────────────────

interface NavItemWithPermission extends NavItem {
  requiredPermission?: string;
}

interface NavSectionWithPermission {
  title: string;
  items: NavItemWithPermission[];
}

const NAV_SECTIONS: NavSectionWithPermission[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'USUARIOS',
    items: [
      { label: 'Usuarios', href: '/admin/users', icon: Users, requiredPermission: 'USERS_VIEW' },
    ],
  },
  {
    title: 'PROPIEDADES',
    items: [
      { label: 'Propiedades', href: '/admin/properties', icon: Building, requiredPermission: 'PROPERTIES_VIEW' },
      { label: 'Proyectos', href: '/admin/projects', icon: Package, requiredPermission: 'PROJECTS_VIEW' },
    ],
  },
  {
    title: 'ACTORES',
    items: [
      { label: 'Agentes Independientes', href: '/admin/agents', icon: UserCircle, requiredPermission: 'USERS_VIEW' },
      { label: 'Inmobiliarias', href: '/admin/agencies', icon: Building2, requiredPermission: 'AGENCIES_VIEW' },
      { label: 'Grupos', href: '/admin/groups', icon: Users, requiredPermission: 'GROUPS_VIEW' },
    ],
  },
  {
    title: 'MONETIZACION',
    items: [
      { label: 'Planes', href: '/admin/plans', icon: Layers, requiredPermission: 'FINANCE_VIEW' },
      { label: 'Descuentos', href: '/admin/discounts', icon: Tag, requiredPermission: 'DISCOUNTS_CREATE' },
      { label: 'Campanas', href: '/admin/campaigns', icon: Megaphone, requiredPermission: 'COMMUNICATIONS_MANAGE' },
      { label: 'Finanzas', href: '/admin/finance', icon: DollarSign, requiredPermission: 'FINANCE_VIEW' },
    ],
  },
  {
    title: 'COMUNICACION',
    items: [
      { label: 'Comunicaciones', href: '/admin/communications', icon: MessageSquare, requiredPermission: 'COMMUNICATIONS_VIEW' },
      { label: 'Notificaciones', href: '/admin/notifications', icon: Bell, requiredPermission: 'NOTIFICATIONS_SEND' },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      { label: 'Administradores', href: '/admin/admins', icon: Users, requiredPermission: 'ADMINS_VIEW' },
      { label: 'Actividad', href: '/admin/activities', icon: Activity, requiredPermission: 'AUDIT_LOGS_VIEW' },
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

// ─── Sidebar completo ────────────────────────────────────────────────────────

function Sidebar({
  collapsed,
}: {
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const { hasPermission, isSuperAdmin, isSupport } = usePermissions();

  // Filtra items según permisos dinámicos
  // Ahora se basa en los permisos reales del usuario, no en su roleType
  // Esto permite que un SUPPORT con departamentos asignados vea esas secciones
  const filteredSections = useMemo(() => {
    return NAV_SECTIONS.map((section) => {
      const items = section.items.filter((item) => {
        // Items sin permiso requerido siempre se muestran (Dashboard, Mi perfil)
        if (!item.requiredPermission) return true;
        // SuperAdmin ve todo
        if (isSuperAdmin) return true;
        // Verificar permiso específico - esto funciona para cualquier roleType
        // (SUPER_ADMIN, ADMIN, SUPPORT) siempre que tenga el permiso asignado
        return hasPermission(item.requiredPermission);
      });
      return { ...section, items };
    }).filter((s) => s.items.length > 0);
  }, [isSuperAdmin, hasPermission]);


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
            {section.items.map((item) => (
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
            ))}
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

  // Sincroniza auth store con los permisos actualizados del backend
  // Usamos adminProfile.permissions que incluye TODOS los permisos
  // (departamentos + adicionales) según AdminUser.getAllPermissions()
  useEffect(() => {
    if (adminProfile) {
      setAdminProfile(
        adminProfile.roleType,
        adminProfile.departments,
        adminProfile.permissions || adminProfile.additionalPermissions || [],
        adminProfile.active,
      );
    }
  }, [adminProfile, setAdminProfile]);


  const isSuperAdmin = adminProfile?.roleType === 'SUPER_ADMIN';
  const isRegularAdmin = adminProfile?.roleType === 'ADMIN';
  const isSupport = adminProfile?.roleType === 'SUPPORT';

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
          <Sidebar collapsed={collapsed} />
        </aside>

        {/* Contenido principal - scrollable */}
        <main className="flex-1 h-full overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
