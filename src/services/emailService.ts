interface EmailData {
  to: string;
  subject: string;
  html: string;
}

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
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a TIYUY</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              width: 120px;
              height: 120px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              color: white;
              font-size: 48px;
              font-weight: bold;
            }
            .title {
              color: #2d3748;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #718096;
              font-size: 16px;
              margin-bottom: 30px;
            }
            .welcome-text {
              background-color: #f7fafc;
              border-left: 4px solid #4299e1;
              padding: 20px;
              margin: 20px 0;
              border-radius: 0 8px 8px 0;
            }
            .features {
              background-color: #edf2f7;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .feature-item {
              display: flex;
              align-items: center;
              margin-bottom: 15px;
            }
            .feature-icon {
              width: 24px;
              height: 24px;
              background-color: #48bb78;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
              color: white;
              font-size: 14px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              text-align: center;
              margin: 30px 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #718096;
              font-size: 14px;
            }
            .role-badge {
              display: inline-block;
              background-color: #4299e1;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">T</div>
              <h1 class="title">¡Bienvenido a TIYUY, ${firstName}!</h1>
              <p class="subtitle">Tu cuenta como <span class="role-badge">${role}</span> ha sido creada exitosamente</p>
            </div>

            <div class="welcome-text">
              <p>Estamos muy emocionados de tenerte como parte de nuestra comunidad de bienes raíces en Perú. Tu cuenta está lista para que comiences a disfrutar de todos nuestros servicios.</p>
            </div>

            <div class="features">
              <h3 style="margin-bottom: 20px; color: #2d3748;">¿Qué puedes hacer ahora?</h3>
              
              ${role === 'USER' ? `
                <div class="feature-item">
                  <div class="feature-icon">🏠</div>
                  <div><strong>Buscar propiedades</strong> - Encuentra el hogar de tus sueños</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">❤️</div>
                  <div><strong>Guardar favoritos</strong> - Guarda las propiedades que te gusten</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">📞</div>
                  <div><strong>Contactar agentes</strong> - Habla directamente con profesionales</div>
                </div>
              ` : ''}

              ${role === 'AGENT' ? `
                <div class="feature-item">
                  <div class="feature-icon">📢</div>
                  <div><strong>Publicar propiedades</strong> - Muestra tus inmuebles a miles de clientes</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">📊</div>
                  <div><strong>Gestionar leads</strong> - Recibe y organiza contactos de clientes</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">📈</div>
                  <div><strong>Analíticas</strong> - Métricas detalladas de tu desempeño</div>
                </div>
              ` : ''}

              ${role === 'DEVELOPER' ? `
                <div class="feature-item">
                  <div class="feature-icon">🏗️</div>
                  <div><strong>Crear proyectos</strong> - Gestiona múltiples desarrollos inmobiliarios</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">📋</div>
                  <div><strong>Publicaciones ilimitadas</strong> - Sin límites de propiedades</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">🎯</div>
                  <div><strong>Marketing avanzado</strong> - Herramientas promocionales premium</div>
                </div>
              ` : ''}
            </div>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="cta-button">
                Ir a mi Dashboard
              </a>
            </div>

            <div class="footer">
              <p><strong>¿Necesitas ayuda?</strong></p>
              <p>Estamos aquí para asistirte. Contáctanos en:</p>
              <p>📧 soporte@tiyuy.com | 📞 +51 123 456 789</p>
              <p style="margin-top: 20px; font-size: 12px;">
                Este es un email automático, por favor no responder a este mensaje.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      // TODO: Conectar con servicio de email real (SendGrid, AWS SES, etc.)
      // Por ahora, simulamos el envío
      
      console.log('Email de bienvenida enviado a:', email);
      console.log('Contenido:', welcomeEmail);
      
      // Simulación de envío exitoso
      return { success: true, message: 'Email de bienvenida enviado' };
      
    } catch (error) {
      console.error('Error al enviar email de bienvenida:', error);
      return { success: false, error: 'Error al enviar email' };
    }
  },

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const resetEmail = {
      to: email,
      subject: 'Recupera tu contraseña de TIYUY',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperar Contraseña - TIYUY</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              color: white;
              font-size: 32px;
              font-weight: bold;
            }
            .reset-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              text-align: center;
              margin: 30px 0;
            }
            .warning {
              background-color: #fef5e7;
              border-left: 4px solid #f39c12;
              padding: 15px;
              margin: 20px 0;
              border-radius: 0 8px 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">T</div>
              <h1 style="color: #2d3748; font-size: 24px;">Recupera tu contraseña</h1>
            </div>

            <p>Hola,</p>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta TIYUY.</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="reset-button">
                Restablecer Contraseña
              </a>
            </div>

            <div class="warning">
              <strong>Importante:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Este enlace expirará en 1 hora</li>
                <li>Si no solicitaste este cambio, ignora este email</li>
                <li>Nunca compartas este enlace con nadie</li>
              </ul>
            </div>

            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #4299e1; font-size: 12px;">${resetUrl}</p>

            <p style="margin-top: 30px;">Atentamente,<br>El equipo de TIYUY</p>
          </div>
        </body>
        </html>
      `
    };

    try {
      // TODO: Conectar con servicio de email real
      console.log('Email de recuperación enviado a:', email);
      console.log('URL de reset:', resetUrl);
      
      return { success: true, message: 'Email de recuperación enviado' };
      
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      return { success: false, error: 'Error al enviar email' };
    }
  }
};
