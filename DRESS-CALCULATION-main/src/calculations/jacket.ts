// ============================================================
// Fabriplay – Structured Jacket Pattern Drafting Engine
// Tailored Jacket Block Principles (Winifred Aldrich / Joseph-Armstrong)
//
// All input measurements in INCHES.
// Creates 5 distinct pattern pieces:
//   1. Jacket Front Panel (Cut 2) - lapel roll line, break point & button overlap
//   2. Jacket Back Panel (Cut 2) - center back seam & waist pitch
//   3. Jacket Set-In Sleeve (Cut 2 pair) - structured cap with +1" crown ease
//   4. Notch Lapel Collar & Facing (Cut 2) - collar fall & front facing
//   5. Welt Pocket Flap (Cut 2)
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

export function calculateJacketPattern(
  m: Measurements,
  scale: number
): PatternData {
  const ease = m.ease ?? 4.0; // jacket layering ease
  const chest       = m.bust || 38;
  const waist       = m.waist || 32;
  const hip         = m.hip || 40;
  const halfChest   = (chest + ease) / 4;
  const halfWaist   = (waist + ease) / 4;
  const halfHip     = (hip + ease) / 4;
  const halfNeck    = (m.neckWidth || 6) / 2;
  const halfShoulder= (m.shoulderWidth || 16) / 2 + 0.5; // +0.5" shoulder pad extension

  const armDepth    = (m.armholeDepth || 7.5) + 1.0; // lowered armhole for jacket layering
  const fullLen     = m.fullLength || 28; // jacket length
  const sleeveLen   = m.sleeveLength || 24.5;
  const bicep       = Math.max(m.bicepCircumference || 14.5, armDepth * 1.85);

  const buttonOverlap = 1.25; // 1.25" jacket front overlap
  const lapelW        = 3.0;  // 3.0" notch lapel width

  const gap = px(4, scale);
  const originX = 36;
  const originY = 30;

  // ── PIECE 1: JACKET FRONT PANEL ────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  const fCF_x       = fX0 + px(buttonOverlap, scale);
  const fPlk_x      = fX0;
  const fNeck_x     = fCF_x + px(halfNeck, scale);
  const fSh_x       = fCF_x + px(halfShoulder, scale);
  const fChest_x    = fCF_x + px(halfChest, scale);
  const fWaist_x    = fCF_x + px(halfWaist, scale);
  const fHip_x      = fCF_x + px(halfHip, scale);

  const yTop        = fY0;
  const yNeckDip    = fY0 + px(3.25, scale);
  const yBreakPt    = fY0 + px(11, scale); // top button lapel break point
  const yShSlope    = fY0 + px(1.25, scale);
  const yArmhole    = fY0 + px(armDepth, scale);
  const yWaist      = fY0 + px(16.5, scale);
  const yHem        = fY0 + px(fullLen, scale);

  const fA: Point = { x: fPlk_x,    y: yBreakPt };
  const fLapelTip: Point = { x: fPlk_x - px(lapelW * 0.7, scale), y: yNeckDip - px(1, scale) };
  const fC: Point = { x: fSh_x,    y: yShSlope };
  const fE: Point = { x: fWaist_x, y: yWaist };
  const fG: Point = { x: fHip_x,   y: yHem };
  const fH: Point = { x: fPlk_x,   y: yHem };

  const frontJacketPath = [
    `M ${fA.x} ${fA.y}`,
    `L ${fLapelTip.x} ${fLapelTip.y}`,
    `L ${fNeck_x} ${yTop}`,
    `L ${fC.x} ${fC.y}`,
    createArmholePathSegment(fSh_x, yShSlope, fChest_x, yArmhole, px(armDepth, scale), true),
    cBez(fChest_x - px(0.3, scale), yArmhole + (yWaist - yArmhole) * 0.5, fWaist_x + px(0.2, scale), yWaist - px(0.5, scale), fE.x, fE.y),
    cBez(fE.x + px(0.2, scale), yWaist + (yHem - yWaist) * 0.5, fHip_x - px(0.2, scale), yHem - px(0.5, scale), fG.x, fG.y),
    `L ${fH.x} ${fH.y}`,
    `L ${fA.x} ${fA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: JACKET BACK PANEL ─────────────────────────────
  const bX0 = fX0 + px(halfHip + 2, scale) + gap;
  const bY0 = originY;

  const bCB_x     = bX0 + px(0.5, scale); // center back waist curve
  const bNeck_x   = bCB_x + px(halfNeck, scale);
  const bSh_x     = bCB_x + px(halfShoulder, scale);
  const bChest_x  = bCB_x + px(halfChest, scale);
  const bWaist_x  = bCB_x + px(halfWaist, scale);
  const bHip_x    = bCB_x + px(halfHip, scale);

  const bA: Point = { x: bX0,      y: yTop + px(1.25, scale) };
  const bC: Point = { x: bSh_x,    y: yShSlope };
  const bE: Point = { x: bWaist_x, y: yWaist };
  const bG: Point = { x: bHip_x,   y: yHem };
  const bH: Point = { x: bX0,      y: yHem };

  const backJacketPath = [
    `M ${bA.x} ${bA.y}`,
    createBackNecklineSegment(bX0, bA.y, bNeck_x, yTop),
    `L ${bC.x} ${bC.y}`,
    createArmholePathSegment(bSh_x, yShSlope, bChest_x, yArmhole, px(armDepth, scale), false),
    cBez(bChest_x - px(0.3, scale), yArmhole + (yWaist - yArmhole) * 0.5, bWaist_x + px(0.2, scale), yWaist - px(0.5, scale), bE.x, bE.y),
    cBez(bE.x + px(0.2, scale), yWaist + (yHem - yWaist) * 0.5, bHip_x - px(0.2, scale), yHem - px(0.5, scale), bG.x, bG.y),
    `L ${bH.x} ${bH.y}`,
    `L ${bA.x} ${bA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: STRUCTURED SET-IN SLEEVE ──────────────────────
  const slX0 = bX0 + px(halfHip + 2, scale) + gap;
  const slY0 = originY;

  const slWidth = px(bicep, scale);
  const slCapH  = px(armDepth * 0.68, scale);
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

  // ── PIECE 4: NOTCH LAPEL COLLAR & FACING ───────────────────
  const colX0 = originX;
  const colY0 = fY0 + px(fullLen + 2, scale) + gap;

  const colLen = px(halfNeck * 2 + buttonOverlap, scale);
  const colH   = px(3.25, scale);

  const collarFacingPath = [
    `M ${colX0} ${colY0}`,
    `L ${colX0 + colLen} ${colY0}`,
    `L ${colX0 + colLen + px(0.75, scale)} ${colY0 + colH}`,
    `L ${colX0 - px(0.5, scale)} ${colY0 + colH}`,
    'Z',
  ].join(' ');

  // ── PIECE 5: WELT POCKET FLAP ──────────────────────────────
  const flapX0 = colX0 + colLen + px(3, scale);
  const flapY0 = colY0;
  const flapW  = px(5.5, scale);
  const flapH  = px(2.25, scale);

  const weltFlapPath = [
    `M ${flapX0} ${flapY0}`,
    `L ${flapX0 + flapW} ${flapY0}`,
    `L ${flapX0 + flapW} ${flapY0 + flapH}`,
    `L ${flapX0} ${flapY0 + flapH}`,
    'Z',
  ].join(' ');

  const outline = [frontJacketPath, backJacketPath, sleevePath, collarFacingPath, weltFlapPath].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'front_jacket',
      label: 'STRUCTURED JACKET FRONT',
      subLabel: '(Cut 2 with lapel roll line)',
      path: frontJacketPath,
      fillTint: 'rgba(30, 58, 138, 0.08)',
      strokeColor: '#1E3A8A',
      labelCx: fCF_x + px(halfChest * 0.45, scale),
      labelCy: fY0 + px(fullLen * 0.45, scale),
      grainCx: fCF_x + px(halfChest * 0.45, scale),
      grainCy: fY0 + px(fullLen * 0.65, scale),
      grainLen: px(5, scale),
    },
    {
      id: 'back_jacket',
      label: 'STRUCTURED JACKET BACK',
      subLabel: '(Cut 2 with center back waist seam)',
      path: backJacketPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB_x + px(halfChest * 0.45, scale),
      labelCy: bY0 + px(fullLen * 0.45, scale),
      grainCx: bCB_x + px(halfChest * 0.45, scale),
      grainCy: bY0 + px(fullLen * 0.65, scale),
      grainLen: px(5, scale),
    },
    {
      id: 'jacket_sleeve',
      label: 'STRUCTURED JACKET SLEEVE',
      subLabel: '(Cut 2 pair - set-in cap with ease)',
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
      id: 'notch_lapel_facing',
      label: 'NOTCH LAPEL COLLAR & FACING',
      subLabel: '(Cut 2 with canvassing interface)',
      path: collarFacingPath,
      fillTint: 'rgba(139, 92, 246, 0.08)',
      strokeColor: '#7C3AED',
      labelCx: colX0 + colLen / 2,
      labelCy: colY0 + colH / 2,
    },
    {
      id: 'welt_pocket_flap',
      label: 'WELT POCKET FLAP',
      subLabel: '(Cut 2 pair)',
      path: weltFlapPath,
      fillTint: 'rgba(107, 114, 128, 0.08)',
      strokeColor: '#4B5563',
      labelCx: flapX0 + flapW / 2,
      labelCy: flapY0 + flapH / 2,
    },
  ];

  const points: PatternPoint[] = [
    { label: 'J-BREAK', point: fA, description: 'Lapel break point at top button' },
    { label: 'J-NOTCH', point: fLapelTip, description: 'Notch lapel corner tip' },
    { label: 'S-A', point: { x: slMidX, y: slY0 }, description: 'Sleeve cap apex' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: fA.x, y: fA.y }, to: { x: fNeck_x, y: yTop }, dashed: true },
    { from: { x: fCF_x, y: yTop }, to: { x: fCF_x, y: yHem }, dashed: true },
    { from: { x: bCB_x, y: yTop }, to: { x: bCB_x, y: yHem }, dashed: true },
  ];

  const margin = px(1.2, scale);
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fPlk_x - margin, y: fY0 }, to: { x: fPlk_x - margin, y: yHem }, label: `Jacket Length: ${fullLen}"`, direction: 'vertical' },
    { from: { x: fCF_x, y: fY0 - margin }, to: { x: fChest_x, y: fY0 - margin }, label: `Chest: ${chest}"`, direction: 'horizontal' },
    { from: { x: colX0, y: colY0 - margin }, to: { x: colX0 + colLen, y: colY0 - margin }, label: `Collar: ${halfNeck * 2}"`, direction: 'horizontal' },
  ];

  const boundsWidth = Math.max(bX0 + px(halfHip, scale), slX0 + slWidth) + px(4, scale);
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
