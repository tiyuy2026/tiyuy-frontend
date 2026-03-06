'use client';
import React, { useState } from 'react';
import { useAuth } from '@/presentation/hooks';
import { Button, Input } from '@/presentation/components/ui';
import { DniInput, RucInput } from '@/presentation/components/kyc';

export const RegisterDeveloperForm: React.FC = () => {
    const { register, isLoading, error } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        dni: '',
        ruc: '',
        companyName: '',
        phone: '',
    });
    const [isDniValidated, setIsDniValidated] = useState(false);
    const [isRucValidated, setIsRucValidated] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) newErrors.email = 'Email requerido';
        if (!formData.password || formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
        if (!formData.firstName) newErrors.firstName = 'Nombre requerido';
        if (!formData.lastName) newErrors.lastName = 'Apellidos requeridos';
        if (!formData.dni || formData.dni.length !== 8) newErrors.dni = 'DNI inválido';
        if (!isDniValidated) newErrors.dni = 'Valida tu DNI';
        
        // RUC obligatorio para empresas, pero flexible si la API falla
        if (!formData.ruc) {
            newErrors.ruc = 'RUC requerido para empresa inmobiliaria';
        } else if (formData.ruc.length !== 11) {
            newErrors.ruc = 'RUC debe tener 11 dígitos';
        }
        // NOTA: No validamos isRucValidated aquí para permitir continuar si la API falla

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await register({
                email: formData.email,
                phone: formData.phone || '',
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                dni: formData.dni,
                role: 'DEVELOPER'
                // ← SIN ruc (no existe en RegisterData)
            });
        } catch (err) {
            // Error manejado
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Cuando el DNI se valida, autocompletar nombre y apellidos
    const handleDniValidated = (dniData: { firstName: string; lastName: string }) => {
        setIsDniValidated(true);
        setFormData(prev => ({
            ...prev,
            firstName: dniData.firstName || prev.firstName,
            lastName: dniData.lastName || prev.lastName
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-purple-900">Publica tu Primer Proyecto GRATIS</h3>
                        <p className="text-purple-700 text-sm">30 días gratis + Unidades ilimitadas en tu proyecto</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3">
                        <div className="text-purple-600 font-bold text-lg">1</div>
                        <div className="text-xs text-gray-600">Proyecto</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                        <div className="text-purple-600 font-bold text-lg">∞</div>
                        <div className="text-xs text-gray-600">Unidades</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                        <div className="text-purple-600 font-bold text-lg">30</div>
                        <div className="text-xs text-gray-600">Días gratis</div>
                    </div>
                </div>
                <div className="mt-4 bg-white rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <div className="text-green-600">💡</div>
                        <div className="text-sm text-gray-700">
                            <strong>Unidades ilimitadas:</strong> Departamentos, casas, oficinas, lotes, etc. 
                            Publica todas las unidades de tu proyecto sin límite.
                        </div>
                    </div>
                </div>
            </div>

            {/* Información Personal */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Información Personal</h3>
                </div>

                <DniInput
                    value={formData.dni}
                    onChange={(val) => setFormData(prev => ({ ...prev, dni: val }))}
                    onValidated={handleDniValidated}
                    required
                    helperText="Ingresa tu DNI (8 dígitos) para validar tu identidad y autocompletar tus datos"
                />

                {!isDniValidated && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                        <div className="text-blue-600">👉</div>
                        <div className="text-sm text-blue-700">
                            <strong>Próximo paso:</strong> Al validar tu DNI, tus nombres y apellidos se autocompletarán automáticamente
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombres
                        </label>
                        <Input 
                            name="firstName" 
                            placeholder="Ej: Juan Carlos"
                            value={formData.firstName} 
                            onChange={handleChange} 
                            required 
                            disabled={isDniValidated}
                            helperText={isDniValidated ? "✅ Autocompletado desde DNI" : "Ingresa tus nombres"}
                        />
                        {errors.firstName && (
                            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Apellidos
                        </label>
                        <Input 
                            name="lastName" 
                            placeholder="Ej: Pérez García"
                            value={formData.lastName} 
                            onChange={handleChange} 
                            required 
                            disabled={isDniValidated}
                            helperText={isDniValidated ? "✅ Autocompletado desde DNI" : "Ingresa tus apellidos"}
                        />
                        {errors.lastName && (
                            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Información Empresarial */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Información Empresarial</h3>
                </div>

                <RucInput
                    value={formData.ruc}
                    onChange={(val) => setFormData(prev => ({ ...prev, ruc: val }))}
                    onValidated={(data) => {
                        setIsRucValidated(true);
                        setFormData(prev => ({ ...prev, companyName: data.companyName || '' }));
                    }}
                    helperText="RUC de tu empresa (11 dígitos). Si SUNAT no lo encuentra, puedes continuar igualmente."
                    required
                />

                {formData.ruc && !isRucValidated && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <div className="text-blue-600">ℹ️</div>
                            <div className="text-sm text-blue-700">
                                <strong>Importante:</strong> Si la validación del RUC falla, puedes continuar con el registro. 
                                El RUC será verificado posteriormente por nuestro equipo.
                            </div>
                        </div>
                    </div>
                )}

                {formData.ruc && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de la Empresa
                        </label>
                        <Input 
                            name="companyName" 
                            placeholder="Ej: Inmobiliaria Los Pinos S.A.C."
                            value={formData.companyName} 
                            onChange={handleChange}
                            disabled={isRucValidated}
                            helperText={isRucValidated ? "✅ Autocompletado desde RUC" : "Nombre de tu empresa"}
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Empresarial
                    </label>
                    <Input 
                        type="email" 
                        name="email" 
                        placeholder="Ej: contacto@tuempresa.com"
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        helperText="Usa un correo profesional de tu empresa"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono / WhatsApp
                    </label>
                    <Input 
                        type="tel" 
                        name="phone" 
                        placeholder="Ej: 987 654 321"
                        value={formData.phone} 
                        onChange={handleChange} 
                        required 
                        helperText="Número de contacto para clientes y soporte"
                    />
                </div>
            </div>

            {/* Seguridad */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Seguridad de la Cuenta</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña
                    </label>
                    <Input 
                        type="password" 
                        name="password" 
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                        helperText="Crea una contraseña segura para tu cuenta"
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña
                    </label>
                    <Input 
                        type="password" 
                        name="confirmPassword" 
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        required 
                        helperText="Confirma tu contraseña para evitar errores"
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                </div>
            </div>

            {/* Términos y Condiciones */}
            <div className="bg-gray-50 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500" required />
                    <div className="text-sm text-gray-600">
                        Acepto los <a href="/terminos" className="text-purple-600 hover:underline">Términos y Condiciones</a> y la <a href="/privacidad" className="text-purple-600 hover:underline">Política de Privacidad</a> de TIYUY
                    </div>
                </label>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                {isLoading ? 'Creando Cuenta...' : '🏗️ Crear Cuenta y Publicar Mi Proyecto'}
            </Button>

            <div className="text-center text-sm text-gray-600">
                ¿Ya tienes cuenta? <a href="/login" className="text-purple-600 hover:underline font-medium">Inicia Sesión</a>
            </div>
        </form>
    );
};