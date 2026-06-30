import { buildWelcomeEmail, buildPasswordResetEmail } from './emailTemplates';
import { env } from '@/config/env';

export const emailService = {
  async sendWelcomeEmail(userData: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }) {
    const { firstName, lastName, email, role } = userData;

    const welcomeEmail = {
      to: email,
      subject: '¡Bienvenido a TIYUY! Tu cuenta ha sido creada exitosamente',
      html: buildWelcomeEmail(firstName, role)
    };

    try {
      console.log('Email de bienvenida enviado a:', email);
      console.log('Contenido:', welcomeEmail);

      return { success: true, message: 'Email de bienvenida enviado' };

    } catch (error) {
      console.error('Error al enviar email de bienvenida:', error);
      return { success: false, error: 'Error al enviar email' };
    }
  },

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${env.appUrl}/reset-password?token=${resetToken}`;

    const resetEmail = {
      to: email,
      subject: 'Recupera tu contraseña de TIYUY',
      html: buildPasswordResetEmail(resetUrl)
    };

    try {
      console.log('Email de recuperación enviado a:', email);
      console.log('URL de reset:', resetUrl);

      return { success: true, message: 'Email de recuperación enviado' };

    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      return { success: false, error: 'Error al enviar email' };
    }
  }
};
