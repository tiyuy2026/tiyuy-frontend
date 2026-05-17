'use client';

import { useState } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import { ShoppingCart, DollarSign, Home, Key, Link2, ArrowRight, Check } from 'lucide-react';

interface Role {
  id: 'comprador' | 'vendedor' | 'arrendador' | 'inquilino';
  title: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  description: string;
  howToKnow: string[];
  steps: {
    title: string;
    description: string;
    actions: {
      title: string;
      description: string;
      link: string;
      steps: string[];
    }[];
    why?: string[];
    shows?: string[];
    documents?: string[];
    tips?: string[];
    important?: string;
    conditions?: string[];
  }[];
}

const roles: Role[] = [
  {
    id: 'comprador',
    title: 'COMPRADOR',
    color: 'text-[#5dae4c]',
    bgColor: 'bg-[#5dae4c]/10',
    icon: <ShoppingCart className="w-8 h-8 text-[#5dae4c]" />,
    description: 'Persona que quiere comprar una propiedad (casa, departamento, terreno, local).',
    howToKnow: [
      'Estás buscando una propiedad para comprar',
      'No eres dueño del inmueble',
      'Quieres ver opciones y contactar vendedores'
    ],
    steps: [
      {
        title: 'Verificar que el vendedor sea realmente el dueño',
        description: 'Debes ingresar a SUNARP y consultar la propiedad',
        actions: [
          {
            title: 'SUNARP – Consulta de Propiedad',
            description: 'https://www.sunarp.gob.pe/servicios-en-linea',
            link: 'https://www.sunarp.gob.pe/servicios-en-linea',
            steps: [
              'Selecciona "Publicidad Registral en Línea"',
              'Dale a "Búsqueda por nombre del titular"',
              'Escribe el nombre completo de la persona que dice ser dueña',
              'Revisa si aparece como propietario'
            ]
          }
        ],
        why: ['Para evitar estafas', 'Para saber si la propiedad está inscrita legalmente']
      },
      {
        title: 'Ver la Partida Registral de la propiedad',
        description: 'En la misma web de SUNARP obtén el documento oficial',
        actions: [
          {
            title: 'SUNARP – Publicidad Registral en Línea',
            description: 'https://www.sunarp.gob.pe/servicios-en-linea',
            link: 'https://www.sunarp.gob.pe/servicios-en-linea',
            steps: [
              'Entra a "Publicidad Registral en Línea"',
              'Elige "Búsqueda por número de partida" o "Búsqueda por dirección"',
              'Descarga la Partida Registral PDF'
            ]
          }
        ],
        shows: ['Nombre del dueño', 'Medidas reales', 'Cargas o denuncias', 'Hipotecas', 'Embargos']
      },
      {
        title: 'Revisar si la propiedad tiene deudas de impuestos',
        description: 'Si la propiedad está en Lima, verifica en SAT',
        actions: [
          {
            title: 'SAT Lima – Consulta de Predial y Arbitrios',
            description: 'https://www.sat.gob.pe',
            link: 'https://www.sat.gob.pe',
            steps: [
              'En el menú, selecciona "Consulta de tributos"',
              'Elige "Predial y Arbitrios"',
              'Ingresa la dirección o número de contribuyente',
              'Revisa si hay pagos pendientes'
            ]
          }
        ]
      },
      {
        title: 'Validar la identidad del vendedor',
        description: 'Debes pedirle documentos que confirmen su identidad',
        actions: [],
        documents: ['Foto de DNI', 'Selfie sosteniendo el DNI', 'Número de celular activo', 'Confirmar nombre en RENIEC (si la app lo permite)']
      }
    ]
  },
  {
    id: 'vendedor',
    title: 'VENDEDOR',
    color: 'text-[#5dae4c]',
    bgColor: 'bg-[#5dae4c]/10',
    icon: <DollarSign className="w-8 h-8 text-[#5dae4c]" />,
    description: 'Eres la persona dueña del inmueble y quieres venderlo.',
    howToKnow: [
      'La propiedad está a tu nombre',
      'Quieres crear una publicación para vender',
      'Quieres recibir mensajes de compradores'
    ],
    steps: [
      {
        title: 'Obtener la Partida Registral actualizada',
        description: 'Debes ingresar a SUNARP para obtener el documento oficial',
        actions: [
          {
            title: 'SUNARP – Publicidad Registral en Línea',
            description: 'https://www.sunarp.gob.pe/servicios-en-linea',
            link: 'https://www.sunarp.gob.pe/servicios-en-linea',
            steps: [
              'Selecciona "Búsqueda por número de partida"',
              'Descarga la Partida Registral (PDF)'
            ]
          }
        ],
        why: ['Para demostrar que eres el dueño', 'Para subirla a la app', 'Para evitar que compradores desconfíen']
      },
      {
        title: 'Verificar si tienes deudas pendientes',
        description: 'Si la propiedad está en Lima, revisa en SAT',
        actions: [
          {
            title: 'SAT – Pagos de Predial y Arbitrios',
            description: 'https://www.sat.gob.pe',
            link: 'https://www.sat.gob.pe',
            steps: [
              'Selecciona "Predial y Arbitrios"',
              'Ingresa dirección o código del contribuyente',
              'Verifica si debes algo'
            ]
          }
        ],
        important: 'Los compradores revisan esto antes de decidir.'
      },
      {
        title: 'Registrar un precio correcto',
        description: 'Como vendedor, debes investigar el mercado',
        actions: [],
        tips: [
          'Revisar precios de mercado',
          'Comparar propiedades similares',
          'Usar una tasación si deseas más precisión'
        ]
      },
      {
        title: 'Reunir documentos básicos',
        description: 'Debes tener listos estos documentos',
        actions: [],
        documents: ['DNI', 'Partida Registral', 'Información de medidas', 'Planos (si los tienes)', 'Declaración de predios (opcional)']
      }
    ]
  },
  {
    id: 'arrendador',
    title: 'ARRENDADOR (Dueño que alquila)',
    color: 'text-[#5dae4c]',
    bgColor: 'bg-[#5dae4c]/10',
    icon: <Home className="w-8 h-8 text-[#5dae4c]" />,
    description: 'Persona que es dueña de una propiedad y desea alquilarla.',
    howToKnow: [
      'Tienes una propiedad a tu nombre',
      'No deseas venderla',
      'Quieres recibir inquilinos'
    ],
    steps: [
      {
        title: 'Verificar tu propiedad en SUNARP',
        description: 'Para evitar suplantaciones en contratos',
        actions: [
          {
            title: 'SUNARP – Publicidad Registral en Línea',
            description: 'https://www.sunarp.gob.pe/servicios-en-linea',
            link: 'https://www.sunarp.gob.pe/servicios-en-linea',
            steps: [
              'Selecciona "Búsqueda por número de partida"',
              'Descarga el archivo en PDF',
              'Guarda el documento para subirlo a la app'
            ]
          }
        ]
      },
      {
        title: 'Registrar tu contrato de alquiler (opcional pero recomendado)',
        description: 'En Perú, puedes registrar el contrato para que sea más seguro',
        actions: [
          {
            title: 'SUNARP – Registro de Contrato de Arrendamiento',
            description: 'https://www.sunarp.gob.pe/servicios-en-linea',
            link: 'https://www.sunarp.gob.pe/servicios-en-linea',
            steps: [
              'Elige "Presentar título"',
              'Selecciona "Contrato de arrendamiento"',
              'Rellena los datos',
              'Sube el contrato',
              'Paga la tasa (aprox. 30–40 soles)'
            ]
          }
        ]
      },
      {
        title: 'Si emitirás recibos, debes usar SUNAT',
        description: 'Si quieres declarar ingresos por alquiler',
        actions: [
          {
            title: 'SUNAT – Clave SOL / Rentas',
            description: 'https://www.sunat.gob.pe',
            link: 'https://www.sunat.gob.pe',
            steps: [
              'Entra en "Trámites y consultas"',
              'Inicia sesión con tu Clave SOL',
              'Selecciona "Renta – Primera categoría"',
              'Declara el monto mensual del alquiler'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'inquilino',
    title: 'INQUILINO',
    color: 'text-[#5dae4c]',
    bgColor: 'bg-[#5dae4c]/10',
    icon: <Key className="w-8 h-8 text-[#5dae4c]" />,
    description: 'Persona que busca alquilar una propiedad.',
    howToKnow: [
      'No tienes propiedad',
      'Buscas un lugar para vivir o trabajar',
      'Necesitas contactar a dueños'
    ],
    steps: [
      {
        title: 'Verificar que el dueño sea real',
        description: 'Ir a SUNARP y consulta la titularidad',
        actions: [
          {
            title: 'SUNARP – Consulta de titularidad',
            description: 'https://www.sunarp.gob.pe/servicios-en-linea',
            link: 'https://www.sunarp.gob.pe/servicios-en-linea',
            steps: [
              'Selecciona "Búsqueda por nombre del titular"',
              'Escribe el nombre del arrendador',
              'Confirma que aparece como propietario'
            ]
          }
        ]
      },
      {
        title: 'Revisar condiciones del alquiler antes de firmar',
        description: 'El dueño debe darte esta información',
        actions: [],
        conditions: [
          'Precio mensual',
          'Monto de garantía',
          'Reglas del inmueble',
          'Tiempo mínimo de contrato'
        ]
      },
      {
        title: 'Revisar si el inmueble tiene deudas de arbitrios o predial',
        description: 'Si estás en Lima, verifica en SAT',
        actions: [
          {
            title: 'SAT Lima – Consulta de arbitrios',
            description: 'https://www.sat.gob.pe',
            link: 'https://www.sat.gob.pe',
            steps: [
              'Elige "Predial y Arbitrios"',
              'Ingresa dirección',
              'Revisa si hay deudas importantes'
            ]
          }
        ]
      },
      {
        title: 'Revisar identidad del arrendador',
        description: 'Pide estos documentos para verificar',
        actions: [],
        documents: ['Foto del DNI', 'Selfie con DNI', 'Número celular', 'Partida Registral del inmueble']
      }
    ]
  }
];

export default function GuiaAlquilarPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string>('');

  const downloadGuide = (role: Role) => {
    // Crear nuevo documento PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Configurar fuentes y colores
    const primaryColor: [number, number, number] = [93, 174, 76]; // #5dae4c
    const secondaryColor: [number, number, number] = [74, 154, 62]; // #4a9a3e
    const textColor: [number, number, number] = [31, 41, 55]; // gray-800
    
    // Página 1: Título y descripción
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('GUIA PARA ALQUILAR', 105, 20, { align: 'center' } as any);
    
    doc.setFontSize(16);
    doc.text(role.title.toUpperCase(), 105, 30, { align: 'center' } as any);
    
    // Contenido principal
    let yPosition = 60;
    
    // ¿Quién eres?
    doc.setTextColor(...textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('¿QUIEN ERES?', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const descriptionLines = doc.splitTextToSize(role.description, 170);
    doc.text(descriptionLines, 20, yPosition);
    yPosition += descriptionLines.length * 7 + 10;
    
    // ¿Cómo saber si este es tu perfil?
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('¿COMO SABER SI ESTE ES TU PERFIL?', 20, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    role.howToKnow.forEach((item, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`✔ ${item}`, 25, yPosition);
      yPosition += 7;
    });
    
    yPosition += 10;
    
    // Pasos a seguir
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PASOS QUE DEBES SEGUIR', 20, yPosition);
    yPosition += 15;
    
    role.steps.forEach((step, index) => {
      // Nueva página si es necesario
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Título del paso
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setFillColor(...primaryColor);
      doc.rect(15, yPosition - 8, 180, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(`${index + 1}. ${step.title.toUpperCase()}`, 20, yPosition);
      
      yPosition += 15;
      
      // Descripción
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const stepDescriptionLines = doc.splitTextToSize(step.description, 170);
      doc.text(stepDescriptionLines, 20, yPosition);
      yPosition += stepDescriptionLines.length * 6 + 8;
      
      // Acciones
      if (step.actions.length > 0) {
        step.actions.forEach((action, actionIndex) => {
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text(`🔗 ${action.title}`, 25, yPosition);
          yPosition += 7;
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(...primaryColor);
          doc.text(action.description, 30, yPosition);
          yPosition += 6;
          
          doc.setTextColor(...textColor);
          doc.text('Pasos a seguir:', 30, yPosition);
          yPosition += 6;
          
          action.steps.forEach((stepText, stepIndex) => {
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(`   ${stepIndex + 1}) ${stepText}`, 35, yPosition);
            yPosition += 6;
          });
          
          yPosition += 8;
        });
      }
      
      // Secciones adicionales
      if (step.why) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('¿Por qué debes hacerlo?', 25, yPosition);
        yPosition += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        step.why.forEach(reason => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`→ ${reason}`, 30, yPosition);
          yPosition += 6;
        });
        yPosition += 8;
      }
      
      if (step.shows) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Esto te mostrará:', 25, yPosition);
        yPosition += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        step.shows.forEach(item => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`• ${item}`, 30, yPosition);
          yPosition += 6;
        });
        yPosition += 8;
      }
      
      if (step.documents) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Debes tener:', 25, yPosition);
        yPosition += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        step.documents.forEach(docItem => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`• ${docItem}`, 30, yPosition);
          yPosition += 6;
        });
        yPosition += 8;
      }
      
      if (step.tips) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Recomendaciones:', 25, yPosition);
        yPosition += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        step.tips.forEach(tip => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`• ${tip}`, 30, yPosition);
          yPosition += 6;
        });
        yPosition += 8;
      }
      
      if (step.important) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(220, 38, 38); // red-600
        doc.text(`⚠ Importante: ${step.important}`, 25, yPosition);
        yPosition += 15;
        doc.setTextColor(...textColor);
      }
      
      if (step.conditions) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Condiciones a revisar:', 25, yPosition);
        yPosition += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        step.conditions.forEach(condition => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`• ${condition}`, 30, yPosition);
          yPosition += 6;
        });
        yPosition += 8;
      }
      
      yPosition += 10;
    });
    
    // Pie de página en la última página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer
      doc.setFillColor(...secondaryColor);
      doc.rect(0, 280, 210, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(`Generado por TIYUY - ${new Date().toLocaleDateString('es-PE')}`, 105, 285, { align: 'center' } as any);
      doc.text('https://tiyuy.com', 105, 292, { align: 'center' } as any);
      
      // Número de página
      doc.text(`Página ${i} de ${pageCount}`, 105, 298, { align: 'center' } as any);
    }
    
    // Guardar el PDF
    doc.save(`guia-alquilar-${role.id}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Mostrar mensaje de éxito
    setShowSuccessMessage(`¡Guía para ${role.title} descargada en PDF!`);
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const shareGuide = (role: Role) => {
    const text = `Guía para alquilar - ${role.title}\n\n${role.description}\n\nVer la guía completa en: https://tiyuy.com/guia-alquilar`;
    
    if (navigator.share) {
      navigator.share({
        title: `Guía para alquilar - ${role.title}`,
        text: text,
        url: window.location.href
      }).then(() => {
        setShowSuccessMessage('¡Guía compartida exitosamente!');
        setTimeout(() => setShowSuccessMessage(''), 3000);
      }).catch(() => {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(text);
        setShowSuccessMessage('¡Enlace copiado al portapapeles!');
        setTimeout(() => setShowSuccessMessage(''), 3000);
      });
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(text);
      setShowSuccessMessage('¡Enlace copiado al portapapeles!');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mensaje de éxito flotante */}
      {showSuccessMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-[#5dae4c] to-[#4a9a3e] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-semibold">{showSuccessMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto py-3">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-[#5dae4c] transition-colors font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Inicio
              </Link>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[#5dae4c] font-semibold bg-[#5dae4c]/10 px-3 py-1 rounded-full">Guía para alquilar</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#5dae4c] via-[#4da643] to-[#3d8b35] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-2xl"></div>
        </div>
        <div className="w-full px-8 xl:px-16 py-20 relative z-10">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>GUÍA OFICIAL TIYUY</span>
              </div>
              <h1 className="text-4xl xl:text-6xl font-bold mb-6 leading-tight">
                Identifica tu perfil y<br/>
                <span className="text-green-200">qué debes hacer</span>
              </h1>
              <p className="text-xl text-green-100/80 max-w-2xl mx-auto mb-8">
                Con instrucciones y links oficiales de entidades gubernamentales del Perú
              </p>
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">100% Gratuito</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-medium">Información Verificada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/10 to-transparent"></div>
      </div>

      {/* Selector de Roles */}
      {!selectedRole && (
        <div className="w-full px-8 xl:px-16 py-12">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block relative">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  ¿Quién eres?
                </h2>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#5dae4c] rounded-full"></div>
              </div>
              <p className="text-lg text-gray-600 mt-6 max-w-xl mx-auto">
                Selecciona tu perfil para obtener la guía personalizada con pasos detallados
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roles.map((role, index) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#5dae4c] hover:-translate-y-1 text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#5dae4c]/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-[#5dae4c]/10 transition-colors"></div>
                  
                  <div className="relative">
                    <div className={`w-14 h-14 ${role.bgColor} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {role.icon}
                    </div>
                    
                    <div className="absolute -top-1 -left-1 w-6 h-6 bg-[#5dae4c] rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {index + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#5dae4c] transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                    {role.description}
                  </p>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-[#5dae4c] font-semibold text-sm group-hover:gap-3 transition-all">
                      <span>Comenzar guía</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detalles del Rol Seleccionado */}
      {selectedRole && (
        <div className="w-full px-8 xl:px-16 py-12">
          <div className="max-w-[1920px] mx-auto">
            {/* Botón de regreso y acciones */}
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => setSelectedRole(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-[#5dae4c] font-medium transition-colors bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md border border-gray-200 hover:border-[#5dae4c]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a perfiles
              </button>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => shareGuide(selectedRole)}
                  className="flex items-center gap-2 bg-white text-[#5dae4c] px-6 py-3 rounded-xl font-semibold hover:bg-[#5dae4c] hover:text-white transition-all shadow-md hover:shadow-lg border-2 border-[#5dae4c]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                  </svg>
                  Compartir
                </button>
                
                <button
                  onClick={() => downloadGuide(selectedRole)}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#5dae4c] to-[#4a9a3e] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#4a9a3e] hover:to-[#3d8b35] transition-all shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar PDF
                </button>
              </div>
            </div>

            {/* Header del rol */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#5dae4c] to-[#4a9a3e]"></div>
              
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 bg-[#5dae4c]/10 rounded-2xl flex items-center justify-center text-5xl shadow-lg flex-shrink-0">
                  {selectedRole.icon}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedRole.title}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {selectedRole.description}
                  </p>
                </div>
              </div>
              
              {/* ¿Cómo saber si este es tu perfil? */}
              <div className="bg-gradient-to-br from-[#5dae4c]/5 to-[#5dae4c]/10 rounded-xl p-6 border border-[#5dae4c]/20">
                <h3 className="font-bold text-[#5dae4c] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  ¿Cómo saber si este es tu perfil?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedRole.howToKnow.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 bg-white/60 rounded-lg p-3">
                      <div className="w-6 h-6 bg-[#5dae4c] rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-gray-700 text-sm">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pasos a seguir */}
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-[#5dae4c]/10 text-[#5dae4c] px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>PASOS OBLIGATORIOS</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Si eres <span className="text-[#5dae4c]">{selectedRole.title}</span>, haz esto:
                </h2>
              </div>

              {selectedRole.steps.map((step, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                  <div className="flex items-stretch">
                    <div className="w-16 bg-gradient-to-br from-[#5dae4c] to-[#4a9a3e] flex flex-col items-center justify-center py-8 text-white">
                      <span className="text-3xl font-bold">{index + 1}</span>
                      <span className="text-xs uppercase mt-1 opacity-80">Paso</span>
                    </div>
                    <div className="flex-1 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#5dae4c] transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {step.description}
                      </p>

                      {/* Acciones con links */}
                      {step.actions.length > 0 && (
                        <div className="space-y-4 mt-4">
                          {step.actions.map((action, actionIndex) => (
                            <div key={actionIndex} className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-[#5dae4c]/30 hover:shadow-md transition-all">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-[#5dae4c]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <Link2 className="w-5 h-5 text-[#5dae4c]" />
                                </div>
                                <h4 className="font-bold text-gray-900">
                                  {action.title}
                                </h4>
                              </div>
                              
                              <a
                                href={action.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 ${selectedRole.color} font-medium mb-4 hover:underline`}
                              >
                                {action.description}
                                <svg className="w-4 h-4 text-[#5dae4c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>

                              <div className="space-y-2">
                                <p className="font-semibold text-gray-700">Pasos:</p>
                                {action.steps.map((stepText, stepIndex) => (
                                  <div key={stepIndex} className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 mt-0.5">
                                      {stepIndex + 1}
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                      {stepText}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Listas adicionales */}
{step.why && (
                        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                          <p className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ¿Por qué debes hacerlo?
                          </p>
                          <div className="space-y-2">
                            {step.why.map((reason, whyIndex) => (
                              <p key={whyIndex} className="text-amber-700 text-sm flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                <span>{reason}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.shows && (
                        <div className="mt-4 p-4 bg-[#5dae4c]/5 rounded-xl border border-[#5dae4c]/20">
                          <p className="font-bold text-[#5dae4c] mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Esto te mostrará:
                          </p>
                          <div className="space-y-2">
                            {step.shows.map((item, showIndex) => (
                              <p key={showIndex} className="text-gray-700 text-sm flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-[#5dae4c] rounded-full mt-1.5 flex-shrink-0"></span>
                                {item}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.documents && (
                        <div className="mt-4 p-4 bg-[#5dae4c]/5 rounded-xl border border-[#5dae4c]/20">
                          <p className="font-bold text-[#5dae4c] mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Debes tener:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {step.documents.map((doc, docIndex) => (
                              <p key={docIndex} className="text-gray-700 text-sm flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2">
                                <span className="w-5 h-5 bg-[#5dae4c]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3 h-3 text-[#5dae4c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                                {doc}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.tips && (
                        <div className="mt-4 p-4 bg-[#5dae4c]/5 rounded-xl border border-[#5dae4c]/20">
                          <p className="font-bold text-[#5dae4c] mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Recomendaciones:
                          </p>
                          <div className="space-y-2">
                            {step.tips.map((tip, tipIndex) => (
                              <p key={tipIndex} className="text-gray-700 text-sm flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-[#5dae4c] rounded-full mt-1.5 flex-shrink-0"></span>
                                {tip}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.conditions && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Condiciones a revisar:
                          </p>
                          <div className="space-y-2">
                            {step.conditions.map((condition, condIndex) => (
                              <p key={condIndex} className="text-gray-600 text-sm flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                {condition}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.shows && (
                        <div className="mt-4 p-4 bg-[#5dae4c]/10 rounded-lg border border-[#5dae4c]/20">
                          <p className="font-semibold text-[#5dae4c] mb-2">Esto te mostrará:</p>
                          {step.shows.map((item, showIndex) => (
                            <p key={showIndex} className="text-gray-700 text-sm">
                              • {item}
                            </p>
                          ))}
                        </div>
                      )}

                      {step.documents && (
                        <div className="mt-4 p-4 bg-[#5dae4c]/10 rounded-lg border border-[#5dae4c]/20">
                          <p className="font-semibold text-[#5dae4c] mb-2">Debes tener:</p>
                          {step.documents.map((doc, docIndex) => (
                            <p key={docIndex} className="text-gray-700 text-sm">
                              • {doc}
                            </p>
                          ))}
                        </div>
                      )}

                      {step.tips && (
                        <div className="mt-4 p-4 bg-[#5dae4c]/10 rounded-lg border border-[#5dae4c]/20">
                          <p className="font-semibold text-[#5dae4c] mb-2">Recomendaciones:</p>
                          {step.tips.map((tip, tipIndex) => (
                            <p key={tipIndex} className="text-gray-700 text-sm">
                              • {tip}
                            </p>
                          ))}
                        </div>
                      )}

                      {step.important && (
                        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                          <p className="font-semibold text-red-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Importante: {step.important}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
