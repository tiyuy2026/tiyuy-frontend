'use client';

import { useState } from 'react';
import { User } from '@/core/domain/entities';
import { Button, Input } from '@/presentation/components/ui';
import { Shield, Lock, Key, Eye, EyeOff } from 'lucide-react';

interface SecurityTabProps {
  user: User;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({ user }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar errores
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Contraseña actual requerida';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Nueva contraseña requerida';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Mínimo 6 caracteres';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmar contraseña requerida';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    
    setIsLoading(true);
    setSuccessMessage('');

    try {
      // TODO: Conectar con backend para cambiar contraseña
      console.log('Cambiando contraseña');
      
      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMessage('Contraseña actualizada correctamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Seguridad</h2>
        <p className="text-gray-600">
          Gestiona la seguridad de tu cuenta. Mantén tu contraseña segura y actualízala regularmente.
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="space-y-8">
        {/* Cambiar Contraseña */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-gray-600" />
            Cambiar Contraseña
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              label="Contraseña Actual"
              value={passwordData.currentPassword}
              onChange={handleChange}
              error={errors.currentPassword}
              leftIcon={<Shield className="w-5 h-5 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            <Input
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              label="Nueva Contraseña"
              value={passwordData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              leftIcon={<Key className="w-5 h-5 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              helperText="Mínimo 6 caracteres"
            />

            <Input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirmar Nueva Contraseña"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              leftIcon={<Key className="w-5 h-5 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="min-w-[180px]"
              >
                <Shield className="w-4 h-4 mr-2" />
                Actualizar Contraseña
              </Button>
            </div>
          </form>
        </div>

        {/* Información de Seguridad */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Cuenta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Verificación de Email</p>
                  <p className="text-sm text-gray-600">
                    {user.emailVerified ? 'Verificado' : 'No verificado'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${user.emailVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Verificación de Teléfono</p>
                  <p className="text-sm text-gray-600">
                    {user.phoneVerified ? 'Verificado' : 'No verificado'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${user.phoneVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
