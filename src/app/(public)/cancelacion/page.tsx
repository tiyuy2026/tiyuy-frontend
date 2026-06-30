'use client';

import { useState } from 'react';
import { useCreateSupportTicket } from '@/presentation/hooks/admin/useSupportTickets';
import { useAuthStore } from '@/presentation/store/authStore';
import { TicketCategory, TicketSeverity } from '@/core/domain/entities/Admin';
import {
  X, Send, AlertCircle, CheckCircle2, Shield, Loader2, HelpCircle,
  CreditCard, UserX, Ban, RefreshCw, ChevronDown, ChevronUp,
  ExternalLink, Mail, Phone, User, FileText, ArrowRight, LogOut,
  Trash2, AlertTriangle, Info
} from 'lucide-react';
import Link from 'next/link';

const CANCEL_CATEGORIES: { value: TicketCategory; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'PAYMENT_ISSUE', label: 'Cancelar suscripción', icon: <CreditCard className="w-5 h-5" />, desc: 'Solicitar la cancelación de mi plan o suscripción activa' },
  { value: 'ACCOUNT_ISSUE', label: 'Eliminar cuenta', icon: <UserX className="w-5 h-5" />, desc: 'Solicitar la eliminación permanente de mi cuenta y datos' },
  { value: 'PROPERTY_ISSUE', label: 'Cancelar publicación', icon: <Ban className="w-5 h-5" />, desc: 'Solicitar la cancelación o desactivación de una publicación' },
  { value: 'OTHER', label: 'Reembolso', icon: <RefreshCw className="w-5 h-5" />, desc: 'Solicitar un reembolso por un pago realizado' },
  { value: 'SYSTEM_ERROR', label: 'Otra solicitud de cancelación', icon: <FileText className="w-5 h-5" />, desc: 'Otro tipo de cancelación no contemplada arriba' },
];

const SEVERITIES: { value: TicketSeverity; label: string; color: string }[] = [
  { value: 'LOW', label: 'Baja - Consulta', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' },
  { value: 'MEDIUM', label: 'Media - Solicitud', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30' },
  { value: 'HIGH', label: 'Alta - Urgente', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30' },
  { value: 'CRITICAL', label: 'Crítica - Inmediata', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' },
];

const FAQS = [
  {
    q: '¿Cómo cancelo mi suscripción?',
    a: 'Puedes cancelar tu suscripción en cualquier momento desde tu panel de configuración en "Mi suscripción". También puedes usar el formulario de esta página para solicitar la cancelación. La cancelación surtirá efecto al final del período facturado vigente, y seguirás teniendo acceso a los beneficios hasta esa fecha.',
  },
  {
    q: '¿Puedo eliminar mi cuenta permanentemente?',
    a: 'Sí. Puedes solicitar la eliminación permanente de tu cuenta y todos tus datos asociados. Una vez procesada, no podremos recuperar tu información. Te recomendamos descargar cualquier información importante antes de solicitar la eliminación.',
  },
  {
    q: '¿Cómo funcionan los reembolsos?',
    a: 'Los reembolsos se evalúan caso por caso. Si cancelas dentro de los primeros 7 días de tu suscripción, puedes ser elegible para un reembolso completo. Pasado ese período, el reembolso se prorratea según el tiempo restante de tu suscripción. Los reembolsos se procesan en un plazo de 5 a 10 días hábiles.',
  },
  {
    q: '¿Qué pasa con mis publicaciones al cancelar?',
    a: 'Al cancelar tu suscripción, tus publicaciones activas permanecerán visibles hasta el final del período facturado. Después de ese período, las publicaciones se desactivarán automáticamente. Si eliminas tu cuenta, todas tus publicaciones serán eliminadas permanentemente.',
  },
  {
    q: '¿Puedo reactivar mi cuenta después de cancelar?',
    a: 'Sí. Si cancelaste tu suscripción pero no eliminaste tu cuenta, puedes reactivarla en cualquier momento iniciando sesión y adquiriendo un nuevo plan. Si eliminaste tu cuenta permanentemente, deberás crear una cuenta nueva.',
  },
  {
    q: '¿Cuánto tiempo toma procesar una cancelación?',
    a: 'Las cancelaciones de suscripción se procesan de inmediato y surten efecto al final del período vigente. Las solicitudes de eliminación de cuenta pueden tomar hasta 48 horas hábiles. Los reembolsos se procesan en un plazo de 5 a 10 días hábiles.',
  },
];

const CancellationIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="90" className="fill-[var(--brand-primary)]/5" />
    <circle cx="100" cy="100" r="70" className="fill-[var(--brand-primary)]/10" />
    <circle cx="100" cy="100" r="50" className="fill-[var(--brand-primary)]/15" />
    <rect x="60" y="55" width="80" height="90" rx="8" className="fill-[var(--brand-primary)]/20 stroke-[var(--brand-primary)]" strokeWidth="2" />
    <rect x="68" y="63" width="64" height="10" rx="3" className="fill-[var(--brand-primary)]/30" />
    <rect x="68" y="80" width="48" height="6" rx="2" className="fill-[var(--brand-primary)]/20" />
    <rect x="68" y="92" width="40" height="6" rx="2" className="fill-[var(--brand-primary)]/20" />
    <rect x="68" y="104" width="44" height="6" rx="2" className="fill-[var(--brand-primary)]/20" />
    <line x1="130" y1="70" x2="155" y2="45" className="stroke-red-500" strokeWidth="3" strokeLinecap="round" />
    <line x1="155" y1="70" x2="130" y2="45" className="stroke-red-500" strokeWidth="3" strokeLinecap="round" />
    <circle cx="155" cy="45" r="18" className="fill-red-500/10 stroke-red-500" strokeWidth="2" />
  </svg>
);

export default function CancelacionPage() {
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  const [step, setStep] = useState<'info' | 'form' | 'success'>('info');
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory>('PAYMENT_ISSUE');
  const [selectedSeverity, setSelectedSeverity] = useState<TicketSeverity>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [preferredChannel, setPreferredChannel] = useState('EMAIL');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const createMutation = useCreateSupportTicket();

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      setError('Completa todos los campos requeridos');
      return;
    }
    if (!isAuthenticated && !guestEmail.trim()) {
      setError('Debes proporcionar tu correo para que podamos contactarte');
      return;
    }
    if (!acceptedTerms) {
      setError('Debes aceptar los términos para enviar la solicitud');
      return;
    }
    setError('');
    try {
      const request: any = {
        subject: `[CANCELACION] ${subject.trim()}`,
        description: `Referencia: ${referenceId || 'No especificada'}\nCanal de contacto: ${preferredChannel}\n\n${description.trim()}`,
        category: selectedCategory,
        severity: selectedSeverity,
      };
      if (!isAuthenticated) {
        request.guestName = guestName.trim() || undefined;
        request.guestEmail = guestEmail.trim() || undefined;
        request.guestPhone = guestPhone.trim() || undefined;
      }
      await createMutation.mutateAsync(request);
      setStep('success');
    } catch {
      setError('Error al enviar la solicitud. Intenta de nuevo.');
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] antialiased text-[var(--text-primary)] selection:bg-[var(--brand-primary)]/10">
      <div className="relative bg-[var(--bg-primary)] border-b border-[var(--border-light)] overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-bl from-[var(--brand-primary-light)] via-transparent to-transparent blur-3xl rounded-full opacity-70" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-gradient-to-tr from-[var(--brand-primary-light)]/40 via-transparent to-transparent blur-2xl rounded-full opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(120,119,198,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,119,198,0.03)_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
        </div>

        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--brand-primary-light)] border border-[var(--brand-primary)]/20 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
                <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-widest">
                  Centro de Soporte Tiyuy
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight text-[var(--text-primary)] leading-[1.1]">
                Flexibilidad ante todo. <br />
                Opciones de <span className="text-[var(--brand-primary)] relative inline-block">
                  cancelación
                  <span className="absolute bottom-1 left-0 w-full h-[6px] bg-[var(--brand-primary)]/10 -z-10 rounded-full" />
                </span>
              </h1>

              <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl font-normal">
                Entendemos que los planes cambian. Gestiona la cancelación de tu suscripción,
                cuenta o publicaciones de forma totalmente transparente. Encuentra la política
                justa aplicable a tu perfil de alojamiento o experiencia.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => setStep('form')}
                  className="px-8 py-4 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg shadow-[var(--brand-primary)]/10 flex items-center justify-center gap-2 group active:scale-[0.98]"
                >
                  <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  Solicitar cancelación
                </button>

                <Link
                  href="#faq"
                  className="px-8 py-4 border border-[var(--border-color)] hover:border-[var(--brand-primary)]/40 text-[var(--text-primary)] font-bold rounded-2xl transition-all duration-200 bg-[var(--bg-card)] shadow-sm hover:bg-[var(--bg-secondary)] flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-4 h-4 text-[var(--text-secondary)]" />
                  Ver preguntas frecuentes
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[420px] aspect-[4/5] sm:aspect-square lg:aspect-[4/5]">

                <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-[var(--bg-card)] relative group">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 z-10" />
                  <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
                    alt="Tiyuy Experiencia"
                    className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
                  />
                </div>

                <div className="absolute -top-6 -left-6 bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-light)] p-4 rounded-2xl shadow-xl z-20 hidden sm:flex items-center gap-3 max-w-[210px]">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <LogOut className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">¿Cambio de planes?</h4>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Te acompañamos en cada paso.</p>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-4 bg-[var(--bg-card)]/95 backdrop-blur-md border-2 border-[var(--brand-primary)]/20 p-4 rounded-2xl shadow-2xl z-20 flex items-center gap-3 max-w-[240px]">
                  <div className="w-9 h-9 rounded-full bg-[var(--brand-primary)] flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[var(--text-secondary)]">Soporte garantizado</p>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">Comunidad 100% Protegida</h4>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {step === 'info' && (
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16 space-y-16">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* 1. Introducción (Diseño Asimétrico Estilo Airbnb con Imagen de Confianza) */}
          <div className="group bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-light)] shadow-[0_12px_40px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_16px_50px_rgba(74,154,62,0.06)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Bloque de Contenido */}
              <div className="md:col-span-7 p-8 sm:p-12 relative flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--brand-primary)]/5 to-transparent blur-3xl rounded-full pointer-events-none" />
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                      <Info className="w-4 h-4 text-[var(--brand-primary)]" />
                    </div>
                    <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-widest">Información</span>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] leading-tight">
                    Cancelación sin complicaciones
                  </h2>
                  
                  <div className="space-y-4 text-sm sm:text-base text-[var(--text-secondary)] font-normal leading-relaxed">
                    <p>
                      Entendemos que las circunstancias cambian. Ya sea que necesites cancelar tu suscripción,
                      eliminar tu cuenta o desactivar una publicación, estamos aquí para ayudarte a hacerlo
                      de forma rápida y sin complicaciones.
                    </p>
                    <p>
                      Antes de cancelar, te recomendamos revisar nuestras políticas de cancelación y reembolso
                      para que sepas qué esperar. Si tienes dudas, nuestro equipo de soporte está disponible
                      para resolverlas antes de que tomes una decisión.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bloque Visual Profesional (Inspirado en Airbnb / NTT Data) */}
              <div className="md:col-span-5 bg-[var(--bg-secondary)] min-h-[240px] md:min-h-full relative overflow-hidden border-t md:border-t-0 md:border-l border-[var(--border-light)]">
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[var(--bg-card)] via-transparent to-transparent z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80" 
                  alt="Tiyuy Transparencia" 
                  className="w-full h-full object-cover grayscale-[20%] opacity-85 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Elemento flotante abstracto tipo Google */}
                <div className="absolute bottom-6 right-6 z-20 bg-[var(--bg-card)]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[var(--border-light)] shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">Soporte Tiyuy Activo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Separador Elegante Grueso Minimalista */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-[3px] rounded-full bg-[var(--brand-primary)]/20" />
          </div>

          {/* 2. Tipos de cancelación (Grid estilo Tablero Limpio de Google Cloud / NTT Data) */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[var(--brand-primary)]" />
              </div>
              <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-widest">Tipos de Gestión</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              ¿Qué tipo de cancelación necesitas?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: <CreditCard className="w-5 h-5" />, title: 'Cancelar suscripción', desc: 'Cancela tu plan actual. El servicio sigue activo hasta el final del período facturado.' },
                { icon: <UserX className="w-5 h-5" />, title: 'Eliminar cuenta', desc: 'Solicita la eliminación permanente de tu cuenta y todos tus datos.' },
                { icon: <Ban className="w-5 h-5" />, title: 'Cancelar publicación', desc: 'Desactiva una publicación específica de forma temporal o permanente.' },
                { icon: <RefreshCw className="w-5 h-5" />, title: 'Solicitar reembolso', desc: 'Solicita un reembolso si cumples con los criterios de nuestra política.' },
                { icon: <Trash2 className="w-5 h-5" />, title: 'Eliminar datos', desc: 'Solicita la eliminación de datos específicos asociados a tu cuenta.' },
                { icon: <HelpCircle className="w-5 h-5" />, title: 'Otra cancelación', desc: 'Cualquier otra solicitud de cancelación no contemplada.' },
              ].map((item, idx) => (
                <div key={idx} className="group/card bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl p-6 hover:border-[var(--brand-primary)]/40 hover:shadow-[0_10px_30px_rgba(74,154,62,0.05)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[var(--brand-primary)]/4 to-transparent blur-2xl rounded-full pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                  
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] mb-4 border border-[var(--border-light)] group-hover/card:bg-[var(--brand-primary-light)] group-hover/card:text-[var(--brand-primary)] group-hover/card:border-[var(--brand-primary)]/20 transition-all duration-300">
                      {item.icon}
                    </div>
                    <h4 className="font-bold text-[var(--text-primary)] text-base mb-1.5 transition-colors group-hover/card:text-[var(--brand-primary)]">
                      {item.title}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)] font-normal leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Separador */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-[3px] rounded-full bg-[var(--brand-primary)]/20" />
          </div>

          {/* 3. Antes de cancelar (Bloque de Advertencia / Aviso Corporativo Nítido) */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Importante</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Antes de cancelar, ten en cuenta
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { title: 'Suscripciones', desc: 'La cancelación surte efecto al final del período facturado vigente. No se realizan reembolsos parciales por días no usados, salvo lo establecido en nuestra política de reembolsos.' },
                { title: 'Publicaciones activas', desc: 'Tus publicaciones permanecerán visibles hasta el final de tu suscripción. Después se desactivarán automáticamente.' },
                { title: 'Eliminación de cuenta', desc: 'Al eliminar tu cuenta, perderás acceso permanente a todos tus datos, publicaciones, mensajes e historial. Esta acción es irreversible.' },
                { title: 'Datos asociados', desc: 'Si tienes agentes o inmobiliarias vinculadas, la cancelación de tu cuenta afectará también su acceso a la plataforma.' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] hover:border-amber-500/30 hover:shadow-[0_8px_25px_rgba(251,191,36,0.04)] transition-all duration-200">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0 border border-amber-500/10">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-[var(--text-primary)] text-sm">{item.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)] font-normal leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Separador */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-[3px] rounded-full bg-[var(--brand-primary)]/20" />
          </div>

          {/* 4. FAQs (Módulos de Preguntas Limpias con Bordes Finos) */}
          <div className="space-y-6" id="faq">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-[var(--brand-primary)]" />
              </div>
              <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-widest">Centro de Ayuda</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Preguntas frecuentes
            </h2>

            <div className="space-y-3.5">
              {FAQS.map((faq, index) => (
                <div key={index} className={`border rounded-2xl overflow-hidden transition-all duration-200 ${expandedFaq === index
                    ? 'border-[var(--brand-primary)]/50 shadow-[0_4px_20px_rgba(74,154,62,0.05)]'
                    : 'border-[var(--border-light)] hover:border-[var(--brand-primary)]/20'
                  } bg-[var(--bg-card)]`}>
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--bg-secondary)]/50 transition-colors"
                  >
                    <span className={`font-bold pr-4 transition-colors text-sm sm:text-base ${expandedFaq === index ? 'text-[var(--brand-primary)]' : 'text-[var(--text-primary)]'}`}>
                      {faq.q}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${expandedFaq === index
                        ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                      }`}>
                      {expandedFaq === index ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-5 pb-5 border-t border-[var(--border-light)] pt-4 bg-[var(--bg-secondary)]/30">
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-normal">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Separador */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-[3px] rounded-full bg-[var(--brand-primary)]/20" />
          </div>

          {/* 5. CTA Final Minimalista y Potente */}
          <div className="group bg-[var(--bg-card)] rounded-[2.5rem] p-8 sm:p-12 text-center border border-[var(--border-light)] shadow-[0_12px_40px_rgba(0,0,0,0.01)] relative overflow-hidden hover:shadow-[0_16px_50px_rgba(74,154,62,0.06)] transition-all duration-300">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-[var(--brand-primary)]/5 to-transparent blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-[var(--brand-primary)]/10 flex items-center justify-center mx-auto border border-[var(--brand-primary)]/10">
                <LogOut className="w-7 h-7 text-[var(--brand-primary)]" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                ¿Necesitas cancelar algo?
              </h2>
              
              <p className="text-[var(--text-secondary)] text-sm sm:text-base font-normal leading-relaxed">
                Estamos aquí para ayudarte. Solicita tu cancelación de forma rápida y nuestro equipo te dará seguimiento.
              </p>
              
              <div className="pt-2">
                <button 
                  onClick={() => setStep('form')}
                  className="px-8 py-4 bg-[var(--brand-primary)] text-white font-bold rounded-xl hover:bg-[var(--brand-primary-hover)] transition-all shadow-md shadow-[var(--brand-primary)]/10 inline-flex items-center gap-2 active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  Solicitar cancelación
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      )}

      {/* Formulario */}
      {step === 'form' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-[var(--bg-card)] rounded-[2.5rem] shadow-[0_16px_50px_rgba(0,0,0,0.03)] border border-[var(--border-light)] p-6 sm:p-12 relative overflow-hidden">
            
            {/* Fondo sutil decorativo superior */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[var(--brand-primary)]/4 to-transparent blur-3xl rounded-full pointer-events-none" />

            {/* Cabecera del Formulario */}
            <div className="flex items-start justify-between mb-10 border-b border-[var(--border-light)] pb-6 relative z-10">
              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                  Solicitar cancelación
                </h2>
                <p className="text-sm text-[var(--text-secondary)] font-normal">
                  Cuéntanos qué necesitas cancelar y te ayudaremos a procesarlo rápidamente.
                </p>
              </div>
              <button 
                onClick={() => setStep('info')} 
                className="p-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--border-light)] rounded-xl transition-all duration-200 group active:scale-95"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
              </button>
            </div>

            <div className="space-y-8 relative z-10">
              {/* Alerta / Datos para usuarios Invitados (No autenticados) */}
              {!isAuthenticated && (
                <div className="space-y-6">
                  <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <Info className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-amber-800 dark:text-amber-400 font-normal leading-relaxed">
                      Si nos dejas tus datos podremos darte un seguimiento personalizado y prioritario sobre tu solicitud.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        Nombre <span className="text-[var(--text-muted)] font-normal">(opcional)</span>
                      </label>
                      <input 
                        type="text" 
                        value={guestName} 
                        onChange={e => setGuestName(e.target.value)}
                        placeholder="Tu nombre completo" 
                        className="w-full px-4 py-3.5 bg-[var(--bg-secondary)]/50 border border-[var(--border-light)] rounded-xl text-sm focus:bg-[var(--bg-card)] focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-normal transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        Teléfono <span className="text-[var(--text-muted)] font-normal">(opcional)</span>
                      </label>
                      <input 
                        type="tel" 
                        value={guestPhone} 
                        onChange={e => setGuestPhone(e.target.value)}
                        placeholder="+51 999 999 999" 
                        className="w-full px-4 py-3.5 bg-[var(--bg-secondary)]/50 border border-[var(--border-light)] rounded-xl text-sm focus:bg-[var(--bg-card)] focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-normal transition-all outline-none" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                      Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      value={guestEmail} 
                      onChange={e => setGuestEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com" 
                      className="w-full px-4 py-3.5 bg-[var(--bg-secondary)]/50 border border-[var(--border-light)] rounded-xl text-sm focus:bg-[var(--bg-card)] focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-normal transition-all outline-none" 
                    />
                  </div>
                  <hr className="border-[var(--border-light)] my-2" />
                </div>
              )}

              {/* Listado de Categorías Selectoras */}
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                  Tipo de cancelación
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CANCEL_CATEGORIES.map(cat => (
                    <button 
                      key={cat.value} 
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group/cat ${
                        selectedCategory === cat.value 
                          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-light)]/40 shadow-[0_4px_20px_rgba(74,154,62,0.04)]' 
                          : 'border-[var(--border-light)] hover:border-[var(--brand-primary)]/30 bg-[var(--bg-secondary)]/40 hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                        selectedCategory === cat.value 
                          ? 'bg-[var(--brand-primary)] text-white border-transparent shadow-sm' 
                          : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] group-hover/cat:border-[var(--brand-primary)]/20'
                      }`}>
                        {cat.icon}
                      </div>
                      <div className="space-y-0.5">
                        <p className={`font-bold text-sm transition-colors ${selectedCategory === cat.value ? 'text-[var(--brand-primary)]' : 'text-[var(--text-primary)]'}`}>
                          {cat.label}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] font-normal leading-relaxed">
                          {cat.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs de Identificación / Asunto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    Referencia <span className="text-[var(--text-muted)] font-normal">(opcional)</span>
                  </label>
                  <input 
                    type="text" 
                    value={referenceId} 
                    onChange={e => setReferenceId(e.target.value)}
                    placeholder="ID de suscripción, publicación o transacción" 
                    className="w-full px-4 py-3.5 bg-[var(--bg-secondary)]/50 border border-[var(--border-light)] rounded-xl text-sm focus:bg-[var(--bg-card)] focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-normal transition-all outline-none" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    Asunto <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Ej: Cancelación de suscripción mensual" 
                    className="w-full px-4 py-3.5 bg-[var(--bg-secondary)]/50 border border-[var(--border-light)] rounded-xl text-sm focus:bg-[var(--bg-card)] focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-normal transition-all outline-none" 
                  />
                </div>
              </div>

              {/* Caja de Texto Extensa */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Cuéntanos los detalles de tu solicitud de cancelación. Incluye toda la información relevante para que podamos procesarla rápidamente."
                  rows={5} 
                  className="w-full px-4 py-3.5 bg-[var(--bg-secondary)]/50 border border-[var(--border-light)] rounded-xl text-sm focus:bg-[var(--bg-card)] focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-normal transition-all resize-none outline-none" 
                />
              </div>

              {/* Nivel de Urgencia (Píldoras Segmentadas Estilo Google Workspace UX) */}
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                  Urgencia
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  {SEVERITIES.map(sev => (
                    <button 
                      key={sev.value} 
                      onClick={() => setSelectedSeverity(sev.value)}
                      className={`flex-1 px-5 py-3.5 rounded-xl border text-sm font-bold transition-all duration-200 active:scale-[0.99] ${
                        selectedSeverity === sev.value 
                          ? `${sev.color} border-transparent shadow-sm ring-2 ring-offset-2 ring-offset-[var(--bg-card)]` 
                          : 'border-[var(--border-light)] bg-[var(--bg-secondary)]/60 text-[var(--text-primary)] hover:border-[var(--brand-primary)]/20 hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      {sev.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferencia de Canal de Contacto */}
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                  ¿Cómo prefieres que te contactemos? <span className="text-[var(--text-muted)] font-normal">(opcional)</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {[{ v: 'EMAIL', l: 'Email' }, { v: 'PHONE', l: 'Teléfono' }, { v: 'WHATSAPP', l: 'WhatsApp' }].map(ch => (
                    <button 
                      key={ch.v} 
                      onClick={() => setPreferredChannel(ch.v)}
                      className={`px-5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-200 ${
                        preferredChannel === ch.v 
                          ? 'bg-[var(--brand-primary)] text-white border-transparent shadow-sm' 
                          : 'border-[var(--border-light)] bg-[var(--bg-secondary)]/50 text-[var(--text-secondary)] hover:border-[var(--brand-primary)]/30 hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {ch.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bloque Legal Pequeño */}
              <div className="bg-[var(--bg-secondary)]/60 rounded-2xl p-5 border border-[var(--border-light)]">
                <p className="text-xs text-[var(--text-secondary)] font-normal leading-relaxed">
                  Al enviar esta solicitud, autorizas a Tiyuy a procesar la cancelación solicitada según nuestras políticas vigentes de la comunidad. Recibirás una confirmación inmediata y el respectivo seguimiento del estado de tu solicitud por el canal preferido.
                </p>
              </div>

              {/* Checkbox de Confirmación */}
              <label className="flex items-start gap-3.5 cursor-pointer group pt-1 select-none">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={acceptedTerms} 
                    onChange={e => setAcceptedTerms(e.target.checked)}
                    className="w-5 h-5 rounded-md border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] focus:ring-offset-0 cursor-pointer" 
                  />
                </div>
                <span className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal group-hover:text-[var(--text-primary)] transition-colors leading-relaxed">
                  Confirmo que deseo proceder con la cancelación y entiendo completamente las implicaciones descritas en esta página.
                </span>
              </label>

              {/* Manejo de Errores */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/[0.06] text-red-700 dark:text-red-400 rounded-xl text-sm font-bold border border-red-500/20 animate-fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Botonera de Acción Inferior */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-6 border-t border-[var(--border-light)] gap-4">
                <button 
                  onClick={() => setStep('info')} 
                  className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-center"
                >
                  ← Volver
                </button>
                
                <button 
                  onClick={handleSubmit}
                  disabled={!subject.trim() || !description.trim() || !acceptedTerms || createMutation.isPending}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-40 disabled:hover:bg-[var(--brand-primary)] disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-[var(--brand-primary)]/10 active:scale-[0.98]"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> 
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> 
                      <span>Enviar Solicitud</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-[var(--bg-card)] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[var(--border-light)] p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-green-500/10 blur-3xl rounded-full" />
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6 border border-green-200 dark:border-green-900/30">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-500" />
              </div>
              <h2 className="text-3xl font-black text-[var(--text-primary)] mb-4">Solicitud recibida</h2>
              <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-4 font-medium leading-relaxed">
                Hemos recibido tu solicitud de cancelación. Nuestro equipo la revisará y te contactará
                para confirmar los detalles y procesarla.
              </p>
              <p className="text-sm text-[var(--text-muted)] font-bold mb-10">Recibirás actualizaciones en tu correo.</p>
              <button onClick={() => setStep('info')}
                className="px-8 py-3.5 bg-[var(--brand-primary)] hover:opacity-90 text-[var(--bg-primary)] rounded-xl font-bold transition-all shadow-sm">Volver al inicio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
