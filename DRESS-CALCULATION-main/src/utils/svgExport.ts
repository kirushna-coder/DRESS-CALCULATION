// ============================================================
// Fabriplay – SVG Export Utility
// ============================================================

/**
 * Serialise the SVG element to a .svg file and trigger download.
 * @param svgEl  - The SVG DOM element to export
 * @param filename - Output filename (without extension)
 */
export function downloadSVG(svgEl: SVGSVGElement, filename = 'fabriplay-pattern'): void {
  // Clone so we can safely mutate attributes
  const clone = svgEl.cloneNode(true) as SVGSVGElement;

  // Ensure xmlns is present
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.svg`;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Returns the SVG content as a raw string (for embedding or server upload).
 */
export function getSVGString(svgEl: SVGSVGElement): string {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}
