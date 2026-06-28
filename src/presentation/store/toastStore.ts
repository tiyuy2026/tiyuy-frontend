'use client';

import { toast as sonnerToast } from 'sonner';

// Pequeño wrapper centralizado para poder cambiar de librería sin tocar todo el código
export const toast = {
  success(message: string) {
    sonnerToast.success(message);
  },
  error(message: string) {
    sonnerToast.error(message);
  },
  info(message: string) {
    sonnerToast.info(message);
  },
  warning(message: string) {
    sonnerToast.warning(message);
  },
};
