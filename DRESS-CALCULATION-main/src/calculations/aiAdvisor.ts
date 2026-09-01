// ============================================================
// SmartTailor AI – Intelligent Body Analysis & Tailoring Advisor
// Rule-based smart AI engine with optional Gemini / OpenAI hook
// ============================================================

import type {
  Measurements,
  DressType,
  FabricType,
  AIRecommendationResult,
} from '../types';

export function analyzeMeasurementsAI(
  m: Measurements,
  selectedGarment: DressType,
  selectedFabric: FabricType
): AIRecommendationResult {
  const heightCm = m.height || 165;
  const weightKg = m.weight || 62;
  const bust = m.bust || 36;
  const waist = m.waist || 30;
  const hip = m.hip || 38;
  const shoulder = m.shoulderWidth || 15;
  const gender = m.gender || 'female';

  // ── 1. Calculate BMI ─────────────────────────────────────
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  let bmiCategory: AIRecommendationResult['bmiCategory'] = 'Normal weight';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
  else if (bmi >= 30) bmiCategory = 'Obesity';

  // ── 2. Determine Body Shape Classification ───────────────
  const waistHipRatio = waist / (hip || 1);
  const bustHipDiff = bust - hip;
  const bustWaistDiff = bust - waist;
  const hipWaistDiff = hip - waist;

  let bodyShape: AIRecommendationResult['bodyShape'] = 'Rectangle';

  if (gender === 'male') {
    if (shoulder >= 17 && waist <= 34) {
      bodyShape = 'Athletic';
    } else if (waistHipRatio > 0.95 || waist > bust) {
      bodyShape = 'Apple';
    } else if (shoulder > hip * 0.45) {
      bodyShape = 'Inverted Triangle';
    } else {
      bodyShape = 'Rectangle';
    }
  } else {
    // Female body morphology
    if (bustWaistDiff >= 7 && hipWaistDiff >= 7 && Math.abs(bustHipDiff) <= 3) {
      bodyShape = 'Hourglass';
    } else if (hipWaistDiff >= 7 && hip > bust + 2) {
      bodyShape = 'Pear';
    } else if (bustWaistDiff >= 6 && bust > hip + 2) {
      bodyShape = 'Inverted Triangle';
    } else if (waistHipRatio >= 0.85 || waist >= bust - 2) {
      bodyShape = 'Apple';
    } else if (Math.abs(bust - hip) <= 3 && bustWaistDiff < 6) {
      bodyShape = 'Rectangle';
    } else {
      bodyShape = 'Hourglass';
    }
  }

  // ── 3. Recommended Fit & Silhouette ───────────────────────
  let recommendedFit: AIRecommendationResult['recommendedFit'] = 'Regular Fit';
  let recommendedDress: DressType = selectedGarment;
  const adviceList: string[] = [];

  switch (bodyShape) {
    case 'Hourglass':
      recommendedFit = 'Tailored Structured';
      adviceList.push('Highlight the natural waistline with princess seams or tailored side waist darts.');
      adviceList.push('Use 1.0" - 1.5" bust ease to preserve fitted silhouette without tension lines.');
      if (['SHIRT', 'KURTA', 'FROCK'].includes(selectedGarment)) {
        adviceList.push('V-neckline or sweetheart neck will beautifully complement your shoulder-bust balance.');
      }
      break;

    case 'Pear':
      recommendedFit = 'Flared A-Line';
      recommendedDress = selectedGarment === 'PANT' ? 'PANT' : selectedGarment === 'BLOUSE' ? 'BLOUSE' : 'FROCK';
      adviceList.push('Opt for an A-line skirt or flared bottom hem to provide graceful drape over hips.');
      adviceList.push('Add subtle shoulder padding (0.25") or wide necklines (boat neck) to balance hip width.');
      adviceList.push('Ensure 2.0" hip ease for maximum sitting comfort and seamless fall.');
      break;

    case 'Inverted Triangle':
      recommendedFit = 'Regular Fit';
      adviceList.push('Soft raglan or inset sleeves soften the shoulder line gracefully.');
      adviceList.push('Add pleats or peplum flare around the lower hem to create visual lower-body volume.');
      adviceList.push('Avoid heavy shoulder pads or oversized lapels on shirts.');
      break;

    case 'Apple':
      recommendedFit = 'Comfort / Relaxed Fit';
      adviceList.push('Empire waist cut or vertical paneling creates a flattering elongating effect.');
      adviceList.push('Allow 2.0" - 2.5" waist ease to ensure ease during all-day movement.');
      adviceList.push('Choose fluid fabrics that drape gently without clinging to the midsection.');
      break;

    case 'Athletic':
      recommendedFit = 'Slim Fit';
      adviceList.push('Tapered side seams with back shoulder pleats accentuate an athletic V-taper.');
      adviceList.push('High armhole depth (8.0"-8.5") prevents fabric bunching across the chest.');
      adviceList.push('Curved Italian hem recommended for a sharp untucked or tucked profile.');
      break;

    case 'Rectangle':
    default:
      recommendedFit = 'Regular Fit';
      adviceList.push('Use a contrast belt or waist seam to define shape effortlessly.');
      adviceList.push('Gathered sleeves or pocket accents add stylish dimension.');
      adviceList.push('Standard 1.5" ease across bust, waist, and hip ensures a versatile fit.');
      break;
  }

  // ── 4. Fabric Recommendation Rationale ────────────────────
  let suggestedFabric: FabricType = selectedFabric;
  let fabricRationale = '';

  if (selectedGarment === 'SHIRT') {
    suggestedFabric = 'COTTON';
    fabricRationale =
      'Premium 60s Cotton offers crisp structure, sharp collar points, and all-day breathable comfort.';
  } else if (selectedGarment === 'PANT') {
    suggestedFabric = bmi > 26 ? 'WOOL' : 'LINEN';
    fabricRationale =
      'Structured Linen or Worsted Wool provides sharp crease retention, excellent drape, and durability.';
  } else if (selectedGarment === 'BLOUSE') {
    suggestedFabric = 'SILK';
    fabricRationale =
      'Mulberry Raw Silk brings a rich royal sheen, holding darts cleanly for a flawless form-fit.';
  } else if (selectedGarment === 'KURTA') {
    suggestedFabric = 'COTTON';
    fabricRationale =
      'Pure Cotton absorbs moisture efficiently, keeping the straight-cut side slits sharp and comfortable.';
  } else if (selectedGarment === 'FROCK') {
    suggestedFabric = bodyShape === 'Pear' ? 'GEORGETTE' : 'SILK';
    fabricRationale =
      'Fluid Silk or Georgette enhances the umbrella flare with rich cascading drape and movement.';
  } else if (selectedGarment === 'TSHIRT') {
    suggestedFabric = 'COTTON';
    fabricRationale = 'Natural combed cotton jersey provides soft stretch and skin-friendly touch.';
  } else {
    suggestedFabric = 'COTTON';
    fabricRationale = 'Versatile, high-durability natural fabric suitable for precise tailor cutting.';
  }

  // ── 5. Standard Sizing Calculation ────────────────────────
  let alphaSize: AIRecommendationResult['sizeSuggestion']['alphaSize'] = 'M';
  let tailorSize = 38;

  if (bust <= 32) {
    alphaSize = 'XS';
    tailorSize = 32;
  } else if (bust <= 35) {
    alphaSize = 'S';
    tailorSize = 34;
  } else if (bust <= 38) {
    alphaSize = 'M';
    tailorSize = 38;
  } else if (bust <= 41) {
    alphaSize = 'L';
    tailorSize = 40;
  } else if (bust <= 44) {
    alphaSize = 'XL';
    tailorSize = 42;
  } else if (bust <= 48) {
    alphaSize = '2XL';
    tailorSize = 46;
  } else {
    alphaSize = '3XL';
    tailorSize = 50;
  }

  // Ease breakdown
  const bustEase = recommendedFit === 'Slim Fit' ? 1.0 : recommendedFit === 'Regular Fit' ? 1.5 : 2.5;
  const waistEase = recommendedFit === 'Slim Fit' ? 1.0 : recommendedFit === 'Regular Fit' ? 1.5 : 2.5;
  const hipEase = bodyShape === 'Pear' ? 2.5 : 1.5;

  return {
    bodyShape,
    bmi,
    bmiCategory,
    recommendedDressType: recommendedDress,
    recommendedFit,
    suggestedFabric,
    fabricRationale,
    sizeSuggestion: {
      alphaSize,
      tailorSize,
      fitConfidence: 96,
    },
    tailoringAdvice: adviceList,
    easeRecommendation: {
      bustEase,
      waistEase,
      hipEase,
    },
    isFromLiveAI: false,
  };
}

/**
 * Optional Live Gemini AI Calling Function
 * If user provides an API key, this can fetch neural recommendations.
 */
export async function fetchGeminiTailorAdvice(
  apiKey: string,
  measurements: Measurements,
  garment: DressType,
  fabric: FabricType
): Promise<AIRecommendationResult | null> {
  try {
    const prompt = `You are a master haute couture bespoke tailor.
Analyze these customer measurements:
Name: ${measurements.customerName || 'Customer'}
Gender: ${measurements.gender || 'female'}, Age: ${measurements.age || 28}
Height: ${measurements.height}cm, Weight: ${measurements.weight}kg
Bust/Chest: ${measurements.bust}", Waist: ${measurements.waist}", Hip: ${measurements.hip}", Shoulder: ${measurements.shoulderWidth}", Sleeve: ${measurements.sleeveLength}"
Target Garment: ${garment}, Target Fabric: ${fabric}

Respond ONLY with valid JSON matching:
{
  "bodyShape": "Hourglass" | "Pear" | "Rectangle" | "Inverted Triangle" | "Apple" | "Athletic",
  "recommendedFit": "Slim Fit" | "Regular Fit" | "Comfort / Relaxed Fit" | "Tailored Structured" | "Flared A-Line",
  "suggestedFabric": "COTTON" | "SILK" | "LINEN" | "DENIM" | "POLYESTER" | "GEORGETTE" | "VELVET" | "WOOL",
  "fabricRationale": "Short explanation",
  "tailoringAdvice": ["Tip 1", "Tip 2", "Tip 3"]
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response');

    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    const baseResult = analyzeMeasurementsAI(measurements, garment, fabric);
    return {
      ...baseResult,
      bodyShape: parsed.bodyShape || baseResult.bodyShape,
      recommendedFit: parsed.recommendedFit || baseResult.recommendedFit,
      suggestedFabric: parsed.suggestedFabric || baseResult.suggestedFabric,
      fabricRationale: parsed.fabricRationale || baseResult.fabricRationale,
      tailoringAdvice: Array.isArray(parsed.tailoringAdvice) ? parsed.tailoringAdvice : baseResult.tailoringAdvice,
      isFromLiveAI: true,
    };
  } catch (err) {
    console.warn('Gemini API call skipped, falling back to built-in smart AI engine:', err);
    return null;
  }
}
