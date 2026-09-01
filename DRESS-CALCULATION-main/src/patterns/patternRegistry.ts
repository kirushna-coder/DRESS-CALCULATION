// ============================================================
// SmartTailor AI – Pattern Registry
// Maps DressType & PatternType -> calculation functions
// ============================================================

import type {
  ConstructionLine,
  MeasurementAnnotation,
  Measurements,
  PatternData,
  PatternPoint,
  Point,
  PatternType,
} from '../types';
import {
  calculateOnePieceDress,
  DEFAULT_MEASUREMENTS as ONE_PIECE_DEFAULTS,
} from '../calculations/onePieceDress';

const px = (value: number, scale: number) => value * scale;

const qBez = (cx: number, cy: number, ex: number, ey: number) =>
  `Q ${cx} ${cy} ${ex} ${ey}`;

const cBez = (
  cx1: number,
  cy1: number,
  cx2: number,
  cy2: number,
  ex: number,
  ey: number
) => `C ${cx1} ${cy1} ${cx2} ${cy2} ${ex} ${ey}`;

export interface DressPatternMeta {
  patternType: 'tshirt' | 'shirt' | 'pant' | 'kurta' | 'blouse' | 'chudidar' | 'skirt' | 'kurti' | 'kids' | 'frock';
  measurements: string[];
  previewType: string;
  fabricNote: string;
}

export const dressPatternConfig: Record<PatternType, DressPatternMeta> = {
  ONE_PIECE: {
    patternType: 'frock',
    measurements: ['bust', 'waist', 'hip', 'fullLength', 'flare'],
    previewType: 'frock',
    fabricNote: 'Bodice and flare geometry with fitted waist and umbrella skirt.',
  },
  FROCK: {
    patternType: 'frock',
    measurements: ['bust', 'waist', 'hip', 'fullLength', 'flare'],
    previewType: 'frock',
    fabricNote: 'Flared frock bodice and umbrella skirt with structured waist.',
  },
  KURTI: {
    patternType: 'kurti',
    measurements: ['bust', 'waist', 'hip', 'fullLength', 'sleeveLength'],
    previewType: 'kurti',
    fabricNote: 'Straight tunic with side slit and relaxed kurti proportions.',
  },
  KURTA: {
    patternType: 'kurta',
    measurements: ['bust', 'waist', 'hip', 'fullLength', 'sleeveLength', 'neckDepth'],
    previewType: 'kurta',
    fabricNote: 'Ethnic kurta with mandarin collar and long flowing silhouette.',
  },
  BLOUSE: {
    patternType: 'blouse',
    measurements: ['bust', 'waist', 'fullLength', 'armholeDepth', 'sleeveLength'],
    previewType: 'blouse',
    fabricNote: 'Fitted bodice pattern with sculpted neckline and princess seam shaping.',
  },
  SHIRT: {
    patternType: 'shirt',
    measurements: ['bust', 'shoulderWidth', 'fullLength', 'sleeveLength', 'neckWidth'],
    previewType: 'shirt',
    fabricNote: 'Structured shirt front, collar points and controlled sleeve geometry.',
  },
  PANT: {
    patternType: 'pant',
    measurements: ['waist', 'hip', 'outseam', 'inseam', 'thighCircumference'],
    previewType: 'pant',
    fabricNote: 'Tapered trouser with waistband, inseam and leg opening geometry.',
  },
  TSHIRT: {
    patternType: 'tshirt',
    measurements: ['bust', 'shoulderWidth', 'fullLength', 'sleeveLength', 'neckWidth'],
    previewType: 'tshirt',
    fabricNote: 'Relaxed tee body, body length and sleeve shape with round neckline.',
  },
  CHUDIDAR: {
    patternType: 'chudidar',
    measurements: ['waist', 'hip', 'outseam', 'inseam', 'bottomWidth'],
    previewType: 'chudidar',
    fabricNote: 'Bias-cut salwar with tapered leg and gathered ankle flow.',
  },
  SKIRT: {
    patternType: 'skirt',
    measurements: ['waist', 'hip', 'fullLength', 'bottomWidth', 'flare'],
    previewType: 'skirt',
    fabricNote: 'A-line skirt with flare sweep and balanced waist-to-hem expansion.',
  },
  KIDS: {
    patternType: 'kids',
    measurements: ['bust', 'waist', 'fullLength', 'shoulderWidth'],
    previewType: 'kids',
    fabricNote: 'Child-friendly playwear geometry with relaxed ease and soft seam profile.',
  },
};

const createPatternData = (
  outline: string,
  points: PatternPoint[],
  constructionLines: ConstructionLine[],
  annotations: MeasurementAnnotation[],
  width: number,
  height: number
): PatternData => ({
  outlinePath: outline,
  points,
  constructionLines,
  annotations,
  bounds: { width, height },
});

function calculateTShirtPattern(m: Measurements, scale: number): PatternData {
  const margin = px(1.5, scale);
  const originX = 32;
  const originY = 24;
  const halfChest = (m.bust + m.ease) / 4;
  const halfShoulder = m.shoulderWidth || 3.2;
  const xCF = originX;
  const xNeck = xCF + px((m.neckWidth || 3) / 2, scale);
  const xShoulder = xCF + px(halfShoulder, scale);
  const xChest = xCF + px(halfChest, scale);
  const yTop = originY;
  const yNeck = originY + px(m.neckDepth || 1.2, scale);
  const yArm = originY + px(m.armholeDepth || 6.25, scale);
  const yHem = originY + px(m.fullLength || 26, scale);
  const ySleeve = yTop + px(3.5, scale);

  const A: Point = { x: xCF, y: yTop };
  const B: Point = { x: xNeck, y: yTop };
  const C: Point = { x: xShoulder, y: ySleeve };
  const D: Point = { x: xChest, y: yArm };
  const E: Point = { x: xChest * 0.9, y: yHem };
  const F: Point = { x: xCF, y: yHem };

  const outline = [
    `M ${A.x} ${A.y}`,
    qBez(xCF + px(1.2, scale), yNeck, B.x, B.y),
    `L ${C.x} ${C.y}`,
    cBez(xShoulder + px(1.1, scale), ySleeve + px(1.8, scale), xChest - px(0.6, scale), yArm - px(1.8, scale), D.x, D.y),
    qBez(D.x + px(1.5, scale), yArm + px(1.2, scale), E.x, yHem * 0.6),
    `L ${E.x} ${yHem}`,
    `L ${F.x} ${F.y}`,
    `L ${A.x} ${A.y}`,
    'Z',
  ].join(' ');

  const points: PatternPoint[] = [
    { label: 'A', point: A, description: 'CF neck top' },
    { label: 'B', point: B, description: 'Neck width' },
    { label: 'C', point: C, description: 'Shoulder seam' },
    { label: 'D', point: D, description: 'Armhole / chest' },
    { label: 'E', point: E, description: 'Body side seam' },
    { label: 'F', point: F, description: 'Hem fold' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: xCF, y: yArm }, to: { x: xChest, y: yArm }, dashed: true },
    { from: { x: xCF, y: yTop }, to: { x: xShoulder, y: yTop }, dashed: true },
    { from: { x: xCF, y: yTop }, to: { x: xCF, y: yHem }, dashed: true },
  ];

  const annotations: MeasurementAnnotation[] = [
    { from: { x: xCF - margin, y: yTop }, to: { x: xCF - margin, y: yHem }, label: `${m.fullLength || 26}"`, direction: 'vertical' },
    { from: { x: xCF, y: yTop - margin }, to: { x: xShoulder, y: yTop - margin }, label: `${m.shoulderWidth || 3.2}"`, direction: 'horizontal' },
    { from: { x: xCF, y: yArm + margin }, to: { x: xChest, y: yArm + margin }, label: `${((m.bust + m.ease) / 4).toFixed(1)}"`, direction: 'horizontal' },
  ];

  return createPatternData(outline, points, constructionLines, annotations, xChest + px(4, scale), yHem + px(2, scale));
}

function calculateShirtPattern(m: Measurements, scale: number): PatternData {
  const margin = px(1.5, scale);
  const originX = 36;
  const originY = 30;
  const halfChest = (m.bust + m.ease) / 4;
  const xCF = originX;
  const xNeck = xCF + px((m.neckWidth || 3.5) / 2, scale);
  const xShoulder = xCF + px((m.shoulderWidth || 3.8), scale);
  const xChest = xCF + px(halfChest, scale);
  const yTop = originY;
  const yNeck = yTop + px(m.neckDepth || 1.2, scale);
  const yArm = yTop + px(m.armholeDepth || 7.2, scale);
  const yHem = yTop + px(m.fullLength || 30, scale);

  const A: Point = { x: xCF, y: yTop };
  const B: Point = { x: xNeck, y: yTop };
  const C: Point = { x: xShoulder, y: yTop + px(1.2, scale) };
  const D: Point = { x: xChest, y: yArm };
  const E: Point = { x: xChest - px(1.4, scale), y: yHem * 0.7 };
  const F: Point = { x: xCF, y: yHem };

  const outline = [
    `M ${A.x} ${A.y}`,
    qBez(xCF + px(1.4, scale), yNeck, B.x, B.y),
    `L ${C.x} ${C.y}`,
    cBez(xShoulder + px(1.2, scale), yTop + px(2.5, scale), xChest - px(1.2, scale), yArm - px(0.8, scale), D.x, D.y),
    qBez(D.x + px(1.5, scale), yArm + px(2.4, scale), E.x, yHem * 0.7),
    `L ${E.x} ${yHem}`,
    `L ${F.x} ${F.y}`,
    `L ${A.x} ${A.y}`,
    'Z',
  ].join(' ');

  const points: PatternPoint[] = [
    { label: 'A', point: A, description: 'CF collar top' },
    { label: 'B', point: B, description: 'Collar spread' },
    { label: 'C', point: C, description: 'Shoulder seam' },
    { label: 'D', point: D, description: 'Armhole / chest' },
    { label: 'E', point: E, description: 'Side seam' },
    { label: 'F', point: F, description: 'Hem fold' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: xCF, y: yArm }, to: { x: xChest, y: yArm }, dashed: true },
    { from: { x: xCF, y: yTop }, to: { x: xShoulder, y: yTop }, dashed: true },
    { from: { x: xCF, y: yTop }, to: { x: xCF, y: yHem }, dashed: true },
  ];

  const annotations: MeasurementAnnotation[] = [
    { from: { x: xCF - margin, y: yTop }, to: { x: xCF - margin, y: yHem }, label: `${m.fullLength || 30}"`, direction: 'vertical' },
    { from: { x: xCF, y: yTop - margin }, to: { x: xShoulder, y: yTop - margin }, label: `${m.shoulderWidth || 3.8}"`, direction: 'horizontal' },
    { from: { x: xCF, y: yArm + margin }, to: { x: xChest, y: yArm + margin }, label: `${((m.bust + m.ease) / 4).toFixed(1)}"`, direction: 'horizontal' },
    { from: { x: xCF + px(1.2, scale), y: yTop - margin * 0.5 }, to: { x: xNeck, y: yTop - margin * 0.5 }, label: `${(m.neckWidth || 3.5) / 2}"`, direction: 'horizontal' },
  ];

  return createPatternData(outline, points, constructionLines, annotations, xChest + px(5, scale), yHem + px(2, scale));
}

function calculatePantPattern(m: Measurements, scale: number): PatternData {
  const margin = px(1.8, scale);
  const xCF = 42;
  const yTop = 42;
  const yWaist = yTop + px(1.6, scale);
  const yHip = yTop + px(8, scale);
  const yInseam = yTop + px(m.outseam || 40, scale);
  const halfWaist = (m.waist + m.ease) / 4;
  const halfHip = (m.hip + m.ease) / 4;
  const xWaist = xCF + px(halfWaist, scale);
  const xHip = xCF + px(halfHip, scale);
  const xKnee = xCF + px((m.thighCircumference || 22) / 4, scale);
  const xBottom = xCF + px((m.bottomWidth || 9) / 2, scale);

  const A: Point = { x: xCF, y: yTop };
  const B: Point = { x: xWaist, y: yWaist };
  const C: Point = { x: xHip, y: yHip };
  const D: Point = { x: xKnee, y: yTop + px(20, scale) };
  const E: Point = { x: xBottom, y: yInseam };
  const F: Point = { x: xCF, y: yInseam };

  const outline = [
    `M ${A.x} ${A.y}`,
    `L ${B.x} ${B.y}`,
    cBez(xHip + px(1.4, scale), yHip + px(2.2, scale), xKnee + px(1.4, scale), yTop + px(24, scale), D.x, D.y),
    `L ${E.x} ${E.y}`,
    `L ${F.x} ${F.y}`,
    `L ${A.x} ${A.y}`,
    'Z',
  ].join(' ');

  const points: PatternPoint[] = [
    { label: 'A', point: A, description: 'Waist front' },
    { label: 'B', point: B, description: 'Waist side' },
    { label: 'C', point: C, description: 'Hip line' },
    { label: 'D', point: D, description: 'Knee / taper' },
    { label: 'E', point: E, description: 'Hem opening' },
    { label: 'F', point: F, description: 'Inseam fold' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: xCF, y: yWaist }, to: { x: xWaist, y: yWaist }, dashed: true },
    { from: { x: xCF, y: yHip }, to: { x: xHip, y: yHip }, dashed: true },
    { from: { x: xCF, y: yTop }, to: { x: xCF, y: yInseam }, dashed: true },
  ];

  const annotations: MeasurementAnnotation[] = [
    { from: { x: xCF - margin, y: yTop }, to: { x: xCF - margin, y: yInseam }, label: `${m.outseam || 40}"`, direction: 'vertical' },
    { from: { x: xCF, y: yWaist - margin }, to: { x: xWaist, y: yWaist - margin }, label: `${((m.waist + m.ease) / 4).toFixed(1)}"`, direction: 'horizontal' },
    { from: { x: xCF, y: yHip + margin }, to: { x: xHip, y: yHip + margin }, label: `${((m.hip + m.ease) / 4).toFixed(1)}"`, direction: 'horizontal' },
  ];

  return createPatternData(outline, points, constructionLines, annotations, xHip + px(3.8, scale), yInseam + px(2.5, scale));
}

function calculateKurtaPattern(m: Measurements, scale: number): PatternData {
  const margin = px(1.6, scale);
  const originX = 36;
  const yTop = 28;
  const xCF = originX;
  const xNeck = xCF + px((m.neckWidth || 3.4) / 2, scale);
  const xShoulder = xCF + px((m.shoulderWidth || 3.8), scale);
  const xChest = xCF + px(((m.bust + m.ease) / 4), scale);
  const yArm = yTop + px(m.armholeDepth || 6.8, scale);
  const yHem = yTop + px(m.fullLength || 42, scale);

  const A: Point = { x: xCF, y: yTop };
  const B: Point = { x: xNeck, y: yTop };
  const C: Point = { x: xShoulder, y: yTop + px(1.3, scale) };
  const D: Point = { x: xChest, y: yArm };
  const E: Point = { x: xChest * 0.9, y: yHem };
  const F: Point = { x: xCF, y: yHem };

  const outline = [
    `M ${A.x} ${A.y}`,
    qBez(xCF + px(1.8, scale), yTop + px(1.4, scale), B.x, B.y),
    `L ${C.x} ${C.y}`,
    cBez(xShoulder + px(1.1, scale), yTop + px(2.6, scale), xChest - px(1, scale), yArm - px(1.4, scale), D.x, D.y),
    qBez(D.x + px(1.3, scale), yArm + px(2.2, scale), E.x, yHem * 0.8),
    `L ${E.x} ${yHem}`,
    `L ${F.x} ${F.y}`,
    `L ${A.x} ${A.y}`,
    'Z',
  ].join(' ');

  const points: PatternPoint[] = [
    { label: 'A', point: A, description: 'CF neck top' },
    { label: 'B', point: B, description: 'Neck curve' },
    { label: 'C', point: C, description: 'Shoulder slope' },
    { label: 'D', point: D, description: 'Armhole / chest' },
    { label: 'E', point: E, description: 'Lower side edge' },
    { label: 'F', point: F, description: 'Hem fold' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: xCF, y: yArm }, to: { x: xChest, y: yArm }, dashed: true },
    { from: { x: xCF, y: yTop }, to: { x: xShoulder, y: yTop }, dashed: true },
    { from: { x: xCF, y: yTop }, to: { x: xCF, y: yHem }, dashed: true },
  ];

  const annotations: MeasurementAnnotation[] = [
    { from: { x: xCF - margin, y: yTop }, to: { x: xCF - margin, y: yHem }, label: `${m.fullLength || 42}"`, direction: 'vertical' },
    { from: { x: xCF, y: yTop - margin }, to: { x: xShoulder, y: yTop - margin }, label: `${m.shoulderWidth || 3.8}"`, direction: 'horizontal' },
    { from: { x: xCF, y: yArm + margin }, to: { x: xChest, y: yArm + margin }, label: `${((m.bust + m.ease) / 4).toFixed(1)}"`, direction: 'horizontal' },
  ];

  return createPatternData(outline, points, constructionLines, annotations, xChest + px(5, scale), yHem + px(2, scale));
}

function calculateBlousePattern(m: Measurements, scale: number): PatternData {
  const margin = px(1.5, scale);
  const xCF = 40;
  const xNeck = xCF + px((m.neckWidth || 3.2) / 2, scale);
  const xShoulder = xCF + px((m.shoulderWidth || 3.4), scale);
  const xChest = xCF + px(((m.bust + m.ease) / 4), scale);
  const yTop = 28;
  const yNeck = yTop + px(m.neckDepth || 2.2, scale);
  const yArm = yTop + px(m.armholeDepth || 7.2, scale);
  const yHem = yTop + px(m.fullLength || 15, scale);

  const A: Point = { x: xCF, y: yTop };
  const B: Point = { x: xNeck, y: yTop };
  const C: Point = { x: xShoulder, y: yTop + px(1.5, scale) };
  const D: Point = { x: xChest, y: yArm };
  const E: Point = { x: xChest * 0.85, y: yHem };
  const F: Point = { x: xCF, y: yHem };

  const outline = [
    `M ${A.x} ${A.y}`,
    qBez(xCF + px(1.8, scale), yNeck, B.x, B.y),
    `L ${C.x} ${C.y}`,
    cBez(xShoulder + px(1.2, scale), yTop + px(2.8, scale), xChest - px(1.2, scale), yArm - px(1.5, scale), D.x, D.y),
    qBez(D.x + px(1.4, scale), yArm + px(2.8, scale), E.x, yHem * 0.7),
    `L ${E.x} ${yHem}`,
    `L ${F.x} ${F.y}`,
    `L ${A.x} ${A.y}`,
    'Z',
  ].join(' ');

  const points: PatternPoint[] = [
    { label: 'A', point: A, description: 'CF neckline' },
    { label: 'B', point: B, description: 'Neck width' },
    { label: 'C', point: C, description: 'Shoulder' },
    { label: 'D', point: D, description: 'Armhole / bust' },
    { label: 'E', point: E, description: 'Blouse side' },
    { label: 'F', point: F, description: 'Hem fold' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: xCF, y: yArm }, to: { x: xChest, y: yArm }, dashed: true },
    { from: { x: xCF, y: yTop }, to: { x: xShoulder, y: yTop }, dashed: true },
    { from: { x: xCF, y: yTop }, to: { x: xCF, y: yHem }, dashed: true },
  ];

  const annotations: MeasurementAnnotation[] = [
    { from: { x: xCF - margin, y: yTop }, to: { x: xCF - margin, y: yHem }, label: `${m.fullLength || 15}"`, direction: 'vertical' },
    { from: { x: xCF, y: yTop - margin }, to: { x: xShoulder, y: yTop - margin }, label: `${m.shoulderWidth || 3.4}"`, direction: 'horizontal' },
    { from: { x: xCF, y: yArm + margin }, to: { x: xChest, y: yArm + margin }, label: `${((m.bust + m.ease) / 4).toFixed(1)}"`, direction: 'horizontal' },
  ];

  return createPatternData(outline, points, constructionLines, annotations, xChest + px(4.6, scale), yHem + px(2, scale));
}

function calculateChudidarPattern(m: Measurements, scale: number): PatternData {
  const margin = px(1.7, scale);
  const xCF = 50;
  const yTop = 36;
  const yWaist = yTop + px(1.6, scale);
  const yHip = yTop + px(8, scale);
  const yInseam = yTop + px(m.outseam || 42, scale);
  const halfWaist = (m.waist + m.ease) / 4;
  const halfHip = (m.hip + m.ease) / 4;
  const xWaist = xCF + px(halfWaist, scale);
  const xHip = xCF + px(halfHip, scale);
  const xAnkle = xCF + px((m.bottomWidth || 8) / 2, scale);

  const A: Point = { x: xCF, y: yTop };
  const B: Point = { x: xWaist, y: yWaist };
  const C: Point = { x: xHip, y: yHip };
  const D: Point = { x: xAnkle, y: yInseam };
  const E: Point = { x: xCF, y: yInseam };

  const outline = [
    `M ${A.x} ${A.y}`,
    `L ${B.x} ${B.y}`,
    cBez(xHip + px(1.5, scale), yHip + px(2.6, scale), xAnkle + px(1.8, scale), yInseam - px(3, scale), D.x, D.y),
    `L ${E.x} ${E.y}`,
    `L ${A.x} ${A.y}`,
    'Z',
  ].join(' ');

  const points: PatternPoint[] = [
    { label: 'A', point: A, description: 'Waist top' },
    { label: 'B', point: B, description: 'Waist side' },
    { label: 'C', point: C, description: 'Hip line' },
    { label: 'D', point: D, description: 'Ankle opening' },
    { label: 'E', point: E, description: 'Inseam fold' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: xCF, y: yWaist }, to: { x: xWaist, y: yWaist }, dashed: true },
    { from: { x: xCF, y: yHip }, to: { x: xHip, y: yHip }, dashed: true },
    { from: { x: xCF, y: yTop }, to: { x: xCF, y: yInseam }, dashed: true },
  ];

  const annotations: MeasurementAnnotation[] = [
    { from: { x: xCF - margin, y: yTop }, to: { x: xCF - margin, y: yInseam }, label: `${m.outseam || 42}"`, direction: 'vertical' },
    { from: { x: xCF, y: yWaist - margin }, to: { x: xWaist, y: yWaist - margin }, label: `${((m.waist + m.ease) / 4).toFixed(1)}"`, direction: 'horizontal' },
    { from: { x: xCF, y: yHip + margin }, to: { x: xHip, y: yHip + margin }, label: `${((m.hip + m.ease) / 4).toFixed(1)}"`, direction: 'horizontal' },
  ];

  return createPatternData(outline, points, constructionLines, annotations, xHip + px(5, scale), yInseam + px(2.6, scale));
}

function calculateSkirtPattern(m: Measurements, scale: number): PatternData {
  const margin = px(1.5, scale);
  const xCF = 46;
  const yTop = 34;
  const yWaist = yTop + px(1.2, scale);
  const yHem = yTop + px(m.fullLength || 36, scale);
  const halfWaist = (m.waist + m.ease) / 4;
  const halfHip = (m.hip + m.ease) / 4;
  const xWaist = xCF + px(halfWaist, scale);
  const xHip = xCF + px(halfHip, scale);
  const xHem = xCF + px((m.bottomWidth || 34) / 2, scale);

  const A: Point = { x: xCF, y: yTop };
  const B: Point = { x: xWaist, y: yWaist };
  const C: Point = { x: xHip, y: yTop + px(10, scale) };
  const D: Point = { x: xHem, y: yHem };
  const E: Point = { x: xCF, y: yHem };

  const outline = [
    `M ${A.x} ${A.y}`,
    `L ${B.x} ${B.y}`,
    cBez(xHip + px(1.8, scale), yTop + px(12, scale), xHem - px(1.4, scale), yHem - px(8, scale), D.x, D.y),
    `L ${E.x} ${E.y}`,
    `L ${A.x} ${A.y}`,
    'Z',
  ].join(' ');

  const points: PatternPoint[] = [
    { label: 'A', point: A, description: 'Waist top' },
    { label: 'B', point: B, description: 'Waist side' },
    { label: 'C', point: C, description: 'Hip line' },
    { label: 'D', point: D, description: 'Hem flare' },
    { label: 'E', point: E, description: 'Centre front hem' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: xCF, y: yWaist }, to: { x: xWaist, y: yWaist }, dashed: true },
    { from: { x: xCF, y: yTop + px(10, scale) }, to: { x: xHip, y: yTop + px(10, scale) }, dashed: true },
    { from: { x: xCF, y: yTop }, to: { x: xCF, y: yHem }, dashed: true },
  ];

  const annotations: MeasurementAnnotation[] = [
    { from: { x: xCF - margin, y: yTop }, to: { x: xCF - margin, y: yHem }, label: `${m.fullLength || 36}"`, direction: 'vertical' },
    { from: { x: xCF, y: yWaist - margin }, to: { x: xWaist, y: yWaist - margin }, label: `${((m.waist + m.ease) / 4).toFixed(1)}"`, direction: 'horizontal' },
    { from: { x: xCF, y: yTop + px(10, scale) + margin }, to: { x: xHip, y: yTop + px(10, scale) + margin }, label: `${((m.hip + m.ease) / 4).toFixed(1)}"`, direction: 'horizontal' },
  ];

  return createPatternData(outline, points, constructionLines, annotations, xHem + px(4, scale), yHem + px(2.5, scale));
}

function calculateKurtiPattern(m: Measurements, scale: number): PatternData {
  return calculateKurtaPattern(m, scale);
}

function calculateKidsPattern(m: Measurements, scale: number): PatternData {
  const margin = px(1.5, scale);
  const xCF = 40;
  const xNeck = xCF + px((m.neckWidth || 2.4) / 2, scale);
  const xShoulder = xCF + px((m.shoulderWidth || 2.6), scale);
  const xChest = xCF + px(((m.bust + m.ease) / 4), scale);
  const yTop = 26;
  const yNeck = yTop + px(m.neckDepth || 1.1, scale);
  const yArm = yTop + px(m.armholeDepth || 5.4, scale);
  const yHem = yTop + px(m.fullLength || 22, scale);

  const A: Point = { x: xCF, y: yTop };
  const B: Point = { x: xNeck, y: yTop };
  const C: Point = { x: xShoulder, y: yTop + px(1.1, scale) };
  const D: Point = { x: xChest, y: yArm };
  const E: Point = { x: xChest * 0.86, y: yHem };
  const F: Point = { x: xCF, y: yHem };

  const outline = [
    `M ${A.x} ${A.y}`,
    qBez(xCF + px(1.5, scale), yNeck, B.x, B.y),
    `L ${C.x} ${C.y}`,
    cBez(xShoulder + px(1.1, scale), yTop + px(2.2, scale), xChest - px(0.8, scale), yArm - px(1.2, scale), D.x, D.y),
    qBez(D.x + px(1.2, scale), yArm + px(2.1, scale), E.x, yHem * 0.7),
    `L ${E.x} ${yHem}`,
    `L ${F.x} ${F.y}`,
    `L ${A.x} ${A.y}`,
    'Z',
  ].join(' ');

  const points: PatternPoint[] = [
    { label: 'A', point: A, description: 'CF neck top' },
    { label: 'B', point: B, description: 'Neck width' },
    { label: 'C', point: C, description: 'Shoulder seam' },
    { label: 'D', point: D, description: 'Armhole / chest' },
    { label: 'E', point: E, description: 'Side contour' },
    { label: 'F', point: F, description: 'Hem fold' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: xCF, y: yArm }, to: { x: xChest, y: yArm }, dashed: true },
    { from: { x: xCF, y: yTop }, to: { x: xShoulder, y: yTop }, dashed: true },
    { from: { x: xCF, y: yTop }, to: { x: xCF, y: yHem }, dashed: true },
  ];

  const annotations: MeasurementAnnotation[] = [
    { from: { x: xCF - margin, y: yTop }, to: { x: xCF - margin, y: yHem }, label: `${m.fullLength || 22}"`, direction: 'vertical' },
    { from: { x: xCF, y: yTop - margin }, to: { x: xShoulder, y: yTop - margin }, label: `${m.shoulderWidth || 2.6}"`, direction: 'horizontal' },
    { from: { x: xCF, y: yArm + margin }, to: { x: xChest, y: yArm + margin }, label: `${((m.bust + m.ease) / 4).toFixed(1)}"`, direction: 'horizontal' },
  ];

  return createPatternData(outline, points, constructionLines, annotations, xChest + px(4.2, scale), yHem + px(2.2, scale));
}

export interface PatternDefinition {
  id: PatternType;
  label: string;
  description: string;
  defaultMeasurements: Measurements;
  calculate: (measurements: Measurements, scale: number) => PatternData;
}

export const PATTERN_REGISTRY: Record<string, PatternDefinition> = {
  ONE_PIECE: {
    id: 'ONE_PIECE',
    label: 'One-Piece Dress / Frock',
    description: 'Classic one-piece dress with fitted bodice and flared skirt',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateOnePieceDress,
  },
  FROCK: {
    id: 'FROCK',
    label: 'One-Piece Flared Frock',
    description: 'Flared umbrella silhouette with bodice darts',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateOnePieceDress,
  },
  KURTI: {
    id: 'KURTI',
    label: 'Traditional Kurti',
    description: 'Traditional straight-cut kurti with side slit draft',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateKurtiPattern,
  },
  KURTA: {
    id: 'KURTA',
    label: 'Ethnic Kurta',
    description: 'Bespoke kurta with side slit margins',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateKurtaPattern,
  },
  BLOUSE: {
    id: 'BLOUSE',
    label: 'Fitted Saree Blouse',
    description: 'Form-fitting saree blouse draft with neckline contour',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateBlousePattern,
  },
  SHIRT: {
    id: 'SHIRT',
    label: 'Formal / Casual Shirt',
    description: 'Classic shirt pattern with yoke slope and armhole curve',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateShirtPattern,
  },
  PANT: {
    id: 'PANT',
    label: 'Trouser / Formal Pant',
    description: 'Trouser leg draft with crotch curve and waistband',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculatePantPattern,
  },
  TSHIRT: {
    id: 'TSHIRT',
    label: 'Round Neck T-Shirt',
    description: 'Comfort casual tee with drop shoulder and round neck curve',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateTShirtPattern,
  },
  CHUDIDAR: {
    id: 'CHUDIDAR',
    label: 'Chudidar / Salwar',
    description: 'Bias-cut leg panel with gathered ankle churis',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateChudidarPattern,
  },
  SKIRT: {
    id: 'SKIRT',
    label: 'A-Line / Flared Skirt',
    description: 'A-line flared skirt with waist arc',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateSkirtPattern,
  },
  KIDS: {
    id: 'KIDS',
    label: "Kids' Wear",
    description: "Children's garment draft",
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateKidsPattern,
  },
};

export const PATTERN_TYPES: PatternType[] = [
  'ONE_PIECE',
  'SHIRT',
  'PANT',
  'TSHIRT',
  'KURTA',
  'BLOUSE',
  'CHUDIDAR',
  'SKIRT',
  'KURTI',
  'KIDS',
];
