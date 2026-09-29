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

import type { ConstructionLine, MeasurementAnnotation, Measurements, PatternData, PatternPoint, Point } from '../types';
import {
  createFrontNecklineSegment,
  createBackNecklineSegment,
  createArmholePathSegment,
  createSleeveCapPathSegments,
} from '../utils/curveUtils';


// ─── Helper: convert inches → SVG pixels ────────────────────
const px = (inches: number, scale: number) => inches * scale;


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
  const halfBust     = (m.bust + (m.ease || 1)) / 4;
  const halfWaist    = (m.waist + (m.ease || 1)) / 4;
  const halfBottom   = (m.bottomWidth || 20) / 2;
  const halfNeck     = (m.neckWidth || 3) / 2;
  const halfShoulder = (m.shoulderWidth || 3.2);

  const armDepth     = m.armholeDepth || 6.5;
  const neckDepth    = m.neckDepth || 2.2;
  const totalLength  = m.fullLength || 54;
  const bodiceLength = Math.min(16, Math.max(12, armDepth + 7));
  const skirtLength  = Math.max(20, totalLength - bodiceLength);
  const sleeveLen    = m.sleeveLength || 8;
  const sleeveWidth  = Math.max(7, armDepth * 1.1);

  const gap = px(3, scale);
  const originX = 36;
  const originY = 30;

  // ── PIECE 1: FRONT BODICE ─────────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  const fCF_x   = fX0;
  const fNeck_x = fCF_x + px(halfNeck, scale);
  const fSh_x   = fCF_x + px(halfShoulder, scale);
  const fBust_x = fCF_x + px(halfBust, scale);
  const fWaist_x= fCF_x + px(halfWaist, scale);

  const yTop       = fY0;
  const yNeckDip   = fY0 + px(neckDepth, scale);
  const yShSlope   = fY0 + px(0.75, scale);
  const yArmhole   = fY0 + px(armDepth, scale);
  const yBodiceWaist= fY0 + px(bodiceLength, scale);

  const fA: Point = { x: fCF_x,    y: yNeckDip };
  const fB: Point = { x: fNeck_x,  y: yTop };
  const fC: Point = { x: fSh_x,    y: yShSlope };
  const fD: Point = { x: fBust_x,  y: yArmhole };
  const fE: Point = { x: fWaist_x, y: yBodiceWaist };
  const fF: Point = { x: fCF_x,    y: yBodiceWaist };

  const frontBodicePath = [
    `M ${fA.x} ${fA.y}`,
    createFrontNecklineSegment(fCF_x, yNeckDip, fNeck_x, yTop),
    `L ${fC.x} ${fC.y}`,
    createArmholePathSegment(fSh_x, yShSlope, fBust_x, yArmhole, px(armDepth, scale), true),
    cBez(fBust_x - px(0.3, scale), yArmhole + (yBodiceWaist - yArmhole) * 0.4, fWaist_x + px(0.15, scale), yArmhole + (yBodiceWaist - yArmhole) * 0.75, fE.x, fE.y),
    `L ${fF.x} ${fF.y}`,
    `L ${fA.x} ${fA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK BODICE ──────────────────────────────────
  const bX0 = fX0 + px(halfBust, scale) + gap;
  const bY0 = originY;

  const bCB_x   = bX0;
  const bNeck_x = bCB_x + px(halfNeck, scale);
  const bSh_x   = bCB_x + px(halfShoulder, scale);
  const bBust_x = bCB_x + px(halfBust, scale);
  const bWaist_x= bCB_x + px(halfWaist, scale);

  const bA: Point = { x: bCB_x,    y: yTop + px(1.0, scale) };
  const bC: Point = { x: bSh_x,    y: yShSlope };
  const bE: Point = { x: bWaist_x, y: yBodiceWaist };
  const bF: Point = { x: bCB_x,    y: yBodiceWaist };

  const backBodicePath = [
    `M ${bA.x} ${bA.y}`,
    createBackNecklineSegment(bCB_x, bA.y, bNeck_x, yTop),
    `L ${bC.x} ${bC.y}`,
    createArmholePathSegment(bSh_x, yShSlope, bBust_x, yArmhole, px(armDepth, scale), false),
    cBez(bBust_x - px(0.3, scale), yArmhole + (yBodiceWaist - yArmhole) * 0.4, bWaist_x + px(0.15, scale), yArmhole + (yBodiceWaist - yArmhole) * 0.75, bE.x, bE.y),
    `L ${bF.x} ${bF.y}`,
    `L ${bA.x} ${bA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: SLEEVE ───────────────────────────────────────
  const slX0 = bX0 + px(halfBust, scale) + gap;
  const slY0 = originY;

  const slWidth = px(sleeveWidth * 2, scale);
  const slCapH  = px(armDepth * 0.6, scale);
  const slLen   = px(sleeveLen, scale);
  const slMidX  = slX0 + slWidth / 2;

  const onePieceCaps = createSleeveCapPathSegments(slX0, slY0 + slCapH, slMidX, slY0, slX0 + slWidth, slY0 + slCapH, slCapH);

  const sleevePath = [
    `M ${slX0} ${slY0 + slCapH}`, // underarm start
    onePieceCaps.leftCap,
    onePieceCaps.rightCap,
    `L ${slX0 + slWidth * 0.85} ${slY0 + slLen}`,
    `L ${slX0 + slWidth * 0.15} ${slY0 + slLen}`,
    `L ${slX0} ${slY0 + slCapH}`,
    'Z',
  ].join(' ');

  // ── PIECE 4: SKIRT PANEL ──────────────────────────────────
  const skX0 = originX;
  const skY0 = fY0 + px(bodiceLength, scale) + gap;

  const skWaistW = px(halfWaist * 2, scale);
  const skHemW   = px(halfBottom * 2 + (m.flare || 4) * 2, scale);
  const skLen    = px(skirtLength, scale);
  const skMidX   = skX0 + skHemW / 2;

  const skTopLeft: Point  = { x: skMidX - skWaistW / 2, y: skY0 };
  const skTopRight: Point = { x: skMidX + skWaistW / 2, y: skY0 };
  const skHemRight: Point = { x: skX0 + skHemW,         y: skY0 + skLen };
  const skHemLeft: Point  = { x: skX0,                  y: skY0 + skLen };

  const skirtPath = [
    `M ${skTopLeft.x} ${skTopLeft.y}`,
    cBez(skTopLeft.x + skWaistW * 0.3, skY0 - px(0.7, scale), skTopRight.x - skWaistW * 0.3, skY0 - px(0.7, scale), skTopRight.x, skTopRight.y),
    cBez(skTopRight.x + px(1.5, scale), skY0 + skLen * 0.35, skHemRight.x + px(1.0, scale), skY0 + skLen * 0.6, skHemRight.x, skHemRight.y),
    cBez(skHemRight.x - skHemW * 0.3, skY0 + skLen + px(2.0, scale), skHemLeft.x + skHemW * 0.3, skY0 + skLen + px(2.0, scale), skHemLeft.x, skHemLeft.y),
    cBez(skHemLeft.x - px(1.0, scale), skY0 + skLen * 0.6, skTopLeft.x - px(1.5, scale), skY0 + skLen * 0.35, skTopLeft.x, skTopLeft.y),
    'Z',
  ].join(' ');

  // ── COMBINED PATH & PIECES ARRAY ──────────────────────────
  const outline = [frontBodicePath, backBodicePath, sleevePath, skirtPath].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'front_bodice',
      label: 'FRONT BODICE',
      subLabel: '(Cut 1 on fold)',
      path: frontBodicePath,
      fillTint: 'rgba(79, 70, 229, 0.08)',
      strokeColor: '#4F46E5',
      labelCx: fCF_x + px(halfBust * 0.5, scale),
      labelCy: fY0 + px(bodiceLength * 0.5, scale),
      grainCx: fCF_x + px(halfBust * 0.5, scale),
      grainCy: fY0 + px(bodiceLength * 0.65, scale),
      grainLen: px(4, scale),
    },
    {
      id: 'back_bodice',
      label: 'BACK BODICE',
      subLabel: '(Cut 1 on fold)',
      path: backBodicePath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB_x + px(halfBust * 0.5, scale),
      labelCy: bY0 + px(bodiceLength * 0.5, scale),
      grainCx: bCB_x + px(halfBust * 0.5, scale),
      grainCy: bY0 + px(bodiceLength * 0.65, scale),
      grainLen: px(4, scale),
    },
    {
      id: 'sleeve',
      label: 'SLEEVE',
      subLabel: '(Cut 2 pair)',
      path: sleevePath,
      fillTint: 'rgba(217, 119, 6, 0.08)',
      strokeColor: '#D97706',
      labelCx: slMidX,
      labelCy: slY0 + slCapH + px(2, scale),
      grainCx: slMidX,
      grainCy: slY0 + slCapH + px(4, scale),
      grainLen: px(3.5, scale),
    },
    {
      id: 'skirt_panel',
      label: 'SKIRT PANEL (FLARED)',
      subLabel: '(Cut 2 front/back)',
      path: skirtPath,
      fillTint: 'rgba(220, 38, 38, 0.08)',
      strokeColor: '#DC2626',
      labelCx: skMidX,
      labelCy: skY0 + skLen * 0.4,
      grainCx: skMidX,
      grainCy: skY0 + skLen * 0.6,
      grainLen: px(6, scale),
    },
  ];

  // ── POINTS FOR LABELS ─────────────────────────────────────
  const points: PatternPoint[] = [
    { label: 'F-A', point: fA, description: 'Front CF neck top' },
    { label: 'F-B', point: fB, description: 'Front neck width' },
    { label: 'F-C', point: fC, description: 'Front shoulder tip' },
    { label: 'F-D', point: fD, description: 'Front underarm' },
    { label: 'F-E', point: fE, description: 'Front waist side' },
    { label: 'B-A', point: bA, description: 'Back CB neck top' },
    { label: 'B-C', point: bC, description: 'Back shoulder tip' },
    { label: 'S-A', point: { x: slMidX, y: slY0 }, description: 'Sleeve cap apex' },
    { label: 'K-A', point: skTopLeft, description: 'Skirt waist corner' },
    { label: 'K-B', point: skHemRight, description: 'Skirt hem flare corner' },
  ];

  // ── CONSTRUCTION LINES ────────────────────────────────────
  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF_x, y: yArmhole }, to: { x: fBust_x, y: yArmhole }, dashed: true },
    { from: { x: bCB_x, y: yArmhole }, to: { x: bBust_x, y: yArmhole }, dashed: true },
    { from: { x: skMidX, y: skY0 }, to: { x: skMidX, y: skY0 + skLen }, dashed: true },
  ];

  // ── MEASUREMENT ANNOTATIONS ───────────────────────────────
  const margin = px(1.2, scale);
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fCF_x - margin, y: fY0 }, to: { x: fCF_x - margin, y: yBodiceWaist }, label: `Bodice: ${bodiceLength}"`, direction: 'vertical' },
    { from: { x: fCF_x, y: fY0 - margin }, to: { x: fBust_x, y: fY0 - margin }, label: `Bust: ${(halfBust * 4).toFixed(0)}"`, direction: 'horizontal' },
    { from: { x: skX0 - margin, y: skY0 }, to: { x: skX0 - margin, y: skY0 + skLen }, label: `Skirt: ${skirtLength}"`, direction: 'vertical' },
    { from: { x: skMidX - skWaistW / 2, y: skY0 - margin }, to: { x: skMidX + skWaistW / 2, y: skY0 - margin }, label: `Waist: ${(halfWaist * 4).toFixed(0)}"`, direction: 'horizontal' },
  ];

  // ── BOUNDS ────────────────────────────────────────────────
  const boundsWidth = Math.max(skX0 + skHemW, slX0 + slWidth) + px(4, scale);
  const boundsHeight = skY0 + skLen + px(4, scale);

  return {
    outlinePath: outline,
    pieces,
    points,
    constructionLines,
    annotations,
    bounds: { width: boundsWidth, height: boundsHeight },
  };
}
