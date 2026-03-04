import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { dni } = await request.json();

    if (!dni) {
      return NextResponse.json(
        { message: 'DNI es requerido' },
        { status: 400 }
      );
    }

    if (dni.length !== 8) {
      return NextResponse.json(
        { message: 'DNI inválido' },
        { status: 400 }
      );
    }

    // Aquí conectarías con tu backend para verificar si el DNI existe
    // Por ahora, simulamos la verificación
    
    // TODO: Conectar con backend real
    // const response = await fetch(`${process.env.BACKEND_URL}/auth/check-dni`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ dni }),
    // });
    
    // Simulación: DNIs comunes ya existen
    const commonDnis = ['12345678', '87654321', '72432182'];
    const exists = commonDnis.includes(dni);

    return NextResponse.json({ exists }, { status: 200 });

  } catch (error) {
    console.error('Error en check-dni:', error);
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    );
  }
}
