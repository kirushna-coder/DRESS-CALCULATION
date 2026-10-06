// ============================================================
// Fabriplay – Fitted Saree Blouse Pattern Drafting Engine
// ============================================================

import type { Measurements, PatternData, Point } from '../types';
import {
  createFrontNecklineSegment,
  createBackNecklineSegment,
  createArmholePathSegment,
  createSleeveCapPathSegments,
} from '../utils/curveUtils';

const px = (inches: number, scale: number) => inches * scale;

export function calculateBlousePattern(m: Measurements, scale: number): PatternData {
  const ease = m.ease ?? 0.5; // Blouses are very fitted
  const halfBust = (m.bust + ease) / 4;
  const halfWaist = (m.waist + ease) / 4;
  const halfNeck = (m.neckWidth || 6) / 2;
  const halfShoulder = (m.shoulderWidth || 14) / 2;
  const armDepth = m.armholeDepth || 6.5;
  const frontNeckD = m.neckDepth || 6;
  const backNeckD = m.backNeckDepth || 9; // Deep back neck is typical
  const totalLength = m.fullLength || 14.5;
  const sleeveLen = m.sleeveLength || 5;
  const sleeveBicep = m.bicepCircumference || 12;
  
  const gap = px(4, scale);
  const originX = 20;
  const originY = 20;

  // ── PIECE 1: FRONT ─────────────────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  const fCF_x = fX0;
  const fNeck_x = fCF_x + px(halfNeck, scale);
  const fSh_x = fCF_x + px(halfShoulder, scale);
  // Front includes dart allowance (e.g., +1 inch)
  const fBust_x = fCF_x + px(halfBust + 1, scale); 
  const fWaist_x = fCF_x + px(halfWaist + 1, scale);
  
  const yTop = fY0;
  const yNeckDip = fY0 + px(frontNeckD, scale);
  const yShSlope = fY0 + px(m.shoulderSlope || 0.75, scale);
  const yArmhole = fY0 + px(armDepth, scale);
  const yHem = fY0 + px(totalLength, scale);

  const frontPath = [
    `M ${fCF_x} ${yNeckDip}`,
    createFrontNecklineSegment(fCF_x, yNeckDip, fNeck_x, yTop),
    `L ${fSh_x} ${yShSlope}`,
    createArmholePathSegment(fSh_x, yShSlope, fBust_x, yArmhole, px(armDepth, scale), true),
    `L ${fWaist_x} ${yHem}`,
    `L ${fCF_x} ${yHem}`,
    `L ${fCF_x} ${yNeckDip}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK ──────────────────────────────────────────
  const bX0 = fX0 + px(halfBust + 2.5, scale) + gap;

  const bCB_x = bX0;
  const bNeck_x = bCB_x + px(halfNeck, scale);
  const bSh_x = bCB_x + px(halfShoulder, scale);
  const bBust_x = bCB_x + px(halfBust, scale);
  const bWaist_x = bCB_x + px(halfWaist + 0.5, scale); // Back dart allowance

  const bA: Point = { x: bCB_x, y: yTop + px(backNeckD, scale) };
  
  const backPath = [
    `M ${bA.x} ${bA.y}`,
    createBackNecklineSegment(bCB_x, bA.y, bNeck_x, yTop),
    `L ${bSh_x} ${yShSlope}`,
    createArmholePathSegment(bSh_x, yShSlope, bBust_x, yArmhole, px(armDepth, scale), false),
    `L ${bWaist_x} ${yHem}`,
    `L ${bCB_x} ${yHem}`,
    `L ${bA.x} ${bA.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: SLEEVE ───────────────────────────────────────
  const slX0 = bX0 + px(halfBust + 1.5, scale) + gap;
  const slY0 = originY;

  const slWidth = px(sleeveBicep, scale);
  const slCapH = px(armDepth * 0.75, scale);
  const slLen = px(sleeveLen, scale);
  const slMidX = slX0 + slWidth / 2;
  const wristW = slWidth * 0.8;

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

  return {
    outlinePath: [frontPath, backPath, sleevePath].join(' '),
    pieces: [
      {
        id: 'blouse_front',
        label: 'FRONT',
        subLabel: '(Cut 2 with front closure)',
        path: frontPath,
        fillTint: 'rgba(59, 130, 246, 0.08)',
        strokeColor: '#3B82F6',
      },
      {
        id: 'blouse_back',
        label: 'BACK',
        subLabel: '(Cut 1 on fold)',
        path: backPath,
        fillTint: 'rgba(16, 185, 129, 0.08)',
        strokeColor: '#059669',
      },
      {
        id: 'blouse_sleeve',
        label: 'SLEEVE',
        subLabel: '(Cut 2 pair)',
        path: sleevePath,
        fillTint: 'rgba(217, 119, 6, 0.08)',
        strokeColor: '#D97706',
      }
    ],
    points: [],
    constructionLines: [],
    annotations: [],
    bounds: { width: slX0 + slWidth + px(5, scale), height: yHem + px(5, scale) },
  };
}
