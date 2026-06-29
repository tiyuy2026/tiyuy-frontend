'use client';

import { useState } from 'react';
import { useCreateSupportTicket } from '@/presentation/hooks/admin/useSupportTickets';
import { useAuthStore } from '@/presentation/store/authStore';
import { TicketCategory, TicketSeverity } from '@/core/domain/entities/Admin';
import {
  X, Send, AlertCircle, CheckCircle2, Shield, Loader2,
  ShieldAlert, UserX, MessageSquareWarning, AlertTriangle, Eye,
  FileText, Lock, ChevronDown, ChevronUp, ExternalLink, Mail, Phone, User, Flag
} from 'lucide-react';
import Link from 'next/link';

const SECURITY_CATEGORIES: { value: TicketCategory; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'PASSWORD_CHANGE', label: 'Cuenta vulnerada', icon: <ShieldAlert className="w-5 h-5" />, desc: 'Alguien accedió a mi cuenta sin autorización' },
  { value: 'ACCOUNT_ISSUE', label: 'Actividad sospechosa', icon: <Eye className="w-5 h-5" />, desc: 'Veo movimientos extraños en mi cuenta o publicaciones' },
  { value: 'PROPERTY_ISSUE', label: 'Anuncio fraudulento', icon: <Flag className="w-5 h-5" />, desc: 'Una publicación parece falsa o engañosa' },
  { value: 'OTHER', label: 'Mensajes peligrosos', icon: <MessageSquareWarning className="w-5 h-5" />, desc: 'Recibí mensajes inapropiados, acoso o intento de estafa' },
  { value: 'SYSTEM_ERROR', label: 'Emergencia', icon: <AlertTriangle className="w-5 h-5" />, desc: 'Situación urgente que requiere atención inmediata' },
  { value: 'WRONG_EMAIL', label: 'Consejos de seguridad', icon: <Lock className="w-5 h-5" />, desc: 'Dudas sobre cómo proteger mis datos o visitas' },
];

const SEVERITIES: { value: TicketSeverity; label: string; color: string }[] = [
  { value: 'LOW', label: 'Baja - Consulta', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'MEDIUM', label: 'Media - Preocupación', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'HIGH', label: 'Alta - Urgente', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'CRITICAL', label: 'Crítica - Emergencia', color: 'bg-red-100 text-red-700 border-red-200' },
];

const FAQS = [
  {
    q: '¿Qué hago si alguien vulneró mi cuenta?',
    a: 'Cambia tu contraseña inmediatamente desde la opción "Olvidé mi contraseña" en la pantalla de inicio de sesión. Luego repórtalo a través del formulario de seguridad para que nuestro equipo pueda revisar la actividad sospechosa y proteger tu cuenta.',
  },
  {
    q: '¿Cómo detectar un anuncio fraudulento?',
    a: 'Desconfía de precios muy por debajo del mercado, solicitudes de adelantos o depósitos sin visitar la propiedad, y anunciantes que presionan para cerrar rápido. Verifica siempre que el agente o propietario esté registrado en Tiyuy.',
  },
  {
    q: '¿Cómo reportar un mensaje inseguro o acoso?',
    a: 'No respondas al mensaje. Toma capturas de pantalla como evidencia y repórtalo inmediatamente usando el formulario de seguridad. Nuestro equipo revisará el caso y tomará las medidas necesarias, incluyendo bloquear al usuario si corresponde.',
  },
  {
    q: 'Consejos para visitas seguras',
    a: 'Lleva a alguien de confianza, comparte tu ubicación en tiempo real, verifica la identidad del anunciante, no entregues dinero antes de ver la propiedad, y confirma que la dirección existe antes de ir.',
  },
  {
    q: '¿Cómo proteger mi información personal?',
    a: 'No compartas datos sensibles como DNI, cuentas bancarias o contraseñas fuera de los canales oficiales de Tiyuy. Usa contraseñas seguras y activa la autenticación de dos factores si está disponible.',
  },
  {
    q: '¿Qué hacer en una emergencia durante una visita?',
    a: 'Si te sientes inseguro durante una visita, retírate del lugar inmediatamente. Contacta a las autoridades locales (105) y luego repórtalo en Tiyuy para que tomemos acciones contra el anunciante.',
  },
];

export default function SeguridadPage() {
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  const [step, setStep] = useState<'info' | 'category' | 'form' | 'success'>('info');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<TicketSeverity>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const createMutation = useCreateSupportTicket();

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setStep('form');
  };

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
      setError('Debes aceptar los términos para enviar el reporte');
      return;
    }
    setError('');
    try {
      const request: any = {
        subject: `[SEGURIDAD] ${subject.trim()}`,
        description: description.trim(),
        category: selectedCategory!,
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
      setError('Error al enviar el reporte. Intenta de nuevo.');
    }
  };

  const handleBack = () => {
    if (step === 'form') {
      setStep('category');
      setError('');
    } else if (step === 'category') {
      setStep('info');
    }
  };

  const resetForm = () => {
    setStep('info');
    setSelectedCategory(null);
    setSelectedSeverity('MEDIUM');
    setSubject('');
    setDescription('');
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setAcceptedTerms(false);
    setError('');
    setExpandedFaq(null);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-orange-600 text-white">
        <div className="max-w-8xl mx-auto px-4 py-16">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Opciones de Seguridad</h1>
              <p className="text-white/80 mt-1">Protege tu cuenta y reporta incidentes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="flex flex-col">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 flex flex-col flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Tu seguridad es lo más importante
                </h2>
                <div className="prose prose-sm text-gray-600 max-w-none flex-1">
                  <p>
                    En Tiyuy trabajamos para que tu experiencia sea segura y confiable. Si detectas
                    actividad sospechosa, crees que tu cuenta fue vulnerada, o encuentras contenido
                    que no parece legítimo, este es el lugar indicado para reportarlo.
                  </p>
                  <p className="mt-3">
                    Nuestro equipo de seguridad revisará cada reporte de forma confidencial y tomará
                    las acciones necesarias para proteger tu cuenta y la de los demás usuarios.
                  </p>
                  <p className="mt-3">
                    También encontrarás consejos prácticos para realizar visitas seguras, identificar
                    anuncios fraudulentos y proteger tu información personal.
                  </p>
                  <p className="mt-3">
                    Si la situación es una emergencia, contacta inmediatamente a las autoridades
                    locales (105) y luego repórtalo en esta sección.
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setStep('category')}
                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-red-600/25"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Reportar incidente de seguridad
                  </button>
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    Todos los reportes son confidenciales y serán revisados por nuestro equipo.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 flex flex-col flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Preguntas de Seguridad
                </h2>
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {FAQS.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-gray-300">
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 text-sm pr-4">{faq.q}</span>
                        {expandedFaq === index ? (
                          <ChevronUp className="w-4 h-4 text-red-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                          <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                          <button
                            onClick={() => setStep('category')}
                            className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
                          >
                            Reportar incidente
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'category' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">¿Qué tipo de incidente?</h2>
                <p className="text-sm text-gray-500 mt-1">Selecciona el que más se acerque a tu situación</p>
              </div>
              <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="grid gap-3">
              {SECURITY_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleSelectCategory(cat.value)}
                  className="flex items-center gap-4 p-5 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-red-100 flex items-center justify-center text-gray-500 group-hover:text-red-600 transition-colors">
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{cat.label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{cat.desc}</p>
                  </div>
                  <div className="w-7 h-7 rounded-full border-2 border-gray-300 group-hover:border-red-500 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full group-hover:bg-red-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Describe el incidente</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {SECURITY_CATEGORIES.find(c => c.value === selectedCategory)?.label}
                </p>
              </div>
              <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              {!isAuthenticated && (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                      No has iniciado sesión. Proporciona tus datos de contacto para que podamos darte seguimiento.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-gray-400">(opcional)</span></label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)}
                          placeholder="Tu nombre" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-gray-400">(opcional)</span></label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                          placeholder="+51 999 999 999" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                        placeholder="tucorreo@ejemplo.com" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
                    </div>
                  </div>
                  <hr className="border-gray-200" />
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Qué tan urgente es?</label>
                <div className="grid grid-cols-2 gap-2">
                  {SEVERITIES.map(sev => (
                    <button key={sev.value} onClick={() => setSelectedSeverity(sev.value)}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${selectedSeverity === sev.value ? `${sev.color} ring-2 ring-offset-1` : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {sev.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto <span className="text-red-500">*</span></label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Ej: Alguien publicó usando mi nombre sin autorización"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Describe el incidente en detalle. Incluye fechas, capturas de pantalla y cualquier evidencia que tengas."
                  rows={5} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all" />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Al enviar este reporte, nuestro equipo de seguridad revisará la información proporcionada
                  y podrá tomar medidas como bloquear usuarios, desactivar publicaciones o escalar el caso
                  a las autoridades si es necesario. Recibirás actualizaciones sobre el estado de tu reporte.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Confirmo que la información proporcionada es verídica y autorizo a Tiyuy a revisar mi caso
                  y tomar las acciones necesarias.
                </span>
              </label>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button onClick={handleBack} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  ← Cambiar tipo
                </button>
                <button onClick={handleSubmit}
                  disabled={!subject.trim() || !description.trim() || !acceptedTerms || createMutation.isPending}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                  {createMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Enviar Reporte</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">¡Reporte enviado!</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-2">
              Hemos recibido tu reporte de seguridad. Nuestro equipo lo revisará de forma confidencial
              y tomará las acciones necesarias.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Recibirás actualizaciones en tu correo y dentro de la plataforma.
            </p>
            <button onClick={resetForm}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all">
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}