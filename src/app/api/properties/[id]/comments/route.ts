import { NextRequest, NextResponse } from 'next/server';

interface Comment {
  id: number;
  text: string;
  author: string;
  createdAt: string;
  lat?: number;
  lng?: number;
}

interface CreateCommentRequest {
  text: string;
  latitude?: number;
  longitude?: number;
}

// Mock de comentarios para desarrollo (reemplazar con base de datos real)
const mockComments: { [propertyId: number]: Comment[] } = {
  1: [
    {
      id: 1,
      text: "Zona muy tranquila y segura, ideal para familias. Hay varios parques cercanos y colegios de buena reputación.",
      author: "Carlos Rodríguez",
      createdAt: new Date('2024-01-15').toISOString(),
      lat: -12.0464,
      lng: -77.0428
    },
    {
      id: 2,
      text: "Excelente conectividad con el Metropolitano. Hay muchos restaurantes y centros comerciales a pocas cuadras.",
      author: "Ana Martínez",
      createdAt: new Date('2024-01-20').toISOString(),
      lat: -12.0454,
      lng: -77.0418
    }
  ],
  2: [
    {
      id: 3,
      text: "Área residencial con poco tráfico. Muy cercano a la clínica San Borja y supermercados.",
      author: "Luis Gómez",
      createdAt: new Date('2024-01-18').toISOString(),
      lat: -12.0874,
      lng: -77.0785
    }
  ]
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);
    
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'ID de propiedad inválido' },
        { status: 400 }
      );
    }

    // Obtener comentarios del mock (reemplazar con llamada a base de datos)
    const comments = mockComments[propertyId] || [];

    return NextResponse.json({
      success: true,
      comments,
      total: comments.length
    });

  } catch (error) {
    console.error('Error obteniendo comentarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);
    
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'ID de propiedad inválido' },
        { status: 400 }
      );
    }

    const body: CreateCommentRequest = await request.json();
    
    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'El comentario no puede estar vacío' },
        { status: 400 }
      );
    }

    if (body.text.length > 500) {
      return NextResponse.json(
        { error: 'El comentario no puede exceder 500 caracteres' },
        { status: 400 }
      );
    }

    // Obtener token de autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Validar token (aquí deberías validar contra tu backend de autenticación)
    let userId = null;
    let userName = 'Usuario';
    
    try {
      // Mock de validación de token (reemplazar con validación real)
      const decoded = JSON.parse(atob(token.split('.')[1] || '{}'));
      userId = decoded.userId || decoded.sub;
      userName = decoded.name || decoded.email || 'Usuario';
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Crear nuevo comentario
    const newComment: Comment = {
      id: Date.now(), // Mock ID (reemplazar con ID de base de datos)
      text: body.text.trim(),
      author: userName,
      createdAt: new Date().toISOString(),
      lat: body.latitude,
      lng: body.longitude
    };

    // Guardar en mock (reemplazar con inserción en base de datos)
    if (!mockComments[propertyId]) {
      mockComments[propertyId] = [];
    }
    mockComments[propertyId].unshift(newComment);

    console.log('💬 Nuevo comentario agregado:', {
      propertyId,
      userId,
      comment: newComment
    });

    return NextResponse.json({
      success: true,
      comment: newComment,
      message: 'Comentario agregado exitosamente'
    });

  } catch (error) {
    console.error('Error creando comentario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
