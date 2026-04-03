'use client';
import React, { useState } from 'react';
import { useAuth } from '@/presentation/hooks';
import { Button, Input } from '@/presentation/components/ui';
import { DniInput } from '@/presentation/components/kyc';
import { Mail, User, Phone, Lock, Hash, Briefcase } from 'lucide-react';
import { AgentRepository } from '@/infrastructure/repositories/AgentRepository';
import { toast } from 'sonner';

const agentRepo = new AgentRepository();

export const RegisterAgenteForm: React.FC = () => {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    licenseNumber: '',
    agency: '',
  });
  const [isDniValidated, setIsDniValidated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!formData.licenseNumber) newErrors.licenseNumber = 'Licencia requerida';
    
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

    try {
      await register({
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dni: formData.dni,
        role: 'AGENT',
      });

      // Después del registro exitoso, actualizar perfil de agente con datos profesionales
      try {
        await agentRepo.updateProfile({
          licenseNumber: formData.licenseNumber,
          agency: formData.agency || undefined,
        });
      } catch (agentError) {
        // Si falla la actualización del perfil de agente, no es crítico
        console.warn('No se pudo actualizar perfil de agente inicialmente:', agentError);
      }
    } catch (err) {
      // Error manejado por useAuth
    }
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
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* HEADER simplificado */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crea tu cuenta de Agente</h2>
        <p className="text-gray-600">Completa tus datos profesionales</p>
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

        {/* LICENCIA Y AGENCIA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="licenseNumber"
            label="Número de Licencia"
            leftIcon={<Briefcase className="w-5 h-5 text-gray-400" />}
            value={formData.licenseNumber}
            onChange={handleChange}
            error={errors.licenseNumber}
            placeholder="Tu licencia de agente"
            className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />

          <Input
            name="agency"
            label="Inmobiliaria (opcional)"
            leftIcon={<Briefcase className="w-5 h-5 text-gray-400" />}
            value={formData.agency}
            onChange={handleChange}
            placeholder="Nombre de tu inmobiliaria"
            className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* EMAIL */}
        <Input
          type="email"
          name="email"
          label="Correo electrónico"
          leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="ejemplo@correo.com"
          className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        />

        {/* TELÉFONO */}
        <Input
          type="tel"
          name="phone"
          label="Teléfono"
          leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="987654321"
          maxLength={9}
          className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        />

        {/* CONTRASEÑA */}
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

        {/* BOTÓN PRINCIPAL */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold transition-colors"
        >
          Crear Cuenta de Agente
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
