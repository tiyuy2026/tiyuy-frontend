import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json();

    // Validaciones básicas
    if (!token) {
      return NextResponse.json(
        { message: 'Token de recuperación es requerido' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: 'La contraseña es requerida' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Las contraseñas no coinciden' },
        { status: 400 }
      );
    }

    // Conectar con el backend real
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    
    try {
      const response = await fetch(`${backendUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          password,
          confirmPassword 
        }),
      });

      console.log(`Backend response: ${response.status}`);

      // ✅ Si el backend responde 200 sin cuerpo (Void), retornar éxito directo
      if (response.ok) {
        return NextResponse.json(
          { message: 'Contraseña actualizada exitosamente' },
          { status: 200 }
        );
      }

      // Solo intentar parsear JSON si hay error
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Backend no devuelve JSON:', text.substring(0, 100));
        return NextResponse.json(
          { message: 'Error del servidor' },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(
        { message: data.message || 'Error al restablecer la contraseña' },
        { status: response.status }
      );
    } catch (fetchError) {
      console.error('Error conectando al backend:', fetchError);
      return NextResponse.json(
        { message: 'No se puede conectar con el backend' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Error en reset-password:', error);
    return NextResponse.json(
      { message: 'Error del servidor. Inténtalo nuevamente' },
      { status: 500 }
    );
  }
}
