'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import { ProjectFull, ProjectUnit } from '@/core/domain/entities/Project';

interface ProjectQuotationProps {
  project: ProjectFull;
  groupedUnitTypes: Array<{ units: ProjectUnit[]; key: string }>;
  currency: string;
  TYPE_LABELS: Record<string, string>;
  PHASE_LABELS: Record<string, string>;
  deliveryDate?: string;
}

export default function ProjectQuotation({
  project,
  groupedUnitTypes,
  currency,
  TYPE_LABELS,
  PHASE_LABELS,
  deliveryDate
}: ProjectQuotationProps) {
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);

  const generateQuotePDF = (groupUnits: ProjectUnit[], groupLabel: string) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = 0;

    // ── HEADER ──
    doc.setFillColor(15, 76, 129); // azul oscuro
    doc.rect(0, 0, pageW, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(project.name, margin, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${project.developer?.companyName || 'Inmobiliaria'} · RUC: ${project.developer?.ruc || '-'}`,
      margin, 27
    );
    doc.text(
      `Cotización generada el ${new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      margin, 34
    );

    y = 50;

    // ── DATOS DEL PROYECTO ──
    doc.setTextColor(15, 76, 129);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Proyecto', margin, y);
    y += 7;

    doc.setDrawColor(15, 76, 129);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentW, y);
    y += 6;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const projectInfo = [
      ['Proyecto', project.name],
      ['Inmobiliaria', project.developer?.companyName || '-'],
      ['RUC', project.developer?.ruc || '-'],
      ['Tipo', TYPE_LABELS[project.type] || project.type],
      ['Estado', PHASE_LABELS[project.phase] || project.phase],
      ['Entrega estimada', deliveryDate || 'Por definir'],
      ['Dirección', project.address || `${project.district}, ${project.province}`],
      ['Distrito', project.district || '-'],
      ['Provincia', project.province || '-'],
      ['Precio desde', `${currency} ${project.priceFrom?.toLocaleString('en-US') || '-'}`],
    ];

    projectInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text(`${label}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.text(value, margin + 45, y);
      y += 7;
    });

    y += 4;

    // ── DESCRIPCIÓN ──
    if (project.description) {
      doc.setTextColor(15, 76, 129);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Descripción', margin, y);
      y += 7;

      doc.setDrawColor(15, 76, 129);
      doc.line(margin, y, margin + contentW, y);
      y += 6;

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const descLines = doc.splitTextToSize(project.description, contentW);
      doc.text(descLines, margin, y);
      y += descLines.length * 5.5 + 6;
    }

    // ── AMENIDADES ──
    if (project.amenities && project.amenities.length > 0) {
      doc.setTextColor(15, 76, 129);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Amenidades', margin, y);
      y += 7;

      doc.setDrawColor(15, 76, 129);
      doc.line(margin, y, margin + contentW, y);
      y += 6;

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      const amenityNames = (project.amenities as any[]).map(a =>
        typeof a === 'string' ? a : a.name
      );
      // En 2 columnas
      const col = Math.ceil(amenityNames.length / 2);
      amenityNames.forEach((name, i) => {
        const cx = i < col ? margin : margin + contentW / 2;
        const cy = y + (i < col ? i : i - col) * 6;
        doc.text(`• ${name}`, cx, cy);
      });
      y += Math.ceil(amenityNames.length / 2) * 6 + 6;
    }

    // ── TIPO DE UNIDAD COTIZADA ──
    // Nueva página si queda poco espacio
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    const sample = groupUnits[0];
    const available = groupUnits.filter(u => u.status === 'AVAILABLE').length;

    doc.setFillColor(240, 247, 255);
    doc.roundedRect(margin, y, contentW, 36, 3, 3, 'F');

    doc.setTextColor(15, 76, 129);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Tipo de Unidad: ${groupLabel}`, margin + 4, y + 9);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(
      `${sample.bedrooms ?? 0} dorm.  ·  ${sample.bathrooms} baños  ·  ${sample.area} m²  ·  ${sample.parkingSpots} estac.  ·  Piso ${sample.floor}`,
      margin + 4, y + 18
    );
    if (sample.view) {
      doc.text(`Vista: ${sample.view}`, margin + 4, y + 25);
    }

    // Precio + disponibilidad
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 76, 129);
    doc.text(`${currency} ${sample.price.toLocaleString('en-US')}`, margin + 4, y + 33);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 160, 80);
    doc.text(`${available} disponibles de ${groupUnits.length}`, margin + contentW - 4, y + 33, { align: 'right' });

    y += 44;

    // ── TABLA DE UNIDADES ──
    doc.setTextColor(15, 76, 129);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Unidades', margin, y);
    y += 7;
    doc.setDrawColor(15, 76, 129);
    doc.line(margin, y, margin + contentW, y);
    y += 4;

    // Cabecera tabla
    const cols = ['Unidad', 'Piso', 'Área', 'Dorm.', 'Baños', 'Estac.', 'Precio', 'Estado'];
    const colW = [32, 16, 18, 16, 16, 16, 28, 24];
    
    doc.setFillColor(15, 76, 129);
    doc.rect(margin, y, contentW, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    let cx = margin + 2;
    cols.forEach((col, i) => {
      doc.text(col, cx, y + 5.5);
      cx += colW[i];
    });
    y += 8;

    // Filas
    groupUnits.forEach((unit, rowIndex) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const bg = rowIndex % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
      doc.setFillColor(bg[0], bg[1], bg[2]);
      doc.rect(margin, y, contentW, 7.5, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);

      const statusColor: Record<string, [number, number, number]> = {
        AVAILABLE: [40, 160, 80],
        RESERVED:  [200, 130, 0],
        SOLD:      [200, 50, 50],
        BLOCKED:   [120, 120, 120],
      };
      const statusLabel: Record<string, string> = {
        AVAILABLE: 'Disponible',
        RESERVED:  'Reservado',
        SOLD:      'Vendido',
        BLOCKED:   'Bloqueado',
      };

      const rowData = [
        unit.unitNumber,
        String(unit.floor),
        `${unit.area} m²`,
        String(unit.bedrooms ?? '-'),
        String(unit.bathrooms),
        String(unit.parkingSpots),
        `${currency} ${unit.price.toLocaleString('en-US')}`,
      ];

      cx = margin + 2;
      rowData.forEach((val, i) => {
        doc.setTextColor(40, 40, 40);
        doc.text(val, cx, y + 5);
        cx += colW[i];
      });

      // Estado con color
      const [r, g, b] = statusColor[unit.status] || [80, 80, 80];
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', 'bold');
      doc.text(statusLabel[unit.status] || unit.status, cx, y + 5);

      y += 7.5;
    });

    y += 8;

    // ── CONTACTO ──
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(240, 255, 245);
    doc.roundedRect(margin, y, contentW, 28, 3, 3, 'F');

    doc.setTextColor(15, 76, 129);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Contacto del Desarrollador', margin + 4, y + 9);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const contactLine = [
      project.developer?.companyName,
      project.developer?.phone ? `Tel: ${project.developer.phone}` : null,
      project.developer?.email ? `Email: ${project.developer.email}` : null,
    ].filter(Boolean).join('   ·   ');
    doc.text(contactLine, margin + 4, y + 18);
    doc.text(`RUC: ${project.developer?.ruc || '-'}`, margin + 4, y + 24);

    y += 34;

    // ── FOOTER ──
    const pageCount = (doc as any).internal?.getNumberOfPages() || 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 287, pageW, 10, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(
        `${project.name} · ${project.developer?.companyName || ''} · Documento generado el ${new Date().toLocaleDateString('es-PE')}`,
        pageW / 2, 293,
        { align: 'center' }
      );
      doc.text(`Página ${i} de ${pageCount}`, pageW - margin, 293, { align: 'right' });
    }

    // ── DESCARGAR ──
    const fileName = `Cotizacion_${project.name.replace(/\s+/g, '_')}_${groupLabel.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  return {
    expandedGroupKey,
    setExpandedGroupKey,
    generateQuotePDF
  };
}
