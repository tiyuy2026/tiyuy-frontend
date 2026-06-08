'use client';

import { useState, useEffect } from 'react';
import { usePushSubscribe, usePushUnsubscribe, usePushStatus, PushSubscription } from '@/presentation/hooks/useAnalytics';
import { Bell, BellOff, Loader2 } from 'lucide-react';

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Get or register service worker
async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }
  
  try {
    const existing = await navigator.serviceWorker.getRegistration('/sw.js');
    if (existing) return existing;
    
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('[Push] Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('[Push] Service Worker registration failed:', error);
    return null;
  }
}

// Subscribe to push notifications
async function subscribeToPush(): Promise<PushSubscription | null> {
  const registration = await getServiceWorkerRegistration();
  if (!registration) return null;
  
  await navigator.serviceWorker.ready;
  
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
    'BI1_F5Kp6a5z8m2rA8FhM1YV1uxpKNuoa3McI5qFs70iZfNdfUkwnbIM0MWacP56qIqtP0JtwlUsJPnRD7xCcS0';
  
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource
    });
    
    console.log('[Push] Subscribed:', subscription);
    
    return {
      endpoint: subscription.endpoint,
      p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
      auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
      userAgent: navigator.userAgent
    };
  } catch (error) {
    console.error('[Push] Subscription failed:', error);
    return null;
  }
}

// Unsubscribe from push
async function unsubscribeFromPush(): Promise<boolean> {
  const registration = await getServiceWorkerRegistration();
  if (!registration) return false;
  
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    console.log('[Push] Unsubscribed');
    return true;
  }
  return false;
}

interface PushNotificationToggleProps {
  className?: string;
}

export function PushNotificationToggle({ className = '' }: PushNotificationToggleProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const subscribeMutation = usePushSubscribe();
  const unsubscribeMutation = usePushUnsubscribe();
  const { data: pushStatus } = usePushStatus();
  
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);
  
  useEffect(() => {
    if (pushStatus?.subscribed !== undefined) {
      setIsSubscribed(pushStatus.subscribed);
    }
  }, [pushStatus]);
  
  async function checkSubscription() {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    }
  }
  
  async function handleSubscribe() {
    setIsLoading(true);
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result !== 'granted') {
        return;
      }
      
      const subscription = await subscribeToPush();
      if (subscription) {
        await subscribeMutation.mutateAsync(subscription);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleUnsubscribe() {
    setIsLoading(true);
    
    try {
      const success = await unsubscribeFromPush();
      if (success) {
        const registration = await navigator.serviceWorker.getRegistration('/sw.js');
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) {
          await unsubscribeMutation.mutateAsync(subscription.endpoint);
        }
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Not supported
  if (!isSupported) {
    return (
      <div className={`text-xs text-slate-400 ${className}`}>
        No soportado
      </div>
    );
  }
  
  // Permission denied - Chrome bloqueó permanentemente
  if (permission === 'denied') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-center gap-2">
          <BellOff className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
          <span className="text-xs text-red-600 font-medium">Notificaciones bloqueadas por Chrome</span>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800 font-medium mb-2">Para activar las notificaciones:</p>
          <ol className="text-xs text-amber-700 space-y-1.5 list-decimal list-inside">
            <li>Haz clic en el <strong>icono del candado 🔒</strong> (o <strong>i</strong>) junto a la URL</li>
            <li>Ve a <strong>Configuración del sitio</strong> o <strong>Permisos</strong></li>
            <li>Busca <strong>Notificaciones</strong> y cámbialo a <strong>Permitir</strong></li>
            <li>Recarga la página y haz clic en <strong>Activar</strong></li>
          </ol>
        </div>
        <button
          onClick={async () => {
            setIsLoading(true);
            try {
              const result = await Notification.requestPermission();
              setPermission(result);
              if (result === 'granted') {
                const subscription = await subscribeToPush();
                if (subscription) {
                  await subscribeMutation.mutateAsync(subscription);
                  setIsSubscribed(true);
                }
              }
            } catch (error) {
              console.error('Failed to request permission:', error);
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 w-full"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <BellOff className="w-3.5 h-3.5" />
          )}
          {isLoading ? 'Verificando...' : 'Reintentar después de cambiar'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
      disabled={isLoading || subscribeMutation.isPending || unsubscribeMutation.isPending}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
        isSubscribed
          ? 'bg-green-50 text-green-700 hover:bg-green-100'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      } ${className}`}
    >
      {isLoading || subscribeMutation.isPending || unsubscribeMutation.isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="w-3.5 h-3.5" />
      ) : (
        <BellOff className="w-3.5 h-3.5" />
      )}
      {isLoading || subscribeMutation.isPending || unsubscribeMutation.isPending
        ? '...'
        : isSubscribed
          ? 'Push ON'
          : 'Push OFF'}
    </button>
  );
}
