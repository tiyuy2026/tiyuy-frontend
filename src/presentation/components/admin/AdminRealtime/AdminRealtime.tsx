/**
 * Admin Real-time Component
 * WebSocket integration for real-time updates
 * Based on backend ChatWebSocketHandler
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/presentation/store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';

interface RealtimeEvent {
  type: 'new_message' | 'typing' | 'connection_established' | 'error' | 'campaign_update' | 'discount_update';
  timestamp: string;
  data: any;
}

interface WebSocketMessage {
  type: string;
  userId?: number;
  chatId?: number;
  message?: any;
  error?: string;
}

export function AdminRealtime() {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastActivity, setLastActivity] = useState<string>('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuthStore();

  // WebSocket connection
  const connectWebSocket = () => {
    if (!user?.token) return;

    setConnectionStatus('connecting');
    
    try {
      const wsUrl = `ws://localhost:8080/ws/chat`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        setLastActivity(new Date().toISOString());
        
        // Authenticate with JWT token
        ws.send(JSON.stringify({
          type: 'auth',
          token: user.token
        }));

        addEvent({
          type: 'connection_established',
          timestamp: new Date().toISOString(),
          data: { userId: user.id }
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        addEvent({
          type: 'error',
          timestamp: new Date().toISOString(),
          data: { error: 'WebSocket connection error' }
        });
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  };

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    setLastActivity(new Date().toISOString());

    switch (message.type) {
      case 'connection_established':
        console.log('WebSocket authenticated:', message.userId);
        break;

      case 'new_message':
        handleNewMessage(message);
        break;

      case 'typing':
        handleTypingIndicator(message);
        break;

      case 'campaign_update':
        handleCampaignUpdate(message);
        break;

      case 'discount_update':
        handleDiscountUpdate(message);
        break;

      case 'error':
        console.error('WebSocket error:', message.error);
        addEvent({
          type: 'error',
          timestamp: new Date().toISOString(),
          data: { error: message.error }
        });
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  };

  // Handle new messages
  const handleNewMessage = (message: WebSocketMessage) => {
    if (message.message) {
      addEvent({
        type: 'new_message',
        timestamp: new Date().toISOString(),
        data: {
          chatId: message.message.chatId,
          senderId: message.message.senderId,
          senderName: message.message.senderName,
          content: message.message.content,
          type: message.message.type
        }
      });
      setUnreadCount(prev => prev + 1);
    }
  };

  // Handle typing indicators
  const handleTypingIndicator = (message: WebSocketMessage) => {
    if (message.userId && message.chatId) {
      setTypingUsers(prev => {
        const updated = new Map(prev);
        updated.set(message.userId!, `User ${message.userId} is typing in chat ${message.chatId}`);
        // Remove typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers(current => {
            const newMap = new Map(current);
            newMap.delete(message.userId!);
            return newMap;
          });
        }, 3000);
        return updated;
      });
    }
  };

  // Handle campaign updates
  const handleCampaignUpdate = (message: WebSocketMessage) => {
    addEvent({
      type: 'campaign_update',
      timestamp: new Date().toISOString(),
      data: message.data
    });
  };

  // Handle discount updates
  const handleDiscountUpdate = (message: WebSocketMessage) => {
    addEvent({
      type: 'discount_update',
      timestamp: new Date().toISOString(),
      data: message.data
    });
  };

  // Add event to event log
  const addEvent = (event: RealtimeEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 50)); // Keep last 50 events
  };

  // Subscribe to chat
  const subscribeToChat = (chatId: number) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe_chat',
        chatId
      }));
    }
  };

  // Send typing indicator
  const sendTyping = (chatId: number) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        chatId
      }));
    }
  };

  // Clear events
  const clearEvents = () => {
    setEvents([]);
    setUnreadCount(0);
  };

  // Connect on mount and disconnect on unmount
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user?.token]);

  // Get connection status color
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get event icon
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'new_message': return '??';
      case 'typing': return '??';
      case 'connection_established': return '??';
      case 'campaign_update': return '??';
      case 'discount_update': return '??';
      case 'error': return '??';
      default: return '??';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Real-time Connection</span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {connectionStatus}
              </span>
              {isConnected && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{events.length}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{unreadCount}</div>
              <div className="text-sm text-gray-600">Unread Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{typingUsers.size}</div>
              <div className="text-sm text-gray-600">Typing Users</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {lastActivity ? new Date(lastActivity).toLocaleTimeString() : 'No activity'}
              </div>
              <div className="text-sm text-gray-600">Last Activity</div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={connectWebSocket}
              disabled={isConnected}
              variant={isConnected ? 'outline' : 'primary'}
            >
              {isConnected ? 'Connected' : 'Reconnect'}
            </Button>
            <Button onClick={clearEvents} variant="outline">
              Clear Events
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Typing Indicators */}
      {typingUsers.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Typing Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(typingUsers.entries()).map(([userId, message]) => (
                <div key={userId} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>{message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Event Log</span>
            <span className="text-sm text-gray-600">Last 50 events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No events yet. Connect to start receiving real-time updates.
              </div>
            ) : (
              events.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg">{getEventIcon(event.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 capitalize">
                        {event.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {JSON.stringify(event.data, null, 2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
