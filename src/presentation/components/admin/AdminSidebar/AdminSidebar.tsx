/**
 * Admin Sidebar Navigation Component
 * Organized by departments with permission-based visibility
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Permission, DepartmentType } from '@/core/domain/entities/Admin';

// Icon components using SVG
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ReportsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const AuditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const AdminIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const PropertyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ProjectIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const AgencyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
  </svg>
);

const FinanceIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DiscountIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const CampaignIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);

const SubscriptionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CommunicationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const NotificationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const GroupsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  requiredPermissions: Permission[];
  department: DepartmentType;
  badge?: number;
}

interface NavSection {
  title: string;
  department: DepartmentType;
  items: NavItem[];
}

// Navigation configuration aligned with backend departments and permissions
const navigationSections: NavSection[] = [
  {
    title: 'Analytics',
    department: 'ANALYTICS',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/admin',
        icon: <DashboardIcon />,
        requiredPermissions: ['ANALYTICS_DASHBOARD'],
        department: 'ANALYTICS',
      },
      {
        id: 'reports',
        label: 'Reports',
        path: '/admin/reports',
        icon: <ReportsIcon />,
        requiredPermissions: ['ANALYTICS_VIEW'],
        department: 'ANALYTICS',
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        path: '/admin/audit-logs',
        icon: <AuditIcon />,
        requiredPermissions: ['AUDIT_LOGS_VIEW'],
        department: 'ANALYTICS',
      },
    ],
  },
  {
    title: 'User Management',
    department: 'USER_MANAGEMENT',
    items: [
      {
        id: 'users',
        label: 'Users',
        path: '/admin/users',
        icon: <UsersIcon />,
        requiredPermissions: ['USERS_VIEW'],
        department: 'USER_MANAGEMENT',
      },
      {
        id: 'admins',
        label: 'Admin Users',
        path: '/admin/admins',
        icon: <AdminIcon />,
        requiredPermissions: ['ADMINS_VIEW'],
        department: 'USER_MANAGEMENT',
      },
    ],
  },
  {
    title: 'Property Management',
    department: 'PROPERTY_MANAGEMENT',
    items: [
      {
        id: 'properties',
        label: 'Properties',
        path: '/admin/properties',
        icon: <PropertyIcon />,
        requiredPermissions: ['PROPERTIES_VIEW'],
        department: 'PROPERTY_MANAGEMENT',
      },
      {
        id: 'projects',
        label: 'Projects',
        path: '/admin/projects',
        icon: <ProjectIcon />,
        requiredPermissions: ['PROJECTS_VIEW'],
        department: 'PROPERTY_MANAGEMENT',
      },
      {
        id: 'agencies',
        label: 'Real Estate Agencies',
        path: '/admin/agencies',
        icon: <AgencyIcon />,
        requiredPermissions: ['AGENCIES_VIEW'],
        department: 'PROPERTY_MANAGEMENT',
      },
    ],
  },
  {
    title: 'Finance',
    department: 'FINANCE',
    items: [
      {
        id: 'finance',
        label: 'Finance Overview',
        path: '/admin/finance',
        icon: <FinanceIcon />,
        requiredPermissions: ['FINANCE_VIEW'],
        department: 'FINANCE',
      },
      {
        id: 'discounts',
        label: 'Discount Codes',
        path: '/admin/discounts',
        icon: <DiscountIcon />,
        requiredPermissions: ['DISCOUNTS_MANAGE'],
        department: 'FINANCE',
      },
      {
        id: 'campaigns',
        label: 'Campaigns',
        path: '/admin/campaigns',
        icon: <CampaignIcon />,
        requiredPermissions: ['DISCOUNTS_CREATE'],
        department: 'FINANCE',
      },
      {
        id: 'subscriptions',
        label: 'Subscriptions',
        path: '/admin/subscriptions',
        icon: <SubscriptionIcon />,
        requiredPermissions: ['FINANCE_MANAGE_SUBSCRIPTIONS'],
        department: 'FINANCE',
      },
    ],
  },
  {
    title: 'Communications',
    department: 'COMMUNICATIONS',
    items: [
      {
        id: 'communications',
        label: 'Communications',
        path: '/admin/communications',
        icon: <CommunicationIcon />,
        requiredPermissions: ['COMMUNICATIONS_VIEW'],
        department: 'COMMUNICATIONS',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        path: '/admin/notifications',
        icon: <NotificationIcon />,
        requiredPermissions: ['NOTIFICATIONS_SEND'],
        department: 'COMMUNICATIONS',
      },
      {
        id: 'groups',
        label: 'User Groups',
        path: '/admin/groups',
        icon: <GroupsIcon />,
        requiredPermissions: ['GROUPS_VIEW'],
        department: 'COMMUNICATIONS',
      },
    ],
  },
];

interface AdminSidebarProps {
  userPermissions?: Permission[];
  userDepartments?: DepartmentType[];
  pendingReportsCount?: number;
}

export function AdminSidebar({
  userPermissions = [],
  userDepartments = [],
  pendingReportsCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();

  // Filter navigation based on user permissions and departments
  // If no permissions provided, show all items (fallback for superadmin)
  const filteredSections = navigationSections
    .filter(section => 
      // Show section if user belongs to the department OR has any permission in that section
      userDepartments.length === 0 || // Show all if no departments
      userDepartments.includes(section.department) ||
      section.items.some(item => userPermissions.includes(item.requiredPermissions[0]))
    )
    .map((section) => ({
      ...section,
      items: section.items
        .filter(item => 
          // Show item if user has the required permission OR no permissions provided
          userPermissions.length === 0 || // Show all if no permissions
          userPermissions.includes(item.requiredPermissions[0])
        )
        .map((item) => ({
          ...item,
          badge: item.id === 'reports' ? pendingReportsCount : undefined,
        })),
    }))
    .filter(section => section.items.length > 0); // Remove empty sections

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname?.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">Admin</h1>
            <p className="text-xs text-gray-500">Tiyuy Management</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {filteredSections.map((section) => (
          <div key={section.department}>
            <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {section.title}
            </h2>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-gray-500">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
        >
          <span className="text-gray-500"><BackIcon /></span>
          <span>Back to App</span>
        </Link>
      </div>
    </aside>
  );
}
