'use client';
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, User, Phone, Lock, Hash, Briefcase } from 'lucide-react';
import { useAuth } from '@/presentation/hooks';
import { useUserValidation } from '@/presentation/hooks/useUserValidation';
import { Button, Input } from '@/presentation/components/ui';
import { DniInput } from '@/presentation/components/kyc';
import { AuthErrorBanner, PasswordStrengthIndicator } from '@/presentation/components/auth/shared';
import { AgentRepository } from '@/infrastructure/repositories/AgentRepository';

const agentRepo = new AgentRepository();

/** Mínimo de caracteres para contraseñas en toda la aplicación */
const MIN_PASSWORD_LENGTH = 8;

export const RegisterAgenteForm: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const { validateEmail, isValidating: validatingEmail } = useUserValidation();

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
  const [emailExists, setEmailExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ─── Validación de email en tiempo real ─────────────────────────────────────

  useEffect(() => {
    const isValidFormat = formData.email && /\S+@\S+\.\S+/.test(formData.email);
    if (!isValidFormat) {
      setEmailExists(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const exists = await validateEmail(formData.email);
        setEmailExists(exists);
        setErrors((prev) => {
          const updated = { ...prev };
          if (exists) {
            updated.email = 'Este email ya está registrado';
          } else {
            delete updated.email;
          }
          return updated;
        });
      } catch {
        // Silencioso: la validación de submit protegerá igualmente
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, validateEmail]);

  // ─── Validación completa antes del submit ───────────────────────────────────

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (emailExists) {
      newErrors.email = 'Este email ya está registrado';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `La contraseña debe tener mínimo ${MIN_PASSWORD_LENGTH} caracteres`;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.dni || formData.dni.length !== 8) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    }
    if (!isDniValidated) {
      newErrors.dni = 'Debes validar tu DNI primero';
    }

    if (!formData.firstName) newErrors.firstName = 'El nombre es obligatorio';
    if (!formData.lastName) newErrors.lastName = 'Los apellidos son obligatorios';

    const phoneRegex = /^9\d{8}$/;
    if (!formData.phone) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Teléfono inválido: 9 dígitos empezando con 9';
    }

    return newErrors;
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleDniValidated = (dniData: { fullName?: string }) => {
    setIsDniValidated(true);
    if (dniData?.fullName) {
      const [firstName = '', ...rest] = dniData.fullName.split(' ');
      setFormData((prev) => ({ ...prev, firstName, lastName: rest.join(' ') }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

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

      // Actualizar perfil de agente con datos profesionales (no es crítico si falla)
      try {
        await agentRepo.updateProfile({
          licenseNumber: formData.licenseNumber,
          agency: formData.agency || undefined,
        });
      } catch {
        // No bloqueamos el registro si falla la actualización del perfil de agente
      }
    } catch {
      // El error se maneja en useAuth y se expone a través de `error`
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 9);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Limpiar el error del campo al escribir (excepto email, lo gestiona el useEffect)
    if (name !== 'email' && errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Error de API */}
      <div className="mb-4">
        <AuthErrorBanner error={error} onClose={clearError} autoDismissSeconds={8} />
      </div>

      {/* Encabezado */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crea tu cuenta de Agente</h2>
        <p className="text-gray-600">Completa tus datos profesionales</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* DNI primero */}
        <DniInput
          value={formData.dni}
          onChange={(val) => {
            setFormData((prev) => ({ ...prev, dni: val }));
            if (errors.dni) setErrors((prev) => { const n = { ...prev }; delete n.dni; return n; });
          }}
          onValidated={handleDniValidated}
          leftIcon={<Hash className="w-5 h-5 text-gray-400" />}
          placeholder="Ingresa tu DNI"
          required
          disabled={isDniValidated}
          externalError={errors.dni}
        />

        {/* Nombre y apellido (auto-llenados desde DNI) */}
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
          />
        </div>

        {/* Licencia y agencia (opcionales) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="licenseNumber"
            label="N.° de Licencia (opcional)"
            leftIcon={<Briefcase className="w-5 h-5 text-gray-400" />}
            value={formData.licenseNumber}
            onChange={handleChange}
            error={errors.licenseNumber}
            placeholder="Tu licencia de agente"
          />
          <Input
            name="agency"
            label="Inmobiliaria (opcional)"
            leftIcon={<Briefcase className="w-5 h-5 text-gray-400" />}
            value={formData.agency}
            onChange={handleChange}
            placeholder="Nombre de tu inmobiliaria"
          />
        </div>

        {/* Email con validación en tiempo real */}
        <Input
          type="email"
          name="email"
          label="Correo electrónico"
          leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="ejemplo@correo.com"
          rightIcon={
            validatingEmail ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />
            ) : undefined
          }
        />

        {/* Teléfono */}
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
        />

        {/* Contraseña con toggle y fortaleza */}
        <div>
          <Input
            type={showPassword ? 'text' : 'password'}
            name="password"
            label="Contraseña"
            leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
          />
          <PasswordStrengthIndicator password={formData.password} />
        </div>

        {/* Confirmar contraseña con toggle */}
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          label="Confirmar contraseña"
          leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="Repite la contraseña"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />

        {/* Botón principal */}
        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
          Crear Cuenta de Agente
        </Button>

        {/* Link a login */}
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
