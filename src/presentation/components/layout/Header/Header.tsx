'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/presentation/store/authStore';
import { NotificationList } from '@/presentation/components/notifications/NotificationList/NotificationList';
import { User, Building, MessageSquare, LogOut, ChevronDown, FolderGit } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [showComprarMenu, setShowComprarMenu] = useState(false);
  const [showAlquilarMenu, setShowAlquilarMenu] = useState(false);
  const [showServiciosMenu, setShowServiciosMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pinnedMenu, setPinnedMenu] = useState<'comprar' | 'alquilar' | null>(null);
  const [stripeColor, setStripeColor] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showContactsLogin, setShowContactsLogin] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);

  // Estados para filtros seleccionados
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
      if (contactsRef.current && !contactsRef.current.contains(e.target as Node)) {
        setShowContactsLogin(false);
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
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4">
          <div className="flex items-center justify-between h-16 max-w-[1600px] mx-auto">
            {/* LOGO */}
            <Link href="/" className="flex items-center flex-shrink-0 -ml-2">
              <img
                src="/assets/images/logo.png"
                alt="TIYUY"
                className="h-50 w-auto"
              />
            </Link>

            {/* NAVEGACIÓN CENTRO */}
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
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
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'lima' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Lima
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'piura')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'piura' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Piura
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'callao')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'callao' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Callao
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'ica')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'ica' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Ica
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'lambayeque')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'lambayeque' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Lambayeque
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'lalibertad')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'lalibertad' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    La Libertad
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'arequipa')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.estado === 'arequipa' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Arequipa
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('estado', 'cusco')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
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
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.tipo === 'departamentos' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Departamento
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('tipo', 'casas')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.tipo === 'casas' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Casa
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('tipo', 'terrenos')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.tipo === 'terrenos' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Terreno / Lote
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('tipo', 'oficinas')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.tipo === 'oficinas' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Oficina
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('tipo', 'locales')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
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
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.dormitorios === '3' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    3 dormitorios
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('dormitorios', '2')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.dormitorios === '2' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    2 dormitorios
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('dormitorios', '4')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.dormitorios === '4' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    4 dormitorios
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('dormitorios', '5')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      comprarFilters.dormitorios === '5' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    5 o más dormitorios
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleComprarFilter('dormitorios', '1')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
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
                                    href="/#guia-comprar"
                                    className="text-gray-800 hover:text-black text-base block cursor-pointer"
                                  >
                                    Guía para comprar un inmueble
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/my-properties/new"
                                    className="text-gray-800 hover:text-black text-base block cursor-pointer"
                                  >
                                    Publica un inmueble para venta
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
                                    href="/#proyectos"
                                    className="text-gray-800 hover:text-black text-base block cursor-pointer"
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
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
                            {/* COLUMNA 1: ESTADO */}
                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Estado</h3>
                              <ul className="space-y-3">
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('estado', 'lima')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.estado === 'lima' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Lima
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('estado', 'piura')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.estado === 'piura' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Piura
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('estado', 'callao')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.estado === 'callao' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Callao
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('estado', 'ica')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.estado === 'ica' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Ica
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('estado', 'lambayeque')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.estado === 'lambayeque' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Lambayeque
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('estado', 'lalibertad')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.estado === 'lalibertad' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    La Libertad
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('estado', 'arequipa')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.estado === 'arequipa' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Arequipa
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('estado', 'cusco')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.estado === 'cusco' ? 'font-bold text-teal-600' : ''
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
                                    onClick={() => handleAlquilarFilter('tipo', 'departamentos')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.tipo === 'departamentos' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Departamento
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('tipo', 'casas')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.tipo === 'casas' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Casa
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('tipo', 'terrenos')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.tipo === 'terrenos' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Terreno / Lote
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('tipo', 'oficinas')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.tipo === 'oficinas' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Oficina
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('tipo', 'locales')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.tipo === 'locales' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Local Comercial
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('tipo', 'habitaciones')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.tipo === 'habitaciones' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Habitación
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('tipo', 'minidepartamentos')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.tipo === 'minidepartamentos' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    Minidepartamento
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
                                    onClick={() => handleAlquilarFilter('dormitorios', '3')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.dormitorios === '3' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    3 dormitorios
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('dormitorios', '2')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.dormitorios === '2' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    2 dormitorios
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('dormitorios', '4')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.dormitorios === '4' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    4 dormitorios
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('dormitorios', '5')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.dormitorios === '5' ? 'font-bold text-teal-600' : ''
                                    }`}
                                  >
                                    5 o más dormitorios
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleAlquilarFilter('dormitorios', '1')}
                                    className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left cursor-pointer ${
                                      alquilarFilters.dormitorios === '1' ? 'font-bold text-teal-600' : ''
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
                                    href="/#rental-guide"
                                    className="text-gray-800 hover:text-black text-base block cursor-pointer"
                                  >
                                    Guía para alquilar un inmueble
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/my-properties/new"
                                    className="text-gray-800 hover:text-black text-base block cursor-pointer"
                                  >
                                    Publica un inmueble para alquilar
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
                                    href="/#proyectos"
                                    className="text-gray-800 hover:text-black text-base block cursor-pointer"
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

              {/* SERVICIOS */}
              <div
                className="relative"
                onMouseEnter={() => setShowServiciosMenu(true)}
                onMouseLeave={() => setShowServiciosMenu(false)}
              >
                <button className="text-black hover:text-gray-800 font-normal text-base py-2 flex items-center gap-1 cursor-pointer">
                  Servicios
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showServiciosMenu && (
                  <>
                    <div
                      className="fixed inset-0 bg-black/20 -z-10"
                      style={{ top: '65px' }}
                    ></div>

                    <div className="fixed top-[65px] left-0 right-0 w-full z-50">
                      <div className="max-w-[1200px] mx-auto px-4 mt-2">
                        <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl py-10 px-10">
                          <div className="grid grid-cols-4 gap-10">
                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">Otros servicios</h3>
                              <ul className="space-y-3">
                                <li>
                                  <Link
                                    href="/my-properties/new"
                                    className="text-gray-800 hover:text-black text-base block cursor-pointer"
                                  >
                                    Publica un inmueble
                                  </Link>
                                </li>
                              </ul>
                            </div>

                            <div>
                              <h3 className="font-bold text-black text-lg mb-5">TIYUY te explica</h3>
                              <ul className="space-y-3">
                                <li>
                                  <Link
                                    href="/#guia-comprar"
                                    className="text-gray-800 hover:text-black text-base block cursor-pointer"
                                  >
                                    Guía para comprar un inmueble
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/#guia-vender"
                                    className="text-gray-800 hover:text-black text-base block cursor-pointer"
                                  >
                                    Guía para vender un inmueble
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/#rental-guide"
                                    className="text-gray-800 hover:text-black text-base block cursor-pointer"
                                  >
                                    Guía para alquilar un inmueble
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/#tips-decoracion"
                                    className="text-gray-800 hover:text-black text-base block cursor-pointer"
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
                                    href="/#reporte-indice"
                                    className="text-gray-800 hover:text-black text-base block cursor-pointer"
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
                                    href="/#mercado-inmobiliario"
                                    className="text-gray-800 hover:text-black text-base block cursor-pointer"
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
                href="/#inmobiliarias"
                className="text-black hover:text-gray-800 font-normal text-base"
              >
                Buscar inmobiliarias
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span className="text-base font-normal hidden xl:inline">
                    Notificaciones
                  </span>
                  {/* Indicador de notificaciones no leídas */}
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                </Link>
              )}

              {/* MIS CONTACTOS - Dropdown cuando no está autenticado */}
              {!isAuthenticated ? (
                <div className="relative" ref={contactsRef}>
                  <button
                    onClick={() => setShowContactsLogin(!showContactsLogin)}
                    className="flex items-center gap-2 text-black hover:text-gray-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span className="text-base font-normal hidden xl:inline">
                      Mis contactos
                    </span>
                  </button>

                  {/* Dropdown de invitación a login */}
                  {showContactsLogin && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-4 px-4 z-50">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                          </svg>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Inicia sesión para chatear</h3>
                        <p className="text-xs text-gray-500 mb-4">Conecta con profesionales inmobiliarios</p>
                        
                        <div className="space-y-2">
                          <Link 
                            href="/login"
                            className="block w-full py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                            onClick={() => setShowContactsLogin(false)}
                          >
                            Iniciar sesión
                          </Link>
                          <Link 
                            href="/profile-selector"
                            className="block w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
                            onClick={() => setShowContactsLogin(false)}
                          >
                            Crear cuenta
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/dashboard/my-contacts"
                  className="flex items-center gap-2 text-black hover:text-gray-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-base font-normal hidden xl:inline">
                    Mis contactos
                  </span>
                </Link>
              )}

              {/* BOTÓN INGRESAR / PERFIL */}
              {!isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      router.push('/profile-selector');
                    }}
                    className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium text-base hover:bg-blue-700 transition-colors"
                  >
                    Registrarse
                  </button>
                  <button
                    onClick={() => {
                      router.push('/login');
                    }}
                    className="bg-teal-600 text-white px-5 py-2 rounded-md font-medium text-base hover:bg-teal-700 transition-colors"
                  >
                    Ingresar
                  </button>
                </div>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-md font-medium text-base hover:bg-teal-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {user?.firstName || 'Mi cuenta'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <Link 
                        href="/dashboard/profile" 
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Mi Perfil</span>
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
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => {
                          logout?.();
                          setShowUserMenu(false);
                          router.push('/');
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Cerrar Sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-1 flex transition-all duration-500">
          <div className={`flex-1 ${colors[stripeColor][0]} transition-colors duration-500`}></div>
          <div className={`flex-1 ${colors[stripeColor][1]} transition-colors duration-500`}></div>
          <div className={`flex-1 ${colors[stripeColor][2]} transition-colors duration-500`}></div>
        </div>
      </header>
    </>
  );
}