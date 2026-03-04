import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'El email es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Email inválido' },
        { status: 400 }
      );
    }

    // Aquí conectaremos con el backend para enviar el email de recuperación
    // Por ahora, simulamos una respuesta exitosa
    
    // TODO: Conectar con backend real
    // const response = await fetch(`${process.env.BACKEND_URL}/auth/forgot-password`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ email }),
    // });

    // Simulación de envío exitoso
    console.log(`Email de recuperación enviado a: ${email}`);

    return NextResponse.json(
      { 
        message: 'Si el email está registrado, recibirás las instrucciones para recuperar tu contraseña' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { message: 'Error del servidor. Inténtalo nuevamente' },
      { status: 500 }
    );
  }
}
