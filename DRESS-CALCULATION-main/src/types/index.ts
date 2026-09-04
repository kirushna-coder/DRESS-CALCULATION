// ============================================================
// SmartTailor AI – Shared TypeScript Interfaces & Types
// ============================================================

/** All raw user-supplied measurements (stored in inches or cm) */
export interface Measurements {
  // Legacy / Basic
  dressSize: number;
  fullLength: number;
  shoulderWidth: number;
  neckWidth: number;
  neckDepth: number;
  armholeDepth: number;
  bust: number; // or chest
  waist: number;
  hip: number;
  bottomWidth: number;
  flare: number;
  ease: number; // ease allowance added to bust/waist/hip

  // Enhanced Body Metrics
  customerName?: string;
  age?: number;
  gender?: Gender;
  height?: number; // cm or in
  weight?: number; // kg or lbs
  sleeveLength?: number;
  bicepCircumference?: number;
  crossBack?: number;
  inseam?: number;
  outseam?: number;
  thighCircumference?: number;
  notes?: string;
}

export type Gender = 'female' | 'male' | 'other' | 'prefer_not_to_say' | 'unisex' | 'kids';

/** Detected Body Photo Landmarks & Visual Proportions */
export interface PhotoLandmarks {
  shoulderWidthRatio: number; // shoulder width relative to height/frame
  waistToHipRatio: number; // visual waist-to-hip ratio
  torsoToLegRatio: number; // torso relative to lower body
  symmetryScore: number; // symmetry & posture score (0-100)
  visualFitAdjustment: 'Broad Shoulders' | 'Balanced Silhouette' | 'Tapered Waist' | 'Fuller Frame' | 'Slightly Asymmetric';
  fullBodyDetected: boolean;
  landmarks: {
    head: Point;
    neck: Point;
    leftShoulder: Point;
    rightShoulder: Point;
    bustLine: Point;
    waistLine: Point;
    hipLine: Point;
    leftKnee: Point;
    rightKnee: Point;
  };
}

export type PhotoAnalysisStep =
  | 'idle'
  | 'uploading'
  | 'analyzing'
  | 'recommendations'
  | 'complete'
  | 'error';


/** A 2-D point in SVG space */
export interface Point {
  x: number;
  y: number;
}

/** A labelled pattern point (e.g. A, B, C …) */
export interface PatternPoint {
  label: string;
  point: Point;
  description?: string;
}

/** A measurement annotation rendered as a double-headed arrow + label */
export interface MeasurementAnnotation {
  from: Point;
  to: Point;
  label: string;
  offset?: number; // perpendicular offset in px for the arrow line
  direction?: 'horizontal' | 'vertical' | 'auto';
}

/** A construction (guide) line */
export interface ConstructionLine {
  from: Point;
  to: Point;
  dashed?: boolean;
}

/** Full output of the pattern drafting calculation engine */
export interface PatternData {
  /** Ordered SVG path data string for the dress outline */
  outlinePath: string;
  /** Individual named points for labels */
  points: PatternPoint[];
  /** Dotted construction / guide lines */
  constructionLines: ConstructionLine[];
  /** Measurement arrows */
  annotations: MeasurementAnnotation[];
  /** Bounding box of the pattern in SVG units */
  bounds: { width: number; height: number };
}

/** Supported pattern/garment types */
export type DressType =
  | 'SHIRT'
  | 'PANT'
  | 'TSHIRT'
  | 'KURTA'
  | 'BLOUSE'
  | 'CHUDIDAR'
  | 'FROCK'
  | 'SKIRT';

// Backward compatibility alias
export type PatternType = DressType | 'ONE_PIECE' | 'KURTI' | 'KIDS';

/** Display unit preference */
export type Unit = 'in' | 'cm';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

/** Fabric options */
export type FabricType =
  | 'COTTON'
  | 'SILK'
  | 'POLYESTER'
  | 'LINEN'
  | 'DENIM'
  | 'GEORGETTE'
  | 'VELVET'
  | 'WOOL';

export interface FabricDetails {
  id: FabricType;
  name: string;
  description: string;
  defaultPricePerMeter: number; // in base currency (default INR / adaptable)
  standardWidthInches: number; // e.g. 44" or 58"
  drape: 'Crisp' | 'Soft' | 'Heavy' | 'Fluid' | 'Structured';
  breathability: 'High' | 'Medium' | 'Low';
  suitableFor: DressType[];
  shrinkagePercent: number;
}

/** Add-on options for tailoring */
export interface TailoringAddOns {
  lining: boolean;
  embroideryOrLace: boolean;
  premiumButtonsOrZips: boolean;
  expressDelivery: boolean;
  customCollarCuffs: boolean;
}

/** Smart Fabric Calculation Engine Result */
export interface FabricCalculationResult {
  garmentType: DressType;
  fabricType: FabricType;
  requiredLengthMeters: number;
  requiredLengthYards: number;
  usableFabricMeters: number;
  estimatedWasteMeters: number;
  fabricWidthInches: number;
  
  // Cost breakdown
  pricePerMeter: number;
  fabricCost: number;
  baseStitchingCharge: number;
  addOnCharges: {
    lining: number;
    embroidery: number;
    buttons: number;
    express: number;
    customization: number;
  };
  totalAddOns: number;
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  discountAmount: number;
  totalCost: number;

  // Tailoring guidance & Fabric Waste breakdown
  cuttingWasteEstimatePercent: number;
  fabricLayoutSuggestion: string;
  wasteBreakdown?: {
    seamAllowanceMeters: number;
    curveOffcutsMeters: number;
    selvageTrimMeters: number;
    shrinkageBufferMeters: number;
  };
}

/** AI Body Analysis & Recommendation Result */
export interface AIRecommendationResult {
  bodyShape: 'Hourglass' | 'Pear' | 'Rectangle' | 'Inverted Triangle' | 'Apple' | 'Athletic';
  bmi: number;
  bmiCategory: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity';
  recommendedDressType: DressType;
  recommendedFit: 'Slim Fit' | 'Regular Fit' | 'Comfort / Relaxed Fit' | 'Tailored Structured' | 'Flared A-Line';
  suggestedFabric: FabricType;
  fabricRationale: string;
  sizeSuggestion: {
    alphaSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';
    tailorSize: number;
    fitConfidence: number; // percent
  };
  tailoringAdvice: string[];
  easeRecommendation: {
    bustEase: number;
    waistEase: number;
    hipEase: number;
  };
  isFromLiveAI?: boolean;
}

/** Customer Profile */
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender: Gender;
  height?: number;
  weight?: number;
  measurements: Measurements;
  notes?: string;
  createdAt: string;
  totalOrdersCount: number;
}

/** Order Management State */
export type OrderStatus = 'pending' | 'cutting' | 'stitching' | 'ready' | 'delivered' | 'in_progress';
export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'fully_paid';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  dressType: DressType;
  fabricType: FabricType;
  fabricColor: string;
  fabricLengthMeters: number;
  measurements: Measurements;
  costBreakdown: FabricCalculationResult;
  totalCost: number;
  currency: Currency;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderDate: string;
  deliveryDueDate: string;
  specialInstructions?: string;
  notes?: string;
  aiRecommendations?: AIRecommendationResult;
}

/** App Navigation Tabs */
export type ActiveTab =
  | 'dashboard'
  | 'calculator'
  | 'fabric_waste'
  | 'price_estimation'
  | 'orders'
  | 'cad_studio'
  | 'customers'
  | 'ai_insights';
