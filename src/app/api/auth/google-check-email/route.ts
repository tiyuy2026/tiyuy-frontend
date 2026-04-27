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

    // Conectar con backend real para verificar si el email existe
    const backendUrl = process.env.BACKEND_URL || 'https://tiyuy-backend.onrender.com';
    
    try {
      const response = await fetch(`${backendUrl}/auth/check-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
      });

      // Manejar diferentes respuestas del backend
      if (response.ok) {
        // Si el backend responde 200, el email no existe
        const data = await response.json();
        return NextResponse.json({ exists: false, ...data }, { status: 200 });
      } else if (response.status === 409) {
        // Si el backend responde 409 (Conflict), el email ya existe
        const errorData = await response.json();
        console.log('Email ya registrado según backend:', errorData);
        return NextResponse.json({ exists: true, message: errorData.message }, { status: 200 });
      } else {
        // Para otros errores, intentar leer el cuerpo y pasar el mensaje
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error:', response.status, errorData);
        return NextResponse.json({ 
          exists: false, 
          message: errorData.message || `Error ${response.status}` 
        }, { status: 200 });
      }

    } catch (backendError: any) {
      console.error('Error connecting to backend:', backendError);
      
      // Fallback: Simulación para desarrollo
      const commonEmails = ['test@test.com', 'admin@admin.com', 'user@user.com'];
      const exists = commonEmails.includes(email.toLowerCase());

      return NextResponse.json({ exists }, { status: 200 });
    }

  } catch (error) {
    console.error('Error en google-check-email:', error);
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    );
  }
}
