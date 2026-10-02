// ============================================================
// Fabriplay – Fitted Saree Blouse Pattern Drafting Engine
// Indian Saree Blouse Drafting Principles (Katori / Princess Cut)
//
// All input measurements in INCHES.
// Creates 4 distinct pattern pieces:
//   1. Front Blouse Panel (Cut 2) - princess seam / bust dart cut
//   2. Back Blouse Panel (Cut 1 on fold) - deep back neck drop & waist darts
//   3. Underbust Belt / Patti Band (Cut 2) - curved waist belt
//   4. Fitted Short Sleeve (Cut 2 pair) - fitted armhole & bicep
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

export function calculateBlousePattern(
  m: Measurements,
  scale: number
): PatternData {
  const ease = m.ease ?? 0.75; // snug blouse ease allowance
  const bust        = m.bust || 36;
  const waist       = m.waist || 28;
  const halfBust    = (bust + ease) / 4;
  const halfWaist   = (waist + ease) / 4;
  const halfNeck    = (m.neckWidth || 5.5) / 2;
  const halfShoulder= (m.shoulderWidth || 14) / 2;

  const armDepth    = m.armholeDepth || 6.5;
  const frontNeckD  = m.neckDepth || 6.0; // deep front blouse neck
  const backNeckD   = m.backNeckDepth || 8.5; // deep back blouse neck
  const blouseLen   = m.fullLength || 14.5;
  const beltH       = 2.25; // 2.25" underbust patti band height
  const upperBodyLen= blouseLen - beltH;
  const sleeveLen   = m.sleeveLength || 5;
  const bicep       = Math.max(m.bicepCircumference || 12, armDepth * 1.7);

  const gap = px(3.5, scale);
  const originX = 36;
  const originY = 30;

  // ── PIECE 1: FRONT BLOUSE (PRINCESS / DART CUT) ───────────
  const fX0 = originX;
  const fY0 = originY;

  const fCF_x      = fX0;
  const fNeck_x    = fCF_x + px(halfNeck, scale);
  const fSh_x      = fCF_x + px(halfShoulder, scale);
  const fBust_x    = fCF_x + px(halfBust, scale);
  const fWaist_x   = fCF_x + px(halfWaist, scale);

  const yTop       = fY0;
  const yNeckDip   = fY0 + px(frontNeckD, scale);
  const yShSlope   = fY0 + px(0.75, scale);
  const yArmhole   = fY0 + px(armDepth, scale);
  const yApex      = fY0 + px(9.5, scale); // bust apex level
  const yBeltJoin  = fY0 + px(upperBodyLen, scale);

  const fApexPt: Point = { x: fCF_x + px(3.5, scale), y: yApex };

  const fA: Point = { x: fCF_x,    y: yNeckDip };
  const fC: Point = { x: fSh_x,    y: yShSlope };
  const fE: Point = { x: fWaist_x, y: yBeltJoin };
  const fF: Point = { x: fCF_x,    y: yBeltJoin + px(0.5, scale) };

  const frontBlousePath = [
    `M ${fA.x} ${fA.y}`,
    createFrontNecklineSegment(fCF_x, yNeckDip, fNeck_x, yTop),
    `L ${fC.x} ${fC.y}`,
    createArmholePathSegment(fSh_x, yShSlope, fBust_x, yArmhole, px(armDepth, scale), true),
    cBez(fBust_x - px(0.3, scale), yArmhole + (yBeltJoin - yArmhole) * 0.5, fWaist_x + px(0.2, scale), yBeltJoin - px(0.5, scale), fE.x, fE.y),
    cBez(fE.x - px(halfWaist * 0.4, scale), yBeltJoin + px(0.4, scale), fCF_x + px(halfWaist * 0.3, scale), yBeltJoin + px(0.6, scale), fF.x, fF.y),
    `L ${fA.x} ${fA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK BLOUSE (DEEP NECK) ──────────────────────
  const bX0 = fX0 + px(halfBust + 1.5, scale) + gap;
  const bY0 = originY;

  const bCB_x     = bX0;
  const bNeck_x   = bCB_x + px(halfNeck, scale);
  const bSh_x     = bCB_x + px(halfShoulder, scale);
  const bBust_x   = bCB_x + px(halfBust, scale);
  const bWaist_x  = bCB_x + px(halfWaist, scale);

  const bA: Point = { x: bCB_x,    y: yTop + px(backNeckD, scale) };
  const bC: Point = { x: bSh_x,    y: yShSlope };
  const bE: Point = { x: bWaist_x, y: yBeltJoin };
  const bF: Point = { x: bCB_x,    y: yBeltJoin };

  const backBlousePath = [
    `M ${bA.x} ${bA.y}`,
    createBackNecklineSegment(bCB_x, bA.y, bNeck_x, yTop),
    `L ${bC.x} ${bC.y}`,
    createArmholePathSegment(bSh_x, yShSlope, bBust_x, yArmhole, px(armDepth, scale), false),
    cBez(bBust_x - px(0.3, scale), yArmhole + (yBeltJoin - yArmhole) * 0.5, bWaist_x + px(0.2, scale), yBeltJoin - px(0.5, scale), bE.x, bE.y),
    `L ${bF.x} ${bF.y}`,
    `L ${bA.x} ${bA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: UNDERBUST BELT / PATTI BAND ───────────────────
  const beltX0 = originX;
  const beltY0 = fY0 + px(blouseLen + 1.5, scale) + gap;
  const beltW  = px(halfWaist, scale);
  const beltHPx= px(beltH, scale);

  const pattiBandPath = [
    `M ${beltX0} ${beltY0}`,
    cBez(beltX0 + beltW * 0.4, beltY0 - px(0.5, scale), beltX0 + beltW * 0.8, beltY0 - px(0.2, scale), beltX0 + beltW, beltY0 - px(0.4, scale)),
    `L ${beltX0 + beltW} ${beltY0 + beltHPx}`,
    `L ${beltX0} ${beltY0 + beltHPx}`,
    'Z',
  ].join(' ');

  // ── PIECE 4: FITTED SHORT SLEEVE ───────────────────────────
  const slX0 = bX0 + px(halfBust + 1.5, scale) + gap;
  const slY0 = originY;

  const slWidth = px(bicep, scale);
  const slCapH  = px(armDepth * 0.65, scale);
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
    `L ${slX0 + slWidth * 0.85} ${slY0 + slLen}`,
    `L ${slX0 + slWidth * 0.15} ${slY0 + slLen}`,
    `L ${slX0} ${slY0 + slCapH}`,
    'Z',
  ].join(' ');

  const outline = [frontBlousePath, backBlousePath, pattiBandPath, sleevePath].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'front_blouse',
      label: 'FRONT SAREE BLOUSE',
      subLabel: '(Cut 2 with bust apex shaping)',
      path: frontBlousePath,
      fillTint: 'rgba(236, 72, 153, 0.08)',
      strokeColor: '#DB2777',
      labelCx: fCF_x + px(halfBust * 0.45, scale),
      labelCy: fY0 + px(upperBodyLen * 0.5, scale),
      grainCx: fCF_x + px(halfBust * 0.45, scale),
      grainCy: fY0 + px(upperBodyLen * 0.7, scale),
      grainLen: px(3, scale),
    },
    {
      id: 'back_blouse',
      label: 'BACK SAREE BLOUSE',
      subLabel: '(Cut 1 on fold - deep back neck)',
      path: backBlousePath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB_x + px(halfBust * 0.45, scale),
      labelCy: bY0 + px(upperBodyLen * 0.6, scale),
      grainCx: bCB_x + px(halfBust * 0.45, scale),
      grainCy: bY0 + px(upperBodyLen * 0.75, scale),
      grainLen: px(3, scale),
    },
    {
      id: 'patti_band',
      label: 'UNDERBUST PATTI BELT BAND',
      subLabel: '(Cut 2 pair)',
      path: pattiBandPath,
      fillTint: 'rgba(217, 119, 6, 0.08)',
      strokeColor: '#D97706',
      labelCx: beltX0 + beltW / 2,
      labelCy: beltY0 + beltHPx / 2,
    },
    {
      id: 'blouse_sleeve',
      label: 'FITTED BLOUSE SLEEVE',
      subLabel: '(Cut 2 pair)',
      path: sleevePath,
      fillTint: 'rgba(139, 92, 246, 0.08)',
      strokeColor: '#7C3AED',
      labelCx: slMidX,
      labelCy: slY0 + slCapH + px(1.5, scale),
      grainCx: slMidX,
      grainCy: slY0 + slCapH + px(2.5, scale),
      grainLen: px(2.5, scale),
    },
  ];

  const points: PatternPoint[] = [
    { label: 'B-APEX', point: fApexPt, description: 'Front bust apex point' },
    { label: 'B-FN', point: fA, description: 'Front neck dip' },
    { label: 'B-BN', point: bA, description: 'Back deep neck dip' },
    { label: 'S-A', point: { x: slMidX, y: slY0 }, description: 'Sleeve cap apex' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF_x, y: yApex }, to: { x: fApexPt.x, y: fApexPt.y }, dashed: true },
    { from: { x: fApexPt.x, y: fApexPt.y }, to: { x: fApexPt.x, y: yBeltJoin }, dashed: true },
  ];

  const margin = px(1.2, scale);
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fCF_x - margin, y: fY0 }, to: { x: fCF_x - margin, y: yBeltJoin }, label: `Length: ${blouseLen}"`, direction: 'vertical' },
    { from: { x: fCF_x, y: fY0 - margin }, to: { x: fBust_x, y: fY0 - margin }, label: `Bust: ${bust}"`, direction: 'horizontal' },
    { from: { x: beltX0, y: beltY0 + beltHPx + margin }, to: { x: beltX0 + beltW, y: beltY0 + beltHPx + margin }, label: `Waist Belt: ${waist}"`, direction: 'horizontal' },
  ];

  const boundsWidth = Math.max(bX0 + px(halfBust, scale), slX0 + slWidth) + px(4, scale);
  const boundsHeight = beltY0 + beltHPx + px(4, scale);

  return {
    outlinePath: outline,
    pieces,
    points,
    constructionLines,
    annotations,
    bounds: { width: boundsWidth, height: boundsHeight },
  };
}
