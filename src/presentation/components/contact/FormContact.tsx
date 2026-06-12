'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

interface FormData {
    fullName: string;
    emailAddress: string;
    procedureType: string;
    messageText: string;
}

interface FormErrors {
    fullName?: string;
    emailAddress?: string;
    procedureType?: string;
    messageText?: string;
}

export default function FormContact() {
    // 1. Estados para el manejo de datos, errores y carga
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        emailAddress: '',
        procedureType: '',
        messageText: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

    // 2. Manejador de cambios reactivos en inputs
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;

        // Mapeamos el id del HTML a la propiedad del estado correspondiente
        const fieldMap: Record<string, keyof FormData> = {
            'full-name': 'fullName',
            'email-address': 'emailAddress',
            'procedure-type': 'procedureType',
            'message-text': 'messageText',
        };

        const field = fieldMap[id];
        if (field) {
            setFormData((prev) => ({ ...prev, [field]: value }));
            // Limpiamos el error del campo en tiempo real si el usuario ya está escribiendo
            if (errors[field]) {
                setErrors((prev) => ({ ...prev, [field]: undefined }));
            }
        }
    };

    // 3. Validación de campos del lado del cliente
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'El nombre completo es obligatorio.';
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = 'El nombre debe tener al menos 3 caracteres.';
        }

        if (!formData.emailAddress.trim()) {
            newErrors.emailAddress = 'El correo electrónico es requerido.';
        } else if (!emailRegex.test(formData.emailAddress)) {
            newErrors.emailAddress = 'Ingresa un correo electrónico válido.';
        }

        if (!formData.procedureType) {
            newErrors.procedureType = 'Por favor, selecciona un tipo de trámite.';
        }

        if (!formData.messageText.trim()) {
            newErrors.messageText = 'La descripción de tu consulta es obligatoria.';
        } else if (formData.messageText.trim().length < 10) {
            newErrors.messageText = 'Por favor, detalla un poco más tu consulta (mínimo 10 caracteres).';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 4. Envío del formulario
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Simulación de petición API (reemplazar por tu fetch/axios correspondiente)
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setSubmitSuccess(true);
            setFormData({ fullName: '', emailAddress: '', procedureType: '', messageText: '' });
        } catch (error) {
            console.error('Error enviando consulta:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mt-12 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-light)] overflow-hidden shadow-sm transition-colors duration-300">

            {/* Encabezado del Formulario */}
            <div className="p-6 sm:p-10 border-b border-[var(--border-light)] bg-[var(--brand-primary)]/[0.02] text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)] mb-2">
                    Asesoría
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                    ¿Necesitas Asesoría Legal?
                </h2>
                <p className="mt-2 text-[var(--text-secondary)] text-base max-w-xl mx-auto font-medium leading-relaxed">
                    Contáctanos para orientación en trámites inmobiliarios. Nuestro equipo se pondrá en contacto contigo.
                </p>
            </div>

            <div className="p-6 sm:p-10 max-w-3xl mx-auto">
                {submitSuccess ? (
                    /* Mensaje de Éxito Premium */
                    <div className="text-center py-8 space-y-4 animate-fade-in">
                        <div className="w-16 h-16 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">¡Consulta Recibida con Éxito!</h3>
                        <p className="text-[var(--text-secondary)] max-w-md mx-auto text-sm font-medium">
                            Hemos registrado tus datos correctamente. Un asesor especializado del equipo se comunicará contigo a la brevedad.
                        </p>
                        <button
                            onClick={() => setSubmitSuccess(false)}
                            className="mt-4 text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider hover:underline"
                        >
                            Enviar otra consulta
                        </button>
                    </div>
                ) : (
                    /* Formulario Activo */
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                        {/* Grupo: Nombre y Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="full-name" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                                    Nombre Completo
                                </label>
                                <input
                                    id="full-name"
                                    type="text"
                                    placeholder="Tu nombre completo"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={`w-full bg-[var(--bg-primary)] border ${errors.fullName ? 'border-red-500 focus:ring-red-500/10' : 'border-[var(--border-light)] focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/10'
                                        } focus:ring-2 focus:outline-none px-4 py-3 rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 text-sm transition-all disabled:opacity-50`}
                                />
                                {errors.fullName && (
                                    <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                                        <span>{errors.fullName}</span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email-address" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                                    Correo Electrónico
                                </label>
                                <input
                                    id="email-address"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={formData.emailAddress}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={`w-full bg-[var(--bg-primary)] border ${errors.emailAddress ? 'border-red-500 focus:ring-red-500/10' : 'border-[var(--border-light)] focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/10'
                                        } focus:ring-2 focus:outline-none px-4 py-3 rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 text-sm transition-all disabled:opacity-50`}
                                />
                                {errors.emailAddress && (
                                    <p className="mt-1.5 text-xs font-medium text-red-500">
                                        {errors.emailAddress}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Selector de tipo de trámite */}
                        <div>
                            <label htmlFor="procedure-type" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                                Tipo de Trámite
                            </label>
                            <div className="relative">
                                <select
                                    id="procedure-type"
                                    value={formData.procedureType}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={`w-full bg-[var(--bg-primary)] border ${errors.procedureType ? 'border-red-500 focus:ring-red-500/10' : 'border-[var(--border-light)] focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/10'
                                        } focus:ring-2 focus:outline-none px-4 py-3 rounded-xl text-[var(--text-primary)] text-sm appearance-none cursor-pointer transition-all disabled:opacity-50`}
                                >
                                    <option value="" className="text-[var(--text-secondary)]">Selecciona una opción</option>
                                    <option value="compra">Compra de propiedad</option>
                                    <option value="venta">Venta de propiedad</option>
                                    <option value="registro">Registro de propiedad</option>
                                    <option value="hipoteca">Crédito hipotecario</option>
                                </select>
                                <svg className="absolute right-4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {errors.procedureType && (
                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                    {errors.procedureType}
                                </p>
                            )}
                        </div>

                        {/* Mensaje o consulta */}
                        <div>
                            <label htmlFor="message-text" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                                Tu Mensaje o Consulta
                            </label>
                            <textarea
                                id="message-text"
                                rows={4}
                                placeholder="Describe detalladamente tu caso..."
                                value={formData.messageText}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={`w-full bg-[var(--bg-primary)] border ${errors.messageText ? 'border-red-500 focus:ring-red-500/10' : 'border-[var(--border-light)] focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/10'
                                    } focus:ring-2 focus:outline-none px-4 py-3 rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 text-sm resize-none transition-all disabled:opacity-50`}
                            />
                            {errors.messageText && (
                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                    {errors.messageText}
                                </p>
                            )}
                        </div>

                        {/* Botón de envío con feedback de carga */}
                        <div className="flex justify-center pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-2/3 bg-[var(--brand-primary)] hover:opacity-90 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-base transition-opacity shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Procesando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Enviar mi Consulta</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
}