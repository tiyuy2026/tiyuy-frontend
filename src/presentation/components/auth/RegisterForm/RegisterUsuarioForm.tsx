'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks';
import { useGoogleAuth } from '@/presentation/hooks/useGoogleAuth';
import { useUserValidation } from '@/hooks/useUserValidation';
import { Button, Input } from '@/presentation/components/ui';
import { DniInput } from '@/presentation/components/kyc';
import { Mail, User, Phone, Lock, Hash } from 'lucide-react';

export const RegisterUsuarioForm: React.FC = () => {
  const { register, isLoading, error } = useAuth();
  const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();
  const { validateEmail, isValidating: validatingEmail } = useUserValidation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dni: '',
    phone: '', // Solo 9 dígitos empezando con 9
  });

  const [isDniValidated, setIsDniValidated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailExists, setEmailExists] = useState(false);

  // Validar email en tiempo real
  useEffect(() => {
    const validateEmailField = async () => {
      if (formData.email && formData.email.includes('@')) {
        try {
          const exists = await validateEmail(formData.email);
          setEmailExists(exists);
          
          if (exists) {
            setErrors(prev => ({ ...prev, email: 'Este email ya está registrado' }));
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.email;
              return newErrors;
            });
          }
        } catch (error) {
          console.error('Error validando email:', error);
        }
      } else {
        setEmailExists(false);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    };

    const timeoutId = setTimeout(validateEmailField, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email, validateEmail]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email requerido';
    if (emailExists) newErrors.email = 'Este email ya está registrado';
    if (!formData.password) newErrors.password = 'Contraseña requerida';
    if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    if (!formData.firstName) newErrors.firstName = 'Nombre requerido';
    if (!formData.lastName) newErrors.lastName = 'Apellidos requeridos';
    if (!formData.dni || formData.dni.length !== 8) newErrors.dni = 'DNI inválido';
    if (!isDniValidated) newErrors.dni = 'Debes validar tu DNI';

    // Validar teléfono: 9 dígitos empezando con 9
    const phoneRegex = /^9\d{8}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Teléfono inválido. Debe tener 9 dígitos y empezar con 9';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    try {
      const googleUserData = await signInWithGoogle();
      
      if (googleUserData) {
        // Autocompletar los datos del formulario con los datos de Google
        setFormData(prev => ({
          ...prev,
          email: googleUserData.email,
          firstName: googleUserData.firstName,
          lastName: googleUserData.lastName,
        }));
        
        console.log('RegisterUsuarioForm: Datos de Google autocompletados:', googleUserData);
      }
    } catch (error) {
      console.error('RegisterUsuarioForm: Error al obtener datos de Google:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const dataToSend = {
      email: formData.email,
      phone: formData.phone, // Ya viene limpio del handleChange
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dni: formData.dni,
      role: 'USER' as const
    };
    
    console.log('Datos a enviar:', dataToSend);
    
    await register(dataToSend);
  };

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crea tu cuenta</h2>
        <p className="text-gray-600">Completa tus datos para comenzar</p>
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
          rightIcon={validatingEmail && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent border-r-transparent animate-spin rounded-full border-l-blue-500"></div>}
          helperText={emailExists ? "Este email ya está registrado" : undefined}
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
          Crear Cuenta
        </Button>

        {/* DIVISOR */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">o regístrate con</span>
          </div>
        </div>

        {/* BOTÓN GOOGLE */}
        <Button 
          type="button" 
          variant="outline" 
          size="lg" 
          fullWidth
          onClick={handleGoogleSignIn}
          isLoading={googleLoading}
          className="border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl py-3 font-semibold transition-colors"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googleLoading ? 'Conectando...' : 'Google'}
        </Button>

        {/* ERROR DE GOOGLE */}
        {googleError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4">
            {googleError}
          </div>
        )}

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
