// ============================================================
// Fabriplay – Trouser / Formal Pant Pattern Drafting Engine
// Standard Trouser Block Principles (Joseph-Armstrong / Aldrich)
//
// All input measurements in INCHES.
// Creates 5 distinct pattern pieces:
//   1. Front Leg Panel (Cut 2) - front crotch curve & slant pocket line
//   2. Back Leg Panel (Cut 2) - back rise tilt + back crotch extension
//   3. Curved Waistband (Cut 1) - waistband width 1.5"
//   4. Slant Pocket Facing (Cut 2 pair)
//   5. Fly Zipper Shield Guard (Cut 1)
// ============================================================

import type {
  ConstructionLine,
  MeasurementAnnotation,
  Measurements,
  PantOptions,
  PatternData,
  PatternPoint,
  Point,
} from '../types';
import {
  createCrotchPathSegment,
  createHipSeamPathSegment,
  createInseamPathSegment,
  createCurvedWaistbandPath,
} from '../utils/curveUtils';

const px = (inches: number, scale: number) => inches * scale;

const cBez = (
  cx1: number, cy1: number,
  cx2: number, cy2: number,
  ex: number, ey: number
) => `C ${cx1.toFixed(2)} ${cy1.toFixed(2)} ${cx2.toFixed(2)} ${cy2.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;

export function calculatePantPattern(
  m: Measurements,
  scale: number,
  pantOptions?: PantOptions
): PatternData {
  const waist = m.waist || 32;
  const hip   = m.hip || 40;
  const outseam = m.outseam || 40;
  const inseam  = m.inseam || 30;
  const knee    = m.kneeCircumference || 18;
  const hemWidth= m.bottomWidth || 16;

  const crotchRise = outseam - inseam; // crotch rise height (e.g. 10")
  const hipDepth   = m.hipDepth || (crotchRise * 0.65);

  const frontWaistW  = waist / 4 + 0.5; // front waist width
  const backWaistW   = waist / 4 + 1.0; // back waist width (includes back dart)
  const frontHipW    = hip / 4;
  const backHipW     = hip / 4 + 0.5;

  const frontCrotchExt = hip / 16;       // ~2.5" front crotch extension
  const backCrotchExt  = hip / 8;        // ~5.0" back crotch extension

  const halfHem  = hemWidth / 2;
  const halfKnee = knee / 2;

  const gap = px(4, scale);
  const originX = 36;
  const originY = 30;

  // ── PIECE 1: FRONT LEG PANEL ───────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  const fCreaseX = fX0 + px(frontHipW / 2 + frontCrotchExt / 2, scale);

  const yWaist  = fY0;
  const yHip    = fY0 + px(hipDepth, scale);
  const yCrotch = fY0 + px(crotchRise, scale);
  const yKnee   = fY0 + px(crotchRise + inseam * 0.55, scale);
  const yHem    = fY0 + px(outseam, scale);

  const fWaistLeft: Point  = { x: fCreaseX - px(frontWaistW / 2, scale), y: yWaist };
  const fWaistRight: Point = { x: fCreaseX + px(frontWaistW / 2, scale), y: yWaist };

  const fHipLeft: Point    = { x: fCreaseX - px(frontHipW / 2, scale), y: yHip };
  const fCrotchRight: Point= { x: fCreaseX + px(frontHipW / 2 + frontCrotchExt, scale), y: yCrotch };

  const fKneeLeft: Point   = { x: fCreaseX - px(halfKnee / 2, scale), y: yKnee };
  const fKneeRight: Point  = { x: fCreaseX + px(halfKnee / 2, scale), y: yKnee };

  const fHemLeft: Point    = { x: fCreaseX - px(halfHem / 2, scale), y: yHem };
  const fHemRight: Point   = { x: fCreaseX + px(halfHem / 2, scale), y: yHem };

  const frontLegPath = [
    `M ${fWaistLeft.x} ${fWaistLeft.y}`,
    `L ${fWaistRight.x} ${fWaistRight.y}`,
    createCrotchPathSegment(fWaistRight.x, fWaistRight.y, fWaistRight.x + px(0.5, scale), yHip, fCrotchRight.x, fCrotchRight.y, true),
    createInseamPathSegment(fCrotchRight.x, fCrotchRight.y, fKneeRight.x, fKneeRight.y),
    `L ${fHemRight.x} ${fHemRight.y}`,
    `L ${fHemLeft.x} ${fHemLeft.y}`,
    `L ${fKneeLeft.x} ${fKneeLeft.y}`,
    createHipSeamPathSegment(fWaistLeft.x, fWaistLeft.y, fHipLeft.x, fHipLeft.y, fKneeLeft.x, fKneeLeft.y),
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK LEG PANEL ────────────────────────────────
  const bX0 = fX0 + px(frontHipW + frontCrotchExt + 3, scale) + gap;
  const bY0 = originY;

  const bCreaseX = bX0 + px(backHipW / 2 + backCrotchExt / 2, scale);

  const backTiltRise = 1.25; // 1.25" back waistband tilt & raise
  const yBackWaistTop = yWaist - px(backTiltRise, scale);

  const bWaistLeft: Point  = { x: bCreaseX - px(backWaistW / 2 + 0.5, scale), y: yWaist };
  const bWaistRight: Point = { x: bCreaseX + px(backWaistW / 2 - 0.75, scale), y: yBackWaistTop };

  const bHipLeft: Point    = { x: bCreaseX - px(backHipW / 2 + 0.5, scale), y: yHip };
  const bCrotchRight: Point= { x: bCreaseX + px(backHipW / 2 + backCrotchExt, scale), y: yCrotch };

  const bKneeLeft: Point   = { x: bCreaseX - px((halfKnee + 1) / 2, scale), y: yKnee };
  const bKneeRight: Point  = { x: bCreaseX + px((halfKnee + 1) / 2, scale), y: yKnee };

  const bHemLeft: Point    = { x: bCreaseX - px((halfHem + 1) / 2, scale), y: yHem };
  const bHemRight: Point   = { x: bCreaseX + px((halfHem + 1) / 2, scale), y: yHem };

  const backLegPath = [
    `M ${bWaistLeft.x} ${bWaistLeft.y}`,
    `L ${bWaistRight.x} ${bWaistRight.y}`,
    createCrotchPathSegment(bWaistRight.x, bWaistRight.y, bWaistRight.x - px(0.75, scale), yHip, bCrotchRight.x, bCrotchRight.y, false),
    createInseamPathSegment(bCrotchRight.x, bCrotchRight.y, bKneeRight.x, bKneeRight.y),
    `L ${bHemRight.x} ${bHemRight.y}`,
    `L ${bHemLeft.x} ${bHemLeft.y}`,
    `L ${bKneeLeft.x} ${bKneeLeft.y}`,
    createHipSeamPathSegment(bWaistLeft.x, bWaistLeft.y, bHipLeft.x, bHipLeft.y, bKneeLeft.x, bKneeLeft.y),
    'Z',
  ].join(' ');

  // ── PIECE 3: CURVED WAISTBAND ──────────────────────────────
  const wbX0 = originX;
  const wbY0 = fY0 + px(outseam + 2, scale) + gap;

  const wbLen = px(waist + 2.5, scale); // includes 2.5" fly extension
  const wbH   = px(pantOptions?.waistbandWidth || 1.5, scale);

  const waistbandPath = createCurvedWaistbandPath(wbX0, wbY0, wbLen, wbH, px(0.4, scale));

  // ── PIECE 4 & 5: POCKET FACING & FLY SHIELD ───────────────
  const pockX0 = wbX0 + wbLen + px(2, scale);
  const pockY0 = wbY0;
  const pockW  = px(6, scale);
  const pockH  = px(11, scale);

  const pocketFacingPath = [
    `M ${pockX0} ${pockY0}`,
    `L ${pockX0 + pockW} ${pockY0}`,
    `L ${pockX0 + pockW} ${pockY0 + pockH}`,
    cBez(pockX0 + pockW * 0.5, pockY0 + pockH + px(1, scale), pockX0, pockY0 + pockH * 0.8, pockX0, pockY0 + pockH * 0.8),
    'Z',
  ].join(' ');

  const flyW = px(2.25, scale);
  const flyH = px(8.5, scale);
  const flyShieldPath = [
    `M ${pockX0 + pockW + px(1.5, scale)} ${pockY0}`,
    `L ${pockX0 + pockW + px(1.5, scale) + flyW} ${pockY0}`,
    `L ${pockX0 + pockW + px(1.5, scale) + flyW} ${pockY0 + flyH - px(1, scale)}`,
    cBez(pockX0 + pockW + px(1.5, scale) + flyW * 0.5, pockY0 + flyH, pockX0 + pockW + px(1.5, scale), pockY0 + flyH - px(0.5, scale), pockX0 + pockW + px(1.5, scale), pockY0 + flyH - px(1, scale)),
    'Z',
  ].join(' ');

  const outline = [frontLegPath, backLegPath, waistbandPath, pocketFacingPath, flyShieldPath].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'front_leg',
      label: 'TROUSER FRONT LEG',
      subLabel: '(Cut 2 pair)',
      path: frontLegPath,
      fillTint: 'rgba(59, 130, 246, 0.08)',
      strokeColor: '#2563EB',
      labelCx: fCreaseX,
      labelCy: fY0 + px(crotchRise + inseam * 0.3, scale),
      grainCx: fCreaseX,
      grainCy: fY0 + px(crotchRise + inseam * 0.5, scale),
      grainLen: px(8, scale),
    },
    {
      id: 'back_leg',
      label: 'TROUSER BACK LEG',
      subLabel: '(Cut 2 pair)',
      path: backLegPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCreaseX,
      labelCy: bY0 + px(crotchRise + inseam * 0.3, scale),
      grainCx: bCreaseX,
      grainCy: bY0 + px(crotchRise + inseam * 0.5, scale),
      grainLen: px(8, scale),
    },
    {
      id: 'waistband',
      label: 'CURVED WAISTBAND',
      subLabel: '(Cut 1)',
      path: waistbandPath,
      fillTint: 'rgba(139, 92, 246, 0.08)',
      strokeColor: '#7C3AED',
      labelCx: wbX0 + wbLen / 2,
      labelCy: wbY0 + wbH / 2,
    },
    {
      id: 'pocket_facing',
      label: 'SLANT POCKET FACING',
      subLabel: '(Cut 2 pair)',
      path: pocketFacingPath,
      fillTint: 'rgba(107, 114, 128, 0.08)',
      strokeColor: '#4B5563',
      labelCx: pockX0 + pockW / 2,
      labelCy: pockY0 + pockH / 2,
    },
    {
      id: 'fly_shield',
      label: 'FLY SHIELD GUARD',
      subLabel: '(Cut 1)',
      path: flyShieldPath,
      fillTint: 'rgba(107, 114, 128, 0.08)',
      strokeColor: '#4B5563',
      labelCx: pockX0 + pockW + px(1.5, scale) + flyW / 2,
      labelCy: pockY0 + flyH / 2,
    },
  ];

  const points: PatternPoint[] = [
    { label: 'F-W', point: fWaistLeft, description: 'Front waist side' },
    { label: 'F-C', point: fCrotchRight, description: 'Front crotch fork extension' },
    { label: 'B-W', point: bWaistRight, description: 'Back waist rise top' },
    { label: 'B-C', point: bCrotchRight, description: 'Back crotch fork extension' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: fCreaseX, y: yWaist }, to: { x: fCreaseX, y: yHem }, dashed: true },
    { from: { x: bCreaseX, y: yWaist }, to: { x: bCreaseX, y: yHem }, dashed: true },
    { from: { x: fX0, y: yCrotch }, to: { x: fCrotchRight.x, y: yCrotch }, dashed: true },
    { from: { x: bX0, y: yCrotch }, to: { x: bCrotchRight.x, y: yCrotch }, dashed: true },
  ];

  const margin = px(1.2, scale);
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fWaistLeft.x - margin, y: yWaist }, to: { x: fHemLeft.x - margin, y: yHem }, label: `Outseam: ${outseam}"`, direction: 'vertical' },
    { from: { x: fCrotchRight.x + margin, y: yCrotch }, to: { x: fHemRight.x + margin, y: yHem }, label: `Inseam: ${inseam}"`, direction: 'vertical' },
    { from: { x: fCreaseX - px(frontHipW / 2, scale), y: yHip - margin }, to: { x: fCreaseX + px(frontHipW / 2, scale), y: yHip - margin }, label: `Hip: ${hip}"`, direction: 'horizontal' },
  ];

  const boundsWidth = Math.max(bX0 + px(backHipW + backCrotchExt, scale), wbX0 + wbLen) + px(4, scale);
  const boundsHeight = wbY0 + wbH + px(12, scale);

  return {
    outlinePath: outline,
    pieces,
    points,
    constructionLines,
    annotations,
    bounds: { width: boundsWidth, height: boundsHeight },
  };
}
