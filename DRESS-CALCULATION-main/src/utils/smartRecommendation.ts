import type { Gender, PhotoLandmarks } from '../types';

export type SizeLabel = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type FitPreference = 'Slim' | 'Regular' | 'Loose';
export type BodyShape =
  | 'Rectangle'
  | 'Hourglass'
  | 'Pear'
  | 'Apple'
  | 'Inverted Triangle'
  | 'Triangle'
  | 'Trapezoid'
  | 'Oval';

export interface SmartProfile {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  chest: number;
  waist: number;
  hip: number;
  fit: FitPreference;
}

export interface SmartRecommendation {
  size: SizeLabel;
  confidence: number;
  bodyShape: BodyShape;
  bmi: number;
  bmiCategory: 'Underweight' | 'Healthy range' | 'Overweight' | 'Obesity';
  fit: FitPreference;
  explanation: string;
  shapeExplanation: string;
  styles: string[];
  photoInsights?: {
    visualWaistToHip: number;
    visualFitAdjustment: string;
    alignmentScore: number;
    comparisonNote: string;
  };
}

const SIZE_CHART = [
  { size: 'XS' as const, chest: [78, 86], waist: [60, 68], hip: [84, 92], height: [150, 165] },
  { size: 'S' as const, chest: [86, 92], waist: [68, 76], hip: [92, 98], height: [155, 170] },
  { size: 'M' as const, chest: [92, 100], waist: [76, 84], hip: [98, 106], height: [160, 178] },
  { size: 'L' as const, chest: [100, 108], waist: [84, 94], hip: [106, 114], height: [165, 183] },
  { size: 'XL' as const, chest: [108, 118], waist: [94, 106], hip: [114, 124], height: [168, 188] },
  { size: 'XXL' as const, chest: [118, 130], waist: [106, 120], hip: [124, 136], height: [170, 195] },
];

export const SIZE_CHARTS = {
  Women: SIZE_CHART,
  Men: SIZE_CHART.map((row) => ({
    ...row,
    chest: [row.chest[0] + 4, row.chest[1] + 6] as [number, number],
    hip: [row.hip[0] + 2, row.hip[1] + 4] as [number, number],
  })),
  Kids: [
    { size: 'XS' as const, chest: [52, 58], waist: [50, 54], hip: [56, 62], height: [95, 110] },
    { size: 'S' as const, chest: [58, 64], waist: [54, 58], hip: [62, 68], height: [110, 125] },
    { size: 'M' as const, chest: [64, 70], waist: [58, 62], hip: [68, 74], height: [125, 140] },
    { size: 'L' as const, chest: [70, 76], waist: [62, 68], hip: [74, 80], height: [140, 150] },
    { size: 'XL' as const, chest: [76, 82], waist: [68, 74], hip: [80, 86], height: [150, 158] },
    { size: 'XXL' as const, chest: [82, 90], waist: [74, 82], hip: [86, 94], height: [158, 165] },
  ],
};

export function calculateSmartRecommendation(
  profile: SmartProfile,
  photoLandmarks?: PhotoLandmarks | null
): SmartRecommendation {
  const bmi = Number((profile.weight / (profile.height / 100) ** 2).toFixed(1));
  const bmiCategory =
    bmi < 18.5
      ? 'Underweight'
      : bmi < 25
      ? 'Healthy range'
      : bmi < 30
      ? 'Overweight'
      : 'Obesity';

  const largestMeasurement = Math.max(profile.chest, profile.waist, profile.hip);
  const sizeIndex = SIZE_CHART.findIndex(
    (row) => largestMeasurement <= Math.max(row.chest[1], row.waist[1], row.hip[1])
  );
  const fitAdjustment = profile.fit === 'Loose' ? 1 : profile.fit === 'Slim' ? -1 : 0;
  const size =
    SIZE_CHART[Math.min(5, Math.max(0, (sizeIndex < 0 ? 5 : sizeIndex) + fitAdjustment))].size;

  const row = SIZE_CHART.find((item) => item.size === size)!;
  const distances = [profile.chest, profile.waist, profile.hip].map((value, index) => {
    const range = [row.chest, row.waist, row.hip][index];
    return Math.min(Math.abs(value - range[0]), Math.abs(value - range[1]));
  });
  let confidence = Math.max(
    72,
    Math.min(98, Math.round(98 - (distances.reduce((sum, value) => sum + value, 0) / 3) * 1.5))
  );

  const waistRatio = profile.waist / Math.max(profile.hip, 1);
  let bodyShape: BodyShape = 'Rectangle';

  const isFemale = profile.gender === 'female';
  const isMale = profile.gender === 'male';

  if (isFemale) {
    if (waistRatio < 0.78 && Math.abs(profile.chest - profile.hip) < 8) bodyShape = 'Hourglass';
    else if (profile.hip - profile.chest > 8) bodyShape = 'Pear';
    else if (profile.chest - profile.hip > 8) bodyShape = 'Inverted Triangle';
    else if (waistRatio > 0.86) bodyShape = 'Apple';
  } else if (isMale) {
    if (waistRatio > 0.94) bodyShape = 'Oval';
    else if (profile.chest - profile.hip > 10) bodyShape = 'Inverted Triangle';
    else if (profile.hip - profile.chest > 8) bodyShape = 'Triangle';
    else if (profile.chest / Math.max(profile.waist, 1) > 1.18) bodyShape = 'Trapezoid';
  } else {
    // For 'other', 'prefer_not_to_say', 'unisex', 'kids'
    if (waistRatio < 0.78) bodyShape = 'Hourglass';
    else if (profile.hip - profile.chest > 8) bodyShape = 'Pear';
    else if (profile.chest - profile.hip > 8) bodyShape = 'Inverted Triangle';
    else if (waistRatio > 0.88) bodyShape = 'Oval';
  }

  let shapeExplanation = `${bodyShape} pattern detected from chest-to-hip balance and a ${waistRatio.toFixed(
    2
  )} waist-to-hip ratio.`;

  // Base styles
  let styles: string[] = [];
  if (isFemale) {
    styles =
      bodyShape === 'Pear'
        ? ['A-line dress', 'High-waist jeans', 'Structured blouse']
        : bodyShape === 'Hourglass'
        ? ['Tailored wrap dress', 'Slim fit shirt', 'High-waist trousers']
        : ['A-line dress', 'Regular fit shirt', 'Straight fit jeans'];
  } else if (isMale) {
    styles =
      bodyShape === 'Inverted Triangle'
        ? ['Regular fit shirt', 'Straight fit jeans', 'Soft-shoulder casual wear']
        : ['Slim fit shirt', 'Straight fit jeans', 'Smart casual wear'];
  } else {
    styles = ['Structured blazer', 'Straight fit trousers', 'Tailored casual wear'];
  }

  let photoInsights: SmartRecommendation['photoInsights'] | undefined;

  if (photoLandmarks && photoLandmarks.fullBodyDetected) {
    const visualRatio = photoLandmarks.waistToHipRatio;
    const ratioDiff = Math.abs(visualRatio - waistRatio);
    const alignmentScore = Math.max(82, Math.min(99, Math.round(99 - ratioDiff * 25)));

    // Boost confidence slightly when visual proportions match manual metrics
    confidence = Math.min(99, confidence + Math.round((alignmentScore - 80) / 4));

    const comparisonNote = `Visual body photo proportions (ratio ${visualRatio}) align within ${alignmentScore}% of entered measurements (${profile.chest}cm bust/chest, ${profile.waist}cm waist, ${profile.hip}cm hip).`;

    photoInsights = {
      visualWaistToHip: visualRatio,
      visualFitAdjustment: photoLandmarks.visualFitAdjustment,
      alignmentScore,
      comparisonNote,
    };

    shapeExplanation += ` Photo analysis confirmed ${photoLandmarks.visualFitAdjustment} visual structure.`;

    // Dynamic style additions based on visual photo proportion analysis
    if (photoLandmarks.visualFitAdjustment === 'Broad Shoulders') {
      styles.unshift('Raglan-sleeve shirt');
    } else if (photoLandmarks.visualFitAdjustment === 'Tapered Waist') {
      styles.unshift('Belted silhouette dress');
    } else if (photoLandmarks.visualFitAdjustment === 'Fuller Frame') {
      styles.unshift('Relaxed-drape tunic');
    }
  }

  const genderLabel =
    profile.gender === 'female'
      ? 'Female'
      : profile.gender === 'male'
      ? 'Male'
      : profile.gender === 'other'
      ? 'Other'
      : profile.gender === 'prefer_not_to_say'
      ? 'User-controlled (Prefer not to say)'
      : profile.gender;

  return {
    size,
    confidence,
    bodyShape,
    bmi,
    bmiCategory,
    fit: profile.fit,
    explanation: `${size} balances your ${profile.chest} cm chest/bust, ${profile.waist} cm waist, and ${profile.hip} cm hip (${genderLabel} profile). ${profile.fit} fit preference was included in the sizing adjustment.${
      photoLandmarks?.fullBodyDetected
        ? ' Enhanced with visual photo proportion analysis.'
        : ''
    }`,
    shapeExplanation,
    styles,
    photoInsights,
  };
}
