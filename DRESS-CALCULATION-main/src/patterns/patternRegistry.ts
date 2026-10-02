// ============================================================
// SmartTailor AI – Pattern Registry
// Central registry mapping DressType & PatternType -> calculation engines
// ============================================================

import type {
  Measurements,
  PatternData,
  PatternType,
  PantOptions,
} from '../types';

import {
  calculateOnePieceDress,
  DEFAULT_MEASUREMENTS as ONE_PIECE_DEFAULTS,
} from '../calculations/onePieceDress';
import { calculateShirtPattern } from '../calculations/shirt';
import { calculatePantPattern } from '../calculations/pant';
import { calculateTShirtPattern } from '../calculations/tshirt';
import { calculateKurtaPattern } from '../calculations/kurta';
import { calculateBlousePattern } from '../calculations/blouse';
import { calculateChudidarPattern } from '../calculations/chudidar';
import { calculateSalwarPattern } from '../calculations/salwar';
import { calculateSkirtPattern } from '../calculations/skirt';
import { calculateKurtiPattern } from '../calculations/kurti';
import { calculateKidsPattern } from '../calculations/kids';
import { calculateJacketPattern } from '../calculations/jacket';
import { calculateTopPattern } from '../calculations/top';

// Re-export individual calculation functions for direct modular use
export {
  calculateOnePieceDress,
  calculateShirtPattern,
  calculatePantPattern,
  calculateTShirtPattern,
  calculateKurtaPattern,
  calculateBlousePattern,
  calculateChudidarPattern,
  calculateSalwarPattern,
  calculateSkirtPattern,
  calculateKurtiPattern,
  calculateKidsPattern,
  calculateJacketPattern,
  calculateTopPattern,
};

export interface DressPatternMeta {
  patternType: 'tshirt' | 'shirt' | 'pant' | 'kurta' | 'blouse' | 'chudidar' | 'salwar' | 'skirt' | 'kurti' | 'kids' | 'frock' | 'jacket' | 'top';
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
    fabricNote: 'Traditional kurti tunic with side slit and feminine waist shaping.',
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
    fabricNote: 'Fitted saree blouse with princess cut, deep back neck, and underbust belt.',
  },
  SHIRT: {
    patternType: 'shirt',
    measurements: ['bust', 'shoulderWidth', 'fullLength', 'sleeveLength', 'neckWidth'],
    previewType: 'shirt',
    fabricNote: 'Structured shirt with separate yoke, button stand, collar band, collar leaf & cuffs.',
  },
  PANT: {
    patternType: 'pant',
    measurements: ['waist', 'hip', 'outseam', 'inseam', 'thighCircumference'],
    previewType: 'pant',
    fabricNote: 'Trouser front/back panels with distinct crotch curves, curved waistband & pocket facing.',
  },
  TSHIRT: {
    patternType: 'tshirt',
    measurements: ['bust', 'shoulderWidth', 'fullLength', 'sleeveLength', 'neckWidth'],
    previewType: 'tshirt',
    fabricNote: 'Relaxed knitwear body with round neck curve and 85% ribbing neckband strip.',
  },
  CHUDIDAR: {
    patternType: 'chudidar',
    measurements: ['waist', 'hip', 'outseam', 'inseam', 'bottomWidth'],
    previewType: 'chudidar',
    fabricNote: 'Fitted bias-cut leg with narrow ankle contour and +12" extra length for gathered churis.',
  },
  SALWAR: {
    patternType: 'salwar',
    measurements: ['waist', 'hip', 'outseam', 'inseam', 'bottomWidth'],
    previewType: 'salwar',
    fabricNote: 'Voluminous pleated salwar with wide thigh kalis, upper waist belt & ankle poncha cuff.',
  },
  SKIRT: {
    patternType: 'skirt',
    measurements: ['waist', 'hip', 'fullLength', 'bottomWidth', 'flare'],
    previewType: 'skirt',
    fabricNote: 'A-line skirt block with waist darts, hip curve, and mathematically distributed flare sweep.',
  },
  KIDS: {
    patternType: 'kids',
    measurements: ['bust', 'waist', 'fullLength', 'shoulderWidth'],
    previewType: 'kids',
    fabricNote: "Children's garment draft with 1:1 chest/waist ratio, shallow shoulder slope & back closure.",
  },
  JACKET: {
    patternType: 'jacket',
    measurements: ['bust', 'waist', 'hip', 'fullLength', 'shoulderWidth', 'sleeveLength'],
    previewType: 'jacket',
    fabricNote: 'Structured jacket with notch lapel, shoulder pad extension, button overlap & set-in sleeve.',
  },
  TOP: {
    patternType: 'top',
    measurements: [
      'bust', 'waist', 'hip', 'fullLength', 'shoulderWidth', 'shoulderSlope',
      'neckWidth', 'neckDepth', 'backNeckDepth', 'armholeDepth', 'waistLength',
      'hipDepth', 'sleeveLength', 'bicepCircumference',
    ],
    previewType: 'top',
    fabricNote: 'Relaxed casual top with scoop neckline, curved waist shaping & cap sleeve.',
  },
};

export interface PatternDefinition {
  id: PatternType;
  label: string;
  description: string;
  defaultMeasurements: Measurements;
  calculate: (measurements: Measurements, scale: number, pantOptions?: PantOptions) => PatternData;
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
    description: 'Traditional kurti tunic with shaped side waist & side slit draft',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateKurtiPattern,
  },
  KURTA: {
    id: 'KURTA',
    label: 'Ethnic Kurta',
    description: 'Ethnic Indian kurta with mandarin band collar and side slits',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateKurtaPattern,
  },
  BLOUSE: {
    id: 'BLOUSE',
    label: 'Fitted Saree Blouse',
    description: 'Form-fitting saree blouse draft with princess seam cut & patti belt',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateBlousePattern,
  },
  SHIRT: {
    id: 'SHIRT',
    label: 'Formal / Casual Shirt',
    description: 'Classic shirt pattern with yoke slope, button stand, collar band & leaf',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateShirtPattern,
  },
  PANT: {
    id: 'PANT',
    label: 'Trouser / Formal Pant',
    description: 'Trouser leg draft with crotch curve, back rise tilt, waistband & pocket facing',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: (m, scale, pantOptions) => calculatePantPattern(m, scale, pantOptions),
  },
  TSHIRT: {
    id: 'TSHIRT',
    label: 'Round Neck T-Shirt',
    description: 'Casual knit tee with round neck curve and 85% ribbing neckband strip',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateTShirtPattern,
  },
  CHUDIDAR: {
    id: 'CHUDIDAR',
    label: 'Fitted Chudidar',
    description: 'Fitted bias leg draft with narrow ankle contour and +12" gathered churis',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateChudidarPattern,
  },
  SALWAR: {
    id: 'SALWAR',
    label: 'Pleated Salwar',
    description: 'Voluminous loose leg panel with waist pleats, upper belt, and ankle poncha band',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateSalwarPattern,
  },
  SKIRT: {
    id: 'SKIRT',
    label: 'A-Line / Flared Skirt',
    description: 'A-line flared skirt with waist darts and curved hem',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateSkirtPattern,
  },
  KIDS: {
    id: 'KIDS',
    label: "Kids' Wear",
    description: "Children's garment draft with child body proportions and soft neck curve",
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateKidsPattern,
  },
  JACKET: {
    id: 'JACKET',
    label: 'Structured Jacket',
    description: 'Structured jacket with notch lapel, lapel facing, set-in sleeve & welt flap',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateJacketPattern,
  },
  TOP: {
    id: 'TOP',
    label: 'Casual Top',
    description: 'Relaxed casual top with scoop neckline, curved waist & cap sleeve',
    defaultMeasurements: ONE_PIECE_DEFAULTS,
    calculate: calculateTopPattern,
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
  'SALWAR',
  'SKIRT',
  'KURTI',
  'KIDS',
  'JACKET',
  'TOP',
];
