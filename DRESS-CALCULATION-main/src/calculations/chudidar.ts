// ============================================================
// Fabriplay – Fitted Chudidar Pattern Drafting Engine
// Traditional Indian Chudidar Drafting Principles (CBSE / INFLIBNET)
//
// All input measurements in INCHES.
// Creates 2 distinct pattern pieces:
//   1. Chudidar Leg Panel (Cut 2 pair) - bias-cut / tapered leg with +12" extra ankle gather length
//   2. Waist Belt / Casing Band (Cut 1) - drawstring nada casing
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
  createCrotchPathSegment,
  createInseamPathSegment,
} from '../utils/curveUtils';

const px = (inches: number, scale: number) => inches * scale;

export function calculateChudidarPattern(
  m: Measurements,
  scale: number
): PatternData {
  const hip   = m.hip || 38;
  const outseam = m.outseam || 40;
  const inseam  = m.inseam || 30;
  const knee    = m.kneeCircumference || 14;
  const ankle   = m.ankleCircumference || 10;

  const extraChuriLength = 12; // +12" extra length for gathered ankle churis
  const totalLegLength = outseam + extraChuriLength;

  const crotchRise = outseam - inseam;
  const halfHip    = (hip + 4) / 4;
  const halfKnee   = knee / 2;
  const halfAnkle  = ankle / 2;

  const beltHeight = 6.0; // 6" upper waist belt casing
  const mainLegLength = totalLegLength - beltHeight;

  const gap = px(4, scale);
  const originX = 36;
  const originY = 30;

  // ── PIECE 1: CHUDIDAR LEG PANEL (FRONT/BACK PAIR) ──────────
  const legX0 = originX;
  const legY0 = originY;

  const yWaist   = legY0;
  const yCrotch  = legY0 + px(crotchRise - beltHeight, scale);
  const yKnee    = legY0 + px(crotchRise - beltHeight + inseam * 0.5, scale);
  const yAnkle   = legY0 + px(crotchRise - beltHeight + inseam, scale);
  const yChuri   = legY0 + px(mainLegLength, scale);

  const waistW   = px(halfHip, scale);
  const crotchExt= px(hip / 8, scale);
  const kneeW    = px(halfKnee, scale);
  const ankleW   = px(halfAnkle, scale);

  const ptWaistLeft: Point  = { x: legX0, y: yWaist };
  const ptWaistRight: Point = { x: legX0 + waistW, y: yWaist };

  const ptCrotchRight: Point= { x: legX0 + waistW + crotchExt, y: yCrotch };
  const ptKneeRight: Point  = { x: legX0 + kneeW + px(1, scale), y: yKnee };
  const ptAnkleRight: Point = { x: legX0 + ankleW, y: yAnkle };
  const ptChuriRight: Point = { x: legX0 + ankleW - px(0.5, scale), y: yChuri };

  const ptChuriLeft: Point  = { x: legX0, y: yChuri };
  const ptAnkleLeft: Point  = { x: legX0, y: yAnkle };
  const ptKneeLeft: Point   = { x: legX0, y: yKnee };

  const chudidarLegPath = [
    `M ${ptWaistLeft.x} ${ptWaistLeft.y}`,
    `L ${ptWaistRight.x} ${ptWaistRight.y}`,
    createCrotchPathSegment(ptWaistRight.x, ptWaistRight.y, ptWaistRight.x, yCrotch - px(2, scale), ptCrotchRight.x, ptCrotchRight.y, true),
    createInseamPathSegment(ptCrotchRight.x, ptCrotchRight.y, ptKneeRight.x, ptKneeRight.y),
    `L ${ptAnkleRight.x} ${ptAnkleRight.y}`,
    `L ${ptChuriRight.x} ${ptChuriRight.y}`,
    `L ${ptChuriLeft.x} ${ptChuriLeft.y}`,
    `L ${ptAnkleLeft.x} ${ptAnkleLeft.y}`,
    `L ${ptKneeLeft.x} ${ptKneeLeft.y}`,
    `L ${ptWaistLeft.x} ${ptWaistLeft.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: WAIST CASING BELT ─────────────────────────────
  const beltX0 = legX0 + waistW + crotchExt + px(3, scale) + gap;
  const beltY0 = originY;

  const beltW = px((hip + 6) / 2, scale);
  const beltH = px(beltHeight, scale);

  const beltPath = [
    `M ${beltX0} ${beltY0}`,
    `L ${beltX0 + beltW} ${beltY0}`,
    `L ${beltX0 + beltW} ${beltY0 + beltH}`,
    `L ${beltX0} ${beltY0 + beltH}`,
    'Z',
  ].join(' ');

  const outline = [chudidarLegPath, beltPath].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'chudidar_leg',
      label: 'FITTED CHUDIDAR LEG (BIAS CUT)',
      subLabel: `(Cut 2 pair on bias - includes +${extraChuriLength}" churi gathers)`,
      path: chudidarLegPath,
      fillTint: 'rgba(79, 70, 229, 0.08)',
      strokeColor: '#4F46E5',
      labelCx: legX0 + waistW / 2,
      labelCy: yKnee,
      grainCx: legX0 + waistW / 2,
      grainCy: yKnee + px(4, scale),
      grainLen: px(8, scale),
    },
    {
      id: 'chudidar_belt',
      label: 'WAIST BELT CASING',
      subLabel: '(Cut 1 for drawstring nada)',
      path: beltPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: beltX0 + beltW / 2,
      labelCy: beltY0 + beltH / 2,
    },
  ];

  const points: PatternPoint[] = [
    { label: 'C-CROTCH', point: ptCrotchRight, description: 'Chudidar crotch fork' },
    { label: 'C-ANKLE', point: ptAnkleRight, description: 'Fitted ankle level' },
    { label: 'C-CHURI', point: ptChuriRight, description: 'Gathers bottom hem' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: legX0, y: yAnkle }, to: { x: ptAnkleRight.x, y: yAnkle }, dashed: true },
    { from: { x: legX0, y: yKnee }, to: { x: ptKneeRight.x, y: yKnee }, dashed: true },
  ];

  const margin = px(1.2, scale);
  const annotations: MeasurementAnnotation[] = [
    { from: { x: legX0 - margin, y: yWaist }, to: { x: legX0 - margin, y: yChuri }, label: `Total Leg (with Churis): ${totalLegLength}"`, direction: 'vertical' },
    { from: { x: legX0, y: yAnkle - margin }, to: { x: ptAnkleRight.x, y: yAnkle - margin }, label: `Fitted Ankle: ${ankle}"`, direction: 'horizontal' },
  ];

  const boundsWidth = beltX0 + beltW + px(4, scale);
  const boundsHeight = yChuri + px(4, scale);

  return {
    outlinePath: outline,
    pieces,
    points,
    constructionLines,
    annotations,
    bounds: { width: boundsWidth, height: boundsHeight },
  };
}
