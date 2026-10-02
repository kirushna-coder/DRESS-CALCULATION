// ============================================================
// Fabriplay – Round Neck T-Shirt Pattern Drafting Engine
// Knitwear Flat-Pattern Drafting Principles (Aldrich Knitwear)
//
// All input measurements in INCHES.
// Creates 4 distinct pattern pieces:
//   1. Front T-Shirt Panel (Cut 1 on fold) - round scoop neck curve
//   2. Back T-Shirt Panel (Cut 1 on fold) - shallow back neck curve
//   3. Knit Sleeve (Cut 2 pair) - relaxed drop-shoulder cap
//   4. Neckband Ribbing Strip (Cut 1) - calculated at 85% of total neck perimeter
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

export function calculateTShirtPattern(
  m: Measurements,
  scale: number
): PatternData {
  const ease = m.ease ?? 2.5; // knitwear ease allowance
  const chest       = m.bust || 38;
  const halfChest   = (chest + ease) / 4;
  const halfWaist   = halfChest - 0.5; // subtle knit taper
  const halfNeck    = (m.neckWidth || 6) / 2;
  const halfShoulder= (m.shoulderWidth || 16) / 2;

  const armDepth    = m.armholeDepth || 7.5;
  const frontNeckD  = m.neckDepth || 3.5; // round neck dip
  const backNeckD   = m.backNeckDepth || 1.0;
  const fullLen     = m.fullLength || 27;
  const sleeveLen   = m.sleeveLength || 8;
  const bicep       = Math.max(m.bicepCircumference || 14, armDepth * 1.8);

  const gap = px(3.5, scale);
  const originX = 36;
  const originY = 30;

  // ── PIECE 1: FRONT T-SHIRT ────────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  const fCF_x      = fX0;
  const fNeck_x    = fCF_x + px(halfNeck, scale);
  const fSh_x      = fCF_x + px(halfShoulder, scale);
  const fChest_x   = fCF_x + px(halfChest, scale);
  const fWaist_x   = fCF_x + px(halfWaist, scale);

  const yTop       = fY0;
  const yNeckDip   = fY0 + px(frontNeckD, scale);
  const yShSlope   = fY0 + px(m.shoulderSlope || 0.85, scale);
  const yArmhole   = fY0 + px(armDepth, scale);
  const yHem       = fY0 + px(fullLen, scale);

  const fA: Point = { x: fCF_x,    y: yNeckDip };
  const fB: Point = { x: fNeck_x,  y: yTop };
  const fC: Point = { x: fSh_x,    y: yShSlope };
  const fE: Point = { x: fWaist_x, y: yHem };
  const fF: Point = { x: fCF_x,    y: yHem };

  const frontTShirtPath = [
    `M ${fA.x} ${fA.y}`,
    createFrontNecklineSegment(fCF_x, yNeckDip, fNeck_x, yTop),
    `L ${fC.x} ${fC.y}`,
    createArmholePathSegment(fSh_x, yShSlope, fChest_x, yArmhole, px(armDepth, scale), true),
    `L ${fE.x} ${fE.y}`,
    `L ${fF.x} ${fF.y}`,
    `L ${fA.x} ${fA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK T-SHIRT ─────────────────────────────────
  const bX0 = fX0 + px(halfChest + 1.5, scale) + gap;
  const bY0 = originY;

  const bCB_x     = bX0;
  const bNeck_x   = bCB_x + px(halfNeck, scale);
  const bSh_x     = bCB_x + px(halfShoulder, scale);
  const bChest_x  = bCB_x + px(halfChest, scale);
  const bWaist_x  = bCB_x + px(halfWaist, scale);

  const bA: Point = { x: bCB_x,    y: yTop + px(backNeckD, scale) };
  const bC: Point = { x: bSh_x,    y: yShSlope };
  const bE: Point = { x: bWaist_x, y: yHem };
  const bF: Point = { x: bCB_x,    y: yHem };

  const backTShirtPath = [
    `M ${bA.x} ${bA.y}`,
    createBackNecklineSegment(bCB_x, bA.y, bNeck_x, yTop),
    `L ${bC.x} ${bC.y}`,
    createArmholePathSegment(bSh_x, yShSlope, bChest_x, yArmhole, px(armDepth, scale), false),
    `L ${bE.x} ${bE.y}`,
    `L ${bF.x} ${bF.y}`,
    `L ${bA.x} ${bA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: KNIT SLEEVE ──────────────────────────────────
  const slX0 = bX0 + px(halfChest + 1.5, scale) + gap;
  const slY0 = originY;

  const slWidth = px(bicep, scale);
  const slCapH  = px(armDepth * 0.5, scale); // shallow knit cap
  const slLen   = px(sleeveLen, scale);
  const slMidX  = slX0 + slWidth / 2;

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
    `L ${slX0 + slWidth * 0.82} ${slY0 + slLen}`,
    `L ${slX0 + slWidth * 0.18} ${slY0 + slLen}`,
    `L ${slX0} ${slY0 + slCapH}`,
    'Z',
  ].join(' ');

  // ── PIECE 4: NECKBAND RIBBING STRIP ────────────────────────
  // Calculate total neck circumference: approx 2 * (front neck curve + back neck curve)
  // Ribbing strip length is 85% of total neck perimeter per knitwear standard
  const approxNeckPerimeter = (halfNeck * 2.8 + frontNeckD * 1.5);
  const ribbingLength = approxNeckPerimeter * 0.85;
  const ribbingHeight = 1.0; // 1.0" strip height (0.5" finished width when folded)

  const nbX0 = originX;
  const nbY0 = fY0 + px(fullLen + 1.5, scale) + gap;
  const nbW  = px(ribbingLength, scale);
  const nbH  = px(ribbingHeight, scale);

  const neckbandPath = [
    `M ${nbX0} ${nbY0}`,
    `L ${nbX0 + nbW} ${nbY0}`,
    `L ${nbX0 + nbW} ${nbY0 + nbH}`,
    `L ${nbX0} ${nbY0 + nbH}`,
    'Z',
  ].join(' ');

  const outline = [frontTShirtPath, backTShirtPath, sleevePath, neckbandPath].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'front_tshirt',
      label: 'FRONT T-SHIRT',
      subLabel: '(Cut 1 on fold)',
      path: frontTShirtPath,
      fillTint: 'rgba(59, 130, 246, 0.08)',
      strokeColor: '#2563EB',
      labelCx: fCF_x + px(halfChest * 0.45, scale),
      labelCy: fY0 + px(fullLen * 0.45, scale),
      grainCx: fCF_x + px(halfChest * 0.45, scale),
      grainCy: fY0 + px(fullLen * 0.65, scale),
      grainLen: px(5, scale),
    },
    {
      id: 'back_tshirt',
      label: 'BACK T-SHIRT',
      subLabel: '(Cut 1 on fold)',
      path: backTShirtPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB_x + px(halfChest * 0.45, scale),
      labelCy: bY0 + px(fullLen * 0.45, scale),
      grainCx: bCB_x + px(halfChest * 0.45, scale),
      grainCy: bY0 + px(fullLen * 0.65, scale),
      grainLen: px(5, scale),
    },
    {
      id: 'tshirt_sleeve',
      label: 'TEE SLEEVE',
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
      id: 'neckband',
      label: 'ROUND NECKBAND RIBBING',
      subLabel: '(Cut 1 on stretch grain)',
      path: neckbandPath,
      fillTint: 'rgba(139, 92, 246, 0.08)',
      strokeColor: '#7C3AED',
      labelCx: nbX0 + nbW / 2,
      labelCy: nbY0 + nbH / 2,
    },
  ];

  const points: PatternPoint[] = [
    { label: 'T-A', point: fA, description: 'Front round neck dip' },
    { label: 'T-B', point: fB, description: 'Front neck width' },
    { label: 'T-C', point: fC, description: 'Shoulder tip' },
    { label: 'S-A', point: { x: slMidX, y: slY0 }, description: 'Sleeve cap apex' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF_x, y: yTop }, to: { x: fCF_x, y: yHem }, dashed: true },
    { from: { x: bCB_x, y: yTop }, to: { x: bCB_x, y: yHem }, dashed: true },
  ];

  const margin = px(1.2, scale);
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fCF_x - margin, y: fY0 }, to: { x: fCF_x - margin, y: yHem }, label: `Length: ${fullLen}"`, direction: 'vertical' },
    { from: { x: fCF_x, y: fY0 - margin }, to: { x: fChest_x, y: fY0 - margin }, label: `Chest: ${(halfChest * 4).toFixed(1)}"`, direction: 'horizontal' },
    { from: { x: nbX0, y: nbY0 - margin }, to: { x: nbX0 + nbW, y: nbY0 - margin }, label: `Neckband: ${ribbingLength.toFixed(1)}"`, direction: 'horizontal' },
  ];

  const boundsWidth = Math.max(bX0 + px(halfChest, scale), slX0 + slWidth) + px(4, scale);
  const boundsHeight = nbY0 + nbH + px(4, scale);

  return {
    outlinePath: outline,
    pieces,
    points,
    constructionLines,
    annotations,
    bounds: { width: boundsWidth, height: boundsHeight },
  };
}
