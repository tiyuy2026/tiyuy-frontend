'use client';
import React, { useState } from 'react';
import { useAuth } from '@/presentation/hooks';
import { Button, Input } from '@/presentation/components/ui';
import { DniInput, RucInput } from '@/presentation/components/kyc';
import { Mail, User, Phone, Lock, Hash, Building2, Star } from 'lucide-react';

export const RegisterDeveloperForm: React.FC = () => {
    const { register, isLoading, error, clearError } = useAuth();
    const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);
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

    // Detectar error de email ya registrado y mostrar modal
    React.useEffect(() => {
        if (error && (error.includes('ya esta registrado') || error.includes('ya está registrado') || error.includes('email ya registrado'))) {
            setShowEmailExistsModal(true);
        }
    }, [error]);

    const handleDniValidated = (dniData: any) => {
        setIsDniValidated(true);
        // Llenar automáticamente los campos de nombre y apellido
        if (dniData && dniData.fullName) {
            // Separar nombre y apellido del fullName
            const nameParts = dniData.fullName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            setFormData(prev => ({
                ...prev,
                firstName: firstName,
                lastName: lastName
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) newErrors.email = 'Email requerido';
        if (!formData.password || formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
        if (!formData.firstName) newErrors.firstName = 'Nombre requerido';
        if (!formData.lastName) newErrors.lastName = 'Apellidos requeridos';
        if (!formData.dni || formData.dni.length !== 8) newErrors.dni = 'DNI inválido';
        if (!isDniValidated) newErrors.dni = 'Debes validar tu DNI';
        
        // RUC obligatorio para empresas, pero flexible si la API falla
        if (!formData.ruc) {
            newErrors.ruc = 'RUC requerido para empresa inmobiliaria';
        } else if (formData.ruc.length !== 11) {
            newErrors.ruc = 'RUC debe tener 11 dígitos';
        }

        // Validar teléfono: 9 dígitos empezando con 9
        const phoneRegex = /^9\d{8}$/;
        if (!formData.phone || !phoneRegex.test(formData.phone.trim())) {
            newErrors.phone = 'Teléfono inválido. Debe tener 9 dígitos y empezar con 9';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        await register({
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            dni: formData.dni,
            role: 'DEVELOPER'
        });
    };

    const handleCloseModal = () => {
        setShowEmailExistsModal(false);
        clearError();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Manejo especial para el teléfono - solo números y que empiece con 9
        if (name === 'phone') {
            // Solo permitir números, máximo 9 dígitos
            const cleanedValue = value.replace(/\D/g, '').slice(0, 9);
            setFormData(prev => ({ ...prev, [name]: cleanedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        if (errors[name]) {
            const updated = { ...errors };
            delete updated[name];
            setErrors(updated);
        }
    };

    return (
        <div className="w-full">
            {/* Modal de Email Ya Registrado */}
            {showEmailExistsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-orange-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Email ya registrado</h3>
                        <p className="text-gray-600 mb-6">Este email ya esta registrado. Intenta iniciar sesion.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                OK
                            </button>
                            <a
                                href="/login"
                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
                            >
                                Iniciar sesion
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {error && !error.includes('ya esta registrado') && !error.includes('ya está registrado') && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                    {error}
                </div>
            )}

            {/* Badge de 30 días gratis */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                    <Star className="w-4 h-4" />
                    30 días gratis - Trial Enterprise
                </div>
            </div>

            {/* HEADER simplificado */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Crea tu cuenta de Desarrollador</h2>
                <p className="text-gray-600">Publica proyectos inmobiliarios ilimitados</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* DNI PRIMERO */}
                <DniInput
                    value={formData.dni}
                    onChange={(val) => setFormData(prev => ({ ...prev, dni: val }))}
                    onValidated={handleDniValidated}
                    leftIcon={<Hash className="w-5 h-5 text-gray-400" />}
                    placeholder="Ingresa tu DNI"
                    required
                    disabled={isDniValidated}
                />

                {/* NOMBRES DESPUÉS DE VALIDAR DNI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        name="firstName"
                        label="Nombres"
                        leftIcon={<User className="w-5 h-5 text-gray-400" />}
                        value={formData.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                        placeholder="Ingresa tus nombres"
                        readOnly={!isDniValidated}
                        className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />

                    <Input
                        name="lastName"
                        label="Apellidos"
                        leftIcon={<User className="w-5 h-5 text-gray-400" />}
                        value={formData.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                        placeholder="Ingresa tus apellidos"
                        readOnly={!isDniValidated}
                        className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* INFORMACIÓN EMPRESARIAL */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        Información Empresarial
                    </h3>

                    <RucInput
                        value={formData.ruc}
                        onChange={(val) => setFormData(prev => ({ ...prev, ruc: val }))}
                        onValidated={(data) => {
                            setIsRucValidated(true);
                            // Si la API devuelve el nombre, lo usa, pero no bloquea el campo
                            if (data.companyName) {
                                setFormData(prev => ({ ...prev, companyName: data.companyName }));
                            }
                        }}
                        required
                    />

                    <Input
                        name="companyName"
                        label="Nombre de la Empresa"
                        leftIcon={<Building2 className="w-5 h-5 text-gray-400" />}
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Ej: Inmobiliaria Los Pinos S.A.C."
                        className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* EMAIL */}
                <Input
                    type="email"
                    name="email"
                    label="Correo Empresarial"
                    leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="contacto@tuempresa.com"
                    className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />

                {/* TELÉFONO */}
                <Input
                    type="tel"
                    name="phone"
                    label="Teléfono / WhatsApp"
                    leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="987654321"
                    maxLength={9}
                    className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />

                {/* CONTRASEÑA */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-500" />
                        Seguridad de la Cuenta
                    </h3>

                    <Input
                        type="password"
                        name="password"
                        label="Contraseña"
                        leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="Mínimo 6 caracteres"
                        className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />

                    <Input
                        type="password"
                        name="confirmPassword"
                        label="Confirmar contraseña"
                        leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        placeholder="Repite la contraseña"
                        className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* BENEFICIOS */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Beneficios del Trial Enterprise
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-white rounded-lg p-3">
                            <div className="text-blue-600 font-bold text-lg">1</div>
                            <div className="text-xs text-gray-600">Proyecto</div>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <div className="text-blue-600 font-bold text-lg">∞</div>
                            <div className="text-xs text-gray-600">Unidades</div>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <div className="text-blue-600 font-bold text-lg">30</div>
                            <div className="text-xs text-gray-600">Días gratis</div>
                        </div>
                    </div>
                </div>

                {/* TÉRMINOS */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" required />
                        <div className="text-sm text-gray-600">
                            Acepto los <a href="/terminos" className="text-blue-600 hover:underline">Términos y Condiciones</a> y la <a href="/privacidad" className="text-blue-600 hover:underline">Política de Privacidad</a> de TIYUY
                        </div>
                    </label>
                </div>

                {/* BOTÓN PRINCIPAL */}
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold transition-colors"
                >
                    🏗️ Crear Cuenta y Publicar Mi Proyecto
                </Button>

                {/* ENLACE A LOGIN */}
                <div className="text-center pt-4">
                    <p className="text-gray-600">
                        ¿Ya tienes cuenta?{' '}
                        <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Inicia sesión
                        </a>
                    </p>
                </div>
            </form>
        </div>
    );
};