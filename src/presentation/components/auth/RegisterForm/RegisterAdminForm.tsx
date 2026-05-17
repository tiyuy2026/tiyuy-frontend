'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, User, Lock, Hash, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/presentation/hooks';
import { Button, Input } from '@/presentation/components/ui';
import { DniInput } from '@/presentation/components/kyc';
import { PasswordStrengthIndicator } from '@/presentation/components/auth/shared';
import { StepProgress } from './StepProgress';

const STEP_LABELS = ['Acceso', 'Identidad'];
const TOTAL_STEPS = 2;

export const RegisterAdminForm: React.FC = () => {
  const { register, isLoading, error } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.adminCode) newErrors.adminCode = 'El código de administrador es obligatorio';
      if (!formData.email) newErrors.email = 'El correo electrónico es obligatorio';
      if (!formData.password) newErrors.password = 'La contraseña es obligatoria';
      else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
      if (formData.password && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (step === 2) {
      if (!formData.dni || formData.dni.length !== 8) newErrors.dni = 'El DNI debe tener 8 dígitos';
      if (!isDniValidated) newErrors.dni = 'Debes validar tu DNI primero';
      if (!formData.firstName) newErrors.firstName = 'El nombre es obligatorio';
      if (!formData.lastName) newErrors.lastName = 'Los apellidos son obligatorios';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    try {
      await register({
        email: formData.email,
        phone: '',
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dni: formData.dni,
        role: 'ADMIN',
      });
    } catch { /* manejado por useAuth */ }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Cuenta Administrador</h2>
        <p className="text-gray-500 text-sm">Paso {currentStep} de {TOTAL_STEPS}</p>
      </div>

      <StepProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} labels={STEP_LABELS} />

      <form onSubmit={handleSubmit} noValidate>

        {/* ── PASO 1: ACCESO ── */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">
                <strong>Acceso restringido:</strong> Necesitas un código de administrador válido
              </p>
            </div>

            <Input
              name="adminCode"
              label="Código de Administrador"
              leftIcon={<ShieldAlert className="w-5 h-5 text-red-400" />}
              value={formData.adminCode}
              onChange={handleChange}
              error={errors.adminCode}
              type={showAdminCode ? 'text' : 'password'}
              helperText="Código proporcionado por TIYUY"
              rightIcon={
                <button type="button" onClick={() => setShowAdminCode((v) => !v)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showAdminCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            <Input
              type="email"
              name="email"
              label="Correo corporativo"
              leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="admin@tiyuy.com"
            />

            <div>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Contraseña"
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Mínimo 6 caracteres"
                rightIcon={
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
              <PasswordStrengthIndicator password={formData.password} />
            </div>

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
                <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            <Button type="button" variant="danger" size="lg" fullWidth onClick={handleNext}>
              Siguiente →
            </Button>
          </div>
        )}

        {/* ── PASO 2: IDENTIDAD ── */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Identidad del administrador</h3>
              <p className="text-sm text-gray-500">Valida tu DNI para completar el registro</p>
            </div>

            <DniInput
              value={formData.dni}
              onChange={(val) => {
                setFormData((prev) => ({ ...prev, dni: val }));
                if (errors.dni) setErrors((prev) => { const n = { ...prev }; delete n.dni; return n; });
              }}
              onValidated={(data) => {
                setIsDniValidated(true);
                if ((data as any)?.fullName) {
                  const [firstName = '', ...rest] = (data as any).fullName.split(' ');
                  setFormData((prev) => ({ ...prev, firstName, lastName: rest.join(' ') }));
                }
              }}
              leftIcon={<Hash className="w-5 h-5 text-gray-400" />}
              required
              externalError={errors.dni}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="firstName"
                label="Nombres"
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="Tus nombres"
                readOnly={!isDniValidated}
              />
              <Input
                name="lastName"
                label="Apellidos"
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Tus apellidos"
                readOnly={!isDniValidated}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" size="lg" fullWidth onClick={handleBack}>
                ← Anterior
              </Button>
              <Button type="submit" variant="danger" size="lg" fullWidth isLoading={isLoading}>
                Crear Cuenta Admin
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
