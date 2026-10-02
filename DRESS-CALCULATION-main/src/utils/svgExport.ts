// ============================================================
// Fabriplay – SVG Export Utility
// ============================================================

/**
 * Remove all CAD grid elements from an SVG clone before export.
 * Any element (or <defs> block) tagged with data-grid="true" is stripped,
 * keeping pattern pieces, annotations, labels, and grainlines intact.
 */
function stripGridElements(clone: SVGSVGElement): void {
  // Query all elements with data-grid attribute and remove them
  const gridEls = clone.querySelectorAll('[data-grid]');
  gridEls.forEach((el) => el.parentNode?.removeChild(el));
}

/**
 * Serialise the SVG element to a .svg file and trigger download.
 * Grid background is automatically excluded from the exported file.
 * @param svgEl    - The SVG DOM element to export
 * @param filename - Output filename (without extension)
 * @param includeGrid - Set true to retain the CAD grid in the export (default: false)
 */
export function downloadSVG(
  svgEl: SVGSVGElement,
  filename = 'fabriplay-pattern',
  includeGrid = false,
): void {
  // Clone so we can safely mutate attributes
  const clone = svgEl.cloneNode(true) as SVGSVGElement;

  // Ensure xmlns is present
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // Strip grid unless caller explicitly requests it
  if (!includeGrid) {
    stripGridElements(clone);
  }

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
 * Grid background is excluded by default.
 * @param svgEl       - The SVG DOM element
 * @param includeGrid - Set true to retain the CAD grid in the output (default: false)
 */
export function getSVGString(svgEl: SVGSVGElement, includeGrid = false): string {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  if (!includeGrid) {
    stripGridElements(clone);
  }
  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}
