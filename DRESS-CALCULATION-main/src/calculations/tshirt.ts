// ============================================================
// Fabriplay – Round Neck T-Shirt Pattern Drafting Engine
// ============================================================

import type {
  Measurements,
  PatternData,
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
  // Knit blocks have less ease than wovens, sometimes negative ease depending on stretch
  const ease = m.ease ?? 0;
  const halfChest = (m.bust + ease) / 4;
  const halfNeck = (m.neckWidth || 6) / 2;
  const halfShoulder = (m.shoulderWidth || 16) / 2;
  
  const armDepth = m.armholeDepth || 8;
  const frontNeckD = m.neckDepth || 4;
  const backNeckD = m.backNeckDepth || 1;
  const totalLength = m.fullLength || 26;
  const sleeveLen = m.sleeveLength || 8;
  const sleeveBicep = m.bicepCircumference || 14;

  const gap = px(4, scale);
  const originX = 20;
  const originY = 20;

  // ── PIECE 1: FRONT ─────────────────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  const fCF_x = fX0;
  const fNeck_x = fCF_x + px(halfNeck, scale);
  const fSh_x = fCF_x + px(halfShoulder, scale);
  const fChest_x = fCF_x + px(halfChest, scale);
  
  const yTop = fY0;
  const yNeckDip = fY0 + px(frontNeckD, scale);
  const yShSlope = fY0 + px(m.shoulderSlope || 1.5, scale);
  const yArmhole = fY0 + px(armDepth, scale);
  const yHem = fY0 + px(totalLength, scale);

  const frontPath = [
    `M ${fCF_x} ${yNeckDip}`,
    createFrontNecklineSegment(fCF_x, yNeckDip, fNeck_x, yTop),
    `L ${fSh_x} ${yShSlope}`,
    createArmholePathSegment(fSh_x, yShSlope, fChest_x, yArmhole, px(armDepth, scale), true),
    `L ${fChest_x} ${yHem}`, // Straight side seam for basic T-shirt
    `L ${fCF_x} ${yHem}`,
    `L ${fCF_x} ${yNeckDip}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK ──────────────────────────────────────────
  const bX0 = fX0 + px(halfChest + 3, scale) + gap;
  const bY0 = originY;

  const bCB_x = bX0;
  const bNeck_x = bCB_x + px(halfNeck, scale);
  const bSh_x = bCB_x + px(halfShoulder, scale);
  const bChest_x = bCB_x + px(halfChest, scale);

  const bA: Point = { x: bCB_x, y: yTop + px(backNeckD, scale) };
  
  const backPath = [
    `M ${bA.x} ${bA.y}`,
    createBackNecklineSegment(bCB_x, bA.y, bNeck_x, yTop),
    `L ${bSh_x} ${yShSlope}`,
    createArmholePathSegment(bSh_x, yShSlope, bChest_x, yArmhole, px(armDepth, scale), false),
    `L ${bChest_x} ${yHem}`,
    `L ${bCB_x} ${yHem}`,
    `L ${bA.x} ${bA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: SLEEVE ───────────────────────────────────────
  const slX0 = bX0 + px(halfChest + 2, scale) + gap;
  const slY0 = originY;

  const slWidth = px(sleeveBicep, scale);
  // Knit sleeve cap is often flatter/shorter than woven
  const slCapH = px(armDepth * 0.6, scale);
  const slLen = px(sleeveLen, scale);
  const slMidX = slX0 + slWidth / 2;
  const wristW = slWidth * 0.85; 

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

  // ── PIECE 4: NECKBAND ─────────────────────────────────────
  const nbX0 = originX;
  const nbY0 = yHem + gap;
  
  // Approximate neckline circumference based on width and depths
  // Semi-ellipse perimeter approx for front and back neck
  const frontNeckArc = Math.PI * Math.sqrt(0.5 * (Math.pow(halfNeck, 2) + Math.pow(frontNeckD, 2)));
  const backNeckArc = Math.PI * Math.sqrt(0.5 * (Math.pow(halfNeck, 2) + Math.pow(backNeckD, 2)));
  const totalNecklineCircumference = (frontNeckArc + backNeckArc); // for full neck
  
  // T-Shirt neckbands are cut smaller than the neckline opening to lay flat (usually 80-85%)
  const stretchRatio = 0.85; 
  const nbLength = px(totalNecklineCircumference * stretchRatio, scale);
  const nbWidth = px(2, scale); // 2 inches wide, folded to 1 inch

  const neckbandPath = [
    `M ${nbX0} ${nbY0}`,
    `L ${nbX0 + nbLength} ${nbY0}`,
    `L ${nbX0 + nbLength} ${nbY0 + nbWidth}`,
    `L ${nbX0} ${nbY0 + nbWidth}`,
    'Z',
  ].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'tshirt_front',
      label: 'FRONT',
      subLabel: '(Cut 1 on fold)',
      path: frontPath,
      fillTint: 'rgba(59, 130, 246, 0.08)',
      strokeColor: '#3B82F6',
      labelCx: fCF_x + px(halfChest * 0.45, scale),
      labelCy: fY0 + px(totalLength * 0.45, scale),
      grainCx: fCF_x + px(halfChest * 0.45, scale),
      grainCy: fY0 + px(totalLength * 0.65, scale),
      grainLen: px(4, scale),
    },
    {
      id: 'tshirt_back',
      label: 'BACK',
      subLabel: '(Cut 1 on fold)',
      path: backPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB_x + px(halfChest * 0.45, scale),
      labelCy: bY0 + px(totalLength * 0.45, scale),
      grainCx: bCB_x + px(halfChest * 0.45, scale),
      grainCy: bY0 + px(totalLength * 0.65, scale),
      grainLen: px(4, scale),
    },
    {
      id: 'tshirt_sleeve',
      label: 'SLEEVE',
      subLabel: '(Cut 2 pair)',
      path: sleevePath,
      fillTint: 'rgba(217, 119, 6, 0.08)',
      strokeColor: '#D97706',
      labelCx: slMidX,
      labelCy: slY0 + slCapH + px(2, scale),
      grainCx: slMidX,
      grainCy: slY0 + slCapH + px(3.5, scale),
      grainLen: px(3, scale),
    },
    {
      id: 'tshirt_neckband',
      label: 'NECKBAND',
      subLabel: '(Cut 1 on fold - Stretch to fit)',
      path: neckbandPath,
      fillTint: 'rgba(220, 38, 38, 0.08)',
      strokeColor: '#DC2626',
      labelCx: nbX0 + nbLength / 2,
      labelCy: nbY0 + nbWidth / 2,
    },
  ];

  return {
    outlinePath: [frontPath, backPath, sleevePath, neckbandPath].join(' '),
    pieces,
    points: [],
    constructionLines: [],
    annotations: [],
    bounds: { 
      width: Math.max(fX0, bX0, slX0) + px(30, scale), 
      height: nbY0 + nbWidth + px(10, scale) 
    },
  };
}
