/**
 * SupportModal Component
 * Modal elegante para que usuarios de todos los perfiles reporten incidencias de soporte.
 * Se accede desde el footer. La incidencia llega al panel admin (Comunicaciones).
 * Cuando se resuelve, el usuario recibe notificación in-app + email.
 */

'use client';

import { useState } from 'react';
import { useCreateSupportTicket } from '@/presentation/hooks/admin/useSupportTickets';
import { TicketCategory, TicketSeverity } from '@/core/domain/entities/Admin';
import { X, Send, AlertCircle, CheckCircle2, HelpCircle, Mail, Lock, CreditCard, Building2, Settings, Loader2 } from 'lucide-react';

const CATEGORIES: { value: TicketCategory; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'WRONG_EMAIL', label: 'Correo Incorrecto', icon: <Mail className="w-4 h-4" />, desc: 'Actualizar o corregir mi correo electrónico' },
  { value: 'PASSWORD_CHANGE', label: 'Cambio de Contraseña', icon: <Lock className="w-4 h-4" />, desc: 'Problemas para acceder a mi cuenta' },
  { value: 'SYSTEM_ERROR', label: 'Falla del Sistema', icon: <AlertCircle className="w-4 h-4" />, desc: 'Error, pantalla en blanco o mal funcionamiento' },
  { value: 'PAYMENT_ISSUE', label: 'Problema de Pago', icon: <CreditCard className="w-4 h-4" />, desc: 'Problemas con pagos, suscripciones o facturación' },
  { value: 'ACCOUNT_ISSUE', label: 'Problema de Cuenta', icon: <Settings className="w-4 h-4" />, desc: 'Configuración, verificación o datos de mi cuenta' },
  { value: 'PROPERTY_ISSUE', label: 'Problema de Propiedad', icon: <Building2 className="w-4 h-4" />, desc: 'Problemas con una propiedad o proyecto publicado' },
  { value: 'OTHER', label: 'Otro', icon: <HelpCircle className="w-4 h-4" />, desc: 'Consulta general o no listada' },
];

const SEVERITIES: { value: TicketSeverity; label: string; color: string }[] = [
  { value: 'LOW', label: 'Baja - Consulta simple', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'MEDIUM', label: 'Media - Necesito ayuda', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'HIGH', label: 'Alta - Problema urgente', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'CRITICAL', label: 'Crítica - Sistema caído', color: 'bg-red-100 text-red-700 border-red-200' },
];

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [step, setStep] = useState<'category' | 'form' | 'success'>('category');
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<TicketSeverity>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const createMutation = useCreateSupportTicket();

  if (!isOpen) return null;

  const handleSelectCategory = (category: TicketCategory) => {
    setSelectedCategory(category);
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      setError('Completa todos los campos requeridos');
      return;
    }
    setError('');
    try {
      await createMutation.mutateAsync({
        subject: subject.trim(),
        description: description.trim(),
        category: selectedCategory!,
        severity: selectedSeverity,
      });
      setStep('success');
      setTimeout(() => {
        onClose();
        // Reset after close animation
        setTimeout(() => {
          setStep('category');
          setSelectedCategory(null);
          setSelectedSeverity('MEDIUM');
          setSubject('');
          setDescription('');
          setError('');
        }, 300);
      }, 3000);
    } catch (err) {
      setError('Error al enviar la incidencia. Intenta de nuevo.');
    }
  };

  const handleBack = () => {
    setStep('category');
    setSelectedCategory(null);
    setError('');
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('category');
      setSelectedCategory(null);
      setSelectedSeverity('MEDIUM');
      setSubject('');
      setDescription('');
      setError('');
    }, 300);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1693a5]/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[#1693a5]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Centro de Soporte</h2>
                <p className="text-sm text-gray-500">Reporta una incidencia y te ayudaremos</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {step === 'category' && (
              <div>
                <p className="text-sm text-gray-600 mb-4">¿Qué tipo de problema tienes?</p>
                <div className="grid gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleSelectCategory(cat.value)}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#1693a5] hover:bg-[#1693a5]/5 transition-all group text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-[#1693a5]/10 flex items-center justify-center text-gray-500 group-hover:text-[#1693a5] transition-colors">
                        {cat.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{cat.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-[#1693a5] flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full group-hover:bg-[#1693a5] transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'form' && (
              <div className="space-y-5">
                {/* Severity selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">¿Qué tan urgente es?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SEVERITIES.map((sev) => (
                      <button
                        key={sev.value}
                        onClick={() => setSelectedSeverity(sev.value)}
                        className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                          selectedSeverity === sev.value
                            ? `${sev.color} border-current ring-2 ring-offset-1`
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ej: No puedo publicar una propiedad"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#1693a5] focus:border-transparent transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe el problema en detalle. Cuanto más información nos des, más rápido podremos ayudarte."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#1693a5] focus:border-transparent resize-none transition-all"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    ← Cambiar categoría
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!subject.trim() || !description.trim() || createMutation.isPending}
                    className="px-6 py-2.5 bg-[#1693a5] hover:bg-[#137a8a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Incidencia
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Incidencia Reportada!</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Hemos recibido tu reporte. Nuestro equipo de soporte lo revisará y te notificaremos cuando haya una solución.
                </p>
                <p className="text-xs text-gray-400">
                  Recibirás la respuesta en tu correo y dentro de la plataforma.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Tu incidencia será gestionada por nuestro equipo de soporte. Te notificaremos cuando esté resuelta.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
