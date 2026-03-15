'use client';

import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: 'new_message' | 'typing' | 'connection_established' | 'subscribed_to_chat' | 'unsubscribed_from_chat' | 'error';
  message?: any;
  userId?: number;
  chatId?: number;
  senderId?: number;
  senderName?: string;
  content?: string;
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
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      // Obtener token del localStorage o authStore
      const token = localStorage.getItem('tiyuy-auth-token') || 
                   localStorage.getItem('token') || 
                   localStorage.getItem('auth-token');

      // URL del WebSocket
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? `wss://wasynbackend-latest.onrender.com/ws/chat`
        : `ws://localhost:8080/ws/chat`;

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('🔌 WebSocket conectado');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;

        // Autenticar y enviar token
        if (ws.current && token) {
          ws.current.send(JSON.stringify({
            type: 'auth',
            token: token
          }));
        }

        options.onConnectionChange?.(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message:', data);

          switch (data.type) {
            case 'connection_established':
              console.log('✅ Conexión WebSocket establecida para usuario:', data.userId);
              break;

            case 'new_message':
              console.log('💬 Nuevo mensaje recibido:', data.message);
              options.onNewMessage?.(data.message);
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
              console.error('❌ Error WebSocket:', data.message);
              setConnectionError(data.message || 'Error desconocido');
              break;

            default:
              console.log('❓ Tipo de mensaje no manejado:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('🔌 WebSocket desconectado:', event.code, event.reason);
        setIsConnected(false);
        options.onConnectionChange?.(false);

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

      ws.current.onerror = (error) => {
        console.error('❌ Error WebSocket:', error);
        setConnectionError('Error de conexión WebSocket');
      };

    } catch (error) {
      console.error('❌ Error creando WebSocket:', error);
      setConnectionError('Error al crear conexión WebSocket');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
    options.onConnectionChange?.(false);
  };

  const subscribeToChat = (chatId: number) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'subscribe_chat',
        chatId: chatId
      }));
    }
  };

  const unsubscribeFromChat = (chatId: number) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'unsubscribe_chat',
        chatId: chatId
      }));
    }
  };

  const sendTyping = (chatId: number) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'typing',
        chatId: chatId
      }));
    }
  };

  // Conectar automáticamente al montar el componente
  useEffect(() => {
    connect();

    return () => {
      disconnect();
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
