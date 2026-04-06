'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { useAuthStore } from '@/presentation/store/authStore';
import { UserRole } from '@/core/domain/entities';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Flame, Home, MessageSquare, Users, Diamond, User, Lock,
  ChevronDown, LogOut, Building
} from 'lucide-react';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';

// Type for dashboard sections
type DashboardSection = 'dashboard' | 'crm-leads';

// Local Dashboard Sidebar component
function DashboardSidebar({ 
  activeSection, 
  setActiveSection, 
  user 
}: { 
  activeSection: DashboardSection; 
  setActiveSection: (section: DashboardSection) => void;
  user: any;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            T
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">TIYUY</h1>
            <p className="text-xs text-gray-500">Real Estate CRM</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {/* Dashboard - Local button */}
        <button
          onClick={() => setActiveSection('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
            activeSection === 'dashboard'
              ? 'bg-teal-50 text-teal-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
          {activeSection === 'dashboard' && <span className="ml-auto w-2 h-2 bg-teal-500 rounded-full"></span>}
        </button>

        {/* CRM Leads - Local button (agents only) */}
        {isAgent && (
          <button
            onClick={() => setActiveSection('crm-leads')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
              activeSection === 'crm-leads'
                ? 'bg-teal-50 text-teal-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Flame className="w-5 h-5" />
            <span>Oportunidades</span>
            {activeSection === 'crm-leads' && <span className="ml-auto w-2 h-2 bg-teal-500 rounded-full"></span>}
          </button>
        )}

        {/* My Properties - Normal Link */}
        <Link
          href="/my-properties"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            pathname === '/my-properties'
              ? 'bg-teal-50 text-teal-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Mis Propiedades</span>
          {pathname === '/my-properties' && <span className="ml-auto w-2 h-2 bg-teal-500 rounded-full"></span>}
        </Link>

        {/* Messages - Normal Link */}
        <Link
          href="/dashboard/my-contacts"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            pathname === '/messages'
              ? 'bg-teal-50 text-teal-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Mensajes</span>
          {pathname === '/messages' && <span className="ml-auto w-2 h-2 bg-teal-500 rounded-full"></span>}
        </Link>

        {/* Clients - Normal Link (agents only) */}
        {isAgent && (
          <Link
            href="/dashboard/clients"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === '/dashboard/clients'
                ? 'bg-teal-50 text-teal-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Clientes</span>
            {pathname === '/dashboard/clients' && <span className="ml-auto w-2 h-2 bg-teal-500 rounded-full"></span>}
          </Link>
        )}

        {/* Plans - Normal Link */}
        <Link
          href="/plans"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            pathname === '/plans'
              ? 'bg-teal-50 text-teal-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Diamond className="w-5 h-5" />
          <span>Planes</span>
          {pathname === '/plans' && <span className="ml-auto w-2 h-2 bg-teal-500 rounded-full"></span>}
        </Link>
        
        {/* Settings Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Configuracion</p>
          
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === '/dashboard/profile'
                ? 'bg-teal-50 text-teal-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Mi Perfil</span>
            {pathname === '/dashboard/profile' && <span className="ml-auto w-2 h-2 bg-teal-500 rounded-full"></span>}
          </Link>
        </div>
      </nav>
    </aside>
  );
}

// Basic CRM Leads content
function CRMLeadsContent() {
  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CRM Leads</h1>
            <p className="text-gray-500 text-sm mt-1">Gestiona tus interesados y conviertelos en clientes</p>
          </div>
        </div>
      </header>
      <div className="p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <p className="text-gray-600">CRM Leads content...</p>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  // State to control active section (dashboard or crm-leads)
  const [activeSection, setActiveSection] = useState<DashboardSection>('dashboard');
  
  const { data: activeSubscription, isLoading, error } = useActiveSubscription();
  
  console.log('DashboardPage: Complete state:', {
    isAuthenticated,
    user: user ? {
      id: user.id,
      email: user.email,
      role: user.role
    } : null
  });
  
  console.log('DashboardPage: Checking if user is authenticated:', isAuthenticated);
  
  // Force state update
  const { user: storeUser } = useAuthStore();
  console.log('DashboardPage: User from store:', storeUser);
  console.log('DashboardPage: activeSubscription:', activeSubscription);
  console.log('DashboardPage: isLoading:', isLoading);
  console.log('DashboardPage: error:', error);
  console.log('DashboardPage: activeSubscription.plan?.name:', activeSubscription?.plan?.name);

  // Smart logic for plan button
  const getPlanButtonText = () => {
    console.log('getPlanButtonText - activeSubscription:', activeSubscription);
    console.log('getPlanButtonText - plan name:', activeSubscription?.plan?.name);
    
    if (isLoading) {
      return 'Loading...';
    }
    
    if (error) {
      console.log('Error in subscription - Upgrade plan');
      return 'Upgrade plan';
    }
    
    if (!activeSubscription) {
      console.log('No activeSubscription - Upgrade plan');
      return 'Upgrade plan';
    }
    
    if (activeSubscription.plan.name === 'FREE') {
      console.log('FREE plan detected - Upgrade plan');
      return 'Upgrade plan';
    }
    
    console.log('Paid plan detected - View plans');
    return 'View plans';
  };

  const getPlanBadge = () => {
    console.log('getPlanBadge - activeSubscription:', activeSubscription);
    
    if (isLoading) {
      return '...';
    }
    
    if (error || !activeSubscription) {
      console.log('Error or no activeSubscription - Badge FREE');
      return 'FREE';
    }
    
    console.log('Badge with plan:', activeSubscription.plan.name);
    return activeSubscription.plan.name;
  };

  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'USER':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Welcome to your Dashboard</h2>
              <p className="text-gray-600 mb-6">Find your ideal home and manage your favorite properties</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Link href="/dashboard/crm-leads" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors relative">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="text-red-600 text-2xl mb-2">Hot</div>
                  <h3 className="font-semibold">CRM Leads</h3>
                  <p className="text-sm text-gray-600">Real-time prospects</p>
                </Link>
                
                <Link href="/my-properties" className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="text-blue-600 text-2xl mb-2">Props</div>
                  <h3 className="font-semibold">My Properties</h3>
                  <p className="text-sm text-gray-600">Manage listings</p>
                </Link>
                
                <Link href="/dashboard/favorites" className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="text-green-600 text-2xl mb-2">Favorites</div>
                  <h3 className="font-semibold">Favorites</h3>
                  <p className="text-sm text-gray-600">Saved properties</p>
                </Link>
                
                <Link href="/dashboard/profile" className="bg-orange-50 p-4 rounded-lg hover:bg-orange-100 transition-colors">
                  <div className="text-orange-600 text-2xl mb-2">Profile</div>
                  <h3 className="font-semibold">My Profile</h3>
                  <p className="text-sm text-gray-600">Personal data</p>
                </Link>
                
                <Link href="/plans" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors relative">
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {getPlanBadge()}
                  </div>
                  <div className="text-red-600 text-2xl mb-2">Diamond</div>
                  <h3 className="font-semibold">{getPlanButtonText()}</h3>
                  <p className="text-sm text-gray-600">Manage your plan</p>
                </Link>
              </div>
            </div>
          </div>
        );

      case 'AGENT':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Real Estate Agent Dashboard</h2>
              <p className="text-gray-600 mb-6">Manage your properties and client portfolio</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Link href="/dashboard/crm-leads" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors relative">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="text-red-600 text-2xl mb-2">Hot</div>
                  <h3 className="font-semibold">CRM Leads</h3>
                  <p className="text-sm text-gray-600">Real-time prospects</p>
                </Link>
                
                <Link href="/my-properties" className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="text-blue-600 text-2xl mb-2">Props</div>
                  <h3 className="font-semibold">My Properties</h3>
                  <p className="text-sm text-gray-600">Manage listings</p>
                </Link>
                
                <Link href="/dashboard/my-contacts" className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="text-green-600 text-2xl mb-2">Msg</div>
                  <h3 className="font-semibold">Messages</h3>
                  <p className="text-sm text-gray-600">Client leads</p>
                </Link>
                
                <Link href="/plans" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors relative">
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {getPlanBadge()}
                  </div>
                  <div className="text-red-600 text-2xl mb-2">Plans</div>
                  <h3 className="font-semibold">{getPlanButtonText()}</h3>
                  <p className="text-sm text-gray-600">Manage your plan</p>
                </Link>
              </div>
            </div>
          </div>
        );

      case 'DEVELOPER':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Real Estate Developer Dashboard</h2>
              <p className="text-gray-600 mb-6">Manage your projects and real estate developments</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Link href="/dashboard/crm-leads" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors relative">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="text-red-600 text-2xl mb-2">Hot</div>
                  <h3 className="font-semibold">CRM Leads</h3>
                  <p className="text-sm text-gray-600">Real-time prospects</p>
                </Link>
                
                <Link href="/my-properties" className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="text-blue-600 text-2xl mb-2">Props</div>
                  <h3 className="font-semibold">My Properties</h3>
                  <p className="text-sm text-gray-600">Manage listings</p>
                </Link>
                
                <Link href="/my-projects" className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="text-green-600 text-2xl mb-2">Projects</div>
                  <h3 className="font-semibold">My Projects</h3>
                  <p className="text-sm text-gray-600">Active developments</p>
                </Link>
                
                <Link href="/dashboard/projects/new" className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition-colors">
                  <div className="text-purple-600 text-2xl mb-2">New</div>
                  <h3 className="font-semibold">New Project</h3>
                  <p className="text-sm text-gray-600">Create development</p>
                </Link>
                
                <Link href="/dashboard/wallet" className="bg-orange-50 p-4 rounded-lg hover:bg-orange-100 transition-colors">
                  <div className="text-orange-600 text-2xl mb-2">Wallet</div>
                  <h3 className="font-semibold">Wallet</h3>
                  <p className="text-sm text-gray-600">Credits and payments</p>
                </Link>
                
                <Link href="/plans" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors">
                  <div className="text-red-600 text-2xl mb-2">Plans</div>
                  <h3 className="font-semibold">Plans</h3>
                  <p className="text-sm text-gray-600">999 publications</p>
                </Link>
              </div>
              
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-yellow-600 text-xl">Plans</div>
                  <h3 className="font-semibold text-yellow-800">Developer Plan</h3>
                </div>
                <p className="text-yellow-700 text-sm">
                  <strong>999 publications</strong> available • <strong>Unlimited projects</strong> • <strong>30 days free</strong>
                </p>
              </div>
            </div>
          </div>
        );

      case 'ADMIN':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
              <p className="text-gray-600 mb-6">Complete management of the TIYUY platform</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Link href="/dashboard/crm-leads" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors relative">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="text-red-600 text-2xl mb-2">Hot</div>
                  <h3 className="font-semibold">CRM Leads</h3>
                  <p className="text-sm text-gray-600">Real-time prospects</p>
                </Link>
                
                <Link href="/my-properties" className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="text-blue-600 text-2xl mb-2">Props</div>
                  <h3 className="font-semibold">My Properties</h3>
                  <p className="text-sm text-gray-600">Manage listings</p>
                </Link>
                
                <Link href="/dashboard/my-contacts" className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="text-green-600 text-2xl mb-2">Msg</div>
                  <h3 className="font-semibold">Messages</h3>
                  <p className="text-sm text-gray-600">Client leads</p>
                </Link>
                
                <Link href="/dashboard/wallet" className="bg-orange-50 p-4 rounded-lg hover:bg-orange-100 transition-colors">
                  <div className="text-orange-600 text-2xl mb-2">Wallet</div>
                  <h3 className="font-semibold">Wallet</h3>
                  <p className="text-sm text-gray-600">Payments and methods</p>
                </Link>
                
                <Link href="/plans" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors relative">
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {getPlanBadge()}
                  </div>
                  <div className="text-red-600 text-2xl mb-2">Plans</div>
                  <h3 className="font-semibold">{getPlanButtonText()}</h3>
                  <p className="text-sm text-gray-600">Manage your plan</p>
                </Link>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Welcome, {user?.firstName || 'User'}!</h2>
            <p className="text-gray-600">
              {user?.role === 'USER' && 'Your personal dashboard is ready'}
              {user?.role === 'AGENT' && 'Your agent dashboard is ready'}
              {user?.role === 'DEVELOPER' && 'Your developer dashboard is ready'}
              {user?.role === 'ADMIN' && 'Your admin dashboard is ready'}
            </p>
          </div>
        );
    }
  };

  // Render content based on active section
  const renderContent = () => {
    if (activeSection === 'crm-leads') {
      return <CRMLeadsContent />;
    }
    return renderDashboardContent();
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          user={user}
        />
        
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </ProtectedRoute>
  );
}
