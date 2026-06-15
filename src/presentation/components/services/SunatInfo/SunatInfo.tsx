'use client';

import Link from 'next/link';
import { 
  Building, 
  FileSpreadsheet, 
  FileText, 
  Receipt, 
  DollarSign, 
  Percent, 
  HelpCircle, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export function SunatInfo() {
  return (
    <div className="w-full py-16 bg-[var(--bg-primary)] antialiased text-[var(--text-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="text-center mb-12 border-b-2 border-gray-200 dark:border-gray-800 pb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)] mb-3">
            Obligaciones Fiscales
          </p>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Información Tributaria SUNAT
          </h2>
          <p className="mt-3 text-lg text-[var(--text-secondary)] max-w-3xl mx-auto font-medium">
            Guía y accesos directos a herramientas oficiales para trámites inmobiliarios y tributos en el Perú.
          </p>
        </header>

        {/* Grid de Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Predial Urbano */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-[var(--brand-primary)]/40 dark:hover:border-[var(--brand-primary)]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[var(--brand-primary)]/10 border-2 border-[var(--brand-primary)]/20 rounded-xl flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Predial Urbano
                </h3>
              </div>
              <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed mb-6">
                Información referente al impuesto predial obligatorio para propiedades y predios urbanos.
              </p>
            </div>
            <Link 
              href="https://www.sunat.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 underline underline-offset-4 cursor-pointer"
            >
              <span>Consultar en SUNAT</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Autovalúo */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-[var(--brand-primary)]/40 dark:hover:border-[var(--brand-primary)]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[var(--brand-primary)]/10 border-2 border-[var(--brand-primary)]/20 rounded-xl flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Autovalúo
                </h3>
              </div>
              <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed mb-6">
                Proceso técnico de determinación del valor real de los predios según normativas vigentes.
              </p>
            </div>
            <Link 
              href="https://www.sunat.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 underline underline-offset-4 cursor-pointer"
            >
              <span>Realizar trámite</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Transferencia de Predio */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-[var(--brand-primary)]/40 dark:hover:border-[var(--brand-primary)]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[var(--brand-primary)]/10 border-2 border-[var(--brand-primary)]/20 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Transferencia de Predio
                </h3>
              </div>
              <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed mb-6">
                Requisitos legales, alcances e impuestos implicados en la transferencia de bienes inmuebles.
              </p>
            </div>
            <Link 
              href="https://www.sunat.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 underline underline-offset-4 cursor-pointer"
            >
              <span>Ver requisitos</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Declaración Jurada */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-[var(--brand-primary)]/40 dark:hover:border-[var(--brand-primary)]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[var(--brand-primary)]/10 border-2 border-[var(--brand-primary)]/20 rounded-xl flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Declaración Jurada
                </h3>
              </div>
              <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed mb-6">
                Declaración anual obligatoria de rentas y patrimonios para propietarios de inmuebles.
              </p>
            </div>
            <Link 
              href="https://www.sunat.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 underline underline-offset-4 cursor-pointer"
            >
              <span>Presentar declaración</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 5: Alquileres */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-[var(--brand-primary)]/40 dark:hover:border-[var(--brand-primary)]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[var(--brand-primary)]/10 border-2 border-[var(--brand-primary)]/20 rounded-xl flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Alquileres
                </h3>
              </div>
              <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed mb-6">
                Obligaciones y cálculo del impuesto a la renta de primera categoría para alquileres.
              </p>
            </div>
            <Link 
              href="https://www.sunat.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 underline underline-offset-4 cursor-pointer"
            >
              <span>Consultar tasas</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 6: ITF */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-[var(--brand-primary)]/40 dark:hover:border-[var(--brand-primary)]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[var(--brand-primary)]/10 border-2 border-[var(--brand-primary)]/20 rounded-xl flex items-center justify-center shrink-0">
                  <Percent className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  ITF
                </h3>
              </div>
              <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed mb-6">
                Impuesto a las Transacciones Financieras aplicable en la bancarización de operaciones.
              </p>
            </div>
            <Link 
              href="https://www.sunat.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 underline underline-offset-4 cursor-pointer"
            >
              <span>Calcular ITF</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 7: Consultas y Trámites */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-[var(--brand-primary)]/40 dark:hover:border-[var(--brand-primary)]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between lg:col-span-3 lg:max-w-md lg:mx-auto lg:w-full">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[var(--brand-primary)]/10 border-2 border-[var(--brand-primary)]/20 rounded-xl flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Consultas y Trámites
                </h3>
              </div>
              <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed mb-6">
                Mesa de partes virtual, claves SOL y asistencia remota personalizada de SUNAT.
              </p>
            </div>
            <Link 
              href="https://www.sunat.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 underline underline-offset-4 cursor-pointer"
            >
              <span>Acceder a SUNAT Virtual</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* Footer informativo */}
        <footer className="mt-12 text-center max-w-3xl mx-auto">
          <div className="bg-[var(--brand-primary)]/[0.02] dark:bg-[var(--brand-primary)]/[0.05] border-2 border-[var(--brand-primary)]/10 rounded-2xl p-6">
            <div className="w-10 h-10 bg-[var(--brand-primary)]/10 border-2 border-[var(--brand-primary)]/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-5 h-5 text-[var(--brand-primary)]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--brand-primary)] mb-2">
              Información Oficial SUNAT
            </h3>
            <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed">
              Todos los accesos redireccionan de forma íntegra a la plataforma gubernamental de la SUNAT. 
              TIYUY aprovisiona estos enlaces únicamente para facilitar tu navegación centralizada; cualquier trámite tributario vinculante se gestiona estrictamente dentro de sunat.gob.pe.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}