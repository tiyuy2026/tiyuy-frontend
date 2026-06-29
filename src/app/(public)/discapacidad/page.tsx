'use client';

import { useState } from 'react';
import { useCreateSupportTicket } from '@/presentation/hooks/admin/useSupportTickets';
import { useAuthStore } from '@/presentation/store/authStore';
import { TicketCategory, TicketSeverity } from '@/core/domain/entities/Admin';
import {
  X, Send, AlertCircle, CheckCircle2, Shield, Loader2, HelpCircle,
  Scale, Users, Eye, ChevronDown, ChevronUp, Heart, Accessibility,
  DoorOpen, ChevronLeft, ChevronRight, Car, Volume2, Braces, Monitor
} from 'lucide-react';
import Link from 'next/link';

const SUPPORT_TYPES: { value: TicketCategory; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'PROPERTY_ISSUE', label: 'Información de accesibilidad', icon: <DoorOpen className="w-5 h-5" />, desc: 'Solicitar detalles sobre accesos, baños o rutas de una propiedad' },
  { value: 'OTHER', label: 'Ajuste razonable en visita', icon: <Users className="w-5 h-5" />, desc: 'Necesito apoyo adicional para realizar una visita presencial' },
  { value: 'SYSTEM_ERROR', label: 'Apoyo en plataforma', icon: <Monitor className="w-5 h-5" />, desc: 'Dificultad para usar la web o app por mi condición' },
  { value: 'WRONG_EMAIL', label: 'Reportar falta de accesibilidad', icon: <Eye className="w-5 h-5" />, desc: 'Un anuncio no informa correctamente sus condiciones de acceso' },
  { value: 'ACCOUNT_ISSUE', label: 'Otra solicitud', icon: <HelpCircle className="w-5 h-5" />, desc: 'Otro tipo de apoyo relacionado con accesibilidad' },
];

const ACCESSIBILITY_FEATURES = [
  { icon: <ChevronLeft className="w-5 h-5" />, title: 'Acceso sin escalones', desc: 'Entrada principal a nivel de calle o con rampa' },
  { icon: <DoorOpen className="w-5 h-5" />, title: 'Puertas anchas', desc: 'Puertas de al menos 80 cm de ancho para silla de ruedas' },
  { icon: <Accessibility className="w-5 h-5" />, title: 'Baño accesible', desc: 'Baño con barras de apoyo, ducha a nivel y espacio de giro' },
  { icon: <Car className="w-5 h-5" />, title: 'Estacionamiento accesible', desc: 'Espacio de estacionamiento reservado y cercano al ingreso' },
  { icon: <ChevronRight className="w-5 h-5" />, title: 'Rutas despejadas', desc: 'Pasillos y circulaciones libres de obstáculos' },
  { icon: <Volume2 className="w-5 h-5" />, title: 'Señalización clara', desc: 'Información visible, contrastes adecuados y señales táctiles' },
];

const FAQS = [
  {
    q: '¿Puedo solicitar información de accesibilidad antes de visitar?',
    a: 'Sí. Puedes usar el formulario de esta página para solicitar detalles específicos sobre accesibilidad de cualquier propiedad publicada en Tiyuy. Nos comunicaremos con el anunciante para obtener la información y te la haremos llegar.',
  },
  {
    q: '¿Qué tipo de ajustes razonables puedo solicitar?',
    a: 'Desde apoyo para realizar una visita (acompañamiento, intérprete, material en braille) hasta solicitar que el anunciante proporcione información detallada sobre medidas, accesos y condiciones del inmueble.',
  },
  {
    q: '¿Cuánto tiempo tarda una solicitud?',
    a: 'Nuestro equipo revisa cada solicitud en un plazo máximo de 48 horas hábiles y coordina con el anunciante la respuesta. Casos urgentes pueden priorizarse indicando la gravedad en el formulario.',
  },
  {
    q: '¿Los anunciantes están obligados a responder?',
    a: 'Tiyuy recomienda y espera que todos los anunciantes proporcionen información veraz sobre accesibilidad. Si un anunciante no responde o la información es incorrecta, puedes reportarlo y tomaremos las medidas correspondientes.',
  },
  {
    q: '¿Puedo denunciar si un anuncio miente sobre accesibilidad?',
    a: 'Sí. Usa la opción "Reportar falta de accesibilidad" en el formulario. Investigaremos el caso y, si se confirma la información falsa, tomaremos acciones que pueden incluir la suspensión del anuncio.',
  },
];

export default function DiscapacidadPage() {
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
  const [propertyLink, setPropertyLink] = useState('');
  const [supportDate, setSupportDate] = useState('');
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
        subject: `[DISCAPACIDAD] ${subject.trim()}`,
        description: `Propiedad: ${propertyLink || 'No especificada'}\nFecha: ${supportDate || 'No especificada'}\nCanal: ${preferredChannel}\n\n${description.trim()}`,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-teal-600 text-white">
        <div className="max-w-8xl mx-auto px-4 py-16">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Accessibility className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Apoyo a personas con discapacidad</h1>
              <p className="text-white/80 mt-1">Accesibilidad, inclusión y acompañamiento para todos</p>
            </div>
          </div>
        </div>
      </div>

      {step === 'info' && (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Compromiso */}
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-sky-600" />
                <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest">Nuestro compromiso</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Una plataforma para todos</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  En Tiyuy creemos que encontrar un hogar es un derecho, no un privilegio. Trabajamos para
                  que nuestra plataforma sea accesible, inclusiva y útil para todas las personas,
                  independientemente de sus capacidades.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Nadie puede ser discriminado por su discapacidad en Tiyuy. Todos los anunciantes deben
                  describir de forma honesta y clara las condiciones de accesibilidad de sus propiedades.
                  Si necesitas información adicional o apoyo para realizar una visita, estamos aquí para ayudarte.
                </p>
              </div>
            </div>
          </div>

          {/* Apoyo disponible */}
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-sky-600" />
              <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest">Apoyo disponible</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Qué tipo de apoyo puedes solicitar?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: <DoorOpen className="w-5 h-5" />, title: 'Info de accesibilidad', desc: 'Detalles sobre accesos, baños, estacionamiento y rutas de una propiedad.' },
                { icon: <Users className="w-5 h-5" />, title: 'Acompañamiento en visita', desc: 'Solicita apoyo adicional para realizar una visita presencial.' },
                { icon: <Volume2 className="w-5 h-5" />, title: 'Comunicación accesible', desc: 'Información en braille, letra grande, audio o formato adaptado.' },
                { icon: <Monitor className="w-5 h-5" />, title: 'Apoyo en plataforma', desc: 'Asistencia para navegar, publicar o contactar en la web o app.' },
                { icon: <Eye className="w-5 h-5" />, title: 'Reportar incumplimiento', desc: 'Denunciar anuncios que no informan correctamente su accesibilidad.' },
                { icon: <HelpCircle className="w-5 h-5" />, title: 'Otro ajuste razonable', desc: 'Cualquier otra solicitud que necesites para participar en igualdad de condiciones.' },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 mb-3">{item.icon}</div>
                  <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Accesibilidad en anuncios */}
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8">
            <div className="flex items-center gap-2 mb-4">
              <Accessibility className="w-5 h-5 text-sky-600" />
              <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest">Anuncios accesibles</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Características que un anuncio debería informar</h2>
            <p className="text-sm text-gray-500 mb-6">
              Los anunciantes deben describir con claridad las condiciones de accesibilidad de sus
              propiedades para que puedas tomar decisiones informadas.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACCESSIBILITY_FEATURES.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">{feat.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{feat.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-sky-600" />
              <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest">Preguntas</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas frecuentes</h2>
            <div className="space-y-3">
              {FAQS.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-gray-300">
                  <button onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-gray-900 text-sm pr-4">{faq.q}</span>
                    {expandedFaq === index ? <ChevronUp className="w-4 h-4 text-sky-600 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
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
          <div className="bg-gradient-to-br from-sky-600 to-teal-700 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Accessibility className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">¿Necesitas apoyo o información?</h2>
            <p className="text-sky-100 text-sm max-w-lg mx-auto mb-6">
              Estamos aquí para ayudarte. Cuéntanos qué necesitas y te responderemos a la brevedad.
            </p>
            <button onClick={() => setStep('form')}
              className="px-8 py-3 bg-white text-sky-700 font-semibold rounded-xl hover:bg-sky-50 transition-all shadow-lg inline-flex items-center gap-2">
              <Send className="w-4 h-4" />
              Solicitar apoyo
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
                <h2 className="text-xl font-semibold text-gray-900">Solicitar apoyo</h2>
                <p className="text-sm text-gray-500 mt-1">Cuéntanos qué necesitas y te ayudaremos</p>
              </div>
              <button onClick={() => setStep('info')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              {!isAuthenticated && (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">Si nos dejas tus datos podremos darte seguimiento personalizado.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-gray-400">(opcional)</span></label>
                      <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)}
                        placeholder="Tu nombre" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-gray-400">(opcional)</span></label>
                      <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                        placeholder="+51 999 999 999" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico <span className="text-red-500">*</span></label>
                    <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                  </div>
                  <hr className="border-gray-200" />
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de apoyo</label>
                <div className="grid gap-2">
                  {SUPPORT_TYPES.map(cat => (
                    <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                        selectedCategory === cat.value ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedCategory === cat.value ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'}`}>{cat.icon}</div>
                      <div><p className="font-medium">{cat.label}</p><p className="text-xs text-gray-400">{cat.desc}</p></div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Propiedad relacionada <span className="text-gray-400">(opcional)</span></label>
                  <input type="text" value={propertyLink} onChange={e => setPropertyLink(e.target.value)}
                    placeholder="URL o nombre del anuncio" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de necesidad <span className="text-gray-400">(opcional)</span></label>
                  <input type="date" value={supportDate} onChange={e => setSupportDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto <span className="text-red-500">*</span></label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Ej: Necesito información sobre accesibilidad de un departamento" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Cuéntanos qué necesitas con el mayor detalle posible. Por ejemplo: tipo de apoyo, fechas estimadas, preguntas específicas sobre la propiedad, etc."
                  rows={5} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgencia</label>
                <div className="flex gap-2">
                  {[{v:'LOW',l:'Baja',c:'bg-gray-100 text-gray-700 border-gray-200'},{v:'MEDIUM',l:'Media',c:'bg-yellow-100 text-yellow-700 border-yellow-200'},{v:'HIGH',l:'Alta',c:'bg-orange-100 text-orange-700 border-orange-200'},{v:'CRITICAL',l:'Urgente',c:'bg-red-100 text-red-700 border-red-200'}].map(sev => (
                    <button key={sev.v} onClick={() => setSelectedSeverity(sev.v as TicketSeverity)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        selectedSeverity === sev.v ? `${sev.c} ring-2 ring-offset-1` : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>{sev.l}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Cómo prefieres que te contactemos? <span className="text-gray-400">(opcional)</span></label>
                <div className="flex gap-2">
                  {[{v:'EMAIL',l:'Email'},{v:'PHONE',l:'Teléfono'},{v:'WHATSAPP',l:'WhatsApp'}].map(ch => (
                    <button key={ch.v} onClick={() => setPreferredChannel(ch.v)}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        preferredChannel === ch.v ? 'bg-sky-50 text-sky-700 border-sky-200' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>{ch.l}</button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Al enviar esta solicitud, autorizas a Tiyuy a revisar la información proporcionada y
                  coordinar con el anunciante si es necesario. Tu identidad y datos serán tratados de
                  forma confidencial.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Acepto que Tiyuy gestione mi solicitud y se comunique conmigo para brindarme apoyo.
                </span>
              </label>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep('info')} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">← Volver</button>
                <button onClick={handleSubmit}
                  disabled={!subject.trim() || !description.trim() || !acceptedTerms || createMutation.isPending}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                  {createMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar Solicitud</>}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Solicitud recibida</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-2">
              Hemos recibido tu solicitud. Nuestro equipo la revisará y te contactará a la brevedad
              para brindarte el apoyo que necesitas.
            </p>
            <p className="text-sm text-gray-400 mb-8">Recibirás actualizaciones en tu correo.</p>
            <button onClick={() => setStep('info')}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium transition-all">Volver al inicio</button>
          </div>
        </div>
      )}
    </div>
  );
}