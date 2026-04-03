'use client';

import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { axiosClient, publicApiClient } from '@/infrastructure/api/axios-client';
import { toast } from '@/presentation/store/toastStore';

// DTOs para CRM (IGUALES)
interface CreateLeadRequest {
  propertyId: number;
  message?: string;
  contactPhone?: string;
  contactEmail?: string;
}

interface RecordPropertyViewRequest {
  propertyId: number;
  sessionId?: string;
  referrer?: string;
  userAgent?: string;
  deviceType?: 'DESKTOP' | 'TABLET' | 'MOBILE';
}

interface WhatsAppClickRequest {
  propertyId: number;
  ownerId: number;
  ownerPhone: string;
  message?: string;
  source: 'whatsapp_button' | 'contact_form' | 'property_view';
}

/**
 * Hook para trackear interacciones CRM en tiempo real
 */
export function useCRMInteraction() {
  // Crear lead cuando usuario muestra interés (WhatsApp o formulario)
  const createLead = useMutation({
    mutationFn: async (data: CreateLeadRequest) => {
      const response = await axiosClient.post('/interactions/leads', {
        propertyId: data.propertyId,
        message: data.message || 'Interés en propiedad vía WhatsApp/Formulario',
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
      });
      return response.data;
    },
    onSuccess: () => {
      console.log('[CRM] Lead registrado exitosamente');
    },
    onError: (error: any) => {
      console.error('[CRM] Error registrando lead:', error);
    },
  });

  // Registrar vista de propiedad
  const recordView = useMutation({
    mutationFn: async (data: RecordPropertyViewRequest) => {
      const response = await axiosClient.post(`/interactions/views/${data.propertyId}`, {
        sessionId: data.sessionId,
        referrer: data.referrer,
        userAgent: data.userAgent,
        deviceType: data.deviceType,
      });
      return response.data;
    },
    onError: (error: any) => {
      console.error('[CRM] Error registrando vista:', error);
    },
  });

  // Trackear click en WhatsApp con redirección
  const trackWhatsAppClick = useMutation({
    mutationFn: async (data: WhatsAppClickRequest) => {
      const leadResponse = await axiosClient.post('/interactions/leads', {
        propertyId: data.propertyId,
        message: `Contacto vía WhatsApp: ${data.message?.substring(0, 100) || 'Solicitud de información'}`,
        source: 'whatsapp_button',
      });

      return {
        leadId: leadResponse.data?.leadId,
        ownerPhone: data.ownerPhone,
        message: data.message,
      };
    },
    onSuccess: (data) => {
      console.log('[CRM] WhatsApp click trackeado, leadId:', data.leadId);

      const formattedPhone = data.ownerPhone.replace(/\D/g, '');
      const phoneWithCountry = formattedPhone.startsWith('51') ? formattedPhone : `51${formattedPhone}`;
      const encodedMessage = encodeURIComponent(data.message || '¡Hola! Me interesa tu propiedad. ¿Podrías darme más información?');
      const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank');
    },
    onError: (error: any) => {
      console.error('[CRM] Error en trackWhatsApp:', error);
      toast.error('No se pudo procesar la solicitud');
    },
  });

  // Trackear envío de formulario de contacto (PÚBLICO - sin login)
  const trackContactForm = useMutation({
    mutationFn: async (data: {
      propertyId: number;
      contactName: string;
      contactEmail: string;
      contactPhone: string;
      message: string;
      preferredContactMethod: string;
    }) => {
      // Usar publicApiClient para permitir leads anónimos
      const leadResponse = await publicApiClient.post('/interactions/leads', {
        propertyId: data.propertyId,
        message: `${data.message} | Contactar por: ${data.preferredContactMethod}`,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        source: 'contact_form',
      });

      return leadResponse.data;
    },
    onSuccess: () => {
      toast.success('¡Mensaje enviado! El propietario te contactará pronto.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al enviar mensaje');
    },
  });

  return {
    createLead,
    recordView,
    trackWhatsAppClick,
    trackContactForm,
    isLoading: createLead.isPending || trackWhatsAppClick.isPending || trackContactForm.isPending,
  };
}

/**
 * Hook automático para trackear vistas de propiedad en CRM
 * Se ejecuta una sola vez cuando el componente se monta
 */
export function useAutoTrackCRMView(propertyId: number) {
  const { recordView } = useCRMInteraction();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (propertyId && !hasTrackedRef.current && typeof window !== 'undefined') {
      hasTrackedRef.current = true;

      const getSessionId = () => {
        let sessionId = sessionStorage.getItem('crm_session_id');
        if (!sessionId) {
          sessionId = `crm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('crm_session_id', sessionId);
        }
        return sessionId;
      };

      setTimeout(() => {
        recordView.mutate({
          propertyId,
          sessionId: getSessionId(),
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          deviceType: window.innerWidth >= 1024 ? 'DESKTOP' : window.innerWidth >= 768 ? 'TABLET' : 'MOBILE',
        });
      }, 2000);
    }
  }, [propertyId, recordView]);

  return { recordView };
}