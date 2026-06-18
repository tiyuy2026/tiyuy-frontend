'use client';

import { useState, useRef } from 'react'; import { useChannels } from '@/presentation/hooks/useChannels'; import { toast } from '@/presentation/store/toastStore'; import { ChevronLeft, AlertCircle, Briefcase, Building2, User, Users, Lock } from 'lucide-react';

export default function CreateChannelView({ user, onBack }: { user: any; onBack: () => void }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createChannel, isCreatingChannel } = useChannels(user?.id);
  const canCreateChannel = user?.role === 'AGENT' || user?.role === 'INMOBILIARIA';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen valida (JPG, PNG, GIF)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !city.trim() || !description.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (!canCreateChannel) {
      toast.error('¡Hola! Para crear canales necesitas ser Agente Inmobiliario o Empresa. Si quieres crear un canal, contacta a nuestro equipo para actualizar tu rol.');
      return;
    }

    setIsCreating(true);
    
    try {
      let avatarUrl = '';
      if (avatarFile) {
        avatarUrl = `https://api.tiyuy.com/avatars/${Date.now()}_${avatarFile.name}`;
      }
      
      await createChannel({
        name: name.trim(),
        city: city.trim(),
        description: description.trim(),
        avatar: avatarUrl || undefined
      });
      
      toast.success('¡Canal creado exitosamente!');
      onBack();
    } catch (error: any) {
      if (error.message.includes('403')) {
        toast.error('¡Ups! No tienes permisos para crear canales. Solo Agentes y Empresas pueden crear canales. Contacta a soporte si crees que esto es un error.');
      } else {
        toast.error(error.message || 'Error al crear canal. Por favor intenta nuevamente.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="h-full bg-white p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Canal</h2>
          <button 
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {!canCreateChannel ? (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-amber-900 mb-4">¿Quieres crear un canal?</h3>
            <div className="bg-white rounded-lg p-6 border border-amber-200 mb-6">
              <p className="text-amber-800 font-medium mb-4">
                ¡Hola! Para crear canales necesitas ser <strong>Agente Inmobiliario</strong> o <strong>Empresa</strong>.
              </p>
              <div className="text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 mb-1">Agente Inmobiliario</h4>
                    <p className="text-sm text-green-600">Publica propiedades y crea canales</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Empresa</h4>
                    <p className="text-sm text-blue-600">Gestiona múltiples agentes y propiedades</p>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mt-4">
                <p className="text-xs text-amber-700 font-medium mb-2">¿Cómo obtener permisos?</p>
                <ul className="text-xs text-amber-600 space-y-1 text-left">
                  <li>• Contacta a nuestro equipo de soporte</li>
                  <li>• Actualiza tu cuenta a rol Agente/Empresa</li>
                  <li>• Obtén acceso a todas las herramientas profesionales</li>
                </ul>
              </div>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium cursor-pointer"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del canal *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Lima Inmobiliaria Oficial"
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {name.length}/50 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad/Region *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej: Lima"
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {city.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripcion *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu canal y el tipo de contenido que compartiras..."
                maxLength={1000}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/1000 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar (Opcional)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm cursor-pointer"
                  >
                    {avatarFile ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG o GIF. Max 5MB
                  </p>
                  {avatarFile && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {avatarFile.name} ({(avatarFile.size / 1024 / 1024).toFixed(2)}MB)
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Canal *
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="channelType"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Público</div>
                    <div className="text-sm text-gray-500">Cualquier usuario puede encontrar y suscribirse</div>
                  </div>
                  <Users className="w-5 h-5 text-green-500" />
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="channelType"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Privado</div>
                    <div className="text-sm text-gray-500">Solo usuarios invitados pueden suscribirse</div>
                  </div>
                  <Lock className="w-5 h-5 text-orange-500" />
                </label>
              </div>
            </div>

            <div className={`${isPublic ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4`}>
              <h3 className={`font-semibold mb-2 ${isPublic ? 'text-blue-900' : 'text-orange-900'}`}>
                {isPublic ? 'Canal Público' : 'Canal Privado'}
              </h3>
              <ul className={`text-sm space-y-1 ${isPublic ? 'text-blue-800' : 'text-orange-800'}`}>
                {isPublic ? (
                  <>
                    <li>• Cualquier usuario puede encontrar y suscribirse</li>
                    <li>• Ideal para contenido general y noticias</li>
                    <li>• Mayor alcance y visibilidad</li>
                    <li>• Los posts expiran automaticamente en 30 dias</li>
                  </>
                ) : (
                  <>
                    <li>• Solo usuarios invitados pueden suscribirse</li>
                    <li>• Ideal para contenido exclusivo</li>
                    <li>• Mayor control y privacidad</li>
                    <li>• Los posts expiran automaticamente en 30 dias</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreating || !name.trim() || !city.trim() || !description.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Canal'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}