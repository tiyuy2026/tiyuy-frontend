import { buildWelcomeEmail, buildPasswordResetEmail } from './emailTemplates';
import { env } from '@/config/env';

interface BrevoResponse {
  messageId?: string;
  message?: string;
}

export const brevoService = {
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<{ success: boolean; message: string }> {
    const resetUrl = `${env.appUrl}/reset-password?token=${resetToken}`;

    const emailHtml = buildPasswordResetEmail(resetUrl);

    try {
      const brevoApiKey = process.env.BREVO_API_KEY;

      if (!brevoApiKey) {
        console.warn('BREVO_API_KEY no configurada. Usando modo simulación.');
        console.log('Email de recuperación enviado a:', email);
        console.log('URL de reset:', resetUrl);
        return { success: true, message: 'Email de recuperación enviado (simulado)' };
      }

      const emailData = {
        to: email,
        subject: 'Recupera tu contraseña de TIYUY',
        html: emailHtml,
        sender: {
          name: 'TIYUY',
          email: 'noreply@tiyuy.com'
        }
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error de Brevo: ${errorData.message || response.statusText}`);
      }

      const result: BrevoResponse = await response.json();
      console.log('Email enviado con éxito a:', email, 'ID:', result.messageId);

      return { success: true, message: 'Email de recuperación enviado exitosamente' };

    } catch (error) {
      console.error('Error al enviar email con Brevo:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al enviar email de recuperación'
      };
    }
  },

  async sendWelcomeEmail(userData: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }): Promise<{ success: boolean; message: string }> {
    const { firstName, email, role } = userData;

    const emailHtml = buildWelcomeEmail(firstName, role);

    try {
      const brevoApiKey = process.env.BREVO_API_KEY;

      if (!brevoApiKey) {
        console.warn('BREVO_API_KEY no configurada. Usando modo simulación.');
        console.log('Email de bienvenida enviado a:', email);
        return { success: true, message: 'Email de bienvenida enviado (simulado)' };
      }

      const emailData = {
        to: [{ email }],
        subject: '¡Bienvenido a TIYUY! Tu cuenta ha sido creada exitosamente',
        html: emailHtml,
        sender: {
          name: 'TIYUY',
          email: 'noreply@tiyuy.com'
        }
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error de Brevo: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('Email de bienvenida enviado con éxito a:', email, 'ID:', result.messageId);

      return { success: true, message: 'Email de bienvenida enviado exitosamente' };

    } catch (error) {
      console.error('Error al enviar email de bienvenida con Brevo:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al enviar email de bienvenida'
      };
    }
  }
};
