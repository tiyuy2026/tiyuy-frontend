'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/presentation/store/authStore';
import { useAdminModeStore } from '@/presentation/store/adminModeStore';
import { NotificationList } from '@/presentation/components/notifications/NotificationList/NotificationList';
import { Bell, Building, ChevronDown, FolderGit, Home, LogOut, Menu, MessageSquare, Shield, User, X, LogIn, UserPlus, PlusCircle, Users } from 'lucide-react';



export function Header() {
  const router = useRouter();
  const { isAuthenticated, user, logout, adminRoleType } = useAuthStore();
  const { isUserMode, setUserMode } = useAdminModeStore();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 10) {
        setVisible(true);
      } else if (currentY > lastScrollY.current) {
        setVisible(false);
        closeMenus();
        setShowNotifications(false);
        setShowUserMenu(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [showComprarMenu, setShowComprarMenu] = useState(false);
  const [showAlquilarMenu, setShowAlquilarMenu] = useState(false);
  const [showServiciosMenu, setShowServiciosMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pinnedMenu, setPinnedMenu] = useState<'comprar' | 'alquilar' | null>(null);
  const [stripeColor, setStripeColor] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalAction, setAuthModalAction] = useState<'contactos' | 'publicar'>('contactos');
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);


  const [comprarFilters, setComprarFilters] = useState({
    estado: '',
    tipo: '',
    dormitorios: ''
  });

  const [alquilarFilters, setAlquilarFilters] = useState({
    estado: '',
    tipo: '',
    dormitorios: ''
  });

  // Timers
  const comprarTimerRef = useRef<NodeJS.Timeout | null>(null);
  const alquilarTimerRef = useRef<NodeJS.Timeout | null>(null);
  const serviciosTimerRef = useRef<NodeJS.Timeout | null>(null);
  const serviciosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStripeColor((prev) => (prev + 1) % 5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar dropdown de notificaciones al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const colors = [
    ['bg-red-600', 'bg-white', 'bg-red-600'],
    ['bg-green-600', 'bg-yellow-400', 'bg-orange-500'],
    ['bg-orange-500', 'bg-red-500', 'bg-white'],
    ['bg-yellow-400', 'bg-green-500', 'bg-red-600'],
    ['bg-white', 'bg-red-600', 'bg-green-600'],
  ];

  // Función para navegar después de 1.3 segundos
  const startNavigationTimer = (type: 'comprar' | 'alquilar') => {
    const timerRef = type === 'comprar' ? comprarTimerRef : alquilarTimerRef;
    const filters = type === 'comprar' ? comprarFilters : alquilarFilters;
    const operacion = type === 'comprar' ? 'sale' : 'rent';

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      // Construir URL con los filtros seleccionados
      const estado = filters.estado || 'lima';
      const tipo = filters.tipo || 'departamentos';
      let url = `/${operacion}/${tipo}/${estado}`;

      if (filters.dormitorios) {
        url += `?bedrooms=${filters.dormitorios}`;
      }

      router.push(url);

      // Cerrar menú y resetear filtros
      if (type === 'comprar') {
        setShowComprarMenu(false);
        setComprarFilters({ estado: '', tipo: '', dormitorios: '' });
      } else {
        setShowAlquilarMenu(false);
        setAlquilarFilters({ estado: '', tipo: '', dormitorios: '' });
      }
    }, 1300);
  };

  const cancelNavigationTimer = (type: 'comprar' | 'alquilar') => {
    const timerRef = type === 'comprar' ? comprarTimerRef : alquilarTimerRef;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const closeMenus = () => {
    setShowComprarMenu(false);
    setShowAlquilarMenu(false);
    setShowServiciosMenu(false);
    setPinnedMenu(null);
    cancelNavigationTimer('comprar');
    cancelNavigationTimer('alquilar');
  };

  // Handlers para seleccionar filtros
  const handleComprarFilter = (
    filterType: 'estado' | 'tipo' | 'dormitorios',
    value: string
  ) => {
    setComprarFilters(prev => ({ ...prev, [filterType]: value }));
    cancelNavigationTimer('comprar');
    startNavigationTimer('comprar');
  };

  const handleAlquilarFilter = (
    filterType: 'estado' | 'tipo' | 'dormitorios',
    value: string
  ) => {
    setAlquilarFilters(prev => ({ ...prev, [filterType]: value }));
    cancelNavigationTimer('alquilar');
    startNavigationTimer('alquilar');
  };

  // Handlers para abrir/cerrar menús (hover) + fijar con click
  const handleComprarMouseEnter = () => {
    setShowComprarMenu(true);
    cancelNavigationTimer('comprar');
  };

  const handleComprarMouseLeave = () => {
    if (pinnedMenu === 'comprar') return;

    if (comprarFilters.estado || comprarFilters.tipo || comprarFilters.dormitorios) {
      startNavigationTimer('comprar');
    } else {
      setShowComprarMenu(false);
    }
  };

  const handleAlquilarMouseEnter = () => {
    setShowAlquilarMenu(true);
    cancelNavigationTimer('alquilar');
  };

  const handleAlquilarMouseLeave = () => {
    if (pinnedMenu === 'alquilar') return;

    if (alquilarFilters.estado || alquilarFilters.tipo || alquilarFilters.dormitorios) {
      startNavigationTimer('alquilar');
    } else {
      setShowAlquilarMenu(false);
    }
  };

  const toggleComprarMenu = () => {
    if (showComprarMenu && pinnedMenu === 'comprar') {
      setPinnedMenu(null);
      setShowComprarMenu(false);
      return;
    }

    setPinnedMenu('comprar');
    setShowComprarMenu(true);
    setShowAlquilarMenu(false);
    setShowServiciosMenu(false);
    cancelNavigationTimer('comprar');
  };

  const toggleAlquilarMenu = () => {
    if (showAlquilarMenu && pinnedMenu === 'alquilar') {
      setPinnedMenu(null);
      setShowAlquilarMenu(false);
      return;
    }

    setPinnedMenu('alquilar');
    setShowAlquilarMenu(true);
    setShowComprarMenu(false);
    setShowServiciosMenu(false);
    cancelNavigationTimer('alquilar');
  };

  return (
    <>
      <header className={`bg-white sticky top-0 z-50 shadow-sm transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`} suppressHydrationWarning>

        <div className="w-full px-4">
          <div className="flex items-center justify-between h-16 max-w-[1600px] mx-auto">
            {/* LOGO */}
            <Link href="/" className="flex items-center flex-shrink-0 -ml-2">
              <img
                src="/assets/images/logo.png"
                alt="TIYUY"
                className="h-16 w-auto object-contain sm:h-20"
                style={{ maxWidth: '240px' }}
              />
            </Link>

            {/* NAVEGACIÓN CENTRO - Solo desktop */}
            <nav className="hidden lg:flex items-center gap-6">
              {/* COMPRAR */}
              <div
                className="relative"
                onMouseEnter={handleComprarMouseEnter}
                onMouseLeave={handleComprarMouseLeave}
              >
                <button
                  onClick={toggleComprarMenu}
                  className="text-black hover:text-gray-800 font-normal text-base py-2 flex items-center gap-1 cursor-pointer"
                >
                  Comprar
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showComprarMenu && (
                  <>
                    <div
                      className="fixed inset-0 bg-black/20 -z-10"
                      style={{ top: '65px' }}
                      onClick={closeMenus}
                    ></div>

                    <div className="fixed top-[65px] left-0 right-0 w-full z-50">
                      <div className="max-w-[1400px] mx-auto px-4 mt-2">
                        <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl py-10 px-10">
                          <div className="grid grid-cols-5 gap-10">
                            {/* COLUMNA 1: ESTADO */}
                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Estado</h3>
                              <ul className="space-y-3">
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'lima')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'lima' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Lima
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'piura')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'piura' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Piura
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'callao')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'callao' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Callao
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'ica')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'ica' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Ica
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'lambayeque')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'lambayeque' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Lambayeque
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'lalibertad')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'lalibertad' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    La Libertad
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'arequipa')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'arequipa' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Arequipa
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'cusco')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'cusco' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Cusco
                                  </button>
                                </li>
                              </ul>
                            </div>

                            {/* COLUMNA 2: TIPO DE PROPIEDAD */}
                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Tipo de propiedad</h3>
                              <ul className="space-y-3">
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('tipo', 'departamentos')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.tipo === 'departamentos' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Departamento
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('tipo', 'casas')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.tipo === 'casas' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Casa
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('tipo', 'terrenos')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.tipo === 'terrenos' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Terreno / Lote
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('tipo', 'oficinas')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.tipo === 'oficinas' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Oficina
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('tipo', 'locales')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.tipo === 'locales' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Local Comercial
                                  </button>
                                </li>
                              </ul>
                            </div>

                            {/* COLUMNA 3: DORMITORIOS */}
                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Dormitorios</h3>
                              <ul className="space-y-3">
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('dormitorios', '3')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.dormitorios === '3' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    3 dormitorios
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('dormitorios', '2')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.dormitorios === '2' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    2 dormitorios
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('dormitorios', '4')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.dormitorios === '4' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    4 dormitorios
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('dormitorios', '5')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.dormitorios === '5' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    5 o más dormitorios
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('dormitorios', '1')}
                                    className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.dormitorios === '1' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    1 dormitorio
                                  </button>
                                </li>
                              </ul>
                            </div>

                            {/* COLUMNA 4: SERVICIOS */}
                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Servicios</h3>
                              <ul className="space-y-3">
                                <li>
                                  <Link
                                    href="/servics"
                                    className="text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer"
                                  >
                                    Servicios
                                  </Link>
                                </li>
                              </ul>
                            </div>

                            {/* COLUMNA 5: OTRAS OPERACIONES */}
                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Otras operaciones</h3>
                              <ul className="space-y-3">
                                <li>
                                  <Link
                                    href="/projects"
                                    className="text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer"
                                  >
                                    Proyectos
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ALQUILAR */}
              <div
                className="relative"
                onMouseEnter={handleAlquilarMouseEnter}
                onMouseLeave={handleAlquilarMouseLeave}
              >
                <button
                  onClick={toggleAlquilarMenu}
                  className="text-black hover:text-gray-800 font-normal text-base py-2 flex items-center gap-1 cursor-pointer"
                >
                  Alquilar
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showAlquilarMenu && (
                  <>
                    <div
                      className="fixed inset-0 bg-black/20 -z-10"
                      style={{ top: '65px' }}
                      onClick={closeMenus}
                    ></div>

                    <div className="fixed top-[65px] left-0 right-0 w-full z-50">
                      <div className="max-w-[1400px] mx-auto px-4 mt-2">
                        <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl py-10 px-10">
                          <div className="grid grid-cols-5 gap-10">
                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Estado</h3>
                              <ul className="space-y-3">
                                <li><button onClick={() => handleAlquilarFilter('estado', 'lima')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.estado === 'lima' ? 'font-bold text-teal-600' : ''}`}>Lima</button></li>
                                <li><button onClick={() => handleAlquilarFilter('estado', 'piura')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.estado === 'piura' ? 'font-bold text-teal-600' : ''}`}>Piura</button></li>
                                <li><button onClick={() => handleAlquilarFilter('estado', 'callao')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.estado === 'callao' ? 'font-bold text-teal-600' : ''}`}>Callao</button></li>
                                <li><button onClick={() => handleAlquilarFilter('estado', 'ica')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.estado === 'ica' ? 'font-bold text-teal-600' : ''}`}>Ica</button></li>
                                <li><button onClick={() => handleAlquilarFilter('estado', 'lambayeque')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.estado === 'lambayeque' ? 'font-bold text-teal-600' : ''}`}>Lambayeque</button></li>
                                <li><button onClick={() => handleAlquilarFilter('estado', 'lalibertad')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.estado === 'lalibertad' ? 'font-bold text-teal-600' : ''}`}>La Libertad</button></li>
                                <li><button onClick={() => handleAlquilarFilter('estado', 'arequipa')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.estado === 'arequipa' ? 'font-bold text-teal-600' : ''}`}>Arequipa</button></li>
                                <li><button onClick={() => handleAlquilarFilter('estado', 'cusco')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.estado === 'cusco' ? 'font-bold text-teal-600' : ''}`}>Cusco</button></li>
                              </ul>
                            </div>
                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Tipo de propiedad</h3>
                              <ul className="space-y-3">
                                <li><button onClick={() => handleAlquilarFilter('tipo', 'departamentos')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.tipo === 'departamentos' ? 'font-bold text-teal-600' : ''}`}>Departamento</button></li>
                                <li><button onClick={() => handleAlquilarFilter('tipo', 'casas')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.tipo === 'casas' ? 'font-bold text-teal-600' : ''}`}>Casa</button></li>
                                <li><button onClick={() => handleAlquilarFilter('tipo', 'terrenos')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.tipo === 'terrenos' ? 'font-bold text-teal-600' : ''}`}>Terreno / Lote</button></li>
                                <li><button onClick={() => handleAlquilarFilter('tipo', 'oficinas')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.tipo === 'oficinas' ? 'font-bold text-teal-600' : ''}`}>Oficina</button></li>
                                <li><button onClick={() => handleAlquilarFilter('tipo', 'locales')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.tipo === 'locales' ? 'font-bold text-teal-600' : ''}`}>Local Comercial</button></li>
                                <li><button onClick={() => handleAlquilarFilter('tipo', 'habitaciones')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.tipo === 'habitaciones' ? 'font-bold text-teal-600' : ''}`}>Habitación</button></li>
                                <li><button onClick={() => handleAlquilarFilter('tipo', 'minidepartamentos')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.tipo === 'minidepartamentos' ? 'font-bold text-teal-600' : ''}`}>Minidepartamento</button></li>
                              </ul>
                            </div>
                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Dormitorios</h3>
                              <ul className="space-y-3">
                                <li><button onClick={() => handleAlquilarFilter('dormitorios', '3')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.dormitorios === '3' ? 'font-bold text-teal-600' : ''}`}>3 dormitorios</button></li>
                                <li><button onClick={() => handleAlquilarFilter('dormitorios', '2')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.dormitorios === '2' ? 'font-bold text-teal-600' : ''}`}>2 dormitorios</button></li>
                                <li><button onClick={() => handleAlquilarFilter('dormitorios', '4')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.dormitorios === '4' ? 'font-bold text-teal-600' : ''}`}>4 dormitorios</button></li>
                                <li><button onClick={() => handleAlquilarFilter('dormitorios', '5')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.dormitorios === '5' ? 'font-bold text-teal-600' : ''}`}>5 o más dormitorios</button></li>
                                <li><button onClick={() => handleAlquilarFilter('dormitorios', '1')} className={`text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left ${alquilarFilters.dormitorios === '1' ? 'font-bold text-teal-600' : ''}`}>1 dormitorio</button></li>
                              </ul>
                            </div>
                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Servicios</h3>
                              <ul className="space-y-3">
                                <li><Link href="/rental-guide" className="text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer">Guía para alquilar un inmueble</Link></li>
                                <li><Link href="/my-properties/new" className="text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer">Publica un inmueble para alquilar</Link></li>
                              </ul>
                            </div>
                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Otras operaciones</h3>
                              <ul className="space-y-3">
                                <li><Link href="/projects" className="text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer">Proyectos</Link></li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* SERVICIOS */}
              <div
                ref={serviciosRef}
                className="relative"
                onMouseEnter={() => {
                  if (serviciosTimerRef.current) clearTimeout(serviciosTimerRef.current);
                  setShowServiciosMenu(true);
                }}
                onMouseLeave={() => {
                  serviciosTimerRef.current = setTimeout(() => {
                    setShowServiciosMenu(false);
                  }, 200);
                }}
              >
                <button className="text-black hover:text-gray-800 font-normal text-base py-2 flex items-center gap-1 cursor-pointer">
                  Servicios
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showServiciosMenu && (
                  <>
                    <div
                      className="fixed inset-0 bg-black/20 -z-10"
                      style={{ top: '65px' }}
                      onClick={closeMenus}
                    ></div>

                    <div
                      className="fixed top-[65px] left-0 right-0 w-full z-50"
                      onMouseEnter={() => {
                        if (serviciosTimerRef.current) clearTimeout(serviciosTimerRef.current);
                      }}
                      onMouseLeave={() => {
                        serviciosTimerRef.current = setTimeout(() => {
                          setShowServiciosMenu(false);
                        }, 200);
                      }}
                    >
                      <div className="max-w-[1200px] mx-auto px-4 mt-2">
                        <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl py-10 px-10">
                          <div className="grid grid-cols-4 gap-10">
                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Otros servicios</h3>
                              <ul className="space-y-3">
                                <li>
                                  <button
                                    onClick={() => {
                                      setShowServiciosMenu(false);
                                      if (isAuthenticated) {
                                        router.push('/my-properties/new');
                                      } else {
                                        setAuthModalAction('publicar');
                                        setShowAuthModal(true);
                                      }
                                    }}
                                    className="text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer w-full text-left"
                                  >
                                    Publica un inmueble
                                  </button>
                                </li>
                              </ul>
                            </div>

                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">TIYUY te explica</h3>
                              <ul className="space-y-3">
                                <li>
                                  <Link
                                    href="/rental-guide"
                                    className="text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer"
                                  >
                                    Guía para comprar un inmueble
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/rental-guide"
                                    className="text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer"
                                  >
                                    Guía para vender un inmueble
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/rental-guide"
                                    className="text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer"
                                  >
                                    Guía para alquilar un inmueble
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/tips-decoracion"
                                    className="text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer"
                                  >
                                    Tips de decoración
                                  </Link>
                                </li>
                              </ul>
                            </div>

                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Números del mercado</h3>
                              <ul className="space-y-3">
                                <li>
                                  <Link
                                    href="/price-per-m2"
                                    className="text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer"
                                  >
                                    Reporte Índice por m2
                                  </Link>
                                </li>
                              </ul>
                            </div>

                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Novedades</h3>
                              <ul className="space-y-3">
                                <li>
                                  <Link
                                    href="/market-radar"
                                    className="text-gray-800 hover:text-black hover:bg-gray-100 px-2 -mx-2 rounded-md transition-colors text-base block cursor-pointer"
                                  >
                                    Mercado Inmobiliario
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Link
                href="/agencies"
                className="text-black hover:text-gray-800 font-normal text-base"
              >
                Buscar inmobiliarias
              </Link>
              <Link
                href="/agents"
                className="text-black hover:text-gray-800 font-normal text-base"
              >
                Buscar agentes
              </Link>
            </nav>

            {/* ACCIONES DERECHA */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* BOTÓN NOTIFICACIONES - Solo si está autenticado */}
              {isAuthenticated && (
                <Link
                  href="/notifications"
                  className="relative flex items-center gap-2 text-black hover:text-gray-800"
                >
                  <Bell className="w-5 h-5" />
                </Link>
              )}
              {/* CONTACTOS - Siempre visible */}
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    router.push('/mensajes');
                  } else {
                    setAuthModalAction('contactos');
                    setShowAuthModal(true);
                  }
                }}
                className="hidden sm:inline-flex items-center gap-2 text-black hover:text-gray-800 text-sm font-medium"
              >
                <Users className="w-4 h-4" />
                Contactos
              </button>


              {/* BOTÓN PUBLICAR - Siempre visible */}
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    router.push('/my-properties/new');
                  } else {
                    setAuthModalAction('publicar');
                    setShowAuthModal(true);
                  }
                }}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium"
              >
                <Building className="w-4 h-4" />
                Publicar
              </button>

              {/* INGRESAR - Solo si NO está autenticado */}
              {!isAuthenticated && (
                <Link
                  href="/profile-selector"
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  Ingresar
                </Link>
              )}

              {/* MENÚ USUARIO - Solo si está autenticado */}
              {isAuthenticated && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-black hover:text-gray-800"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold">
                      {user?.firstName?.[0] || 'U'}
                    </div>
                    <ChevronDown className="w-4 h-4 hidden sm:block" />
                  </button>
                  {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        <Home className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/my-properties"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        <Building className="w-4 h-4" />
                        Mis propiedades
                      </Link>
                      {user?.role && !['USER', 'AGENT'].includes(user.role) && (
                        <Link
                          href="/my-projects"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          <FolderGit className="w-4 h-4" />
                          Mis proyectos
                        </Link>
                      )}

                      <Link
                        href="/mensajes"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Mensajes
                      </Link>
                      <Link
                        href="/notifications"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        <Bell className="w-4 h-4" />
                        Notificaciones
                      </Link>

                      {adminRoleType && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg mt-1 border-t border-gray-100 pt-2"
                        >
                          <Shield className="w-4 h-4" />
                          Panel Admin
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100 pt-1 mt-1">
                      <button
                        onClick={() => {
                          logout();
                          router.push('/');
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
                </div>
              )}
              {/* BOTÓN MENÚ MÓVIL */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center text-black hover:text-gray-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg fixed top-16 left-0 right-0 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-4 space-y-4">
            <div className="space-y-2">
              <Link href="/sale" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                Comprar
              </Link>
              <Link href="/rent" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                Alquilar
              </Link>
              <Link href="/services" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                Servicios
              </Link>
              <Link href="/agencies" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                Buscar inmobiliarias
              </Link>
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isAuthenticated) {
                    router.push('/mensajes');
                  } else {
                    setAuthModalAction('contactos');
                    setShowAuthModal(true);
                  }
                }}
                className="flex items-center justify-center gap-2 w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                <Users className="w-4 h-4" />
                Contactos
              </button>


              {!isAuthenticated && (
                <>
                  <Link
                    href="/login"
                    className="block w-full text-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      )}
      {/* MODAL DE AUTENTICACIÓN */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                {authModalAction === 'publicar' ? (
                  <Building className="w-8 h-8 text-blue-500" />
                ) : (
                  <Users className="w-8 h-8 text-blue-500" />
                )}

              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              {authModalAction === 'publicar' ? 'Publicar un inmueble' : 'Contactos'}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              {authModalAction === 'publicar' 
                ? 'Para publicar un inmueble, primero debes iniciar sesión o crear una cuenta.'
                : 'Para acceder a tus contactos, primero debes iniciar sesión o crear una cuenta.'}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  router.push('/profile-selector');
                }}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-teal-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Iniciar sesión
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  router.push('/profile-selector');
                }}
                className="w-full flex items-center justify-center gap-2 bg-white text-teal-600 font-semibold py-3 px-4 rounded-xl border-2 border-teal-600 hover:bg-teal-50 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Crear cuenta gratis
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


