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
};
