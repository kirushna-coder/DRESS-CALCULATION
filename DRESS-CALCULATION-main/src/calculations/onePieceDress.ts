// ============================================================
// Fabriplay – One-Piece Dress / Frock Pattern Drafting Engine
// Standard Flat-Pattern Drafting Principles
// ============================================================

import type {
  ConstructionLine,
  MeasurementAnnotation,
  Measurements,
  PatternData,
  PatternPoint,
  Point,
} from '../types';
import {
  createFrontNecklineSegment,
  createBackNecklineSegment,
  createArmholePathSegment,
  createSleeveCapPathSegments,
} from '../utils/curveUtils';

const px = (inches: number, scale: number) => inches * scale;

const cBez = (
  cx1: number, cy1: number,
  cx2: number, cy2: number,
  ex: number, ey: number
) => `C ${cx1.toFixed(2)} ${cy1.toFixed(2)} ${cx2.toFixed(2)} ${cy2.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;

export const DEFAULT_MEASUREMENTS: Measurements = {
  dressSize: 38,
  fullLength: 54,
  shoulderWidth: 15,
  neckWidth: 6,
  neckDepth: 5,
  armholeDepth: 7,
  bust: 38,
  waist: 30,
  hip: 40,
  bottomWidth: 24,
  flare: 12,
  ease: 1.5,
  sleeveLength: 7,
  bicepCircumference: 13,
  backNeckDepth: 1.5,
  shoulderSlope: 0.75,
  waistLength: 15.5,
  hipDepth: 8,
};

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
  | 'ease'
  | 'sleeveLength'
  | 'bicepCircumference'
  | 'backNeckDepth'
  | 'shoulderSlope'
  | 'waistLength'
  | 'hipDepth';

export const MEASUREMENT_BOUNDS: Record<
  CadMeasurementKey,
  { min: number; max: number; label: string; unit: string }
> = {
  dressSize:     { min: 28, max: 60,  label: 'Dress Size',       unit: '' },
  fullLength:    { min: 20, max: 80,  label: 'Full Length',       unit: 'in' },
  shoulderWidth: { min: 8,  max: 22,  label: 'Shoulder Width',    unit: 'in' },
  neckWidth:     { min: 4,  max: 12,  label: 'Neck Width',        unit: 'in' },
  neckDepth:     { min: 2,  max: 10,  label: 'Front Neck Depth',  unit: 'in' },
  armholeDepth:  { min: 4,  max: 14,  label: 'Armhole Depth',     unit: 'in' },
  bust:          { min: 26, max: 65,  label: 'Bust / Chest',      unit: 'in' },
  waist:         { min: 20, max: 60,  label: 'Waist',             unit: 'in' },
  hip:           { min: 26, max: 70,  label: 'Hip',               unit: 'in' },
  bottomWidth:   { min: 10, max: 60,  label: 'Bottom Width',      unit: 'in' },
  flare:         { min: 0,  max: 30,  label: 'Skirt Flare Sweep', unit: 'in' },
  ease:          { min: 0,  max: 6,   label: 'Ease Allowance',    unit: 'in' },
  sleeveLength:  { min: 1,  max: 36,  label: 'Sleeve Length',     unit: 'in' },
  bicepCircumference: { min: 8, max: 26, label: 'Bicep Circumference', unit: 'in' },
  backNeckDepth: { min: 0.5, max: 6,  label: 'Back Neck Depth',   unit: 'in' },
  shoulderSlope: { min: 0.25, max: 2.5, label: 'Shoulder Slope',  unit: 'in' },
  waistLength:   { min: 10, max: 24, label: 'Shoulder-to-Waist Length', unit: 'in' },
  hipDepth:      { min: 4, max: 14,  label: 'Waist-to-Hip Depth', unit: 'in' },
};

export function calculateOnePieceDress(
  m: Measurements,
  scale: number
): PatternData {
  const ease = m.ease ?? 1.5;
  const halfBust = (m.bust + ease) / 4;
  const halfWaist = (m.waist + ease) / 4;
  const halfNeck = (m.neckWidth || 6) / 2;
  const halfShoulder = (m.shoulderWidth || 15) / 2;

  const armDepth = m.armholeDepth || 7;
  const frontNeckD = m.neckDepth || 5;
  const backNeckD = m.backNeckDepth || 1.5;
  const totalLength = m.fullLength || 54;
  const bodiceLength = m.waistLength || 15.5;
  const skirtLength = Math.max(12, totalLength - bodiceLength);
  const sleeveLen = m.sleeveLength || 7;
  const sleeveBicep = Math.max(m.bicepCircumference || 13, armDepth * 1.8);
  const flareSweep = m.flare ?? 12;

  const gap = px(3.5, scale);
  const originX = 36;
  const originY = 30;

  // ── PIECE 1: FRONT BODICE ─────────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  const fCF_x = fX0;
  const fNeck_x = fCF_x + px(halfNeck, scale);
  const fSh_x = fCF_x + px(halfShoulder, scale);
  const fBust_x = fCF_x + px(halfBust + 0.25, scale); // Front is slightly wider
  const fWaist_x = fCF_x + px(halfWaist + 0.25, scale);

  const yTop = fY0;
  const yNeckDip = fY0 + px(frontNeckD, scale);
  const yShSlope = fY0 + px(m.shoulderSlope || 0.75, scale);
  const yArmhole = fY0 + px(armDepth, scale);
  const yBodiceWaist = fY0 + px(bodiceLength, scale);

  // Bust dart
  const bustPointX = fCF_x + px(halfBust * 0.45, scale);
  const bustPointY = yArmhole + px(1, scale);
  const waistDartWidth = px(0.75, scale);
  
  const fA: Point = { x: fCF_x, y: yNeckDip };
  const fC: Point = { x: fSh_x, y: yShSlope };
  const fE: Point = { x: fWaist_x + waistDartWidth, y: yBodiceWaist };
  const fF: Point = { x: fCF_x, y: yBodiceWaist };

  const frontBodicePath = [
    `M ${fA.x} ${fA.y}`,
    createFrontNecklineSegment(fCF_x, yNeckDip, fNeck_x, yTop),
    `L ${fC.x} ${fC.y}`,
    createArmholePathSegment(fSh_x, yShSlope, fBust_x, yArmhole, px(armDepth, scale), true),
    `L ${fE.x} ${fE.y}`,
    `L ${bustPointX + waistDartWidth/2} ${yBodiceWaist}`,
    `L ${bustPointX} ${bustPointY}`,
    `L ${bustPointX - waistDartWidth/2} ${yBodiceWaist}`,
    `L ${fF.x} ${fF.y}`,
    `L ${fA.x} ${fA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK BODICE ──────────────────────────────────
  const bX0 = fX0 + px(halfBust * 2, scale) + gap;
  const bY0 = originY;

  const bCB_x = bX0;
  const bNeck_x = bCB_x + px(halfNeck, scale);
  const bSh_x = bCB_x + px(halfShoulder, scale);
  const bBust_x = bCB_x + px(halfBust - 0.25, scale); // Back is slightly narrower
  const bWaist_x = bCB_x + px(halfWaist - 0.25, scale);

  const bA: Point = { x: bCB_x, y: yTop + px(backNeckD, scale) };
  const bC: Point = { x: bSh_x, y: yShSlope };
  const bE: Point = { x: bWaist_x + waistDartWidth, y: yBodiceWaist };
  const bF: Point = { x: bCB_x, y: yBodiceWaist };

  const backDartX = bCB_x + px(halfBust * 0.45, scale);
  const backDartY = yArmhole - px(1, scale);

  const backBodicePath = [
    `M ${bA.x} ${bA.y}`,
    createBackNecklineSegment(bCB_x, bA.y, bNeck_x, yTop),
    `L ${bC.x} ${bC.y}`,
    createArmholePathSegment(bSh_x, yShSlope, bBust_x, yArmhole, px(armDepth, scale), false),
    `L ${bE.x} ${bE.y}`,
    `L ${backDartX + waistDartWidth/2} ${yBodiceWaist}`,
    `L ${backDartX} ${backDartY}`,
    `L ${backDartX - waistDartWidth/2} ${yBodiceWaist}`,
    `L ${bF.x} ${bF.y}`,
    `L ${bA.x} ${bA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: SLEEVE ───────────────────────────────────────
  const slX0 = bX0 + px(halfBust * 2, scale) + gap;
  const slY0 = originY;

  const slWidth = px(sleeveBicep, scale);
  const slCapH = px(armDepth * 0.75, scale); // Better sleeve cap calculation
  const slLen = px(sleeveLen, scale);
  const slMidX = slX0 + slWidth / 2;
  const wristW = slWidth * 0.75; // Taper for the wrist

  const sleeveCaps = createSleeveCapPathSegments(
    slX0, slY0 + slCapH,
    slMidX, slY0,
    slX0 + slWidth, slY0 + slCapH,
    slCapH
  );

  const sleevePath = [
    `M ${slX0} ${slY0 + slCapH}`,
    sleeveCaps.leftCap,
    sleeveCaps.rightCap,
    `L ${slMidX + wristW/2} ${slY0 + slLen}`,
    `L ${slMidX - wristW/2} ${slY0 + slLen}`,
    `L ${slX0} ${slY0 + slCapH}`,
    'Z',
  ].join(' ');

  // ── PIECE 4: FLARED SKIRT PANEL ───────────────────────────
  const skX0 = originX;
  const skY0 = fY0 + px(bodiceLength, scale) + gap;

  // True mathematically distributed flare using standard cut and spread logic
  const skWaistW = px(halfWaist * 2 + 1, scale); // Dart allowance
  const skHemW = px(halfWaist * 2 + flareSweep * 2, scale);
  const skLen = px(skirtLength, scale);
  const skMidX = skX0 + skHemW / 2;

  // Sweep arc calculation
  const skTopLeft: Point = { x: skMidX - skWaistW / 2, y: skY0 };
  const skTopRight: Point = { x: skMidX + skWaistW / 2, y: skY0 };
  
  // Adding drop to waistline for flare distribution
  const waistDrop = px(0.5, scale);
  const hemDrop = px(1.5, scale);
  
  const skHemRight: Point = { x: skX0 + skHemW, y: skY0 + skLen };
  const skHemLeft: Point = { x: skX0, y: skY0 + skLen };

  const skirtPath = [
    `M ${skTopLeft.x} ${skTopLeft.y}`,
    cBez(skTopLeft.x + skWaistW * 0.3, skY0 + waistDrop, skTopRight.x - skWaistW * 0.3, skY0 + waistDrop, skTopRight.x, skTopRight.y),
    `L ${skHemRight.x} ${skHemRight.y}`,
    cBez(skHemRight.x - skHemW * 0.3, skY0 + skLen + hemDrop, skHemLeft.x + skHemW * 0.3, skY0 + skLen + hemDrop, skHemLeft.x, skHemLeft.y),
    `L ${skTopLeft.x} ${skTopLeft.y}`,
    'Z',
  ].join(' ');

  const outline = [frontBodicePath, backBodicePath, sleevePath, skirtPath].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'front_bodice',
      label: 'FRONT BODICE',
      subLabel: '(Cut 1 on fold)',
      path: frontBodicePath,
      fillTint: 'rgba(79, 70, 229, 0.08)',
      strokeColor: '#4F46E5',
      labelCx: fCF_x + px(halfBust * 0.45, scale),
      labelCy: fY0 + px(bodiceLength * 0.45, scale),
      grainCx: fCF_x + px(halfBust * 0.45, scale),
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
      labelCx: bCB_x + px(halfBust * 0.45, scale),
      labelCy: bY0 + px(bodiceLength * 0.45, scale),
      grainCx: bCB_x + px(halfBust * 0.45, scale),
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
      labelCy: slY0 + slCapH + px(1.5, scale),
      grainCx: slMidX,
      grainCy: slY0 + slCapH + px(3.5, scale),
      grainLen: px(3, scale),
    },
    {
      id: 'skirt_panel',
      label: 'SKIRT PANEL (FLARED)',
      subLabel: '(Cut 2 front/back)',
      path: skirtPath,
      fillTint: 'rgba(220, 38, 38, 0.08)',
      strokeColor: '#DC2626',
      labelCx: skMidX,
      labelCy: skY0 + skLen * 0.35,
      grainCx: skMidX,
      grainCy: skY0 + skLen * 0.6,
      grainLen: px(6, scale),
    },
  ];

  const points: PatternPoint[] = [];

  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF_x, y: yArmhole }, to: { x: fBust_x, y: yArmhole }, dashed: true },
    { from: { x: bCB_x, y: yArmhole }, to: { x: bBust_x, y: yArmhole }, dashed: true },
  ];

  const annotations: MeasurementAnnotation[] = [];

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
