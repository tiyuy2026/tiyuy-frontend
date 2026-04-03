'use client';

import { useEffect, useRef, useState } from 'react';

// Singleton global para WebSocket - una sola conexión por usuario
let globalWebSocket: WebSocket | null = null;
let globalConnectionCount = 0;
let globalUserId: number | null = null;

// 🔥 Exportar globalUserId para que otros componentes puedan acceder
export function getCurrentUserId(): number | null {
  return globalUserId;
}

interface WebSocketMessage {
  type: 'new_message' | 'typing' | 'connection_established' | 'subscribed_to_chat' | 'unsubscribed_from_chat' | 'error';
  // Backend envía datos directos, no anidados en 'message'
  id?: number;
  userId?: number;
  chatId?: number;
  senderId?: number;
  senderName?: string;
  content?: string;
  messageType?: string;
  mediaUrl?: string;
  createdAt?: string;
}

interface UseWebSocketOptions {
  onNewMessage?: (message: any) => void;
  onTyping?: (userId: number, chatId: number) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const isConnectingRef = useRef(false);
  const maxReconnectAttempts = 5;
  const instanceId = useRef(Math.random()); // ID único para esta instancia

  const connect = () => {
    // 🔥 SINGLETON: Solo una conexión global por usuario
    if (globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
      console.log(`🔌 WebSocket global ya existe (Usuario ${globalUserId}), reutilizando...`);
      setIsConnected(true);
      setConnectionError(null);
      options.onConnectionChange?.(true);
      return;
    }

    // Evitar múltiples conexiones simultáneas
    if (isConnectingRef.current) {
      console.log('🔌 Conexión ya en progreso, ignorando...');
      return;
    }
    
    if (globalWebSocket) {
      if (globalWebSocket.readyState === WebSocket.CONNECTING) {
        console.log('🔌 WebSocket global conectando, esperando...');
        return;
      }
      // Cerrar conexión anterior si está cerrada o en error
      try {
        globalWebSocket.close();
      } catch (e) {
        console.log('Error cerrando WebSocket anterior:', e);
      }
      globalWebSocket = null;
    }
    
    isConnectingRef.current = true;
    
    try {
      // Obtener token del localStorage o authStore
      const token = localStorage.getItem('tiyuy-auth-token') || 
                   localStorage.getItem('token') || 
                   localStorage.getItem('auth-token');

      // URL del WebSocket
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL 
        || (process.env.NODE_ENV === 'production' 
            ? `wss://wasynbackend-latest.onrender.com/api/ws/chat`  // ← /api
            : `ws://localhost:8080/ws/chat`);

      console.log('🔌 Creando nueva conexión WebSocket a:', wsUrl);
      globalWebSocket = new WebSocket(wsUrl);

      globalWebSocket.onopen = () => {
        console.log('🔌 WebSocket conectado exitosamente');
        isConnectingRef.current = false;
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;

        // Autenticar y enviar token con pequeño delay para evitar CONNECTING state
        if (globalWebSocket && token) {
          setTimeout(() => {
            if (globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
              globalWebSocket.send(JSON.stringify({
                type: 'auth',
                token: token
              }));
            }
          }, 100); // 100ms delay
        }

        options.onConnectionChange?.(true);
      };

      globalWebSocket.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message:', data);

          switch (data.type) {
            case 'connection_established':
              console.log('✅ Conexión WebSocket establecida para usuario:', data.userId);
              globalUserId = data.userId || null; // 🔥 Guardar userId global
              break;

            case 'new_message':
              console.log('💬 Nuevo mensaje recibido:', data);
              options.onNewMessage?.(data); // Enviar data completo, no data.message
              break;

            case 'typing':
              console.log('⌨️ Usuario escribiendo:', data.userId, 'en chat:', data.chatId);
              options.onTyping?.(data.userId!, data.chatId!);
              break;

            case 'subscribed_to_chat':
              console.log('✅ Suscrito al chat:', data.chatId);
              break;

            case 'unsubscribed_from_chat':
              console.log('❌ Cancelada suscripción al chat:', data.chatId);
              break;

            case 'error':
              console.error('❌ Error WebSocket:', data);
              setConnectionError('Error desconocido');
              break;

            default:
              console.log('❓ Tipo de mensaje no manejado:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      globalWebSocket.onclose = (event) => {
        console.log('🔌 WebSocket desconectado:', event.code, event.reason, 'wasClean:', event.wasClean);
        isConnectingRef.current = false;
        setIsConnected(false);
        options.onConnectionChange?.(false);

        // No reconectar si fue cerrado limpiamente por nosotros
        if (event.wasClean) {
          console.log('🔌 Cierre limpio, no reconectando');
          return;
        }

        // Intentar reconectar automáticamente
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          console.log(`🔄 Intentando reconectar en ${delay}ms (intento ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('❌ Máximo de intentos de reconexión alcanzado');
          setConnectionError('No se pudo conectar al servidor de chat');
        }
      };

      globalWebSocket.onerror = (error) => {
        // Error silenciado - la reconexión se maneja en onclose
        isConnectingRef.current = false;
        // No establecer error aquí, dejar que onclose maneje la reconexión
      };

    } catch (error) {
      console.error('❌ Error creando WebSocket:', error);
      isConnectingRef.current = false;
      setConnectionError('Error al crear conexión WebSocket');
    }
  };

  const disconnect = () => {
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (globalWebSocket) {
      // Solo cerrar si está OPEN, no si está CONNECTING (causa error)
      if (globalWebSocket.readyState === WebSocket.OPEN) {
        globalWebSocket.close(1000, 'Disconnected by client'); // Código limpio
      }
      globalWebSocket = null;
    }
    
    isConnectingRef.current = false;
    setIsConnected(false);
    options.onConnectionChange?.(false);
  };

  const subscribeToChat = (chatId: number) => {
    if (globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
      globalWebSocket.send(JSON.stringify({
        type: 'subscribe_chat',
        chatId: chatId
      }));
    }
  };

  const unsubscribeFromChat = (chatId: number) => {
    if (globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
      globalWebSocket.send(JSON.stringify({
        type: 'unsubscribe_chat',
        chatId: chatId
      }));
    }
  };

  const sendTyping = (chatId: number) => {
    if (globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
      globalWebSocket.send(JSON.stringify({
        type: 'typing',
        chatId: chatId
      }));
    }
  };

  // Conectar automáticamente al montar el componente
  useEffect(() => {
    // 🔥 SINGLETON: Incrementar contador de instancias
    globalConnectionCount++;
    console.log(`🔌 useWebSocket instancia ${globalConnectionCount} (ID: ${instanceId.current})`);
    
    // Solo conectar si es la primera instancia
    if (globalConnectionCount === 1) {
      connect();
    }

    return () => {
      // 🔥 SINGLETON: Decrementar contador
      globalConnectionCount--;
      console.log(`🔌 useWebSocket cleanup, quedan ${globalConnectionCount} instancias`);
      
      // Solo desconectar si es la última instancia
      if (globalConnectionCount === 0) {
        disconnect();
        globalWebSocket = null;
        globalUserId = null;
      }
    };
  }, []);

  return {
    isConnected,
    connectionError,
    subscribeToChat,
    unsubscribeFromChat,
    sendTyping,
    disconnect,
    reconnect: connect
  };
}
