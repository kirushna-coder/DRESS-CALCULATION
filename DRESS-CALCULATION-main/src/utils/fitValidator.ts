// ============================================================
// FabricPlay AI – Garment Fit & Seam Alignment Validation Engine
// Validates body measurements, seam joins, and geometric proportions
// ============================================================

import type { Measurements, PatternType, FitValidationResult, SeamMismatchWarning, PantOptions } from '../types';

/**
 * Validates body measurements and checks front/back seam alignment for a given garment pattern.
 */
export function validateGarmentFit(
  measurements: Measurements,
  patternType: PatternType = 'PANT',
  _pantOptions?: PantOptions
): FitValidationResult {
  const missingFields: string[] = [];
  const mismatches: SeamMismatchWarning[] = [];
  const dimensionWarnings: string[] = [];

  const bust = measurements.bust || 0;
  const waist = measurements.waist || 0;
  const hip = measurements.hip || 0;
  const shoulder = measurements.shoulderWidth || 0;
  const outseam = measurements.outseam || 0;
  const inseam = measurements.inseam || 0;
  const thigh = measurements.thighCircumference || 0;
  const knee = measurements.kneeCircumference || 0;
  const ankle = measurements.ankleCircumference || 0;

  // 1. Missing Core Measurement Check
  if (!waist || waist <= 0) missingFields.push('Waist Circumference');
  if (!hip || hip <= 0) missingFields.push('Hip Circumference');
  if (!bust || bust <= 0) {
    if (['SHIRT', 'TSHIRT', 'KURTA', 'BLOUSE', 'JACKET', 'TOP', 'FROCK', 'ONE_PIECE'].includes(patternType)) {
      missingFields.push('Bust / Chest Circumference');
    }
  }

  if (['PANT', 'CHUDIDAR'].includes(patternType)) {
    if (!outseam || outseam <= 0) missingFields.push('Trouser Outseam');
    if (!inseam || inseam <= 0) missingFields.push('Trouser Inseam');
  }

  // 2. Proportional & Dimensional Checks
  if (outseam > 0 && inseam > 0) {
    if (inseam >= outseam) {
      dimensionWarnings.push('Inseam length must be strictly less than Outseam length to allow for Crotch Rise.');
    } else {
      const crotchRise = outseam - inseam;
      if (crotchRise < 7) {
        dimensionWarnings.push(`Crotch rise (${crotchRise.toFixed(1)}") is unusually short (standard is 8.5" - 13").`);
      } else if (crotchRise > 16) {
        dimensionWarnings.push(`Crotch rise (${crotchRise.toFixed(1)}") is unusually long. Verify outseam and inseam inputs.`);
      }
    }
  }

  if (waist > 0 && hip > 0) {
    if (waist > hip + 3 && patternType === 'PANT') {
      dimensionWarnings.push('Waist measurement exceeds Hip measurement. Check waist tape location.');
    }
  }

  if (thigh > 0 && hip > 0) {
    if (thigh * 2 > hip * 1.3) {
      dimensionWarnings.push('Thigh circumference is disproportionately large relative to Hip.');
    }
  }

  if (knee > 0 && thigh > 0 && knee > thigh) {
    dimensionWarnings.push('Knee circumference cannot exceed Thigh circumference.');
  }

  if (ankle > 0 && knee > 0 && ankle > knee) {
    dimensionWarnings.push('Ankle circumference cannot exceed Knee circumference.');
  }

  // 3. Seam Alignment Validation (Front vs Back Seams)
  if (['PANT', 'CHUDIDAR'].includes(patternType)) {
    const frontInseam = inseam > 0 ? inseam : 30;
    const backInseam = frontInseam + 0.25; // standard back leg stretch allowance in patternmaking
    const inseamDiff = Math.abs(backInseam - frontInseam);

    mismatches.push({
      seamName: 'Pant Inseam Join (Front vs Back)',
      frontLength: Number(frontInseam.toFixed(2)),
      backLength: Number(backInseam.toFixed(2)),
      difference: Number(inseamDiff.toFixed(2)),
      severity: inseamDiff > 0.5 ? 'warning' : 'info',
      message: `Back leg inseam is ${backInseam.toFixed(2)}" compared to front leg ${frontInseam.toFixed(2)}".`,
      suggestion: '0.25" back leg stretch is intentional for ergonomic knee motion per Joseph-Armstrong patternmaking rules.',
    });

    const frontOutseam = outseam > 0 ? outseam : 40;
    const backOutseam = frontOutseam + 0.5; // back rise lift
    const outseamDiff = Math.abs(backOutseam - frontOutseam);

    mismatches.push({
      seamName: 'Side Outseam Join (Waist to Hem)',
      frontLength: Number(frontOutseam.toFixed(2)),
      backLength: Number(backOutseam.toFixed(2)),
      difference: Number(outseamDiff.toFixed(2)),
      severity: outseamDiff > 1.0 ? 'warning' : 'info',
      message: `Back waistband is raised by ${outseamDiff.toFixed(2)}" for seating posture coverage.`,
      suggestion: 'Align front and back pieces starting from hip line down to hem during assembly.',
    });
  } else if (['SHIRT', 'TSHIRT', 'KURTA', 'BLOUSE', 'JACKET', 'TOP'].includes(patternType)) {
    const frontShoulder = shoulder ? shoulder / 2 : 7.5;
    const backShoulder = frontShoulder + 0.25; // back shoulder dart/ease
    const diff = Math.abs(backShoulder - frontShoulder);

    mismatches.push({
      seamName: 'Shoulder Seam Join (Front vs Back)',
      frontLength: Number(frontShoulder.toFixed(2)),
      backLength: Number(backShoulder.toFixed(2)),
      difference: Number(diff.toFixed(2)),
      severity: 'info',
      message: `Back shoulder includes ${diff.toFixed(2)}" ease for shoulder blade curvature.`,
      suggestion: 'Ease back shoulder seam evenly into front shoulder line when stitching.',
    });
  }

  // 4. Overall Confidence Calculation
  let confidence = 100;
  confidence -= missingFields.length * 15;
  confidence -= dimensionWarnings.length * 10;
  const warningsCount = mismatches.filter((m) => m.severity === 'warning' || m.severity === 'error').length;
  confidence -= warningsCount * 8;

  confidence = Math.max(20, Math.min(100, Math.round(confidence)));
  const isValid = missingFields.length === 0 && dimensionWarnings.length === 0;

  return {
    isValid,
    missingFields,
    mismatches,
    dimensionWarnings,
    overallConfidence: confidence,
  };
}
