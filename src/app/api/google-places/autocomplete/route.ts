import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!input || !apiKey) {
    return NextResponse.json(
      { error: 'Missing input or API key' },
      { status: 400 }
    );
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&components=country:pe&types=(cities)&language=es`;
    
    console.log('Proxying Google Places autocomplete:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Agregar headers CORS
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error) {
    console.error('Error in Google Places proxy:', error);
    
    // Fallback con datos comunes de Lima
    const fallbackData = {
      predictions: [
        {
          place_id: 'fallback_1',
          description: `${input}, Lima, Perú`,
          structured_formatting: {
            main_text: input,
            secondary_text: 'Lima, Perú'
          }
        },
        {
          place_id: 'fallback_2',
          description: 'Miraflores, Lima, Perú',
          structured_formatting: {
            main_text: 'Miraflores',
            secondary_text: 'Lima, Perú'
          }
        },
        {
          place_id: 'fallback_3',
          description: 'Surco, Lima, Perú',
          structured_formatting: {
            main_text: 'Surco',
            secondary_text: 'Lima, Perú'
          }
        }
      ],
      status: 'OK'
    };
    
    return NextResponse.json(fallbackData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
