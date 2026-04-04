'use client';

import { useState } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';

interface Role {
  id: 'comprador' | 'vendedor' | 'arrendador' | 'inquilino';
  title: string;
  color: string;
  bgColor: string;
  icon: string;
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
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: '🛒',
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
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: '💰',
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
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    icon: '🏠',
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
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: '🔑',
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
    const primaryColor: [number, number, number] = [59, 130, 246]; // blue-600
    const secondaryColor: [number, number, number] = [20, 184, 166]; // teal-600
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
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {showSuccessMessage}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Inicio
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">Guía para alquilar</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto py-16">
            <div className="text-center">
              <h1 className="text-4xl xl:text-5xl font-bold mb-4">
                IDENTIFICA TU PERFIL Y QUÉ DEBES HACER
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                (CON INSTRUCCIONES Y LINKS OFICIALES)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Roles */}
      {!selectedRole && (
        <div className="w-full px-8 xl:px-16 py-12">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¿Quién eres?
              </h2>
              <p className="text-lg text-gray-600">
                Selecciona tu perfil para obtener la guía personalizada
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-gray-200 text-left`}
                >
                  <div className={`w-16 h-16 ${role.bgColor} rounded-xl flex items-center justify-center mb-4 text-2xl`}>
                    {role.icon}
                  </div>
                  <h3 className={`text-xl font-bold ${role.color} mb-3`}>
                    {role.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {role.description}
                  </p>
                  
                  {/* ¿Cómo saber si este es tu perfil? */}
                  <div className={`${role.bgColor} rounded-lg p-4 mb-4`}>
                    <h4 className={`font-bold ${role.color} mb-2 text-sm flex items-center gap-2`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.651 2.032-2.75 3.772-2.75 1.74 0 3.223 1.099 3.772 2.75.063.19.097.39.097.597v.197c0 .208-.034.408-.097.597l-2.5 7.5a1 1 0 01-1.896 0l-2.5-7.5A2.225 2.225 0 018.228 9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v.01M12 12v.01M12 12v.01" />
                      </svg>
                      ¿Cómo saber si este es tu perfil?
                    </h4>
                    <div className="space-y-1">
                      {role.howToKnow.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className={`w-4 h-4 ${role.bgColor} ${role.color} rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>
                            ✔
                          </div>
                          <p className="text-gray-700 text-xs">
                            {item}
                          </p>
                        </div>
                      ))}
                      {role.howToKnow.length > 2 && (
                        <p className={`text-xs ${role.color} font-medium mt-1`}>
                          +{role.howToKnow.length - 2} más...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center gap-2 ${role.color} font-semibold text-sm`}>
                    <span>Ver guía completa</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a perfiles
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => shareGuide(selectedRole)}
                  className={`flex items-center gap-2 ${selectedRole.color} ${selectedRole.bgColor} px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                  </svg>
                  Compartir
                </button>
                
                <button
                  onClick={() => downloadGuide(selectedRole)}
                  className={`flex items-center gap-2 ${selectedRole.color} ${selectedRole.bgColor} px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar PDF
                </button>
              </div>
            </div>

            {/* Header del rol */}
            <div className={`${selectedRole.bgColor} rounded-xl p-8 mb-8`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-20 h-20 ${selectedRole.bgColor} rounded-xl flex items-center justify-center text-4xl border-2 border-white`}>
                  {selectedRole.icon}
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${selectedRole.color} mb-2`}>
                    {selectedRole.title}
                  </h1>
                  <p className="text-gray-700 text-lg">
                    {selectedRole.description}
                  </p>
                </div>
              </div>
              
              {/* ¿Cómo saber si este es tu perfil? */}
              <div className="bg-white/80 rounded-lg p-6 mt-6">
                <h3 className={`font-bold ${selectedRole.color} mb-3 flex items-center gap-2`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.651 2.032-2.75 3.772-2.75 1.74 0 3.223 1.099 3.772 2.75.063.19.097.39.097.597v.197c0 .208-.034.408-.097.597l-2.5 7.5a1 1 0 01-1.896 0l-2.5-7.5A2.225 2.225 0 018.228 9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v.01M12 12v.01M12 12v.01" />
                  </svg>
                  ¿Cómo saber si este es tu perfil?
                </h3>
                <div className="space-y-2">
                  {selectedRole.howToKnow.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-6 h-6 ${selectedRole.bgColor} ${selectedRole.color} rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>
                        ✔
                      </div>
                      <p className="text-gray-700">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pasos a seguir */}
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Si eres {selectedRole.title}, DEBES hacer esto:
                </h2>
              </div>

              {selectedRole.steps.map((step, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${selectedRole.bgColor} ${selectedRole.color} rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {step.description}
                      </p>

                      {/* Acciones con links */}
                      {step.actions.length > 0 && (
                        <div className="space-y-4">
                          {step.actions.map((action, actionIndex) => (
                            <div key={actionIndex} className="bg-gray-50 rounded-lg p-6">
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-8 h-8 ${selectedRole.bgColor} ${selectedRole.color} rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                                  🔗
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
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                          <p className="font-semibold text-yellow-800 mb-2">¿Por qué debes hacerlo?</p>
                          {step.why.map((reason, whyIndex) => (
                            <p key={whyIndex} className="text-yellow-700 text-sm">
                              ➡ {reason}
                            </p>
                          ))}
                        </div>
                      )}

                      {step.shows && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <p className="font-semibold text-blue-800 mb-2">Esto te mostrará:</p>
                          {step.shows.map((item, showIndex) => (
                            <p key={showIndex} className="text-blue-700 text-sm">
                              • {item}
                            </p>
                          ))}
                        </div>
                      )}

                      {step.documents && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                          <p className="font-semibold text-green-800 mb-2">Debes tener:</p>
                          {step.documents.map((doc, docIndex) => (
                            <p key={docIndex} className="text-green-700 text-sm">
                              • {doc}
                            </p>
                          ))}
                        </div>
                      )}

                      {step.tips && (
                        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                          <p className="font-semibold text-purple-800 mb-2">Recomendaciones:</p>
                          {step.tips.map((tip, tipIndex) => (
                            <p key={tipIndex} className="text-purple-700 text-sm">
                              • {tip}
                            </p>
                          ))}
                        </div>
                      )}

                      {step.important && (
                        <div className="mt-4 p-4 bg-red-50 rounded-lg">
                          <p className="font-semibold text-red-800">
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
