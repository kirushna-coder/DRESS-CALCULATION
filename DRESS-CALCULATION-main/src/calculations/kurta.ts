// ============================================================
// Fabriplay – Ethnic Kurta Pattern Drafting Engine
// Indian Kurta Drafting Principles (CBSE Patternmaking Manual)
//
// All input measurements in INCHES.
// Creates 4 distinct pattern pieces:
//   1. Front Kurta Panel (Cut 1 on fold) - front placket slit & side slit starting at hip
//   2. Back Kurta Panel (Cut 1 on fold) - back neck dip & side slit
//   3. Kurta Sleeve (Cut 2 pair) - straight/tapered traditional sleeve
//   4. Mandarin Band Collar (Cut 2) - rounded front corners
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

export function calculateKurtaPattern(
  m: Measurements,
  scale: number
): PatternData {
  const ease = m.ease ?? 3.5; // ethnic kurta ease allowance
  const chest       = m.bust || 38;
  const halfChest   = (chest + ease) / 4;
  const halfWaist   = (m.waist ? (m.waist + ease) / 4 : halfChest - 0.5);
  const halfHip     = (m.hip ? (m.hip + ease) / 4 : halfChest + 0.5);
  const halfNeck    = (m.neckWidth || 6) / 2;
  const halfShoulder= (m.shoulderWidth || 16) / 2;

  const armDepth    = m.armholeDepth || 7.5;
  const neckDepth   = m.neckDepth || 3.0;
  const fullLen     = m.fullLength || 42; // standard kurta length
  const sleeveLen   = m.sleeveLength || 22;
  const bicep       = Math.max(m.bicepCircumference || 14, armDepth * 1.8);
  const bottomWidth = m.bottomWidth ? m.bottomWidth / 2 : halfHip + 1;

  const slitTopYInches = 22; // Side slit starts at hip level (~22" down)

  const gap = px(3.5, scale);
  const originX = 36;
  const originY = 30;

  // ── PIECE 1: FRONT KURTA PANEL ─────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  const fCF_x      = fX0;
  const fNeck_x    = fCF_x + px(halfNeck, scale);
  const fSh_x      = fCF_x + px(halfShoulder, scale);
  const fChest_x   = fCF_x + px(halfChest, scale);
  const fWaist_x   = fCF_x + px(halfWaist, scale);
  const fHip_x     = fCF_x + px(halfHip, scale);
  const fBottom_x  = fCF_x + px(bottomWidth, scale);

  const yTop       = fY0;
  const yNeckDip   = fY0 + px(neckDepth, scale);
  const yShSlope   = fY0 + px(0.85, scale);
  const yArmhole   = fY0 + px(armDepth, scale);
  const yWaist     = fY0 + px(15.5, scale);
  const yHipSlit   = fY0 + px(slitTopYInches, scale);
  const yHem       = fY0 + px(fullLen, scale);

  const fA: Point = { x: fCF_x,    y: yNeckDip };
  const fC: Point = { x: fSh_x,    y: yShSlope };
  const fE: Point = { x: fWaist_x, y: yWaist };
  const fSlit: Point = { x: fHip_x, y: yHipSlit };
  const fG: Point = { x: fBottom_x,y: yHem };
  const fH: Point = { x: fCF_x,    y: yHem };

  const frontKurtaPath = [
    `M ${fA.x} ${fA.y}`,
    createFrontNecklineSegment(fCF_x, yNeckDip, fNeck_x, yTop),
    `L ${fC.x} ${fC.y}`,
    createArmholePathSegment(fSh_x, yShSlope, fChest_x, yArmhole, px(armDepth, scale), true),
    `L ${fE.x} ${fE.y}`,
    `L ${fSlit.x} ${fSlit.y}`,
    `L ${fG.x} ${fG.y}`,
    `L ${fH.x} ${fH.y}`,
    `L ${fA.x} ${fA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK KURTA PANEL ──────────────────────────────
  const bX0 = fX0 + px(bottomWidth + 2, scale) + gap;
  const bY0 = originY;

  const bCB_x     = bX0;
  const bNeck_x   = bCB_x + px(halfNeck, scale);
  const bSh_x     = bCB_x + px(halfShoulder, scale);
  const bChest_x  = bCB_x + px(halfChest, scale);
  const bWaist_x  = bCB_x + px(halfWaist, scale);
  const bHip_x    = bCB_x + px(halfHip, scale);
  const bBottom_x = bCB_x + px(bottomWidth, scale);

  const bA: Point = { x: bCB_x,    y: yTop + px(1.25, scale) };
  const bC: Point = { x: bSh_x,    y: yShSlope };
  const bE: Point = { x: bWaist_x, y: yWaist };
  const bSlit: Point = { x: bHip_x, y: yHipSlit };
  const bG: Point = { x: bBottom_x,y: yHem };
  const bH: Point = { x: bCB_x,    y: yHem };

  const backKurtaPath = [
    `M ${bA.x} ${bA.y}`,
    createBackNecklineSegment(bCB_x, bA.y, bNeck_x, yTop),
    `L ${bC.x} ${bC.y}`,
    createArmholePathSegment(bSh_x, yShSlope, bChest_x, yArmhole, px(armDepth, scale), false),
    `L ${bE.x} ${bE.y}`,
    `L ${bSlit.x} ${bSlit.y}`,
    `L ${bG.x} ${bG.y}`,
    `L ${bH.x} ${bH.y}`,
    `L ${bA.x} ${bA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: KURTA SLEEVE ──────────────────────────────────
  const slX0 = bX0 + px(bottomWidth + 2, scale) + gap;
  const slY0 = originY;

  const slWidth = px(bicep, scale);
  const slCapH  = px(armDepth * 0.55, scale);
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
    `L ${slX0 + slWidth * 0.72} ${slY0 + slLen}`,
    `L ${slX0 + slWidth * 0.28} ${slY0 + slLen}`,
    `L ${slX0} ${slY0 + slCapH}`,
    'Z',
  ].join(' ');

  // ── PIECE 4: MANDARIN BAND COLLAR ──────────────────────────
  const colX0 = originX;
  const colY0 = fY0 + px(fullLen + 1.5, scale) + gap;

  const colLen = px(halfNeck * 2 + 1, scale);
  const colH   = px(1.25, scale);

  const mandarinCollarPath = [
    `M ${colX0} ${colY0}`,
    `L ${colX0 + colLen - px(0.5, scale)} ${colY0}`,
    cBez(colX0 + colLen, colY0, colX0 + colLen, colY0 + colH, colX0 + colLen - px(0.5, scale), colY0 + colH),
    `L ${colX0} ${colY0 + colH}`,
    'Z',
  ].join(' ');

  const outline = [frontKurtaPath, backKurtaPath, sleevePath, mandarinCollarPath].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'front_kurta',
      label: 'FRONT ETHNIC KURTA',
      subLabel: '(Cut 1 on fold - side slit at hip)',
      path: frontKurtaPath,
      fillTint: 'rgba(79, 70, 229, 0.08)',
      strokeColor: '#4F46E5',
      labelCx: fCF_x + px(halfChest * 0.45, scale),
      labelCy: fY0 + px(fullLen * 0.4, scale),
      grainCx: fCF_x + px(halfChest * 0.45, scale),
      grainCy: fY0 + px(fullLen * 0.65, scale),
      grainLen: px(6, scale),
    },
    {
      id: 'back_kurta',
      label: 'BACK ETHNIC KURTA',
      subLabel: '(Cut 1 on fold)',
      path: backKurtaPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB_x + px(halfChest * 0.45, scale),
      labelCy: bY0 + px(fullLen * 0.4, scale),
      grainCx: bCB_x + px(halfChest * 0.45, scale),
      grainCy: bY0 + px(fullLen * 0.65, scale),
      grainLen: px(6, scale),
    },
    {
      id: 'kurta_sleeve',
      label: 'KURTA SLEEVE',
      subLabel: '(Cut 2 pair)',
      path: sleevePath,
      fillTint: 'rgba(217, 119, 6, 0.08)',
      strokeColor: '#D97706',
      labelCx: slMidX,
      labelCy: slY0 + slCapH + px(2, scale),
      grainCx: slMidX,
      grainCy: slY0 + slCapH + px(5, scale),
      grainLen: px(4, scale),
    },
    {
      id: 'mandarin_collar',
      label: 'MANDARIN BAND COLLAR',
      subLabel: '(Cut 2)',
      path: mandarinCollarPath,
      fillTint: 'rgba(139, 92, 246, 0.08)',
      strokeColor: '#7C3AED',
      labelCx: colX0 + colLen / 2,
      labelCy: colY0 + colH / 2,
    },
  ];

  const points: PatternPoint[] = [
    { label: 'K-A', point: fA, description: 'Front placket slit dip' },
    { label: 'K-S', point: fSlit, description: 'Side slit notch starting at hip' },
    { label: 'S-A', point: { x: slMidX, y: slY0 }, description: 'Sleeve cap apex' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF_x, y: yTop }, to: { x: fCF_x, y: yHem }, dashed: true },
    { from: { x: bCB_x, y: yTop }, to: { x: bCB_x, y: yHem }, dashed: true },
    { from: { x: fCF_x, y: yHipSlit }, to: { x: fHip_x, y: yHipSlit }, dashed: true },
    { from: { x: bCB_x, y: yHipSlit }, to: { x: bHip_x, y: yHipSlit }, dashed: true },
  ];

  const margin = px(1.2, scale);
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fCF_x - margin, y: fY0 }, to: { x: fCF_x - margin, y: yHem }, label: `Length: ${fullLen}"`, direction: 'vertical' },
    { from: { x: fCF_x, y: fY0 - margin }, to: { x: fChest_x, y: fY0 - margin }, label: `Chest: ${(halfChest * 4).toFixed(1)}"`, direction: 'horizontal' },
    { from: { x: fCF_x, y: yHipSlit - margin }, to: { x: fHip_x, y: yHipSlit - margin }, label: `Side Slit: ${(fullLen - slitTopYInches)}"`, direction: 'horizontal' },
  ];

  const boundsWidth = Math.max(bX0 + px(bottomWidth, scale), slX0 + slWidth) + px(4, scale);
  const boundsHeight = colY0 + colH + px(4, scale);

  return {
    outlinePath: outline,
    pieces,
    points,
    constructionLines,
    annotations,
    bounds: { width: boundsWidth, height: boundsHeight },
  };
}
