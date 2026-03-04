import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Aquí conectarías con tu backend para verificar si el email existe
    // Por ahora, simulamos la verificación
    
    // TODO: Conectar con backend real
    // const response = await fetch(`${process.env.BACKEND_URL}/auth/check-email`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email }),
    // });
    
    // Simulación: emails comunes ya existen
    const commonEmails = ['test@test.com', 'admin@admin.com', 'user@user.com'];
    const exists = commonEmails.includes(email.toLowerCase());

    return NextResponse.json({ exists }, { status: 200 });

  } catch (error) {
    console.error('Error en check-email:', error);
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    );
  }
}
