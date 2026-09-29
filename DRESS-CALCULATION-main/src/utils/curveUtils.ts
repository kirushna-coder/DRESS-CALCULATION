// ============================================================
// FabriPlay AI – Shared SVG Bézier Curve Generator Utilities
// Provides master tailor-grade smooth curve algorithms for pattern drafting
// ============================================================

export interface Point {
  x: number;
  y: number;
}

/** Format SVG Quadratic Bézier segment: Q cx cy ex ey */
export const qBez = (cx: number, cy: number, ex: number, ey: number) =>
  `Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;

/** Format SVG Cubic Bézier segment: C cx1 cy1 cx2 cy2 ex ey */
export const cBez = (
  cx1: number,
  cy1: number,
  cx2: number,
  cy2: number,
  ex: number,
  ey: number
) =>
  `C ${cx1.toFixed(2)} ${cy1.toFixed(2)} ${cx2.toFixed(2)} ${cy2.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;

/**
 * Generates a smooth, natural front neckline curve starting from CF dip to shoulder tip.
 * Enforces a horizontal tangent at CF (cfX) so mirrored halves join seamlessly without a peak.
 */
export function createFrontNecklineSegment(
  cfX: number,
  cfNeckY: number,
  shNeckX: number,
  shY: number
): string {
  const neckW = Math.abs(shNeckX - cfX);
  const neckD = Math.abs(cfNeckY - shY);
  const cx1 = cfX + neckW * 0.45;
  const cy1 = cfNeckY; // Horizontal tangent at CF
  const cx2 = shNeckX;
  const cy2 = shY + neckD * 0.35;
  return cBez(cx1, cy1, cx2, cy2, shNeckX, shY);
}

/**
 * Generates a smooth, natural back neckline curve starting from CB dip to shoulder tip.
 */
export function createBackNecklineSegment(
  cbX: number,
  cbNeckY: number,
  shNeckX: number,
  shY: number
): string {
  const neckW = Math.abs(shNeckX - cbX);
  const neckD = Math.abs(cbNeckY - shY);
  const cx1 = cbX + neckW * 0.40;
  const cy1 = cbNeckY; // Horizontal tangent at CB
  const cx2 = shNeckX;
  const cy2 = shY + neckD * 0.25;
  return cBez(cx1, cy1, cx2, cy2, shNeckX, shY);
}

/**
 * Generates a smooth, natural armhole curve (front or back).
 * Connects shoulder point to chest armpit point with realistic armhole depth and pitch control.
 * Front armholes curve inward at pitch level; back armholes have a broader, smoother sweep.
 */
export function createArmholePathSegment(
  shX: number,
  shY: number,
  chestX: number,
  armY: number,
  _armDepth: number,
  isFront: boolean = true
): string {
  const dx = chestX - shX;
  const dy = armY - shY;
  
  if (isFront) {
    // Front armhole: dips inward at chest pitch point (approx 45% down)
    const cx1 = shX - dx * 0.08;
    const cy1 = shY + dy * 0.38;
    const cx2 = chestX - dx * 0.50;
    const cy2 = armY - dy * 0.08;
    return cBez(cx1, cy1, cx2, cy2, chestX, armY);
  } else {
    // Back armhole: smoother, shallow inward slope
    const cx1 = shX - dx * 0.05;
    const cy1 = shY + dy * 0.42;
    const cx2 = chestX - dx * 0.35;
    const cy2 = armY - dy * 0.06;
    return cBez(cx1, cy1, cx2, cy2, chestX, armY);
  }
}

/**
 * Generates a smooth S-curve sleeve cap crown.
 * Left half: underarm start -> cap top apex
 * Right half: cap top apex -> underarm end
 */
export function createSleeveCapPathSegments(
  startX: number,
  startY: number,
  midX: number,
  topY: number,
  endX: number,
  endY: number,
  capH: number
): { leftCap: string; rightCap: string } {
  const lWidth = midX - startX;
  const rWidth = endX - midX;

  // Left half: concave underarm transition into convex top crown
  const l_cx1 = startX + lWidth * 0.30;
  const l_cy1 = startY - capH * 0.10;
  const l_cx2 = midX - lWidth * 0.35;
  const l_cy2 = topY;
  const leftCap = cBez(l_cx1, l_cy1, l_cx2, l_cy2, midX, topY);

  // Right half: convex top crown transition into concave underarm
  const r_cx1 = midX + rWidth * 0.35;
  const r_cy1 = topY;
  const r_cx2 = endX - rWidth * 0.30;
  const r_cy2 = endY - capH * 0.10;
  const rightCap = cBez(r_cx1, r_cy1, r_cx2, r_cy2, endX, endY);

  return { leftCap, rightCap };
}

/**
 * Generates a smooth side seam curve (armpit -> waist indentation -> hip flare/hem).
 */
export function createSideSeamPathSegment(
  chestX: number,
  chestY: number,
  waistX: number,
  waistY: number,
  hipX: number,
  hipY: number
): string {
  return [
    cBez(
      chestX - (chestX - waistX) * 0.2, chestY + (waistY - chestY) * 0.4,
      waistX + (chestX - waistX) * 0.1, waistY - (waistY - chestY) * 0.2,
      waistX, waistY
    ),
    cBez(
      waistX + (hipX - waistX) * 0.2, waistY + (hipY - waistY) * 0.4,
      hipX - (hipX - waistX) * 0.1, hipY - (hipY - waistY) * 0.2,
      hipX, hipY
    ),
  ].join(' ');
}

/**
 * Generates a smooth trouser hip curve (from waist through hip peak down to knee line).
 */
export function createHipSeamPathSegment(
  waistX: number,
  waistY: number,
  hipX: number,
  hipY: number,
  kneeX: number,
  kneeY: number
): string {
  const cx1 = waistX + (hipX - waistX) * 0.65;
  const cy1 = waistY + (hipY - waistY) * 0.35;
  const cx2 = hipX + (kneeX - hipX) * 0.25;
  const cy2 = hipY + (kneeY - hipY) * 0.50;
  return cBez(cx1, cy1, cx2, cy2, kneeX, kneeY);
}

/**
 * Generates a smooth inner thigh inseam curve (from crotch fork to knee).
 */
export function createInseamPathSegment(
  crotchX: number,
  crotchY: number,
  kneeX: number,
  kneeY: number
): string {
  const cx1 = crotchX + (kneeX - crotchX) * 0.25;
  const cy1 = crotchY + (kneeY - crotchY) * 0.40;
  const cx2 = crotchX + (kneeX - crotchX) * 0.70;
  const cy2 = crotchY + (kneeY - crotchY) * 0.85;
  return cBez(cx1, cy1, cx2, cy2, kneeX, kneeY);
}

/**
 * Generates a smooth trouser front/back crotch curve from waist/hip through fork extension.
 */
export function createCrotchPathSegment(
  waistX: number,
  _waistY: number,
  hipX: number,
  hipY: number,
  crotchX: number,
  crotchY: number,
  isFront: boolean = true
): string {
  if (isFront) {
    return cBez(
      waistX, hipY + (crotchY - hipY) * 0.55,
      crotchX + (waistX - crotchX) * 0.35, crotchY,
      crotchX, crotchY
    );
  } else {
    return cBez(
      waistX - (waistX - hipX) * 0.4, hipY + (crotchY - hipY) * 0.65,
      crotchX + (waistX - crotchX) * 0.45, crotchY,
      crotchX, crotchY
    );
  }
}

/**
 * Generates an anatomically contoured curved waistband path.
 */
export function createCurvedWaistbandPath(
  wbX0: number,
  wbY0: number,
  wbLength: number,
  wbHeight: number,
  curveDip: number = 0.5
): string {
  const midX = wbX0 + wbLength / 2;
  const endX = wbX0 + wbLength;

  return [
    `M ${wbX0} ${wbY0}`,
    cBez(wbX0 + wbLength * 0.25, wbY0 + curveDip, midX - wbLength * 0.25, wbY0 + curveDip, endX, wbY0),
    `L ${endX} ${wbY0 + wbHeight}`,
    cBez(endX - wbLength * 0.25, wbY0 + wbHeight + curveDip, wbX0 + wbLength * 0.25, wbY0 + wbHeight + curveDip, wbX0, wbY0 + wbHeight),
    'Z',
  ].join(' ');
}

/**
 * Generates a smooth curved hemline (e.g. shirt tail or curved skirt hem).
 */
export function createCurvedHemPathSegment(
  startX: number,
  startY: number,
  midX: number,
  midY: number,
  endX: number,
  endY: number
): string {
  return [
    cBez(
      startX + (midX - startX) * 0.55, startY + (midY - startY) * 0.85,
      midX, midY,
      midX, midY
    ),
    cBez(
      midX + (endX - midX) * 0.45, midY + (endY - midY) * 0.85,
      endX, endY,
      endX, endY
    ),
  ].join(' ');
}

