// ============================================================
// Fabriplay – Formal / Casual Shirt Pattern Drafting Engine
// Standard Shirt Pattern Drafting Principles (Winifred Aldrich / Armstrong)
//
// All input measurements in INCHES.
// Creates 7 distinct pattern pieces:
//   1. Front Shirt Panel (Cut 2) - button stand placket extension
//   2. Back Shirt Panel (Cut 1 on fold) - yoke join line
//   3. Shirt Yoke (Cut 2 inner/outer) - shoulder pitch
//   4. Shirt Sleeve (Cut 2 pair) - set-in shirt sleeve cap
//   5. Collar Band (Cut 2) - stand height 1.25"
//   6. Collar Leaf (Cut 2) - collar spread points
//   7. Cuff / Pocket (Cut 2 cuffs, Cut 1 pocket)
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
  createCurvedHemPathSegment,
} from '../utils/curveUtils';

const px = (inches: number, scale: number) => inches * scale;

export function calculateShirtPattern(
  m: Measurements,
  scale: number
): PatternData {
  const ease = m.ease ?? 3.5; // shirt chest ease
  const chest       = m.bust || 38;
  const halfChest   = (chest + ease) / 4;
  const halfWaist   = (m.waist ? (m.waist + ease) / 4 : halfChest - 0.75);
  const halfNeck    = (m.neckWidth || 6) / 2;
  const halfShoulder= (m.shoulderWidth || 15) / 2;

  const armDepth    = m.armholeDepth || 7.5;
  const neckDepth   = m.neckDepth || 2.75;
  const fullLen     = m.fullLength || 30;
  const sleeveLen   = m.sleeveLength || 24;
  const bicep       = Math.max(m.bicepCircumference || 14, armDepth * 1.85);

  const buttonStand = 0.75; // 3/4" button stand extension
  const yokeDepth   = 3.5;  // 3.5" back yoke depth

  const gap = px(3, scale);
  const originX = 36;
  const originY = 30;

  // ── PIECE 1: FRONT SHIRT PANEL ─────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  const fCF_x      = fX0 + px(buttonStand, scale);
  const fFrontPlk  = fX0;
  const fNeck_x    = fCF_x + px(halfNeck, scale);
  const fSh_x      = fCF_x + px(halfShoulder, scale);
  const fChest_x   = fCF_x + px(halfChest, scale);
  const fWaist_x   = fCF_x + px(halfWaist, scale);

  const yTop       = fY0;
  const yNeckDip   = fY0 + px(neckDepth, scale);
  const yShSlope   = fY0 + px(1.25, scale);
  const yArmhole   = fY0 + px(armDepth, scale);
  const yHem       = fY0 + px(fullLen, scale);

  const fA: Point = { x: fFrontPlk, y: yNeckDip };
  const fC: Point = { x: fSh_x,     y: yShSlope };
  const fE: Point = { x: fWaist_x,  y: fY0 + px(17, scale) };
  const fG: Point = { x: fFrontPlk, y: yHem };

  const frontShirtPath = [
    `M ${fA.x} ${fA.y}`,
    `L ${fCF_x} ${yNeckDip}`,
    createFrontNecklineSegment(fCF_x, yNeckDip, fNeck_x, yTop),
    `L ${fC.x} ${fC.y}`,
    createArmholePathSegment(fSh_x, yShSlope, fChest_x, yArmhole, px(armDepth, scale), true),
    `L ${fE.x} ${fE.y}`,
    createCurvedHemPathSegment(fE.x, fE.y, fChest_x - px(1, scale), yHem - px(0.5, scale), fG.x, fG.y),
    `L ${fA.x} ${fA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK SHIRT PANEL ──────────────────────────────
  const bX0 = fX0 + px(halfChest + 2, scale) + gap;
  const bY0 = originY + px(yokeDepth, scale);

  const bCB_x     = bX0;
  const bChest_x  = bCB_x + px(halfChest, scale);
  const bWaist_x  = bCB_x + px(halfWaist, scale);

  const yBackHem  = originY + px(fullLen, scale);

  const backShirtPath = [
    `M ${bCB_x} ${bY0}`,
    `L ${bChest_x} ${bY0}`,
    createArmholePathSegment(bChest_x - px(2, scale), bY0, bChest_x, originY + px(armDepth, scale), px(armDepth, scale), false),
    `L ${bWaist_x} ${originY + px(17, scale)}`,
    createCurvedHemPathSegment(bWaist_x, originY + px(17, scale), bChest_x - px(1, scale), yBackHem - px(0.5, scale), bCB_x, yBackHem),
    `L ${bCB_x} ${bY0}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: SHIRT YOKE ────────────────────────────────────
  const ykX0 = bX0;
  const ykY0 = originY;

  const ykCB_x   = ykX0;
  const ykNeck_x = ykCB_x + px(halfNeck, scale);
  const ykSh_x   = ykCB_x + px(halfShoulder, scale);

  const yokePath = [
    `M ${ykCB_x} ${ykY0 + px(1, scale)}`,
    createBackNecklineSegment(ykCB_x, ykY0 + px(1, scale), ykNeck_x, ykY0),
    `L ${ykSh_x} ${ykY0 + px(1.25, scale)}`,
    `L ${ykCB_x + px(halfChest, scale)} ${ykY0 + px(yokeDepth, scale)}`,
    `L ${ykCB_x} ${ykY0 + px(yokeDepth, scale)}`,
    'Z',
  ].join(' ');

  // ── PIECE 4: SLEEVE ───────────────────────────────────────
  const slX0 = bX0 + px(halfChest + 2, scale) + gap;
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
    `L ${slX0 + slWidth * 0.75} ${slY0 + slLen}`,
    `L ${slX0 + slWidth * 0.25} ${slY0 + slLen}`,
    `L ${slX0} ${slY0 + slCapH}`,
    'Z',
  ].join(' ');

  // ── PIECE 5: COLLAR BAND & COLLAR LEAF ─────────────────────
  const colX0 = originX;
  const colY0 = fY0 + px(fullLen + 2, scale) + gap;

  const colLen = px(halfNeck * 2 + buttonStand, scale);
  const colBandH = px(1.25, scale);
  const colLeafH = px(2.25, scale);

  const collarBandPath = [
    `M ${colX0} ${colY0}`,
    `L ${colX0 + colLen} ${colY0}`,
    `L ${colX0 + colLen + px(0.4, scale)} ${colY0 + colBandH / 2}`,
    `L ${colX0 + colLen} ${colY0 + colBandH}`,
    `L ${colX0} ${colY0 + colBandH}`,
    'Z',
  ].join(' ');

  const collarLeafPath = [
    `M ${colX0} ${colY0 + colBandH + px(1, scale)}`,
    `L ${colX0 + colLen} ${colY0 + colBandH + px(1, scale)}`,
    `L ${colX0 + colLen + px(0.8, scale)} ${colY0 + colBandH + px(1, scale) + colLeafH}`,
    `L ${colX0} ${colY0 + colBandH + px(1, scale) + colLeafH}`,
    'Z',
  ].join(' ');

  // ── PIECE 6: CHEST POCKET & CUFF ───────────────────────────
  const pockX0 = colX0 + colLen + px(2, scale);
  const pockY0 = colY0;
  const pockW  = px(4.5, scale);
  const pockH  = px(5.25, scale);

  const pocketPath = [
    `M ${pockX0} ${pockY0}`,
    `L ${pockX0 + pockW} ${pockY0}`,
    `L ${pockX0 + pockW} ${pockY0 + pockH - px(0.8, scale)}`,
    `L ${pockX0 + pockW / 2} ${pockY0 + pockH}`,
    `L ${pockX0} ${pockY0 + pockH - px(0.8, scale)}`,
    'Z',
  ].join(' ');

  const cuffW = px(9, scale);
  const cuffH = px(2.5, scale);
  const cuffPath = [
    `M ${pockX0 + pockW + px(1.5, scale)} ${pockY0}`,
    `L ${pockX0 + pockW + px(1.5, scale) + cuffW} ${pockY0}`,
    `L ${pockX0 + pockW + px(1.5, scale) + cuffW} ${pockY0 + cuffH}`,
    `L ${pockX0 + pockW + px(1.5, scale)} ${pockY0 + cuffH}`,
    'Z',
  ].join(' ');

  const outline = [frontShirtPath, backShirtPath, yokePath, sleevePath, collarBandPath, collarLeafPath, pocketPath, cuffPath].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'front_shirt',
      label: 'FRONT SHIRT PANEL',
      subLabel: '(Cut 2 with placket)',
      path: frontShirtPath,
      fillTint: 'rgba(59, 130, 246, 0.08)',
      strokeColor: '#2563EB',
      labelCx: fCF_x + px(halfChest * 0.45, scale),
      labelCy: fY0 + px(fullLen * 0.4, scale),
      grainCx: fCF_x + px(halfChest * 0.45, scale),
      grainCy: fY0 + px(fullLen * 0.6, scale),
      grainLen: px(5, scale),
    },
    {
      id: 'back_shirt',
      label: 'BACK SHIRT PANEL',
      subLabel: '(Cut 1 on fold)',
      path: backShirtPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB_x + px(halfChest * 0.45, scale),
      labelCy: bY0 + px(fullLen * 0.4, scale),
      grainCx: bCB_x + px(halfChest * 0.45, scale),
      grainCy: bY0 + px(fullLen * 0.6, scale),
      grainLen: px(5, scale),
    },
    {
      id: 'shirt_yoke',
      label: 'SHIRT YOKE',
      subLabel: '(Cut 2 pair)',
      path: yokePath,
      fillTint: 'rgba(139, 92, 246, 0.08)',
      strokeColor: '#7C3AED',
      labelCx: ykCB_x + px(halfChest * 0.45, scale),
      labelCy: ykY0 + px(yokeDepth * 0.5, scale),
      grainCx: ykCB_x + px(halfChest * 0.45, scale),
      grainCy: ykY0 + px(yokeDepth * 0.6, scale),
      grainLen: px(2, scale),
    },
    {
      id: 'shirt_sleeve',
      label: 'SHIRT SLEEVE',
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
      id: 'collar_band',
      label: 'COLLAR BAND',
      subLabel: '(Cut 2)',
      path: collarBandPath,
      fillTint: 'rgba(236, 72, 153, 0.08)',
      strokeColor: '#DB2777',
      labelCx: colX0 + colLen / 2,
      labelCy: colY0 + colBandH / 2,
    },
    {
      id: 'collar_leaf',
      label: 'COLLAR LEAF',
      subLabel: '(Cut 2)',
      path: collarLeafPath,
      fillTint: 'rgba(236, 72, 153, 0.08)',
      strokeColor: '#DB2777',
      labelCx: colX0 + colLen / 2,
      labelCy: colY0 + colBandH + px(1, scale) + colLeafH / 2,
    },
    {
      id: 'pocket',
      label: 'CHEST POCKET',
      subLabel: '(Cut 1)',
      path: pocketPath,
      fillTint: 'rgba(107, 114, 128, 0.08)',
      strokeColor: '#4B5563',
      labelCx: pockX0 + pockW / 2,
      labelCy: pockY0 + pockH / 2,
    },
    {
      id: 'cuff',
      label: 'SHIRT CUFF',
      subLabel: '(Cut 2 pair)',
      path: cuffPath,
      fillTint: 'rgba(107, 114, 128, 0.08)',
      strokeColor: '#4B5563',
      labelCx: pockX0 + pockW + px(1.5, scale) + cuffW / 2,
      labelCy: pockY0 + cuffH / 2,
    },
  ];

  const points: PatternPoint[] = [
    { label: 'F-A', point: fA, description: 'Front neck button stand top' },
    { label: 'F-C', point: fC, description: 'Front shoulder tip' },
    { label: 'Y-A', point: { x: ykCB_x, y: ykY0 }, description: 'Yoke CB top' },
    { label: 'S-A', point: { x: slMidX, y: slY0 }, description: 'Sleeve cap apex' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF_x, y: fY0 }, to: { x: fCF_x, y: yHem }, dashed: true },
    { from: { x: bCB_x, y: bY0 }, to: { x: bCB_x, y: yBackHem }, dashed: true },
  ];

  const margin = px(1.2, scale);
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fFrontPlk - margin, y: fY0 }, to: { x: fFrontPlk - margin, y: yHem }, label: `Length: ${fullLen}"`, direction: 'vertical' },
    { from: { x: fCF_x, y: fY0 - margin }, to: { x: fChest_x, y: fY0 - margin }, label: `Chest: ${(halfChest * 4).toFixed(1)}"`, direction: 'horizontal' },
    { from: { x: slX0, y: slY0 - margin }, to: { x: slX0 + slWidth, y: slY0 - margin }, label: `Bicep: ${bicep}"`, direction: 'horizontal' },
  ];

  const boundsWidth = Math.max(bX0 + px(halfChest, scale), slX0 + slWidth) + px(4, scale);
  const boundsHeight = colY0 + colBandH + px(1, scale) + colLeafH + px(4, scale);

  return {
    outlinePath: outline,
    pieces,
    points,
    constructionLines,
    annotations,
    bounds: { width: boundsWidth, height: boundsHeight },
  };
}
