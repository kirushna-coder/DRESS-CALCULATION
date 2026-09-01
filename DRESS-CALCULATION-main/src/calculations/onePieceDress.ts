// ============================================================
// Fabriplay – One-Piece Dress Calculation Engine
// Size 38 Reference Pattern
//
// All input measurements are in INCHES.
// scale = SVG pixels per inch (configurable via zoom).
//
// The pattern is drawn as a HALF-FRONT PANEL (left half only).
// Mirror along a vertical axis to get the full front panel.
//
// Coordinate origin (0, 0) is the TOP-LEFT corner of the canvas
// padding area.  All Y values increase downward.
// ============================================================

import type { Measurements, PatternData, PatternPoint, Point } from '../types';

// ─── Helper: convert inches → SVG pixels ────────────────────
const px = (inches: number, scale: number) => inches * scale;

// ─── Helper: quadratic Bezier midpoint ──────────────────────
// Returns the SVG Q (quadratic) path segment string
const qBez = (cx: number, cy: number, ex: number, ey: number) =>
  `Q ${cx} ${cy} ${ex} ${ey}`;

// ─── Helper: cubic Bezier ────────────────────────────────────
const cBez = (
  cx1: number, cy1: number,
  cx2: number, cy2: number,
  ex: number, ey: number
) => `C ${cx1} ${cy1} ${cx2} ${cy2} ${ex} ${ey}`;

// ─── Default Size-38 measurements ────────────────────────────
export const DEFAULT_MEASUREMENTS: Measurements = {
  dressSize: 38,
  fullLength: 58,
  shoulderWidth: 3,
  neckWidth: 3,
  neckDepth: 1,
  armholeDepth: 6.5,
  bust: 38,
  waist: 30,
  hip: 40,
  bottomWidth: 18,
  flare: 4.5,
  ease: 1,
};

// ─── Legacy measurement keys for CAD drafting ────────────────
export type CadMeasurementKey =
  | 'dressSize'
  | 'fullLength'
  | 'shoulderWidth'
  | 'neckWidth'
  | 'neckDepth'
  | 'armholeDepth'
  | 'bust'
  | 'waist'
  | 'hip'
  | 'bottomWidth'
  | 'flare'
  | 'ease';

// ─── Validation ranges ────────────────────────────────────────
export const MEASUREMENT_BOUNDS: Record<
  CadMeasurementKey,
  { min: number; max: number; label: string; unit: string }
> = {
  dressSize:     { min: 28, max: 60,  label: 'Dress Size',       unit: '' },
  fullLength:    { min: 20, max: 80,  label: 'Full Length',       unit: 'in' },
  shoulderWidth: { min: 1,  max: 10,  label: 'Shoulder Width',    unit: 'in' },
  neckWidth:     { min: 1,  max: 10,  label: 'Neck Width',        unit: 'in' },
  neckDepth:     { min: 0.5,max: 6,   label: 'Neck Depth',        unit: 'in' },
  armholeDepth:  { min: 3,  max: 12,  label: 'Armhole Depth',     unit: 'in' },
  bust:          { min: 28, max: 60,  label: 'Bust',              unit: 'in' },
  waist:         { min: 20, max: 55,  label: 'Waist',             unit: 'in' },
  hip:           { min: 28, max: 65,  label: 'Hip',               unit: 'in' },
  bottomWidth:   { min: 10, max: 40,  label: 'Bottom Width',      unit: 'in' },
  flare:         { min: 0,  max: 12,  label: 'Flare',             unit: 'in' },
  ease:          { min: 0,  max: 4,   label: 'Ease Allowance',    unit: 'in' },
};

// ─── Main calculation function ────────────────────────────────
/**
 * Computes all pattern points and path data for a half-front panel
 * of a one-piece dress.
 *
 * @param m   - User measurements (inches)
 * @param scale - SVG pixels per inch
 * @returns PatternData ready for SVG rendering
 */
export function calculateOnePieceDress(
  m: Measurements,
  scale: number
): PatternData {
  // ── Step 1: Derived measurements (inches) ─────────────────
  const halfBust         = (m.bust + m.ease) / 4;  // quarter-bust (half-panel is 1/4 of full)
  const halfWaist        = (m.waist + m.ease) / 4;
  const halfHip          = (m.hip + m.ease) / 4;
  const halfBottom       = m.bottomWidth / 2;
  const halfNeck         = m.neckWidth / 2;
  const halfShoulder     = m.shoulderWidth;          // shoulder width already is half panel width

  // Vertical section heights (inches)
  const bustLineY        = m.armholeDepth;
  const hipLineY         = m.armholeDepth + 8;        // hip is ~8 in below bust on standard block
  const totalLength      = m.fullLength;

  // ── Step 2: Convert to SVG pixels ─────────────────────────
  // ORIGIN = top-left of the drawing area
  const MARGIN = px(1, scale);   // 1-inch margin from canvas edge

  const originX = MARGIN;
  const originY = MARGIN;

  // Key X coordinates (half-panel, width increases right → left for a front panel)
  // We draw the CENTER FOLD on the LEFT edge (x = originX)
  // and the SIDE SEAM on the RIGHT edge.

  const xCF   = originX;                        // Centre Front fold line
  const xNeck = xCF + px(halfNeck, scale);      // Neck point
  const xSh   = xCF + px(halfShoulder, scale);  // Shoulder tip
  const xBust = xCF + px(halfBust, scale);      // Bust / side seam at bust
  const xWaist= xCF + px(halfWaist, scale);     // Waist side seam
  const xHip  = xCF + px(halfHip, scale);       // Hip side seam
  const xBot  = xCF + px(halfBottom, scale);    // Bottom hem side point

  // Key Y coordinates
  const yTop       = originY;                           // A – top / shoulder-neck junction
  const yNeckDip   = originY + px(m.neckDepth, scale);  // B – bottom of neckline curve
  const yArmhole   = originY + px(bustLineY, scale);    // C – armhole / bust line
  const yShldrSlope= originY + px(0.75, scale);         // slight shoulder slope (~0.75 in)
  const yHip       = originY + px(hipLineY, scale);     // D – hip line
  const yHem       = originY + px(totalLength, scale);  // E – hem / bottom

  // ── Step 3: Named pattern points ──────────────────────────
  // (standard dressmaking notation)

  const A: Point = { x: xCF,   y: yTop };          // Centre-front neck top
  const B: Point = { x: xNeck, y: yTop };           // Shoulder-neck point
  const C: Point = { x: xSh,   y: yShldrSlope };   // Shoulder tip
  const D: Point = { x: xBust, y: yArmhole };       // Bust / underarm point
  const E: Point = { x: xWaist,y: yArmhole + px(4, scale) }; // Waist side seam (4 in below armhole typically)
  const F: Point = { x: xHip,  y: yHip };           // Hip side seam
  const G: Point = { x: xBot,  y: yHem };           // Bottom hem, side point
  const H: Point = { x: xCF,   y: yHem };           // Bottom hem, centre fold
  // (Point I – CF at bust height – not rendered; retained here as a reference comment)
  // const I: Point = { x: xCF, y: yArmhole };

  // Neckline curve control point
  const neckCtrlX = xCF + px(halfNeck * 0.5, scale);
  const neckCtrlY = yNeckDip;

  // Armhole curve control points
  const ahCtrl1X = xSh + px(0.5, scale);
  const ahCtrl1Y = yShldrSlope + px(m.armholeDepth * 0.4, scale);
  const ahCtrl2X = xBust + px(0.5, scale);
  const ahCtrl2Y = yArmhole - px(1.5, scale);

  // Bottom flare curve control points
  const flareOffsetPx = px(m.flare, scale);
  const botCtrl1X = xBot + flareOffsetPx * 0.5;
  const botCtrl1Y = yHip + (yHem - yHip) * 0.3;
  const botCtrl2X = xBot + flareOffsetPx;
  const botCtrl2Y = yHem - px(2, scale);

  // ── Step 4: Build SVG path (clockwise) ───────────────────
  //
  // Path order:
  //   A (CF top) → neck curve → B (neck-shoulder) → C (shoulder tip)
  //   → armhole curve → D (underarm) → waist dart approximation
  //   → E (waist) → F (hip) → bottom flare → G (hem side)
  //   → H (hem CF) → straight up CF → A
  //

  const outline = [
    // Start at centre-front neck top
    `M ${A.x} ${A.y}`,
    // Neckline: quadratic curve from A to B using control point below
    qBez(neckCtrlX, neckCtrlY, B.x, B.y),
    // Shoulder seam: line from B to C (slight slope)
    `L ${C.x} ${C.y}`,
    // Armhole curve: cubic bezier from C to D
    cBez(ahCtrl1X, ahCtrl1Y, ahCtrl2X, ahCtrl2Y, D.x, D.y),
    // Side seam: D → E (waist) → F (hip) – slight curves for body shape
    qBez(
      D.x + px(0.3, scale), D.y + (E.y - D.y) * 0.5,
      E.x, E.y
    ),
    qBez(
      E.x + px(0.2, scale), E.y + (F.y - E.y) * 0.5,
      F.x, F.y
    ),
    // Hip to hem with flare
    cBez(botCtrl1X, botCtrl1Y, botCtrl2X, botCtrl2Y, G.x, G.y),
    // Hem: straight from G to H (CF)
    `L ${H.x} ${H.y}`,
    // Centre-front seam: straight up from H to A
    `L ${A.x} ${A.y}`,
    `Z`,
  ].join(' ');

  // ── Step 5: Construction lines ────────────────────────────
  const constructionLines = [
    // Bust line (horizontal)
    { from: { x: xCF, y: yArmhole }, to: { x: xBust + px(1, scale), y: yArmhole }, dashed: true },
    // Hip line (horizontal)
    { from: { x: xCF, y: yHip }, to: { x: xHip + px(1, scale), y: yHip }, dashed: true },
    // Centre-front vertical guide
    { from: A, to: H, dashed: true },
    // Shoulder guide
    { from: { x: xCF, y: yTop }, to: { x: xSh + px(0.5, scale), y: yTop }, dashed: true },
  ];

  // ── Step 6: Annotation arrows ─────────────────────────────
  const annotOff = px(0.6, scale); // default arrow offset

  const annotations = [
    // Full length
    {
      from: { x: xCF - annotOff * 2, y: yTop },
      to:   { x: xCF - annotOff * 2, y: yHem },
      label: `${m.fullLength}"`,
      direction: 'vertical' as const,
    },
    // Shoulder width
    {
      from: { x: xCF, y: yTop - annotOff * 2 },
      to:   { x: xSh, y: yTop - annotOff * 2 },
      label: `${m.shoulderWidth}"`,
      direction: 'horizontal' as const,
    },
    // Neck width
    {
      from: { x: xCF, y: yTop - annotOff },
      to:   { x: xNeck, y: yTop - annotOff },
      label: `${m.neckWidth / 2}"`,
      direction: 'horizontal' as const,
    },
    // Armhole depth
    {
      from: { x: xSh + annotOff * 2, y: yTop },
      to:   { x: xSh + annotOff * 2, y: yArmhole },
      label: `${m.armholeDepth}"`,
      direction: 'vertical' as const,
    },
    // Bust width (half panel)
    {
      from: { x: xCF, y: yArmhole + annotOff },
      to:   { x: xBust, y: yArmhole + annotOff },
      label: `${halfBust.toFixed(1)}"`,
      direction: 'horizontal' as const,
    },
    // Hip width
    {
      from: { x: xCF, y: yHip + annotOff },
      to:   { x: xHip, y: yHip + annotOff },
      label: `${halfHip.toFixed(1)}"`,
      direction: 'horizontal' as const,
    },
    // Bottom width
    {
      from: { x: xCF, y: yHem + annotOff },
      to:   { x: xBot, y: yHem + annotOff },
      label: `${halfBottom}"`,
      direction: 'horizontal' as const,
    },
  ];

  // ── Step 7: Named point list for labels ───────────────────
  const points: PatternPoint[] = [
    { label: 'A', point: A, description: 'CF Neck Top' },
    { label: 'B', point: B, description: 'Neck–Shoulder' },
    { label: 'C', point: C, description: 'Shoulder Tip' },
    { label: 'D', point: D, description: 'Underarm / Bust' },
    { label: 'E', point: E, description: 'Waist Side' },
    { label: 'F', point: F, description: 'Hip Side' },
    { label: 'G', point: G, description: 'Hem Side' },
    { label: 'H', point: H, description: 'Hem CF' },
  ];

  // ── Step 8: Bounding box ──────────────────────────────────
  const boundsWidth  = px(halfBottom, scale) + MARGIN * 4 + px(m.flare, scale);
  const boundsHeight = px(totalLength, scale) + MARGIN * 4;

  return {
    outlinePath: outline,
    points,
    constructionLines,
    annotations,
    bounds: { width: boundsWidth, height: boundsHeight },
  };
}
