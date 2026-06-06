'use client';

import { toast as hotToast } from 'react-hot-toast';

// Pequeño wrapper centralizado para poder cambiar de librería sin tocar todo el código
export const toast = {
  success(message: string) {
    hotToast.success(message);
  },
  error(message: string) {
    hotToast.error(message);
  },
  info(message: string) {
    hotToast(message, {
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
    });
  },
  warning(message: string) {
    hotToast(message, {
      style: {
        background: '#F59E0B',
        color: '#fff',
      },
    });
  },
};
