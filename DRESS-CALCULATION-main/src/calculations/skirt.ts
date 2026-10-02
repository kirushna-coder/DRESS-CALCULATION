// ============================================================
// Fabriplay – A-Line / Flared Skirt Pattern Drafting Engine
// Standard Skirt Block Drafting Principles (Armstrong / Aldrich)
//
// All input measurements in INCHES.
// Creates 3 distinct pattern pieces:
//   1. Front Skirt Panel (Cut 1 on fold) - waist darts, hip curve & A-line flare sweep
//   2. Back Skirt Panel (Cut 2 with zip seam) - lumbar waist darts & matching side flare
//   3. Contour Waistband (Cut 1) - waistband width 1.5"
// ============================================================

import type {
  ConstructionLine,
  MeasurementAnnotation,
  Measurements,
  PatternData,
  PatternPoint,
} from '../types';
import {
  createHipSeamPathSegment,
  createCurvedHemPathSegment,
  createCurvedWaistbandPath,
} from '../utils/curveUtils';

const px = (inches: number, scale: number) => inches * scale;

const cBez = (
  cx1: number, cy1: number,
  cx2: number, cy2: number,
  ex: number, ey: number
) => `C ${cx1.toFixed(2)} ${cy1.toFixed(2)} ${cx2.toFixed(2)} ${cy2.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;

export function calculateSkirtPattern(
  m: Measurements,
  scale: number
): PatternData {
  const ease = m.ease ?? 1.0;
  const waist     = m.waist || 28;
  const hip       = m.hip || 38;
  const fullLen   = m.fullLength || 28;
  const flare     = m.flare ?? 8; // flare sweep expansion per quarter

  const hipDepth  = m.hipDepth || 8;
  const dartW     = 0.75; // waist dart width

  const frontWaistW = (waist + ease) / 4 + dartW;
  const backWaistW  = (waist + ease) / 4 + dartW;
  const frontHipW   = (hip + ease) / 4;
  const backHipW    = (hip + ease) / 4;
  const hemWidth    = frontHipW + flare;

  const gap = px(4, scale);
  const originX = 36;
  const originY = 30;

  // ── PIECE 1: FRONT SKIRT PANEL ─────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  const fCF_x     = fX0;
  const fWaist_x  = fCF_x + px(frontWaistW, scale);
  const fHip_x    = fCF_x + px(frontHipW, scale);
  const fHem_x    = fCF_x + px(hemWidth, scale);

  const yWaist    = fY0;
  const yHip      = fY0 + px(hipDepth, scale);
  const yHem      = fY0 + px(fullLen, scale);

  const fWaistDartCenterX = fCF_x + px(frontWaistW * 0.5, scale);

  const frontSkirtPath = [
    `M ${fCF_x} ${yWaist + px(0.3, scale)}`,
    cBez(fCF_x + px(frontWaistW * 0.4, scale), yWaist, fWaist_x - px(frontWaistW * 0.2, scale), yWaist, fWaist_x, yWaist),
    createHipSeamPathSegment(fWaist_x, yWaist, fHip_x + px(0.4, scale), yHip, fHem_x, yHem),
    createCurvedHemPathSegment(fHem_x, yHem, fCF_x + px(hemWidth * 0.5, scale), yHem + px(0.5, scale), fCF_x, yHem),
    `L ${fCF_x} ${yWaist + px(0.3, scale)}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK SKIRT PANEL ──────────────────────────────
  const bX0 = fX0 + px(hemWidth + 2, scale) + gap;

  const bCB_x     = bX0;
  const bWaist_x  = bCB_x + px(backWaistW, scale);
  const bHip_x    = bCB_x + px(backHipW, scale);
  const bHem_x    = bCB_x + px(hemWidth, scale);

  const backSkirtPath = [
    `M ${bCB_x} ${yWaist}`,
    cBez(bCB_x + px(backWaistW * 0.4, scale), yWaist - px(0.2, scale), bWaist_x - px(backWaistW * 0.2, scale), yWaist, bWaist_x, yWaist),
    createHipSeamPathSegment(bWaist_x, yWaist, bHip_x + px(0.4, scale), yHip, bHem_x, yHem),
    createCurvedHemPathSegment(bHem_x, yHem, bCB_x + px(hemWidth * 0.5, scale), yHem + px(0.5, scale), bCB_x, yHem),
    `L ${bCB_x} ${yWaist}`,
    'Z',
  ].join(' ');

  // ── PIECE 3: CONTOUR WAISTBAND ─────────────────────────────
  const wbX0 = originX;
  const wbY0 = fY0 + px(fullLen + 2, scale) + gap;
  const wbLen = px(waist + 2, scale); // includes zipper overlap
  const wbH   = px(1.5, scale);

  const waistbandPath = createCurvedWaistbandPath(wbX0, wbY0, wbLen, wbH, px(0.3, scale));

  const outline = [frontSkirtPath, backSkirtPath, waistbandPath].join(' ');

  const pieces: PatternData['pieces'] = [
    {
      id: 'front_skirt',
      label: 'FRONT A-LINE SKIRT',
      subLabel: '(Cut 1 on fold)',
      path: frontSkirtPath,
      fillTint: 'rgba(79, 70, 229, 0.08)',
      strokeColor: '#4F46E5',
      labelCx: fCF_x + px(frontHipW * 0.5, scale),
      labelCy: yHip + px((fullLen - hipDepth) * 0.3, scale),
      grainCx: fCF_x + px(frontHipW * 0.5, scale),
      grainCy: yHip + px((fullLen - hipDepth) * 0.5, scale),
      grainLen: px(6, scale),
    },
    {
      id: 'back_skirt',
      label: 'BACK A-LINE SKIRT',
      subLabel: '(Cut 2 for zipper seam)',
      path: backSkirtPath,
      fillTint: 'rgba(16, 185, 129, 0.08)',
      strokeColor: '#059669',
      labelCx: bCB_x + px(backHipW * 0.5, scale),
      labelCy: yHip + px((fullLen - hipDepth) * 0.3, scale),
      grainCx: bCB_x + px(backHipW * 0.5, scale),
      grainCy: yHip + px((fullLen - hipDepth) * 0.5, scale),
      grainLen: px(6, scale),
    },
    {
      id: 'skirt_waistband',
      label: 'CONTOUR WAISTBAND',
      subLabel: '(Cut 1 with zip overlap)',
      path: waistbandPath,
      fillTint: 'rgba(139, 92, 246, 0.08)',
      strokeColor: '#7C3AED',
      labelCx: wbX0 + wbLen / 2,
      labelCy: wbY0 + wbH / 2,
    },
  ];

  const points: PatternPoint[] = [
    { label: 'S-W', point: { x: fWaist_x, y: yWaist }, description: 'Front skirt waist corner' },
    { label: 'S-H', point: { x: fHip_x, y: yHip }, description: 'Front skirt hip point' },
    { label: 'S-M', point: { x: fHem_x, y: yHem }, description: 'A-Line hem flare tip' },
  ];

  const constructionLines: ConstructionLine[] = [
    { from: { x: fCF_x, y: yHip }, to: { x: fHip_x, y: yHip }, dashed: true },
    { from: { x: bCB_x, y: yHip }, to: { x: bHip_x, y: yHip }, dashed: true },
    { from: { x: fWaistDartCenterX, y: yWaist }, to: { x: fWaistDartCenterX, y: yWaist + px(4.5, scale) }, dashed: true },
  ];

  const margin = px(1.2, scale);
  const annotations: MeasurementAnnotation[] = [
    { from: { x: fCF_x - margin, y: yWaist }, to: { x: fCF_x - margin, y: yHem }, label: `Skirt Length: ${fullLen}"`, direction: 'vertical' },
    { from: { x: fCF_x, y: yWaist - margin }, to: { x: fWaist_x, y: yWaist - margin }, label: `Waist Arc: ${(frontWaistW * 2).toFixed(1)}"`, direction: 'horizontal' },
    { from: { x: fCF_x, y: yHem + margin }, to: { x: fHem_x, y: yHem + margin }, label: `Hem Sweep: ${(hemWidth * 4).toFixed(1)}"`, direction: 'horizontal' },
  ];

  const boundsWidth = bX0 + px(hemWidth, scale) + px(4, scale);
  const boundsHeight = wbY0 + wbH + px(4, scale);

  return {
    outlinePath: outline,
    pieces,
    points,
    constructionLines,
    annotations,
    bounds: { width: boundsWidth, height: boundsHeight },
  };
}
