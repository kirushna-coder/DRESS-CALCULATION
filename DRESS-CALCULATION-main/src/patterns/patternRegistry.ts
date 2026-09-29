// ============================================================
// SmartTailor AI – Pattern Registry
// Maps DressType & PatternType -> calculation functions
// ============================================================

import type {
  ConstructionLine,
  MeasurementAnnotation,
  Measurements,
  PatternData,
  PatternPiece,
  PatternPoint,
  Point,
  PatternType,
  PantOptions,
} from '../types';
import {
  calculateOnePieceDress,
  DEFAULT_MEASUREMENTS as ONE_PIECE_DEFAULTS,
} from '../calculations/onePieceDress';

import {
  createFrontNecklineSegment,
  createBackNecklineSegment,
  createArmholePathSegment,
  createSleeveCapPathSegments,
  createHipSeamPathSegment,
  createInseamPathSegment,
  createCrotchPathSegment,
  createCurvedWaistbandPath,
} from '../utils/curveUtils';

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
  patternType: 'tshirt' | 'shirt' | 'pant' | 'kurta' | 'blouse' | 'chudidar' | 'skirt' | 'kurti' | 'kids' | 'frock' | 'jacket' | 'top';
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
    fabricNote: 'Trouser front/back panels with crotch curves and waistband piece.',
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
  JACKET: {
    patternType: 'jacket',
    measurements: ['bust', 'waist', 'hip', 'fullLength', 'shoulderWidth', 'sleeveLength'],
    previewType: 'jacket',
    fabricNote: 'Structured jacket with princess seams, lapel, and set-in sleeve.',
  },
  TOP: {
    patternType: 'top',
    measurements: ['bust', 'waist', 'fullLength', 'shoulderWidth', 'neckWidth'],
    previewType: 'top',
    fabricNote: 'Relaxed-fit top with curved hem and simple armhole shaping.',
  },
};



function calculateTShirtPattern(m: Measurements, scale: number): PatternData {
  const halfChest     = (m.bust + (m.ease || 2)) / 4;
  const halfShoulder  = m.shoulderWidth || 3.5;
  const neckW         = (m.neckWidth || 3) / 2;
  const neckD         = m.neckDepth || 3;
  const armD          = m.armholeDepth || 7;
  const len           = m.fullLength || 26;
  const sleeveL       = m.sleeveLength || 7.5;

  const gap = px(3, scale);
  const originX = 36;
  const originY = 30;

  // Front Tee Piece
  const fX0 = originX;
  const fY0 = originY;
  const fCF = fX0;
  const fNeck = fCF + px(neckW, scale);
  const fSh = fCF + px(halfShoulder, scale);
  const fChest = fCF + px(halfChest, scale);
  const fHem = fCF + px(halfChest * 0.96, scale);

  const fArmY = fY0 + px(armD, scale);
  const fHemY = fY0 + px(len, scale);
  const fShY = fY0 + px(1.0, scale);
  const fNeckDipY = fY0 + px(neckD, scale);

  const frontPath = [
    `M ${fCF} ${fNeckDipY}`,
    createFrontNecklineSegment(fCF, fNeckDipY, fNeck, fY0),
    `L ${fSh} ${fShY}`,
    createArmholePathSegment(fSh, fShY, fChest, fArmY, px(armD, scale), true),
    cBez(fChest - px(0.25, scale), fArmY + (fHemY - fArmY) * 0.45, fHem + px(0.15, scale), fHemY - (fHemY - fArmY) * 0.2, fHem, fHemY),
    `L ${fCF} ${fHemY}`,
    `L ${fCF} ${fNeckDipY}`,
    'Z',
  ].join(' ');

  // Back Tee Piece
  const bX0 = fX0 + px(halfChest, scale) + gap;
  const bY0 = originY;
  const bCB = bX0;
  const bNeck = bCB + px(neckW, scale);
  const bSh = bCB + px(halfShoulder, scale);
  const bChest = bCB + px(halfChest, scale);
  const bHem = bCB + px(halfChest * 0.96, scale);
  const bNeckDipY = bY0 + px(1.2, scale);

  const backPath = [
    `M ${bCB} ${bNeckDipY}`,
    createBackNecklineSegment(bCB, bNeckDipY, bNeck, bY0),
    `L ${bSh} ${fShY}`,
    createArmholePathSegment(bSh, fShY, bChest, fArmY, px(armD, scale), false),
    cBez(bChest - px(0.25, scale), fArmY + (fHemY - fArmY) * 0.45, bHem + px(0.15, scale), fHemY - (fHemY - fArmY) * 0.2, bHem, fHemY),
    `L ${bCB} ${fHemY}`,
    `L ${bCB} ${bNeckDipY}`,
    'Z',
  ].join(' ');

  // Sleeve Piece (S-curve cap)
  const slX0 = bX0 + px(halfChest, scale) + gap;
  const slY0 = originY;
  const slWidth = px(armD * 2, scale);
  const slCapH = px(armD * 0.55, scale);
  const slLen = px(sleeveL, scale);
  const slMidX = slX0 + slWidth / 2;

  const caps = createSleeveCapPathSegments(slX0, slY0 + slCapH, slMidX, slY0, slX0 + slWidth, slY0 + slCapH, slCapH);

  const sleevePath = [
    `M ${slX0} ${slY0 + slCapH}`,
    caps.leftCap,
    caps.rightCap,
    `L ${slX0 + slWidth * 0.85} ${slY0 + slLen}`,
    `L ${slX0 + slWidth * 0.15} ${slY0 + slLen}`,
    `L ${slX0} ${slY0 + slCapH}`,
    'Z',
  ].join(' ');

  // Neckband Piece (Contoured)
  const nbX0 = originX;
  const nbY0 = fY0 + px(len, scale) + gap;
  const nbLen = px(neckW * 3.14 * 2, scale);
  const nbH = px(1.2, scale);

  const neckbandPath = createCurvedWaistbandPath(nbX0, nbY0, nbLen, nbH, px(0.3, scale));

  const pieces: PatternPiece[] = [
    {
      id: 'front_tee',
      label: 'FRONT TEE',
      subLabel: '(Cut 1 on fold)',
      path: frontPath,
      fillTint: 'rgba(79, 70, 229, 0.08)',
      strokeColor: '#4F46E5',
      labelCx: fCF + px(halfChest * 0.5, scale),
      labelCy: fY0 + px(len * 0.4, scale),
      grainCx: fCF + px(halfChest * 0.5, scale),
      grainCy: fY0 + px(len * 0.6, scale),
      grainLen: px(4, scale),
    },
    {
      id: 'back_tee',
      label: 'BACK TEE',
      subLabel: '(Cut 1 on fold)',
      path: backPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB + px(halfChest * 0.5, scale),
      labelCy: bY0 + px(len * 0.4, scale),
      grainCx: bCB + px(halfChest * 0.5, scale),
      grainCy: bY0 + px(len * 0.6, scale),
      grainLen: px(4, scale),
    },
    {
      id: 'sleeve',
      label: 'SLEEVE',
      subLabel: '(Cut 2 pair)',
      path: sleevePath,
      fillTint: 'rgba(217, 119, 6, 0.08)',
      strokeColor: '#D97706',
      labelCx: slMidX,
      labelCy: slY0 + slCapH + px(1.5, scale),
      grainCx: slMidX,
      grainCy: slY0 + slCapH + px(3.5, scale),
      grainLen: px(3, scale),
    },
    {
      id: 'neckband',
      label: 'NECKBAND RIB',
      subLabel: '(Cut 1)',
      path: neckbandPath,
      fillTint: 'rgba(124, 58, 237, 0.08)',
      strokeColor: '#7C3AED',
      labelCx: nbX0 + nbLen / 2,
      labelCy: nbY0 + nbH / 2 + 3,
    },
  ];

  const outline = [frontPath, backPath, sleevePath, neckbandPath].join(' ');
  const points: PatternPoint[] = [
    { label: 'F-A', point: { x: fCF, y: fNeckDipY }, description: 'Front neck CF' },
    { label: 'B-A', point: { x: bCB, y: bNeckDipY }, description: 'Back neck CB' },
    { label: 'S-A', point: { x: slMidX, y: slY0 }, description: 'Sleeve cap top' },
  ];
  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF, y: fArmY }, to: { x: fChest, y: fArmY }, dashed: true },
    { from: { x: bCB, y: fArmY }, to: { x: bChest, y: fArmY }, dashed: true },
  ];
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fCF, y: fY0 - px(1, scale) }, to: { x: fChest, y: fY0 - px(1, scale) }, label: `Chest: ${(halfChest * 4).toFixed(0)}"`, direction: 'horizontal' },
    { from: { x: fCF - px(1, scale), y: fY0 }, to: { x: fCF - px(1, scale), y: fHemY }, label: `Length: ${len}"`, direction: 'vertical' },
  ];

  return { outlinePath: outline, pieces, points, constructionLines, annotations, bounds: { width: slX0 + slWidth + px(4, scale), height: nbY0 + nbH + px(4, scale) } };
}

function calculateShirtPattern(m: Measurements, scale: number): PatternData {
  const halfChest     = (m.bust + (m.ease || 2)) / 4;
  const halfShoulder  = m.shoulderWidth || 3.8;
  const neckW         = (m.neckWidth || 3.2) / 2;
  const armD          = m.armholeDepth || 7.5;
  const len           = m.fullLength || 29;
  const sleeveL       = m.sleeveLength || 24;

  const gap = px(3, scale);
  const originX = 36;
  const originY = 30;

  // Front Shirt Piece
  const fX0 = originX;
  const fY0 = originY;
  const fPlacket = px(1.2, scale); // button placket
  const fCF = fX0 + fPlacket;
  const fNeck = fCF + px(neckW, scale);
  const fSh = fCF + px(halfShoulder, scale);
  const fChest = fCF + px(halfChest, scale);
  const fHemY = fY0 + px(len, scale);
  const fArmY = fY0 + px(armD, scale);
  const fShY = fY0 + px(1.2, scale);
  const fNeckDipY = fY0 + px(neckW * 0.8, scale);

  const frontPath = [
    `M ${fX0} ${fY0}`, // placket outer top
    `L ${fCF} ${fY0}`,
    `L ${fCF} ${fNeckDipY}`,
    createFrontNecklineSegment(fCF, fNeckDipY, fNeck, fY0),
    `L ${fSh} ${fShY}`,
    createArmholePathSegment(fSh, fShY, fChest, fArmY, px(armD, scale), true),
    cBez(fChest - px(0.3, scale), fArmY + (fHemY - fArmY) * 0.45, fChest * 0.98, fHemY - px(2.5, scale), fChest * 0.94, fHemY - px(1.2, scale)),
    cBez(fChest * 0.86, fHemY + px(0.4, scale), fCF + px(neckW * 0.6, scale), fHemY, fCF, fHemY),
    `L ${fX0} ${fHemY}`,
    `L ${fX0} ${fY0}`,
    'Z',
  ].join(' ');

  // Back Shirt Piece
  const bX0 = fX0 + px(halfChest, scale) + fPlacket + gap;
  const bY0 = originY;
  const bCB = bX0;
  const bNeck = bCB + px(neckW, scale);
  const bSh = bCB + px(halfShoulder, scale);
  const bChest = bCB + px(halfChest, scale);
  const bNeckDipY = bY0 + px(1.0, scale);

  const backPath = [
    `M ${bCB} ${bNeckDipY}`,
    createBackNecklineSegment(bCB, bNeckDipY, bNeck, bY0),
    `L ${bSh} ${fShY}`,
    createArmholePathSegment(bSh, fShY, bChest, fArmY, px(armD, scale), false),
    cBez(bChest - px(0.3, scale), fArmY + (fHemY - fArmY) * 0.45, bChest * 0.98, fHemY - px(2.5, scale), bChest * 0.94, fHemY - px(1.2, scale)),
    cBez(bChest * 0.86, fHemY + px(0.4, scale), bCB + px(neckW * 0.6, scale), fHemY, bCB, fHemY),
    `L ${bCB} ${bNeckDipY}`,
    'Z',
  ].join(' ');

  // Sleeve Piece (S-curve cap)
  const slX0 = bX0 + px(halfChest, scale) + gap;
  const slY0 = originY;
  const slWidth = px(armD * 2, scale);
  const slCapH = px(armD * 0.6, scale);
  const slLen = px(sleeveL, scale);
  const slMidX = slX0 + slWidth / 2;

  const shirtCaps = createSleeveCapPathSegments(slX0, slY0 + slCapH, slMidX, slY0, slX0 + slWidth, slY0 + slCapH, slCapH);

  const sleevePath = [
    `M ${slX0} ${slY0 + slCapH}`,
    shirtCaps.leftCap,
    shirtCaps.rightCap,
    `L ${slX0 + slWidth * 0.75} ${slY0 + slLen}`,
    `L ${slX0 + slWidth * 0.25} ${slY0 + slLen}`,
    `L ${slX0} ${slY0 + slCapH}`,
    'Z',
  ].join(' ');

  // Collar & Stand Piece (Contoured)
  const colX0 = originX;
  const colY0 = fY0 + px(len, scale) + gap;
  const colLen = px(neckW * 2.8 * 2, scale);
  const colH = px(2.5, scale);

  const collarPath = [
    `M ${colX0} ${colY0}`,
    cBez(colX0 + colLen * 0.25, colY0 - px(0.4, scale), colX0 + colLen * 0.75, colY0 - px(0.4, scale), colX0 + colLen, colY0),
    cBez(colX0 + colLen + px(0.6, scale), colY0 + colH * 0.5, colX0 + colLen + px(0.4, scale), colY0 + colH, colX0 + colLen, colY0 + colH),
    cBez(colX0 + colLen * 0.75, colY0 + colH - px(0.2, scale), colX0 + colLen * 0.25, colY0 + colH - px(0.2, scale), colX0, colY0 + colH),
    cBez(colX0 - px(0.4, scale), colY0 + colH, colX0 - px(0.6, scale), colY0 + colH * 0.5, colX0, colY0),
    'Z',
  ].join(' ');

  const pieces: PatternPiece[] = [
    {
      id: 'front_shirt',
      label: 'FRONT SHIRT',
      subLabel: '(Cut 2 with placket)',
      path: frontPath,
      fillTint: 'rgba(79, 70, 229, 0.08)',
      strokeColor: '#4F46E5',
      labelCx: fCF + px(halfChest * 0.5, scale),
      labelCy: fY0 + px(len * 0.4, scale),
      grainCx: fCF + px(halfChest * 0.5, scale),
      grainCy: fY0 + px(len * 0.6, scale),
      grainLen: px(4, scale),
    },
    {
      id: 'back_shirt',
      label: 'BACK SHIRT',
      subLabel: '(Cut 1 on fold)',
      path: backPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB + px(halfChest * 0.5, scale),
      labelCy: bY0 + px(len * 0.4, scale),
      grainCx: bCB + px(halfChest * 0.5, scale),
      grainCy: bY0 + px(len * 0.6, scale),
      grainLen: px(4, scale),
    },
    {
      id: 'sleeve',
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
      id: 'collar',
      label: 'COLLAR & STAND',
      subLabel: '(Cut 2 with interfacing)',
      path: collarPath,
      fillTint: 'rgba(124, 58, 237, 0.08)',
      strokeColor: '#7C3AED',
      labelCx: colX0 + colLen / 2,
      labelCy: colY0 + colH / 2,
    },
  ];

  const outline = [frontPath, backPath, sleevePath, collarPath].join(' ');
  const points: PatternPoint[] = [
    { label: 'F-A', point: { x: fCF, y: fNeckDipY }, description: 'Front collar neck point' },
    { label: 'B-A', point: { x: bCB, y: bNeckDipY }, description: 'Back collar CB' },
    { label: 'S-A', point: { x: slMidX, y: slY0 }, description: 'Sleeve cap top' },
  ];
  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF, y: fArmY }, to: { x: fChest, y: fArmY }, dashed: true },
    { from: { x: bCB, y: fArmY }, to: { x: bChest, y: fArmY }, dashed: true },
  ];
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fCF, y: fY0 - px(1, scale) }, to: { x: fChest, y: fY0 - px(1, scale) }, label: `Chest: ${(halfChest * 4).toFixed(0)}"`, direction: 'horizontal' },
    { from: { x: fX0 - px(1, scale), y: fY0 }, to: { x: fX0 - px(1, scale), y: fHemY }, label: `Length: ${len}"`, direction: 'vertical' },
  ];

  return { outlinePath: outline, pieces, points, constructionLines, annotations, bounds: { width: slX0 + slWidth + px(4, scale), height: colY0 + colH + px(4, scale) } };
}

export function calculatePantPattern(
  m: Measurements,
  scale: number,
  pantOpts?: PantOptions
): PatternData {
  const options: PantOptions = pantOpts || {
    style: 'formal',
    fit: 'regular',
    pockets: 'slant',
    pleats: 'none',
    hem: 'straight',
    flyZipper: true,
    waistbandWidth: 1.5,
  };

  // Ease calculation based on Fit Selection
  const fitEase =
    options.fit === 'slim' ? 0.75 : options.fit === 'relaxed' ? 3.0 : 1.5;
  const actualEase = m.ease !== undefined && m.ease !== 1.5 ? m.ease : fitEase;

  // Style adjustment modifiers
  let thighMod = 0;
  let hemMod = 0;
  if (options.style === 'slim') {
    thighMod = -1.0;
    hemMod = -1.5;
  } else if (options.style === 'jeans') {
    thighMod = -0.5;
    hemMod = -1.0;
  } else if (options.style === 'straight') {
    thighMod = 0;
    hemMod = 0;
  }

  // Hem style modifiers
  if (options.hem === 'tapered') hemMod -= 1.0;
  else if (options.hem === 'bootcut') hemMod += 2.0;

  const outseamLen = m.outseam || 40;
  const inseamLen = m.inseam || 30;
  const waistCirc = (m.waist || 32) + actualEase;
  const hipCirc = (m.hip || 40) + actualEase;
  const thigh = Math.max(18, (m.thighCircumference || 24) + thighMod);
  const hem = Math.max(12, (m.bottomWidth || 17) + hemMod);

  // Pleat width addition to front waist
  const pleatAllowance =
    options.pleats === 'double' ? 2.0 : options.pleats === 'single' ? 1.0 : 0;

  const frontWaist = waistCirc / 4 - 0.5 + pleatAllowance;
  const backWaist = waistCirc / 4 + 0.5;
  const frontHip = hipCirc / 4;
  const backHip = hipCirc / 4 + 1.0;
  const frontThigh = thigh / 4;
  const backThigh = thigh / 4 + 0.8;
  const frontHem = hem / 4;
  const backHem = hem / 4 + 0.2;

  const frontRise = outseamLen - inseamLen;
  const backRise = frontRise + 1.0;
  const frontCrotch = frontHip * 0.2;
  const backCrotch = backHip * 0.35;

  const hipDepth = frontRise * 0.6;
  const kneeDepth = frontRise + inseamLen * 0.45;

  const originX = 36;
  const originY = 40;
  const gap = px(3.5, scale);
  const wbGap = px(2.5, scale);

  // FRONT PANT PANEL
  const fX0 = originX;
  const fY0 = originY;

  const fW = px(frontWaist, scale);
  const fH = px(frontHip, scale);
  const fCX = px(frontCrotch, scale);
  const fT = px(frontThigh, scale);
  const fHem = px(frontHem, scale);

  const fRise = px(frontRise, scale);
  const fInseam = px(inseamLen, scale);
  const fHipY = px(hipDepth, scale);
  const fKneeY = px(kneeDepth, scale);

  const fCF_x = fX0 + fCX;

  const FA: Point = { x: fCF_x, y: fY0 };
  const FB: Point = { x: fCF_x + fW, y: fY0 };
  const FC: Point = { x: fCF_x + fH, y: fY0 + fHipY };
  const FD: Point = { x: fX0, y: fY0 + fRise };
  const fCrotch_CF: Point = { x: fCF_x, y: fY0 + fRise };
  const fKnee_side: Point = { x: fCF_x + fT, y: fY0 + fKneeY };
  const fKnee_ins: Point = { x: fCF_x - fT * 0.9, y: fY0 + fKneeY };
  const FE_side: Point = { x: fCF_x + fHem, y: fY0 + fRise + fInseam };
  const FE_ins: Point = { x: fCF_x - fHem * 0.8, y: fY0 + fRise + fInseam };

  const frontPath = [
    `M ${FA.x} ${FA.y}`,
    cBez(FA.x + fW * 0.3, FA.y - px(0.3, scale), FB.x - fW * 0.3, FB.y - px(0.1, scale), FB.x, FB.y),
    createHipSeamPathSegment(FB.x, FB.y, FC.x, FC.y, fKnee_side.x, fKnee_side.y),
    `L ${FE_side.x} ${FE_side.y}`,
    `L ${FE_ins.x} ${FE_ins.y}`,
    `L ${fKnee_ins.x} ${fKnee_ins.y}`,
    createInseamPathSegment(fKnee_ins.x, fKnee_ins.y, fCrotch_CF.x, fCrotch_CF.y),
    createCrotchPathSegment(FD.x, FD.y, fCF_x, fY0 + fHipY, fCrotch_CF.x, fCrotch_CF.y, true),
    cBez(FD.x, FD.y - px(frontRise * 0.25, scale), FA.x + px(0.1, scale), FA.y + px(frontRise * 0.2, scale), FA.x, FA.y),
    'Z',
  ].join(' ');

  // BACK PANT PANEL
  const frontPanelRight = fCF_x + fH + px(2, scale);
  const bX0 = frontPanelRight + gap;
  const bY0 = originY;

  const bW = px(backWaist, scale);
  const bH = px(backHip, scale);
  const bCX = px(backCrotch, scale);
  const bT = px(backThigh, scale);
  const bHem = px(backHem, scale);
  const bRise = px(backRise, scale);
  const bHipY = fHipY;
  const bKneeY = fKneeY;

  const bCB_x = bX0 + bCX;
  const bWaistRise = px(1.0, scale);
  const BA: Point = { x: bCB_x, y: bY0 + bWaistRise };
  const BB: Point = { x: bCB_x + bW, y: bY0 };
  const BC: Point = { x: bCB_x + bH, y: bY0 + bHipY };
  const bCrotch_CB: Point = { x: bCB_x, y: bY0 + bRise };
  const BD: Point = { x: bX0, y: bY0 + bRise + px(0.5, scale) };
  const bKnee_side: Point = { x: bCB_x + bT, y: bY0 + bKneeY };
  const bKnee_ins: Point = { x: bCB_x - bT * 0.95, y: bY0 + bKneeY };
  const BE_side: Point = { x: bCB_x + bHem, y: bY0 + bRise + fInseam };
  const BE_ins: Point = { x: bCB_x - bHem * 0.85, y: bY0 + bRise + fInseam };

  const backPath = [
    `M ${BA.x} ${BA.y}`,
    cBez(BA.x + bW * 0.3, BA.y - px(0.4, scale), BB.x - bW * 0.3, BB.y - px(0.1, scale), BB.x, BB.y),
    createHipSeamPathSegment(BB.x, BB.y, BC.x, BC.y, bKnee_side.x, bKnee_side.y),
    `L ${BE_side.x} ${BE_side.y}`,
    `L ${BE_ins.x} ${BE_ins.y}`,
    `L ${bKnee_ins.x} ${bKnee_ins.y}`,
    createInseamPathSegment(bKnee_ins.x, bKnee_ins.y, bCrotch_CB.x, bCrotch_CB.y),
    createCrotchPathSegment(BD.x, BD.y, bCB_x, bY0 + bHipY, bCrotch_CB.x, bCrotch_CB.y, false),
    cBez(BD.x - px(0.3, scale), BD.y - px(backRise * 0.3, scale), BA.x - px(0.2, scale), BA.y + px(backRise * 0.2, scale), BA.x, BA.y),
    'Z',
  ].join(' ');

  // WAISTBAND PANEL (Anatomically Curved)
  const wbLength = px(waistCirc, scale);
  const wbHeight = px(options.waistbandWidth || 1.5, scale);
  const wbX0 = originX;
  const wbY0 = fY0 + fRise + fInseam + wbGap;

  const waistbandPath = createCurvedWaistbandPath(wbX0, wbY0, wbLength, wbHeight, px(0.6, scale));

  // POCKET FACING PIECE (Slant / Side Pocket Bag)
  const pckX0 = bCB_x + bH + px(4, scale);
  const pckY0 = originY;
  const pckW = px(6.5, scale);
  const pckH = px(10.5, scale);

  const pocketPath = [
    `M ${pckX0} ${pckY0}`,
    `L ${pckX0 + pckW} ${pckY0}`,
    `L ${pckX0 + pckW} ${pckY0 + pckH * 0.7}`,
    qBez(pckX0 + pckW * 0.5, pckY0 + pckH, pckX0, pckY0 + pckH * 0.8),
    'Z',
  ].join(' ');

  // FLY SHIELD / ZIPPER FACING PIECE
  const flyX0 = pckX0;
  const flyY0 = pckY0 + pckH + px(2, scale);
  const flyW = px(2.2, scale);
  const flyH = px(8.0, scale);

  const flyPath = [
    `M ${flyX0} ${flyY0}`,
    `L ${flyX0 + flyW} ${flyY0}`,
    `L ${flyX0 + flyW} ${flyY0 + flyH * 0.75}`,
    qBez(flyX0 + flyW * 0.5, flyY0 + flyH, flyX0, flyY0 + flyH * 0.85),
    'Z',
  ].join(' ');

  const pieces: PatternPiece[] = [
    {
      id: 'front_pant',
      label: `FRONT PANT (${options.style.toUpperCase()})`,
      subLabel: `(Cut 2 pair • ${options.fit} fit${options.pleats !== 'none' ? ` • ${options.pleats} pleat` : ''})`,
      path: frontPath,
      fillTint: 'rgba(79, 70, 229, 0.08)',
      strokeColor: '#4F46E5',
      labelCx: fCF_x + fW * 0.4,
      labelCy: fY0 + fRise * 0.4,
      grainCx: fCF_x + fW * 0.4,
      grainCy: fY0 + fRise * 0.6,
      grainLen: fRise * 0.5,
    },
    {
      id: 'back_pant',
      label: 'BACK PANT',
      subLabel: '(Cut 2 pair • waist dart included)',
      path: backPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB_x + bW * 0.4,
      labelCy: bY0 + bRise * 0.4,
      grainCx: bCB_x + bW * 0.4,
      grainCy: bY0 + bRise * 0.6,
      grainLen: bRise * 0.5,
    },
    {
      id: 'waistband',
      label: 'CURVED WAISTBAND',
      subLabel: `(Cut 1 on fold • ${options.waistbandWidth}" width)`,
      path: waistbandPath,
      fillTint: 'rgba(124, 58, 237, 0.08)',
      strokeColor: '#7C3AED',
      labelCx: wbX0 + wbLength / 2,
      labelCy: wbY0 + wbHeight / 2 + 2,
    },
    {
      id: 'pocket_facing',
      label: `${options.pockets.toUpperCase()} POCKET BAG`,
      subLabel: '(Cut 2 pairs in lining fabric)',
      path: pocketPath,
      fillTint: 'rgba(217, 119, 6, 0.08)',
      strokeColor: '#D97706',
      labelCx: pckX0 + pckW / 2,
      labelCy: pckY0 + pckH * 0.4,
      grainCx: pckX0 + pckW / 2,
      grainCy: pckY0 + pckH * 0.7,
      grainLen: px(3, scale),
    },
  ];

  if (options.flyZipper) {
    pieces.push({
      id: 'fly_shield',
      label: 'FLY SHIELD & FACING',
      subLabel: '(Cut 2 pair with interfacing)',
      path: flyPath,
      fillTint: 'rgba(236, 72, 153, 0.08)',
      strokeColor: '#DB2777',
      labelCx: flyX0 + flyW / 2,
      labelCy: flyY0 + flyH * 0.4,
    });
  }

  const outline = pieces.map((p) => p.path).join(' ');

  const constructionLines: ConstructionLine[] = [
    { from: { x: fX0 - px(0.5, scale), y: fY0 }, to: { x: fCF_x + fH + px(0.5, scale), y: fY0 }, dashed: true },
    { from: { x: fX0 - px(0.5, scale), y: fY0 + fHipY }, to: { x: fCF_x + fH + px(0.5, scale), y: fY0 + fHipY }, dashed: true },
    { from: { x: fX0 - px(0.5, scale), y: fY0 + fRise }, to: { x: fCF_x + fH + px(0.5, scale), y: fY0 + fRise }, dashed: true },
    { from: { x: bX0 - px(0.5, scale), y: bY0 }, to: { x: bCB_x + bH + px(0.5, scale), y: bY0 }, dashed: true },
    { from: { x: bX0 - px(0.5, scale), y: bY0 + bRise }, to: { x: bCB_x + bH + px(0.5, scale), y: bY0 + bRise }, dashed: true },
  ];

  const points: PatternPoint[] = [
    { label: 'F-W', point: FA, description: 'Front CF waist corner' },
    { label: 'F-C', point: FD, description: 'Front crotch curve point' },
    { label: 'B-W', point: BA, description: 'Back CB waist peak' },
    { label: 'B-C', point: BD, description: 'Back crotch extension point' },
    { label: 'K-L', point: fKnee_side, description: 'Knee line side notch' },
  ];

  const dimOff = px(2.0, scale);
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fX0 - dimOff, y: fY0 }, to: { x: fX0 - dimOff, y: fY0 + fRise + fInseam }, label: `Outseam: ${outseamLen}"`, direction: 'vertical' },
    { from: { x: fCF_x, y: fY0 - dimOff }, to: { x: fCF_x + fW, y: fY0 - dimOff }, label: `F-Waist: ${frontWaist.toFixed(1)}"`, direction: 'horizontal' },
    { from: { x: bCB_x, y: bY0 - dimOff }, to: { x: bCB_x + bW, y: bY0 - dimOff }, label: `B-Waist: ${backWaist.toFixed(1)}"`, direction: 'horizontal' },
    { from: { x: FE_ins.x, y: FE_ins.y + px(1.0, scale) }, to: { x: FE_side.x, y: FE_side.y + px(1.0, scale) }, label: `Hem: ${hem}"`, direction: 'horizontal' },
  ];

  const totalWidth = pckX0 + pckW + px(6, scale);
  const totalHeight = Math.max(fY0 + fRise + fInseam, wbY0 + wbHeight, flyY0 + flyH) + px(5, scale);

  return { outlinePath: outline, pieces, points, constructionLines, annotations, bounds: { width: totalWidth, height: totalHeight } };
}

function calculateKurtaPattern(m: Measurements, scale: number): PatternData {
  const halfChest     = (m.bust + (m.ease || 2)) / 4;
  const halfShoulder  = m.shoulderWidth || 3.8;
  const neckW         = (m.neckWidth || 3.4) / 2;
  const neckD         = m.neckDepth || 4.2;
  const armD          = m.armholeDepth || 7.2;
  const len           = m.fullLength || 42;
  const sleeveL       = m.sleeveLength || 20;

  const gap = px(3, scale);
  const originX = 36;
  const originY = 30;

  // Front Kurta Piece (with slit mark)
  const fX0 = originX;
  const fY0 = originY;
  const fCF = fX0;
  const fNeck = fCF + px(neckW, scale);
  const fSh = fCF + px(halfShoulder, scale);
  const fChest = fCF + px(halfChest, scale);
  const fHip = fCF + px(halfChest * 1.05, scale);
  const fHem = fCF + px(halfChest * 1.1, scale);
  const fSlitY = fY0 + px(22, scale);
  const fHemY = fY0 + px(len, scale);
  const fArmY = fY0 + px(armD, scale);
  const fNeckDipY = fY0 + px(neckD, scale);
  const fShY = fY0 + px(1.2, scale);

  const frontPath = [
    `M ${fCF} ${fNeckDipY}`,
    createFrontNecklineSegment(fCF, fNeckDipY, fNeck, fY0),
    `L ${fSh} ${fShY}`,
    createArmholePathSegment(fSh, fShY, fChest, fArmY, px(armD, scale), true),
    cBez(fChest - px(0.4, scale), fArmY + (fSlitY - fArmY) * 0.4, fHip + px(0.2, scale), fArmY + (fSlitY - fArmY) * 0.75, fHip, fSlitY),
    `L ${fHem} ${fHemY}`,
    `L ${fCF} ${fHemY}`,
    `L ${fCF} ${fNeckDipY}`,
    'Z',
  ].join(' ');

  // Back Kurta Piece
  const bX0 = fX0 + px(halfChest * 1.1, scale) + gap;
  const bY0 = originY;
  const bCB = bX0;
  const bNeck = bCB + px(neckW, scale);
  const bSh = bCB + px(halfShoulder, scale);
  const bChest = bCB + px(halfChest, scale);
  const bHip = bCB + px(halfChest * 1.05, scale);
  const bHem = bCB + px(halfChest * 1.1, scale);
  const bNeckDipY = bY0 + px(1.2, scale);

  const backPath = [
    `M ${bCB} ${bNeckDipY}`,
    createBackNecklineSegment(bCB, bNeckDipY, bNeck, bY0),
    `L ${bSh} ${fShY}`,
    createArmholePathSegment(bSh, fShY, bChest, fArmY, px(armD, scale), false),
    cBez(bChest - px(0.4, scale), fArmY + (fSlitY - fArmY) * 0.4, bHip + px(0.2, scale), fArmY + (fSlitY - fArmY) * 0.75, bHip, fSlitY),
    `L ${bHem} ${fHemY}`,
    `L ${bCB} ${fHemY}`,
    `L ${bCB} ${bNeckDipY}`,
    'Z',
  ].join(' ');

  // Sleeve Piece (S-curve cap)
  const slX0 = bX0 + px(halfChest * 1.1, scale) + gap;
  const slY0 = originY;
  const slWidth = px(armD * 2, scale);
  const slCapH = px(armD * 0.55, scale);
  const slLen = px(sleeveL, scale);
  const slMidX = slX0 + slWidth / 2;

  const kurtaCaps = createSleeveCapPathSegments(slX0, slY0 + slCapH, slMidX, slY0, slX0 + slWidth, slY0 + slCapH, slCapH);

  const sleevePath = [
    `M ${slX0} ${slY0 + slCapH}`,
    kurtaCaps.leftCap,
    kurtaCaps.rightCap,
    `L ${slX0 + slWidth * 0.75} ${slY0 + slLen}`,
    `L ${slX0 + slWidth * 0.25} ${slY0 + slLen}`,
    `L ${slX0} ${slY0 + slCapH}`,
    'Z',
  ].join(' ');

  const pieces: PatternPiece[] = [
    {
      id: 'front_kurta',
      label: 'FRONT KURTA / KURTI',
      subLabel: '(Cut 1 on fold)',
      path: frontPath,
      fillTint: 'rgba(79, 70, 229, 0.08)',
      strokeColor: '#4F46E5',
      labelCx: fCF + px(halfChest * 0.5, scale),
      labelCy: fY0 + px(len * 0.35, scale),
      grainCx: fCF + px(halfChest * 0.5, scale),
      grainCy: fY0 + px(len * 0.55, scale),
      grainLen: px(5, scale),
    },
    {
      id: 'back_kurta',
      label: 'BACK KURTA / KURTI',
      subLabel: '(Cut 1 on fold)',
      path: backPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB + px(halfChest * 0.5, scale),
      labelCy: bY0 + px(len * 0.35, scale),
      grainCx: bCB + px(halfChest * 0.5, scale),
      grainCy: bY0 + px(len * 0.55, scale),
      grainLen: px(5, scale),
    },
    {
      id: 'sleeve',
      label: 'KURTA SLEEVE',
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

  const outline = [frontPath, backPath, sleevePath].join(' ');
  const points: PatternPoint[] = [
    { label: 'F-A', point: { x: fCF, y: fNeckDipY }, description: 'Front neck top' },
    { label: 'B-A', point: { x: bCB, y: bNeckDipY }, description: 'Back neck top' },
    { label: 'S-L', point: { x: fHip, y: fSlitY }, description: 'Side slit notch' },
  ];
  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF, y: fArmY }, to: { x: fChest, y: fArmY }, dashed: true },
    { from: { x: fCF, y: fSlitY }, to: { x: fHip, y: fSlitY }, dashed: true },
  ];
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fCF - px(1, scale), y: fY0 }, to: { x: fCF - px(1, scale), y: fHemY }, label: `Length: ${len}"`, direction: 'vertical' },
    { from: { x: fCF, y: fArmY + px(0.5, scale) }, to: { x: fChest, y: fArmY + px(0.5, scale) }, label: `Bust: ${(halfChest * 4).toFixed(0)}"`, direction: 'horizontal' },
  ];

  return { outlinePath: outline, pieces, points, constructionLines, annotations, bounds: { width: slX0 + slWidth + px(4, scale), height: fHemY + px(4, scale) } };
}

function calculateBlousePattern(m: Measurements, scale: number): PatternData {
  const halfChest     = (m.bust + (m.ease || 0.5)) / 4;
  const halfWaist     = (m.waist + (m.ease || 0.5)) / 4;
  const halfShoulder  = m.shoulderWidth || 3.4;
  const neckW         = (m.neckWidth || 3.2) / 2;
  const neckD         = m.neckDepth || 5.5;
  const armD          = m.armholeDepth || 6.2;
  const len           = m.fullLength || 14.5;
  const sleeveL       = m.sleeveLength || 5.5;

  const gap = px(3, scale);
  const originX = 36;
  const originY = 30;

  // Front Blouse Piece (with princess curve / bust dart shape)
  const fX0 = originX;
  const fY0 = originY;
  const fCF = fX0;
  const fNeck = fCF + px(neckW, scale);
  const fSh = fCF + px(halfShoulder, scale);
  const fChest = fCF + px(halfChest, scale);
  const fWaist = fCF + px(halfWaist, scale);

  const fArmY = fY0 + px(armD, scale);
  const fHemY = fY0 + px(len, scale);
  const fShY = fY0 + px(1.2, scale);
  const fNeckDipY = fY0 + px(neckD, scale);

  const frontPath = [
    `M ${fCF} ${fNeckDipY}`,
    createFrontNecklineSegment(fCF, fNeckDipY, fNeck, fY0),
    `L ${fSh} ${fShY}`,
    createArmholePathSegment(fSh, fShY, fChest, fArmY, px(armD, scale), true),
    cBez(fChest - px(0.5, scale), fArmY + (fHemY - fArmY) * 0.35, fWaist + px(0.2, scale), fArmY + (fHemY - fArmY) * 0.7, fWaist, fHemY),
    `L ${fCF} ${fHemY}`,
    `L ${fCF} ${fNeckDipY}`,
    'Z',
  ].join(' ');

  // Back Blouse Piece (Deep back neck)
  const bX0 = fX0 + px(halfChest, scale) + gap;
  const bY0 = originY;
  const bCB = bX0;
  const bNeck = bCB + px(neckW, scale);
  const bSh = bCB + px(halfShoulder, scale);
  const bChest = bCB + px(halfChest, scale);
  const bWaist = bCB + px(halfWaist, scale);
  const bNeckDipY = bY0 + px(neckD * 0.85, scale);

  const backPath = [
    `M ${bCB} ${bNeckDipY}`,
    createBackNecklineSegment(bCB, bNeckDipY, bNeck, bY0),
    `L ${bSh} ${fShY}`,
    createArmholePathSegment(bSh, fShY, bChest, fArmY, px(armD, scale), false),
    cBez(bChest - px(0.5, scale), fArmY + (fHemY - fArmY) * 0.35, bWaist + px(0.2, scale), fArmY + (fHemY - fArmY) * 0.7, bWaist, fHemY),
    `L ${bCB} ${fHemY}`,
    `L ${bCB} ${bNeckDipY}`,
    'Z',
  ].join(' ');

  // Sleeve Piece (S-curve cap)
  const slX0 = bX0 + px(halfChest, scale) + gap;
  const slY0 = originY;
  const slWidth = px(armD * 1.8, scale);
  const slCapH = px(armD * 0.5, scale);
  const slLen = px(sleeveL, scale);
  const slMidX = slX0 + slWidth / 2;

  const blouseCaps = createSleeveCapPathSegments(slX0, slY0 + slCapH, slMidX, slY0, slX0 + slWidth, slY0 + slCapH, slCapH);

  const sleevePath = [
    `M ${slX0} ${slY0 + slCapH}`,
    blouseCaps.leftCap,
    blouseCaps.rightCap,
    `L ${slX0 + slWidth * 0.85} ${slY0 + slLen}`,
    `L ${slX0 + slWidth * 0.15} ${slY0 + slLen}`,
    `L ${slX0} ${slY0 + slCapH}`,
    'Z',
  ].join(' ');

  const pieces: PatternPiece[] = [
    {
      id: 'front_blouse',
      label: 'FRONT BLOUSE',
      subLabel: '(Cut 2 pair)',
      path: frontPath,
      fillTint: 'rgba(79, 70, 229, 0.08)',
      strokeColor: '#4F46E5',
      labelCx: fCF + px(halfChest * 0.5, scale),
      labelCy: fY0 + px(len * 0.5, scale),
      grainCx: fCF + px(halfChest * 0.5, scale),
      grainCy: fY0 + px(len * 0.7, scale),
      grainLen: px(3, scale),
    },
    {
      id: 'back_blouse',
      label: 'BACK BLOUSE',
      subLabel: '(Cut 1 on fold)',
      path: backPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB + px(halfChest * 0.5, scale),
      labelCy: bY0 + px(len * 0.5, scale),
      grainCx: bCB + px(halfChest * 0.5, scale),
      grainCy: bY0 + px(len * 0.7, scale),
      grainLen: px(3, scale),
    },
    {
      id: 'sleeve',
      label: 'BLOUSE SLEEVE',
      subLabel: '(Cut 2 pair)',
      path: sleevePath,
      fillTint: 'rgba(217, 119, 6, 0.08)',
      strokeColor: '#D97706',
      labelCx: slMidX,
      labelCy: slY0 + slCapH + px(1.2, scale),
      grainCx: slMidX,
      grainCy: slY0 + slCapH + px(2.5, scale),
      grainLen: px(2, scale),
    },
  ];

  const outline = [frontPath, backPath, sleevePath].join(' ');
  const points: PatternPoint[] = [
    { label: 'F-N', point: { x: fCF, y: fY0 + px(neckD, scale) }, description: 'Front neck dip' },
    { label: 'B-N', point: { x: bCB, y: bY0 + px(neckD, scale) }, description: 'Back deep neck dip' },
  ];
  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF, y: fArmY }, to: { x: fChest, y: fArmY }, dashed: true },
    { from: { x: bCB, y: fArmY }, to: { x: bChest, y: fArmY }, dashed: true },
  ];
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fCF - px(1, scale), y: fY0 }, to: { x: fCF - px(1, scale), y: fHemY }, label: `Length: ${len}"`, direction: 'vertical' },
    { from: { x: fCF, y: fHemY + px(1, scale) }, to: { x: fWaist, y: fHemY + px(1, scale) }, label: `Waist: ${(halfWaist * 4).toFixed(0)}"`, direction: 'horizontal' },
  ];

  return { outlinePath: outline, pieces, points, constructionLines, annotations, bounds: { width: slX0 + slWidth + px(4, scale), height: fHemY + px(4, scale) } };
}

function calculateChudidarPattern(m: Measurements, scale: number): PatternData {
  const waistCirc = (m.waist || 30) + (m.ease || 1);
  const hipCirc   = (m.hip || 38) + (m.ease || 1);
  const outseam   = m.outseam || 42;
  const ankle     = m.bottomWidth || 8;

  const halfWaist = waistCirc / 4;
  const halfHip   = hipCirc / 4;
  const halfAnkle = ankle / 2;
  const chudiGather = 6; // 6 extra inches for ankle churis/gathers

  const gap = px(3, scale);
  const originX = 36;
  const originY = 30;

  // Front Leg Piece
  const fX0 = originX;
  const fY0 = originY;
  const fCF = fX0;
  const fWaist = fCF + px(halfWaist, scale);
  const fHip = fCF + px(halfHip, scale);
  const fAnkle = fCF + px(halfAnkle, scale);

  const fHipY = fY0 + px(8, scale);
  const fLengthY = fY0 + px(outseam + chudiGather, scale);

  const frontPath = [
    `M ${fCF} ${fY0}`,
    cBez(fCF + px(halfWaist * 0.3, scale), fY0 - px(0.2, scale), fWaist - px(halfWaist * 0.3, scale), fY0 - px(0.2, scale), fWaist, fY0),
    cBez(fHip + px(0.8, scale), fHipY - px(2, scale), fHip + px(1.2, scale), fHipY + px(1, scale), fAnkle + px(0.8, scale), fLengthY - px(9, scale)),
    cBez(fAnkle + px(0.6, scale), fLengthY - px(4, scale), fAnkle + px(0.2, scale), fLengthY - px(1, scale), fAnkle, fLengthY),
    cBez(fAnkle - px(halfAnkle * 0.4, scale), fLengthY + px(0.5, scale), fCF + px(halfAnkle * 0.4, scale), fLengthY + px(0.5, scale), fCF, fLengthY),
    `L ${fCF} ${fY0}`,
    'Z',
  ].join(' ');

  // Back Leg Piece
  const bX0 = fX0 + px(halfHip, scale) + gap;
  const bY0 = originY;
  const bCB = bX0;
  const bWaist = bCB + px(halfWaist + 0.5, scale);
  const bHip = bCB + px(halfHip + 0.8, scale);
  const bAnkle = bCB + px(halfAnkle + 0.2, scale);

  const backPath = [
    `M ${bCB} ${bY0}`,
    cBez(bCB + px(halfWaist * 0.3, scale), bY0 - px(0.2, scale), bWaist - px(halfWaist * 0.3, scale), bY0 - px(0.2, scale), bWaist, bY0),
    cBez(bHip + px(1.0, scale), fHipY - px(2, scale), bHip + px(1.4, scale), fHipY + px(1, scale), bAnkle + px(0.8, scale), fLengthY - px(9, scale)),
    cBez(bAnkle + px(0.6, scale), fLengthY - px(4, scale), bAnkle + px(0.2, scale), fLengthY - px(1, scale), bAnkle, fLengthY),
    cBez(bAnkle - px(halfAnkle * 0.4, scale), fLengthY + px(0.5, scale), bCB + px(halfAnkle * 0.4, scale), fLengthY + px(0.5, scale), bCB, fLengthY),
    `L ${bCB} ${bY0}`,
    'Z',
  ].join(' ');

  // Waistband Piece (curved casing)
  const wbX0 = originX;
  const wbY0 = fY0 + px(outseam + chudiGather, scale) + gap;
  const wbLen = px(waistCirc, scale);
  const wbH = px(4, scale); // upper belt/casing height

  const waistbandPath = createCurvedWaistbandPath(wbX0, wbY0, wbLen, wbH, px(0.5, scale));

  const pieces: PatternPiece[] = [
    {
      id: 'front_leg',
      label: 'FRONT LEG (BIAS CUT)',
      subLabel: '(Cut 2 pair)',
      path: frontPath,
      fillTint: 'rgba(79, 70, 229, 0.08)',
      strokeColor: '#4F46E5',
      labelCx: fCF + px(halfHip * 0.4, scale),
      labelCy: fY0 + px(outseam * 0.3, scale),
      grainCx: fCF + px(halfHip * 0.4, scale),
      grainCy: fY0 + px(outseam * 0.5, scale),
      grainLen: px(6, scale),
    },
    {
      id: 'back_leg',
      label: 'BACK LEG (BIAS CUT)',
      subLabel: '(Cut 2 pair)',
      path: backPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB + px(halfHip * 0.4, scale),
      labelCy: bY0 + px(outseam * 0.3, scale),
      grainCx: bCB + px(halfHip * 0.4, scale),
      grainCy: bY0 + px(outseam * 0.5, scale),
      grainLen: px(6, scale),
    },
    {
      id: 'waistband',
      label: 'CHUDIDAR WAIST BELT',
      subLabel: '(Cut 1)',
      path: waistbandPath,
      fillTint: 'rgba(124, 58, 237, 0.08)',
      strokeColor: '#7C3AED',
      labelCx: wbX0 + wbLen / 2,
      labelCy: wbY0 + wbH / 2,
    },
  ];

  const outline = [frontPath, backPath, waistbandPath].join(' ');
  const points: PatternPoint[] = [
    { label: 'F-W', point: { x: fCF, y: fY0 }, description: 'Front leg top' },
    { label: 'F-A', point: { x: fAnkle, y: fLengthY }, description: 'Gathered ankle opening' },
  ];
  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF, y: fHipY }, to: { x: fHip, y: fHipY }, dashed: true },
    { from: { x: bCB, y: fHipY }, to: { x: bHip, y: fHipY }, dashed: true },
  ];
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fCF - px(1, scale), y: fY0 }, to: { x: fCF - px(1, scale), y: fLengthY }, label: `Outseam + Gathers: ${outseam + chudiGather}"`, direction: 'vertical' },
    { from: { x: fCF, y: fLengthY + px(1, scale) }, to: { x: fAnkle, y: fLengthY + px(1, scale) }, label: `Ankle: ${ankle}"`, direction: 'horizontal' },
  ];

  return { outlinePath: outline, pieces, points, constructionLines, annotations, bounds: { width: bCB + px(halfHip * 1.5, scale) + px(4, scale), height: wbY0 + wbH + px(4, scale) } };
}

function calculateSkirtPattern(m: Measurements, scale: number): PatternData {
  const waistCirc = (m.waist || 28) + (m.ease || 1);
  const hipCirc   = (m.hip || 38) + (m.ease || 1);
  const len       = m.fullLength || 36;
  const flare     = m.bottomWidth || 34;

  const halfWaist = waistCirc / 4;
  const halfHip   = hipCirc / 4;
  const halfHem   = flare / 2;

  const gap = px(3, scale);
  const originX = 36;
  const originY = 30;

  // Front Skirt Panel
  const fX0 = originX;
  const fY0 = originY;
  const fCF = fX0;
  const fWaist = fCF + px(halfWaist, scale);
  const fHip = fCF + px(halfHip, scale);
  const fHem = fCF + px(halfHem, scale);
  const fHemY = fY0 + px(len, scale);
  const fHipY = fY0 + px(8, scale);

  const frontPath = [
    `M ${fCF} ${fY0}`,
    cBez(fCF + px(halfWaist * 0.35, scale), fY0 - px(0.5, scale), fWaist - px(halfWaist * 0.15, scale), fY0 - px(0.2, scale), fWaist, fY0 + px(0.5, scale)),
    cBez(fHip + px(1.0, scale), fHipY + px(1.5, scale), fHip + px(1.4, scale), fHipY + px(3, scale), fHem - px(0.8, scale), fHemY - px(5, scale)),
    cBez(fHem - px(0.2, scale), fHemY - px(1.5, scale), fHem + px(0.2, scale), fHemY, fHem, fHemY),
    cBez(fCF + px(halfHem * 0.6, scale), fHemY + px(1.8, scale), fCF + px(halfHem * 0.2, scale), fHemY + px(1.0, scale), fCF, fHemY),
    `L ${fCF} ${fY0}`,
    'Z',
  ].join(' ');

  // Back Skirt Panel
  const bX0 = fX0 + px(halfHem, scale) + gap;
  const bY0 = originY;
  const bCB = bX0;
  const bWaist = bCB + px(halfWaist, scale);
  const bHip = bCB + px(halfHip, scale);
  const bHem = bCB + px(halfHem, scale);

  const backPath = [
    `M ${bCB} ${bY0}`,
    cBez(bCB + px(halfWaist * 0.35, scale), bY0 - px(0.5, scale), bWaist - px(halfWaist * 0.15, scale), bY0 - px(0.2, scale), bWaist, bY0 + px(0.5, scale)),
    cBez(bHip + px(1.0, scale), fHipY + px(1.5, scale), bHip + px(1.4, scale), fHipY + px(3, scale), bHem - px(0.8, scale), fHemY - px(5, scale)),
    cBez(bHem - px(0.2, scale), fHemY - px(1.5, scale), bHem + px(0.2, scale), fHemY, bHem, fHemY),
    cBez(bCB + px(halfHem * 0.6, scale), fHemY + px(1.8, scale), bCB + px(halfHem * 0.2, scale), fHemY + px(1.0, scale), bCB, fHemY),
    `L ${bCB} ${bY0}`,
    'Z',
  ].join(' ');

  // Skirt Waistband (curved)
  const wbX0 = originX;
  const wbY0 = fY0 + px(len, scale) + gap;
  const wbLen = px(waistCirc, scale);
  const wbH = px(1.8, scale);

  const waistbandPath = createCurvedWaistbandPath(wbX0, wbY0, wbLen, wbH, px(0.4, scale));

  const pieces: PatternPiece[] = [
    {
      id: 'front_skirt',
      label: 'FRONT SKIRT PANEL',
      subLabel: '(Cut 1 on fold)',
      path: frontPath,
      fillTint: 'rgba(79, 70, 229, 0.08)',
      strokeColor: '#4F46E5',
      labelCx: fCF + px(halfHem * 0.4, scale),
      labelCy: fY0 + px(len * 0.4, scale),
      grainCx: fCF + px(halfHem * 0.4, scale),
      grainCy: fY0 + px(len * 0.6, scale),
      grainLen: px(6, scale),
    },
    {
      id: 'back_skirt',
      label: 'BACK SKIRT PANEL',
      subLabel: '(Cut 1 on fold)',
      path: backPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB + px(halfHem * 0.4, scale),
      labelCy: bY0 + px(len * 0.4, scale),
      grainCx: bCB + px(halfHem * 0.4, scale),
      grainCy: bY0 + px(len * 0.6, scale),
      grainLen: px(6, scale),
    },
    {
      id: 'waistband',
      label: 'SKIRT WAISTBAND',
      subLabel: '(Cut 1 on fold)',
      path: waistbandPath,
      fillTint: 'rgba(124, 58, 237, 0.08)',
      strokeColor: '#7C3AED',
      labelCx: wbX0 + wbLen / 2,
      labelCy: wbY0 + wbH / 2 + 2,
    },
  ];

  const outline = [frontPath, backPath, waistbandPath].join(' ');
  const points: PatternPoint[] = [
    { label: 'F-W', point: { x: fCF, y: fY0 }, description: 'Skirt waist top' },
    { label: 'F-H', point: { x: fHem, y: fHemY }, description: 'Hem flare tip' },
  ];
  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF, y: fHipY }, to: { x: fHip, y: fHipY }, dashed: true },
    { from: { x: bCB, y: fHipY }, to: { x: bHip, y: fHipY }, dashed: true },
  ];
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fCF - px(1, scale), y: fY0 }, to: { x: fCF - px(1, scale), y: fHemY }, label: `Length: ${len}"`, direction: 'vertical' },
    { from: { x: fCF, y: fY0 - px(1, scale) }, to: { x: fWaist, y: fY0 - px(1, scale) }, label: `Waist: ${(halfWaist * 4).toFixed(0)}"`, direction: 'horizontal' },
  ];

  return { outlinePath: outline, pieces, points, constructionLines, annotations, bounds: { width: bCB + px(halfHem, scale) + px(4, scale), height: wbY0 + wbH + px(4, scale) } };
}

function calculateKurtiPattern(m: Measurements, scale: number): PatternData {
  return calculateKurtaPattern(m, scale);
}

function calculateKidsPattern(m: Measurements, scale: number): PatternData {
  const halfChest     = (m.bust + (m.ease || 1.5)) / 4;
  const halfShoulder  = m.shoulderWidth || 2.8;
  const neckW         = (m.neckWidth || 2.4) / 2;
  const armD          = m.armholeDepth || 5.2;
  const len           = m.fullLength || 22;
  const sleeveL       = m.sleeveLength || 5;

  const gap = px(3, scale);
  const originX = 36;
  const originY = 30;

  // Front Kids Piece
  const fX0 = originX;
  const fY0 = originY;
  const fCF = fX0;
  const fNeck = fCF + px(neckW, scale);
  const fSh = fCF + px(halfShoulder, scale);
  const fChest = fCF + px(halfChest, scale);
  const fHemY = fY0 + px(len, scale);
  const fArmY = fY0 + px(armD, scale);

  const fNeckDipY = fY0 + px(2.2, scale);
  const fShY = fY0 + px(0.8, scale);
  const fHipX = fCF + px(halfChest * 1.1, scale);

  const frontPath = [
    `M ${fCF} ${fNeckDipY}`,
    createFrontNecklineSegment(fCF, fNeckDipY, fNeck, fY0),
    `L ${fSh} ${fShY}`,
    createArmholePathSegment(fSh, fShY, fChest, fArmY, px(armD, scale), true),
    cBez(fChest - px(0.2, scale), fArmY + (fHemY - fArmY) * 0.4, fHipX + px(0.2, scale), fArmY + (fHemY - fArmY) * 0.7, fHipX, fHemY),
    `L ${fCF} ${fHemY}`,
    `L ${fCF} ${fNeckDipY}`,
    'Z',
  ].join(' ');

  // Back Kids Piece
  const bX0 = fX0 + px(halfChest * 1.1, scale) + gap;
  const bY0 = originY;
  const bCB = bX0;
  const bNeck = bCB + px(neckW, scale);
  const bSh = bCB + px(halfShoulder, scale);
  const bChest = bCB + px(halfChest, scale);
  const bHipX = bCB + px(halfChest * 1.1, scale);
  const bNeckDipY = bY0 + px(1.0, scale);

  const backPath = [
    `M ${bCB} ${bNeckDipY}`,
    createBackNecklineSegment(bCB, bNeckDipY, bNeck, bY0),
    `L ${bSh} ${fShY}`,
    createArmholePathSegment(bSh, fShY, bChest, fArmY, px(armD, scale), false),
    cBez(bChest - px(0.2, scale), fArmY + (fHemY - fArmY) * 0.4, bHipX + px(0.2, scale), fArmY + (fHemY - fArmY) * 0.7, bHipX, fHemY),
    `L ${bCB} ${fHemY}`,
    `L ${bCB} ${bNeckDipY}`,
    'Z',
  ].join(' ');

  // Sleeve Piece (S-curve cap)
  const slX0 = bX0 + px(halfChest * 1.1, scale) + gap;
  const slY0 = originY;
  const slWidth = px(armD * 1.8, scale);
  const slCapH = px(armD * 0.5, scale);
  const slLen = px(sleeveL, scale);
  const slMidX = slX0 + slWidth / 2;

  const kidsCaps = createSleeveCapPathSegments(slX0, slY0 + slCapH, slMidX, slY0, slX0 + slWidth, slY0 + slCapH, slCapH);

  const sleevePath = [
    `M ${slX0} ${slY0 + slCapH}`,
    kidsCaps.leftCap,
    kidsCaps.rightCap,
    `L ${slX0 + slWidth * 0.8} ${slY0 + slLen}`,
    `L ${slX0 + slWidth * 0.2} ${slY0 + slLen}`,
    `L ${slX0} ${slY0 + slCapH}`,
    'Z',
  ].join(' ');

  const pieces: PatternPiece[] = [
    {
      id: 'front_kids',
      label: 'KIDS FRONT',
      subLabel: '(Cut 1 on fold)',
      path: frontPath,
      fillTint: 'rgba(79, 70, 229, 0.08)',
      strokeColor: '#4F46E5',
      labelCx: fCF + px(halfChest * 0.5, scale),
      labelCy: fY0 + px(len * 0.4, scale),
      grainCx: fCF + px(halfChest * 0.5, scale),
      grainCy: fY0 + px(len * 0.6, scale),
      grainLen: px(3.5, scale),
    },
    {
      id: 'back_kids',
      label: 'KIDS BACK',
      subLabel: '(Cut 1 on fold)',
      path: backPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB + px(halfChest * 0.5, scale),
      labelCy: bY0 + px(len * 0.4, scale),
      grainCx: bCB + px(halfChest * 0.5, scale),
      grainCy: bY0 + px(len * 0.6, scale),
      grainLen: px(3.5, scale),
    },
    {
      id: 'sleeve',
      label: 'KIDS SLEEVE',
      subLabel: '(Cut 2 pair)',
      path: sleevePath,
      fillTint: 'rgba(217, 119, 6, 0.08)',
      strokeColor: '#D97706',
      labelCx: slMidX,
      labelCy: slY0 + slCapH + px(1.2, scale),
      grainCx: slMidX,
      grainCy: slY0 + slCapH + px(2.5, scale),
      grainLen: px(2, scale),
    },
  ];

  const outline = [frontPath, backPath, sleevePath].join(' ');
  const points: PatternPoint[] = [
    { label: 'F-A', point: { x: fCF, y: fNeckDipY }, description: 'Front neck top' },
    { label: 'B-A', point: { x: bCB, y: bNeckDipY }, description: 'Back neck top' },
  ];
  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF, y: fArmY }, to: { x: fChest, y: fArmY }, dashed: true },
    { from: { x: bCB, y: fArmY }, to: { x: bChest, y: fArmY }, dashed: true },
  ];
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fCF - px(1, scale), y: fY0 }, to: { x: fCF - px(1, scale), y: fHemY }, label: `Length: ${len}"`, direction: 'vertical' },
  ];

  return { outlinePath: outline, pieces, points, constructionLines, annotations, bounds: { width: slX0 + slWidth + px(4, scale), height: fHemY + px(4, scale) } };
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
  JACKET: {
    id: 'JACKET',
    label: 'Structured Jacket',
    description: 'Jacket front/back with lapel, collar and set-in sleeves',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateShirtPattern, // re-uses shirt block geometry
  },
  TOP: {
    id: 'TOP',
    label: 'Casual Top',
    description: 'Relaxed-fit top with curved hem and simple armhole shaping',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateKurtiPattern, // re-uses kurti block geometry
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
  'JACKET',
  'TOP',
];
