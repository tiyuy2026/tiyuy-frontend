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
        if (!formData.ruc || formData.ruc.length !== 11) newErrors.ruc = 'RUC inválido';
        if (!isRucValidated) newErrors.ruc = 'Valida tu RUC';

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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                    ✨ <strong>Trial Enterprise:</strong> 30 días gratis + 999 publicaciones
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="firstName" label="Nombres" value={formData.firstName} onChange={handleChange} error={errors.firstName} required />
                <Input name="lastName" label="Apellidos" value={formData.lastName} onChange={handleChange} error={errors.lastName} required />
            </div>

            <DniInput
                value={formData.dni}
                onChange={(val) => setFormData(prev => ({ ...prev, dni: val }))}
                onValidated={() => setIsDniValidated(true)}
                required
            />

            <RucInput
                value={formData.ruc}
                onChange={(val) => setFormData(prev => ({ ...prev, ruc: val }))}
                onValidated={(data) => {
                    setIsRucValidated(true);
                    setFormData(prev => ({ ...prev, companyName: data.companyName || '' }));
                }}
                required
            />

            <Input type="email" name="email" label="Correo empresarial" value={formData.email} onChange={handleChange} error={errors.email} required />

            <Input type="tel" name="phone" label="Teléfono" value={formData.phone} onChange={handleChange} required />

            <Input type="password" name="password" label="Contraseña" value={formData.password} onChange={handleChange} error={errors.password} required />

            <Input type="password" name="confirmPassword" label="Confirmar contraseña" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                Crear Cuenta Empresarial
            </Button>
        </form>
    );
};
