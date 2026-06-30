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
      <div className="min-h-screen bg-[var(--bg-secondary)] antialiased flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--bg-card)] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[var(--border-light)] p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6 border border-green-200 dark:border-green-900/30">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3">Solicitud enviada</h2>
          <p className="text-[var(--text-secondary)] font-medium mb-8">Hemos recibido tu solicitud. Nuestro equipo la revisará y te contactará a la brevedad.</p>
          <button onClick={() => setShowSuccess(false)}
            className="px-6 py-3 bg-[var(--brand-primary)] hover:opacity-90 text-[var(--bg-primary)] rounded-xl font-bold transition-all shadow-sm">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] antialiased text-[var(--text-primary)] selection:bg-[var(--brand-primary)]/10">
      {/* Hero */}
      <div className="bg-[var(--bg-primary)] border-b border-[var(--border-light)]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-16 py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-gradient-to-r from-[var(--brand-primary)]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
          <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10 max-w-4xl">
            <div className="w-16 h-16 rounded-2xl bg-[var(--brand-primary)]/10 flex items-center justify-center shrink-0 border border-[var(--border-light)]">
              <CreditCard className="w-8 h-8 text-[var(--brand-primary)]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-[var(--text-primary)] text-balance">
                Cancelaciones y <span className="text-[var(--brand-primary)]">facturación</span>
              </h1>
              <p className="text-[var(--text-secondary)] mt-3 leading-relaxed font-medium text-lg sm:text-xl">
                Planes, publicaciones, destacados y renovaciones
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-16 py-12 space-y-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Política resumen */}
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8 sm:p-10">
            <div className="max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-4">Política de cancelación</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed font-medium">
                En Tiyuy puedes cancelar tu plan, desactivar publicaciones o detener renovaciones en cualquier
                momento, sin multas ni períodos forzosos. La cancelación se hace efectiva al final del ciclo
                de facturación actual, y mantienes acceso a los beneficios hasta esa fecha.
              </p>
            </div>
          </div>

          {/* Reglas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RULES.map((r, i) => (
              <div key={i} className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)] mb-4 border border-[var(--border-light)]">{r.icon}</div>
                <h4 className="font-bold text-[var(--text-primary)] text-base mb-2">{r.title}</h4>
                <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>

          {/* Escenarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CANCEL_SCENARIOS.map((s, i) => (
              <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-3xl p-8 hover:border-[var(--brand-primary)]/30 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-light)] flex items-center justify-center shadow-sm text-[var(--brand-primary)]">{s.icon}</div>
                  <h3 className="text-lg font-black text-[var(--text-primary)]">{s.title}</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed mb-6">{s.desc}</p>
                <Link href={s.href}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-primary)] hover:opacity-80 transition-colors bg-[var(--brand-primary)]/10 px-4 py-2 rounded-lg">
                  {s.action} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              {/* FAQ */}
              <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8 sm:p-10">
                <div className="flex items-center gap-2 mb-6">
                  <HelpCircle className="w-6 h-6 text-[var(--brand-primary)]" />
                  <h2 className="text-2xl font-black text-[var(--text-primary)]">Preguntas frecuentes</h2>
                </div>
                <div className="space-y-4">
                  {FAQS.map((faq, i) => (
                    <div key={i} className="border border-[var(--border-light)] rounded-2xl overflow-hidden hover:border-[var(--brand-primary)]/30 transition-all bg-[var(--bg-card)]">
                      <button onClick={() => toggleFaq(i)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--bg-secondary)] transition-colors">
                        <span className="font-bold text-[var(--text-primary)] text-sm pr-4">{faq.q}</span>
                        {expandedFaq === i ? <ChevronUp className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />}
                      </button>
                      {expandedFaq === i && (
                        <div className="px-5 pb-5 border-t border-[var(--border-light)] pt-4 bg-[var(--bg-secondary)]">
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {/* Formulario de billing */}
              <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8 sm:p-10 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-6 h-6 text-[var(--brand-primary)]" />
                  <h2 className="text-xl font-black text-[var(--text-primary)]">Reportar problema</h2>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-8 font-medium">Si tienes un cargo incorrecto, duplicado o no reconocido, repórtalo aquí.</p>

                {!showForm ? (
                  <button onClick={() => setShowForm(true)}
                    className="w-full px-6 py-4 bg-[var(--brand-primary)] hover:opacity-90 text-[var(--bg-primary)] rounded-xl text-sm font-bold transition-all shadow-sm">
                    Reportar problema de cobro
                  </button>
                ) : (
                  <div className="space-y-6">
                    {!isAuthenticated && (
                      <>
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4">
                          <p className="text-sm text-amber-800 dark:text-amber-400 font-medium leading-relaxed">Proporciona tus datos para revisar tu caso.</p>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Nombre <span className="text-[var(--text-muted)] font-medium">(opcional)</span></label>
                            <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Tu nombre"
                              className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] font-medium transition-all" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Teléfono <span className="text-[var(--text-muted)] font-medium">(opcional)</span></label>
                            <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="+51 999 999 999"
                              className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] font-medium transition-all" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Correo <span className="text-red-500">*</span></label>
                            <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="tucorreo@ejemplo.com"
                              className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] font-medium transition-all" />
                          </div>
                        </div>
                        <hr className="border-[var(--border-light)] my-2" />
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-[var(--text-primary)] mb-3">Tipo de problema</label>
                      <div className="flex flex-wrap gap-2">
                        {[{v:'PAYMENT_ISSUE',l:'Cargo incorrecto'},{v:'PAYMENT_ISSUE',l:'Cargo duplicado'},{v:'PAYMENT_ISSUE',l:'No reconocido'},{v:'PAYMENT_ISSUE',l:'Reembolso'}].map((t, i) => (
                          <button key={i} onClick={() => { setSelectedCategory('PAYMENT_ISSUE'); setSubject(t.l); }}
                            className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${subject === t.l ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border-[var(--brand-primary)]/30' : 'border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)]/30'}`}>{t.l}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Asunto <span className="text-red-500">*</span></label>
                      <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ej: Me cobraron dos veces el plan mensual"
                        className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] font-medium transition-all" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Descripción <span className="text-red-500">*</span></label>
                      <textarea value={description} onChange={e => setDescription(e.target.value)}
                        placeholder="Detalla el problema: fecha del cobro, monto, método de pago, plan afectado y cualquier detalle relevante."
                        rows={4} className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] font-medium transition-all resize-none" />
                    </div>

                    <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border-light)]">
                      <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                        Al enviar esta solicitud, Tiyuy revisará la información proporcionada y se comunicará
                        contigo para resolver el problema. Los ajustes por errores de cobro se procesan en un
                        plazo de 5 a 10 días hábiles.
                      </p>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer group pt-1">
                      <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-[var(--border-light)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] bg-[var(--bg-primary)]" />
                      <span className="text-sm text-[var(--text-secondary)] font-medium group-hover:text-[var(--text-primary)] transition-colors leading-relaxed">
                        Confirmo que la información proporcionada es verídica y autorizo a Tiyuy a revisar mi caso.
                      </span>
                    </label>

                    {error && (
                      <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm font-bold border border-red-200 dark:border-red-900/30">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4 border-t border-[var(--border-light)]">
                      <button onClick={() => setShowForm(false)} className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Cancelar</button>
                      <button onClick={handleSubmit}
                        disabled={!subject.trim() || !description.trim() || !accepted || createMutation.isPending}
                        className="w-full sm:w-auto sm:flex-1 px-6 py-3.5 bg-[var(--brand-primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--bg-primary)] rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
                        {createMutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</> : <><Send className="w-5 h-5" /> Enviar Reporte</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}