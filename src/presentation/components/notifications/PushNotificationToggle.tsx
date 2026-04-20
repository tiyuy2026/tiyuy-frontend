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
    // Check if already registered
    const existing = await navigator.serviceWorker.getRegistration('/sw.js');
    if (existing) return existing;
    
    // Register new
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
  
  // Wait for service worker to be ready
  await navigator.serviceWorker.ready;
  
  // VAPID public key for Tiyuy
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
    // Check if push is supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      
      // Check existing subscription
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
      // Request permission first
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result !== 'granted') {
        alert('Necesitas permitir las notificaciones para recibir alertas push');
        return;
      }
      
      // Subscribe
      const subscription = await subscribeToPush();
      if (subscription) {
        await subscribeMutation.mutateAsync(subscription);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      alert('Error al suscribirse a notificaciones push');
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleUnsubscribe() {
    setIsLoading(true);
    
    try {
      const success = await unsubscribeFromPush();
      if (success) {
        // Get the endpoint to send to backend
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
      <div className={`text-sm text-gray-500 ${className}`}>
        Tu navegador no soporta notificaciones push
      </div>
    );
  }
  
  // Permission denied
  if (permission === 'denied') {
    return (
      <div className={`text-sm text-red-500 ${className}`}>
        Has bloqueado las notificaciones. Actívalas en la configuración de tu navegador.
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        {isSubscribed ? (
          <div className="flex items-center gap-2 text-green-600">
            <Bell className="w-5 h-5" />
            <span className="text-sm font-medium">Notificaciones activadas</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <BellOff className="w-5 h-5" />
            <span className="text-sm">Notificaciones desactivadas</span>
          </div>
        )}
      </div>
      
      <button
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        disabled={isLoading || subscribeMutation.isPending || unsubscribeMutation.isPending}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
          isSubscribed
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading || subscribeMutation.isPending || unsubscribeMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isSubscribed ? 'Desactivando...' : 'Activando...'}
          </>
        ) : (
          <>
            {isSubscribed ? (
              <>
                <BellOff className="w-4 h-4" />
                Desactivar
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Activar notificaciones
              </>
            )}
          </>
        )}
      </button>
    </div>
  );
}
