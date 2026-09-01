// ============================================================
// SmartTailor AI – CAD Model Material & Preview Mapping Registry
// Dynamic mapping system for all Pattern Models in CAD Studio
// ============================================================

import type { Measurements, PatternType } from '../types';

export interface ModelColorSwatch {
  name: string;
  hex: string;
  dark: boolean;
}

export interface CADModelSpecification {
  id: PatternType;
  label: string;
  category: 'Women' | 'Men' | 'Unisex' | 'Kids' | 'Traditional';
  description: string;
  primaryRecommendation: string;
  rationale: string;
  availableFabrics: string[];
  recommendedUsage: string;
  cuttingLayout: string;
  baseQuantityMeters: number;
  calculateQuantity: (m: Measurements) => { meters: number; yards: number };
  suitableColors: ModelColorSwatch[];
  keyMeasurementFields: { label: string; key: keyof Measurements; defaultVal: number }[];
  easeRecommendation: string;
  imagePlaceholderAlt: string;
}

export const dressMaterialData: Record<PatternType, {
  dressName: string;
  recommendedMaterials: string[];
  defaultMaterial: string;
  fabricRequirement: string;
  colourOptions: string[];
  previewType: string;
}> = {
  ONE_PIECE: {
    dressName: 'One-Piece Dress / Frock',
    recommendedMaterials: ['Cotton', 'Silk', 'Crepe'],
    defaultMaterial: 'Cotton',
    fabricRequirement: '2.5 to 3.5 meters',
    colourOptions: ['Burgundy Wine', 'Emerald Green', 'Champagne Gold', 'Ivory White'],
    previewType: 'frock',
  },
  FROCK: {
    dressName: 'One-Piece Dress / Frock',
    recommendedMaterials: ['Cotton', 'Silk', 'Crepe'],
    defaultMaterial: 'Cotton',
    fabricRequirement: '2.5 to 3.5 meters',
    colourOptions: ['Emerald Green', 'Burgundy Wine', 'Champagne Gold', 'Blush Rose'],
    previewType: 'frock',
  },
  KURTI: {
    dressName: 'Traditional Kurti',
    recommendedMaterials: ['Cotton', 'Rayon', 'Linen'],
    defaultMaterial: 'Cotton',
    fabricRequirement: '2.5 to 3 meters',
    colourOptions: ['Sage Olive', 'Terracotta', 'Sky Blue', 'Champagne Gold'],
    previewType: 'kurti',
  },
  KURTA: {
    dressName: 'Ethnic Kurta',
    recommendedMaterials: ['Cotton', 'Linen', 'Rayon'],
    defaultMaterial: 'Cotton',
    fabricRequirement: '2.5 to 3 meters',
    colourOptions: ['Champagne Gold', 'Emerald Green', 'Imperial Purple', 'Royal Navy'],
    previewType: 'kurta',
  },
  BLOUSE: {
    dressName: 'Fitted Saree Blouse',
    recommendedMaterials: ['Silk', 'Cotton', 'Brocade'],
    defaultMaterial: 'Silk',
    fabricRequirement: '0.8 to 1 meter',
    colourOptions: ['Burgundy Wine', 'Champagne Gold', 'Imperial Purple', 'Emerald Green'],
    previewType: 'blouse',
  },
  SHIRT: {
    dressName: 'Formal / Casual Shirt',
    recommendedMaterials: ['Cotton', 'Linen', 'Polyester Blend'],
    defaultMaterial: 'Cotton',
    fabricRequirement: '2 to 2.5 meters',
    colourOptions: ['Royal Navy', 'Ivory White', 'Sky Blue', 'Charcoal Black'],
    previewType: 'shirt',
  },
  PANT: {
    dressName: 'Trouser / Formal Pant',
    recommendedMaterials: ['Cotton Twill', 'Polyester Blend', 'Wool Blend'],
    defaultMaterial: 'Cotton Twill',
    fabricRequirement: '1.5 to 2 meters',
    colourOptions: ['Charcoal Black', 'Royal Navy', 'Mocha Brown', 'Sage Olive'],
    previewType: 'pant',
  },
  TSHIRT: {
    dressName: 'Round Neck T-Shirt',
    recommendedMaterials: ['Cotton', 'Jersey', 'Polyester Blend'],
    defaultMaterial: 'Cotton',
    fabricRequirement: '1.5 to 2 meters',
    colourOptions: ['Sky Blue', 'Charcoal Black', 'Heather Grey', 'Ivory White'],
    previewType: 'tshirt',
  },
  CHUDIDAR: {
    dressName: 'Chudidar / Salwar',
    recommendedMaterials: ['Cotton', 'Rayon', 'Silk Blend'],
    defaultMaterial: 'Cotton',
    fabricRequirement: '3.5 to 5 meters',
    colourOptions: ['Ivory White', 'Royal Navy', 'Charcoal Black', 'Terracotta'],
    previewType: 'chudidar',
  },
  SKIRT: {
    dressName: 'A-Line / Flared Skirt',
    recommendedMaterials: ['Cotton', 'Crepe', 'Georgette'],
    defaultMaterial: 'Crepe',
    fabricRequirement: '2.5 to 4 meters',
    colourOptions: ['Emerald Green', 'Blush Rose', 'Champagne Gold', 'Sky Blue'],
    previewType: 'skirt',
  },
  KIDS: {
    dressName: "Kids' Wear",
    recommendedMaterials: ['Soft Cotton', 'Knit Fabric', 'Rayon'],
    defaultMaterial: 'Soft Cotton',
    fabricRequirement: '1 to 2 meters',
    colourOptions: ['Sky Blue', 'Blush Rose', 'Sage Olive', 'Ivory White'],
    previewType: 'kids',
  },
};

export const CAD_MODEL_SPECS: Record<string, CADModelSpecification> = {
  TSHIRT: {
    id: 'TSHIRT',
    label: 'Round Neck T-Shirt',
    category: 'Unisex',
    description: 'Casual comfort tee with ribbed crew neck, dropped shoulder, and short sleeves.',
    primaryRecommendation: 'Cotton, Single Jersey, Polyester Blend',
    rationale: 'Knit jersey and combed cotton provide flexible 2-way stretch, sweat absorption, and soft against-the-skin drape.',
    availableFabrics: [
      'Single Jersey Cotton (180 GSM)',
      'Cotton-Spandex Knit',
      'Poly-Cotton Heather Blend',
      'Modal Ribbed Jersey',
      'Organic Bio-Wash Cotton',
    ],
    recommendedUsage: 'Tubular or 58" open-width knit fold with sleeves nested on outer grain.',
    cuttingLayout: 'Cross-wise fold layout (58" width). Short sleeves cut from fold remnant.',
    baseQuantityMeters: 1.1,
    calculateQuantity: (m: Measurements) => {
      const len = m.fullLength || 27;
      const slv = m.sleeveLength || 8;
      const meters = Math.ceil(((len + slv + 4) * 0.0254) * 20) / 20;
      return { meters: Math.max(0.9, meters), yards: Number((meters * 1.0936).toFixed(2)) };
    },
    suitableColors: [
      { name: 'Sky Blue', hex: '#0284C7', dark: false },
      { name: 'Charcoal Black', hex: '#18181B', dark: true },
      { name: 'Heather Grey', hex: '#64748B', dark: false },
      { name: 'Ivory White', hex: '#F8FAFC', dark: false },
      { name: 'Royal Navy', hex: '#1E3A8A', dark: true },
      { name: 'Blush Rose', hex: '#BE185D', dark: false },
    ],
    keyMeasurementFields: [
      { label: 'Chest / Bust', key: 'bust', defaultVal: 38 },
      { label: 'Shoulder Width', key: 'shoulderWidth', defaultVal: 16 },
      { label: 'Body Length', key: 'fullLength', defaultVal: 27 },
      { label: 'Sleeve Length', key: 'sleeveLength', defaultVal: 8 },
      { label: 'Neck Depth', key: 'neckDepth', defaultVal: 3 },
    ],
    easeRecommendation: '2.0" chest ease for relaxed everyday movement.',
    imagePlaceholderAlt: 'Vector vector schematic of Round Neck Casual T-Shirt',
  },

  ONE_PIECE: {
    id: 'ONE_PIECE',
    label: 'One-Piece Dress / Frock',
    category: 'Women',
    description: 'Classic bespoke one-piece silhouette with fitted bodice, waist belt, and flared umbrella skirt.',
    primaryRecommendation: 'Cotton, Silk, Crepe',
    rationale: 'Mulberry Raw Silk and Poly-Crepe create flowing drape across the umbrella flare while maintaining crisp bodice lines.',
    availableFabrics: [
      'Mulberry Raw Silk',
      'Cotton Satin (60s)',
      'Poly-Crepe Fluid Blend',
      'Viscose Georgette (Lined)',
      'Rayon Challis',
    ],
    recommendedUsage: 'Bodice on straight grain fold; Skirt panels cut on radial flare angle.',
    cuttingLayout: 'Radial A-line panel cutting with stacked 2-panel bodice at top grain.',
    baseQuantityMeters: 3.2,
    calculateQuantity: (m: Measurements) => {
      const len = m.fullLength || 48;
      const flare = m.flare || 4.5;
      const mult = flare > 5 ? 2.3 : 1.9;
      const meters = Math.ceil((((len - 14) * mult + 28) * 0.0254) * 20) / 20;
      return { meters: Math.max(2.8, meters), yards: Number((meters * 1.0936).toFixed(2)) };
    },
    suitableColors: [
      { name: 'Burgundy Wine', hex: '#881337', dark: true },
      { name: 'Emerald Green', hex: '#065F46', dark: true },
      { name: 'Champagne Gold', hex: '#D97706', dark: false },
      { name: 'Imperial Purple', hex: '#6D28D9', dark: true },
      { name: 'Blush Rose', hex: '#BE185D', dark: false },
      { name: 'Ivory White', hex: '#F8FAFC', dark: false },
    ],
    keyMeasurementFields: [
      { label: 'Bust', key: 'bust', defaultVal: 38 },
      { label: 'Waist', key: 'waist', defaultVal: 30 },
      { label: 'Hip', key: 'hip', defaultVal: 40 },
      { label: 'Full Length', key: 'fullLength', defaultVal: 48 },
      { label: 'Flare', key: 'flare', defaultVal: 4.5 },
      { label: 'Armhole Depth', key: 'armholeDepth', defaultVal: 6.5 },
    ],
    easeRecommendation: '1.5" bust ease, 1.0" waist ease, free flared hip room.',
    imagePlaceholderAlt: 'One-Piece Flared Frock with Bodice and Umbrella Hem',
  },

  FROCK: {
    id: 'FROCK',
    label: 'One-Piece Flared Frock',
    category: 'Women',
    description: 'Flared party frock with fitted waistline, sweetheart or round neckline, and flowing skirt.',
    primaryRecommendation: 'Cotton, Silk, Crepe',
    rationale: 'Silk and crepe fabrics cascade gracefully along the flared skirt seams without adding bulk.',
    availableFabrics: [
      'Pure Mulberry Silk',
      'Viscose Georgette',
      'Cotton Satin Blend',
      'Plush Micro-Velvet',
      'Crepe de Chine',
    ],
    recommendedUsage: 'Umbrella cut on 44" or 58" width with bias flare sweep.',
    cuttingLayout: 'Two body lengths plus flared umbrella skirt extension.',
    baseQuantityMeters: 3.4,
    calculateQuantity: (m: Measurements) => {
      const len = m.fullLength || 48;
      const meters = Math.ceil(((len * 2.1 + 18) * 0.0254) * 20) / 20;
      return { meters: Math.max(3.0, meters), yards: Number((meters * 1.0936).toFixed(2)) };
    },
    suitableColors: [
      { name: 'Emerald Green', hex: '#065F46', dark: true },
      { name: 'Burgundy Wine', hex: '#881337', dark: true },
      { name: 'Champagne Gold', hex: '#D97706', dark: false },
      { name: 'Royal Navy', hex: '#1E3A8A', dark: true },
      { name: 'Sage Olive', hex: '#4D7C0F', dark: false },
      { name: 'Blush Rose', hex: '#BE185D', dark: false },
    ],
    keyMeasurementFields: [
      { label: 'Bust', key: 'bust', defaultVal: 38 },
      { label: 'Waist', key: 'waist', defaultVal: 30 },
      { label: 'Hip', key: 'hip', defaultVal: 40 },
      { label: 'Full Length', key: 'fullLength', defaultVal: 48 },
      { label: 'Flare', key: 'flare', defaultVal: 5 },
    ],
    easeRecommendation: '1.5" bust ease with tailored waist seam.',
    imagePlaceholderAlt: 'Flared Frock Dress SVG Illustration',
  },

  SHIRT: {
    id: 'SHIRT',
    label: 'Formal / Casual Shirt',
    category: 'Unisex',
    description: 'Button-down classic shirt with pointed spread collar, front button placket, cuffs, and back yoke.',
    primaryRecommendation: 'Cotton, Linen',
    rationale: 'Premium 60s/80s Egyptian Cotton or European Linen holds crisp ironed seams, sharp collar points, and breathable comfort.',
    availableFabrics: [
      'Giza Long-Staple Cotton (60s/80s)',
      'European Organic Linen (58" width)',
      'Cotton Oxford Weave',
      'Chambray Woven Cotton',
      'Cotton Poplin',
    ],
    recommendedUsage: 'Lengthwise grain fold. Split back yoke on cross-grain; collars interfaced.',
    cuttingLayout: 'Front & back panels parallel on 58" width; sleeves along fold side.',
    baseQuantityMeters: 1.8,
    calculateQuantity: (m: Measurements) => {
      const len = m.fullLength || 29;
      const slv = m.sleeveLength || 24;
      const meters = Math.ceil(((len + slv + 10) * 0.0254) * 20) / 20;
      return { meters: Math.max(1.6, meters), yards: Number((meters * 1.0936).toFixed(2)) };
    },
    suitableColors: [
      { name: 'Royal Navy', hex: '#1E3A8A', dark: true },
      { name: 'Ivory White', hex: '#F8FAFC', dark: false },
      { name: 'Sky Blue', hex: '#0284C7', dark: false },
      { name: 'Charcoal Black', hex: '#18181B', dark: true },
      { name: 'Sage Olive', hex: '#4D7C0F', dark: false },
      { name: 'Mocha Brown', hex: '#78350F', dark: true },
    ],
    keyMeasurementFields: [
      { label: 'Chest / Bust', key: 'bust', defaultVal: 40 },
      { label: 'Shoulder Width', key: 'shoulderWidth', defaultVal: 17.5 },
      { label: 'Sleeve Length', key: 'sleeveLength', defaultVal: 25 },
      { label: 'Neck Width / Collar', key: 'neckWidth', defaultVal: 15.5 },
      { label: 'Full Length', key: 'fullLength', defaultVal: 30 },
      { label: 'Ease', key: 'ease', defaultVal: 2.0 },
    ],
    easeRecommendation: '2.0" - 2.5" chest ease for clean armhole movement.',
    imagePlaceholderAlt: 'Classic Formal Tailored Shirt SVG Illustration',
  },

  PANT: {
    id: 'PANT',
    label: 'Trouser / Formal Pant',
    category: 'Unisex',
    description: 'Tailored trousers featuring straight or tapered leg cut, waistband, side slant pockets, and fly zip.',
    primaryRecommendation: 'Cotton Twill, Polyester blend, Wool',
    rationale: 'Worsted Wool or Cotton Twill resists wrinkles, drapes with a sharp central crease, and holds structure across the crotch seam.',
    availableFabrics: [
      'Tropical Worsted Wool (280 GSM)',
      'Cotton Twill (9 oz Chino)',
      'European Linen-Cotton Blend',
      'Poly-Viscose Suiting Blend',
      'Raw Selvedge Denim',
    ],
    recommendedUsage: 'Lengthwise grain with interlocking crotch curve placement to optimize yield.',
    cuttingLayout: 'Two-way lengthwise lay on 58" fabric; pocket facing and waistband from remnant.',
    baseQuantityMeters: 1.4,
    calculateQuantity: (m: Measurements) => {
      const len = m.outseam || m.fullLength || 40;
      const meters = Math.ceil(((len + 8) * 0.0254) * 20) / 20;
      return { meters: Math.max(1.2, meters), yards: Number((meters * 1.0936).toFixed(2)) };
    },
    suitableColors: [
      { name: 'Charcoal Black', hex: '#18181B', dark: true },
      { name: 'Royal Navy', hex: '#1E3A8A', dark: true },
      { name: 'Mocha Brown', hex: '#78350F', dark: true },
      { name: 'Sage Olive', hex: '#4D7C0F', dark: false },
      { name: 'Ivory Khaki', hex: '#F8FAFC', dark: false },
      { name: 'Terracotta', hex: '#C2410C', dark: false },
    ],
    keyMeasurementFields: [
      { label: 'Waist', key: 'waist', defaultVal: 34 },
      { label: 'Hip', key: 'hip', defaultVal: 41 },
      { label: 'Outseam Length', key: 'outseam', defaultVal: 40 },
      { label: 'Inseam Length', key: 'inseam', defaultVal: 30 },
      { label: 'Bottom Hem Width', key: 'bottomWidth', defaultVal: 18 },
    ],
    easeRecommendation: '1.5" waist ease, 2.0" hip ease for comfortable seating.',
    imagePlaceholderAlt: 'Tailored Formal Trouser Pant SVG Illustration',
  },

  KURTA: {
    id: 'KURTA',
    label: 'Ethnic Kurta / Kurti',
    category: 'Traditional',
    description: 'Traditional long tunic silhouette with straight side slits, band mandarin collar, and button placket.',
    primaryRecommendation: 'Cotton, Linen, Rayon',
    rationale: 'Breathable Slub Cotton and Organic Linen keep side slits sharp, while Viscose Rayon brings graceful ethnic drape.',
    availableFabrics: [
      'Slub Handloom Cotton',
      'Pure European Linen',
      'Viscose Rayon (140 GSM)',
      'Chanderi Silk-Cotton Blend',
      'Cotton Khadi',
    ],
    recommendedUsage: 'Straight grain alignment with side slit hems and mandarin collar facing.',
    cuttingLayout: 'Lengthwise folding with sleeves cut from remaining width alongside back yoke.',
    baseQuantityMeters: 2.4,
    calculateQuantity: (m: Measurements) => {
      const len = m.fullLength || 44;
      const slv = m.sleeveLength || 20;
      const meters = Math.ceil(((len * 1.5 + slv + 8) * 0.0254) * 20) / 20;
      return { meters: Math.max(2.2, meters), yards: Number((meters * 1.0936).toFixed(2)) };
    },
    suitableColors: [
      { name: 'Champagne Gold', hex: '#D97706', dark: false },
      { name: 'Emerald Green', hex: '#065F46', dark: true },
      { name: 'Imperial Purple', hex: '#6D28D9', dark: true },
      { name: 'Royal Navy', hex: '#1E3A8A', dark: true },
      { name: 'Terracotta', hex: '#C2410C', dark: false },
      { name: 'Ivory White', hex: '#F8FAFC', dark: false },
    ],
    keyMeasurementFields: [
      { label: 'Chest / Bust', key: 'bust', defaultVal: 38 },
      { label: 'Waist', key: 'waist', defaultVal: 32 },
      { label: 'Hip', key: 'hip', defaultVal: 40 },
      { label: 'Kurta Length', key: 'fullLength', defaultVal: 44 },
      { label: 'Sleeve Length', key: 'sleeveLength', defaultVal: 19 },
      { label: 'Shoulder', key: 'shoulderWidth', defaultVal: 15 },
    ],
    easeRecommendation: '2.0" bust ease and 2.5" hip ease for side slit drape.',
    imagePlaceholderAlt: 'Ethnic Indian Kurta with Side Slits SVG Illustration',
  },

  KURTI: {
    id: 'KURTI',
    label: 'Traditional Kurti',
    category: 'Traditional',
    description: 'Casual daily wear tunic with round/V-neck, 3/4 sleeves, and side slit vents.',
    primaryRecommendation: 'Cotton, Rayon',
    rationale: 'Soft cotton mulmul and printed rayon ensure light daily wear comfort and easy home care.',
    availableFabrics: [
      'Cotton Mulmul (60s)',
      'Viscose Rayon Printed',
      'Cotton Slub Weave',
      'Linen Blend',
    ],
    recommendedUsage: 'Two-panel straight grain fold with 3/4 sleeves.',
    cuttingLayout: 'Front & back stacked with sleeve patterns on fold.',
    baseQuantityMeters: 2.1,
    calculateQuantity: (m: Measurements) => {
      const len = m.fullLength || 40;
      const slv = m.sleeveLength || 16;
      const meters = Math.ceil(((len * 1.5 + slv + 6) * 0.0254) * 20) / 20;
      return { meters: Math.max(1.8, meters), yards: Number((meters * 1.0936).toFixed(2)) };
    },
    suitableColors: [
      { name: 'Sage Olive', hex: '#4D7C0F', dark: false },
      { name: 'Terracotta', hex: '#C2410C', dark: false },
      { name: 'Sky Blue', hex: '#0284C7', dark: false },
      { name: 'Blush Rose', hex: '#BE185D', dark: false },
      { name: 'Champagne Gold', hex: '#D97706', dark: false },
    ],
    keyMeasurementFields: [
      { label: 'Bust', key: 'bust', defaultVal: 36 },
      { label: 'Waist', key: 'waist', defaultVal: 30 },
      { label: 'Hip', key: 'hip', defaultVal: 38 },
      { label: 'Length', key: 'fullLength', defaultVal: 40 },
    ],
    easeRecommendation: '1.5" - 2.0" ease.',
    imagePlaceholderAlt: 'Traditional Kurti SVG Illustration',
  },

  BLOUSE: {
    id: 'BLOUSE',
    label: 'Fitted Saree Blouse',
    category: 'Traditional',
    description: 'Close-fitting structured saree blouse with sweetheart/round neckline, princess dart lines, and hook fastening.',
    primaryRecommendation: 'Silk, Cotton, Brocade',
    rationale: 'Mulberry Raw Silk and Banarasi Brocade provide the necessary firmness for sculpted princess darts and zari embroidery border support.',
    availableFabrics: [
      'Mulberry Raw Silk',
      'Banarasi Brocade (Zari)',
      'Cotton Rubia (2x2)',
      'Plush Micro-Velvet',
      'Chanderi Silk',
    ],
    recommendedUsage: 'Cross-grain bodice with bias-cut neckline piping; cotton inner lining required.',
    cuttingLayout: 'Compact bodice cutting with short/medium sleeves on remainder.',
    baseQuantityMeters: 0.95,
    calculateQuantity: (m: Measurements) => {
      const len = m.fullLength || 15;
      const slv = m.sleeveLength || 10;
      const meters = Math.ceil(((len * 2 + slv + 4) * 0.0254) * 20) / 20;
      return { meters: Math.max(0.85, meters), yards: Number((meters * 1.0936).toFixed(2)) };
    },
    suitableColors: [
      { name: 'Burgundy Wine', hex: '#881337', dark: true },
      { name: 'Champagne Gold', hex: '#D97706', dark: false },
      { name: 'Imperial Purple', hex: '#6D28D9', dark: true },
      { name: 'Emerald Green', hex: '#065F46', dark: true },
      { name: 'Blush Rose', hex: '#BE185D', dark: false },
      { name: 'Royal Navy', hex: '#1E3A8A', dark: true },
    ],
    keyMeasurementFields: [
      { label: 'Bust', key: 'bust', defaultVal: 36 },
      { label: 'Waist / Under-Bust', key: 'waist', defaultVal: 28 },
      { label: 'Blouse Length', key: 'fullLength', defaultVal: 15 },
      { label: 'Front Neck Depth', key: 'neckDepth', defaultVal: 6.5 },
      { label: 'Sleeve Length', key: 'sleeveLength', defaultVal: 10 },
      { label: 'Armhole Depth', key: 'armholeDepth', defaultVal: 7.5 },
    ],
    easeRecommendation: '0.75" - 1.0" ease for a glove-like contour fit.',
    imagePlaceholderAlt: 'Fitted Saree Blouse with Sweetheart Neck SVG Illustration',
  },

  CHUDIDAR: {
    id: 'CHUDIDAR',
    label: 'Chudidar / Salwar Bottom',
    category: 'Traditional',
    description: 'Traditional salwar/chudidar pants with upper pleat fullness and tapered bias-cut ankle gathers (churis).',
    primaryRecommendation: 'Cotton, Rayon, Silk blend',
    rationale: 'True bias-cut cambric cotton or rayon stretches naturally around the calves, creating rich accordion ankle ripples.',
    availableFabrics: [
      'Pure Cambric Cotton (60s)',
      'Viscose Rayon Solid',
      'Soft Silk-Cotton Blend',
      'Lycra Cotton Stretch',
    ],
    recommendedUsage: 'True 45-degree bias fold to create stretchy accordion ripples at the ankle.',
    cuttingLayout: 'Two full bias lengths with upper waistband yoke pieced from corner salvage.',
    baseQuantityMeters: 2.35,
    calculateQuantity: (m: Measurements) => {
      const len = m.outseam || m.fullLength || 42;
      const meters = Math.ceil(((len * 2 + 16) * 0.0254) * 20) / 20;
      return { meters: Math.max(2.2, meters), yards: Number((meters * 1.0936).toFixed(2)) };
    },
    suitableColors: [
      { name: 'Ivory White', hex: '#F8FAFC', dark: false },
      { name: 'Royal Navy', hex: '#1E3A8A', dark: true },
      { name: 'Charcoal Black', hex: '#18181B', dark: true },
      { name: 'Terracotta', hex: '#C2410C', dark: false },
      { name: 'Blush Rose', hex: '#BE185D', dark: false },
      { name: 'Emerald Green', hex: '#065F46', dark: true },
    ],
    keyMeasurementFields: [
      { label: 'Waist / Yoke', key: 'waist', defaultVal: 32 },
      { label: 'Hip', key: 'hip', defaultVal: 40 },
      { label: 'Outseam Length', key: 'outseam', defaultVal: 42 },
      { label: 'Ankle Width', key: 'bottomWidth', defaultVal: 10 },
    ],
    easeRecommendation: '3.0" hip room for unrestricted sitting and movement.',
    imagePlaceholderAlt: 'Chudidar Salwar with Ankle Gathers SVG Illustration',
  },

  SKIRT: {
    id: 'SKIRT',
    label: 'A-Line / Flared Skirt',
    category: 'Women',
    description: 'High-waisted flared skirt with fitted waistband, side zip closure, and circular umbrella sweep.',
    primaryRecommendation: 'Cotton, Crepe, Georgette',
    rationale: 'Poly-crepe and georgette drape with high fluidity, while structured cotton maintains an architected A-line bell shape.',
    availableFabrics: [
      'Viscose Georgette Chiffon',
      'Poly-Crepe Smooth Blend',
      'European Linen Slub',
      'Cotton Cambric (Lined)',
      'Lightweight 7oz Denim',
    ],
    recommendedUsage: 'Half or full circle umbrella sweep; waistband aligned with lengthwise selvedge.',
    cuttingLayout: 'A-line 6-panel or circular sweep with waistband on primary grain.',
    baseQuantityMeters: 2.2,
    calculateQuantity: (m: Measurements) => {
      const len = m.fullLength || 36;
      const flare = m.flare || 6;
      const meters = Math.ceil(((len * (flare > 6 ? 2.2 : 1.7) + 8) * 0.0254) * 20) / 20;
      return { meters: Math.max(1.8, meters), yards: Number((meters * 1.0936).toFixed(2)) };
    },
    suitableColors: [
      { name: 'Emerald Green', hex: '#065F46', dark: true },
      { name: 'Blush Rose', hex: '#BE185D', dark: false },
      { name: 'Champagne Gold', hex: '#D97706', dark: false },
      { name: 'Sky Blue', hex: '#0284C7', dark: false },
      { name: 'Burgundy Wine', hex: '#881337', dark: true },
      { name: 'Charcoal Black', hex: '#18181B', dark: true },
    ],
    keyMeasurementFields: [
      { label: 'Waist', key: 'waist', defaultVal: 28 },
      { label: 'Hip', key: 'hip', defaultVal: 38 },
      { label: 'Skirt Length', key: 'fullLength', defaultVal: 36 },
      { label: 'Hem Flare Width', key: 'bottomWidth', defaultVal: 34 },
    ],
    easeRecommendation: '1.0" waist ease for snug high-waisted fit.',
    imagePlaceholderAlt: 'A-Line Flared Skirt SVG Illustration',
  },

  KIDS: {
    id: 'KIDS',
    label: "Kids' Wear",
    category: 'Kids',
    description: 'Children’s comfortable play wear dress / shirt with extra motion ease and rounded soft seams.',
    primaryRecommendation: 'Soft Cotton, Knit fabric',
    rationale: '100% Bio-washed organic cotton and gentle interlock knits prevent skin chafing and withstand frequent washing.',
    availableFabrics: [
      '100% Organic Bio-Wash Cotton',
      'Interlock Cotton Knit (200 GSM)',
      'Soft Muslin Cotton',
      'Lightweight Cotton Chambray',
    ],
    recommendedUsage: 'Single compact panel layout with soft non-scratchy seam allowances.',
    cuttingLayout: 'Compact single length layout with rounded soft seams.',
    baseQuantityMeters: 0.9,
    calculateQuantity: (m: Measurements) => {
      const len = m.fullLength || 22;
      const meters = Math.ceil(((len * 1.4 + 6) * 0.0254) * 20) / 20;
      return { meters: Math.max(0.75, meters), yards: Number((meters * 1.0936).toFixed(2)) };
    },
    suitableColors: [
      { name: 'Sky Blue', hex: '#0284C7', dark: false },
      { name: 'Blush Rose', hex: '#BE185D', dark: false },
      { name: 'Sage Olive', hex: '#4D7C0F', dark: false },
      { name: 'Ivory White', hex: '#F8FAFC', dark: false },
      { name: 'Champagne Gold', hex: '#D97706', dark: false },
    ],
    keyMeasurementFields: [
      { label: 'Chest', key: 'bust', defaultVal: 24 },
      { label: 'Waist', key: 'waist', defaultVal: 22 },
      { label: 'Full Length', key: 'fullLength', defaultVal: 22 },
      { label: 'Shoulder', key: 'shoulderWidth', defaultVal: 10 },
    ],
    easeRecommendation: '2.5" - 3.0" generous ease for growth and active playtime.',
    imagePlaceholderAlt: "Kids' Wear Soft Garment SVG Illustration",
  },
};
