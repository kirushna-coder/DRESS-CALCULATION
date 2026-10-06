// ============================================================
// Fabriplay – Formal / Casual Shirt Pattern Drafting Engine
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

export function calculateShirtPattern(
  m: Measurements,
  scale: number
): PatternData {
  const ease = m.ease ?? 2;
  const halfBust = (m.bust + ease) / 4;
  const halfWaist = (m.waist + ease) / 4;
  const halfNeck = (m.neckWidth || 6.5) / 2;
  const halfShoulder = (m.shoulderWidth || 17) / 2;
  const armDepth = m.armholeDepth || 8;
  const frontNeckD = m.neckDepth || 3;
  const backNeckD = m.backNeckDepth || 1;
  const totalLength = m.fullLength || 28;
  const sleeveLen = m.sleeveLength || 24;
  const sleeveBicep = m.bicepCircumference || 15;

  const gap = px(4, scale);
  const originX = 20;
  const originY = 20;

  // ── PIECE 1: FRONT ─────────────────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  const fCF_x = fX0;
  // Button stand / Placket extension
  const placketW = px(1, scale);
  const fPlacket_x = fCF_x - placketW;
  
  const fNeck_x = fCF_x + px(halfNeck, scale);
  const fSh_x = fCF_x + px(halfShoulder, scale);
  const fBust_x = fCF_x + px(halfBust, scale);
  const fWaist_x = fCF_x + px(halfWaist, scale);

  const yTop = fY0;
  const yNeckDip = fY0 + px(frontNeckD, scale);
  const yShSlope = fY0 + px(m.shoulderSlope || 1.5, scale);
  const yArmhole = fY0 + px(armDepth, scale);
  const yWaist = fY0 + px(17, scale);
  const yHem = fY0 + px(totalLength, scale);

  // Curved hem for shirt
  const fHemCurveX = fWaist_x;
  const fHemCurveY = yHem - px(2, scale);

  const frontPath = [
    `M ${fPlacket_x} ${yNeckDip}`,
    `L ${fCF_x} ${yNeckDip}`,
    createFrontNecklineSegment(fCF_x, yNeckDip, fNeck_x, yTop),
    `L ${fSh_x} ${yShSlope}`,
    createArmholePathSegment(fSh_x, yShSlope, fBust_x, yArmhole, px(armDepth, scale), true),
    `L ${fWaist_x} ${yWaist}`,
    `L ${fHemCurveX} ${fHemCurveY}`,
    // Curve to CF hem
    `Q ${fCF_x + px(halfWaist/2, scale)} ${yHem} ${fPlacket_x} ${yHem}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK (with yoke built-in) ────────────────────
  const bX0 = fX0 + px(halfBust + 3, scale) + gap;
  const bY0 = originY;

  const bCB_x = bX0;
  const bNeck_x = bCB_x + px(halfNeck, scale);
  const bSh_x = bCB_x + px(halfShoulder, scale);
  const bBust_x = bCB_x + px(halfBust, scale);
  const bWaist_x = bCB_x + px(halfWaist, scale);

  const bA: Point = { x: bCB_x, y: yTop + px(backNeckD, scale) };
  const bC: Point = { x: bSh_x, y: yShSlope };

  const backPath = [
    `M ${bA.x} ${bA.y}`,
    createBackNecklineSegment(bCB_x, bA.y, bNeck_x, yTop),
    `L ${bC.x} ${bC.y}`,
    createArmholePathSegment(bSh_x, yShSlope, bBust_x, yArmhole, px(armDepth, scale), false),
    `L ${bWaist_x} ${yWaist}`,
    `L ${bWaist_x} ${yHem - px(2, scale)}`,
    `Q ${bCB_x + px(halfWaist/2, scale)} ${yHem} ${bCB_x} ${yHem}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: SLEEVE ───────────────────────────────────────
  const slX0 = bX0 + px(halfBust + 2, scale) + gap;
  const slY0 = originY;

  const slWidth = px(sleeveBicep, scale);
  const slCapH = px(armDepth * 0.7, scale);
  const slLen = px(sleeveLen, scale);
  const slMidX = slX0 + slWidth / 2;
  const wristW = slWidth * 0.6; 

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

  const pieces: PatternData['pieces'] = [
    {
      id: 'shirt_front',
      label: 'FRONT (with Placket)',
      subLabel: '(Cut 2 pair)',
      path: frontPath,
      fillTint: 'rgba(59, 130, 246, 0.08)',
      strokeColor: '#3B82F6',
      labelCx: fCF_x + px(halfBust * 0.45, scale),
      labelCy: fY0 + px(totalLength * 0.45, scale),
      grainCx: fCF_x + px(halfBust * 0.45, scale),
      grainCy: fY0 + px(totalLength * 0.65, scale),
      grainLen: px(4, scale),
    },
    {
      id: 'shirt_back',
      label: 'BACK',
      subLabel: '(Cut 1 on fold)',
      path: backPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB_x + px(halfBust * 0.45, scale),
      labelCy: bY0 + px(totalLength * 0.45, scale),
      grainCx: bCB_x + px(halfBust * 0.45, scale),
      grainCy: bY0 + px(totalLength * 0.65, scale),
      grainLen: px(4, scale),
    },
    {
      id: 'shirt_sleeve',
      label: 'SLEEVE',
      subLabel: '(Cut 2 pair)',
      path: sleevePath,
      fillTint: 'rgba(217, 119, 6, 0.08)',
      strokeColor: '#D97706',
      labelCx: slMidX,
      labelCy: slY0 + slCapH + px(2, scale),
      grainCx: slMidX,
      grainCy: slY0 + slCapH + px(5, scale),
      grainLen: px(3, scale),
    },
  ];

  return {
    outlinePath: [frontPath, backPath, sleevePath].join(' '),
    pieces,
    points: [],
    constructionLines: [],
    annotations: [],
    bounds: { 
      width: Math.max(fX0, bX0, slX0) + px(40, scale), 
      height: yHem + px(10, scale) 
    },
  };
}
