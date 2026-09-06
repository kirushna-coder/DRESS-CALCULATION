// ============================================================
// FabriPlay – Fabric Recommendation Engine
// Analyzes dress type, measurements, preferred fit, occasion & budget
// ============================================================

import type { DressType, FabricType, Currency, Measurements } from '../types';
import { calculateFabricRequirement } from '../calculations/fabricCalculator';

export type OccasionOption = 'Casual' | 'Summer' | 'Formal' | 'Festive' | 'Evening';
export type BudgetOption = 'Budget' | 'Standard' | 'Premium';
export type FitOption = 'Slim' | 'Regular' | 'Loose';

export interface FabricRecommendationDetail {
  fabricType: FabricType;
  fabricName: string;
  comfortScore: number; // 0 - 100%
  durabilityScore: number; // 0 - 100%
  breathability: 'High' | 'Medium' | 'Low';
  drape: 'Crisp' | 'Soft' | 'Heavy' | 'Fluid' | 'Structured';
  care: 'Easy Care' | 'Dry Clean Only' | 'Gentle Wash';
  whyRecommended: string;
  pricePerMeterRange: { min: number; max: number };
  estimatedRequiredMeters: number;
  estimatedRequiredYards: number;
  estimatedTotalPriceRange: { min: number; max: number };
  isPrimaryChoice: boolean;
}

export interface FabricRecommendationOutput {
  primaryRecommendation: FabricRecommendationDetail;
  allFabricsComparison: FabricRecommendationDetail[];
  occasion: OccasionOption;
  budget: BudgetOption;
  fit: FitOption;
}

const FABRIC_METRICS: Record<
  FabricType,
  {
    name: string;
    baseComfort: number;
    baseDurability: number;
    breathability: 'High' | 'Medium' | 'Low';
    drape: 'Crisp' | 'Soft' | 'Heavy' | 'Fluid' | 'Structured';
    care: 'Easy Care' | 'Dry Clean Only' | 'Gentle Wash';
    basePricePerMeterINR: { min: number; max: number };
    bestOccasions: OccasionOption[];
    bestGarments: DressType[];
  }
> = {
  COTTON: {
    name: 'Cotton',
    baseComfort: 95,
    baseDurability: 85,
    breathability: 'High',
    drape: 'Soft',
    care: 'Easy Care',
    basePricePerMeterINR: { min: 250, max: 450 },
    bestOccasions: ['Casual', 'Summer'],
    bestGarments: ['SHIRT', 'KURTA', 'FROCK', 'TSHIRT', 'BLOUSE'],
  },
  LINEN: {
    name: 'Linen',
    baseComfort: 92,
    baseDurability: 88,
    breathability: 'High',
    drape: 'Crisp',
    care: 'Gentle Wash',
    basePricePerMeterINR: { min: 450, max: 850 },
    bestOccasions: ['Summer', 'Casual', 'Formal'],
    bestGarments: ['SHIRT', 'PANT', 'KURTA'],
  },
  SILK: {
    name: 'Silk',
    baseComfort: 90,
    baseDurability: 75,
    breathability: 'Medium',
    drape: 'Fluid',
    care: 'Dry Clean Only',
    basePricePerMeterINR: { min: 800, max: 1800 },
    bestOccasions: ['Festive', 'Evening', 'Formal'],
    bestGarments: ['BLOUSE', 'FROCK', 'KURTA', 'SKIRT'],
  },
  DENIM: {
    name: 'Denim',
    baseComfort: 78,
    baseDurability: 96,
    breathability: 'Medium',
    drape: 'Structured',
    care: 'Easy Care',
    basePricePerMeterINR: { min: 350, max: 700 },
    bestOccasions: ['Casual'],
    bestGarments: ['PANT', 'SKIRT', 'SHIRT'],
  },
  RAYON: {
    name: 'Rayon',
    baseComfort: 88,
    baseDurability: 72,
    breathability: 'High',
    drape: 'Fluid',
    care: 'Gentle Wash',
    basePricePerMeterINR: { min: 200, max: 400 },
    bestOccasions: ['Casual', 'Summer', 'Evening'],
    bestGarments: ['FROCK', 'SKIRT', 'BLOUSE', 'KURTA'],
  },
  POLYESTER: {
    name: 'Polyester Blend',
    baseComfort: 74,
    baseDurability: 94,
    breathability: 'Low',
    drape: 'Structured',
    care: 'Easy Care',
    basePricePerMeterINR: { min: 150, max: 300 },
    bestOccasions: ['Casual', 'Formal'],
    bestGarments: ['SHIRT', 'PANT', 'TSHIRT'],
  },
  GEORGETTE: {
    name: 'Georgette',
    baseComfort: 84,
    baseDurability: 70,
    breathability: 'Medium',
    drape: 'Fluid',
    care: 'Gentle Wash',
    basePricePerMeterINR: { min: 300, max: 600 },
    bestOccasions: ['Festive', 'Evening'],
    bestGarments: ['FROCK', 'BLOUSE', 'SKIRT'],
  },
  VELVET: {
    name: 'Velvet',
    baseComfort: 82,
    baseDurability: 80,
    breathability: 'Low',
    drape: 'Heavy',
    care: 'Dry Clean Only',
    basePricePerMeterINR: { min: 600, max: 1200 },
    bestOccasions: ['Festive', 'Evening'],
    bestGarments: ['BLOUSE', 'FROCK', 'KURTA'],
  },
  WOOL: {
    name: 'Wool',
    baseComfort: 80,
    baseDurability: 90,
    breathability: 'Medium',
    drape: 'Structured',
    care: 'Dry Clean Only',
    basePricePerMeterINR: { min: 700, max: 1500 },
    bestOccasions: ['Formal'],
    bestGarments: ['SHIRT', 'PANT'],
  },
};

const CURRENCY_CONVERSION: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
};

export function recommendSmartFabric(
  dressType: DressType,
  measurements: Measurements,
  fit: FitOption = 'Regular',
  occasion: OccasionOption = 'Casual',
  budget: BudgetOption = 'Standard',
  currency: Currency = 'INR'
): FabricRecommendationOutput {
  const calc = calculateFabricRequirement({ garmentType: dressType, fabricType: 'COTTON', measurements });
  const requiredMeters = calc.requiredLengthMeters;
  const requiredYards = calc.requiredLengthYards;

  const fabricKeys: FabricType[] = ['COTTON', 'LINEN', 'SILK', 'DENIM', 'RAYON', 'POLYESTER'];
  const currencyRate = CURRENCY_CONVERSION[currency] || 1;

  let topScore = -1;
  let topFabricKey: FabricType = 'COTTON';

  const comparisonDetails: FabricRecommendationDetail[] = fabricKeys.map((key) => {
    const meta = FABRIC_METRICS[key];
    let score = meta.baseComfort * 0.5 + meta.baseDurability * 0.3;

    // Occasion match boost
    if (meta.bestOccasions.includes(occasion)) {
      score += 15;
    }
    // Garment match boost
    if (meta.bestGarments.includes(dressType)) {
      score += 12;
    }

    // Budget matching
    const avgPriceINR = (meta.basePricePerMeterINR.min + meta.basePricePerMeterINR.max) / 2;
    if (budget === 'Budget' && avgPriceINR <= 350) score += 10;
    if (budget === 'Standard' && avgPriceINR >= 250 && avgPriceINR <= 750) score += 10;
    if (budget === 'Premium' && avgPriceINR >= 500) score += 10;

    // Rationale construction
    let rationale = `${meta.name} is ${meta.breathability.toLowerCase()}-breathability with ${meta.drape.toLowerCase()} drape.`;
    if (occasion === 'Summer' && (key === 'COTTON' || key === 'LINEN')) {
      rationale = 'Breathable, highly comfortable and keeps cool in summer heat.';
    } else if (occasion === 'Festive' && key === 'SILK') {
      rationale = 'Luxurious sheen, soft drape, perfect for festive and celebratory events.';
    } else if (occasion === 'Casual' && key === 'COTTON') {
      rationale = 'Soft, breathable, skin-friendly, ideal for comfortable daily wear.';
    } else if (occasion === 'Formal' && (key === 'LINEN' || key === 'COTTON')) {
      rationale = 'Crisp structural look with excellent durability for formal attire.';
    }

    if (score > topScore) {
      topScore = score;
      topFabricKey = key;
    }

    const minPrice = Math.round(meta.basePricePerMeterINR.min * currencyRate);
    const maxPrice = Math.round(meta.basePricePerMeterINR.max * currencyRate);

    return {
      fabricType: key,
      fabricName: meta.name,
      comfortScore: meta.baseComfort,
      durabilityScore: meta.baseDurability,
      breathability: meta.breathability,
      drape: meta.drape,
      care: meta.care,
      whyRecommended: rationale,
      pricePerMeterRange: { min: minPrice, max: maxPrice },
      estimatedRequiredMeters: requiredMeters,
      estimatedRequiredYards: requiredYards,
      estimatedTotalPriceRange: {
        min: Math.round(minPrice * requiredMeters),
        max: Math.round(maxPrice * requiredMeters),
      },
      isPrimaryChoice: false,
    };
  });

  const updatedComparison = comparisonDetails.map((item) => ({
    ...item,
    isPrimaryChoice: item.fabricType === topFabricKey,
  }));

  const primary = updatedComparison.find((i) => i.isPrimaryChoice) || updatedComparison[0];

  return {
    primaryRecommendation: primary,
    allFabricsComparison: updatedComparison,
    occasion,
    budget,
    fit,
  };
}
