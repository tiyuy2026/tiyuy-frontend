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

      const data = await response.json().catch(() => ({}));

      // Manejar respuesta explícita del backend
      if (response.ok) {
        if (typeof data.exists === 'boolean') {
          return NextResponse.json({ exists: data.exists, ...data }, { status: 200 });
        }

        if (data?.message && /already|registered|exist|ya existe|registrado/i.test(data.message)) {
          return NextResponse.json({ exists: true, message: data.message }, { status: 200 });
        }

        if (data?.user || data?.email) {
          return NextResponse.json({ exists: true, ...data }, { status: 200 });
        }

        return NextResponse.json({ exists: false, ...data }, { status: 200 });
      }

      if (response.status === 409) {
        return NextResponse.json({ exists: true, message: data.message || 'El correo ya está registrado' }, { status: 200 });
      }

      if (response.status === 404) {
        return NextResponse.json({ exists: false, message: data.message || 'El correo no está registrado' }, { status: 200 });
      }

      const backendMessage = data?.message || `Error ${response.status}`;
      console.error('Backend error:', response.status, backendMessage);
      return NextResponse.json({ exists: false, message: backendMessage }, { status: 200 });

    } catch (backendError: any) {
      console.error('Error connecting to backend:', backendError);
      return NextResponse.json(
        { message: 'No se pudo verificar el correo con el backend. Intenta nuevamente más tarde.' },
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('Error en google-check-email:', error);
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    );
  }
}
