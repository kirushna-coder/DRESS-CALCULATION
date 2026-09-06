// ============================================================
// FabriPlay – Fit Confidence Score Calculation Engine
// Analyzes body proportions, measurement completeness, and fit preferences
// ============================================================

import type { Measurements, DressType } from '../types';

export type FitStatus = 'Excellent Match' | 'Good Match' | 'Needs Adjustment';
export type FitPreferenceOption = 'Slim' | 'Regular' | 'Loose' | 'Comfort';

export interface FitConfidenceResult {
  score: number; // 0 to 100
  status: FitStatus;
  fitPreference: FitPreferenceOption;
  accurateAreas: string[];
  adjustmentAreas: string[];
  tailoringSuggestions: string[];
  completenessPercent: number;
}

export function calculateFitConfidenceScore(
  measurements: Measurements,
  _dressType: DressType = 'FROCK',
  fitPreference: FitPreferenceOption = 'Regular'
): FitConfidenceResult {
  let score = 100;
  const accurateAreas: string[] = [];
  const adjustmentAreas: string[] = [];
  const tailoringSuggestions: string[] = [];

  // 1. Measurement Completeness Check (Max 30 pts)
  const coreFields: (keyof Measurements)[] = ['bust', 'waist', 'hip', 'fullLength', 'shoulderWidth'];
  const optionalFields: (keyof Measurements)[] = ['height', 'weight', 'armholeDepth', 'neckWidth', 'sleeveLength'];

  let filledCore = 0;
  coreFields.forEach((field) => {
    if (measurements[field] && (measurements[field] as number) > 0) filledCore++;
  });

  let filledOpt = 0;
  optionalFields.forEach((field) => {
    if (measurements[field] && (measurements[field] as number) > 0) filledOpt++;
  });

  const completenessPercent = Math.round(
    ((filledCore / coreFields.length) * 0.7 + (filledOpt / optionalFields.length) * 0.3) * 100
  );

  if (completenessPercent < 70) {
    score -= (100 - completenessPercent) * 0.3;
    adjustmentAreas.push('Incomplete measurement profile: Add height, weight, and armhole depth for highest precision');
  } else {
    accurateAreas.push('Core measurements (Bust, Waist, Hip, Length) are fully provided');
  }

  // 2. Proportion Analysis (Bust, Waist, Hip)
  const bust = measurements.bust || 36;
  const waist = measurements.waist || 30;
  const hip = measurements.hip || 38;

  const waistToHipRatio = waist / Math.max(1, hip);
  const bustToWaistRatio = bust / Math.max(1, waist);

  // Bust vs Waist proportion check
  if (bustToWaistRatio >= 1.1 && bustToWaistRatio <= 1.35) {
    accurateAreas.push('Bust-to-Waist balance matches standard pattern proportions');
  } else if (bustToWaistRatio < 1.05) {
    score -= 4;
    adjustmentAreas.push('Bust-to-Waist ratio is relatively straight (+1" ease recommended at waist for comfort)');
    tailoringSuggestions.push('Consider adding slight waist tapering to enhance contouring without tightness');
  } else if (bustToWaistRatio > 1.4) {
    score -= 5;
    adjustmentAreas.push('Pronounced bust difference (+1.5" ease required at bust seams)');
    tailoringSuggestions.push('Use princess seams or double bust darts to prevent tension lines');
  }

  // Waist vs Hip proportion check
  if (waistToHipRatio <= 0.85) {
    accurateAreas.push('Waist-to-Hip curve is well balanced for standard flare/ease allowances');
  } else if (waistToHipRatio > 0.92) {
    score -= 4;
    adjustmentAreas.push('Waist-to-Hip transition is fuller (+1" side seam allowance recommended)');
    tailoringSuggestions.push('Incorporate side elastic panels or a relaxed waistband for movement flexibility');
  }

  // Height & Weight BMI check if available
  if (measurements.height && measurements.weight) {
    const heightM = measurements.height / 100;
    const bmi = measurements.weight / (heightM * heightM);
    if (bmi >= 18.5 && bmi <= 25) {
      accurateAreas.push('Height & Weight metrics align with standard ergonomic drape grids');
    } else if (bmi > 25 && fitPreference === 'Slim') {
      score -= 6;
      adjustmentAreas.push('Slim Fit selected with high BMI metrics may cause drape tension on movement');
      tailoringSuggestions.push('Switching to Regular Fit will provide superior drape and crease-free posture');
    }
  }

  // Fit Preference Ease Evaluation
  const ease = measurements.ease || 2;
  if (fitPreference === 'Slim' && ease > 2.5) {
    score -= 3;
    adjustmentAreas.push(`Garment ease allowance (+${ease}") is higher than standard Slim Fit allowance (1.5")`);
    tailoringSuggestions.push('Reduce ease parameter to 1.5" for a sleek contour fit');
  } else if (fitPreference === 'Loose' && ease < 2.5) {
    score -= 3;
    adjustmentAreas.push(`Garment ease allowance (+${ease}") is lower than standard Loose Fit allowance (3.0")`);
    tailoringSuggestions.push('Increase ease parameter to 3.0" for a flowing relaxed silhouette');
  } else {
    accurateAreas.push(`Ease allowance (+${ease}") matches selected ${fitPreference} Fit preference`);
  }

  // Final score clamping & status assignment
  const finalScore = Math.min(100, Math.max(55, Math.round(score)));

  let status: FitStatus = 'Excellent Match';
  if (finalScore < 75) {
    status = 'Needs Adjustment';
  } else if (finalScore < 88) {
    status = 'Good Match';
  }

  if (tailoringSuggestions.length === 0) {
    tailoringSuggestions.push('Standard cutting pattern fits directly; no seam modifications needed.');
    tailoringSuggestions.push('Ensure 1.0 inch seam margins during cutting for minor fitting tweaks.');
  }

  return {
    score: finalScore,
    status,
    fitPreference,
    accurateAreas,
    adjustmentAreas,
    tailoringSuggestions,
    completenessPercent,
  };
}
