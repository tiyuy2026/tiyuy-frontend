'use client';
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, User, Phone, Lock, Hash, Building2, Star, MapPin } from 'lucide-react';
import { useAuth } from '@/presentation/hooks';
import { useGoogleAuth } from '@/presentation/hooks/useGoogleAuth';
import { useUserValidation } from '@/presentation/hooks/useUserValidation';
import { Button, Input } from '@/presentation/components/ui';
import { DniInput, RucInput } from '@/presentation/components/kyc';
import { AuthErrorBanner, PasswordStrengthIndicator } from '@/presentation/components/auth/shared';

/** Mínimo de caracteres para contraseñas en toda la aplicación */
const MIN_PASSWORD_LENGTH = 8;

export const RegisterDeveloperForm: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();
  const { validateEmail, isValidating: validatingEmail } = useUserValidation();

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
    city: '',
    address: '',
  });
  const [isDniValidated, setIsDniValidated] = useState(false);
  const [isRucValidated, setIsRucValidated] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailExists, setEmailExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ─── Auto-completar desde Google (vía sessionStorage) ──────────────────────

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
        // Silencioso
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

    if (!formData.firstName) newErrors.firstName = 'El nombre es obligatorio';
    if (!formData.lastName) newErrors.lastName = 'Los apellidos son obligatorios';

    if (!formData.dni || formData.dni.length !== 8) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    }
    if (!isDniValidated) {
      newErrors.dni = 'Debes validar tu DNI primero';
    }

    if (!formData.ruc) {
      newErrors.ruc = 'El RUC de la empresa es obligatorio';
    } else if (formData.ruc.length !== 11) {
      newErrors.ruc = 'El RUC debe tener 11 dígitos';
    }

    const phoneRegex = /^9\d{8}$/;
    if (!formData.phone) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Teléfono inválido: 9 dígitos empezando con 9';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }

    return newErrors;
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleDniValidated = (dniData: { firstName?: string; lastName?: string }) => {
    setIsDniValidated(true);
    if (dniData) {
      setFormData((prev) => ({
        ...prev,
        firstName: dniData.firstName ?? prev.firstName,
        lastName: dniData.lastName ?? prev.lastName,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    await register({
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dni: formData.dni,
      ruc: formData.ruc,
      fullName: formData.companyName,
      city: formData.city,
      address: formData.address,
      role: 'DEVELOPER',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 9);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Limpiar error del campo al escribir (excepto email)
    if (name !== 'email' && errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const googleUserData = await signInWithGoogle();
      if (googleUserData) {
        setFormData((prev) => ({
          ...prev,
          email: googleUserData.email,
          firstName: googleUserData.firstName,
          lastName: googleUserData.lastName,
        }));
      }
    } catch {
      // El error se expone a través de googleError
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Error de API estandarizado */}
      <div className="mb-4">
        <AuthErrorBanner error={error} onClose={clearError} autoDismissSeconds={8} />
        <AuthErrorBanner error={googleError} />
      </div>

      {/* Badge de trial */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
          <Star className="w-4 h-4" />
          30 días gratis — Trial Enterprise
        </div>
      </div>

      {/* Encabezado */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crea tu cuenta de Desarrollador</h2>
        <p className="text-gray-600">Publica proyectos inmobiliarios ilimitados</p>
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

        {/* Nombre y apellido */}
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

        {/* Email con validación en tiempo real */}
        <Input
          name="email"
          label="Correo electrónico"
          type="email"
          leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="tu@email.com"
          rightIcon={
            validatingEmail ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />
            ) : undefined
          }
        />

        {/* Contraseña con toggle y fortaleza */}
        <div>
          <Input
            name="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
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
          name="confirmPassword"
          label="Confirmar contraseña"
          type={showConfirmPassword ? 'text' : 'password'}
          leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="Repite tu contraseña"
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

        {/* Teléfono */}
        <Input
          name="phone"
          label="Teléfono"
          leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="9xxxxxxxx"
          maxLength={9}
        />

        {/* Ciudad y dirección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="city"
            label="Ciudad"
            leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
            placeholder="Ingresa tu ciudad"
          />
          <Input
            name="address"
            label="Dirección de la empresa"
            leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            placeholder="Ingresa la dirección"
          />
        </div>

        {/* Información empresarial */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            Información Empresarial
          </h3>

          <RucInput
            value={formData.ruc}
            onChange={(val) => {
              setFormData((prev) => ({ ...prev, ruc: val }));
              if (errors.ruc) setErrors((prev) => { const n = { ...prev }; delete n.ruc; return n; });
            }}
            onValidated={(data) => {
              setIsRucValidated(true);
              if (data.companyName) {
                setFormData((prev) => ({ ...prev, companyName: data.companyName }));
              }
            }}
            required
            externalError={errors.ruc}
          />

          <Input
            name="companyName"
            label="Nombre de la empresa"
            leftIcon={<Building2 className="w-5 h-5 text-gray-400" />}
            value={formData.companyName}
            onChange={handleChange}
            error={errors.companyName}
            placeholder="Nombre de tu empresa"
          />

          {/* Stats de trial */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { value: '1', label: 'Proyecto' },
              { value: '∞', label: 'Unidades' },
              { value: '30', label: 'Días gratis' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="text-blue-600 font-bold text-lg">{value}</div>
                <div className="text-xs text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Términos y condiciones */}
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (e.target.checked && errors.terms) {
                  setErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.terms;
                    return updated;
                  });
                }
              }}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="text-sm text-gray-600">
              Acepto los{' '}
              <a href="/terminos" className="text-blue-600 hover:underline">
                Términos y Condiciones
              </a>{' '}
              y la{' '}
              <a href="/privacidad" className="text-blue-600 hover:underline">
                Política de Privacidad
              </a>{' '}
              de TIYUY
            </div>
          </label>
          {errors.terms && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1 ml-7" role="alert">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.terms}
            </p>
          )}
        </div>

        {/* Botón principal */}
        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
          Crear Cuenta y Publicar Mi Proyecto
        </Button>

        {/* Divisor */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">o regístrate con</span>
          </div>
        </div>

        {/* Botón Google */}
        <Button type="button" variant="outline" size="lg" fullWidth onClick={handleGoogleSignIn} isLoading={googleLoading}>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googleLoading ? 'Conectando...' : 'Google'}
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