// ============================================================
// SmartTailor AI – Smart Fabric Consumption & Cost Engine
// Calculates precise fabric requirements and itemized pricing
// ============================================================

import type {
  Measurements,
  DressType,
  FabricType,
  TailoringAddOns,
  FabricCalculationResult,
} from '../types';
import { FABRICS, DRESS_TYPE_INFO } from '../utils/demoData';

interface CalculateFabricOptions {
  garmentType: DressType;
  fabricType: FabricType;
  measurements: Measurements;
  customPricePerMeter?: number;
  customStitchingCharge?: number;
  addOns?: TailoringAddOns;
  taxPercent?: number;
  discountPercent?: number;
}

export function calculateFabricRequirement(
  options: CalculateFabricOptions
): FabricCalculationResult {
  const {
    garmentType,
    fabricType,
    measurements: m,
    customPricePerMeter,
    customStitchingCharge,
    addOns = {
      lining: false,
      embroideryOrLace: false,
      premiumButtonsOrZips: false,
      expressDelivery: false,
      customCollarCuffs: false,
    },
    taxPercent = 0,
    discountPercent = 0,
  } = options;

  const fabricInfo = FABRICS[fabricType] || FABRICS.COTTON;
  const dressInfo = DRESS_TYPE_INFO[garmentType] || DRESS_TYPE_INFO.SHIRT;
  const isWideFabric = fabricInfo.standardWidthInches >= 54;

  const lengthInches = m.fullLength || dressInfo.defaultLength;
  const sleeveInches = m.sleeveLength || (garmentType === 'BLOUSE' ? 10 : 24);
  const bustInches = m.bust || 36;
  const flareInches = m.flare || 4;

  let totalInchesNeeded = 0;
  let layoutSuggestion = '';
  let wasteEstimate = 6;

  switch (garmentType) {
    case 'SHIRT': {
      if (isWideFabric) {
        // Wide fabric (58"): Front + Back cut side-by-side or stacked with sleeves alongside
        totalInchesNeeded = lengthInches + sleeveInches + 8; // Collar, cuffs, yoke, hems
        layoutSuggestion = 'Fold fabric lengthwise. Body panels in primary width, sleeves on fold side.';
        wasteEstimate = 6;
      } else {
        // Standard fabric (44"): Front + Back stacked vertically + Sleeves separate
        totalInchesNeeded = lengthInches * 2 + sleeveInches + 10;
        layoutSuggestion = 'Standard cross-fold. Two full body lengths plus single sleeve length.';
        wasteEstimate = 8;
      }
      break;
    }

    case 'PANT': {
      const pantLength = m.outseam || lengthInches;
      if (isWideFabric) {
        // Front and back panels fit side-by-side on 58" width for waist < 42
        if (bustInches <= 44) {
          totalInchesNeeded = pantLength + 8; // waistband, hem allowance, pocketing
          layoutSuggestion = 'Single length with parallel front & back leg panels side-by-side.';
          wasteEstimate = 7;
        } else {
          totalInchesNeeded = pantLength * 1.5 + 8;
          layoutSuggestion = 'Staggered leg panel placement to accommodate wider hip rise.';
          wasteEstimate = 10;
        }
      } else {
        // 44" width requires 2 full lengths
        totalInchesNeeded = pantLength * 2 + 10;
        layoutSuggestion = 'Two full lengths stacked with crotch curves interlocked to reduce waste.';
        wasteEstimate = 9;
      }
      break;
    }

    case 'TSHIRT': {
      if (isWideFabric) {
        totalInchesNeeded = lengthInches + sleeveInches + 4;
        layoutSuggestion = 'Fold selvage-to-selvage. Front, back, and short sleeves fit efficiently.';
        wasteEstimate = 5;
      } else {
        totalInchesNeeded = lengthInches * 2 + sleeveInches + 6;
        layoutSuggestion = 'Two garment lengths with ribbed collar trim on remnant fold.';
        wasteEstimate = 7;
      }
      break;
    }

    case 'KURTA': {
      // Kurta has front panel, back panel, sleeves, and side slit hems
      const extraFlare = (m.bottomWidth || 24) > 26 ? 6 : 0;
      if (isWideFabric) {
        totalInchesNeeded = lengthInches * 1.5 + sleeveInches + 8 + extraFlare;
        layoutSuggestion = 'Lengthwise folding with sleeves cut from remaining width alongside back yoke.';
        wasteEstimate = 7;
      } else {
        totalInchesNeeded = lengthInches * 2 + sleeveInches + 10 + extraFlare;
        layoutSuggestion = 'Straight grain layout. Front panel, back panel, and full sleeves stacked.';
        wasteEstimate = 8;
      }
      break;
    }

    case 'BLOUSE': {
      // Saree blouse: compact bodice + short/medium sleeves
      if (sleeveInches > 14) {
        totalInchesNeeded = lengthInches * 1.5 + sleeveInches + 6;
      } else {
        totalInchesNeeded = lengthInches * 2 + sleeveInches + 4;
      }
      // Minimum 0.85m to ensure enough margin for neck facing & hook plackets
      totalInchesNeeded = Math.max(34, totalInchesNeeded);
      layoutSuggestion = 'Cross-wise layout with bias cut neckline strips and padded cup lining.';
      wasteEstimate = 5;
      break;
    }

    case 'CHUDIDAR': {
      // Chudidar has gathers at ankles (churis) requiring extra diagonal bias length
      totalInchesNeeded = (m.outseam || lengthInches) * 2 + 18;
      totalInchesNeeded = Math.max(88, totalInchesNeeded); // ~2.25 meters minimum
      layoutSuggestion = 'Full bias (45-degree angle) cut for stretchy ankle gathers (churis).';
      wasteEstimate = 12;
      break;
    }

    case 'FROCK': {
      // Bodice + circular / gathered flared skirt + sleeves
      const bodiceLength = 15;
      const skirtLength = Math.max(20, lengthInches - bodiceLength);
      const flareMultiplier = flareInches > 6 ? 2.5 : 2.0;

      totalInchesNeeded = bodiceLength * 2 + skirtLength * flareMultiplier + sleeveInches + 10;
      layoutSuggestion = 'Radial umbrella / A-line panel cutting with bodice nested at top grain.';
      wasteEstimate = 11;
      break;
    }

    case 'SKIRT': {
      const skirtFlareMultiplier = flareInches > 6 ? 2.2 : 1.6;
      totalInchesNeeded = lengthInches * skirtFlareMultiplier + 8;
      layoutSuggestion = 'A-line 6-panel or circular umbrella cut with waistband on grain.';
      wasteEstimate = 9;
      break;
    }

    default:
      totalInchesNeeded = lengthInches * 2 + 12;
      layoutSuggestion = 'Standard dual-panel vertical layout.';
      wasteEstimate = 8;
  }

  // Factor in shrinkage safety margin
  const shrinkageFactor = 1 + fabricInfo.shrinkagePercent / 100;
  totalInchesNeeded = totalInchesNeeded * shrinkageFactor;

  // Convert inches → meters & yards (round to nearest 0.05 m)
  const exactMeters = totalInchesNeeded * 0.0254;
  const roundedMeters = Math.ceil(exactMeters * 20) / 20;
  const roundedYards = Number((roundedMeters * 1.09361).toFixed(2));

  // Pricing calculations
  const pricePerMeter =
    customPricePerMeter !== undefined ? customPricePerMeter : fabricInfo.defaultPricePerMeter;
  const baseStitching =
    customStitchingCharge !== undefined ? customStitchingCharge : dressInfo.baseStitchingCharge;

  const fabricCost = Math.round(roundedMeters * pricePerMeter);

  // Add-ons calculation
  const liningCost = addOns.lining ? Math.round(roundedMeters * 80 + (garmentType === 'BLOUSE' ? 120 : 180)) : 0;
  const embroideryCost = addOns.embroideryOrLace ? 250 : 0;
  const buttonsCost = addOns.premiumButtonsOrZips ? (garmentType === 'SHIRT' ? 80 : 60) : 0;
  const expressCost = addOns.expressDelivery ? 150 : 0;
  const customCost = addOns.customCollarCuffs ? 90 : 0;

  const totalAddOns = liningCost + embroideryCost + buttonsCost + expressCost + customCost;
  const subtotal = fabricCost + baseStitching + totalAddOns;

  const discountAmount = discountPercent > 0 ? Math.round((subtotal * discountPercent) / 100) : 0;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = taxPercent > 0 ? Math.round((afterDiscount * taxPercent) / 100) : 0;
  const totalCost = afterDiscount + taxAmount;

  return {
    garmentType,
    fabricType,
    requiredLengthMeters: roundedMeters,
    requiredLengthYards: roundedYards,
    fabricWidthInches: fabricInfo.standardWidthInches,
    pricePerMeter,
    fabricCost,
    baseStitchingCharge: baseStitching,
    addOnCharges: {
      lining: liningCost,
      embroidery: embroideryCost,
      buttons: buttonsCost,
      express: expressCost,
      customization: customCost,
    },
    totalAddOns,
    subtotal,
    taxPercent,
    taxAmount,
    discountAmount,
    totalCost,
    cuttingWasteEstimatePercent: wasteEstimate,
    fabricLayoutSuggestion: layoutSuggestion,
  };
}
