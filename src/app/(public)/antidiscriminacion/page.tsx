'use client';

import { useState } from 'react';
import { useCreateSupportTicket } from '@/presentation/hooks/admin/useSupportTickets';
import { useAuthStore } from '@/presentation/store/authStore';
import { TicketCategory, TicketSeverity } from '@/core/domain/entities/Admin';
import {
  X, Send, AlertCircle, CheckCircle2, Shield, Loader2, HelpCircle,
  Scale, Users, MessageCircle, Eye, Ban, Flag, ChevronDown, ChevronUp,
  ExternalLink, Mail, Phone, User, Heart, FileText, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

const DISCRIMINATION_CATEGORIES: { value: TicketCategory; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'PROPERTY_ISSUE', label: 'Publicación discriminatoria', icon: <Ban className="w-5 h-5" />, desc: 'Un anuncio contiene lenguaje o condiciones excluyentes' },
  { value: 'OTHER', label: 'Trato discriminatorio', icon: <Users className="w-5 h-5" />, desc: 'Me rechazaron o trataron diferente por quién soy' },
  { value: 'SYSTEM_ERROR', label: 'Mensaje ofensivo', icon: <MessageCircle className="w-5 h-5" />, desc: 'Recibí comentarios inapropiados, humillantes o discriminatorios' },
  { value: 'ACCOUNT_ISSUE', label: 'Símbolos o imágenes de odio', icon: <Eye className="w-5 h-5" />, desc: 'Una publicación incluye contenido ofensivo o excluyente' },
  { value: 'WRONG_EMAIL', label: 'Otra conducta discriminatoria', icon: <Flag className="w-5 h-5" />, desc: 'Otra situación que considero discriminatoria en la plataforma' },
];

const SEVERITIES: { value: TicketSeverity; label: string; color: string }[] = [
  { value: 'HIGH', label: 'Grave - Urgente', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'MEDIUM', label: 'Media - Requiere atención', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'LOW', label: 'Informativo - Consulta', color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const FAQS = [
  {
    q: '¿Qué características están protegidas?',
    a: 'En Tiyuy está prohibido discriminar por raza, color, religión, nacionalidad, origen étnico, discapacidad, sexo, género, identidad de género, expresión de género, orientación sexual, edad, estado civil, situación migratoria, condición socioeconómica, apariencia física o cualquier otra característica protegida por la ley.',
  },
  {
    q: '¿Puedo establecer reglas en mi propiedad?',
    a: 'Sí, siempre que se apliquen por igual a todas las personas interesadas y no sean una excusa para discriminar. Por ejemplo: "No se permiten mascotas" o "No fumar dentro del inmueble" son reglas válidas porque aplican a todos por igual. "No acepto familias con niños" no lo es.',
  },
  {
    q: '¿Qué hace Tiyuy cuando recibe una denuncia?',
    a: 'Nuestro equipo revisa el caso, evalúa la evidencia y puede tomar medidas que van desde solicitar la modificación del contenido hasta la suspensión definitiva de la cuenta. Dependiendo de la gravedad, también podemos reportar el caso a las autoridades competentes.',
  },
  {
    q: '¿Puedo denunciar de forma anónima?',
    a: 'Sí, aceptamos denuncias anónimas. Sin embargo, proporcionar tus datos de contacto nos permite darte seguimiento y notificarte sobre las acciones tomadas.',
  },
  {
    q: '¿Qué no se considera discriminación?',
    a: 'No se considera discriminación establecer requisitos objetivos y aplicables a todos, como capacidad de pago, referencias verificables, políticas de mascotas o no fumar, siempre que no se usen como pretexto para excluir a grupos protegidos.',
  },
];

const PROHIBITED_CONDUCTS = [
  {
    title: 'Trato diferenciado',
    desc: 'Rechazar, condicionar o dar un trato distinto a una persona basándose en una característica protegida.',
    example: '"No alquilo a extranjeros", "Solo para familias tradicionales", "No aceptamos personas con discapacidad".',
  },
  {
    title: 'Lenguaje discriminatorio',
    desc: 'Usar términos ofensivos, estereotipos o expresiones que denigren a una persona o grupo en descripciones, mensajes o durante visitas.',
    example: '"Zona segura, sin problemas", "Solo personas serias y de buena familia", comentarios sobre origen o apariencia.',
  },
  {
    title: 'Condiciones excluyentes',
    desc: 'Establecer requisitos que en la práctica excluyan a ciertos grupos sin una razón objetiva.',
    example: '"Se requiere DNI peruano", "No aceptamos parejas del mismo sexo", "Solo peruanos".',
  },
  {
    title: 'Símbolos o imágenes ofensivas',
    desc: 'Publicar imágenes, símbolos o mensajes que promuevan odio, exclusión o discriminación.',
    example: 'Símbolos religiosos excluyentes, imágenes que denigren a grupos, mensajes con contenido de odio.',
  },
  {
    title: 'Reglas neutras con efecto discriminatorio',
    desc: 'Aplicar reglas que parecen neutrales pero que en la práctica afectan desproporcionadamente a ciertos grupos.',
    example: 'Exigir referencias laborales que solo ciertos grupos pueden obtener, o requisitos de ingreso que excluyen indirectamente.',
  },
];

export default function AntidiscriminacionPage() {
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  const [step, setStep] = useState<'info' | 'form' | 'success'>('info');
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory>('PROPERTY_ISSUE');
  const [selectedSeverity, setSelectedSeverity] = useState<TicketSeverity>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [reportedUser, setReportedUser] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [preferredChannel, setPreferredChannel] = useState('EMAIL');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedConduct, setExpandedConduct] = useState<number | null>(null);

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
      setError('Debes aceptar los términos para enviar la denuncia');
      return;
    }
    setError('');
    try {
      const request: any = {
        subject: `[DISCRIMINACION] ${subject.trim()}`,
        description: `Denunciado: ${reportedUser || 'No especificado'}\nFecha: ${incidentDate || 'No especificada'}\nCanal preferido: ${preferredChannel}\n\n${description.trim()}`,
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
      setError('Error al enviar la denuncia. Intenta de nuevo.');
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-8xl mx-auto px-4 py-16">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Nuestra política antidiscriminación</h1>
              <p className="text-white/80 mt-1">Compromiso con la igualdad, el respeto y la inclusión</p>
            </div>
          </div>
        </div>
      </div>

      {step === 'info' && (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Introducción */}
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Nuestro compromiso</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Una comunidad basada en el respeto</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  En Tiyuy creemos que todas las personas merecen ser tratadas con dignidad, respeto e igualdad.
                  Construimos una plataforma donde la diversidad es valorada y donde nadie debe ser excluido,
                  rechazado o tratado de manera diferente por quien es.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Esta política aplica a todas las interacciones dentro de Tiyuy: publicaciones, mensajes,
                  visitas, negociaciones, comentarios y cualquier otra forma de comunicación entre usuarios
                  de la plataforma. El incumplimiento de esta política puede resultar en la suspensión
                  temporal o definitiva de la cuenta, además de las acciones legales que correspondan.
                </p>
              </div>
            </div>
          </div>

          {/* Conductas prohibidas */}
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8">
            <div className="flex items-center gap-2 mb-4">
              <Ban className="w-5 h-5 text-red-600" />
              <span className="text-xs font-semibold text-red-600 uppercase tracking-widest">Prohibido</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Conductas prohibidas</h2>
            <div className="space-y-3">
              {PROHIBITED_CONDUCTS.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all">
                  <button
                    onClick={() => setExpandedConduct(expandedConduct === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Ban className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    {expandedConduct === idx ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedConduct === idx && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                      <div className="bg-red-50 rounded-xl p-4 ml-11">
                        <p className="text-sm text-gray-700 font-medium mb-1">Ejemplo:</p>
                        <p className="text-sm text-red-700 italic">{item.example}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Criterios válidos */}
            <div className="mt-8 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Sí está permitido</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Criterios que sí pueden aplicarse</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                No se considera discriminación establecer requisitos objetivos que se apliquen por igual
                a todas las personas, como: verificar capacidad de pago, solicitar referencias, establecer
                reglas de convivencia (no mascotas, no fumar), exigir depósito de garantía, o verificar
                identidad. Lo importante es que estos criterios no sean utilizados como pretexto para
                excluir a grupos protegidos.
              </p>
            </div>
          </div>

          {/* Cómo actuamos */}
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Acciones</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cómo actuamos frente a la discriminación</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: <Eye className="w-5 h-5" />, title: 'Revisión', desc: 'Analizamos cada denuncia y evaluamos la evidencia presentada.' },
                { icon: <Ban className="w-5 h-5" />, title: 'Remoción', desc: 'Eliminamos contenido que viole esta política.' },
                { icon: <FileText className="w-5 h-5" />, title: 'Límites', desc: 'Restringimos publicaciones o funcionalidades según el caso.' },
                { icon: <Users className="w-5 h-5" />, title: 'Suspensión', desc: 'Suspendemos cuentas de forma temporal o definitiva.' },
                { icon: <ShieldAlert className="w-5 h-5" />, title: 'Bloqueo', desc: 'Bloqueamos usuarios reincidentes o casos graves.' },
                { icon: <Scale className="w-5 h-5" />, title: 'Acción legal', desc: 'Derivamos a las autoridades cuando corresponde.' },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
                    {item.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Preguntas</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas frecuentes</h2>
            <div className="space-y-3">
              {FAQS.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-gray-300">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 text-sm pr-4">{faq.q}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                      <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">¿Presencias o sufriste discriminación?</h2>
            <p className="text-indigo-100 text-sm max-w-lg mx-auto mb-6">
              Tu denuncia es confidencial. Nuestro equipo la revisará y tomará las acciones necesarias.
            </p>
            <button
              onClick={() => setStep('form')}
              className="px-8 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all shadow-lg inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Denunciar ahora
            </button>
          </div>
        </div>
      )}

      {/* Formulario */}
      {step === 'form' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Formulario de denuncia</h2>
                <p className="text-sm text-gray-500 mt-1">Todos los campos marcados con * son obligatorios</p>
              </div>
              <button onClick={() => setStep('info')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              {!isAuthenticated && (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">Puedes denunciar de forma anónima, pero si nos dejas tus datos podremos darte seguimiento.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-gray-400">(opcional)</span></label>
                      <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)}
                        placeholder="Tu nombre" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-gray-400">(opcional)</span></label>
                      <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                        placeholder="+51 999 999 999" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico <span className="text-red-500">*</span></label>
                    <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <hr className="border-gray-200" />
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de incidente</label>
                <div className="grid gap-2">
                  {DISCRIMINATION_CATEGORIES.map(cat => (
                    <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                        selectedCategory === cat.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedCategory === cat.value ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                      }`}>{cat.icon}</div>
                      <div><p className="font-medium">{cat.label}</p><p className="text-xs text-gray-400">{cat.desc}</p></div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuario/anuncio relacionado <span className="text-gray-400">(opcional)</span></label>
                  <input type="text" value={reportedUser} onChange={e => setReportedUser(e.target.value)}
                    placeholder="Nombre, ID o URL del anuncio" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del hecho <span className="text-gray-400">(opcional)</span></label>
                  <input type="date" value={incidentDate} onChange={e => setIncidentDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto <span className="text-red-500">*</span></label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Ej: Publicación con lenguaje discriminatorio" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción detallada <span className="text-red-500">*</span></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Describe lo sucedido con el mayor detalle posible. Incluye fechas, lugares, personas involucradas y cualquier detalle relevante."
                  rows={5} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Qué tan grave es?</label>
                <div className="flex gap-2">
                  {SEVERITIES.map(sev => (
                    <button key={sev.value} onClick={() => setSelectedSeverity(sev.value)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        selectedSeverity === sev.value ? `${sev.color} ring-2 ring-offset-1` : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>{sev.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Cómo prefieres que te contactemos? <span className="text-gray-400">(opcional)</span></label>
                <div className="flex gap-2">
                  {[{v:'EMAIL',l:'Email'},{v:'PHONE',l:'Teléfono'},{v:'WHATSAPP',l:'WhatsApp'},{v:'NINGUNO',l:'No contactar'}].map(ch => (
                    <button key={ch.v} onClick={() => setPreferredChannel(ch.v)}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        preferredChannel === ch.v ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>{ch.l}</button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Al enviar esta denuncia, autorizas a Tiyuy a revisar la información proporcionada y tomar
                  las medidas necesarias, incluyendo la revisión de publicaciones, mensajes y cuentas
                  relacionadas con el incidente. Tu identidad será mantenida en confidencialidad en la
                  medida de lo posible.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Confirmo que la información proporcionada es verídica y autorizo a Tiyuy a investigar mi denuncia.
                </span>
              </label>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep('info')} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  ← Volver
                </button>
                <button onClick={handleSubmit}
                  disabled={!subject.trim() || !description.trim() || !acceptedTerms || createMutation.isPending}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                  {createMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Enviar Denuncia</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Denuncia recibida</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-2">
              Hemos recibido tu denuncia. Nuestro equipo la revisará de forma confidencial y tomará
              las acciones necesarias.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Recibirás actualizaciones en tu correo y dentro de la plataforma.
            </p>
            <button onClick={() => setStep('info')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all">
              Volver al inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}