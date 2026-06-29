'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  X, Send, AlertCircle, CheckCircle2, Shield, Loader2, HelpCircle,
  CalendarX, RotateCcw, RefreshCw, FileText, Users, DollarSign,
  ChevronDown, ChevronUp, ExternalLink, Mail, Phone, User, CreditCard,
  Building, Star, Clock, Ban, ArrowRight
} from 'lucide-react';
import { useCreateSupportTicket } from '@/presentation/hooks/admin/useSupportTickets';
import { useAuthStore } from '@/presentation/store/authStore';
import { TicketCategory, TicketSeverity } from '@/core/domain/entities/Admin';

const CANCEL_SCENARIOS = [
  {
    title: 'Cancelar plan mensual o anual',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'bg-indigo-50 text-indigo-600',
    desc: 'Puedes cancelar tu plan en cualquier momento. La cancelación se hace efectiva al final del período ya facturado. Sigues accediendo a los beneficios hasta esa fecha.',
    action: 'Ir a Mis Planes',
    href: '/dashboard/planes',
  },
  {
    title: 'Desactivar renovación automática',
    icon: <RefreshCw className="w-5 h-5" />,
    color: 'bg-amber-50 text-amber-600',
    desc: 'Si no quieres que tu plan se renueve al finalizar el ciclo, puedes desactivar la renovación automática desde tu panel. Tu plan seguirá activo hasta el final del período pagado.',
    action: 'Ir a Configuración',
    href: '/dashboard/preferences',
  },
  {
    title: 'Desactivar publicación activa',
    icon: <Building className="w-5 h-5" />,
    color: 'bg-sky-50 text-sky-600',
    desc: 'Puedes pausar o desactivar una publicación en cualquier momento. La propiedad dejará de ser visible, pero conservas el derecho a reactivarla dentro del ciclo de facturación si tu plan lo permite.',
    action: 'Ir a Mis Propiedades',
    href: '/my-properties',
  },
  {
    title: 'Detener o no renovar destacado',
    icon: <Star className="w-5 h-5" />,
    color: 'bg-rose-50 text-rose-600',
    desc: 'Si tienes una promoción o destacado activo, puedes optar por no renovarlo al finalizar su período. El destacado seguirávisible hasta que termine el tiempo contratado.',
    action: 'Ir a Mis Propiedades',
    href: '/my-properties',
  },
];

const RULES = [
  { icon: <CheckCircle2 className="w-5 h-5" />, title: 'Cancelas cuando quieras', desc: 'No hay períodos forzosos ni penalizaciones por cancelar anticipadamente.' },
  { icon: <Clock className="w-5 h-5" />, title: 'Vigencia hasta fin de ciclo', desc: 'La cancelación se hace efectiva al final del período ya pagado. Sigues disfrutando del servicio hasta esa fecha.' },
  { icon: <DollarSign className="w-5 h-5" />, title: 'Sin reembolso parcial', desc: 'No realizamos reembolsos proporcionales por tiempo no usado, salvo errores de cobro comprobados.' },
  { icon: <Shield className="w-5 h-5" />, title: 'Excepciones', desc: 'Errores de facturación, cargos duplicados o problemas técnicos comprobados sí son revisados para reembolso.' },
];

const FAQS = [
  {
    q: '¿Puedo cancelar mi plan en cualquier momento?',
    a: 'Sí. No hay contratos forzosos. Puedes cancelar cuando quieras desde tu panel o contactando a soporte. La cancelación se hace efectiva al final del ciclo de facturación actual.',
  },
  {
    q: 'Si cancelo, ¿pierdo el acceso inmediatamente?',
    a: 'No. Sigues teniendo acceso completo a los beneficios de tu plan hasta el último día del período ya pagado. No se pierde nada de forma anticipada.',
  },
  {
    q: '¿Hay reembolso si cancelo antes de que termine el mes?',
    a: 'No. Por política, no realizamos reembolsos parciales por tiempo no utilizado. El servicio se mantiene activo hasta el final del ciclo facturado.',
  },
  {
    q: '¿Qué pasa con mis publicaciones si cancelo el plan?',
    a: 'Al cancelar tu plan, las publicaciones activas pasarán a estado "pausado" al finalizar el ciclo. Podrás reactivarlas si contratas un nuevo plan después.',
  },
  {
    q: '¿Puedo desactivar la renovación automática?',
    a: 'Sí. Desde tu panel de configuración puedes desactivar la renovación automática. Tu plan seguirá activo hasta el final del período pagado y no se renovará.',
  },
  {
    q: '¿Qué hago si me cobraron de más o hubo un error?',
    a: 'Si identificas un cargo incorrecto, duplicado o no autorizado, repórtalo usando el formulario de esta sección. Nuestro equipo revisa y procesa los ajustes en un plazo de 5 a 10 días hábiles.',
  },
  {
    q: '¿Puedo cancelar una solicitud de destacado antes de que se active?',
    a: 'Sí. Si solicitaste un destacado o promoción y aún no se ha activado, puedes cancelarlo sin costo. Una vez activo, se mantiene hasta el final del período contratado.',
  },
];

export default function CancelacionPage() {
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory>('PAYMENT_ISSUE');
  const [selectedSeverity, setSelectedSeverity] = useState<TicketSeverity>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);

  const createMutation = useCreateSupportTicket();

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) { setError('Completa todos los campos requeridos'); return; }
    if (!isAuthenticated && !guestEmail.trim()) { setError('Debes proporcionar tu correo para que podamos contactarte'); return; }
    if (!accepted) { setError('Debes aceptar los términos para enviar la solicitud'); return; }
    setError('');
    try {
      const request: any = {
        subject: `[CANCELACION] ${subject.trim()}`,
        description: description.trim(),
        category: selectedCategory,
        severity: selectedSeverity,
      };
      if (!isAuthenticated) {
        request.guestName = guestName.trim() || undefined;
        request.guestEmail = guestEmail.trim() || undefined;
        request.guestPhone = guestPhone.trim() || undefined;
      }
      await createMutation.mutateAsync(request);
      setShowForm(false);
      setShowSuccess(true);
    } catch { setError('Error al enviar la solicitud. Intenta de nuevo.'); }
  };

  const toggleFaq = (i: number) => setExpandedFaq(expandedFaq === i ? null : i);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Solicitud enviada</h2>
          <p className="text-gray-600 mb-8">Hemos recibido tu solicitud. Nuestro equipo la revisará y te contactará a la brevedad.</p>
          <button onClick={() => setShowSuccess(false)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Cancelaciones y facturación</h1>
              <p className="text-white/80 mt-1">Planes, publicaciones, destacados y renovaciones</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Política resumen */}
        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Política de cancelación</h2>
            <p className="text-gray-600 leading-relaxed">
              En Tiyuy puedes cancelar tu plan, desactivar publicaciones o detener renovaciones en cualquier
              momento, sin multas ni períodos forzosos. La cancelación se hace efectiva al final del ciclo
              de facturación actual, y mantienes acceso a los beneficios hasta esa fecha.
            </p>
          </div>
        </div>

        {/* Reglas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RULES.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">{r.icon}</div>
              <h4 className="font-semibold text-gray-900 text-sm">{r.title}</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>

        {/* Escenarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CANCEL_SCENARIOS.map((s, i) => (
            <div key={i} className={`${s.color} rounded-2xl p-6`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center">{s.icon}</div>
                <h3 className="font-semibold text-gray-900">{s.title}</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">{s.desc}</p>
              <Link href={s.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-800 transition-colors">
                {s.action} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all">
                <button onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900 text-sm pr-4">{faq.q}</span>
                  {expandedFaq === i ? <ChevronUp className="w-4 h-4 text-indigo-600 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Formulario de billing */}
        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Reportar problema de facturación</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Si tienes un cargo incorrecto, duplicado o no reconocido, repórtalo aquí.</p>

          {!showForm ? (
            <button onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all">
              Reportar problema de cobro
            </button>
          ) : (
            <div className="space-y-5 max-w-2xl">
              {!isAuthenticated && (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">Proporciona tus datos para que podamos revisar tu caso.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-gray-400">(opcional)</span></label>
                      <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Tu nombre"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-gray-400">(opcional)</span></label>
                      <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="+51 999 999 999"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo <span className="text-red-500">*</span></label>
                    <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="tucorreo@ejemplo.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <hr className="border-gray-200" />
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de problema</label>
                <div className="flex flex-wrap gap-2">
                  {[{v:'PAYMENT_ISSUE',l:'Cargo incorrecto'},{v:'PAYMENT_ISSUE',l:'Cargo duplicado'},{v:'PAYMENT_ISSUE',l:'No reconocido'},{v:'PAYMENT_ISSUE',l:'Reembolso'}].map((t, i) => (
                    <button key={i} onClick={() => { setSelectedCategory('PAYMENT_ISSUE'); setSubject(t.l); }}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${subject === t.l ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{t.l}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto <span className="text-red-500">*</span></label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ej: Me cobraron dos veces el plan mensual"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Detalla el problema: fecha del cobro, monto, método de pago, plan afectado y cualquier detalle relevante."
                  rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Al enviar esta solicitud, Tiyuy revisará la información proporcionada y se comunicará
                  contigo para resolver el problema. Los ajustes por errores de cobro se procesan en un
                  plazo de 5 a 10 días hábiles.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Confirmo que la información proporcionada es verídica y autorizo a Tiyuy a revisar mi caso.
                </span>
              </label>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">Cancelar</button>
                <button onClick={handleSubmit}
                  disabled={!subject.trim() || !description.trim() || !accepted || createMutation.isPending}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                  {createMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}