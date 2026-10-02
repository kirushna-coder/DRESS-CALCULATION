// ============================================================
// Fabriplay – Pleated Salwar Pattern Drafting Engine
// Traditional Indian Salwar Drafting Principles (CBSE / INFLIBNET)
//
// All input measurements in INCHES.
// Creates 3 distinct pattern pieces:
//   1. Pleated Salwar Leg Panel / Kalis (Cut 2 pair) - wide pleated thigh area
//   2. Upper Waist Belt / Katha Band (Cut 1) - 7" belt with casing
//   3. Ankle Poncha Cuff Band (Cut 2) - 2.5" stiffened ankle cuff
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
} from '../utils/curveUtils';

const px = (inches: number, scale: number) => inches * scale;

export function calculateSalwarPattern(
  m: Measurements,
  scale: number
): PatternData {
  const hip   = m.hip || 38;
  const outseam = m.outseam || 39;
  const bottomWidth = m.bottomWidth || 15; // 15" total ankle circumference (7.5" flat)

  const beltHeight = 7.0; // 7" upper waistband belt
  const legLength  = outseam - beltHeight; // leg length without belt
  const crotchDepth= 9.5; // crotch rise on leg panel (attaches to 7" belt = 16.5" total rise)

  const pleatedThighW = (hip + 14) / 2; // huge width (e.g. 26") gathered into front waist pleats
  const halfPoncha   = bottomWidth / 2; // 7.5" flat ankle width

  const gap = px(4, scale);
  const originX = 36;
  const originY = 30;

  // ── PIECE 1: PLEATED SALWAR LEG PANEL ─────────────────────
  const legX0 = originX;
  const legY0 = originY;

  const yLegWaist = legY0;
  const yCrotch   = legY0 + px(crotchDepth, scale);
  const yHem      = legY0 + px(legLength, scale);

  const thighWPx  = px(pleatedThighW, scale);
  const ponchaWPx = px(halfPoncha, scale);

  const ptWaistLeft: Point  = { x: legX0, y: yLegWaist };
  const ptWaistRight: Point = { x: legX0 + thighWPx, y: yLegWaist };

  const ptCrotchRight: Point= { x: legX0 + thighWPx - px(2.5, scale), y: yCrotch };
  const ptPonchaRight: Point= { x: legX0 + ponchaWPx, y: yHem };
  const ptPonchaLeft: Point = { x: legX0, y: yHem };

  const salwarLegPath = [
    `M ${ptWaistLeft.x} ${ptWaistLeft.y}`,
    `L ${ptWaistRight.x} ${ptWaistRight.y}`,
    createCrotchPathSegment(ptWaistRight.x, ptWaistRight.y, ptWaistRight.x, yCrotch - px(1.5, scale), ptCrotchRight.x, ptCrotchRight.y, true),
    `L ${ptPonchaRight.x} ${ptPonchaRight.y}`,
    `L ${ptPonchaLeft.x} ${ptPonchaLeft.y}`,
    `L ${ptWaistLeft.x} ${ptWaistLeft.y}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: UPPER WAIST BELT (KATHA) ──────────────────────
  const beltX0 = legX0 + thighWPx + px(3, scale) + gap;
  const beltY0 = originY;

  const beltW = px((hip + 6) / 2, scale);
  const beltH = px(beltHeight, scale);

  const salwarBeltPath = [
    `M ${beltX0} ${beltY0}`,
    `L ${beltX0 + beltW} ${beltY0}`,
    `L ${beltX0 + beltW} ${beltY0 + beltH}`,
    `L ${beltX0} ${beltY0 + beltH}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: ANKLE PONCHA CUFF BAND ────────────────────────
  const ponchaX0 = beltX0;
  const ponchaY0 = beltY0 + beltH + px(2, scale) + gap;

  const ponchaLen = px(halfPoncha * 2, scale);
  const ponchaH   = px(2.5, scale); // 2.5" stiffened poncha band

  const ponchaCuffPath = [
    `M ${ponchaX0} ${ponchaY0}`,
    `L ${ponchaX0 + ponchaLen} ${ponchaY0}`,
    `L ${ponchaX0 + ponchaLen} ${ponchaY0 + ponchaH}`,
    `L ${ponchaX0} ${ponchaY0 + ponchaH}`,
    'Z',
  ].join(' ');

  const outline = [salwarLegPath, salwarBeltPath, ponchaCuffPath].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'salwar_leg',
      label: 'PLEATED SALWAR LEG PANEL (KALI)',
      subLabel: '(Cut 2 pair - waist gathers into upper belt)',
      path: salwarLegPath,
      fillTint: 'rgba(79, 70, 229, 0.08)',
      strokeColor: '#4F46E5',
      labelCx: legX0 + thighWPx * 0.4,
      labelCy: yCrotch + px(legLength * 0.3, scale),
      grainCx: legX0 + thighWPx * 0.4,
      grainCy: yCrotch + px(legLength * 0.5, scale),
      grainLen: px(6, scale),
    },
    {
      id: 'salwar_belt',
      label: 'UPPER WAIST BELT (KATHA)',
      subLabel: '(Cut 1 - front pleat distribution line)',
      path: salwarBeltPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: beltX0 + beltW / 2,
      labelCy: beltY0 + beltH / 2,
    },
    {
      id: 'poncha_cuff',
      label: 'ANKLE PONCHA CUFF BAND',
      subLabel: '(Cut 2 with stiffener canvassing)',
      path: ponchaCuffPath,
      fillTint: 'rgba(217, 119, 6, 0.08)',
      strokeColor: '#D97706',
      labelCx: ponchaX0 + ponchaLen / 2,
      labelCy: ponchaY0 + ponchaH / 2,
    },
  ];

  const points: PatternPoint[] = [
    { label: 'S-PLEAT', point: ptWaistRight, description: 'Waist pleat gathering start' },
    { label: 'S-CROTCH', point: ptCrotchRight, description: 'Salwar crotch fork' },
    { label: 'S-PONCHA', point: ptPonchaRight, description: 'Ankle poncha cuff join' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: legX0, y: yCrotch }, to: { x: ptCrotchRight.x, y: yCrotch }, dashed: true },
    { from: { x: legX0 + px(halfPoncha * 2, scale), y: yLegWaist }, to: { x: legX0 + px(halfPoncha * 2, scale), y: yHem }, dashed: true },
  ];

  const margin = px(1.2, scale);
  const annotations: MeasurementAnnotation[] = [
    { from: { x: legX0 - margin, y: yLegWaist }, to: { x: legX0 - margin, y: yHem }, label: `Leg Length: ${legLength}"`, direction: 'vertical' },
    { from: { x: legX0, y: yLegWaist - margin }, to: { x: ptWaistRight.x, y: yLegWaist - margin }, label: `Thigh Pleat Width: ${pleatedThighW}"`, direction: 'horizontal' },
  ];

  const boundsWidth = beltX0 + beltW + px(4, scale);
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
