'use client';
import React, { useState } from 'react';
import { useAuth } from '@/presentation/hooks';
import { Button, Input } from '@/presentation/components/ui';
import { DniInput } from '@/presentation/components/kyc';

export const RegisterAdminForm: React.FC = () => {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dni: '',
    adminCode: '',
  });
  const [isDniValidated, setIsDniValidated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'El correo electrónico es obligatorio';
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria';
    if (formData.password && formData.password.length < 6) newErrors.password = 'La contraseña debe tener mínimo 6 caracteres';
    if (formData.password && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    if (!formData.firstName) newErrors.firstName = 'El nombre es obligatorio';
    if (!formData.lastName) newErrors.lastName = 'Los apellidos son obligatorios';
    if (!formData.dni || formData.dni.length !== 8) newErrors.dni = 'El DNI debe tener 8 dígitos';
    if (!isDniValidated) newErrors.dni = 'Debes validar tu DNI primero';
    if (!formData.adminCode) newErrors.adminCode = 'El código de administrador es obligatorio';

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await register({
        email: formData.email,
        phone: '',  // ← Opcional
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dni: formData.dni,
        role: 'ADMIN'  // ← CORREGIDO: 'ADMIN' NO ProfileType.ADMIN
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
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-sm text-red-800">
          ⚠️ <strong>Acceso restringido:</strong> Necesitas un código de administrador válido
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="firstName" label="Nombres" value={formData.firstName} onChange={handleChange} error={errors.firstName} />
        <Input name="lastName" label="Apellidos" value={formData.lastName} onChange={handleChange} error={errors.lastName} />
      </div>

      <DniInput
        value={formData.dni}
        onChange={(val) => {
          setFormData(prev => ({ ...prev, dni: val }));
          if (errors.dni) setErrors(prev => { const n = { ...prev }; delete n.dni; return n; });
        }}
        onValidated={() => setIsDniValidated(true)}
        required
        externalError={errors.dni}
      />

      <Input 
        name="adminCode" 
        label="Código de Administrador" 
        value={formData.adminCode} 
        onChange={handleChange} 
        error={errors.adminCode} 
        type="password"
        helperText="Código proporcionado por TIYUY" 
      />

      <Input type="email" name="email" label="Correo corporativo" value={formData.email} onChange={handleChange} error={errors.email} />

      <Input type="password" name="password" label="Contraseña" value={formData.password} onChange={handleChange} error={errors.password} />

      <Input type="password" name="confirmPassword" label="Confirmar contraseña" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />

      <Button type="submit" variant="danger" size="lg" fullWidth isLoading={isLoading}>
        Crear Cuenta Admin
      </Button>
    </form>
  );
};
