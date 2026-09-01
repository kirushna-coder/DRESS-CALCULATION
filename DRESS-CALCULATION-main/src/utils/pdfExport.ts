// ============================================================
// Fabriplay – PDF Export Utility
// Uses html2canvas to rasterise the SVG canvas, then jsPDF
// to embed it in an A4 PDF page.
// ============================================================

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export the canvas container element as an A4 PDF.
 * @param containerEl - The DOM element wrapping the SVG pattern
 * @param filename    - Output filename (without extension)
 */
export async function downloadPDF(
  containerEl: HTMLElement,
  filename = 'fabriplay-pattern'
): Promise<void> {
  try {
    const canvas = await html2canvas(containerEl, {
      scale: 2,          // 2× for crisp output
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');

    // A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // Scale image to fit the page while preserving aspect ratio
    const imgW = canvas.width;
    const imgH = canvas.height;
    const ratio = Math.min(pageW / imgW, pageH / imgH);
    const printW = imgW * ratio;
    const printH = imgH * ratio;
    const offsetX = (pageW - printW) / 2;
    const offsetY = (pageH - printH) / 2;

    // Header
    pdf.setFontSize(12);
    pdf.setTextColor(70, 70, 70);
    pdf.text('FABRIPLAY – Smart Pattern Generator', pageW / 2, 8, { align: 'center' });
    pdf.setFontSize(8);
    pdf.text(
      `Generated: ${new Date().toLocaleString()}`,
      pageW / 2,
      13,
      { align: 'center' }
    );

    pdf.addImage(imgData, 'PNG', offsetX, offsetY + 10, printW, printH - 10);

    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error('[Fabriplay] PDF export failed:', err);
    throw err;
  }
}
