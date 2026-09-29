// ============================================================
// FabricPlay AI – Advanced PDF & Technical Pattern Export Utility
// Supports paper formats (A4, A3, A0), scale (fit, 1:1, 1:2, 1:4),
// grainline & seam allowance indicators, and measurement report tables.
// ============================================================

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Measurements, PDFPaperSize, PDFExportScale, SeamAllowanceCm } from '../types';

export interface PDFExportOptions {
  paperSize?: PDFPaperSize;
  exportScale?: PDFExportScale;
  seamAllowanceCm?: SeamAllowanceCm;
  measurements?: Measurements;
  patternName?: string;
}

/**
 * Exports the SVG CAD pattern container to a professional PDF with technical metadata report.
 */
export async function downloadPDF(
  containerEl: HTMLElement,
  filename = 'fabricplay-pattern',
  options?: PDFExportOptions
): Promise<void> {
  const paperSize = options?.paperSize || 'A4';
  const exportScale = options?.exportScale || 'fit';
  const seamAllowance = options?.seamAllowanceCm || 1;
  const m = options?.measurements;
  const patternName = options?.patternName || 'CAD Garment Pattern';

  try {
    const canvas = await html2canvas(containerEl, {
      scale: 2, // 2x high resolution
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');

    const format = paperSize.toLowerCase() as 'a4' | 'a3' | 'a0';
    const pdf = new jsPDF({
      orientation: paperSize === 'A0' ? 'landscape' : 'portrait',
      unit: 'mm',
      format,
    });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // Scale calculation
    let scaleFactor = 1;
    if (exportScale === '1:1') scaleFactor = 1.0;
    else if (exportScale === '1:2') scaleFactor = 0.5;
    else if (exportScale === '1:4') scaleFactor = 0.25;

    const imgW = canvas.width;
    const imgH = canvas.height;

    let printW = pageW - 20;
    let printH = pageH - 40;

    if (exportScale !== 'fit') {
      printW = (imgW * 0.264583) * scaleFactor; // px to mm at 96 DPI * scale
      printH = (imgH * 0.264583) * scaleFactor;
    } else {
      const ratio = Math.min((pageW - 20) / imgW, (pageH - 40) / imgH);
      printW = imgW * ratio;
      printH = imgH * ratio;
    }

    const offsetX = Math.max(10, (pageW - printW) / 2);
    const offsetY = 24;

    // Header Title
    pdf.setFontSize(14);
    pdf.setTextColor(30, 41, 59);
    pdf.text('FABRICPLAY AI – PROFESSIONAL CAD PATTERNMAKING SYSTEM', pageW / 2, 10, { align: 'center' });

    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(
      `Pattern: ${patternName} | Paper: ${paperSize} | Scale: ${exportScale === 'fit' ? 'Fit-to-Page' : exportScale} | Seam Allowance: ${seamAllowance} cm | Date: ${new Date().toLocaleDateString()}`,
      pageW / 2,
      16,
      { align: 'center' }
    );

    // Pattern Canvas Image
    pdf.addImage(imgData, 'PNG', offsetX, offsetY, printW, printH);

    // Page 2: Pattern Measurement & Specification Report
    pdf.addPage(format, paperSize === 'A0' ? 'landscape' : 'portrait');

    pdf.setFontSize(16);
    pdf.setTextColor(30, 41, 59);
    pdf.text('GARMENT PATTERN MEASUREMENT & SPECIFICATION REPORT', 15, 20);

    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Customer Name: ${m?.customerName || 'Standard Profile'}`, 15, 30);
    pdf.text(`Garment Model: ${patternName}`, 15, 36);
    pdf.text(`Gender: ${m?.gender || 'Unisex'}`, 15, 42);
    pdf.text(`Target Size: Size ${m?.dressSize || 38}`, 15, 48);

    // Measurement Table Header
    pdf.setFillColor(241, 245, 249);
    pdf.rect(15, 56, pageW - 30, 10, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text('BODY MEASUREMENT KEY', 20, 62);
    pdf.text('DRAFTED DIMENSION (INCHES)', 110, 62);
    pdf.text('METRIC EQUIVALENT (CM)', 170, 62);

    const rows = [
      { key: 'Chest / Bust Circumference', val: m?.bust || 36 },
      { key: 'Waist Circumference', val: m?.waist || 30 },
      { key: 'Hip Circumference', val: m?.hip || 40 },
      { key: 'Shoulder Width', val: m?.shoulderWidth || 15 },
      { key: 'Full Length', val: m?.fullLength || 40 },
      { key: 'Trouser Outseam', val: m?.outseam || 40 },
      { key: 'Trouser Inseam', val: m?.inseam || 30 },
      { key: 'Thigh Circumference', val: m?.thighCircumference || 24 },
      { key: 'Ease Allowance Added', val: m?.ease || 1.5 },
    ];

    let rowY = 74;
    rows.forEach((r, idx) => {
      if (idx % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(15, rowY - 5, pageW - 30, 8, 'F');
      }
      pdf.setFontSize(9);
      pdf.setTextColor(51, 65, 85);
      pdf.text(r.key, 20, rowY);
      pdf.text(`${r.val}"`, 110, rowY);
      pdf.text(`${(r.val * 2.54).toFixed(1)} cm`, 170, rowY);
      rowY += 8;
    });

    // Seam Allowance & Production Notes
    pdf.setFontSize(11);
    pdf.setTextColor(30, 41, 59);
    pdf.text('PRODUCTION & SEAM ALLOWANCE NOTES', 15, rowY + 12);

    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`1. Seam Allowance: ${seamAllowance} cm (${(seamAllowance / 2.54).toFixed(2)} inches) included on all perimeter seams.`, 15, rowY + 20);
    pdf.text('2. Grainlines: Arrows indicate warp direction. Align parallel to selvage edge.', 15, rowY + 26);
    pdf.text('3. Notches: Align front and back leg notches at knee line during assembly.', 15, rowY + 32);
    pdf.text('4. Fitting Advice: Cut test muslin to verify fit prior to final fabric layout.', 15, rowY + 38);

    pdf.save(`${filename}-${paperSize.toLowerCase()}.pdf`);
  } catch (err) {
    console.error('[FabricPlay AI] PDF export failed:', err);
    throw err;
  }
}
