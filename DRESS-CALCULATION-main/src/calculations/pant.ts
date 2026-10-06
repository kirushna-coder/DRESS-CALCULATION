// ============================================================
// Fabriplay – Trouser / Formal Pant Pattern Drafting Engine
// ============================================================

import type {
  Measurements,
  PatternData,
  PantOptions,
} from '../types';

const px = (inches: number, scale: number) => inches * scale;

export function calculatePantPattern(
  m: Measurements,
  scale: number,
  options?: PantOptions
): PatternData {
  const ease = m.ease ?? 2;
  const waist = m.waist + ease;
  const hip = m.hip + ease;
  const outseam = m.outseam || m.fullLength || 40;
  const inseam = m.inseam || 30;
  const crotchDepth = outseam - inseam; // Rise
  const hemWidth = m.bottomWidth || 16;
  const halfHem = hemWidth / 2;

  const gap = px(5, scale);
  const originX = 30;
  const originY = 30;

  // ── PIECE 1: FRONT TROUSER LEG ──────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  // Front Hip width = hip/4 - 0.5
  const frontHipW = (hip / 4) - 0.5;
  const frontWaistW = (waist / 4) + 1; // 1 inch for dart

  const fCrotchExt = hip / 16; // Front crotch extension
  
  const fTopY = fY0;
  const fCrotchY = fY0 + px(crotchDepth, scale);
  const fKneeY = fY0 + px(crotchDepth + inseam / 2, scale);
  const fHemY = fY0 + px(outseam, scale);

  const fCF_x = fX0 + px(frontHipW, scale); // Center front vertical line
  const fSide_x = fX0;
  const fCrotchPt_x = fCF_x + px(fCrotchExt, scale);
  
  // Center crease line
  const fCrease_x = fSide_x + px((frontHipW + fCrotchExt) / 2, scale);

  const fWaistSide_x = fCF_x - px(frontWaistW, scale);
  
  const fHemLeft_x = fCrease_x - px(halfHem / 2 - 0.5, scale);
  const fHemRight_x = fCrease_x + px(halfHem / 2 - 0.5, scale);
  
  const fKneeLeft_x = fCrease_x - px((halfHem / 2) + 1, scale);
  const fKneeRight_x = fCrease_x + px((halfHem / 2) + 1, scale);

  const frontPath = [
    `M ${fCF_x} ${fTopY}`, // CF Waist
    `L ${fWaistSide_x} ${fTopY - px(0.25, scale)}`, // Side Waist (dropped slightly)
    // Side seam to hip then down
    `Q ${fWaistSide_x} ${fCrotchY - px(4, scale)} ${fSide_x} ${fCrotchY}`,
    `L ${fKneeLeft_x} ${fKneeY}`,
    `L ${fHemLeft_x} ${fHemY}`,
    `L ${fHemRight_x} ${fHemY}`, // Hem
    `L ${fKneeRight_x} ${fKneeY}`, // Inseam
    `L ${fCrotchPt_x} ${fCrotchY}`,
    // Front crotch curve
    `Q ${fCF_x} ${fCrotchY} ${fCF_x} ${fCrotchY - px(3, scale)}`,
    `L ${fCF_x} ${fTopY}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK TROUSER LEG ───────────────────────────────
  const bX0 = fCrotchPt_x + gap + px(5, scale); // Start after front piece
  const bY0 = originY;

  const backHipW = (hip / 4) + 0.5;
  const backWaistW = (waist / 4) + 1.5; // 1.5 inch for dart
  
  const bCrotchExt = hip / 8; // Back crotch extension is longer
  
  const bTopY = bY0;
  const bCrotchY = bY0 + px(crotchDepth, scale);
  const bKneeY = bY0 + px(crotchDepth + inseam / 2, scale);
  const bHemY = bY0 + px(outseam, scale);

  // Back construction tilts the center back seam
  const bCB_Base_x = bX0 + px(backHipW, scale);
  const bCB_Top_x = bCB_Base_x - px(1.5, scale); // Tilted back in
  const bCB_Top_y = bTopY - px(1.5, scale); // Raised back rise

  const bCrotchPt_x = bCB_Base_x + px(bCrotchExt, scale);
  const bSide_x = bX0;
  
  const bCrease_x = bSide_x + px((backHipW + bCrotchExt) / 2, scale);

  // Back waist points
  const bWaistSide_x = bCB_Top_x - px(backWaistW, scale);
  const bWaistSide_y = bTopY;

  const bHemLeft_x = bCrease_x - px(halfHem / 2 + 0.5, scale);
  const bHemRight_x = bCrease_x + px(halfHem / 2 + 0.5, scale);
  
  const bKneeLeft_x = bCrease_x - px((halfHem / 2) + 1.5, scale);
  const bKneeRight_x = bCrease_x + px((halfHem / 2) + 1.5, scale);

  // Lower the back crotch point slightly for ease
  const bCrotchActual_y = bCrotchY + px(0.5, scale);

  const backPath = [
    `M ${bCB_Top_x} ${bCB_Top_y}`, // CB Waist
    `L ${bWaistSide_x} ${bWaistSide_y}`, // Side Waist
    // Side seam
    `Q ${bWaistSide_x - px(1, scale)} ${bCrotchY - px(4, scale)} ${bSide_x} ${bCrotchY}`,
    `L ${bKneeLeft_x} ${bKneeY}`,
    `L ${bHemLeft_x} ${bHemY}`,
    `L ${bHemRight_x} ${bHemY}`, // Hem
    `L ${bKneeRight_x} ${bKneeY}`, // Inseam
    `L ${bCrotchPt_x} ${bCrotchActual_y}`,
    // Back crotch curve (scooped deeper)
    `C ${bCB_Base_x} ${bCrotchActual_y} ${bCB_Base_x - px(1, scale)} ${bCrotchY - px(4, scale)} ${bCB_Top_x} ${bCB_Top_y}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: WAISTBAND ────────────────────────────────────
  const wbX0 = originX;
  const wbY0 = fHemY + gap;
  const wbLength = px(waist + 2, scale); // Waist + overlap
  const wbWidth = px(options?.waistbandWidth || 1.5, scale);

  const waistbandPath = [
    `M ${wbX0} ${wbY0}`,
    `L ${wbX0 + wbLength} ${wbY0}`,
    `L ${wbX0 + wbLength} ${wbY0 + wbWidth}`,
    `L ${wbX0} ${wbY0 + wbWidth}`,
    'Z',
  ].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'trouser_front',
      label: 'FRONT LEG',
      subLabel: '(Cut 2)',
      path: frontPath,
      fillTint: 'rgba(59, 130, 246, 0.08)',
      strokeColor: '#3B82F6',
      labelCx: fCrease_x,
      labelCy: fY0 + px(crotchDepth * 1.5, scale),
      grainCx: fCrease_x,
      grainCy: fY0 + px(crotchDepth * 2, scale),
      grainLen: px(6, scale),
    },
    {
      id: 'trouser_back',
      label: 'BACK LEG',
      subLabel: '(Cut 2)',
      path: backPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCrease_x,
      labelCy: bY0 + px(crotchDepth * 1.5, scale),
      grainCx: bCrease_x,
      grainCy: bY0 + px(crotchDepth * 2, scale),
      grainLen: px(6, scale),
    },
    {
      id: 'waistband',
      label: 'WAISTBAND',
      subLabel: '(Cut 1)',
      path: waistbandPath,
      fillTint: 'rgba(217, 119, 6, 0.08)',
      strokeColor: '#D97706',
      labelCx: wbX0 + wbLength / 2,
      labelCy: wbY0 + wbWidth / 2,
    },
  ];

  return {
    outlinePath: [frontPath, backPath, waistbandPath].join(' '),
    pieces,
    points: [],
    constructionLines: [],
    annotations: [],
    bounds: { 
      width: bCrotchPt_x + px(10, scale), 
      height: wbY0 + wbWidth + px(10, scale) 
    },
  };
}
