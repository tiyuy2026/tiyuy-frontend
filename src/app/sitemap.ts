import { MetadataRoute } from 'next';

// Estructura escalable para múltiples países
interface CountryConfig {
  code: string;
  name: string;
  cities: string[];
}

// Configuración de países - fácil agregar más para LATAM
const COUNTRIES: Record<string, CountryConfig> = {
  peru: {
    code: 'pe',
    name: 'Perú',
    cities: [
      // LIMA Y CALLAO
      'lima', 'miraflores', 'san-isidro', 'santiago-de-surco', 'san-borja', 'la-molina',
      'surquillo', 'magdalena', 'san-miguel', 'jesus-maria', 'pueblo-libre', 'barranco',
      'chorrillos', 'lince', 'san-juan-de-lurigancho', 'ate', 'comas', 'independencia',
      'los-olivos', 'carabayllo', 'puente-piedra', 'san-juan-de-miraflores',
      'villa-el-salvador', 'villa-maria-del-triunfo', 'san-luis', 'la-victoria',
      'rimac', 'breña', 'callao', 'bellavista', 'la-perla', 'carmen-de-la-legua',
      'ventanilla', 'mi-peru',
      
      // COSTA NORTE - Piura, Tumbes, Lambayeque, La Libertad
      'piura', 'castilla', 'catacaos', 'la-union', 'paita', 'sullana', 'talara', 'tumbes',
      'chiclayo', 'ferreñafe', 'lambayeque', 'monsefu', 'pimentel', 'reque',
      'trujillo', 'chepen', 'guadalupe', 'huanchaco', 'laredo', 'moche', 'pacasmayo',
      'viru', 'chimbote', 'nuevo-chimbote', 'samanco', 'coishco',
      
      // COSTA CENTRO - Ancash, Ica
      'huaraz', 'caraz', 'carhuaz', 'yungay', 'casma', 'pisco', 'chincha', 'ica',
      'nasca', 'palpa', 'paracas', 'chincha-alta', 'chincha-baja', 'grocio-prado',
      'sunampe', 'tambo-de-mora', 'pisco', 'san-andres', 'san-clemente',
      
      // COSTA SUR - Arequipa, Moquegua, Tacna
      'arequipa', 'cayma', 'cerro-colorado', 'characato', 'jacobo-hunter', 'mariano-melgar',
      'miraflores-arequipa', 'paucarpata', 'socabaya', 'tiabaya', 'uchumayo', 'yanahuara',
      'moquegua', 'ilo', 'tacna', 'alto-de-la-alianza', 'calana', 'ciudad-nueva', 'palca',
      
      // SIERRA NORTE - Cajamarca, Amazonas, San Martín
      'cajamarca', 'jaen', 'chota', 'celendin', 'bambamarca', 'san-ignacio', 'cutervo',
      'chachapoyas', 'bagua', 'bagua-grande', 'pedro-ruiz', 'moyobamba', 'tarapoto',
      'rioja', 'bellavista-san-martin', 'juanjui', 'lamas', 'soritor', 'yurimaguas',
      
      // SIERRA CENTRO - Huánuco, Pasco, Junín
      'huanuco', 'tingo-maria', 'amonate', 'panao', 'yarowilca', 'dos-de-mayo', 'huacaybamba',
      'cerro-de-pasco', 'oxapampa', 'villa-rica', 'pozuzo', 'yanahuanca',
      'huancayo', 'el-tambo', 'chilca', 'san-agustin', 'santa-rosa', 'san-sebastian',
      'tarma', 'jauja', 'concepcion', 'huancavelica', 'acobamba', 'lircay',
      
      // SIERRA SUR - Ayacucho, Apurímac, Cusco, Puno
      'ayacucho', 'carmen-alto', 'jesus-nazareno', 'san-juan-bautista', 'huamanga',
      'huanta', 'cangallo', 'san-miguel', 'paucar', 'morochucos',
      'abancay', 'andahuaylas', 'chuquibambilla', 'san-jeronimo', 'tamburco',
      'cusco', 'santiago', 'san-sebastian-cusco', 'wanchaq', 'san-jeronimo-cusco',
      'urubamba', 'ollantaytambo', 'calca', 'pisac', 'yucay', 'agosto-calderon',
      'machupicchu', 'santa-maria', 'santa-teresa',
      'juliaca', 'puno', 'azangaro', 'ilave', 'yunguyo', 'desaguadero', 'huancane',
      
      // SELVA - Loreto, Ucayali, Madre de Dios
      'iquitos', 'punchana', 'belen', 'san-juan-bautista-loreto', 'yurimaguas',
      'reque-loreto', 'nauta', 'caballococha', 'contamana',
      'pucallpa', 'calleria', 'coronel-portillo', 'campo-verde', 'yarinacocha',
      'aguaytia', 'atalaya', 'masisea', 'iparia',
      'puerto-maldonado', 'tambopata', 'iñapari', 'laberinto'
    ]
  }
};

const propertyTypes = ['departamentos', 'casas', 'terrenos', 'oficinas', 'locales', 'habitaciones'];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tiyuy.com';
  const lastModified = new Date();

  // URLs estáticas principales
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about-tiyuy`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rental-guide`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/plans`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const categoryUrls: MetadataRoute.Sitemap = [];

  // Generar URLs para cada país, tipo y ciudad
  for (const country of Object.values(COUNTRIES)) {
    // Top tipos de propiedad para SEO (los más buscados)
    const topTypes = propertyTypes.slice(0, 4); // departamentos, casas, terrenos, oficinas
    
    // Todas las ciudades principales del país
    for (const type of topTypes) {
      for (const city of country.cities) {
        // URL de venta
        categoryUrls.push({
          url: `${baseUrl}/sale/${type}/${city}`,
          lastModified,
          changeFrequency: 'daily',
          priority: 0.9,
        });
        
        // URL de alquiler
        categoryUrls.push({
          url: `${baseUrl}/rent/${type}/${city}`,
          lastModified,
          changeFrequency: 'daily',
          priority: 0.9,
        });
      }
    }
  }

  return [...staticUrls, ...categoryUrls];
}

// Exportar configuración para uso en otros lugares (metadata dinámica, etc.)
export { COUNTRIES, propertyTypes };
