// ============================================================
// Fabriplay – Ethnic Kurta Pattern Drafting Engine
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

export function calculateKurtaPattern(
  m: Measurements,
  scale: number
): PatternData {
  const ease = m.ease ?? 2.5; // Kurtas are typically looser than shirts
  const halfChest = (m.bust + ease) / 4;
  const halfWaist = (m.waist + ease) / 4;
  const halfHip = (m.hip + ease) / 4;
  
  const halfNeck = (m.neckWidth || 6) / 2;
  const halfShoulder = (m.shoulderWidth || 17.5) / 2;
  
  const armDepth = m.armholeDepth || 8.5;
  const frontNeckD = m.neckDepth || 3.5; // Often has a slit below this for mandarin collar
  const backNeckD = m.backNeckDepth || 1;
  const totalLength = m.fullLength || 40;
  const sleeveLen = m.sleeveLength || 24;
  const sleeveBicep = m.bicepCircumference || 15;
  const waistLength = m.waistLength || 16;
  const hipLength = m.hipDepth ? waistLength + m.hipDepth : 24;

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
  const fWaist_x = fCF_x + px(halfWaist, scale);
  const fHip_x = fCF_x + px(halfHip, scale);
  
  const yTop = fY0;
  const yNeckDip = fY0 + px(frontNeckD, scale);
  const yShSlope = fY0 + px(m.shoulderSlope || 1.5, scale);
  const yArmhole = fY0 + px(armDepth, scale);
  const yWaist = fY0 + px(waistLength, scale);
  const yHip = fY0 + px(hipLength, scale); // Usually the top of the side slit
  const yHem = fY0 + px(totalLength, scale);

  const frontPath = [
    `M ${fCF_x} ${yNeckDip}`,
    createFrontNecklineSegment(fCF_x, yNeckDip, fNeck_x, yTop),
    `L ${fSh_x} ${yShSlope}`,
    createArmholePathSegment(fSh_x, yShSlope, fChest_x, yArmhole, px(armDepth, scale), true),
    `L ${fWaist_x} ${yWaist}`, // Gentle waist shaping
    `L ${fHip_x} ${yHip}`, // Hip/Slit mark
    `L ${fHip_x + px(1, scale)} ${yHem}`, // Slight A-line to hem
    `L ${fCF_x} ${yHem}`,
    `L ${fCF_x} ${yNeckDip}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK ──────────────────────────────────────────
  const bX0 = fX0 + px(halfHip + 3, scale) + gap;
  const bY0 = originY;

  const bCB_x = bX0;
  const bNeck_x = bCB_x + px(halfNeck, scale);
  const bSh_x = bCB_x + px(halfShoulder, scale);
  const bChest_x = bCB_x + px(halfChest, scale);
  const bWaist_x = bCB_x + px(halfWaist, scale);
  const bHip_x = bCB_x + px(halfHip, scale);

  const bA: Point = { x: bCB_x, y: yTop + px(backNeckD, scale) };
  
  const backPath = [
    `M ${bA.x} ${bA.y}`,
    createBackNecklineSegment(bCB_x, bA.y, bNeck_x, yTop),
    `L ${bSh_x} ${yShSlope}`,
    createArmholePathSegment(bSh_x, yShSlope, bChest_x, yArmhole, px(armDepth, scale), false),
    `L ${bWaist_x} ${yWaist}`,
    `L ${bHip_x} ${yHip}`,
    `L ${bHip_x + px(1, scale)} ${yHem}`,
    `L ${bCB_x} ${yHem}`,
    `L ${bA.x} ${bA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: SLEEVE ───────────────────────────────────────
  const slX0 = bX0 + px(halfHip + 3, scale) + gap;
  const slY0 = originY;

  const slWidth = px(sleeveBicep, scale);
  const slCapH = px(armDepth * 0.7, scale);
  const slLen = px(sleeveLen, scale);
  const slMidX = slX0 + slWidth / 2;
  const wristW = slWidth * 0.7; // Kurta sleeves are fairly straight

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
      id: 'kurta_front',
      label: 'FRONT',
      subLabel: '(Cut 1 on fold)',
      path: frontPath,
      fillTint: 'rgba(59, 130, 246, 0.08)',
      strokeColor: '#3B82F6',
      labelCx: fCF_x + px(halfChest * 0.45, scale),
      labelCy: fY0 + px(totalLength * 0.45, scale),
      grainCx: fCF_x + px(halfChest * 0.45, scale),
      grainCy: fY0 + px(totalLength * 0.65, scale),
      grainLen: px(6, scale),
    },
    {
      id: 'kurta_back',
      label: 'BACK',
      subLabel: '(Cut 1 on fold)',
      path: backPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB_x + px(halfChest * 0.45, scale),
      labelCy: bY0 + px(totalLength * 0.45, scale),
      grainCx: bCB_x + px(halfChest * 0.45, scale),
      grainCy: bY0 + px(totalLength * 0.65, scale),
      grainLen: px(6, scale),
    },
    {
      id: 'kurta_sleeve',
      label: 'SLEEVE',
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
  ];

  return {
    outlinePath: [frontPath, backPath, sleevePath].join(' '),
    pieces,
    points: [],
    constructionLines: [
      { from: { x: fHip_x, y: yHip }, to: { x: fHip_x + px(2, scale), y: yHip }, dashed: true }, // Slit mark
      { from: { x: bHip_x, y: yHip }, to: { x: bHip_x + px(2, scale), y: yHip }, dashed: true },
    ],
    annotations: [],
    bounds: { 
      width: Math.max(fX0, bX0, slX0) + px(30, scale), 
      height: yHem + px(10, scale) 
    },
  };
}
