// ============================================================
// Fabriplay – Kids' Wear Pattern Drafting Engine
// Children's Flat-Pattern Drafting Principles (Aldrich Childrenswear)
//
// All input measurements in INCHES.
// Uses child-specific body proportions:
//   - Chest/Waist ratio is near 1:1 (chest 24-28", waist 23-27")
//   - Shoulder slope is shallow (0.5")
//   - Armhole depth is smaller (5.0" - 5.5")
//   - High movement ease (+2.5")
//
// Creates 4 distinct pattern pieces:
//   1. Child Front Bodice (Cut 1 on fold) - soft round neck dip
//   2. Child Back Bodice (Cut 2 for back zip/button closure)
//   3. Child Short Sleeve (Cut 2 pair) - relaxed cap curve
//   4. Child Flared Skirt Panel (Cut 2 front/back) - comfortable playwear flare
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

export function calculateKidsPattern(
  m: Measurements,
  scale: number
): PatternData {
  const ease = m.ease ?? 2.5; // child movement ease
  const chest       = m.bust || 26; // child chest (size 6-8 reference)
  const waist       = m.waist || 25;
  const halfChest   = (chest + ease) / 4;
  const halfWaist   = (waist + ease) / 4;
  const halfNeck    = (m.neckWidth || 5) / 2;
  const halfShoulder= (m.shoulderWidth || 11) / 2;

  const armDepth    = m.armholeDepth || 5.25;
  const frontNeckD  = m.neckDepth || 3.0;
  const backNeckD   = m.backNeckDepth || 0.75;
  const fullLen     = m.fullLength || 26; // child frock length
  const bodiceLen   = m.waistLength || 10.5; // child torso length
  const skirtLen    = Math.max(10, fullLen - bodiceLen);
  const sleeveLen   = m.sleeveLength || 5;
  const bicep       = Math.max(m.bicepCircumference || 9.5, armDepth * 1.7);
  const flare       = m.flare ?? 6;

  const gap = px(3.5, scale);
  const originX = 36;
  const originY = 30;

  // ── PIECE 1: CHILD FRONT BODICE ────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  const fCF_x      = fX0;
  const fNeck_x    = fCF_x + px(halfNeck, scale);
  const fSh_x      = fCF_x + px(halfShoulder, scale);
  const fChest_x   = fCF_x + px(halfChest, scale);
  const fWaist_x   = fCF_x + px(halfWaist, scale);

  const yTop       = fY0;
  const yNeckDip   = fY0 + px(frontNeckD, scale);
  const yShSlope   = fY0 + px(0.5, scale); // shallow child shoulder slope
  const yArmhole   = fY0 + px(armDepth, scale);
  const yBodiceWaist= fY0 + px(bodiceLen, scale);

  const fA: Point = { x: fCF_x,    y: yNeckDip };
  const fC: Point = { x: fSh_x,    y: yShSlope };
  const fE: Point = { x: fWaist_x, y: yBodiceWaist };
  const fF: Point = { x: fCF_x,    y: yBodiceWaist };

  const frontBodicePath = [
    `M ${fA.x} ${fA.y}`,
    createFrontNecklineSegment(fCF_x, yNeckDip, fNeck_x, yTop),
    `L ${fC.x} ${fC.y}`,
    createArmholePathSegment(fSh_x, yShSlope, fChest_x, yArmhole, px(armDepth, scale), true),
    `L ${fE.x} ${fE.y}`,
    `L ${fF.x} ${fF.y}`,
    `L ${fA.x} ${fA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: CHILD BACK BODICE ─────────────────────────────
  const bX0 = fX0 + px(halfChest + 1.5, scale) + gap;
  const bY0 = originY;

  const bCB_x     = bX0 + px(0.75, scale); // 0.75" back zip stand
  const bNeck_x   = bCB_x + px(halfNeck, scale);
  const bSh_x     = bCB_x + px(halfShoulder, scale);
  const bChest_x  = bCB_x + px(halfChest, scale);
  const bWaist_x  = bCB_x + px(halfWaist, scale);

  const bA: Point = { x: bX0,      y: yTop + px(backNeckD, scale) };
  const bC: Point = { x: bSh_x,    y: yShSlope };
  const bE: Point = { x: bWaist_x, y: yBodiceWaist };
  const bF: Point = { x: bX0,      y: yBodiceWaist };

  const backBodicePath = [
    `M ${bA.x} ${bA.y}`,
    `L ${bCB_x} ${yTop + px(backNeckD, scale)}`,
    createBackNecklineSegment(bCB_x, yTop + px(backNeckD, scale), bNeck_x, yTop),
    `L ${bC.x} ${bC.y}`,
    createArmholePathSegment(bSh_x, yShSlope, bChest_x, yArmhole, px(armDepth, scale), false),
    `L ${bE.x} ${bE.y}`,
    `L ${bF.x} ${bF.y}`,
    `L ${bA.x} ${bA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: CHILD SHORT SLEEVE ────────────────────────────
  const slX0 = bX0 + px(halfChest + 2, scale) + gap;
  const slY0 = originY;

  const slWidth = px(bicep, scale);
  const slCapH  = px(armDepth * 0.5, scale);
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

  // ── PIECE 4: CHILD FLARED SKIRT PANEL ─────────────────────
  const skX0 = originX;
  const skY0 = fY0 + px(bodiceLen, scale) + gap;

  const skWaistW = px(halfWaist * 2, scale);
  const skHemW   = px(halfWaist * 2 + flare * 2, scale);
  const skLen    = px(skirtLen, scale);
  const skMidX   = skX0 + skHemW / 2;

  const skTopLeft: Point  = { x: skMidX - skWaistW / 2, y: skY0 };
  const skTopRight: Point = { x: skMidX + skWaistW / 2, y: skY0 };
  const skHemRight: Point = { x: skX0 + skHemW,         y: skY0 + skLen };
  const skHemLeft: Point  = { x: skX0,                  y: skY0 + skLen };

  const skirtPath = [
    `M ${skTopLeft.x} ${skTopLeft.y}`,
    `L ${skTopRight.x} ${skTopRight.y}`,
    `L ${skHemRight.x} ${skHemRight.y}`,
    cBez(skHemRight.x - skHemW * 0.3, skY0 + skLen + px(1.0, scale), skHemLeft.x + skHemW * 0.3, skY0 + skLen + px(1.0, scale), skHemLeft.x, skHemLeft.y),
    `L ${skTopLeft.x} ${skTopLeft.y}`,
    'Z',
  ].join(' ');

  const outline = [frontBodicePath, backBodicePath, sleevePath, skirtPath].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'kids_front_bodice',
      label: "KIDS' FRONT BODICE",
      subLabel: '(Cut 1 on fold - child proportions)',
      path: frontBodicePath,
      fillTint: 'rgba(245, 158, 11, 0.08)',
      strokeColor: '#D97706',
      labelCx: fCF_x + px(halfChest * 0.45, scale),
      labelCy: fY0 + px(bodiceLen * 0.5, scale),
      grainCx: fCF_x + px(halfChest * 0.45, scale),
      grainCy: fY0 + px(bodiceLen * 0.7, scale),
      grainLen: px(3, scale),
    },
    {
      id: 'kids_back_bodice',
      label: "KIDS' BACK BODICE",
      subLabel: '(Cut 2 for zipper/button closure)',
      path: backBodicePath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB_x + px(halfChest * 0.45, scale),
      labelCy: bY0 + px(bodiceLen * 0.5, scale),
      grainCx: bCB_x + px(halfChest * 0.45, scale),
      grainCy: bY0 + px(bodiceLen * 0.7, scale),
      grainLen: px(3, scale),
    },
    {
      id: 'kids_sleeve',
      label: "KIDS' SLEEVE",
      subLabel: '(Cut 2 pair)',
      path: sleevePath,
      fillTint: 'rgba(59, 130, 246, 0.08)',
      strokeColor: '#2563EB',
      labelCx: slMidX,
      labelCy: slY0 + slCapH + px(1.5, scale),
      grainCx: slMidX,
      grainCy: slY0 + slCapH + px(2.5, scale),
      grainLen: px(2, scale),
    },
    {
      id: 'kids_skirt',
      label: "KIDS' FLARED SKIRT",
      subLabel: '(Cut 2 front/back)',
      path: skirtPath,
      fillTint: 'rgba(236, 72, 153, 0.08)',
      strokeColor: '#DB2777',
      labelCx: skMidX,
      labelCy: skY0 + skLen * 0.4,
      grainCx: skMidX,
      grainCy: skY0 + skLen * 0.65,
      grainLen: px(4, scale),
    },
  ];

  const points: PatternPoint[] = [
    { label: 'K-FN', point: fA, description: "Kids' front neck dip" },
    { label: 'K-SH', point: fC, description: "Kids' shoulder tip" },
    { label: 'S-A', point: { x: slMidX, y: slY0 }, description: 'Sleeve cap apex' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF_x, y: yTop }, to: { x: fCF_x, y: yBodiceWaist }, dashed: true },
    { from: { x: skMidX, y: skY0 }, to: { x: skMidX, y: skY0 + skLen }, dashed: true },
  ];

  const margin = px(1.2, scale);
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fCF_x - margin, y: fY0 }, to: { x: fCF_x - margin, y: yBodiceWaist }, label: `Bodice: ${bodiceLen}"`, direction: 'vertical' },
    { from: { x: skX0 - margin, y: skY0 }, to: { x: skX0 - margin, y: skY0 + skLen }, label: `Skirt: ${skirtLen}"`, direction: 'vertical' },
    { from: { x: fCF_x, y: fY0 - margin }, to: { x: fChest_x, y: fY0 - margin }, label: `Chest: ${chest}"`, direction: 'horizontal' },
  ];

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
