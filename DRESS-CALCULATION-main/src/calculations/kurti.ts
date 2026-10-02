// ============================================================
// Fabriplay – Traditional Kurti Pattern Drafting Engine
// Women's Kurti Tunic Drafting Principles (CBSE / Armstrong)
//
// All input measurements in INCHES.
// Creates 3 distinct pattern pieces:
//   1. Front Kurti Panel (Cut 1 on fold) - shaped side waist & side slit at hip
//   2. Back Kurti Panel (Cut 1 on fold) - back neck dip & side slit
//   3. Kurti 3/4 Sleeve (Cut 2 pair) - fitted armhole & forearm taper
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

export function calculateKurtiPattern(
  m: Measurements,
  scale: number
): PatternData {
  const ease = m.ease ?? 2.0; // feminine kurti ease
  const bust        = m.bust || 36;
  const waist       = m.waist || 30;
  const hip         = m.hip || 40;
  const halfBust    = (bust + ease) / 4;
  const halfWaist   = (waist + ease) / 4;
  const halfHip     = (hip + ease) / 4;
  const halfNeck    = (m.neckWidth || 5.5) / 2;
  const halfShoulder= (m.shoulderWidth || 14.5) / 2;

  const armDepth    = m.armholeDepth || 7.0;
  const frontNeckD  = m.neckDepth || 5.5; // stylish V-neck or round neck
  const backNeckD   = m.backNeckDepth || 2.0;
  const fullLen     = m.fullLength || 36; // kurti tunic length
  const sleeveLen   = m.sleeveLength || 16; // 3/4 sleeve length
  const bicep       = Math.max(m.bicepCircumference || 13, armDepth * 1.75);
  const bottomWidth = m.bottomWidth ? m.bottomWidth / 2 : halfHip + 1.5;

  const slitTopYInches = 21; // Side slit starts at hip level (~21" down)

  const gap = px(3.5, scale);
  const originX = 36;
  const originY = 30;

  // ── PIECE 1: FRONT KURTI PANEL ─────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  const fCF_x      = fX0;
  const fNeck_x    = fCF_x + px(halfNeck, scale);
  const fSh_x      = fCF_x + px(halfShoulder, scale);
  const fBust_x    = fCF_x + px(halfBust, scale);
  const fWaist_x   = fCF_x + px(halfWaist, scale);
  const fHip_x     = fCF_x + px(halfHip, scale);
  const fBottom_x  = fCF_x + px(bottomWidth, scale);

  const yTop       = fY0;
  const yNeckDip   = fY0 + px(frontNeckD, scale);
  const yShSlope   = fY0 + px(0.75, scale);
  const yArmhole   = fY0 + px(armDepth, scale);
  const yWaist     = fY0 + px(15, scale);
  const yHipSlit   = fY0 + px(slitTopYInches, scale);
  const yHem       = fY0 + px(fullLen, scale);

  const fA: Point = { x: fCF_x,    y: yNeckDip };
  const fC: Point = { x: fSh_x,    y: yShSlope };
  const fE: Point = { x: fWaist_x, y: yWaist };
  const fSlit: Point = { x: fHip_x, y: yHipSlit };
  const fG: Point = { x: fBottom_x,y: yHem };
  const fH: Point = { x: fCF_x,    y: yHem };

  const frontKurtiPath = [
    `M ${fA.x} ${fA.y}`,
    createFrontNecklineSegment(fCF_x, yNeckDip, fNeck_x, yTop),
    `L ${fC.x} ${fC.y}`,
    createArmholePathSegment(fSh_x, yShSlope, fBust_x, yArmhole, px(armDepth, scale), true),
    cBez(fBust_x - px(0.2, scale), yArmhole + (yWaist - yArmhole) * 0.5, fWaist_x + px(0.2, scale), yWaist - px(0.5, scale), fE.x, fE.y),
    cBez(fE.x + px(0.2, scale), yWaist + (yHipSlit - yWaist) * 0.5, fHip_x - px(0.2, scale), yHipSlit - px(0.5, scale), fSlit.x, fSlit.y),
    `L ${fG.x} ${fG.y}`,
    `L ${fH.x} ${fH.y}`,
    `L ${fA.x} ${fA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK KURTI PANEL ──────────────────────────────
  const bX0 = fX0 + px(bottomWidth + 2, scale) + gap;
  const bY0 = originY;

  const bCB_x     = bX0;
  const bNeck_x   = bCB_x + px(halfNeck, scale);
  const bSh_x     = bCB_x + px(halfShoulder, scale);
  const bBust_x   = bCB_x + px(halfBust, scale);
  const bWaist_x  = bCB_x + px(halfWaist, scale);
  const bHip_x    = bCB_x + px(halfHip, scale);
  const bBottom_x = bCB_x + px(bottomWidth, scale);

  const bA: Point = { x: bCB_x,    y: yTop + px(backNeckD, scale) };
  const bC: Point = { x: bSh_x,    y: yShSlope };
  const bE: Point = { x: bWaist_x, y: yWaist };
  const bSlit: Point = { x: bHip_x, y: yHipSlit };
  const bG: Point = { x: bBottom_x,y: yHem };
  const bH: Point = { x: bCB_x,    y: yHem };

  const backKurtiPath = [
    `M ${bA.x} ${bA.y}`,
    createBackNecklineSegment(bCB_x, bA.y, bNeck_x, yTop),
    `L ${bC.x} ${bC.y}`,
    createArmholePathSegment(bSh_x, yShSlope, bBust_x, yArmhole, px(armDepth, scale), false),
    cBez(bBust_x - px(0.2, scale), yArmhole + (yWaist - yArmhole) * 0.5, bWaist_x + px(0.2, scale), yWaist - px(0.5, scale), bE.x, bE.y),
    cBez(bE.x + px(0.2, scale), yWaist + (yHipSlit - yWaist) * 0.5, bHip_x - px(0.2, scale), yHipSlit - px(0.5, scale), bSlit.x, bSlit.y),
    `L ${bG.x} ${bG.y}`,
    `L ${bH.x} ${bH.y}`,
    `L ${bA.x} ${bA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: KURTI 3/4 SLEEVE ──────────────────────────────
  const slX0 = bX0 + px(bottomWidth + 2, scale) + gap;
  const slY0 = originY;

  const slWidth = px(bicep, scale);
  const slCapH  = px(armDepth * 0.6, scale);
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
    `L ${slX0 + slWidth * 0.76} ${slY0 + slLen}`,
    `L ${slX0 + slWidth * 0.24} ${slY0 + slLen}`,
    `L ${slX0} ${slY0 + slCapH}`,
    'Z',
  ].join(' ');

  const outline = [frontKurtiPath, backKurtiPath, sleevePath].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'front_kurti',
      label: 'FRONT TRADITIONAL KURTI',
      subLabel: '(Cut 1 on fold - shaped waist & side slit)',
      path: frontKurtiPath,
      fillTint: 'rgba(236, 72, 153, 0.08)',
      strokeColor: '#DB2777',
      labelCx: fCF_x + px(halfBust * 0.45, scale),
      labelCy: fY0 + px(fullLen * 0.4, scale),
      grainCx: fCF_x + px(halfBust * 0.45, scale),
      grainCy: fY0 + px(fullLen * 0.65, scale),
      grainLen: px(5, scale),
    },
    {
      id: 'back_kurti',
      label: 'BACK TRADITIONAL KURTI',
      subLabel: '(Cut 1 on fold)',
      path: backKurtiPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB_x + px(halfBust * 0.45, scale),
      labelCy: bY0 + px(fullLen * 0.4, scale),
      grainCx: bCB_x + px(halfBust * 0.45, scale),
      grainCy: bY0 + px(fullLen * 0.65, scale),
      grainLen: px(5, scale),
    },
    {
      id: 'kurti_sleeve',
      label: 'KURTI 3/4 SLEEVE',
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
  ];

  const points: PatternPoint[] = [
    { label: 'KT-A', point: fA, description: 'Front Kurti neckline dip' },
    { label: 'KT-S', point: fSlit, description: 'Kurti side slit notch' },
    { label: 'S-A', point: { x: slMidX, y: slY0 }, description: 'Sleeve cap apex' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF_x, y: yTop }, to: { x: fCF_x, y: yHem }, dashed: true },
    { from: { x: bCB_x, y: yTop }, to: { x: bCB_x, y: yHem }, dashed: true },
    { from: { x: fCF_x, y: yWaist }, to: { x: fWaist_x, y: yWaist }, dashed: true },
  ];

  const margin = px(1.2, scale);
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fCF_x - margin, y: fY0 }, to: { x: fCF_x - margin, y: yHem }, label: `Length: ${fullLen}"`, direction: 'vertical' },
    { from: { x: fCF_x, y: fY0 - margin }, to: { x: fBust_x, y: fY0 - margin }, label: `Bust: ${bust}"`, direction: 'horizontal' },
    { from: { x: fCF_x, y: yWaist + margin }, to: { x: fWaist_x, y: yWaist + margin }, label: `Waist: ${waist}"`, direction: 'horizontal' },
  ];

  const boundsWidth = Math.max(bX0 + px(bottomWidth, scale), slX0 + slWidth) + px(4, scale);
  const boundsHeight = yHem + px(4, scale);

  return {
    outlinePath: outline,
    pieces,
    points,
    constructionLines,
    annotations,
    bounds: { width: boundsWidth, height: boundsHeight },
  };
}
