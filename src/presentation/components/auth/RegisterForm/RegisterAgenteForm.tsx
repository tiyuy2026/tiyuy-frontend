'use client';
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, User, Phone, Lock, Hash, Briefcase } from 'lucide-react';
import { useAuth } from '@/presentation/hooks';
import { useGoogleAuth, GoogleUserData } from '@/presentation/hooks/useGoogleAuth';
import { AuthRepository } from '@/infrastructure/repositories/AuthRepository';

const authRepository = new AuthRepository();
import { useUserValidation } from '@/presentation/hooks/useUserValidation';
import { Button, Input } from '@/presentation/components/ui';
import { DniInput } from '@/presentation/components/kyc';
import { AuthErrorBanner, PasswordStrengthIndicator } from '@/presentation/components/auth/shared';
import { AgentRepository } from '@/infrastructure/repositories/AgentRepository';
import { StepProgress } from './StepProgress';

const agentRepo = new AgentRepository();
const MIN_PASSWORD_LENGTH = 8;
const STEP_LABELS = ['Cuenta', 'Identidad', 'Profesional'];
const TOTAL_STEPS = 3;

export const RegisterAgenteForm: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();
  const { validateEmail, isValidating: validatingEmail } = useUserValidation();

  const [currentStep, setCurrentStep] = useState(1);
  const [googleData, setGoogleData] = useState<GoogleUserData | null>(null);
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

  useEffect(() => {
    const raw = sessionStorage.getItem('googleRegistrationData');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setFormData((prev) => ({
        ...prev,
        email: parsed.email ?? prev.email,
        firstName: parsed.firstName ?? prev.firstName,
        lastName: parsed.lastName ?? prev.lastName,
      }));
      sessionStorage.removeItem('googleRegistrationData');
    } catch {
      sessionStorage.removeItem('googleRegistrationData');
    }
  }, []);

  useEffect(() => {
    const isValidFormat = formData.email && /\S+@\S+\.\S+/.test(formData.email);
    if (!isValidFormat) { setEmailExists(false); return; }
    const timer = setTimeout(async () => {
      try {
        const exists = await validateEmail(formData.email);
        setEmailExists(exists);
        setErrors((prev) => {
          const updated = { ...prev };
          if (exists) updated.email = 'Este email ya está registrado';
          else delete updated.email;
          return updated;
        });
      } catch { /* silencioso */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.email, validateEmail]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!googleData) {
        if (!formData.email) newErrors.email = 'El correo electrónico es obligatorio';
        else if (emailExists) newErrors.email = 'Este email ya está registrado';
        if (!formData.password) newErrors.password = 'La contraseña es obligatoria';
        else if (formData.password.length < MIN_PASSWORD_LENGTH) newErrors.password = `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`;
        if (formData.password && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    if (step === 2) {
      if (!formData.dni || formData.dni.length !== 8) newErrors.dni = 'El DNI debe tener 8 dígitos';
      if (!isDniValidated) newErrors.dni = 'Debes validar tu DNI primero';
      if (!formData.firstName) newErrors.firstName = 'El nombre es obligatorio';
      if (!formData.lastName) newErrors.lastName = 'Los apellidos son obligatorios';
      const phoneRegex = /^9\d{8}$/;
      if (!formData.phone) newErrors.phone = 'El teléfono es obligatorio';
      else if (!phoneRegex.test(formData.phone.trim())) newErrors.phone = 'Teléfono inválido: 9 dígitos empezando con 9';
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
    try {
      if (googleData) {
        await authRepository.loginWithGoogle(
          googleData.email,
          formData.firstName || googleData.firstName,
          formData.lastName || googleData.lastName,
          googleData.uid,
        );
        window.location.href = '/dashboard';
        return;
      }
      await register({
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dni: formData.dni,
        role: 'AGENT',
      });
      try {
        await agentRepo.updateProfile({
          licenseNumber: formData.licenseNumber,
          agency: formData.agency || undefined,
        });
      } catch { /* no bloqueante */ }
    } catch { /* expuesto via error */ }
  };

  const handleDniValidated = (dniData: { fullName?: string }) => {
    setIsDniValidated(true);
    if (dniData?.fullName) {
      const [firstName = '', ...rest] = dniData.fullName.split(' ');
      setFormData((prev) => ({ ...prev, firstName, lastName: rest.join(' ') }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 9) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (name !== 'email' && errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      sessionStorage.removeItem('googleRegistrationData');
      const googleUserData = await signInWithGoogle();
      if (googleUserData) {
        setGoogleData(googleUserData);
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: googleUserData.firstName,
          lastName: googleUserData.lastName,
          dni: '',
          phone: '',
          licenseNumber: '',
          agency: '',
        });
        setCurrentStep(2);
      }
    } catch { /* expuesto via googleError */ }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <AuthErrorBanner error={error} onClose={clearError} autoDismissSeconds={8} />
        <AuthErrorBanner error={googleError} />
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Cuenta de Agente</h2>
        <p className="text-gray-500 text-sm">Paso {currentStep} de {TOTAL_STEPS}</p>
      </div>

      <StepProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} labels={STEP_LABELS} />

      <form onSubmit={handleSubmit} noValidate>

        {/* ── PASO 1: CUENTA ── */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Crea tu acceso</h3>
              <p className="text-sm text-gray-500">Tu email y contraseña para ingresar</p>
            </div>

            <Input
              type="email"
              name="email"
              label="Correo electrónico"
              leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="ejemplo@correo.com"
              rightIcon={validatingEmail ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" /> : undefined}
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
                placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
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

            <Button type="button" variant="primary" size="lg" fullWidth onClick={handleNext}>
              Siguiente →
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">o regístrate con</span></div>
            </div>

            <Button type="button" variant="outline" size="lg" fullWidth onClick={handleGoogleSignIn} isLoading={googleLoading}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {googleLoading ? 'Conectando...' : 'Google'}
            </Button>

            <div className="text-center pt-2">
              <p className="text-gray-600 text-sm">
                ¿Ya tienes cuenta?{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Inicia sesión</a>
              </p>
            </div>
          </div>
        )}

        {/* ── PASO 2: IDENTIDAD ── */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Verifica tu identidad</h3>
              <p className="text-sm text-gray-500">Tu DNI para validar tus datos personales</p>
              {googleData && (
                <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Conectado con Google · {googleData.email}
                </div>
              )}
            </div>

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

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" size="lg" fullWidth onClick={handleBack}>
                ← Anterior
              </Button>
              <Button type="button" variant="primary" size="lg" fullWidth onClick={handleNext}>
                Siguiente →
              </Button>
            </div>
          </div>
        )}

        {/* ── PASO 3: PROFESIONAL ── */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Datos profesionales</h3>
              <p className="text-sm text-gray-500">Opcional — puedes completarlos más tarde</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="licenseNumber"
                label="N.° de Licencia (opcional)"
                leftIcon={<Briefcase className="w-5 h-5 text-gray-400" />}
                value={formData.licenseNumber}
                onChange={handleChange}
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

            <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Resumen de tu cuenta</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-800">{formData.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nombre</span>
                <span className="font-medium text-gray-800">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">DNI</span>
                <span className="font-medium text-gray-800">{formData.dni}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Teléfono</span>
                <span className="font-medium text-gray-800">{formData.phone}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" size="lg" fullWidth onClick={handleBack}>
                ← Anterior
              </Button>
              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                Crear Cuenta
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
